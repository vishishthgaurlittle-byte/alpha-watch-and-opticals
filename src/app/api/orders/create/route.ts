import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendShopNotification } from "@/lib/mailer";
import { saveFallbackOrder } from "@/lib/orderStore";
import { getAllProducts } from "@/lib/db";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50).default(1),
  variant: z.string().optional().nullable()
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const rawBody = await req.json();

    const customerName = (
      rawBody.name ||
      rawBody.fullName ||
      rawBody.address?.fullName ||
      rawBody.address?.name ||
      user?.name ||
      "Customer"
    ).trim();

    const customerEmail = (
      rawBody.email ||
      user?.email ||
      "shoeb@alphaopticals.com"
    ).toLowerCase().trim();

    const rawPhone = (
      rawBody.phone ||
      rawBody.address?.phone ||
      user?.phone ||
      "9044477735"
    ).toString();
    const sanitizedPhone = rawPhone.replace(/\D/g, "").slice(-10) || "9044477735";

    const deliveryMethod = rawBody.deliveryMethod === "delivery" ? "delivery" : "pickup";
    const address = rawBody.address || null;
    const itemsRaw = Array.isArray(rawBody.items) && rawBody.items.length > 0 ? rawBody.items : [];

    if (itemsRaw.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    const items = itemsRaw.map((it: any) => ({
      productId: String(it.productId || it.product_id || it.id || ""),
      quantity: Number(it.quantity) || 1,
      variant: it.variant || null
    }));

    // 1. Ensure user foreign key is valid in Prisma if available
    let validUserId: string | null = null;
    if (user?.id) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id }
        });

        if (existingUser) {
          validUserId = existingUser.id;
        } else {
          const upserted = await prisma.user.upsert({
            where: { email: customerEmail },
            update: {
              name: customerName,
              phone: sanitizedPhone
            },
            create: {
              id: user.id,
              name: customerName,
              email: customerEmail,
              phone: sanitizedPhone,
              role: user.role || "customer"
            }
          });
          validUserId = upserted.id;
        }
      } catch (userDbErr) {
        console.warn("User lookup for order creation fallback:", userDbErr);
        validUserId = null;
      }
    }

    // 2. Fetch products (Prisma DB first, with fallback to static catalog)
    const productIds = items.map((i: { productId: string }) => i.productId);
    const productMap = new Map<string, { id: string; name: string; price: number; imagesJson?: string; images?: string[] }>();

    try {
      const dbProducts = await prisma.product.findMany({
        where: {
          OR: [{ id: { in: productIds } }, { slug: { in: productIds } }]
        }
      });

      for (const p of dbProducts) {
        productMap.set(p.id, p);
        productMap.set(p.slug, p);
      }
    } catch (dbQueryErr) {
      console.warn("Prisma product lookup failed; switching to catalog fallback:", dbQueryErr);
    }

    // Fallback static catalog
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

    for (const item of items) {
      const prod = productMap.get(item.productId);
      const prodName = prod?.name || "Alpha Exclusive Item";
      const prodPrice = prod?.price || rawBody.price || 1999;
      let parsedImage = "/images/products/mens-chrono-gold.jpg";

      if (prod?.images && prod.images.length > 0) {
        parsedImage = prod.images[0];
      } else if (prod?.imagesJson) {
        try {
          const arr = JSON.parse(prod.imagesJson);
          if (arr[0]) parsedImage = arr[0];
        } catch {}
      }

      const itemTotal = prodPrice * item.quantity;
      subtotal += itemTotal;

      itemsToCreate.push({
        productId: prod?.id || item.productId,
        name: prodName,
        image: parsedImage,
        variant: item.variant || null,
        price: prodPrice,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // 3. Coupon calculation
    let discount = 0;
    let validatedCoupon: any = null;
    const couponCode = (rawBody.couponCode || rawBody.coupon_id || "").toString().toUpperCase().trim();

    if (couponCode) {
      try {
        validatedCoupon = await prisma.coupon.findUnique({
          where: { code: couponCode }
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
        if (couponCode === "WELCOME10" && subtotal >= 999) {
          discount = (subtotal * 10) / 100;
        } else if (couponCode === "ALPHA200" && subtotal >= 1999) {
          discount = 200;
        }
      }
    }

    const shipping = deliveryMethod === "delivery" && subtotal < 2000 ? 100 : 0;
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
            userEmail: customerEmail,
            userName: customerName,
            userPhone: sanitizedPhone,
            status: "pending",
            paymentStatus: "pending",
            deliveryMethod,
            subtotal,
            discount,
            shipping,
            total: finalTotal,
            couponCode: validatedCoupon ? validatedCoupon.code : couponCode || null,
            shippingAddress: address ? JSON.stringify(address) : null,
            notes: rawBody.notes || null,
            items: {
              create: itemsToCreate
            }
          },
          include: {
            items: true
          }
        });

        // Decrement product stock if possible
        for (const item of items) {
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

        return order;
      });
    } catch (dbTxErr) {
      console.warn("Prisma order transaction fallback:", dbTxErr);

      createdOrder = {
        id: orderId,
        orderNumber,
        userId: validUserId || user?.id || null,
        userEmail: customerEmail,
        userName: customerName,
        userPhone: sanitizedPhone,
        status: "pending",
        paymentStatus: "pending",
        deliveryMethod,
        subtotal,
        discount,
        shipping,
        total: finalTotal,
        couponCode: validatedCoupon ? validatedCoupon.code : couponCode || null,
        shippingAddress: address ? JSON.stringify(address) : null,
        razorpayOrderId: null,
        razorpayPaymentId: null,
        notes: rawBody.notes || null,
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
       <p><strong>Customer:</strong> ${customerName} (${sanitizedPhone})</p>
       <p><strong>Email:</strong> ${customerEmail}</p>
       <p><strong>Delivery Method:</strong> ${
         deliveryMethod === "pickup"
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
