import { notFound } from "next/navigation";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const docs: Record<string, { title: string; content: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    content: [
      `At ${SITE.name} ("we", "us", or "our"), located at Chowdhary Complex, Degree College Chauraha, Raebareli, we respect your privacy and are committed to protecting your personal data in compliance with the Digital Personal Data Protection Act (DPDPA) and Information Technology Act, 2000.`,
      "Information We Collect: When you browse our website, create an account, place an order, or book an appointment, we collect your name, mobile number, email address, delivery address, and prescription/fitting notes. For OAuth authentication, we receive your verified profile email and name.",
      "How We Use Your Data: To process and fulfill your product orders, schedule eye tests and optical consultations, provide customer service and warranty tracking, and send essential transactional updates.",
      "Data Security & Sharing: We do not sell, rent, or trade your personal information. Data is encrypted in transit and stored securely on protected database servers.",
      `Grievance Officer: In accordance with the Consumer Protection (E-Commerce) Rules, 2020, our Grievance Redressal Officer is ${SITE.grievanceName}. Email: ${SITE.grievanceEmail}, Mobile: ${SITE.phone}.`
    ]
  },
  "privacy-policy": {
    title: "Privacy Policy",
    content: [
      `At ${SITE.name} ("we", "us", or "our"), located at Chowdhary Complex, Degree College Chauraha, Raebareli, we respect your privacy and are committed to protecting your personal data in compliance with the Digital Personal Data Protection Act (DPDPA) and Information Technology Act, 2000.`,
      "Information We Collect: When you browse our website, create an account, place an order, or book an appointment, we collect your name, mobile number, email address, delivery address, and prescription/fitting notes. For OAuth authentication, we receive your verified profile email and name.",
      "How We Use Your Data: To process and fulfill your product orders, schedule eye tests and optical consultations, provide customer service and warranty tracking, and send essential transactional updates.",
      "Data Security & Sharing: We do not sell, rent, or trade your personal information. Data is encrypted in transit and stored securely on protected database servers.",
      `Grievance Officer: In accordance with the Consumer Protection (E-Commerce) Rules, 2020, our Grievance Redressal Officer is ${SITE.grievanceName}. Email: ${SITE.grievanceEmail}, Mobile: ${SITE.phone}.`
    ]
  },
  terms: {
    title: "Terms & Conditions of Service",
    content: [
      `Welcome to ${SITE.name}. By accessing our website, purchasing products, or booking services, you agree to be bound by these Terms and Conditions.`,
      "Product Authenticity & Warranty: All watches (Titan, Casio, Timex, Fastrack) and eyewear distributed through Alpha Watch & Opticals are 100% genuine and sourced through authorized brand channels. Manufacturer warranty cards are stamped upon dispatch or store handover.",
      "Order Confirmation: An order is confirmed once validated through our ordering system. For store pickup orders, items are reserved at our Chowdhary Complex counter for up to 5 business days.",
      "Pricing & Taxes: All prices listed on this website are in Indian National Rupees (INR) and are inclusive of Goods and Services Tax (GST). We reserve the right to correct any unintended typographical pricing errors.",
      "Eye Testing & Prescriptions: Free in-store computerised eye tests provide subjective optical refraction recommendations. Prescription glasses are crafted to the exact specifications provided by the customer or measured in-store."
    ]
  },
  "terms-and-conditions": {
    title: "Terms & Conditions of Service",
    content: [
      `Welcome to ${SITE.name}. By accessing our website, purchasing products, or booking services, you agree to be bound by these Terms and Conditions.`,
      "Product Authenticity & Warranty: All watches (Titan, Casio, Timex, Fastrack) and eyewear distributed through Alpha Watch & Opticals are 100% genuine and sourced through authorized brand channels. Manufacturer warranty cards are stamped upon dispatch or store handover.",
      "Order Confirmation: An order is confirmed once validated through our ordering system. For store pickup orders, items are reserved at our Chowdhary Complex counter for up to 5 business days.",
      "Pricing & Taxes: All prices listed on this website are in Indian National Rupees (INR) and are inclusive of Goods and Services Tax (GST). We reserve the right to correct any unintended typographical pricing errors.",
      "Eye Testing & Prescriptions: Free in-store computerised eye tests provide subjective optical refraction recommendations. Prescription glasses are crafted to the exact specifications provided by the customer or measured in-store."
    ]
  },
  shipping: {
    title: "Shipping & Fulfillment Policy",
    content: [
      "We offer two fulfillment modes: In-Store Pickup and Doorstep Delivery.",
      "In-Store Pickup (Chowdhary Complex, Raebareli): Pickup is free of charge. You may visit during store hours (10:00 AM – 9:00 PM, Monday to Sunday) to inspect your watch or eyewear, get free strap adjustment or custom lens fitting, and complete payment at the counter.",
      "Doorstep Delivery: We ship across Raebareli, Uttar Pradesh, and nationwide across India via trusted courier partners. Deliveries within Raebareli are completed in 1–2 business days; other locations take 3–5 business days.",
      "Shipping Fees: Orders of ₹2,000 or above qualify for Free Shipping. A standard delivery charge of ₹100 applies on lower order values.",
      "Order Tracking: Once dispatched, tracking updates and delivery notifications are provided via SMS and WhatsApp."
    ]
  },
  "shipping-and-delivery": {
    title: "Shipping & Fulfillment Policy",
    content: [
      "We offer two fulfillment modes: In-Store Pickup and Doorstep Delivery.",
      "In-Store Pickup (Chowdhary Complex, Raebareli): Pickup is free of charge. You may visit during store hours (10:00 AM – 9:00 PM, Monday to Sunday) to inspect your watch or eyewear, get free strap adjustment or custom lens fitting, and complete payment at the counter.",
      "Doorstep Delivery: We ship across Raebareli, Uttar Pradesh, and nationwide across India via trusted courier partners. Deliveries within Raebareli are completed in 1–2 business days; other locations take 3–5 business days.",
      "Shipping Fees: Orders of ₹2,000 or above qualify for Free Shipping. A standard delivery charge of ₹100 applies on lower order values.",
      "Order Tracking: Once dispatched, tracking updates and delivery notifications are provided via SMS and WhatsApp."
    ]
  },
  returns: {
    title: "Returns, Exchange & Refund Policy",
    content: [
      "At Alpha Watch & Opticals, customer satisfaction is our top priority. We provide a straightforward 7-day return and exchange policy on eligible items.",
      "Eligibility: Watches and ready sunglasses must be unworn, in pristine condition, with original brand tags, box, manual, and warranty card intact.",
      "Custom Prescription Eyewear: Because prescription optical lenses and progressive glasses are individually ground to custom optical powers, lenses cannot be returned once cut unless there is a verifiable optical manufacturing defect. Frames remain eligible for replacement.",
      "Defects on Arrival: If a watch or frame arrives damaged or malfunctioning, we will immediately repair or replace it at zero extra cost under official brand warranty.",
      `How to Request an Exchange: Contact Mohd. Shoeb on WhatsApp at ${SITE.whatsapp} or call ${SITE.phone} with your order number #${SITE.shortName}.`
    ]
  },
  "returns-and-refunds": {
    title: "Returns, Exchange & Refund Policy",
    content: [
      "At Alpha Watch & Opticals, customer satisfaction is our top priority. We provide a straightforward 7-day return and exchange policy on eligible items.",
      "Eligibility: Watches and ready sunglasses must be unworn, in pristine condition, with original brand tags, box, manual, and warranty card intact.",
      "Custom Prescription Eyewear: Because prescription optical lenses and progressive glasses are individually ground to custom optical powers, lenses cannot be returned once cut unless there is a verifiable optical manufacturing defect. Frames remain eligible for replacement.",
      "Defects on Arrival: If a watch or frame arrives damaged or malfunctioning, we will immediately repair or replace it at zero extra cost under official brand warranty.",
      `How to Request an Exchange: Contact Mohd. Shoeb on WhatsApp at ${SITE.whatsapp} or call ${SITE.phone} with your order number #${SITE.shortName}.`
    ]
  }
};

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = docs[params.slug];
  if (!doc) notFound();

  return (
    <div className="pt-24 md:pt-28 bg-ivory min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="uppercase tracking-[0.3em] text-xs font-semibold text-gold-700 mb-3">{SITE.name}</div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-8">{doc.title}</h1>
        <div className="space-y-5">
          {doc.content.map((p, i) => (
            <p key={i} className="text-navy/80 leading-relaxed text-sm md:text-base">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-navy/10 flex items-center justify-between">
          <Link href="/" className="text-gold-700 text-sm font-semibold underline">
            ← Return to Store
          </Link>
          <div className="text-xs text-navy/50">
            {SITE.legalEntity} · Chowdhary Complex, Raebareli
          </div>
        </div>
      </div>
    </div>
  );
}
