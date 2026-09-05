import Link from "next/link";
import Logo from "./Logo";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-ivory mt-auto pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="text-sm text-ivory/60 mt-4 leading-relaxed">
            {SITE.tagline}. Authorized timepieces &amp; precision optical care at Chowdhary Complex,
            Degree College Chauraha, Raebareli since {SITE.founded}.
          </p>
          <div className="flex gap-3 mt-5">
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gold hover:bg-gold hover:text-navy transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 00-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1012 2zm5.7 14.2c-.2.7-1.3 1.3-1.9 1.4-.5.1-1.1.2-3.6-.8-3-1.2-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3.1s.8-2.2 1.1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5s.8 2 .9 2.1c.1.1.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.1 1.4 2.4 1.5.3.2.5.1.7-.1l1-1.2c.2-.3.5-.2.8-.1s2 .9 2.3 1.1c.3.1.5.2.6.4.1.2.1.7-.1 1.4z" />
              </svg>
            </a>
            <a
              href={`tel:${SITE.phoneHref}`}
              aria-label="Call"
              className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gold hover:bg-gold hover:text-navy transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3l2 5-2 1a12 12 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 5z"
                />
              </svg>
            </a>
            <a
              href={`mailto:${SITE.email}`}
              aria-label="Email"
              className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gold hover:bg-gold hover:text-navy transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
              </svg>
            </a>
            <a
              href={SITE.justdial}
              target="_blank"
              rel="noreferrer"
              aria-label="Justdial"
              className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-gold hover:bg-gold hover:text-navy transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2 4h4l-3 3 1 5-4-3-4 3 1-5-3-3h4z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-4">Shop Collection</h4>
          <ul className="space-y-2 text-sm text-ivory/60">
            {SITE.categories.map((c) => (
              <li key={c.slug}>
                <Link href={c.href} className="hover:text-gold transition">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-ivory/60">
            <li>
              <Link href="/about" className="hover:text-gold transition">
                About Our Heritage
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-gold transition">
                Services &amp; Eye Testing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gold transition">
                Store Location &amp; Contact
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-gold transition">
                Customer Account
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-gold transition">
                Shopping Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg mb-4">Store Location</h4>
          <ul className="space-y-2 text-sm text-ivory/60">
            <li>{SITE.address}</li>
            <li>
              <a href={`tel:${SITE.phoneHref}`} className="hover:text-gold">
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-gold">
                {SITE.email}
              </a>
            </li>
            <li className="text-ivory/40">{SITE.timings}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between text-xs text-ivory/40 gap-2">
          <span>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/legal/privacy" className="hover:text-gold">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-gold">
              Terms of Service
            </Link>
            <Link href="/legal/shipping" className="hover:text-gold">
              Shipping Policy
            </Link>
            <Link href="/legal/returns" className="hover:text-gold">
              Returns &amp; Refund
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
