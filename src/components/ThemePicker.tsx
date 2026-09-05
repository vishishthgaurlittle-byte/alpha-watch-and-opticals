"use client";
import React, { useState } from "react";
import { THEMES, THEME_IDS, ThemeId } from "@/theme/palettes";
import { useTheme } from "@/theme/ThemeProvider";
import { toast } from "@/store/ui";

interface ThemePickerProps {
  mode: "admin" | "customer";
  onComplete?: () => void;
}

export default function ThemePicker({ mode, onComplete }: ThemePickerProps) {
  const {
    globalTheme,
    resolvedTheme,
    hasPersonalOverride,
    setCustomerTheme,
    resetToStoreDefault,
    setAdminGlobalTheme
  } = useTheme();

  const [selectedId, setSelectedId] = useState<ThemeId>(
    mode === "admin" ? globalTheme : resolvedTheme
  );
  const [saving, setSaving] = useState(false);

  const isCurrentActive = (id: ThemeId) => {
    if (mode === "admin") {
      return globalTheme === id;
    }
    return resolvedTheme === id;
  };

  const handleApply = async (themeId: ThemeId) => {
    setSelectedId(themeId);
    setSaving(true);

    try {
      if (mode === "admin") {
        const res = await setAdminGlobalTheme(themeId);
        if (res.success) {
          toast(`Global store theme updated to "${THEMES[themeId].name}" for all visitors ✓`);
        } else {
          toast(res.error || "Failed to update global theme");
        }
      } else {
        await setCustomerTheme(themeId);
        toast(`Applied "${THEMES[themeId].name}" for your device ✓`);
      }
      if (onComplete) onComplete();
    } catch {
      toast("Could not update theme");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    setSaving(true);
    try {
      await resetToStoreDefault();
      setSelectedId(globalTheme);
      toast(`Reset to store default ("${THEMES[globalTheme].name}") ✓`);
      if (onComplete) onComplete();
    } catch {
      toast("Could not reset theme");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="mb-6">
        {mode === "admin" ? (
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy">Store theme (everyone)</h2>
            <p className="text-sm text-navy/60 mt-1">
              This is the default look for every visitor. Customers can still pick a private theme on their own device.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy">Your Appearance</h3>
                <p className="text-xs text-navy/60 mt-0.5">Your look — only you, only this device.</p>
              </div>
              {hasPersonalOverride && (
                <button
                  onClick={handleResetToDefault}
                  disabled={saving}
                  className="text-xs text-navy/70 hover:text-gold-700 underline font-medium px-2 py-1 rounded-md border border-navy/15 hover:border-gold"
                >
                  Use store default ({THEMES[globalTheme].name})
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5 Theme Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {THEME_IDS.map((id) => {
          const theme = THEMES[id];
          const isSelected = selectedId === id;
          const isActive = isCurrentActive(id);

          return (
            <div
              key={id}
              onClick={() => handleApply(id)}
              className={`group cursor-pointer rounded-2xl p-5 transition-all duration-200 border text-left relative flex flex-col justify-between ${
                isActive
                  ? "border-gold bg-white shadow-md ring-2 ring-gold/40"
                  : "border-navy/10 bg-white/70 hover:bg-white hover:border-gold/50"
              }`}
            >
              <div>
                {/* Active Tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider font-bold text-navy/70">
                    {theme.id}
                  </span>
                  {isActive && (
                    <span className="bg-gold text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                      {mode === "admin" ? "Store Default" : hasPersonalOverride ? "Active on this Device" : "Default Active"}
                    </span>
                  )}
                </div>

                <div className="font-serif font-bold text-navy text-lg leading-tight mb-1">
                  {theme.name}
                </div>
                <div className="text-xs text-gold-700 font-medium mb-3">
                  {theme.subtitle}
                </div>

                {/* 6 Color Dots Preview */}
                <div className="flex items-center gap-1.5 p-2 bg-navy/5 rounded-xl mb-3">
                  {theme.previewDots.map((dot, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full border border-black/15 shadow-inner"
                      style={{ backgroundColor: dot }}
                      title={`Color ${idx + 1}: ${dot}`}
                    />
                  ))}
                </div>

                <p className="text-xs text-navy/60 leading-relaxed mb-4">
                  {theme.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={saving}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply(id);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? "bg-navy text-ivory"
                    : "bg-navy/5 text-navy hover:bg-gold hover:text-white"
                }`}
              >
                {isActive
                  ? "✓ Currently Active"
                  : mode === "admin"
                  ? "Set as Store Default"
                  : "Apply Theme"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Reset footer for customer */}
      {mode === "customer" && !hasPersonalOverride && (
        <div className="mt-4 text-center text-xs text-navy/50">
          Currently following the store default ({THEMES[globalTheme].name}). Selecting any theme will save your personal preference.
        </div>
      )}
    </div>
  );
}
