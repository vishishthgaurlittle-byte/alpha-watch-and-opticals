"use client";
import { useState } from "react";
import { SITE } from "@/lib/site";
import { toast } from "@/store/ui";
import ThemePicker from "@/components/ThemePicker";

export default function AdminSettings() {
  const [form, setForm] = useState({
    phone: SITE.phone,
    whatsapp: SITE.whatsapp,
    email: SITE.email,
    timings: SITE.timings,
    address: SITE.address,
    legalEntity: SITE.legalEntity,
    grievanceName: SITE.grievanceName,
    deliveryThreshold: "2000",
    deliveryCharge: "100"
  });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Store settings saved ✓");
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-10">
      {/* 1. Global Store Theme Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy/5 shadow-sm">
        <ThemePicker mode="admin" />
      </div>

      {/* 2. Official Store Information */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-navy/5 shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-navy mb-1">Store Information &amp; Settings</h2>
        <p className="text-navy/50 text-sm mb-6">Official shop contact details &amp; legal identity</p>

        <form onSubmit={save} className="grid sm:grid-cols-2 gap-4 max-w-3xl">
          <label className="text-xs text-navy/60">
            Official Phone
            <input value={form.phone} onChange={set("phone")} className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 mt-1 font-medium" />
          </label>
          <label className="text-xs text-navy/60">
            WhatsApp Number (Country code included)
            <input value={form.whatsapp} onChange={set("whatsapp")} className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 mt-1 font-medium" />
          </label>
          <label className="text-xs text-navy/60">
            Official Store Email
            <input value={form.email} onChange={set("email")} className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 mt-1" />
          </label>
          <label className="text-xs text-navy/60">
            Store Timings
            <input value={form.timings} onChange={set("timings")} className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 mt-1" />
          </label>
          <label className="text-xs text-navy/60 sm:col-span-2">
            Physical Showroom Address
            <textarea value={form.address} onChange={set("address")} className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 mt-1 min-h-[60px]" />
          </label>
          <label className="text-xs text-navy/60">
            Legal Business Name
            <input value={form.legalEntity} onChange={set("legalEntity")} className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 mt-1" />
          </label>
          <label className="text-xs text-navy/60">
            Grievance Officer Name
            <input value={form.grievanceName} onChange={set("grievanceName")} className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 mt-1" />
          </label>
          <label className="text-xs text-navy/60">
            Free Delivery Minimum (₹)
            <input type="number" value={form.deliveryThreshold} onChange={set("deliveryThreshold")} className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 mt-1" />
          </label>
          <label className="text-xs text-navy/60">
            Standard Delivery Charge (₹)
            <input type="number" value={form.deliveryCharge} onChange={set("deliveryCharge")} className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 mt-1" />
          </label>
          <button type="submit" className="btn-gold sm:col-span-2 mt-2 py-3 rounded-full font-semibold">
            Save Store Settings
          </button>
        </form>
      </div>
    </div>
  );
}
