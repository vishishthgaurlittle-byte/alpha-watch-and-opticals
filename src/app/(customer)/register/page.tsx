"use client";
"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { mergeGuestCart } from "@/store/cart";
import { signInWithGoogle, signUpWithEmail } from "@/utils/auth";
import { toast } from "@/store/ui";

function RegisterContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "";
  const register = useAuth((s) => s.register);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setErr("");
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        useAuth.getState().googleLogin({
          email: result.user.email || "",
          name: result.user.displayName || (result.user.email ? result.user.email.split("@")[0] : "Customer"),
          picture: result.user.photoURL || ""
        });
        const currentUser = useAuth.getState().user;
        if (currentUser) {
          mergeGuestCart(currentUser.id);
          toast(`Account created for ${currentUser.name}! Signed in with Google ✓`);
          router.push(next || (currentUser.role === "admin" ? "/admin" : "/account"));
        }
      } else if (result.error) {
        setErr(result.error);
      }
    } catch (e: any) {
      setErr(e?.message || "Google Sign-In failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm) { setErr("Passwords do not match."); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);

    try {
      // 1. Sync via InsForge auth util
      await signUpWithEmail(form.email, form.password, form.name);
      
      // 2. Sync with local Zustand layer
      const res = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      if (res) { setErr(res); setBusy(false); return; }

      mergeGuestCart(useAuth.getState().user!.id);
      toast("Account created successfully ✓");
      router.push(next || "/account");
    } catch (error: any) {
      setErr(error?.message || "Account creation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex items-center justify-center px-4 py-24">
      <img src="/images/products/optical-frame.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-950/90 to-navy-950" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass relative w-full max-w-md rounded-3xl p-8">
        <div className="text-center mb-6">
          <img src="/icons/logo.svg" alt="logo" className="w-14 h-14 mx-auto mb-3" />
          <h1 className="font-serif text-2xl text-ivory">Create Account</h1>
          <p className="text-ivory/50 text-sm mt-1">Join the Alpha Watch &amp; Opticals family</p>
        </div>

        {err && <div className="bg-red-500/20 text-red-200 text-sm rounded-lg px-4 py-2.5 mb-4">{err}</div>}

        <form onSubmit={submit} className="space-y-3">
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" className="input-premium bg-white/10 border-white/20 text-ivory placeholder:text-ivory/40" />
          <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" className="input-premium bg-white/10 border-white/20 text-ivory placeholder:text-ivory/40" />
          <input type="tel" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="10-digit mobile number" className="input-premium bg-white/10 border-white/20 text-ivory placeholder:text-ivory/40" />
          <input type="password" required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Password (min 6 chars)" className="input-premium bg-white/10 border-white/20 text-ivory placeholder:text-ivory/40" />
          <input type="password" required value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="Confirm password" className="input-premium bg-white/10 border-white/20 text-ivory placeholder:text-ivory/40" />
          <button disabled={busy} className="btn-gold w-full py-3.5 rounded-full font-semibold disabled:opacity-60">{busy ? "Creating…" : "Create Account"}</button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/15" /><span className="text-xs text-ivory/40">or</span><div className="flex-1 h-px bg-white/15" />
        </div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2 bg-white text-navy py-3 rounded-full font-medium hover:bg-ivory transition cursor-pointer shadow-md disabled:opacity-60"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
          {googleLoading ? "Connecting to Google…" : "Continue with Google"}
        </button>
        <p className="text-center text-xs text-ivory/40 mt-4">
          Already have an account? <Link href={`/login${next ? "?next=" + next : ""}`} className="text-gold underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<div className="min-h-screen bg-navy-950" />}><RegisterContent /></Suspense>;
}
