import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    let messages: any[] = [];
    try {
      messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" }
      });
    } catch (dbErr) {
      console.warn("Messages query warning:", dbErr);
    }
    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ messages: [] }, { status: 200 });
  }
}
