"use client";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { formatINR } from "@/lib/site";
import { toast } from "@/store/ui";

const emptyProduct: Product = {
  id: "",
  name: "",
  slug: "",
  sku: "",
  brand: "Alpha Signature",
  category_id: "c-mens",
  price: 0,
  mrp: 0,
  stock: 0,
  description: "",
  specs: {},
  images: ["/images/products/mens-chrono-gold.jpg"],
  badges: [],
  variants: [],
  status: "draft",
  rating: 5.0,
  reviews_count: 0,
  created_at: ""
};

const categories = [
  { id: "c-mens", name: "Men's Watches" },
  { id: "c-womens", name: "Women's Watches" },
  { id: "c-sunglasses", name: "Sunglasses" },
  { id: "c-optical", name: "Optical Glasses" },
  { id: "c-lenses", name: "Contact Lenses" },
  { id: "c-accessories", name: "Accessories" }
];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [view, setView] = useState<"list" | "edit">("list");
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(
          (data.products || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            brand: p.brand,
            category_id: p.categoryId,
            price: p.price,
            mrp: p.mrp,
            stock: p.stock,
            status: p.status,
            description: p.description,
            specs: typeof p.specsJson === "string" ? JSON.parse(p.specsJson || "{}") : p.specsJson || {},
            images: typeof p.imagesJson === "string" ? JSON.parse(p.imagesJson || "[]") : p.imagesJson || [],
            badges: typeof p.badgesJson === "string" ? JSON.parse(p.badgesJson || "[]") : p.badgesJson || [],
            rating: p.rating,
            reviews_count: p.reviewsCount,
            created_at: p.createdAt
          }))
        );
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const startEdit = (p: Product | null) => {
    setEditing(
      p
        ? {
            ...p,
            specs: { ...p.specs },
            variants: [...(p.variants || [])],
            images: [...(p.images || [])],
            badges: [...(p.badges || [])]
          }
        : { ...emptyProduct, id: "", created_at: new Date().toISOString() }
    );
    setView("edit");
  };

  const saveProduct = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast("Product name is required");
      return;
    }

    setSaving(true);
    try {
      const isNew = !editing.id;
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          brand: editing.brand,
          categoryId: editing.category_id,
          price: editing.price,
          mrp: editing.mrp,
          stock: editing.stock,
          status: editing.status,
          description: editing.description,
          specs: JSON.stringify(editing.specs),
          images: JSON.stringify(editing.images),
          badges: JSON.stringify(editing.badges)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      toast("Product saved successfully ✓");
      setView("list");
      await fetchProducts();
    } catch (err: any) {
      toast(err.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const deleteProd = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Product deleted ✓");
        await fetchProducts();
      }
    } catch {
      toast("Failed to delete product");
    }
  };

  if (view === "edit") {
    return (
      <EditForm
        p={editing!}
        setP={setEditing}
        onSave={saveProduct}
        onCancel={() => setView("list")}
        saving={saving}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Products Catalog</h1>
          <p className="text-navy/50 text-sm">{products.length} products in database</p>
        </div>
        <button
          onClick={() => startEdit(null)}
          className="btn-gold px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-navy/50 text-sm">Loading products from database...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-navy/50 text-left border-b border-navy/10">
                <th className="py-2 font-medium">Product</th>
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 font-medium">Price</th>
                <th className="py-2 font-medium">Stock</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-navy/5">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-navy/5 shrink-0">
                        {p.images[0] ? (
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium text-navy">{p.name}</div>
                        <div className="text-xs text-navy/40">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-navy/70">
                    {categories.find((c) => c.id === p.category_id)?.name || p.category_id}
                  </td>
                  <td className="py-3 font-semibold text-navy">{formatINR(p.price)}</td>
                  <td className="py-3">
                    <span className={`${p.stock <= 5 ? "text-red-500 font-bold" : "text-navy"}`}>{p.stock}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        p.status === "published"
                          ? "bg-emerald/10 text-emerald"
                          : "bg-navy/5 text-navy/60"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-gold-700 text-xs font-semibold mr-3 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProd(p.id)}
                      className="text-red-500 text-xs font-semibold hover:underline"
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
  );
}

function EditForm({
  p,
  setP,
  onSave,
  onCancel,
  saving
}: {
  p: Product;
  setP: (p: Product) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const up = (patch: Partial<Product>) => setP({ ...p, ...patch });
  const [imgInput, setImgInput] = useState("");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy">{p.id ? "Edit Product" : "Add Product"}</h1>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-full border border-navy/15 text-navy text-sm font-medium"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={onSave}
            className="btn-gold px-5 py-2.5 rounded-full font-semibold text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm grid md:grid-cols-2 gap-4">
        <label className="text-xs text-navy/60">
          Product Name
          <input
            value={p.name}
            onChange={(e) => up({ name: e.target.value })}
            className="input-premium mt-1 font-medium"
          />
        </label>
        <label className="text-xs text-navy/60">
          Brand
          <input
            value={p.brand}
            onChange={(e) => up({ brand: e.target.value })}
            className="input-premium mt-1"
          />
        </label>
        <label className="text-xs text-navy/60">
          Category
          <select
            value={p.category_id}
            onChange={(e) => up({ category_id: e.target.value })}
            className="input-premium mt-1"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-navy/60">
          Publishing Status
          <select
            value={p.status}
            onChange={(e) => up({ status: e.target.value as any })}
            className="input-premium mt-1"
          >
            <option value="published">Published (Visible in Shop)</option>
            <option value="draft">Draft (Hidden - Returns 404)</option>
          </select>
        </label>
        <label className="text-xs text-navy/60">
          Price (₹)
          <input
            type="number"
            value={p.price}
            onChange={(e) => up({ price: +e.target.value })}
            className="input-premium mt-1"
          />
        </label>
        <label className="text-xs text-navy/60">
          MRP (₹)
          <input
            type="number"
            value={p.mrp}
            onChange={(e) => up({ mrp: +e.target.value })}
            className="input-premium mt-1"
          />
        </label>
        <label className="text-xs text-navy/60">
          Stock Quantity
          <input
            type="number"
            value={p.stock}
            onChange={(e) => up({ stock: +e.target.value })}
            className="input-premium mt-1"
          />
        </label>
        <div className="md:col-span-2">
          <label className="text-xs text-navy/60">
            Description
            <textarea
              value={p.description}
              onChange={(e) => up({ description: e.target.value })}
              className="input-premium mt-1 min-h-[80px]"
            />
          </label>
        </div>

        {/* Images */}
        <div className="md:col-span-2">
          <div className="text-xs text-navy/60 mb-2">Product Images</div>
          <div className="flex flex-wrap gap-3 mb-2">
            {p.images?.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-navy/10">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => up({ images: p.images.filter((_, j) => j !== i) })}
                  className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-bl"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={imgInput}
              onChange={(e) => setImgInput(e.target.value)}
              placeholder="/images/products/….jpg or image URL"
              className="input-premium flex-1 text-xs"
            />
            <button
              type="button"
              onClick={() => {
                if (imgInput.trim()) {
                  up({ images: [...(p.images || []), imgInput.trim()] });
                  setImgInput("");
                }
              }}
              className="btn-gold px-4 rounded-full text-sm font-medium"
            >
              Add Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
