"use client";
import Link from "next/link";
import { useEffect } from "react";
import { SITE } from "@/lib/site";

export default function RootErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="pt-28 min-h-[80vh] bg-navy-950 text-ivory flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">⌚</div>
      <div className="uppercase tracking-[0.3em] text-xs text-gold mb-2">Alpha Watch &amp; Opticals</div>
      <h1 className="font-serif text-3xl md:text-4xl font-bold">Store Support &amp; Recovery</h1>
      <p className="text-ivory/60 mt-4 max-w-md">
        We encountered a temporary hiccup loading this view. You can reload or return directly to our store.
      </p>
      <div className="flex gap-3 mt-8">
        <button onClick={() => reset()} className="btn-gold px-6 py-3 rounded-full font-semibold">
          Try Again
        </button>
        <Link href="/" className="px-6 py-3 rounded-full font-semibold border border-gold/50 text-gold hover:bg-gold/10 transition">
          Back to Store
        </Link>
      </div>
    </div>
  );
}
