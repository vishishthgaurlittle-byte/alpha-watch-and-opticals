"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = searchParams.get("state") || "/account";

  const [step, setStep] = useState<"email" | "name">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErr("Enter a valid Google email or phone");
      return;
    }

    if (step === "email") {
      setStep("name");
      return;
    }

    const cleanName = name.trim() || cleanEmail.split("@")[0];
    setBusy(true);

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("email", cleanEmail);
    callbackUrl.searchParams.set("name", cleanName);
    callbackUrl.searchParams.set("next", state);

    router.push(callbackUrl.toString());
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col items-center justify-center p-4 font-sans text-[#1f1f1f]">
      <div className="bg-white rounded-[28px] p-8 md:p-10 shadow-lg w-full max-w-[440px] border border-[#e3e3e3]">
        {/* Google Logo */}
        <div className="flex justify-center mb-4">
          <svg className="w-10 h-10" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
        </div>

        <h1 className="text-2xl font-normal text-center mb-2">Sign in with Google</h1>
        <p className="text-sm text-center text-[#444746] mb-8">
          to continue to <span className="font-semibold text-[#1f1f1f]">Alpha Watch &amp; Opticals</span>
        </p>

        {err && <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4">{err}</div>}

        <form onSubmit={handleNext} className="space-y-6">
          {step === "email" ? (
            <div>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or phone"
                className="w-full px-4 py-3.5 rounded-lg border border-[#747775] focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none text-base transition"
              />
              <p className="text-xs text-[#0b57d0] font-medium mt-2 hover:underline cursor-pointer">
                Forgot email?
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-[#f0f4f9] rounded-xl text-xs text-[#444746] flex items-center justify-between">
                <span>{email}</span>
                <button type="button" onClick={() => setStep("email")} className="text-[#0b57d0] font-medium hover:underline">Change</button>
              </div>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-4 py-3.5 rounded-lg border border-[#747775] focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none text-base transition"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push(state.startsWith("/") ? state : "/login")}
              className="text-sm font-medium text-[#0b57d0] hover:bg-[#ebf3fe] px-4 py-2 rounded-full transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="bg-[#0b57d0] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0842a0] transition shadow-sm disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Next"}
            </button>
          </div>
        </form>
      </div>

      <div className="w-full max-w-[440px] flex justify-between text-xs text-[#444746] mt-4 px-2">
        <span>English (United States)</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>
    </div>
  );
}

export default function GoogleSelectPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f0f4f9]" />}>
      <GoogleSelectContent />
    </Suspense>
  );
}
