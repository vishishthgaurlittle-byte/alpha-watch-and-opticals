"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { toast } from "@/store/ui";
import { SITE, formatINR } from "@/lib/site";
import { getProductById } from "@/lib/db";

interface PaymentSettings {
  upiId: string;
  upiPayeeName: string;
  upiQrImage: string;
  upiEnabled: boolean;
  upiInstructions: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const { items, clear } = useCart();
  const uid = user ? user.id : "guest";

  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
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

  // UPI payment fields
  const [upiSettings, setUpiSettings] = useState<PaymentSettings>({
    upiId: "9044477735@upi",
    upiPayeeName: "Mohd. Shoeb - Alpha Watch & Opticals",
    upiQrImage: "",
    upiEnabled: true,
    upiInstructions:
      "1. Scan the QR code using Google Pay, PhonePe, Paytm, or BHIM.\n2. Pay the exact order amount.\n3. Enter the 12-digit UTR/Reference number and upload your transaction screenshot.\n4. Our team will verify and dispatch your order promptly."
  });
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>("");
  const [screenshotFileName, setScreenshotFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Fetch shop payment settings
  useEffect(() => {
    async function fetchPaySettings() {
      try {
        const res = await fetch("/api/payment-settings");
        const data = await res.json();
        if (res.ok && data) {
          setUpiSettings(data);
        }
      } catch {
        // fallback to default
      }
    }
    fetchPaySettings();
  }, []);

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

  // Dynamic QR code for exact total
  const dynamicQrCode = upiSettings.upiQrImage
    ? upiSettings.upiQrImage
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(
          upiSettings.upiPayeeName
        )}&am=${finalTotal}&cu=INR&tn=Order%20Alpha%20Watch`
      )}`;

