"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/auth";
import { currentUserFromDB } from "@/lib/db";

const adminNav = [
  { id: "/admin", label: "Dashboard", icon: "📊" },
  { id: "/admin/products", label: "Products", icon: "📦" },
  { id: "/admin/orders", label: "Orders", icon: "🧾" },
  { id: "/admin/customers", label: "Customers", icon: "👥" },
  { id: "/admin/coupons", label: "Coupons", icon: "🏷" },
  { id: "/admin/reviews", label: "Reviews", icon: "⭐" },
  { id: "/admin/settings", label: "Settings", icon: "⚙" }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);
  const [showLogin, setShowLogin] = useState(false);

  // Active admin check either from Zustand or synchronous localStorage
  const currentAdmin = user?.role === "admin" ? user : (typeof window !== "undefined" ? currentUserFromDB() : null);
  const isAdmin = currentAdmin?.role === "admin";

  useEffect(() => {
    if (!hydrated) return;
    if (!isAdmin) {
      setShowLogin(true);
    }
  }, [isAdmin, hydrated]);

  // if admin, show content
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#f7f3ea]">
        <div className="flex">
          {/* sidebar */}
          <aside className="w-16 md:w-60 bg-navy-950 text-ivory min-h-screen fixed left-0 top-0 bottom-0 flex flex-col z-30">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
              <img src="/icons/logo.svg" alt="logo" className="w-9 h-9" />
              <div className="hidden md:block">
                <div className="font-serif font-bold">ALPHA</div>
                <div className="text-[9px] uppercase tracking-widest text-gold">Admin Panel</div>
              </div>
            </div>
            <nav className="flex-1 py-4 space-y-1 px-2">
              {adminNav.map((n) => (
                <Link key={n.id} href={n.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${pathname === n.id ? "bg-gold text-navy font-semibold" : "text-ivory/70 hover:bg-white/10"}`}>
                  <span>{n.icon}</span><span className="hidden md:inline">{n.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t border-white/10 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-ivory/70 hover:bg-white/10">
                <span>🏬</span><span className="hidden md:inline">View Store</span>
              </Link>
              <button onClick={() => { logout(); router.push("/admin"); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/10">
                <span>🚪</span><span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </aside>
          {/* content */}
          <div className="flex-1 md:ml-60 ml-16 p-4 md:p-8 pb-24">{children}</div>
        </div>
      </div>
    );
  }

  // not admin -> show admin login
  return (
    <AdminGate showLogin={showLogin} onSuccess={() => setShowLogin(false)} />
  );
}

function AdminGate({ showLogin, onSuccess }: { showLogin: boolean; onSuccess: () => void }) {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const res = await login(email, password);
    if (res) { setErr(res); return; }
    const u = useAuth.getState().user;
    if (u?.role === "admin") { onSuccess(); }
    else { setErr("This account does not have admin access."); login("", ""); }
  };

  if (!showLogin) return <div className="min-h-screen bg-navy-950 flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
      <form onSubmit={submit} className="glass relative w-full max-w-sm rounded-3xl p-8">
        <div className="text-center mb-6">
          <img src="/icons/logo.svg" alt="logo" className="w-14 h-14 mx-auto mb-3" />
          <h1 className="font-serif text-xl text-ivory">Admin Login</h1>
          <p className="text-ivory/50 text-xs mt-1">Restricted area · Authorized personnel only</p>
        </div>
        {err && <div className="bg-red-500/20 text-red-200 text-sm rounded-lg px-4 py-2.5 mb-4">{err}</div>}
        <div className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="input-premium bg-white/10 border-white/20 text-ivory placeholder:text-ivory/40" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-premium bg-white/10 border-white/20 text-ivory placeholder:text-ivory/40" />
          <button className="btn-gold w-full py-3.5 rounded-full font-semibold">Login</button>
        </div>
        <Link href="/" className="block text-center text-xs text-gold underline mt-4">← Back to store</Link>
      </form>
    </div>
  );
}
