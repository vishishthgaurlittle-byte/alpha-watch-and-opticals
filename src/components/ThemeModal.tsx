"use client";
import React from "react";
import ThemePicker from "./ThemePicker";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-ivory rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-navy/5 text-navy flex items-center justify-center text-lg hover:bg-navy/10 transition"
          aria-label="Close"
        >
          ✕
        </button>

        <ThemePicker mode="customer" onComplete={onClose} />
      </div>
    </div>
  );
}
