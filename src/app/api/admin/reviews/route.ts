import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, slug: true } }
      }
    });
    return NextResponse.json({ reviews });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
