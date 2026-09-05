import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { status } = await req.json();
    const updated = await prisma.review.update({
      where: { id: params.id },
      data: { status }
    });
    return NextResponse.json({ success: true, review: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await prisma.review.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
