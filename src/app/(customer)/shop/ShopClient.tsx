"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product, Category } from "@/lib/types";
import ProductGrid from "@/components/product/ProductGrid";

interface Props {
  initialProducts: Product[];
  categories: Category[];
}

export default function ShopClient({ initialProducts, categories }: Props) {
  const params = useSearchParams();
  const initialCat = params.get("cat") || "";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(initialCat);
  const [sort, setSort] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(40000);
  const [inStock, setInStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...initialProducts].filter((p) => p.price <= maxPrice);
    if (cat) {
      list = list.filter((p) => p.category_id === cat || p.category_id === `c-${cat.replace("-watches", "").replace("-glasses", "")}` || p.category_id.includes(cat.split("-")[0]));
    }
    if (inStock) list = list.filter((p) => p.stock > 0);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t));
    }
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
        break;
      case "discount":
        list.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp);
        break;
      default:
        list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [initialProducts, cat, sort, maxPrice, inStock, q]);

  const Filters = (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs uppercase tracking-wider text-navy/50 mb-3">Category</h4>
        <div className="space-y-1">
          <button
            onClick={() => setCat("")}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${!cat ? "bg-navy text-ivory font-medium" : "text-navy hover:bg-navy/5"}`}
          >
            All Products
          </button>
          {categories.map((c) => {
            const isSelected = cat === c.id || cat === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.slug)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${isSelected ? "bg-navy text-ivory font-medium" : "text-navy hover:bg-navy/5"}`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-wider text-navy/50 mb-3">
          Max Price — ₹{maxPrice.toLocaleString("en-IN")}
        </h4>
        <input
          type="range"
          min={500}
          max={40000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(+e.target.value)}
          className="w-full accent-[var(--accent)]"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="accent-[var(--accent)]"
        />
        In stock only
      </label>
    </div>
  );

  return (
    <div className="pt-24 md:pt-28 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy">Shop Collection</h1>
          <p className="text-navy/60 mt-1">{filtered.length} products available</p>
        </div>

        {/* search + sort + mobile filter */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex-1 min-w-[200px] relative">
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeWidth="1.8" d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search watches, brands, eyewear..."
              className="input-premium pl-10"
            />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-premium w-auto text-sm">
            <option value="popular">Popularity</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="discount">Discount</option>
          </select>
          <button
            onClick={() => setFiltersOpen(true)}
            className="md:hidden btn-gold px-4 py-2.5 rounded-full text-sm font-medium"
          >
            Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* desktop filters */}
          <aside className="hidden md:block w-60 shrink-0 sticky top-28 self-start bg-white rounded-2xl p-5 h-fit shadow-sm">
            {Filters}
          </aside>

          <div className="flex-1">
            <ProductGrid products={filtered} />
          </div>
        </div>
      </div>

      {/* mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setFiltersOpen(false)} />
          <div className="relative w-full bg-white rounded-t-3xl p-6 pb-10 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-xl text-navy">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="text-2xl text-navy/50">
                &times;
              </button>
            </div>
            {Filters}
            <button
              onClick={() => setFiltersOpen(false)}
              className="btn-gold w-full mt-8 py-3 rounded-full font-semibold"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
