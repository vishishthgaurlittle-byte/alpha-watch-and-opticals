"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ThemeId, DEFAULT_THEME, isValidThemeId, THEMES } from "./palettes";
import { useAuth } from "@/store/auth";

const DEVICE_STORAGE_KEY = "aw_theme_device";
const THEME_COOKIE_NAME = "aw_theme";

interface DeviceThemeRecord {
  userId: string | "guest";
  themeId: ThemeId;
  updatedAt: number;
}

interface ThemeContextType {
  globalTheme: ThemeId;
  personalTheme: ThemeId | null;
  resolvedTheme: ThemeId;
  hasPersonalOverride: boolean;
  isLoading: boolean;
  setCustomerTheme: (themeId: ThemeId) => Promise<void>;
  resetToStoreDefault: () => Promise<void>;
  setAdminGlobalTheme: (themeId: ThemeId) => Promise<{ success: boolean; error?: string }>;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getLocalDeviceTheme(): DeviceThemeRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && isValidThemeId(parsed.themeId)) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

function setLocalDeviceTheme(userId: string | "guest", themeId: ThemeId) {
  if (typeof window === "undefined") return;
  try {
    const record: DeviceThemeRecord = {
      userId,
      themeId,
      updatedAt: Date.now()
    };
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // ignore
  }
}

function removeLocalDeviceTheme() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DEVICE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function applyHtmlTheme(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = themeId;
  // Write cookie for next SSR request
  document.cookie = `${THEME_COOKIE_NAME}=${themeId}; path=/; max-age=2592000; SameSite=Lax`;
}

export function ThemeProvider({
  children,
  initialTheme = DEFAULT_THEME
}: {
  children: React.ReactNode;
  initialTheme?: ThemeId;
}) {
  const user = useAuth((s) => s.user);
  const [globalTheme, setGlobalTheme] = useState<ThemeId>(initialTheme);
  const [personalTheme, setPersonalTheme] = useState<ThemeId | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<ThemeId>(initialTheme);
  const [hasPersonalOverride, setHasPersonalOverride] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Resolution calculation
  const computeResolvedTheme = useCallback(
    (gTheme: ThemeId, pTheme: ThemeId | null, currentUserId?: string | null): { resolved: ThemeId; isOverride: boolean } => {
      const dev = getLocalDeviceTheme();
      const effectiveUid = currentUserId || "guest";

      // 1. If logged-in customer has a personal theme saved for THIS user id on THIS device
      if (currentUserId && dev && dev.userId === currentUserId && isValidThemeId(dev.themeId)) {
        return { resolved: dev.themeId, isOverride: true };
      }

      // If logged-in customer has a personal theme on server (and no conflicting device override)
      if (currentUserId && pTheme && isValidThemeId(pTheme)) {
        return { resolved: pTheme, isOverride: true };
      }

      // 2. Else if a guest has a device-only theme -> use that (only that browser)
      if (!currentUserId && dev && dev.userId === "guest" && isValidThemeId(dev.themeId)) {
        return { resolved: dev.themeId, isOverride: true };
      }

      // 3. Else -> Admin global default (everyone)
      return { resolved: gTheme || DEFAULT_THEME, isOverride: false };
    },
    []
  );

  const fetchAndSyncThemes = useCallback(async () => {
    try {
      const res = await fetch("/api/theme");
      if (res.ok) {
        const data = await res.json();
        const serverGlobal: ThemeId = isValidThemeId(data.globalTheme) ? data.globalTheme : DEFAULT_THEME;
        const serverPersonal: ThemeId | null = isValidThemeId(data.personalTheme) ? data.personalTheme : null;

        setGlobalTheme(serverGlobal);
        setPersonalTheme(serverPersonal);

        const { resolved, isOverride } = computeResolvedTheme(serverGlobal, serverPersonal, user?.id);
        setResolvedTheme(resolved);
        setHasPersonalOverride(isOverride);
        applyHtmlTheme(resolved);

        // Guest to logged-in user migration
        if (user?.id) {
          const dev = getLocalDeviceTheme();
          if (dev && dev.userId === "guest") {
            // Migrate guest device preference to user profile
            setLocalDeviceTheme(user.id, dev.themeId);
            fetch("/api/theme", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ themeId: dev.themeId })
            }).catch(() => {});
          }
        }
      }
    } catch {
      // Fallback
      const dev = getLocalDeviceTheme();
      if (dev && isValidThemeId(dev.themeId)) {
        setResolvedTheme(dev.themeId);
        setHasPersonalOverride(true);
        applyHtmlTheme(dev.themeId);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, computeResolvedTheme]);

  useEffect(() => {
    fetchAndSyncThemes();
  }, [fetchAndSyncThemes]);

  // Customer setting personal theme
  const setCustomerTheme = async (themeId: ThemeId) => {
    if (!isValidThemeId(themeId)) return;

    const uid = user?.id || "guest";
    setLocalDeviceTheme(uid, themeId);
    setPersonalTheme(themeId);
    setResolvedTheme(themeId);
    setHasPersonalOverride(true);
    applyHtmlTheme(themeId);

    // Save to server if authenticated
    try {
      await fetch("/api/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId })
      });
    } catch {
      // Local preference remains active on this device
    }
  };

  // Reset to store default
  const resetToStoreDefault = async () => {
    removeLocalDeviceTheme();
    setPersonalTheme(null);
    setResolvedTheme(globalTheme);
    setHasPersonalOverride(false);
    applyHtmlTheme(globalTheme);

    try {
      await fetch("/api/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true })
      });
    } catch {
      // ignore
    }
  };

  // Admin setting site-wide global default
  const setAdminGlobalTheme = async (themeId: ThemeId): Promise<{ success: boolean; error?: string }> => {
    if (!isValidThemeId(themeId)) {
      return { success: false, error: "Invalid theme ID" };
    }

    try {
      const res = await fetch("/api/admin/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to update global theme" };
      }

      setGlobalTheme(themeId);

      // If current admin does NOT have a personal override, update their display too
      if (!hasPersonalOverride) {
        setResolvedTheme(themeId);
        applyHtmlTheme(themeId);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        globalTheme,
        personalTheme,
        resolvedTheme,
        hasPersonalOverride,
        isLoading,
        setCustomerTheme,
        resetToStoreDefault,
        setAdminGlobalTheme,
        refreshTheme: fetchAndSyncThemes
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
