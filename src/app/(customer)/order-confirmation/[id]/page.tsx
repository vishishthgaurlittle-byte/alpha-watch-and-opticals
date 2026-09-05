"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SITE, formatINR, dateFmt } from "@/lib/site";

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Order not found");
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || "Could not retrieve order details");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 bg-ivory min-h-screen text-center px-4">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-navy/60">Loading your order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="pt-32 pb-20 bg-ivory min-h-screen text-center px-4">
        <h1 className="font-serif text-2xl text-navy mb-2">Order Not Found</h1>
        <p className="text-navy/60 mb-6">{error || "Unable to locate this order."}</p>
        <Link href="/shop" className="btn-gold px-6 py-3 rounded-full inline-block font-semibold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Mohd. Shoeb! I just placed order #${order.orderNumber} for ₹${order.total.toLocaleString(
      "en-IN"
    )} on Alpha Watch & Opticals. Please confirm.`
  );

  return (
    <div className="pt-24 md:pt-28 bg-ivory min-h-screen">
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="w-20 h-20 rounded-full bg-emerald text-white flex items-center justify-center mx-auto mb-5 shadow-lg"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy text-center">Order Confirmed!</h1>
        <p className="text-navy/60 text-center mt-2">
          Thank you, {order.userName}! Your order has been placed with Alpha Watch &amp; Opticals.
        </p>

        <div className="bg-white rounded-2xl p-6 mt-8 border border-navy/5 shadow-sm">
          <div className="flex justify-between py-3 border-b border-navy/10">
            <span className="text-navy/60">Order Number</span>
            <span className="font-semibold text-navy">#{order.orderNumber}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-navy/10">
            <span className="text-navy/60">Date</span>
            <span className="text-navy">{dateFmt(order.createdAt)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-navy/10">
            <span className="text-navy/60">Fulfillment Method</span>
            <span className="font-medium text-navy">
              {order.deliveryMethod === "pickup"
                ? "In-Store Pickup (Chowdhary Complex, Raebareli)"
                : "Home Delivery"}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-navy/10">
            <span className="text-navy/60">Order Status</span>
            <span className="px-2.5 py-0.5 rounded-full bg-navy/5 text-navy text-sm font-medium capitalize">
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex justify-between py-3 border-b border-navy/10">
            <span className="text-navy/60">Payment</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald/10 text-emerald text-sm font-medium capitalize">
              {order.paymentStatus === "paid" ? "Paid Online" : "Pay at Store Counter / On Delivery"}
            </span>
          </div>

          {/* Pickup Instructions */}
          {order.deliveryMethod === "pickup" ? (
            <div className="mt-4 bg-gold/10 rounded-xl p-4 text-sm text-navy/80">
              <div className="font-semibold text-gold-700 mb-1">📍 Store Pickup Location:</div>
              {SITE.address}
              <div className="text-xs text-navy/60 mt-1">
                Timings: {SITE.timings} · Please mention your Order Number <b>#{order.orderNumber}</b> at the counter.
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-navy/5 rounded-xl p-4 text-sm text-navy/80">
              <div className="font-semibold text-navy mb-1">🚚 Delivery Note:</div>
              Our delivery team will contact you at <b>{order.userPhone}</b> prior to dispatch.
            </div>
          )}

          {/* Items */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-navy mb-3">Items Ordered</h4>
            <div className="space-y-3 divide-y divide-navy/5">
              {order.items?.map((it: any, i: number) => (
                <div key={i} className="flex items-center gap-3 pt-2 first:pt-0">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-navy/5 shrink-0">
                    {it.image ? <img src={it.image} alt="" className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 text-sm text-navy">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-navy/50">
                      {it.variant ? `Option: ${it.variant} · ` : ""}Qty: {it.quantity}
                    </div>
                  </div>
                  <div className="font-medium text-navy">{formatINR(it.total)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-navy/10 mt-5 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-navy/60">Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald font-medium">
                <span>Discount</span>
                <span>−{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-navy/60">Delivery</span>
              <span>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-navy/10">
              <span className="font-serif font-bold text-navy">Total</span>
              <span className="font-bold text-navy">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Direct Action */}
        <div className="mt-6 text-center">
          <a
            href={`https://wa.me/919044477735?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-[#20ba5a] transition"
          >
            <span>💬</span> Message Store on WhatsApp
          </a>
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <Link href="/shop" className="btn-gold px-6 py-3 rounded-full font-semibold">
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="px-6 py-3 rounded-full font-semibold border border-navy/15 text-navy hover:border-gold transition"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
