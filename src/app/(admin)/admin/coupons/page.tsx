"use client";
import { useEffect, useState } from "react";
import { toast } from "@/store/ui";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState(10);
  const [minCart, setMinCart] = useState(999);
  const [usageLimit, setUsageLimit] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          type,
          value: Number(value),
          minCart: Number(minCart),
          usageLimit: Number(usageLimit)
        })
      });

      if (!res.ok) throw new Error("Failed to create coupon");

      toast(`Coupon ${code.toUpperCase()} created ✓`);
      setCode("");
      await fetchCoupons();
    } catch {
      toast("Could not create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon code?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Coupon deleted ✓");
        await fetchCoupons();
      }
    } catch {
      toast("Failed to delete coupon");
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-1">Discount Coupons</h1>
      <p className="text-navy/50 text-sm mb-6">Manage promotional offers and discounts</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm h-fit">
          <h3 className="font-serif text-lg text-navy mb-4">Create New Coupon</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="text-xs text-navy/60 mb-1 block">Coupon Code</label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FESTIVE20"
                className="input-premium uppercase"
              />
            </div>
            <div>
              <label className="text-xs text-navy/60 mb-1 block">Discount Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="input-premium"
              >
                <option value="percent">Percentage Discount (%)</option>
                <option value="fixed">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-navy/60 mb-1 block">
                Discount Value ({type === "percent" ? "%" : "₹"})
              </label>
              <input
                type="number"
                required
                value={value}
                onChange={(e) => setValue(+e.target.value)}
                className="input-premium"
              />
            </div>
            <div>
              <label className="text-xs text-navy/60 mb-1 block">Minimum Cart Value (₹)</label>
              <input
                type="number"
                required
                value={minCart}
                onChange={(e) => setMinCart(+e.target.value)}
                className="input-premium"
              />
            </div>
            <div>
              <label className="text-xs text-navy/60 mb-1 block">Max Usage Limit</label>
              <input
                type="number"
                required
                value={usageLimit}
                onChange={(e) => setUsageLimit(+e.target.value)}
                className="input-premium"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full mt-4 py-3 rounded-full font-semibold disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Coupon"}
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-navy/5 shadow-sm overflow-x-auto">
          <h3 className="font-serif text-lg text-navy mb-4">Active Store Coupons</h3>
          {loading ? (
            <div className="py-8 text-center text-navy/50 text-sm">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <p className="text-navy/50 text-sm py-8 text-center">No coupons configured.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-navy/50 text-left border-b border-navy/10">
                  <th className="py-2 font-medium">Code</th>
                  <th className="py-2 font-medium">Discount</th>
                  <th className="py-2 font-medium">Min Cart</th>
                  <th className="py-2 font-medium">Used / Limit</th>
                  <th className="py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-navy/5">
                    <td className="py-3 font-bold text-navy">{c.code}</td>
                    <td className="py-3 font-semibold text-emerald">
                      {c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </td>
                    <td className="py-3 text-navy/70">₹{c.minCart}</td>
                    <td className="py-3 text-navy/70">
                      {c.used} / {c.usageLimit}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-500 hover:underline text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
