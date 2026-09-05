import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFallbackOrder, updateFallbackOrder } from "@/lib/orderStore";
import { addPaymentProof } from "@/lib/db";
import { sendShopNotification } from "@/lib/mailer";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { proofImage, utr, notes } = body;

    if (!proofImage && !utr) {
      return NextResponse.json(
        { error: "Please provide a payment screenshot or UPI Reference / UTR number." },
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
      console.warn("Prisma order lookup for payment proof fallback:", err);
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
      paymentMethod: "upi",
      upiTransactionId: utr || existingNotesObj.upiTransactionId || null,
      paymentProofUrl: proofImage || existingNotesObj.paymentProofUrl || null,
      customerNote: notes || existingNotesObj.customerNote || null
    };

    const notesStr = JSON.stringify(updatedNotesObj);

    // Update in Prisma
    try {
      order = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "proof_submitted",
          razorpayPaymentId: utr || order.razorpayPaymentId || null,
          notes: notesStr
        },
        include: {
          items: true
        }
      });
    } catch (err) {
      console.warn("Prisma update order payment proof fallback:", err);
    }

    // Update in memory cache
    const updated = updateFallbackOrder(order.id, {
      paymentStatus: "proof_submitted",
      paymentProofUrl: proofImage || updatedNotesObj.paymentProofUrl,
      upiTransactionId: utr || updatedNotesObj.upiTransactionId,
      notes: notesStr
    });

    if (proofImage) {
      try {
        addPaymentProof(order.id, user?.id || order.userId || "guest", proofImage);
      } catch {}
    }

    // Send email alert to shop owner
    sendShopNotification(
      `Payment Proof Submitted for Order #${order.orderNumber}`,
      `<h3>UPI Payment Proof Submitted</h3>
       <p><strong>Order Number:</strong> ${order.orderNumber}</p>
       <p><strong>Customer:</strong> ${order.userName} (${order.userPhone})</p>
       <p><strong>Amount:</strong> ₹${order.total.toLocaleString("en-IN")}</p>
       ${utr ? `<p><strong>UTR / Ref Number:</strong> ${utr}</p>` : ""}
       <p>Please review and approve this payment in the Admin Payments dashboard.</p>`
    ).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Payment proof submitted successfully! Awaiting admin verification.",
      order: updated || order
    });
  } catch (err: any) {
    console.error("Payment proof submission error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit payment proof" }, { status: 500 });
  }
}
