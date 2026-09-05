"use client";
import { useState } from "react";
import { SITE } from "@/lib/site";
import { toast } from "@/store/ui";

export default function ContactClient() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "", hp: "" });
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const [appointment, setAppointment] = useState({
    name: "",
    phone: "",
    email: "",
    preferredDate: "",
    serviceType: "Eye Test",
    hp: ""
  });
  const [isBooking, setIsBooking] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingMessage(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");

      toast("Message sent successfully ✓ We'll get back to you soon.");
      setMessageSent(true);
      setForm({ name: "", phone: "", email: "", message: "", hp: "" });
    } catch (err: any) {
      toast(err.message || "Could not send message. Please call us.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const submitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book appointment");

      toast("Appointment requested ✓ We will confirm your slot via phone.");
      setAppointmentBooked(true);
      setAppointment({ name: "", phone: "", email: "", preferredDate: "", serviceType: "Eye Test", hp: "" });
    } catch (err: any) {
      toast(err.message || "Failed to book appointment. Please call us directly.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
      <div>
        <div className="uppercase tracking-[0.3em] text-xs font-semibold text-gold-700 mb-3">Contact</div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">Get in Touch</h1>
        <p className="text-navy/70 mb-6">
          Visit our store, call us, or drop a message — our master optometrists and horologists are here to help.
        </p>

        <div className="space-y-4 mb-8">
          <ContactLine icon="📍" label="Address" value={SITE.address} />
          <ContactLine icon="📞" label="Phone" value={SITE.phone} href={`tel:${SITE.phoneHref}`} />
          <ContactLine icon="💬" label="WhatsApp" value={`+${SITE.whatsapp}`} href={`https://wa.me/${SITE.whatsapp}`} />
          <ContactLine icon="✉️" label="Email" value={SITE.email} href={`mailto:${SITE.email}`} />
          <ContactLine icon="🕙" label="Timings" value={SITE.timings} />
        </div>

        <a
          href={SITE.justdial}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-sm text-gold-700 font-medium underline mb-6"
        >
          View us on Justdial →
        </a>

        <div className="rounded-2xl overflow-hidden border border-navy/10 shadow-card">
          <iframe
            src={SITE.mapEmbed}
            title="Alpha Watch & Opticals Google Map"
            className="w-full h-64 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Contact Form */}
        <form onSubmit={submitContact} className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
          <h3 className="font-serif text-lg text-navy mb-4">Send a Message</h3>
          {messageSent && (
            <div className="bg-emerald/10 text-emerald rounded-xl p-3 mb-4 text-sm font-medium">
              ✓ Your message has been sent to our store team.
            </div>
          )}
          {/* Honeypot hidden field */}
          <input
            type="text"
            name="hp"
            value={form.hp}
            onChange={(e) => setForm((f) => ({ ...f, hp: e.target.value }))}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-navy/70 text-xs mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
              />
            </div>
            <div>
              <label className="block text-navy/70 text-xs mb-1">Phone</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                placeholder="10-digit mobile number"
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-navy/70 text-xs mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email address"
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-navy/70 text-xs mb-1">Message</label>
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="How can we help you?"
                className="input-premium bg-white text-navy placeholder:text-navy/40 border-navy/15 min-h-[90px]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSendingMessage}
            className="btn-gold w-full mt-4 py-3 rounded-full font-semibold disabled:opacity-50"
          >
            {isSendingMessage ? "Sending Message..." : "Send Message"}
          </button>
        </form>

        {/* Appointment Form */}
        <form onSubmit={submitAppointment} className="bg-navy-950 text-ivory rounded-2xl p-6 shadow-card">
          <h3 className="font-serif text-lg mb-2">Book In-Store Eye Test or Service</h3>
          <p className="text-xs text-ivory/60 mb-4">
            Free computerised eye testing, progressive lens fitting, or luxury watch servicing.
          </p>

          {appointmentBooked ? (
            <div className="bg-emerald/20 text-emerald rounded-xl p-4 text-sm font-medium">
              ✓ Appointment requested! We will call you at your preferred time to confirm your visit.
            </div>
          ) : (
            <>
              {/* Honeypot */}
              <input
                type="text"
                name="hp"
                value={appointment.hp}
                onChange={(e) => setAppointment((f) => ({ ...f, hp: e.target.value }))}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-ivory/70 text-xs mb-1">Full name</label>
                  <input
                    required
                    value={appointment.name}
                    onChange={(e) => setAppointment((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Full name"
                    className="input-premium input-dark bg-white/10 border-white/25 text-ivory placeholder:text-ivory/55"
                  />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Phone</label>
                  <input
                    required
                    type="tel"
                    value={appointment.phone}
                    onChange={(e) =>
                      setAppointment((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))
                    }
                    placeholder="10-digit mobile number"
                    className="input-premium input-dark bg-white/10 border-white/25 text-ivory placeholder:text-ivory/55"
                  />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Preferred Date</label>
                  <input
                    required
                    type="date"
                    value={appointment.preferredDate}
                    onChange={(e) => setAppointment((f) => ({ ...f, preferredDate: e.target.value }))}
                    className="input-premium input-dark bg-white/10 border-white/25 text-ivory placeholder:text-ivory/55"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-ivory/70 text-xs mb-1">Service Type</label>
                  <select
                    value={appointment.serviceType}
                    onChange={(e) => setAppointment((f) => ({ ...f, serviceType: e.target.value }))}
                    className="input-premium input-dark bg-[var(--surface)] border-white/25 text-ivory"
                  >
                    <option value="Eye Test" className="bg-navy-950 text-ivory">Computerised Eye Testing (Free)</option>
                    <option value="Contact Lens Fitting" className="bg-navy-950 text-ivory">Contact Lens Trial &amp; Fitting</option>
                    <option value="Progressive Lens Consultation" className="bg-navy-950 text-ivory">Progressive Lens Consultation</option>
                    <option value="Watch Repair" className="bg-navy-950 text-ivory">Watch Repair &amp; Restoration</option>
                    <option value="Battery & Strap Sizing" className="bg-navy-950 text-ivory">Battery Replacement / Strap Sizing</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="btn-gold w-full sm:col-span-2 mt-2 py-3 rounded-full font-semibold disabled:opacity-50"
                >
                  {isBooking ? "Booking Appointment..." : "Book In-Store Slot"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function ContactLine({
  icon,
  label,
  value,
  href
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-navy/40">{label}</div>
        {href ? (
          <a href={href} className="text-navy font-medium hover:text-gold-700">
            {value}
          </a>
        ) : (
          <div className="text-navy font-medium">{value}</div>
        )}
      </div>
    </div>
  );
}
