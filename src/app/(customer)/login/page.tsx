"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { insforge } from "@/lib/insforge";
import { useAuth } from "@/store/auth";
import { mergeGuestCart } from "@/store/cart";
import { toast } from "@/store/ui";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "";
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const go = (user: any) => {
    if (user?.id) {
      mergeGuestCart(user.id);
    }
    const target = next || (user?.role === "admin" ? "/admin" : "/account");
    router.push(target);
  };

  const handleGoogleLogin = async () => {
    setErr("");
    setGoogleLoading(true);
    const targetNext = params.get("next") || "/account";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("aw_oauth_next", targetNext.startsWith("/") ? targetNext : "/account");
    }

    try {
      const { error } = await insforge.auth.signInWithOAuth("google", {
        redirectTo: `${window.location.origin}/auth/callback`,
        additionalParams: { prompt: "select_account" }
      });

      if (error) {
        setGoogleLoading(false);
        const isNotConfigured =
          error.message?.toLowerCase().includes("not enabled") ||
          error.message?.toLowerCase().includes("not configured") ||
          error.message?.toLowerCase().includes("provider");
        setErr(
          isNotConfigured
            ? "Google is not enabled on InsForge. Open InsForge dashboard → Auth Methods → Google, paste Client ID/Secret, add redirect URLs."
            : (error.message || "Google sign-in failed. Check InsForge Google provider is enabled.")
        );
      }
    } catch (e: any) {
      setGoogleLoading(false);
      setErr(e?.message || "Google Sign-In failed. Please try again.");
    }
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    const errorMsg = await login(email, password);
    setBusy(false);

    if (errorMsg) {
      setErr(errorMsg);
      return;
    }

    const u = useAuth.getState().user;
    toast(`Welcome back, ${u?.name || "Customer"}! ✓`);
    go(u);
  };

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex items-center justify-center px-4 py-24">
      <img
        src="/images/products/mens-chrono-gold.jpg"
        alt="Alpha Background"
        className="absolute inset-0 w-full h-full object-cover opacity-15"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-950/90 to-navy-950" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/10"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mx-auto mb-3 border border-gold/30">
            <span className="font-serif text-2xl font-bold text-gold">A</span>
          </div>
          <h1 className="font-serif text-2xl text-ivory">Welcome to Alpha</h1>
          <p className="text-ivory/60 text-xs mt-1">Sign in to your customer account</p>
        </div>

        {err && (
          <div className="bg-red-500/20 text-red-200 text-sm rounded-xl px-4 py-3 mb-5 border border-red-500/30">
            {err}
          </div>
        )}

        <form onSubmit={submitEmail} className="space-y-4">
          <div>
            <label className="block text-ivory/70 text-xs mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-premium input-dark bg-white/10 border-white/25 text-ivory placeholder:text-ivory/55"
            />
          </div>
          <div>
            <label className="block text-ivory/70 text-xs mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-premium input-dark bg-white/10 border-white/25 text-ivory placeholder:text-ivory/55"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="btn-gold w-full py-3.5 rounded-full font-semibold disabled:opacity-60 shadow-md"
          >
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Google OAuth */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/15" />
          <span className="text-xs text-ivory/40">or</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2 bg-white text-navy py-3 rounded-full font-medium hover:bg-ivory transition cursor-pointer shadow-md disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
            />
          </svg>
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <p className="text-center text-xs text-ivory/60 mt-6">
          Don&apos;t have an account?{" "}
          <Link href={`/register${next ? "?next=" + next : ""}`} className="text-gold underline font-medium">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950" />}>
      <LoginContent />
    </Suspense>
  );
}
