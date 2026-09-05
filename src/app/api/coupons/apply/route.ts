import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  subtotal: z.number().min(0)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid coupon request" },
        { status: 400 }
      );
    }

    const { code, subtotal } = parsed.data;
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() }
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 404 });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ error: "This coupon code has expired." }, { status: 400 });
    }

    if (coupon.used >= coupon.usageLimit) {
      return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 400 });
    }

    if (subtotal < coupon.minCart) {
      return NextResponse.json(
        { error: `Minimum cart value of ₹${coupon.minCart} required for this coupon.` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.type === "percent") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minCart: coupon.minCart
      }
    });
  } catch (err: any) {
    console.error("Coupon verification error:", err);
    return NextResponse.json({ error: "Failed to apply coupon." }, { status: 500 });
  }
}
