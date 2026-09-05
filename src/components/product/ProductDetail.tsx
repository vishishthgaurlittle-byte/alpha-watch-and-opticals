"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { SITE, formatINR, discountPct } from "@/lib/site";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { toast } from "@/store/ui";
import { addViewed, getReviewsForProduct, addReview, getDB, getProductById, getViewed, getWishlist, toggleWishlist } from "@/lib/db";
import TiltCard from "@/components/ui/TiltCard";
import RatingStars from "@/components/ui/RatingStars";
import ProductCard from "./ProductCard";

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const add = useCart((s) => s.add);
  const uid = user ? user.id : "guest";
  const [imgIdx, setImgIdx] = useState(0);
  const [activeVariant, setActiveVariant] = useState<{ type: string; value: string } | null>(null);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [reviewForm, setReviewForm] = useState<{ rating: number; title: string; comment: string }>({ rating: 5, title: "", comment: "" });
  const [wl, setWl] = useState(false);
  const [revReload, setRevReload] = useState(0);

  const reviews = useMemo(() => getReviewsForProduct(product.id), [product.id, revReload]);

  // wishlist initial
  useEffect(() => {
    if (user) setWl(getWishlist(user.id).includes(product.id));
  }, [user, product.id]);

  // recent views
  useEffect(() => {
    if (user) addViewed(user.id, product.id);
    else addViewed("guest", product.id);
  }, [user, product.id]);

  // auto-select single variant
  useEffect(() => {
    if (product.variants?.length === 1) setActiveVariant({ type: product.variants[0].variant_type, value: product.variants[0].value });
  }, [product]);

  const variantGroups = useMemo(() => {
    const map: Record<string, string[]> = {};
    product.variants?.forEach((v) => {
      if (!map[v.variant_type]) map[v.variant_type] = [];
      if (!map[v.variant_type].includes(v.value)) map[v.variant_type].push(v.value);
    });
    return map;
  }, [product]);

  const off = discountPct(product.price, product.mrp);

  const handleAdd = (goCheckout = false) => {
    if (product.stock <= 0) { toast("This item is out of stock"); return; }
    add(uid, product.id, activeVariant || undefined, qty);
    toast("Added to cart ✓");
    if (goCheckout) {
      if (!user) { router.push("/login?next=/checkout"); return; }
      router.push("/checkout");
    }
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast("Please login to review"); router.push("/login"); return; }
    addReview({ user_id: user.id, user_name: user.name, product_id: product.id, ...reviewForm });
    toast("Review submitted ✓");
    setRevReload((v) => v + 1);
    setReviewForm({ rating: 5, title: "", comment: "" });
  };

  return (
    <div className="pt-24 md:pt-28 bg-ivory min-h-screen pb-32 md:pb-16">
      {/* breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 text-xs text-navy/50 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-gold-700">Home</Link> <span>/</span>
        <Link href="/shop" className="hover:text-gold-700">Shop</Link> <span>/</span>
        <span className="text-navy/80">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 pb-16">
        {/* image viewer */}
        <div className="md:sticky md:top-24 self-start">
          <div className="rounded-3xl overflow-hidden bg-white aspect-square shadow-sm card-shine">
            {product.images[imgIdx] ? (
              <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            ) : <div className="w-full h-full flex items-center justify-center text-navy/20">No image</div>}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 ${i === imgIdx ? "border-gold" : "border-transparent"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 text-xs text-navy/40">Tap to view in 360° at our store · Free in-store demo</div>
        </div>

        {/* info */}
        <div>
          <div className="text-xs uppercase tracking-wider text-navy/40 mb-1">{product.brand} · SKU {product.sku}</div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            <RatingStars value={product.rating} />
            <span className="text-sm text-navy/50">{product.rating} · {reviews.length || product.reviews_count} reviews</span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-navy">{formatINR(product.price)}</span>
            {product.mrp > product.price && <span className="text-lg text-navy/40 line-through">{formatINR(product.mrp)}</span>}
            {off > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{off}% OFF</span>}
          </div>
          <div className="text-xs text-navy/50 mt-1">Inclusive of all taxes</div>

          {/* badges */}
          {product.badges.length > 0 && (
            <div className="flex gap-2 mt-3">
              {product.badges.map((b) => <span key={b} className="bg-emerald/10 text-emerald text-xs font-semibold px-2.5 py-1 rounded-full">{b}</span>)}
            </div>
          )}

          <p className="text-navy/70 mt-5 leading-relaxed text-sm">{product.description}</p>

          {/* variants */}
          {Object.entries(variantGroups).map(([type, values]) => (
            <div key={type} className="mt-6">
              <div className="text-xs uppercase tracking-wider text-navy/50 mb-2">{type}</div>
              <div className="flex flex-wrap gap-2">
                {values.map((v) => (
                  <button key={v} onClick={() => setActiveVariant({ type, value: v })}
                    className={`px-4 py-2 rounded-full text-sm border transition ${activeVariant?.value === v && activeVariant?.type === type ? "border-gold bg-gold text-white" : "border-navy/15 text-navy hover:border-gold"}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* stock */}
          <div className={`mt-6 text-sm font-medium ${product.stock > 0 ? "text-emerald" : "text-red-600"}`}>
            {product.stock > 0 ? `● In stock (${product.stock} available)` : "● Out of stock"}
          </div>

          {/* qty + actions */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex items-center border border-navy/15 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 text-navy">−</button>
              <span className="w-8 text-center text-navy font-medium">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3 text-navy">+</button>
            </div>
            <button onClick={() => handleAdd(false)} className="flex-1 btn-gold py-3 rounded-full font-semibold">Add to Cart</button>
            <button onClick={() => setWl(toggleWishlist(user ? user.id : "guest", product.id))} aria-label="Wishlist"
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition ${wl ? "border-rosegold bg-rosegold text-white" : "border-navy/15 text-navy hover:border-rosegold"}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill={wl ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 7 5c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.7 0 5.8 3.6 4.5 6.8C19.5 16.4 12 21 12 21z"/></svg>
            </button>
          </div>
          <button onClick={() => handleAdd(true)} className="w-full mt-3 py-3 rounded-full font-semibold border-2 border-navy text-navy hover:bg-navy hover:text-ivory transition">Buy Now</button>

          {/* pincode checker */}
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-navy/50 mb-2">Delivery to</div>
            <div className="flex gap-2">
              <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter pincode" className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 flex-1" />
              <button onClick={() => {
                if (pincode.length === 6) setPinMsg("✓ Delivery available to " + pincode + " (3-5 days).");
                else setPinMsg("Please enter a valid 6-digit pincode.");
              }} className="btn-gold px-5 rounded-full text-sm font-medium">Check</button>
            </div>
            {pinMsg && <div className={`text-sm mt-2 ${pinMsg.startsWith("✓") ? "text-emerald" : "text-red-500"}`}>{pinMsg}</div>}
          </div>

          {/* specs */}
          <div className="mt-8">
            <h3 className="font-serif text-lg text-navy mb-3">Specifications</h3>
            <div className="rounded-2xl bg-white border border-navy/5 divide-y divide-navy/5">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="grid grid-cols-2 gap-2 px-4 py-3 text-sm">
                  <span className="text-navy/50">{k}</span><span className="text-navy font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* services strip */}
          <div className="grid grid-cols-3 gap-2 mt-6 text-center text-xs">
            {[
              { i: "🔒", t: "Genuine" },
              { i: "🚚", t: "Delivery / Pickup" },
              { i: "↩", t: "Easy Replace" }
            ].map((s) => (
              <div key={s.t} className="bg-white rounded-xl py-3 border border-navy/5"><div className="text-lg mb-1">{s.i}</div><div className="text-navy/60">{s.t}</div></div>
            ))}
          </div>
        </div>
      </div>

      {/* reviews */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="font-serif text-2xl font-bold text-navy mb-6">Customer Reviews</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? <p className="text-navy/50">No reviews yet. Be the first to review this product.</p> : reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-5 border border-navy/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-navy">{r.user_name}</div>
                    <div className="flex gap-1 text-sm mt-1">{Array.from({ length: r.rating }).map((_, i) => <span key={i} className="text-gold">★</span>)}</div>
                  </div>
                  <div className="text-xs text-navy/40">{new Date(r.created_at).toLocaleDateString("en-IN")}</div>
                </div>
                {r.title && <div className="font-medium text-navy mt-3">{r.title}</div>}
                <p className="text-navy/70 text-sm mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-6 border border-navy/5 h-fit">
            <h3 className="font-serif text-lg text-navy mb-4">Write a Review</h3>
            <form onSubmit={submitReview} className="space-y-3">
              <div>
                <label className="text-xs text-navy/60">Rating</label>
                <div className="flex gap-1 text-2xl">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: n }))} className={n <= reviewForm.rating ? "text-gold" : "text-navy/20"}>★</button>
                  ))}
                </div>
              </div>
              <input value={reviewForm.title} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} placeholder="Title (optional)" className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15" />
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} placeholder="Share your experience" required className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 min-h-[90px]" />
              <button className="btn-gold w-full py-3 rounded-full font-semibold">Submit Review</button>
            </form>
          </div>
        </div>
      </div>

      {/* related */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="font-serif text-2xl font-bold text-navy mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </div>
  );
}
