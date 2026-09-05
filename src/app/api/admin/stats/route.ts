import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const [
      ordersCount,
      pendingOrdersCount,
      totalRevenueAgg,
      productsCount,
      lowStockProducts,
      appointmentsCount,
      pendingAppointmentsCount,
      messagesCount,
      recentOrders
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

    return NextResponse.json({
      ordersCount,
      pendingOrdersCount,
      totalRevenue: totalRevenueAgg._sum.total || 0,
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
