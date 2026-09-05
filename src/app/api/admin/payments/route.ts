import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllFallbackOrders } from "@/lib/orderStore";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    let orders: any[] = [];
    try {
      orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          items: true
        }
      });
    } catch (dbErr) {
      console.warn("Prisma orders query failed, using fallback order store:", dbErr);
    }

    const fallbackOrders = getAllFallbackOrders();
    const map = new Map<string, any>();

    fallbackOrders.forEach((o) => {
      map.set(o.id, o);
      map.set(o.orderNumber, o);
    });

    orders.forEach((o) => {
      if (!map.has(o.id) && !map.has(o.orderNumber)) {
        map.set(o.id, o);
      }
    });

    const all = Array.from(new Set(Array.from(map.values()))).map((o) => {
      let notesObj: any = {};
      if (o.notes && typeof o.notes === "string" && o.notes.startsWith("{")) {
        try {
          notesObj = JSON.parse(o.notes);
        } catch {}
      }

      const paymentProofUrl = o.paymentProofUrl || notesObj.paymentProofUrl || null;
      const upiTransactionId = o.upiTransactionId || notesObj.upiTransactionId || o.razorpayPaymentId || null;
      const paymentAdminNote = o.paymentAdminNote || notesObj.paymentAdminNote || null;

      return {
        ...o,
        paymentProofUrl,
        upiTransactionId,
        paymentAdminNote,
        paymentMethod: notesObj.paymentMethod || "upi"
      };
    });

    // Sort newest first
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Stats
    const totalPayments = all.length;
    const pendingProofs = all.filter((o) => o.paymentStatus === "proof_submitted").length;
    const approvedPayments = all.filter((o) => o.paymentStatus === "approved" || o.paymentStatus === "paid").length;
    const rejectedPayments = all.filter((o) => o.paymentStatus === "rejected").length;
    const pendingPayments = all.filter((o) => o.paymentStatus === "pending").length;

    return NextResponse.json({
      payments: all,
      stats: {
        totalPayments,
        pendingProofs,
        approvedPayments,
        rejectedPayments,
        pendingPayments
      }
    });
  } catch (err: any) {
    console.error("Payments API error:", err);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
