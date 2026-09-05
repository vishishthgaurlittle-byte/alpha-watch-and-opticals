import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { status } = await req.json();
    const updated = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { status }
    });
    return NextResponse.json({ success: true, message: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update message status" }, { status: 500 });
  }
}
