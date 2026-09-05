import Link from "next/link";
import { SITE } from "@/lib/site";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata = { title: "Services" };

const services = [
  { icon: "⌚", t: "Watch Repair & Servicing", d: "Expert horological servicing, movement cleaning and mechanical repair for luxury & quartz watches.", price: "From ₹200", note: "Genuine parts · quick turnaround", img: "/images/shop/watch-repair-workbench.jpg" },
  { icon: "🔋", t: "Battery Replacement", d: "Swiss/Japanese battery replacement with ultrasonic cleaning and gasket water-resistance testing.", price: "From ₹150", note: "While you wait (10 mins)", img: "/images/shop/interior-watches.jpg" },
  { icon: "📏", t: "Strap Sizing & Polish", d: "Free precision bracelet link adjustment, leather strap fitting and ultrasonic case polish.", price: "Free", note: "Complimentary service", img: "/images/products/watch-strap.jpg" },
  { icon: "👁", t: "Computerised Eye Testing", d: "Advanced autorefractor & phoropter eye examinations by certified optical specialists.", price: "Free with frame", note: "Walk-ins & appointments", img: "/images/shop/eye-testing-clinic.jpg" },
  { icon: "🕶", t: "Contact Lens Consultation", d: "Trial lenses, corneal measurement and personalised lens fitting with hygiene training.", price: "Free trial", note: "Daily, monthly & toric", img: "/images/products/contact-lens.jpg" },
  { icon: "🪄", t: "Custom Lens Fitting", d: "High-index, Blue-cut digital protection, anti-glare, progressive & photochromic transitions.", price: "From ₹500", note: "Precision edged on-site", img: "/images/shop/interior-opticals.jpg" }
];

export default function ServicesPage() {
  return (
    <div className="pt-24 md:pt-28 bg-ivory">
      {/* hero banner */}
      <section className="relative overflow-hidden bg-navy-950 text-ivory">
        <img src="/images/shop/interior-opticals.jpg" alt="services" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 to-navy-950" />
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="uppercase tracking-[0.3em] text-xs text-gold mb-3">Our Expertise</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold">Watch &amp; Vision Care Services</h1>
          <p className="text-ivory/70 mt-4 max-w-2xl mx-auto">
            From precision horological watch repairs to computerized eye exams — certified care at Chowdhary Complex, Degree College Chauraha, Raebareli.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <SectionHeading eyebrow="Comprehensive Care" title="Expert Services" subtitle="Every piece and prescription handled with genuine care and precision tools." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.t} className="bg-white rounded-2xl overflow-hidden border border-navy/5 shadow-sm card-shine flex flex-col">
              <div className="h-44 overflow-hidden bg-navy/5">
                <img src={s.img} alt={s.t} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{s.icon}</span>
                    <h3 className="font-serif text-lg text-navy font-bold">{s.t}</h3>
                  </div>
                  <p className="text-sm text-navy/70 leading-relaxed mb-4">{s.d}</p>
                </div>
                <div className="pt-3 border-t border-navy/10 flex items-center justify-between text-xs">
                  <span className="text-gold-700 font-bold text-sm">{s.price}</span>
                  <span className="text-navy/50">{s.note}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* in-store banner */}
        <div className="mt-16 bg-navy-950 text-ivory rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-gold uppercase tracking-widest text-xs mb-2">Free Walk-in Consultations</div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-4">Visit Us at Chowdhary Complex</h2>
            <p className="text-ivory/70 text-sm leading-relaxed mb-6">
              Our optical experts and master watch technician are available 7 days a week. Walk in for a free eye check or watch assessment.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-gold px-7 py-3 rounded-full font-semibold">Book an Appointment</Link>
              <a href={`tel:${SITE.phoneHref}`} className="px-6 py-3 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition font-semibold">Call Store</a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-video shadow-card">
            <img src="/images/shop/shop-front.jpg" alt="storefront" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
