import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedProductsRSC, getCategoriesRSC } from "@/lib/server-products";
import ShopClient from "./ShopClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Luxury Watches, Eyewear & Sunglasses",
  description:
    "Explore our complete catalog of authentic luxury watches, prescription glasses, sunglasses, and contact lenses in Raebareli. Guaranteed genuine products with warranty."
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getPublishedProductsRSC(),
    getCategoriesRSC()
  ]);

  return (
    <Suspense fallback={<div className="pt-28 min-h-screen bg-ivory" />}>
      <ShopClient initialProducts={products} categories={categories} />
    </Suspense>
  );
}
