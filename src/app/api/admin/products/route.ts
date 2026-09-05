import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllProducts, upsertProduct, getDB } from "@/lib/db";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const deleted = getDB().deletedProductIds || [];
    let products: any[] = [];

    try {
      products = await prisma.product.findMany({
        where: {
          id: { notIn: deleted },
          slug: { notIn: deleted }
        },
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          variants: true
        }
      });
    } catch (dbErr) {
      console.warn("Prisma admin products query failed; using catalog fallback:", dbErr);
    }

    // If database returned no products AND no products have been deleted yet, populate initial catalog
    if ((!products || products.length === 0) && deleted.length === 0) {
      const staticProds = getAllProducts();
      products = staticProds.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        brand: p.brand,
        categoryId: p.category_id,
        category: {
          id: p.category_id,
          name: p.category_id === "c-mens" ? "Men's Watches" : p.category_id === "c-womens" ? "Women's Watches" : "Eyewear",
          slug: p.category_id
        },
        price: p.price,
        mrp: p.mrp,
        stock: p.stock,
        status: p.status,
        description: p.description,
        specsJson: JSON.stringify(p.specs || {}),
        imagesJson: JSON.stringify(p.images || []),
        badgesJson: JSON.stringify(p.badges || []),
        rating: p.rating,
        reviewsCount: p.reviews_count,
        createdAt: p.created_at,
        variants: (p.variants || []).map((v) => ({
          id: `var-${p.id}-${v.value}`,
          productId: p.id,
          variantType: v.variant_type,
          value: v.value,
          stock: v.stock
        }))
      }));
    }

    return NextResponse.json({ products: products || [] });
  } catch (err: any) {
    console.error("Admin products error:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { name, brand, categoryId, price, mrp, stock, status, description, specs, images, badges } = body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const sku = "AW-" + Math.floor(1000 + Math.random() * 9000);
    const productId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    let createdProduct: any = null;

    try {
      createdProduct = await prisma.product.create({
        data: {
          name,
          slug,
          sku,
          brand: brand || "Alpha Signature",
          categoryId: categoryId || "c-mens",
          price: Number(price),
          mrp: Number(mrp || price),
          stock: Number(stock || 0),
          status: status || "published",
          description: description || "",
          specsJson: typeof specs === "string" ? specs : JSON.stringify(specs || {}),
          imagesJson: typeof images === "string" ? images : JSON.stringify(images || ["/images/products/mens-chrono-gold.jpg"]),
          badgesJson: typeof badges === "string" ? badges : JSON.stringify(badges || [])
        }
      });
    } catch (dbErr) {
      console.warn("Prisma create product fallback:", dbErr);
      createdProduct = {
        id: productId,
        name,
        slug,
        sku,
        brand: brand || "Alpha Signature",
        categoryId: categoryId || "c-mens",
        price: Number(price),
        mrp: Number(mrp || price),
        stock: Number(stock || 0),
        status: status || "published",
        description: description || "",
        specsJson: typeof specs === "string" ? specs : JSON.stringify(specs || {}),
        imagesJson: typeof images === "string" ? images : JSON.stringify(images || ["/images/products/mens-chrono-gold.jpg"]),
        badgesJson: typeof badges === "string" ? badges : JSON.stringify(badges || []),
        rating: 5.0,
        reviewsCount: 0,
        createdAt: nowIso
      };
    }

    // Mirror to static store
    try {
      upsertProduct({
        id: createdProduct.id,
        name: createdProduct.name,
        slug: createdProduct.slug,
        sku: createdProduct.sku,
        brand: createdProduct.brand,
        category_id: createdProduct.categoryId || "c-mens",
        price: createdProduct.price,
        mrp: createdProduct.mrp,
        stock: createdProduct.stock,
        status: createdProduct.status as any,
        description: createdProduct.description,
        specs: typeof specs === "object" ? specs : {},
        images: Array.isArray(images) ? images : ["/images/products/mens-chrono-gold.jpg"],
        badges: Array.isArray(badges) ? badges : [],
        variants: [],
        rating: 5.0,
        reviews_count: 0,
        created_at: nowIso
      });
    } catch {}

    return NextResponse.json({ success: true, product: createdProduct });
  } catch (err: any) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
