import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    let reviews: any[] = [];
    try {
      reviews = await prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, slug: true } }
        }
      });
    } catch (dbErr) {
      console.warn("Reviews query warning:", dbErr);
    }
    return NextResponse.json({ reviews });
  } catch (err: any) {
    return NextResponse.json({ reviews: [] }, { status: 200 });
  }
}
