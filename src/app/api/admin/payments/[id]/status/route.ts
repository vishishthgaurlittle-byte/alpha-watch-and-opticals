import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getFallbackOrder, updateFallbackOrder } from "@/lib/orderStore";
import { setProofStatus } from "@/lib/db";
import { sendShopNotification } from "@/lib/mailer";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { paymentStatus, adminNote, orderStatus } = body;

    if (!paymentStatus || !["pending", "proof_submitted", "approved", "rejected", "paid"].includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid paymentStatus. Must be 'approved', 'rejected', 'paid', 'pending', or 'proof_submitted'." },
        { status: 400 }
      );
    }

    let order: any = null;
    try {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ id: params.id }, { orderNumber: params.id }]
        }
      });
    } catch (err) {
      console.warn("Prisma order lookup in payment status PATCH fallback:", err);
    }

    if (!order) {
      order = getFallbackOrder(params.id);
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let existingNotesObj: any = {};
    if (order.notes && typeof order.notes === "string" && order.notes.startsWith("{")) {
      try {
        existingNotesObj = JSON.parse(order.notes);
      } catch {}
    }

    const updatedNotesObj = {
      ...existingNotesObj,
      paymentAdminNote: adminNote !== undefined ? adminNote : existingNotesObj.paymentAdminNote || null
    };

    const notesStr = JSON.stringify(updatedNotesObj);
    const effectiveOrderStatus = orderStatus || (paymentStatus === "approved" || paymentStatus === "paid" ? "confirmed" : order.status);

    // 1. Update in Prisma
    try {
      order = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus,
          status: effectiveOrderStatus,
          notes: notesStr
        },
        include: {
          items: true
        }
      });
    } catch (err) {
      console.warn("Prisma update order payment status fallback:", err);
    }

    // 2. Update in memory order cache
    const updatedFallback = updateFallbackOrder(order.id, {
      paymentStatus,
      status: effectiveOrderStatus,
      paymentAdminNote: adminNote || updatedNotesObj.paymentAdminNote,
      notes: notesStr
    });

    try {
      setProofStatus(order.id, paymentStatus === "paid" ? "approved" : paymentStatus, adminNote);
    } catch {}

    // Send email alert to customer
    if (paymentStatus === "approved" || paymentStatus === "paid") {
      sendShopNotification(
        `Payment Approved for Order #${order.orderNumber}`,
        `<h3>Payment Verified & Approved</h3>
         <p>Dear ${order.userName},</p>
         <p>Your UPI payment of ₹${order.total.toLocaleString("en-IN")} for order #${order.orderNumber} has been successfully verified and approved!</p>
         <p>Your order is now <strong>Confirmed</strong> and being prepared for ${
           order.deliveryMethod === "pickup" ? "pickup at our Chowdhary Complex showroom" : "dispatch"
         }.</p>
         <p>Alpha Watch & Opticals, Degree College Chauraha, Raebareli</p>`
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to "${paymentStatus}"`,
      order: updatedFallback || order
    });
  } catch (err: any) {
    console.error("Payment status update error:", err);
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 });
  }
}
