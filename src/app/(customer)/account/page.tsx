"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth";
import { toast } from "@/store/ui";
import ThemePicker from "@/components/ThemePicker";
import {
  getAddresses,
  saveAddress,
  deleteAddress,
  getWishlist,
  getMyReviews,
  getViewed,
  getProductById,
  getMyTickets,
  addTicket,
  getMyNotifications,
  markAllRead
} from "@/lib/db";
import { formatINR, dateFmt, timeFmt } from "@/lib/site";
import { fmtStatus } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";

export default function AccountPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const logout = useAuth((s) => s.logout);
  const saveProfile = useAuth((s) => s.saveProfile);
  const [tab, setTab] = useState("overview");
  const [gen, setGen] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState({ name: "", phone: "", email: "" });
  const [addrForm, setAddrForm] = useState({
    type: "home",
    address: "",
    city: "Raebareli",
    state: "Uttar Pradesh",
    pincode: "",
    landmark: "",
    phone: ""
  });
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "" });

  useEffect(() => {
    if (hydrated && !user) router.replace("/login?next=/account");
  }, [user, hydrated, router]);

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, phone: user.phone || "", email: user.email });
      fetch("/api/orders/user")
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []))
        .catch(() => {});
    }
  }, [user]);

  if (!user) return <div className="pt-32 pb-20 bg-ivory min-h-screen" />;

  const totalSpent = orders.filter((o) => o.paymentStatus === "paid").reduce((a, o) => a + o.total, 0);
  const addresses = getAddresses(user.id);
  const wishlistIds = getWishlist(user.id);
  const wishlistProducts = wishlistIds.map(getProductById).filter(Boolean) as any[];
  const myReviews = getMyReviews(user.id);
  const viewedIds = getViewed(user.id);
  const viewedProducts = viewedIds.map(getProductById).filter(Boolean) as any[];
  const tickets = getMyTickets(user.id);
  const notifications = getMyNotifications(user.id);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "orders", label: "My Orders" },
    { id: "theme", label: "Appearance & Theme" },
    { id: "addresses", label: "Addresses" },
    { id: "wishlist", label: "Wishlist" },
    { id: "reviews", label: "My Reviews" },
    { id: "recent", label: "Recently Viewed" },
    { id: "support", label: "Support" },
    { id: "notifications", label: "Notifications" },
    { id: "profile", label: "Profile" }
  ];

  const saveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({ name: profile.name, phone: profile.phone });
    toast("Profile updated ✓");
  };

  const addAddr = (e: React.FormEvent) => {
    e.preventDefault();
    if (addrForm.pincode.length !== 6) {
      toast("Enter valid pincode");
      return;
    }
    saveAddress({
      id: "a-" + Date.now().toString(36),
      user_id: user.id,
      ...addrForm,
      default: addresses.length === 0
    });
    setAddrForm({
      type: "home",
      address: "",
      city: "Raebareli",
      state: "Uttar Pradesh",
      pincode: "",
      landmark: "",
      phone: ""
    });
    setGen((g) => g + 1);
    toast("Address added ✓");
  };

  return (
    <div className="pt-24 md:pt-28 bg-ivory min-h-screen">
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy">My Account</h1>
            <p className="text-navy/60 mt-1">Welcome back, {user.name}</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-sm text-navy/50 hover:text-red-500 font-medium"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-2xl p-3 border border-navy/5 sticky top-24 space-y-1 shadow-sm">
              <div className="text-center pb-3 mb-2 border-b border-navy/10">
                <div className="w-12 h-12 rounded-full bg-navy text-ivory flex items-center justify-center text-lg font-bold mx-auto shadow-sm">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div className="text-sm font-semibold text-navy mt-2">{user.name}</div>
              </div>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    if (t.id === "notifications") markAllRead(user.id);
                    setGen((g) => g + 1);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                    tab === t.id ? "bg-navy text-ivory" : "text-navy/80 hover:bg-navy/5"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </aside>

          {/* content */}
          <div className="md:col-span-4">
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { l: "Total Orders", v: orders.length, i: "📦" },
                    { l: "Total Spent", v: formatINR(totalSpent), i: "💰" },
                    { l: "Wishlist", v: wishlistIds.length, i: "❤" },
                    { l: "Notifications", v: notifications.filter((n) => !n.is_read).length, i: "🔔" }
                  ].map((c) => (
                    <div key={c.l} className="bg-white rounded-2xl p-5 border border-navy/5 shadow-sm">
                      <div className="text-2xl mb-2">{c.i}</div>
                      <div className="text-xl font-bold text-navy">{c.v}</div>
                      <div className="text-xs text-navy/50">{c.l}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                  <h3 className="font-serif text-lg text-navy mb-4 font-bold">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <p className="text-navy/50 text-sm">
                      No orders yet.{" "}
                      <Link href="/shop" className="text-gold-700 underline font-medium">
                        Start shopping →
                      </Link>
                    </p>
                  ) : (
                    orders.slice(0, 4).map((o) => (
                      <Link
                        key={o.id}
                        href={`/account/orders?o=${o.id}`}
                        className="flex items-center justify-between py-3 border-b border-navy/5 last:border-0 text-sm hover:bg-navy/5 px-2 rounded-lg transition"
                      >
                        <div>
                          <div className="font-semibold text-navy">#{o.orderNumber}</div>
                          <div className="text-xs text-navy/50">{dateFmt(o.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-navy">{formatINR(o.total)}</div>
                          <div className="text-xs text-navy/60 capitalize">{o.status.replace(/_/g, " ")}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Theme & Appearance Tab */}
            {tab === "theme" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <ThemePicker mode="customer" />
              </div>
            )}

            {tab === "orders" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <h3 className="font-serif text-lg text-navy mb-4 font-bold">My Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-navy/50 text-sm">No orders placed yet.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((o) => (
                      <Link
                        key={o.id}
                        href={`/account/orders?o=${o.id}`}
                        className="block border border-navy/10 rounded-xl p-4 hover:border-gold transition shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-navy">#{o.orderNumber}</div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-navy/5 text-navy">
                            {o.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-navy/70">
                          <span>
                            {dateFmt(o.createdAt)} · {o.deliveryMethod === "pickup" ? "Store Pickup" : "Home Delivery"}
                          </span>
                          <span className="font-bold text-navy">{formatINR(o.total)}</span>
                        </div>
                        <div className="mt-2 text-xs text-navy/50">
                          {o.items?.length || 1} item(s) ordered
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "addresses" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <h3 className="font-serif text-lg text-navy mb-4 font-bold">Saved Addresses</h3>
                {addresses.length === 0 && <p className="text-navy/50 text-sm mb-4">No saved addresses.</p>}
                <div className="space-y-3 mb-6">
                  {addresses.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start justify-between border border-navy/10 rounded-xl p-4"
                    >
                      <div>
                        <div className="text-sm font-semibold text-navy">
                          {a.type === "home" ? "🏠 Home" : "🏢 Work"}{" "}
                          {a.default && (
                            <span className="text-xs bg-gold/10 text-gold-700 px-2 py-0.5 rounded-full ml-1 font-bold">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-navy/70 mt-1">
                          {a.address}, {a.city}, {a.state} {a.pincode}
                        </div>
                        <div className="text-xs text-navy/50 mt-1">📞 {a.phone}</div>
                      </div>
                      <button
                        onClick={() => {
                          deleteAddress(a.id);
                          setGen((g) => g + 1);
                          toast("Address removed");
                        }}
                        className="text-red-500 text-sm font-medium hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                <h4 className="text-sm font-semibold text-navy mb-3">Add New Address</h4>
                <form onSubmit={addAddr} className="grid sm:grid-cols-2 gap-3">
                  <input
                    value={addrForm.address}
                    onChange={(e) => setAddrForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="House / Street / Area"
                    required
                    className="input-premium sm:col-span-2"
                  />
                  <input
                    value={addrForm.pincode}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))
                    }
                    placeholder="Pincode"
                    required
                    className="input-premium"
                  />
                  <input
                    value={addrForm.phone}
                    onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value.slice(0, 10) }))}
                    placeholder="Phone"
                    required
                    className="input-premium"
                  />
                  <input
                    value={addrForm.landmark}
                    onChange={(e) => setAddrForm((f) => ({ ...f, landmark: e.target.value }))}
                    placeholder="Landmark (optional)"
                    className="input-premium sm:col-span-2"
                  />
                  <button className="btn-gold col-span-2 py-3 rounded-full font-semibold">
                    Save Address
                  </button>
                </form>
              </div>
            )}

            {tab === "wishlist" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <h3 className="font-serif text-lg text-navy mb-4 font-bold">
                  My Wishlist ({wishlistProducts.length})
                </h3>
                {wishlistProducts.length === 0 ? (
                  <p className="text-navy/50 text-sm">
                    Your wishlist is empty.{" "}
                    <Link href="/shop" className="text-gold-700 underline font-medium">
                      Browse products →
                    </Link>
                  </p>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "reviews" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <h3 className="font-serif text-lg text-navy mb-4 font-bold">My Reviews</h3>
                {myReviews.length === 0 ? (
                  <p className="text-navy/50 text-sm">You haven&apos;t reviewed any product yet.</p>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((r) => {
                      const p = getProductById(r.product_id);
                      return (
                        <div key={r.id} className="border border-navy/10 rounded-xl p-4">
                          <div className="flex justify-between items-center">
                            <Link
                              href={`/product/${p?.slug}`}
                              className="font-semibold text-navy hover:text-gold-700"
                            >
                              {p?.name || "Product"}
                            </Link>
                            <div className="text-gold text-sm">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <span key={i}>★</span>
                              ))}
                            </div>
                          </div>
                          {r.title && <div className="font-medium text-navy text-sm mt-1">{r.title}</div>}
                          <p className="text-sm text-navy/70 mt-1">{r.comment}</p>
                          <div className="text-xs text-navy/40 mt-2">{dateFmt(r.created_at)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "recent" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <h3 className="font-serif text-lg text-navy mb-4 font-bold">Recently Viewed</h3>
                {viewedProducts.length === 0 ? (
                  <p className="text-navy/50 text-sm">No recently viewed products.</p>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewedProducts.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "support" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <h3 className="font-serif text-lg text-navy mb-4 font-bold">Support Tickets</h3>
                <div className="space-y-3 mb-6">
                  {tickets.map((t) => (
                    <div key={t.id} className="border border-navy/10 rounded-xl p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-navy text-sm">{t.subject}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold ${
                            t.status === "answered"
                              ? "bg-emerald/10 text-emerald"
                              : t.status === "open"
                              ? "bg-gold/10 text-gold-700"
                              : "bg-navy/5 text-navy"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-sm text-navy/70 mt-1">{t.message}</p>
                      {t.reply && (
                        <div className="mt-2 text-sm text-navy bg-navy/5 rounded-lg p-3">
                          <b>Store Response:</b> {t.reply}
                        </div>
                      )}
                      <div className="text-xs text-navy/40 mt-2">{timeFmt(t.created_at)}</div>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    addTicket({ user_id: user.id, ...ticketForm });
                    setTicketForm({ subject: "", message: "" });
                    setGen((g) => g + 1);
                    toast("Ticket submitted ✓");
                  }}
                  className="grid gap-3"
                >
                  <input
                    required
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm((f) => ({ ...f, subject: e.target.value }))}
                    placeholder="Subject *"
                    className="input-premium"
                  />
                  <textarea
                    required
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="How can our store team assist you? *"
                    className="input-premium min-h-[90px]"
                  />
                  <button className="btn-gold py-3 rounded-full font-semibold">
                    Submit Support Ticket
                  </button>
                </form>
              </div>
            )}

            {tab === "notifications" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <h3 className="font-serif text-lg text-navy mb-4 font-bold">Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-navy/50 text-sm">No notifications.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`border rounded-xl p-4 ${
                          n.is_read ? "border-navy/5 bg-white" : "border-gold/40 bg-gold/5"
                        }`}
                      >
                        <div className="font-semibold text-navy text-sm">{n.title}</div>
                        <p className="text-sm text-navy/70 mt-1">{n.body}</p>
                        <div className="text-xs text-navy/40 mt-2">{timeFmt(n.created_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "profile" && (
              <div className="bg-white rounded-2xl p-6 border border-navy/5 shadow-sm">
                <h3 className="font-serif text-lg text-navy mb-4 font-bold">Profile Details</h3>
                <form onSubmit={saveProfileSubmit} className="grid sm:grid-cols-2 gap-3 max-w-lg">
                  <label className="text-xs text-navy/50 block">
                    Full Name
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile((f) => ({ ...f, name: e.target.value }))}
                      className="input-premium mt-1 font-medium"
                    />
                  </label>
                  <label className="text-xs text-navy/50 block">
                    Mobile Phone
                    <input
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((f) => ({
                          ...f,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10)
                        }))
                      }
                      className="input-premium mt-1 font-medium"
                    />
                  </label>
                  <label className="text-xs text-navy/50 block sm:col-span-2">
                    Email Address (linked)
                    <input value={profile.email} disabled className="input-premium mt-1 opacity-60" />
                  </label>
                  <button className="btn-gold sm:col-span-2 py-3 rounded-full font-semibold">
                    Save Changes
                  </button>
                </form>
                <div className="mt-6 pt-6 border-t border-navy/10">
                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="text-red-500 text-sm font-semibold hover:underline"
                  >
                    Logout of this account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
