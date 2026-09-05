"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SITE, formatINR, dateFmt } from "@/lib/site";
import { toast } from "@/store/ui";

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);

  const [utrInput, setUtrInput] = useState("");
  const [proofDataUrl, setProofDataUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchOrder = async () => {
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
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast("Image size too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setProofDataUrl(uploadEvent.target?.result as string);
      setSelectedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofDataUrl && !utrInput.trim()) {
      toast("Please attach a screenshot or enter your UPI UTR reference number");
      return;
    }

    setSubmittingProof(true);
    try {
      const res = await fetch(`/api/orders/${params.id}/payment-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofImage: proofDataUrl || undefined,
          utr: utrInput.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit payment proof");

      toast("Payment proof submitted for admin verification! ✓");
      await fetchOrder();
    } catch (err: any) {
      toast(err.message || "Could not submit proof");
    } finally {
      setSubmittingProof(false);
    }
  };

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

  const isApproved = order.paymentStatus === "approved" || order.paymentStatus === "paid";
  const isProofSubmitted = order.paymentStatus === "proof_submitted";
  const isRejected = order.paymentStatus === "rejected";

  const whatsappMessage = encodeURIComponent(
    `Hello Mohd. Shoeb! I just placed order #${order.orderNumber} for ₹${order.total.toLocaleString(
      "en-IN"
    )} on Alpha Watch & Opticals.${
      order.upiTransactionId ? ` My UPI UTR is ${order.upiTransactionId}.` : ""
    } Please verify and confirm.`
  );

  return (
    <div className="pt-24 md:pt-28 bg-ivory min-h-screen">
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg text-white ${
            isApproved ? "bg-emerald" : isProofSubmitted ? "bg-amber-500" : "bg-navy"
          }`}
        >
          {isApproved ? (
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : isProofSubmitted ? (
            <span className="text-3xl">⏳</span>
          ) : (
            <span className="text-3xl">🧾</span>
          )}
        </motion.div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy text-center">
          {isApproved ? "Order & Payment Approved!" : "Order Placed Successfully!"}
        </h1>

        <p className="text-navy/60 text-center mt-2">
          Thank you, <strong>{order.userName}</strong>! Your order <strong>#{order.orderNumber}</strong> has been received by Alpha Watch &amp; Opticals.
        </p>

        {/* PAYMENT STATUS BANNER */}
        <div className="mt-6">
          {isApproved ? (
            <div className="bg-emerald/10 border-2 border-emerald/30 rounded-2xl p-4 text-center">
              <div className="font-bold text-emerald text-sm">✅ Payment Verified &amp; Confirmed</div>
              <div className="text-xs text-navy/70 mt-1">
                Your UPI transaction is approved. We are packing your order for fulfillment!
              </div>
            </div>
          ) : isProofSubmitted ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center">
              <div className="font-bold text-amber-800 text-sm">⏳ Payment Proof Submitted — Awaiting Admin Approval</div>
              <div className="text-xs text-amber-700 mt-1">
                Our team at Chowdhary Complex is verifying your UPI payment screenshot. You will be updated shortly!
              </div>
              {order.upiTransactionId && (
                <div className="mt-2 text-xs font-mono bg-white/80 inline-block px-3 py-1 rounded-full text-navy border border-amber-200">
                  UTR: {order.upiTransactionId}
                </div>
              )}
            </div>
          ) : isRejected ? (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-center">
              <div className="font-bold text-red-600 text-sm">✕ Payment Proof Rejected</div>
              <div className="text-xs text-red-700 mt-1">
                {order.paymentAdminNote || "Payment could not be verified. Please re-upload a clear screenshot or contact us."}
              </div>
            </div>
          ) : (
            <div className="bg-navy/5 border border-navy/10 rounded-2xl p-4 text-center">
              <div className="font-semibold text-navy text-sm">Payment Status: Pending</div>
              <div className="text-xs text-navy/60 mt-0.5">Pay via UPI and upload your receipt below or pay at store counter.</div>
            </div>
          )}
        </div>

        {/* Proof Upload Box if missing or rejected */}
        {(!order.paymentProofUrl || isRejected) && (
          <form
            onSubmit={handleUploadProofSubmit}
            className="mt-6 bg-white rounded-2xl p-6 border-2 border-dashed border-gold/40 shadow-sm space-y-4"
          >
            <h3 className="font-serif text-lg font-bold text-navy flex items-center gap-2">
              <span>📸 Submit UPI Payment Proof</span>
            </h3>
            <p className="text-xs text-navy/60">
              Paid via UPI? Upload your payment screenshot and 12-digit UTR reference number for instant verification:
            </p>

            <div>
              <label className="text-xs font-semibold text-navy/70 block mb-1">UPI UTR / Reference ID</label>
              <input
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value.trim())}
                placeholder="e.g. 423589123456"
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 font-mono text-sm"
              />
            </div>

            <div>
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              {proofDataUrl ? (
                <div className="p-3 bg-navy/5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={proofDataUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />
                    <span className="text-xs font-medium text-navy truncate max-w-[180px]">{selectedFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProofDataUrl("");
                      setSelectedFileName("");
                    }}
                    className="text-xs text-red-500 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full py-3 rounded-xl border border-navy/15 bg-navy/5 text-navy hover:bg-gold hover:text-white transition text-xs font-semibold"
                >
                  Choose Payment Screenshot File
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={submittingProof}
              className="btn-gold w-full py-3 rounded-full font-bold text-sm shadow-sm disabled:opacity-50"
            >
              {submittingProof ? "Submitting Proof..." : "Submit Payment Proof for Approval ✓"}
            </button>
          </form>
        )}

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl p-6 mt-6 border border-navy/5 shadow-sm">
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

          {/* Proof thumbnail preview if submitted */}
          {order.paymentProofUrl && (
            <div className="py-3 border-b border-navy/10 flex items-center justify-between">
              <span className="text-navy/60">Uploaded Proof</span>
              <a
                href={order.paymentProofUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 group"
              >
                <img
                  src={order.paymentProofUrl}
                  alt="Proof"
                  className="w-10 h-10 object-cover rounded-lg border border-gold/40 group-hover:scale-105 transition-transform"
                />
                <span className="text-xs text-gold-700 font-semibold underline">View Receipt</span>
              </a>
            </div>
          )}

          {/* Pickup Instructions */}
          {order.deliveryMethod === "pickup" ? (
            <div className="mt-4 bg-gold/10 rounded-xl p-4 text-sm text-navy/80">
              <div className="font-semibold text-gold-700 mb-1">📍 Store Pickup Location:</div>
              {SITE.address}
              <div className="text-xs text-navy/60 mt-1">
                Timings: {SITE.timings} · Please mention Order Number <b>#{order.orderNumber}</b> at the counter.
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
