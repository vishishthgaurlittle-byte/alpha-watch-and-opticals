import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        provider: true,
        blocked: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true }
        }
      }
    });
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
