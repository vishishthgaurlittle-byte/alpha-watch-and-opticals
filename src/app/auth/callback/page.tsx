"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/store/auth";
import { mergeGuestCart } from "@/store/cart";
import { toast } from "@/store/ui";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const googleLogin = useAuth((s) => s.googleLogin);
  const [status, setStatus] = useState("Authenticating with Google…");

  useEffect(() => {
    const email = searchParams.get("email");
    const name = searchParams.get("name") || "";
    const picture = searchParams.get("picture") || "";
    const next = searchParams.get("next") || searchParams.get("state") || "/account";

    if (email) {
      try {
        googleLogin({ email, name: name || email.split("@")[0], picture });
        const user = useAuth.getState().user;
        if (user) {
          mergeGuestCart(user.id);
          toast(`Signed in as ${user.name} (${user.email}) ✓`);
          router.replace(next.startsWith("/") ? next : "/account");
          return;
        }
      } catch (err) {
        console.error("Auth callback error:", err);
      }
    }

    // If no email or failed, redirect back to login
    setStatus("Redirecting…");
    const timer = setTimeout(() => {
      router.replace(next.startsWith("/") ? next : "/login");
    }, 800);

    return () => clearTimeout(timer);
  }, [searchParams, googleLogin, router]);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 text-ivory">
      <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center mb-4 animate-bounce">
        <svg className="w-8 h-8" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/>
        </svg>
      </div>
      <h2 className="font-serif text-xl font-semibold mb-2">{status}</h2>
      <p className="text-xs text-ivory/50">Securing your session with Alpha Watch &amp; Opticals</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950" />}>
      <CallbackHandler />
    </Suspense>
  );
}
