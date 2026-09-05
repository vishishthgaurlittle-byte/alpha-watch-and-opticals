"use client";
import { create } from "zustand";
import type { User } from "@/lib/types";
import { insforge } from "@/lib/insforge";

interface AuthState {
  user: User | null;
  hydrated: boolean;
  register: (d: { name: string; email: string; phone?: string; password: string }) => Promise<string | null>;
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

    try {
      if (typeof window !== "undefined") {
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          const u = data.user;
          const email = u.email || "";
          const name = (u as any).profile?.name || (u as any).name || (email ? email.split("@")[0] : "Customer");
          const picture = (u as any).profile?.avatar_url || (u as any).avatar_url || "";
          set({
            user: {
              id: u.id || "usr-" + Date.now().toString(36),
              name,
              email,
              role: (u as any).role || "customer",
              avatar: picture || null,
              created_at: new Date().toISOString()
            } as any,
            hydrated: true
          });
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
    // Map InsForge user into Zustand auth store
    set({
      user: {
        id: p.id || "usr-" + Date.now().toString(36),
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
