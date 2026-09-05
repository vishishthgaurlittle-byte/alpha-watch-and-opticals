import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { status } = await req.json();
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: { status }
    });
    return NextResponse.json({ success: true, appointment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}
