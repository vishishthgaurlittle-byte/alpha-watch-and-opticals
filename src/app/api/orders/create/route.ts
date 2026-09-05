import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendShopNotification } from "@/lib/mailer";
import { saveFallbackOrder, StoredOrder } from "@/lib/orderStore";
import { getAllProducts } from "@/lib/db";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
  variant: z.string().optional()
});

const createOrderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, "").slice(-10))
    .refine((v) => /^[6-9]\d{9}$/.test(v), {
      message: "Please enter a valid 10-digit Indian phone number (e.g. 9876543210)"
    }),
  deliveryMethod: z.enum(["pickup", "delivery"]).default("pickup"),
  address: z
    .object({
      line1: z.string().optional().or(z.literal("")),
      line2: z.string().optional().or(z.literal("")),
      city: z.string().optional().default("Raebareli"),
      state: z.string().optional().default("Uttar Pradesh"),
      pincode: z.string().optional().default("229001")
    })
    .optional(),
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  couponCode: z.string().optional(),
  notes: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid order details" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedEmail = data.email.toLowerCase().trim();

    // 1. Ensure user foreign key is valid in Prisma
    let validUserId: string | null = null;
    if (user?.id) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id }
        });

        if (existingUser) {
          validUserId = existingUser.id;
        } else {
          // Best-effort user upsert so foreign key constraint is satisfied
          const upserted = await prisma.user.upsert({
            where: { email: normalizedEmail },
            update: {
              name: (user.name || data.name).trim(),
              phone: data.phone
            },
            create: {
              id: user.id,
              name: (user.name || data.name).trim(),
              email: normalizedEmail,
              phone: data.phone,
              role: user.role || "customer"
            }
          });
          validUserId = upserted.id;
        }
      } catch (userDbErr) {
        console.warn("User lookup for order creation fallback:", userDbErr);
        validUserId = null; // Setting to null guarantees no foreign key crash
      }
    }

    // 2. Fetch products (Prisma DB first, with fallback to static catalog)
    const productIds = data.items.map((i) => i.productId);
    const productMap = new Map<string, { id: string; name: string; price: number; imagesJson?: string; images?: string[] }>();

    try {
      const dbProducts = await prisma.product.findMany({
        where: {
          OR: [{ id: { in: productIds } }, { slug: { in: productIds } }],
          status: "published"
        }
      });

      for (const p of dbProducts) {
        productMap.set(p.id, p);
        productMap.set(p.slug, p);
      }
    } catch (dbQueryErr) {
      console.warn("Prisma product lookup failed; switching to catalog fallback:", dbQueryErr);
    }

    // If any product was not found in DB (e.g. database file unavailable on serverless), check static catalog
    const staticProducts = getAllProducts();
    for (const sp of staticProducts) {
      if (!productMap.has(sp.id)) {
        productMap.set(sp.id, {
          id: sp.id,
          name: sp.name,
          price: sp.price,
          images: sp.images
        });
      }
      if (!productMap.has(sp.slug)) {
        productMap.set(sp.slug, {
          id: sp.id,
          name: sp.name,
          price: sp.price,
          images: sp.images
        });
      }
    }

    let subtotal = 0;
    const itemsToCreate: Array<{
      productId: string;
      name: string;
      image: string;
      variant: string | null;
      price: number;
      quantity: number;
      total: number;
    }> = [];

    for (const item of data.items) {
      const prod = productMap.get(item.productId);
      if (!prod) {
        return NextResponse.json(
          { error: `One or more products in your cart are currently unavailable.` },
          { status: 400 }
        );
      }

      let parsedImage = "/images/products/mens-chrono-gold.jpg";
      if (prod.images && prod.images.length > 0) {
        parsedImage = prod.images[0];
      } else if (prod.imagesJson) {
        try {
          const arr = JSON.parse(prod.imagesJson);
          if (arr[0]) parsedImage = arr[0];
        } catch {}
      }

      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;

      itemsToCreate.push({
        productId: prod.id,
        name: prod.name,
        image: parsedImage,
        variant: item.variant || null,
        price: prod.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // 3. Coupon calculation
    let discount = 0;
    let validatedCoupon: any = null;

    if (data.couponCode) {
      try {
        validatedCoupon = await prisma.coupon.findUnique({
          where: { code: data.couponCode.toUpperCase().trim() }
        });

        if (
          validatedCoupon &&
          (!validatedCoupon.expiresAt || new Date() <= validatedCoupon.expiresAt) &&
          validatedCoupon.used < validatedCoupon.usageLimit &&
          subtotal >= validatedCoupon.minCart
        ) {
          if (validatedCoupon.type === "percent") {
            discount = (subtotal * validatedCoupon.value) / 100;
            if (validatedCoupon.maxDiscount && discount > validatedCoupon.maxDiscount) {
              discount = validatedCoupon.maxDiscount;
            }
          } else {
            discount = validatedCoupon.value;
          }
          discount = Math.min(discount, subtotal);
        }
      } catch (couponErr) {
        console.warn("Coupon lookup fallback:", couponErr);
        // Fallback static coupon calculation
        const code = data.couponCode.toUpperCase().trim();
        if (code === "WELCOME10" && subtotal >= 999) {
          discount = (subtotal * 10) / 100;
        } else if (code === "ALPHA200" && subtotal >= 1999) {
          discount = 200;
        }
      }
    }

    const shipping = data.deliveryMethod === "delivery" && subtotal < 2000 ? 100 : 0;
    const finalTotal = Math.max(0, subtotal - discount + shipping);

    // 4. Generate unique Order Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AW-${new Date().getFullYear()}-${randomSuffix}`;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    let createdOrder: any = null;

    // 5. Attempt database write in Prisma
    try {
      createdOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: validUserId,
            userEmail: normalizedEmail,
            userName: data.name.trim(),
            userPhone: data.phone.trim(),
            status: "pending",
            paymentStatus: "pending",
            deliveryMethod: data.deliveryMethod,
            subtotal,
            discount,
            shipping,
            total: finalTotal,
            couponCode: validatedCoupon ? validatedCoupon.code : data.couponCode || null,
            shippingAddress: data.address ? JSON.stringify(data.address) : null,
            notes: data.notes || null,
            items: {
              create: itemsToCreate
            }
          },
          include: {
            items: true
          }
        });

        // Decrement product stock if possible
        for (const item of data.items) {
          const prod = productMap.get(item.productId);
          if (prod) {
            try {
              await tx.product.update({
                where: { id: prod.id },
                data: {
                  stock: {
                    decrement: item.quantity
                  }
                }
              });
            } catch {}
          }
        }

        // Increment coupon count if possible
        if (validatedCoupon) {
          try {
            await tx.coupon.update({
              where: { id: validatedCoupon.id },
              data: {
                used: {
                  increment: 1
                }
              }
            });
          } catch {}
        }

        return order;
      });
    } catch (dbTxErr) {
      console.warn("Prisma order transaction failed; utilizing resilient fallback order creation:", dbTxErr);

      // Create guaranteed valid fallback order object
      createdOrder = {
        id: orderId,
        orderNumber,
        userId: validUserId || user?.id || null,
        userEmail: normalizedEmail,
        userName: data.name.trim(),
        userPhone: data.phone.trim(),
        status: "pending",
        paymentStatus: "pending",
        deliveryMethod: data.deliveryMethod,
        subtotal,
        discount,
        shipping,
        total: finalTotal,
        couponCode: validatedCoupon ? validatedCoupon.code : data.couponCode || null,
        shippingAddress: data.address ? JSON.stringify(data.address) : null,
        razorpayOrderId: null,
        razorpayPaymentId: null,
        notes: data.notes || null,
        createdAt: nowIso,
        updatedAt: nowIso,
        items: itemsToCreate.map((it, idx) => ({
          id: `item_${idx}_${Date.now()}`,
          ...it
        }))
      };
    }

    // Save to memory cache for zero-downtime access
    saveFallbackOrder(createdOrder);

    // 6. Send asynchronous shop notification
    sendShopNotification(
      `New Order Placed: ${orderNumber} - ₹${finalTotal.toLocaleString("en-IN")}`,
      `<h3>New Order Received</h3>
       <p><strong>Order Number:</strong> ${orderNumber}</p>
       <p><strong>Customer:</strong> ${data.name} (${data.phone})</p>
       <p><strong>Email:</strong> ${data.email}</p>
       <p><strong>Delivery Method:</strong> ${
         data.deliveryMethod === "pickup"
           ? "In-Store Pickup (Degree College Chauraha)"
           : "Home Delivery"
       }</p>
       <p><strong>Total Amount:</strong> ₹${finalTotal.toLocaleString("en-IN")}</p>
       <p><strong>Items:</strong></p>
       <ul>
         ${itemsToCreate.map((i) => `<li>${i.name} (x${i.quantity}) - ₹${i.total}</li>`).join("")}
       </ul>`
    ).catch((mailErr) => console.warn("Email alert non-fatal warning:", mailErr));

    return NextResponse.json({
      success: true,
      ok: true,
      order: createdOrder
    });
  } catch (err: any) {
    console.error("Order creation fatal error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create order. Please try again or call our store." },
      { status: 500 }
    );
  }
}
