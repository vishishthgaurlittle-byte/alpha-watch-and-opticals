"use client";
import { create } from "zustand";
import type { User } from "@/lib/types";
import { insforge } from "@/lib/insforge";

interface AuthState {
  user: User | null;
  hydrated: boolean;
  register: (d: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<{ error?: string; needsVerification?: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<string | null>;
  googleLogin: (p: { email: string; name: string; picture?: string; id?: string }) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  saveProfile: (patch: Partial<User>) => void;
  setUser: (u: User | null) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          set({ user: data.user, hydrated: true });
          return;
        }
      }
    } catch {
      // ignore
    }

    try {
      if (typeof window !== "undefined") {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          const syncRes = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: (data.user as any).profile?.name || data.user.email?.split("@")[0],
              avatar: (data.user as any).profile?.avatar_url || null
            })
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.user) {
              set({ user: syncData.user, hydrated: true });
              return;
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // If server says not authenticated, do not retain fake local user
    if (typeof window !== "undefined") {
      localStorage.removeItem("awopticals_session");
    }
    set({ user: null, hydrated: true });
  },

  refresh: async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          set({ user: data.user });
          return;
        }
      }
    } catch {
      // ignore
    }
    set({ user: null });
  },

  register: async (d) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(d)
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Failed to create account." };
      }
      if (data.needsVerification) {
        return { needsVerification: true, message: data.message || "Please check your email to verify your account." };
      }
      if (data.user) {
        set({ user: data.user });
      }
      return {};
    } catch (err: any) {
      return { error: err.message || "Network error. Please try again." };
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return data.error || "Invalid login credentials";
      }
      if (data.user) {
        set({ user: data.user });
      }
      return null;
    } catch (err: any) {
      return err.message || "Network error during login.";
    }
  },

  googleLogin: (p) => {
    set({
      user: {
        id: p.id || "",
        name: p.name,
        email: p.email,
        role: "customer",
        avatar: p.picture || null,
        created_at: new Date().toISOString()
      } as any
    });
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    try {
      await insforge.auth.signOut();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("awopticals_session");
    }
    set({ user: null });
  },

  saveProfile: (patch) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...patch } });
  },

  setUser: (u) => set({ user: u })
}));
