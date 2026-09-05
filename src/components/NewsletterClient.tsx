"use client";
import { useState } from "react";
import { toast } from "@/store/ui";

export default function NewsletterClient() {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");

      setDone(true);
      toast("Subscribed to newsletter ✓");
    } catch (err: any) {
      toast(err.message || "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-navy-950 text-ivory">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl font-bold">Join the Alpha Circle</h2>
        <p className="text-ivory/60 mt-3 mb-6">
          Get early access to new arrivals, exclusive offers &amp; eye-care tips in Raebareli.
        </p>
        {done ? (
          <div className="bg-emerald/20 text-emerald rounded-xl p-4 text-sm max-w-md mx-auto">
            ✓ Thanks for subscribing! Welcome to the Alpha Circle.
          </div>
        ) : (
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={handleSubmit}>
            <input
              type="text"
              name="hp"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-premium input-dark bg-white/10 border-white/25 text-ivory placeholder:text-ivory/55 flex-1"
            />
            <button
              type="submit"
              disabled={loading}
              className="btn-gold px-6 py-3 rounded-full font-semibold whitespace-nowrap disabled:opacity-50"
            >
              {loading ? "Joining..." : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
