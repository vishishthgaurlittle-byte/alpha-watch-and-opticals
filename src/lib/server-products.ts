import prisma from "./prisma";
import type { Product, Category } from "./types";
import { getPublishedProducts, getProductBySlug, relatedProducts, getCategories } from "./db";

export function formatDbProduct(p: any): Product {
  let specs: Record<string, string> = {};
  let images: string[] = [];
  let badges: string[] = [];

  try {
    specs = typeof p.specsJson === "string" ? JSON.parse(p.specsJson) : p.specsJson || {};
  } catch {
    specs = {};
  }

  try {
    images = typeof p.imagesJson === "string" ? JSON.parse(p.imagesJson) : p.imagesJson || [];
  } catch {
    images = ["/images/products/mens-chrono-gold.jpg"];
  }

  try {
    badges = typeof p.badgesJson === "string" ? JSON.parse(p.badgesJson) : p.badgesJson || [];
  } catch {
    badges = [];
  }

  const variants = p.variants
    ? p.variants.map((v: any) => ({
        variant_type: v.variantType,
        value: v.value,
        stock: v.stock
      }))
    : [];

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    brand: p.brand,
    category_id: p.categoryId,
    price: p.price,
    mrp: p.mrp,
    stock: p.stock,
    status: p.status as "published" | "draft",
    description: p.description,
    specs,
    images: images.length > 0 ? images : ["/images/products/mens-chrono-gold.jpg"],
    badges,
    rating: p.rating || 5.0,
    reviews_count: p.reviewsCount || 0,
    variants,
    created_at: p.createdAt ? (typeof p.createdAt.toISOString === "function" ? p.createdAt.toISOString() : p.createdAt) : new Date().toISOString(),
    updated_at: p.updatedAt ? (typeof p.updatedAt.toISOString === "function" ? p.updatedAt.toISOString() : p.updatedAt) : undefined
  };
}

export async function getPublishedProductsRSC(): Promise<Product[]> {
  try {
    const dbList = await prisma.product.findMany({
      where: { status: "published" },
      include: { variants: true },
      orderBy: { createdAt: "desc" }
    });
    if (dbList && dbList.length > 0) {
      return dbList.map(formatDbProduct);
    }
  } catch (err) {
    console.warn("Prisma getPublishedProductsRSC fallback to static seed:", err);
  }
  return getPublishedProducts();
}

export async function getProductBySlugRSC(slug: string): Promise<Product | null> {
  try {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true }
    });
    if (p) {
      if (p.status !== "published") return null;
      return formatDbProduct(p);
    }
  } catch (err) {
    console.warn("Prisma getProductBySlugRSC fallback:", err);
  }
  const fallback = getProductBySlug(slug);
  if (!fallback || fallback.status !== "published") return null;
  return fallback;
}

export async function getRelatedProductsRSC(product: Product, limit = 4): Promise<Product[]> {
  try {
    const dbList = await prisma.product.findMany({
      where: {
        status: "published",
        categoryId: product.category_id,
        id: { not: product.id }
      },
      take: limit,
      include: { variants: true }
    });
    if (dbList && dbList.length > 0) {
      return dbList.map(formatDbProduct);
    }
  } catch (err) {
    console.warn("Prisma getRelatedProductsRSC fallback:", err);
  }
  return relatedProducts(product).slice(0, limit);
}

export async function getCategoriesRSC(): Promise<Category[]> {
  try {
    const cats = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" }
    });
    if (cats && cats.length > 0) {
      return cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        sort_order: c.sortOrder
      }));
    }
  } catch (err) {
    console.warn("Prisma getCategoriesRSC fallback:", err);
  }
  return getCategories();
}
