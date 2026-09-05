"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/store/auth";
import { mergeGuestCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import { toast } from "@/store/ui";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nextUrl?: string;
  isRegister?: boolean;
}

export default function GoogleAuthModal({ isOpen, onClose, nextUrl = "", isRegister = false }: Props) {
  const router = useRouter();
  const googleLogin = useAuth((s) => s.googleLogin);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErr("Please enter a valid Google email address.");
      return;
    }
    if (!cleanName) {
      setErr("Please enter your name.");
      return;
    }

    setBusy(true);
    try {
      googleLogin({ email: cleanEmail, name: cleanName });
      const user = useAuth.getState().user;
      if (user) {
        mergeGuestCart(user.id);
        toast(`Signed in as ${cleanName} (${cleanEmail}) ✓`);
        onClose();
        router.push(nextUrl || (user.role === "admin" ? "/admin" : "/account"));
      } else {
        setErr("Unable to sign in. Please try again.");
      }
    } catch {
      setErr("An unexpected error occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white text-navy w-full max-w-sm rounded-3xl p-6 md:p-8 shadow-2xl relative border border-navy/10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-navy/5 hover:bg-navy/10 flex items-center justify-center text-navy/60 transition"
          >
            ✕
          </button>

          {/* Google Icon & Title */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-white shadow-md border border-navy/5 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-navy">
              {isRegister ? "Sign up with Google" : "Sign in with Google"}
            </h3>
            <p className="text-xs text-navy/60 mt-1">
              Enter your Google Account details to {isRegister ? "create your account" : "continue"}
            </p>
          </div>

          {err && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3 mb-4">
              {err}
            </div>
          )}

          <form onSubmit={handleContinue} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-navy/70 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="input-premium w-full bg-navy/5 border-navy/15 text-navy placeholder:text-navy/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy/70 mb-1">Google Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@gmail.com"
                className="input-premium w-full bg-navy/5 border-navy/15 text-navy placeholder:text-navy/40 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-gold w-full py-3 rounded-full font-semibold mt-4 text-sm disabled:opacity-60"
            >
              {busy ? "Signing in…" : isRegister ? "Create Account & Continue" : "Sign In & Continue"}
            </button>
          </form>

          <p className="text-[11px] text-center text-navy/50 mt-4 leading-relaxed">
            By continuing, you agree to Alpha Watch &amp; Opticals Terms of Service &amp; Privacy Policy.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
