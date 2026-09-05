import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { CANONICAL_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = CANONICAL_URL;

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/legal/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/shipping`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/returns`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 }
  ];

  // Dynamic published products
  try {
    const products = await prisma.product.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true }
    });

    for (const p of products) {
      routes.push({
        url: `${base}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8
      });
    }
  } catch (err) {
    console.error("Sitemap generation database query error:", err);
  }

  return routes;
}
