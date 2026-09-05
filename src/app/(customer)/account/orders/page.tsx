"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { formatINR, dateFmt, SITE } from "@/lib/site";

const orderSteps = ["pending", "confirmed", "packed", "ready_for_pickup", "dispatched", "delivered"];

function OrdersContent() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const orderId = params.get("o");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(orderId);

  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login?next=/account/orders");
      return;
    }

    if (user) {
      fetch("/api/orders/user")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data.orders || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, hydrated, router]);

  if (!hydrated || !user || loading) {
    return (
      <div className="pt-32 bg-ivory min-h-screen text-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-navy/60">Loading your orders...</p>
      </div>
    );
  }

  const targetOrder = (selectedId ? orders.find((x) => x.id === selectedId) : null) || orders[0];

  return (
    <div className="pt-24 md:pt-28 bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-3xl font-bold text-navy">My Orders</h1>
          <Link href="/account" className="text-sm text-navy/60 hover:text-gold-700">
            ← Back to Account
          </Link>
        </div>

        {/* Order Selector */}
        {orders.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border transition ${
                  targetOrder?.id === o.id
                    ? "border-gold bg-navy text-ivory font-medium"
                    : "border-navy/15 text-navy bg-white hover:border-gold"
                }`}
              >
                #{o.orderNumber}
              </button>
            ))}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-navy/5 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-navy/5 flex items-center justify-center text-3xl mb-4">
              📦
            </div>
            <p className="text-navy font-semibold text-lg">No orders placed yet.</p>
            <p className="text-navy/60 text-sm mt-1 max-w-sm mx-auto">
              When you purchase or reserve watches and eyewear, your orders will appear here.
            </p>
            <Link href="/shop" className="btn-gold px-6 py-3 rounded-full inline-block mt-6 font-semibold">
              Browse Collection
            </Link>
          </div>
        ) : targetOrder ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-bold text-navy text-lg">#{targetOrder.orderNumber}</div>
                  <div className="text-xs text-navy/50 mt-0.5">{dateFmt(targetOrder.createdAt)}</div>
                </div>
                <div className="text-right text-sm">
                  <span className="px-3 py-1 rounded-full bg-emerald/10 text-emerald text-xs font-semibold capitalize">
                    {targetOrder.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="mb-8 pt-2">
                <div className="text-xs uppercase tracking-wider text-navy/50 mb-4">Order Progress</div>
                <div className="flex items-center gap-1">
                  {orderSteps.map((step, i) => {
                    const idx = orderSteps.indexOf(targetOrder.status);
                    const done = i <= idx;
                    const current = i === idx;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center relative">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            done ? "bg-gold text-white" : "bg-navy/10"
                          } ${current ? "ring-4 ring-gold/30" : ""}`}
                        >
                          {done && <span className="text-[9px]">✓</span>}
                        </div>
                        <div className="mt-2 text-[9px] sm:text-[10px] text-navy/70 capitalize text-center font-medium">
                          {step.replace(/_/g, " ")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 divide-y divide-navy/5">
                {targetOrder.items.map((it: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 pt-3 first:pt-0">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-navy/5 shrink-0">
                      {it.image ? <img src={it.image} alt="" className="w-full h-full object-cover" /> : null}
                    </div>
                    <div className="flex-1 text-sm text-navy">
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-navy/50">
                        {it.variant ? `Option: ${it.variant} · ` : ""}Quantity: {it.quantity}
                      </div>
                    </div>
                    <div className="font-semibold text-navy">{formatINR(it.total)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-navy/10 mt-6 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy/60">Subtotal</span>
                  <span>{formatINR(targetOrder.subtotal)}</span>
                </div>
                {targetOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald font-medium">
                    <span>Discount</span>
                    <span>−{formatINR(targetOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-navy/60">Fulfillment</span>
                  <span>{targetOrder.shipping === 0 ? "Free" : formatINR(targetOrder.shipping)}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 border-t border-navy/10">
                  <span className="font-serif font-bold text-navy">Total</span>
                  <span className="font-bold text-navy">{formatINR(targetOrder.total)}</span>
                </div>
              </div>

              <div className="text-xs text-navy/60 mt-4 bg-navy/5 p-3 rounded-xl">
                📍 {targetOrder.deliveryMethod === "pickup"
                  ? `In-Store Pickup at: ${SITE.address}`
                  : "Dispatched to your provided delivery address"}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="pt-32 bg-ivory min-h-screen" />}>
      <OrdersContent />
    </Suspense>
  );
}