  const upiIntentUri = `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(
    upiSettings.upiPayeeName
  )}&am=${finalTotal}&cu=INR&tn=Order%20Alpha%20Watch`;

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("Image file is too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setScreenshotDataUrl(result);
      setScreenshotFileName(file.name);
      toast("Payment screenshot attached! ✓");
    };
    reader.readAsDataURL(file);
  };

  const copyUpiId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiSettings.upiId);
      toast(`Copied UPI ID "${upiSettings.upiId}" to clipboard ✓`);
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

    if (paymentMethod === "upi" && !screenshotDataUrl && !utrNumber.trim()) {
      toast("Please upload your UPI payment screenshot or enter the 12-digit UTR / Reference number");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        deliveryMethod,
        paymentMethod,
        upiTransactionId: utrNumber.trim() || undefined,
        paymentProofUrl: screenshotDataUrl || undefined,
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
      toast("Order submitted for admin approval! ✓");
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
              <h3 className="font-serif text-lg text-navy mb-4">1. Customer Details</h3>
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
              <h3 className="font-serif text-lg text-navy mb-4">2. Fulfillment Option</h3>
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
                  <div className="text-xs text-navy/50 mt-1">Chowdhary Complex, Raebareli · Free fitting</div>
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
                  <div className="text-xs text-navy/50 mt-1">Directly dispatched to your doorstep</div>
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

            {/* 3. Primary Payment Section - UPI First with Screenshot Upload */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gold/40 shadow-md">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="font-serif text-lg text-navy font-bold flex items-center gap-2">
                    <span>3. Payment Method</span>
                    <span className="bg-gold text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-xs">
                      UPI First
                    </span>
                  </h3>
                  <p className="text-xs text-navy/60 mt-0.5">
                    Pay securely via UPI (Google Pay, PhonePe, Paytm, BHIM) and upload screenshot proof for fast approval.
                  </p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`rounded-xl p-4 text-left border-2 transition ${
                    paymentMethod === "upi" ? "border-gold bg-gold/10 ring-2 ring-gold/30" : "border-navy/10 hover:border-gold/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-navy text-sm">📱 UPI / QR Transfer</span>
                    <span className="text-xs bg-emerald/15 text-emerald font-bold px-2 py-0.5 rounded">Fastest</span>
                  </div>
                  <div className="text-xs text-navy/60">Pay via GPay, PhonePe, Paytm + Upload Screenshot</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`rounded-xl p-4 text-left border-2 transition ${
                    paymentMethod === "cod" ? "border-gold bg-gold/10 ring-2 ring-gold/30" : "border-navy/10 hover:border-gold/40"
                  }`}
                >
                  <div className="font-bold text-navy text-sm mb-1">
                    {deliveryMethod === "pickup" ? "🏬 Pay at Shop Counter" : "💵 Cash on Delivery"}
                  </div>
                  <div className="text-xs text-navy/60">
                    {deliveryMethod === "pickup" ? "Pay via Cash/Card when collecting order" : "Pay cash to delivery agent upon arrival"}
                  </div>
                </button>
              </div>

              {/* UPI PAYMENT BOX & PROOF UPLOAD */}
              {paymentMethod === "upi" && (
                <div className="bg-navy/5 rounded-2xl p-5 border border-navy/10 space-y-5">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* QR Code */}
                    <div className="bg-white p-3 rounded-2xl border border-navy/10 shadow-sm shrink-0 text-center">
                      <img
                        src={dynamicQrCode}
                        alt="Alpha Watch UPI QR"
                        className="w-40 h-40 object-contain rounded-xl mx-auto mb-2"
                      />
                      <div className="text-[11px] font-bold text-navy">Pay ₹{finalTotal.toLocaleString("en-IN")}</div>
                      <div className="text-[9px] text-navy/50">Scan with any UPI app</div>
                    </div>

                    {/* UPI Details */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="p-3 bg-white rounded-xl border border-navy/10 space-y-1">
                        <div className="text-[11px] text-navy/50 font-medium">Shop UPI ID:</div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-navy text-sm">{upiSettings.upiId}</span>
                          <button
                            type="button"
                            onClick={copyUpiId}
                            className="text-xs bg-navy/5 hover:bg-gold hover:text-white text-navy font-semibold px-2.5 py-1 rounded-lg border border-navy/15 transition"
                          >
                            Copy ID
                          </button>
                        </div>
                        <div className="text-[11px] text-navy/60">Payee: <strong>{upiSettings.upiPayeeName}</strong></div>
                      </div>

                      <a
                        href={upiIntentUri}
                        className="block w-full text-center py-2.5 rounded-xl bg-navy text-ivory text-xs font-bold hover:bg-gold transition shadow-xs"
                      >
                        ⚡ Open &amp; Pay in UPI App (Mobile)
                      </a>
                    </div>
                  </div>

                  {/* Step 2: UTR Reference Number */}
                  <div>
                    <label className="text-xs font-semibold text-navy block mb-1.5">
                      Step 1: Enter 12-Digit UPI Reference / UTR Number *
                    </label>
                    <input
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.trim())}
                      placeholder="e.g. 423589123456 (Found on payment success screen)"
                      className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 font-mono text-sm"
                    />
                  </div>

                  {/* Step 3: Screenshot Upload */}
                  <div>
                    <label className="text-xs font-semibold text-navy block mb-1.5">
                      Step 2: Upload Payment Screenshot Proof *
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {screenshotDataUrl ? (
                      <div className="p-3 bg-white rounded-xl border-2 border-emerald/40 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={screenshotDataUrl}
                            alt="Uploaded Screenshot"
                            className="w-14 h-14 object-cover rounded-lg border border-navy/10"
                          />
                          <div>
                            <div className="text-xs font-bold text-navy truncate max-w-[200px]">
                              {screenshotFileName || "screenshot.jpg"}
                            </div>
                            <div className="text-[11px] text-emerald font-semibold">✓ Screenshot Attached</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshotDataUrl("");
                            setScreenshotFileName("");
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-xs text-red-500 hover:underline font-semibold"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-navy/20 hover:border-gold rounded-xl bg-white flex flex-col items-center justify-center text-navy/70 hover:text-gold transition group"
                      >
                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">📸</span>
                        <span className="text-xs font-bold text-navy">Click to Upload Payment Screenshot</span>
                        <span className="text-[10px] text-navy/40 mt-0.5">JPG, PNG, WEBP (Max 5MB)</span>
                      </button>
                    )}
                  </div>

                  <div className="p-3 bg-gold/10 rounded-xl text-[11px] text-navy/70 leading-relaxed border border-gold/20">
                    🛡️ <strong>Instant Approval Process:</strong> Once submitted, our store admin verifies your transaction and marks your order Confirmed with official tracking details.
                  </div>
                </div>
              )}
            </div>

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
                  ? "Submitting Order for Approval..."
                  : paymentMethod === "upi"
                  ? "Submit Order & UPI Proof for Approval"
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
