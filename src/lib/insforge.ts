"use client";
import { createClient } from "@insforge/sdk";

export const insforge = createClient({
  baseUrl: (process.env.NEXT_PUBLIC_INSFORGE_URL || "https://4bnre66i.ap-southeast.insforge.app").replace(/\/$/, ""),
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_API_KEY || "",
});

export function appOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://alpha-watch-and-opticals.vercel.app").replace(/\/$/, "");
}
