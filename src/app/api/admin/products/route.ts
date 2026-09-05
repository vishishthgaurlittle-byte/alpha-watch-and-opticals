import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        variants: true
      }
    });

    return NextResponse.json({ products });
  } catch (err: any) {
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

    const product = await prisma.product.create({
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

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
