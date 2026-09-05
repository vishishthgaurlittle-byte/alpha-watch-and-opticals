import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllFallbackOrders } from "@/lib/orderStore";
import { getAllProducts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    let ordersCount = 0;
    let pendingOrdersCount = 0;
    let totalRevenue = 0;
    let productsCount = 0;
    let lowStockProducts: any[] = [];
    let appointmentsCount = 0;
    let pendingAppointmentsCount = 0;
    let messagesCount = 0;
    let recentOrders: any[] = [];

    try {
      const [
        oCount,
        pendingOCount,
        revAgg,
        pCount,
        lowStock,
        aCount,
        pendingACount,
        mCount,
        dbRecent
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentStatus: "paid" }
        }),
        prisma.product.count({ where: { status: "published" } }),
        prisma.product.findMany({
          where: { stock: { lte: 5 }, status: "published" },
          take: 5
        }),
        prisma.appointment.count(),
        prisma.appointment.count({ where: { status: "pending" } }),
        prisma.contactMessage.count({ where: { status: "new" } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { items: true }
        })
      ]);

      ordersCount = oCount;
      pendingOrdersCount = pendingOCount;
      totalRevenue = revAgg._sum.total || 0;
      productsCount = pCount;
      lowStockProducts = lowStock;
      appointmentsCount = aCount;
      pendingAppointmentsCount = pendingACount;
      messagesCount = mCount;
      recentOrders = dbRecent;
    } catch (dbErr) {
      console.warn("Prisma stats query failed, loading from memory fallbacks:", dbErr);
    }

    // Merge fallback orders
    const fallbackOrders = getAllFallbackOrders();
    const existingOrderIds = new Set(recentOrders.map((o) => o.id));

    for (const fo of fallbackOrders) {
      if (!existingOrderIds.has(fo.id)) {
        recentOrders.push(fo);
        existingOrderIds.add(fo.id);
        ordersCount++;
        if (fo.status === "pending") pendingOrdersCount++;
        if (fo.paymentStatus === "paid") totalRevenue += fo.total;
      }
    }

    recentOrders.sort(
      (a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0)
    );
    recentOrders = recentOrders.slice(0, 10);

    // Fallback products count if 0
    if (productsCount === 0) {
      const staticProds = getAllProducts().filter((p) => p.status === "published");
      productsCount = staticProds.length;
      lowStockProducts = staticProds.filter((p) => p.stock <= 5);
    }

    return NextResponse.json({
      ordersCount,
      pendingOrdersCount,
      totalRevenue,
      productsCount,
      lowStockProducts,
      appointmentsCount,
      pendingAppointmentsCount,
      messagesCount,
      recentOrders
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
