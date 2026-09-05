import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFallbackOrder } from "@/lib/orderStore";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    let order: any = null;

    try {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ id: params.id }, { orderNumber: params.id }]
        },
        include: {
          items: true
        }
      });
    } catch (dbErr) {
      console.warn("Prisma order lookup failed, checking fallback cache:", dbErr);
    }

    if (!order) {
      order = getFallbackOrder(params.id);
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Parse notes JSON if present
    if (order.notes && typeof order.notes === "string" && order.notes.startsWith("{")) {
      try {
        const parsedNotes = JSON.parse(order.notes);
        order = {
          ...order,
          paymentProofUrl: order.paymentProofUrl || parsedNotes.paymentProofUrl || null,
          upiTransactionId: order.upiTransactionId || parsedNotes.upiTransactionId || order.razorpayPaymentId || null,
          paymentAdminNote: order.paymentAdminNote || parsedNotes.paymentAdminNote || null,
          customerNote: parsedNotes.customerNote || null
        };
      } catch {}
    }

    // If order belongs to a user and current requester is a different non-admin user
    if (order.userId && user && user.role !== "admin" && order.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error("Order fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
