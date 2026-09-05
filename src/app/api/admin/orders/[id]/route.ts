import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { updateFallbackOrder, deleteFallbackOrder, getFallbackOrder } from "@/lib/orderStore";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { status, paymentStatus, notes } = body;
    let updated: any = null;

    try {
      updated = await prisma.order.update({
        where: { id: params.id },
        data: {
          ...(status ? { status } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
          ...(notes !== undefined ? { notes } : {})
        },
        include: {
          items: true
        }
      });
    } catch (dbErr) {
      console.warn("Prisma order update fallback to memory store:", dbErr);
    }

    // Also update in-memory order cache
    const fallbackUpdated = updateFallbackOrder(params.id, {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(notes !== undefined ? { notes } : {})
    });

    return NextResponse.json({
      success: true,
      order: updated || fallbackUpdated || getFallbackOrder(params.id)
    });
  } catch (err: any) {
    console.error("Admin order update error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    try {
      await prisma.order.delete({
        where: { id: params.id }
      });
    } catch (dbErr) {
      console.warn("Prisma order delete warning:", dbErr);
    }

    deleteFallbackOrder(params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
