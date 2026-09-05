import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductById, upsertProduct, deleteProduct } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { name, brand, categoryId, price, mrp, stock, status, description, specs, images, badges } = body;
    let updated: any = null;

    try {
      // Find existing product first
      const existingDb = await prisma.product.findFirst({
        where: {
          OR: [{ id: params.id }, { slug: params.id }]
        }
      });

      if (existingDb) {
        updated = await prisma.product.update({
          where: { id: existingDb.id },
          data: {
            ...(name ? { name } : {}),
            ...(brand ? { brand } : {}),
            ...(categoryId ? { categoryId } : {}),
            ...(price !== undefined ? { price: Number(price) } : {}),
            ...(mrp !== undefined ? { mrp: Number(mrp) } : {}),
            ...(stock !== undefined ? { stock: Number(stock) } : {}),
            ...(status ? { status } : {}),
            ...(description !== undefined ? { description } : {}),
            ...(specs ? { specsJson: typeof specs === "string" ? specs : JSON.stringify(specs) } : {}),
            ...(images ? { imagesJson: typeof images === "string" ? images : JSON.stringify(images) } : {}),
            ...(badges ? { badgesJson: typeof badges === "string" ? badges : JSON.stringify(badges) } : {})
          }
        });
      } else {
        // Upsert if it was initially only in local memory
        const slug = (name || params.id)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const sku = "AW-" + Math.floor(1000 + Math.random() * 9000);

        updated = await prisma.product.create({
          data: {
            id: params.id.startsWith("p_") || params.id.startsWith("p-") ? params.id : undefined,
            name: name || "Alpha Exclusive Product",
            slug,
            sku,
            brand: brand || "Alpha Signature",
            categoryId: categoryId || "c-mens",
            price: Number(price || 1999),
            mrp: Number(mrp || price || 2999),
            stock: Number(stock !== undefined ? stock : 10),
            status: status || "published",
            description: description || "",
            specsJson: typeof specs === "string" ? specs : JSON.stringify(specs || {}),
            imagesJson: typeof images === "string" ? images : JSON.stringify(images || ["/images/products/mens-chrono-gold.jpg"]),
            badgesJson: typeof badges === "string" ? badges : JSON.stringify(badges || [])
          }
        });
      }
    } catch (dbErr) {
      console.warn("Prisma product update fallback:", dbErr);
    }

    // Also update in static/local memory
    const existing = getProductById(params.id);
    const updatedLocal = {
      ...(existing || {}),
      id: updated?.id || params.id,
      name: name || existing?.name || "Product",
      slug: updated?.slug || existing?.slug || params.id,
      sku: updated?.sku || existing?.sku || "AW-000",
      brand: brand || existing?.brand || "Alpha Signature",
      category_id: categoryId || existing?.category_id || "c-mens",
      price: price !== undefined ? Number(price) : existing?.price || 0,
      mrp: mrp !== undefined ? Number(mrp) : existing?.mrp || 0,
      stock: stock !== undefined ? Number(stock) : existing?.stock ?? 0,
      status: (status || existing?.status || "published") as any,
      description: description !== undefined ? description : existing?.description || "",
      specs: typeof specs === "object" ? specs : existing?.specs || {},
      images: Array.isArray(images) ? images : existing?.images || ["/images/products/mens-chrono-gold.jpg"],
      badges: Array.isArray(badges) ? badges : existing?.badges || [],
      variants: existing?.variants || [],
      rating: existing?.rating || 5.0,
      reviews_count: existing?.reviews_count || 0,
      created_at: existing?.created_at || new Date().toISOString()
    };

    upsertProduct(updatedLocal as any);
    if (!updated) updated = updatedLocal;

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error("PATCH product error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    try {
      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ id: params.id }, { slug: params.id }]
        }
      });

      if (existing) {
        // Delete dependent relations first to avoid foreign key violations
        await prisma.variant.deleteMany({
          where: { productId: existing.id }
        }).catch(() => {});

        await prisma.review.deleteMany({
          where: { productId: existing.id }
        }).catch(() => {});

        // Safely unlink or delete order items for this product
        await prisma.orderItem.deleteMany({
          where: { productId: existing.id }
        }).catch(() => {});

        await prisma.product.delete({
          where: { id: existing.id }
        });
      }
    } catch (dbErr) {
      console.warn("Prisma product delete warning:", dbErr);
    }

    // Permanently remove from memory and disk store
    deleteProduct(params.id);

    return NextResponse.json({
      success: true,
      message: "Product permanently deleted from database and catalog"
    });
  } catch (err: any) {
    console.error("DELETE product error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
