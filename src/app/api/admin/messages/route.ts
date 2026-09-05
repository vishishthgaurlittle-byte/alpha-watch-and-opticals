import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
