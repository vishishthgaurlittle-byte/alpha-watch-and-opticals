import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFallbackOrdersByUser } from "@/lib/orderStore";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let orders: any[] = [];

    try {
      orders = await prisma.order.findMany({
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
    } catch (dbErr) {
      console.warn("Prisma user orders query failed, reading fallback cache:", dbErr);
    }

    // Merge in-memory fallback orders
    const fallbackOrders = getFallbackOrdersByUser(user.id).concat(
      getFallbackOrdersByUser(user.email)
    );

    const existingIds = new Set(orders.map((o) => o.id));
    for (const fo of fallbackOrders) {
      if (!existingIds.has(fo.id)) {
        orders.push(fo);
        existingIds.add(fo.id);
      }
    }

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("User orders fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
