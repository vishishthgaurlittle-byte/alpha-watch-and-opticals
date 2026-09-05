"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { toast } from "@/store/ui";
import { SITE, formatINR } from "@/lib/site";
import { getProductById } from "@/lib/db";

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const { items, clear } = useCart();
  const uid = user ? user.id : "guest";

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "Raebareli",
    state: "Uttar Pradesh",
    pincode: "229001",
    notes: ""
  });

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || ""
      }));
    }
  }, [user]);

  // compute cart items & base subtotal
  const itemsList = useMemo(
    () =>
      items.map((i) => {
        const p = getProductById(i.product_id);
        return { ...i, p };
      }),
    [items]
  );

  const baseSubtotal = itemsList.reduce((acc, x) => acc + (x.p ? x.p.price : 0) * x.quantity, 0);
  const shipping = deliveryMethod === "delivery" && baseSubtotal < 2000 ? 100 : 0;
  const finalTotal = Math.max(0, baseSubtotal - couponDiscount + shipping);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);

    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: baseSubtotal })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid coupon");
      }

      setCouponDiscount(data.discount);
      setAppliedCoupon(data.coupon.code);
      toast(`Coupon ${data.coupon.code} applied! Saved ₹${data.discount}`);
    } catch (err: any) {
      toast(err.message || "Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast("Your cart is empty");
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast("Please fill in your name, email, and 10-digit mobile number");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      toast("Please enter a valid 10-digit Indian phone number");
      return;
    }

    if (deliveryMethod === "delivery" && (!formData.line1.trim() || formData.pincode.length < 6)) {
      toast("Please enter your complete delivery street address and 6-digit pincode");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        deliveryMethod,
        address:
          deliveryMethod === "delivery"
            ? {
                line1: formData.line1,
                line2: formData.line2,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
              }
            : undefined,
        items: items.map((i) => ({
          productId: i.product_id,
          quantity: i.quantity,
          variant: i.variant?.value
        })),
        couponCode: appliedCoupon || undefined,
        notes: formData.notes
      };

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      clear(uid);
      toast("Order placed successfully! ✓");
      router.push(`/order-confirmation/${data.order.id}`);
    } catch (err: any) {
      toast(err.message || "Could not complete order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 bg-ivory min-h-screen text-center px-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-navy/5 flex items-center justify-center text-3xl mb-4">
          🛍️
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy mb-2">Your Cart is Empty</h1>
        <p className="text-navy/60 mb-6 max-w-md mx-auto">
          Explore our collection of authentic watches and premium eyewear to add items to your cart.
        </p>
        <Link href="/shop" className="btn-gold px-8 py-3 rounded-full font-semibold">
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28 bg-ivory min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-8">Checkout &amp; Order</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
              <h3 className="font-serif text-lg text-navy mb-4">Customer Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-navy/60 mb-1 block">Full Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
                  />
                </div>
                <div>
                  <label className="text-xs text-navy/60 mb-1 block">Mobile Number *</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))
                    }
                    placeholder="10-digit mobile number"
                    className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-navy/60 mb-1 block">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    placeholder="Email address"
                    className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
              <h3 className="font-serif text-lg text-navy mb-4">Fulfillment Option</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("pickup")}
                  className={`rounded-xl p-4 text-left border-2 transition ${
                    deliveryMethod === "pickup" ? "border-gold bg-gold/5" : "border-navy/10"
                  }`}
                >
                  <div className="text-2xl mb-1">🏬</div>
                  <div className="font-semibold text-navy text-sm">Store Pickup &amp; Trial</div>
                  <div className="text-xs text-navy/50 mt-1">Chowdhary Complex, Raebareli · Pay on counter</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`rounded-xl p-4 text-left border-2 transition ${
                    deliveryMethod === "delivery" ? "border-gold bg-gold/5" : "border-navy/10"
                  }`}
                >
                  <div className="text-2xl mb-1">🚚</div>
                  <div className="font-semibold text-navy text-sm">Home Delivery</div>
                  <div className="text-xs text-navy/50 mt-1">Dispatched to your address · Cash/UPI on delivery</div>
                </button>
              </div>
            </div>

            {/* Shipping Address */}
            {deliveryMethod === "delivery" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <h3 className="font-serif text-lg text-navy mb-4">Delivery Address</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-navy/60 mb-1 block">House / Flat / Street Address *</label>
                    <input
                      required
                      value={formData.line1}
                      onChange={(e) => setFormData((f) => ({ ...f, line1: e.target.value }))}
                      placeholder="e.g. House No. 42, Civil Lines"
                      className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-navy/60 mb-1 block">Landmark (Optional)</label>
                    <input
                      value={formData.line2}
                      onChange={(e) => setFormData((f) => ({ ...f, line2: e.target.value }))}
                      placeholder="Near degree college"
                      className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-navy/60 mb-1 block">Pincode *</label>
                    <input
                      required
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))
                      }
                      placeholder="229001"
                      className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-navy/60 mb-1 block">City</label>
                    <input
                      value={formData.city}
                      onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                      className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-navy/60 mb-1 block">State</label>
                    <input
                      value={formData.state}
                      onChange={(e) => setFormData((f) => ({ ...f, state: e.target.value }))}
                      className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order Note */}
            <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
              <h3 className="font-serif text-lg text-navy mb-2">Special Instructions</h3>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Prescription power notes, preferred pickup timing, or watch strap sizing requests..."
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 min-h-[80px]"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border border-navy/5 sticky top-24 shadow-sm">
              <h3 className="font-serif text-lg text-navy mb-4">Order Summary</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-navy/5">
                {itemsList.map((x, idx) => (
                  <div key={idx} className="flex items-center gap-3 pt-2 first:pt-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-navy/5 shrink-0">
                      {x.p?.images[0] ? (
                        <img src={x.p.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 text-sm text-navy truncate">
                      <div className="font-medium truncate">{x.p?.name}</div>
                      <div className="text-xs text-navy/50">
                        {x.variant?.value ? `Option: ${x.variant.value} · ` : ""}Qty: {x.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-navy">
                      {x.p ? formatINR(x.p.price * x.quantity) : ""}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="mt-5 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon (e.g. WELCOME10)"
                  className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 flex-1 text-sm uppercase"
                />
                <button
                  type="submit"
                  disabled={isApplyingCoupon}
                  className="btn-gold px-4 rounded-full text-sm font-medium disabled:opacity-50"
                >
                  {isApplyingCoupon ? "..." : "Apply"}
                </button>
              </form>

              <div className="border-t border-navy/10 my-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy/60">Subtotal</span>
                  <span>{formatINR(baseSubtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald font-medium">
                    <span>Discount ({appliedCoupon})</span>
                    <span>−{formatINR(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-navy/60">Fulfillment</span>
                  <span>
                    {deliveryMethod === "pickup"
                      ? "Free Store Pickup"
                      : shipping === 0
                      ? "Free Delivery"
                      : formatINR(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xl mb-5 pt-2 border-t border-navy/10">
                <span className="text-navy font-serif">Grand Total</span>
                <span className="text-navy font-bold">{formatINR(finalTotal)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="btn-gold w-full py-4 rounded-full font-bold text-base disabled:opacity-60 shadow-md"
              >
                {isPlacingOrder
                  ? "Confirming Order..."
                  : deliveryMethod === "pickup"
                  ? "Reserve & Pay at Store Counter"
                  : "Confirm Order for Delivery"}
              </button>

              <div className="mt-4 p-3 bg-navy/5 rounded-xl text-center text-xs text-navy/60">
                🔒 Official order guarantee by Alpha Watch &amp; Opticals, Chowdhary Complex, Raebareli.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
