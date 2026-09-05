"use client";
import { create } from "zustand";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  hydrated: boolean;
  register: (d: { name: string; email: string; phone?: string; password: string }) => Promise<string | null>;
  login: (email: string, password: string) => Promise<string | null>;
  googleLogin: (p: { email: string; name: string; picture?: string }) => void;
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
      const res = await fetch("/api/auth/me");
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
    set({ user: null, hydrated: true });
  },

  refresh: async () => {
    try {
      const res = await fetch("/api/auth/me");
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
        body: JSON.stringify(d)
      });
      const data = await res.json();
      if (!res.ok) {
        return data.error || "Failed to create account";
      }
      set({ user: data.user });
      return null;
    } catch (err: any) {
      return err.message || "Network error. Please try again.";
    }
  },

  login: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return data.error || "Invalid login credentials";
      }
      set({ user: data.user });
      return null;
    } catch (err: any) {
      return err.message || "Network error during login.";
    }
  },

  googleLogin: (p) => {
    // Optimistic user update for Google OAuth callback flow
    set({
      user: {
        id: "usr-" + Date.now().toString(36),
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
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
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
