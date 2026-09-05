"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { SITE } from "@/lib/site";
import SectionHeading from "@/components/ui/SectionHeading";
import ProductCard from "@/components/product/ProductCard";
import NewsletterClient from "@/components/NewsletterClient";

export default function HomeView({ products }: { products: Product[] }) {
  const featured = products.filter((p) => p.badges && p.badges.includes("Best Seller"));
  const newArrivals = products.slice(0, 4);
  const bestSellers = featured.length ? featured : products.slice(0, 4);

  return (
    <div className="bg-ivory">
      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-navy-950 text-ivory">
        {/* bg image */}
        <div className="absolute inset-0 opacity-30">
          <img src="/images/products/mens-chrono-gold.jpg" alt="Alpha Watch Hero" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 to-transparent" />

        {/* particles */}
        <HeroParticles />

        <div className="relative max-w-7xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-widest text-gold mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Authorized Watch House &amp; Optical Center
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
            >
              Timeless Watches.
              <br />
              <span className="gold-text">Perfect Vision.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-5 text-ivory/70 max-w-md leading-relaxed"
            >
              Discover authentic branded timepieces and precision optical eyewear in Raebareli. Certified
              computerised eye testing, precision lens fitting &amp; expert watch repair by Mohd. Shoeb.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/shop?cat=mens-watches" className="btn-gold px-6 py-3.5 rounded-full font-semibold">
                Shop Watches
              </Link>
              <Link
                href="/shop?cat=optical-glasses"
                className="px-6 py-3.5 rounded-full font-semibold border border-gold/50 text-gold hover:bg-gold/10 transition"
              >
                Shop Eyewear
              </Link>
            </motion.div>

            {/* trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-ivory/70"
            >
              <Trust icon="✓" label="100% Genuine Brands" />
              <Trust icon="👁" label="Titan &amp; Fastrack Eyewear" />
              <Trust icon="⚙" label="Watch Repair &amp; Service" />
            </motion.div>
          </div>

          {/* real physical showroom showcase */}
          <div className="hidden md:flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-3xl blur-2xl bg-gold/20" />
              <img
                src="/images/shop/showroom-main.jpg"
                alt="Alpha Watch & Opticals physical showroom in Raebareli"
                className="relative w-96 aspect-[4/3] object-cover rounded-3xl ring-4 ring-gold/30 shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ AUTHORIZED BRANDS STRIP ============ */}
      <section className="bg-navy-900 border-y border-white/10 py-5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-center">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">Authorized Retailer:</span>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm md:text-base font-serif font-bold text-ivory/80">
            {SITE.brands.map((b) => (
              <span key={b} className="hover:text-gold transition cursor-default">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATEGORY CARDS ============ */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4">
        <SectionHeading
          eyebrow="Explore"
          title="Shop by Category"
          subtitle="Watches, eyewear and accessories for every style and need."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SITE.categories.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Link href={c.href} className="group block text-center">
                <div className="aspect-square rounded-2xl overflow-hidden bg-navy/5 card-shine relative">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-navy-950/10 group-hover:bg-navy-950/0 transition" />
                </div>
                <div className="mt-3 text-sm font-medium text-navy group-hover:text-gold-700">{c.name}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED / BEST SELLERS ============ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            eyebrow="Handpicked"
            title="Best Sellers"
            subtitle="Our customers' most loved timepieces &amp; eyewear."
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {bestSellers.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-gold-700 font-semibold hover:gap-3 transition-all"
            >
              View All Products <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="py-16 md:py-20 bg-navy-950 text-ivory">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            light
            eyebrow="Our Services"
            title="More Than Just Shopping"
            subtitle="Complete care for your watches and your eyes — from expert repairs to precision eye tests."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SITE.services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-6 hover:border-gold/40 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center text-gold mb-4">
                  <ServiceIcon name={s.icon} />
                </div>
                <h3 className="font-serif text-lg mb-1.5">{s.title}</h3>
                <p className="text-sm text-ivory/60">{s.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-gold font-semibold hover:gap-3 transition-all"
            >
              Explore All Services <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ NEW ARRIVALS ============ */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <SectionHeading eyebrow="Fresh In" title="New Arrivals" subtitle="The latest pieces to land in our store." />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {newArrivals.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* ============ ABOUT SNIPPET ============ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-card">
              <img
                src="/images/shop/shop-front.jpg"
                alt={`${SITE.name} Chowdhary Complex store`}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 md:-right-6 bg-navy-950 text-ivory rounded-2xl px-6 py-4 shadow-card max-w-[200px]">
              <div className="font-serif text-3xl text-gold">Since {SITE.founded}</div>
              <div className="text-xs text-ivory/60 mt-1">Serving Raebareli with quality watches &amp; optical care.</div>
            </div>
          </div>
          <div>
            <div className="uppercase tracking-[0.3em] text-xs font-semibold text-gold-700 mb-3">About the Store</div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">
              Your Trusted Watch &amp; Optical Destination
            </h2>
            <p className="text-navy/70 leading-relaxed mb-4">
              Alpha Watch &amp; Opticals is a trusted destination located at Chowdhary Complex, Degree College
              Chauraha, Raebareli. We offer genuine Titan, Casio, Fastrack, and Timex timepieces alongside
              prescription frames, blue-cut computer lenses, and sunglasses.
            </p>
            <p className="text-navy/70 leading-relaxed mb-6">
              Our store features certified optometrists for computerised eye testing, contact lens trials, and
              master watchmakers for precision battery replacements and mechanical repairs.
            </p>
            <Link href="/about" className="btn-gold px-6 py-3 rounded-full font-semibold inline-block">
              Read Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ============ GALLERY ============ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading
            eyebrow="Real Store Photos"
            title="A Glimpse Inside Alpha Watch &amp; Opticals"
            subtitle="Explore our authentic physical showroom at Chowdhary Complex, Degree College Chauraha, Raebareli."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { src: "gallery-1", label: "Storefront Signboard (TITAN CASIO ALPHA)" },
              { src: "gallery-2", label: "Main Showroom & Glass Counters" },
              { src: "gallery-3", label: "Illuminated Optical Frames Showcase" },
              { src: "gallery-4", label: "Wall Clocks Gallery Wall" },
              { src: "gallery-5", label: "SKINN Finely Crafted Perfumes" },
              { src: "gallery-6", label: "Fire-Boltt Smartwatches Display" },
              { src: "gallery-7", label: "Fastrack Sunglasses Rack" },
              { src: "gallery-8", label: "Titan & Casio Watch Showcases" },
              { src: "gallery-9", label: "Designer Spectacle Frames Shelves" },
              { src: "gallery-10", label: "Glass Eyewear Cabinets" },
              { src: "gallery-11", label: "Wristwatch Collection Showcase" },
              { src: "visiting-card", label: "Mohd. Shoeb Store Visiting Card" }
            ].map((g) => (
              <div
                key={g.src}
                className="rounded-2xl overflow-hidden aspect-square group shadow-sm relative bg-navy/5"
              >
                <img
                  src={`/images/gallery/${g.src}.jpg`}
                  alt={g.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 via-navy-950/40 to-transparent p-3 pt-6 text-ivory text-xs font-medium">
                  {g.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LOCATION ============ */}
      <section className="py-16 max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="uppercase tracking-[0.3em] text-xs font-semibold text-gold-700 mb-3">Visit Us</div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">Find Us in Raebareli</h2>
          <p className="text-navy/70 mb-5">{SITE.address}</p>
          <ul className="space-y-3 text-navy/70 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-gold">⌚</span> Mon – Sun: 10:00 AM – 9:00 PM
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gold">📞</span> {SITE.phone}
            </li>
            <li className="flex items-center gap-2">
              <span className="text-gold">💬</span> WhatsApp at {SITE.whatsapp}
            </li>
          </ul>
          <div className="mt-6 flex gap-3">
            <Link href="/contact" className="btn-gold px-6 py-3 rounded-full font-semibold">
              Get Directions
            </Link>
            <a
              href={SITE.justdial}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full font-semibold border border-navy/15 text-navy hover:border-gold hover:text-gold-700 transition"
            >
              Justdial
            </a>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-card border border-navy/10">
          <iframe
            src={SITE.mapEmbed}
            title="Alpha Watch & Opticals location map"
            className="w-full h-80 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <NewsletterClient />
    </div>
  );
}

function Trust({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-gold">{icon}</span>
      {label}
    </span>
  );
}

function HeroParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold/40"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${(i * 43) % 100}%`,
            top: `${(i * 67) % 100}%`
          }}
          animate={{ y: [0, -40, 0], opacity: [0.1, 0.7, 0.1] }}
          transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function ServiceIcon({ name }: { name: string }) {
  const viewBox = "0 0 24 24";
  const icons: Record<string, string> = {
    watch: "M12 8a2 2 0 100 4 2 2 0 000-4zm0-5v3m0 10v3M4 12H1m22 0h-3M6 6l2 2m8 8 2 2M6 18l2-2m8-8 2-2M12 2a10 10 0 100 20 10 10 0 000-20zm0 5v5l3 2",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10-3a3 3 0 100 6 3 3 0 000-6z",
    lens: "M8 4h8l2 2h4a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V7a1 1 0 011-1h4l2-2zm4 14a5 5 0 100-10 5 5 0 000 10z",
    battery: "M7 7h10a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2zm13 3v4h1a1 1 0 001-1v-2a1 1 0 00-1-1h-1z",
    strap: "M4 7h16M4 17h16M7 7c0 4 10 4 10 0m-10 10c0-4 10-4 10 0",
    lens2: "M12 4v3m0 10v3M9 6h6M2 4l2 7a3 3 0 106 0l2-7M2 4h8M12 12a6 6 0 100 12 6 6 0 000-12z"
  };
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox={viewBox} strokeWidth="1.6">
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[name] || icons.watch} />
    </svg>
  );
}
