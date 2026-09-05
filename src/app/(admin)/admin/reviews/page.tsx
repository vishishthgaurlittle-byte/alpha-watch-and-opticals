"use client";
import { useEffect, useState } from "react";
import { dateFmt } from "@/lib/site";
import { toast } from "@/store/ui";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (res.ok) {
        setReviews(data.reviews || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast(`Review marked as ${status} ✓`);
        await fetchReviews();
      }
    } catch {
      toast("Failed to update status");
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Review deleted ✓");
        await fetchReviews();
      }
    } catch {
      toast("Failed to delete review");
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-1">Customer Reviews</h1>
      <p className="text-navy/50 text-sm mb-6">Moderate and approve product reviews</p>

      <div className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-navy/50 text-sm">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <p className="text-navy/50 text-sm py-12 text-center">No reviews submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border border-navy/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy">{r.userName}</span>
                    <span className="text-xs text-navy/40">on {r.product?.name || "Product"}</span>
                    <div className="text-gold text-xs">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.title && <div className="font-medium text-sm text-navy mt-1">{r.title}</div>}
                  <p className="text-navy/70 text-sm mt-1">{r.comment}</p>
                  <div className="text-xs text-navy/40 mt-1">{dateFmt(r.createdAt)}</div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      r.status === "approved"
                        ? "bg-emerald/10 text-emerald"
                        : r.status === "pending"
                        ? "bg-gold/10 text-gold-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {r.status}
                  </span>
                  {r.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(r.id, "approved")}
                      className="text-xs text-emerald font-semibold hover:underline"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(r.id, "rejected")}
                      className="text-xs text-navy/60 hover:underline"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="text-xs text-red-500 font-semibold hover:underline ml-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
