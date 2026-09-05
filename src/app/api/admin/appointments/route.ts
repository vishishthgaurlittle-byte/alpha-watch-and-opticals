import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ appointments });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}
