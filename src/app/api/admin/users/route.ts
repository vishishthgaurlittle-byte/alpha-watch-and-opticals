import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllFallbackOrders } from "@/lib/orderStore";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    let users: any[] = [];

    try {
      users = await prisma.user.findMany({
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
    } catch (dbErr) {
      console.warn("Prisma admin users query failed; merging fallback customers:", dbErr);
    }

    // Include the owner admin if not present
    const adminEmail = (process.env.ADMIN_EMAIL || "vishishthgaurlittle@gmail.com").toLowerCase().trim();
    if (!users.some((u) => u.email.toLowerCase() === adminEmail)) {
      users.unshift({
        id: "admin-owner-id",
        name: "Little Vishishth Gaur",
        email: adminEmail,
        phone: "+919044477735",
        role: "admin",
        provider: "google",
        blocked: false,
        createdAt: new Date().toISOString(),
        _count: { orders: 0, reviews: 0 }
      });
    }

    // Merge customers who placed orders in memory
    const fallbackOrders = getAllFallbackOrders();
    const existingEmails = new Set(users.map((u) => u.email.toLowerCase()));

    for (const fo of fallbackOrders) {
      const email = fo.userEmail.toLowerCase();
      if (!existingEmails.has(email)) {
        existingEmails.add(email);
        users.push({
          id: fo.userId || `cust_${fo.id}`,
          name: fo.userName,
          email: fo.userEmail,
          phone: fo.userPhone,
          role: "customer",
          provider: "checkout",
          blocked: false,
          createdAt: fo.createdAt,
          _count: { orders: 1, reviews: 0 }
        });
      }
    }

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("Admin users error:", err);
    return NextResponse.json({ error: "Failed to fetch users", users: [] }, { status: 200 });
  }
}
