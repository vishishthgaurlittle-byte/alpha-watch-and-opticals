import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { blocked, role } = await req.json();

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(blocked !== undefined ? { blocked } : {}),
        ...(role !== undefined ? { role } : {})
      }
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
