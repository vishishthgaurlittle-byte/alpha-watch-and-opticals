"use client";
import ThemePicker from "@/components/ThemePicker";

export default function AdminThemePage() {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy/5 shadow-sm">
      <ThemePicker mode="admin" />
    </div>
  );
}
