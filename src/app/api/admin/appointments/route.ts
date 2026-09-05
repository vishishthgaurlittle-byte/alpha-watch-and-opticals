import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    let appointments: any[] = [];
    try {
      appointments = await prisma.appointment.findMany({
        orderBy: { createdAt: "desc" }
      });
    } catch (dbErr) {
      console.warn("Appointments query warning:", dbErr);
    }
    return NextResponse.json({ appointments });
  } catch (err: any) {
    return NextResponse.json({ appointments: [] }, { status: 200 });
  }
}
