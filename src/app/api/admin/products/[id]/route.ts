import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { name, brand, categoryId, price, mrp, stock, status, description, specs, images, badges } = body;

    const updated = await prisma.product.update({
      where: { id: params.id },
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

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await prisma.product.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
