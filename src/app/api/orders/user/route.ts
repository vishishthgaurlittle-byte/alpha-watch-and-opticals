import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user.id },
          { userEmail: user.email.toLowerCase() }
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: true
      }
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("User orders fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
