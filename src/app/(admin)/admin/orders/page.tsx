"use client";
import { useEffect, useState } from "react";
import { formatINR, dateFmt, timeFmt } from "@/lib/site";
import { toast } from "@/store/ui";

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const sel = orders.find((o) => o.id === selectedId) || (orders.length > 0 ? orders[0] : null);

  const updateOrderStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast(`Order status updated to ${status} ✓`);
        await fetchOrders();
      }
    } catch {
      toast("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus })
      });
      if (res.ok) {
        toast(`Payment status marked as ${paymentStatus} ✓`);
        await fetchOrders();
      }
    } catch {
      toast("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-1">Store Orders</h1>
      <p className="text-navy/50 text-sm mb-6">{orders.length} total orders recorded</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders list */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-navy/5 shadow-sm h-fit">
          <div className="flex gap-2 flex-wrap mb-4">
            <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} label="All" />
            {statuses.map((s) => (
              <FilterBtn
                key={s.value}
                active={filter === s.value}
                onClick={() => setFilter(s.value)}
                label={s.label}
              />
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center text-navy/50 text-sm">Loading orders from database...</div>
          ) : filtered.length === 0 ? (
            <p className="text-navy/50 text-sm py-12 text-center">No orders in this filter.</p>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {filtered.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedId(o.id)}
                  className={`w-full text-left border rounded-xl p-3 transition ${
                    sel?.id === o.id ? "border-gold bg-gold/5" : "border-navy/10 hover:border-gold/50"
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-semibold text-navy text-sm">#{o.orderNumber}</span>
                    <span className="text-xs text-navy/50">
                      {o.deliveryMethod === "pickup" ? "🏬 Pickup" : "🚚 Delivery"}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-navy/60">
                    <span>
                      {o.userName} ({o.userPhone}) · {dateFmt(o.createdAt)}
                    </span>
                    <span className="font-bold text-navy">{formatINR(o.total)}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                        o.paymentStatus === "paid"
                          ? "bg-emerald/10 text-emerald"
                          : "bg-navy/5 text-navy"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy/5 text-navy capitalize">
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Order Detail */}
        <div className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm h-fit">
          {!sel ? (
            <p className="text-navy/50 text-sm text-center py-16">No order selected.</p>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-serif text-lg text-navy">#{sel.orderNumber}</h3>
                  <div className="text-xs text-navy/50">
                    {timeFmt(sel.createdAt)} · {sel.deliveryMethod === "pickup" ? "Pickup" : "Delivery"}
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                    sel.paymentStatus === "paid" ? "bg-emerald/10 text-emerald" : "bg-navy/5 text-navy"
                  }`}
                >
                  {sel.paymentStatus}
                </span>
              </div>

              <div className="text-xs text-navy/70 mb-3 space-y-1 bg-navy/5 p-3 rounded-xl">
                <div>
                  <b>Customer:</b> {sel.userName}
                </div>
                <div>
                  <b>Phone:</b> {sel.userPhone}
                </div>
                <div>
                  <b>Email:</b> {sel.userEmail}
                </div>
                {sel.shippingAddress && (
                  <div>
                    <b>Address:</b> {sel.shippingAddress}
                  </div>
                )}
                {sel.notes && (
                  <div>
                    <b>Special Notes:</b> {sel.notes}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm mb-4 divide-y divide-navy/5">
                {sel.items?.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between pt-2 first:pt-0">
                    <span className="text-navy/70">
                      {it.name} {it.variant ? `(${it.variant})` : ""} ×{it.quantity}
                    </span>
                    <span className="font-semibold text-navy">{formatINR(it.total)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-navy/10 pt-2 text-navy">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">{formatINR(sel.total)}</span>
                </div>
              </div>

              {/* Payment Action */}
              <div className="mb-4 pt-2 border-t border-navy/10">
                <div className="text-xs font-semibold text-navy mb-2">Payment Status</div>
                <div className="flex gap-2">
                  <button
                    disabled={updating}
                    onClick={() => updatePaymentStatus(sel.id, "paid")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                      sel.paymentStatus === "paid"
                        ? "bg-emerald text-white border-emerald"
                        : "border-navy/20 text-navy hover:bg-navy/5"
                    }`}
                  >
                    Mark as Paid
                  </button>
                  <button
                    disabled={updating}
                    onClick={() => updatePaymentStatus(sel.id, "pending")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                      sel.paymentStatus === "pending"
                        ? "bg-navy text-white border-navy"
                        : "border-navy/20 text-navy hover:bg-navy/5"
                    }`}
                  >
                    Mark as Pending
                  </button>
                </div>
              </div>

              {/* Status Action */}
              <div>
                <div className="text-xs font-semibold text-navy mb-2">Update Order Status</div>
                <div className="flex flex-wrap gap-1.5">
                  {statuses.map((s) => (
                    <button
                      key={s.value}
                      disabled={updating}
                      onClick={() => updateOrderStatus(sel.id, s.value)}
                      className={`px-2.5 py-1.5 rounded-full text-xs border transition ${
                        sel.status === s.value
                          ? "border-gold bg-gold text-white font-medium"
                          : "border-navy/15 text-navy hover:border-gold"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  label
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition ${
        active ? "border-gold bg-gold text-white font-medium" : "border-navy/15 text-navy hover:border-gold"
      }`}
    >
      {label}
    </button>
  );
}
