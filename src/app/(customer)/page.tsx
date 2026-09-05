import type { Metadata } from "next";
import { getPublishedProductsRSC } from "@/lib/server-products";
import { CANONICAL_URL, SITE } from "@/lib/site";
import HomeView from "./HomeView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "Alpha Watch & Opticals – Premium Watch House & Opticals in Raebareli"
  },
  description:
    "Explore authentic branded watches, designer sunglasses, and prescription optical eyewear in Raebareli. Certified eye testing & watch repair services at Chowdhary Complex, Degree College Chauraha.",
  alternates: {
    canonical: CANONICAL_URL
  }
};

export default async function HomePage() {
  const products = await getPublishedProductsRSC();

  const storeSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Optician", "Store"],
    "@id": `${CANONICAL_URL}/#store`,
    name: SITE.name,
    legalName: SITE.legalEntity,
    image: [
      `${CANONICAL_URL}/images/shop/shop-front.jpg`,
      `${CANONICAL_URL}/images/shop/showroom-main.jpg`
    ],
    telephone: SITE.phone,
    email: SITE.email,
    url: CANONICAL_URL,
    priceRange: "₹₹",
    founder: {
      "@type": "Person",
      name: SITE.owner
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Chowdhary Complex, Degree College Chauraha",
      addressLocality: "Raebareli",
      addressRegion: "Uttar Pradesh",
      postalCode: "229001",
      addressCountry: "IN"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 26.2303,
      longitude: 81.2409
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        opens: "10:00",
        closes: "21:00"
      }
    ],
    sameAs: [
      SITE.justdial,
      SITE.mapLink
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
      <HomeView products={products} />
    </>
  );
}
