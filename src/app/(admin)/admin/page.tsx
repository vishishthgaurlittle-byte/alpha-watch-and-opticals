"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR, dateFmt } from "@/lib/site";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Total Revenue",
      value: formatINR(stats?.totalRevenue || 0),
      icon: "💰",
      sub: "From confirmed orders"
    },
    {
      label: "Total Orders",
      value: stats?.ordersCount || 0,
      icon: "🧾",
      sub: `${stats?.pendingOrdersCount || 0} pending processing`
    },
    {
      label: "Active Products",
      value: stats?.productsCount || 0,
      icon: "📦",
      sub: "Published in catalog"
    },
    {
      label: "Appointments",
      value: stats?.appointmentsCount || 0,
      icon: "👁️",
      sub: `${stats?.pendingAppointmentsCount || 0} pending slots`
    }
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-1">Store Dashboard</h1>
      <p className="text-navy/50 text-sm mb-6">Alpha Watch &amp; Opticals administration &amp; real-time operations</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-navy/5">
            <div className="text-2xl mb-2">{c.icon}</div>
            <div className="text-xl font-bold text-navy">{loading ? "..." : c.value}</div>
            <div className="text-xs text-navy/50 mt-0.5">{c.label}</div>
            <div className="text-[11px] text-gold-700 mt-1 font-medium">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Low stock alerts */}
        <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
          <h3 className="font-serif text-lg text-navy mb-4">Low Stock Inventory</h3>
          {!stats?.lowStockProducts || stats.lowStockProducts.length === 0 ? (
            <p className="text-navy/50 text-sm">All inventory healthy. No low stock items.</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-navy truncate pr-2 font-medium">{p.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      p.stock <= 3 ? "bg-red-50 text-red-600" : "bg-gold/10 text-gold-700"
                    }`}
                  >
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations Strip */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
          <h3 className="font-serif text-lg text-navy mb-4">Quick Operations</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/admin/orders"
              className="p-4 rounded-xl border border-navy/10 hover:border-gold transition bg-navy/5 block"
            >
              <div className="text-2xl mb-1">📦</div>
              <div className="font-semibold text-navy text-sm">Manage Orders</div>
              <div className="text-xs text-navy/50 mt-1">Update dispatch and pickup status</div>
            </Link>
            <Link
              href="/admin/products"
              className="p-4 rounded-xl border border-navy/10 hover:border-gold transition bg-navy/5 block"
            >
              <div className="text-2xl mb-1">✨</div>
              <div className="font-semibold text-navy text-sm">Update Catalog</div>
              <div className="text-xs text-navy/50 mt-1">Add products, adjust pricing and stock</div>
            </Link>
            <Link
              href="/admin/coupons"
              className="p-4 rounded-xl border border-navy/10 hover:border-gold transition bg-navy/5 block"
            >
              <div className="text-2xl mb-1">🏷️</div>
              <div className="font-semibold text-navy text-sm">Discount Coupons</div>
              <div className="text-xs text-navy/50 mt-1">Configure store promotional codes</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-navy">Recent Orders</h3>
          <Link href="/admin/orders" className="text-sm text-gold-700 font-semibold hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-navy/50 text-left border-b border-navy/10">
                <th className="py-2 font-medium">Order #</th>
                <th className="py-2 font-medium">Customer</th>
                <th className="py-2 font-medium">Total</th>
                <th className="py-2 font-medium">Payment</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((o: any) => (
                <tr key={o.id} className="border-b border-navy/5">
                  <td className="py-3 font-semibold text-navy">#{o.orderNumber}</td>
                  <td className="py-3 text-navy/80">
                    {o.userName} ({o.userPhone})
                  </td>
                  <td className="py-3 font-semibold">{formatINR(o.total)}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                        o.paymentStatus === "paid"
                          ? "bg-emerald/10 text-emerald"
                          : "bg-navy/5 text-navy/60"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-navy/5 text-navy capitalize">
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-6 text-navy/50 text-center">
                    No orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
