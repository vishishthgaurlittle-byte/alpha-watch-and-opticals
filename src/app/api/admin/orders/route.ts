import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllFallbackOrders } from "@/lib/orderStore";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    let orders: any[] = [];

    try {
      orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
          user: {
            select: { id: true, name: true, email: true, phone: true }
          }
        }
      });
    } catch (dbErr) {
      console.warn("Prisma admin orders query failed; loading from memory cache:", dbErr);
    }

    // Merge fallback orders (deduplicate by id or orderNumber)
    const fallbackOrders = getAllFallbackOrders();
    const existingOrderIds = new Set(orders.map((o) => o.id));
    const existingOrderNums = new Set(orders.map((o) => o.orderNumber));

    for (const fo of fallbackOrders) {
      if (!existingOrderIds.has(fo.id) && !existingOrderNums.has(fo.orderNumber)) {
        orders.push(fo);
        existingOrderIds.add(fo.id);
        existingOrderNums.add(fo.orderNumber);
      }
    }

    // Sort newest first
    orders.sort(
      (a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0)
    );

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Admin orders error:", err);
    return NextResponse.json({ error: "Failed to fetch orders", orders: getAllFallbackOrders() }, { status: 200 });
  }
}
