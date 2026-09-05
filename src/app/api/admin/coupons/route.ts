import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ coupons });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { code, type, value, minCart, maxDiscount, usageLimit } = await req.json();

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        type: type || "percent",
        value: Number(value),
        minCart: Number(minCart || 0),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: Number(usageLimit || 100)
      }
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
