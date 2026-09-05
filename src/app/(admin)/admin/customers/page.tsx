"use client";
import { useEffect, useState } from "react";
import { dateFmt } from "@/lib/site";
import { toast } from "@/store/ui";

export default function AdminCustomers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlock = async (id: string, currentBlocked: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked: !currentBlocked })
      });
      if (res.ok) {
        toast(!currentBlocked ? "Customer account suspended" : "Customer account reactivated");
        await fetchUsers();
      }
    } catch {
      toast("Failed to update status");
    }
  };

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "customer" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        toast(`Role changed to ${newRole}`);
        await fetchUsers();
      }
    } catch {
      toast("Failed to update role");
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-1">Customers &amp; Accounts</h1>
      <p className="text-navy/50 text-sm mb-6">{users.length} registered accounts</p>

      <div className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-navy/50 text-sm">Loading users from database...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-navy/50 text-left border-b border-navy/10">
                <th className="py-2 font-medium">Customer</th>
                <th className="py-2 font-medium">Phone</th>
                <th className="py-2 font-medium">Role</th>
                <th className="py-2 font-medium">Joined</th>
                <th className="py-2 font-medium">Orders</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-navy/5">
                  <td className="py-3">
                    <div className="font-semibold text-navy">{u.name}</div>
                    <div className="text-xs text-navy/40">{u.email}</div>
                  </td>
                  <td className="py-3 text-navy/70">{u.phone || "—"}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        u.role === "admin" ? "bg-gold/15 text-gold-700" : "bg-navy/5 text-navy"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-navy/70">{dateFmt(u.createdAt)}</td>
                  <td className="py-3 font-semibold text-navy">{u._count?.orders || 0}</td>
                  <td className="py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => toggleRole(u.id, u.role)}
                      className="text-xs text-navy hover:text-gold-700 font-medium underline"
                    >
                      {u.role === "admin" ? "Make Customer" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => toggleBlock(u.id, u.blocked)}
                      className={`text-xs font-medium ${
                        u.blocked ? "text-emerald hover:underline" : "text-red-500 hover:underline"
                      }`}
                    >
                      {u.blocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
