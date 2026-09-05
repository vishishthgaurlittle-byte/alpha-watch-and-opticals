// ============================================================
// LOCAL PERSISTENT DATA LAYER  (mock "Insforge" backend)
// Mirrors the Insforge database collections/schema. Data is
// persisted to localStorage so the full eCommerce flow works
// end-to-end in the demo. Swap these functions for real
// Insforge SDK/REST calls when connecting production.
// ============================================================
import type {
  User,
  Address,
  Category,
  Product,
  CartItem,
  Coupon,
  Review,
  Order,
  PaymentProof,
  SupportTicket,
  Notification,
  Role
} from "./types";

const NS = "awopticals_db_v1";

interface DBShape {
  users: User[];
  addresses: Address[];
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  reviews: Review[];
  orders: Order[];
  payment_proofs: PaymentProof[];
  tickets: SupportTicket[];
  notifications: Notification[];
  carts: Record<string, CartItem[]>; // user_id -> cart (guest uses "guest")
  lastViewed: Record<string, string[]>; // user_id -> product ids
  wishlist: { id: string; user_id: string; product_id: string }[];
  settings: Record<string, string>;
}

const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const product = (p: Partial<Product>): Product => ({
  id: p.id || uid(),
  name: p.name || "",
  slug: p.slug || "",
  sku: p.sku || "",
  brand: p.brand || "",
  category_id: p.category_id || "",
  price: p.price || 0,
  mrp: p.mrp || 0,
  stock: p.stock ?? 0,
  description: p.description || "",
  specs: p.specs || {},
  images: p.images || [],
  badges: p.badges || [],
  variants: p.variants || [],
  status: p.status || "published",
  seo_title: p.seo_title,
  seo_description: p.seo_description,
  created_at: p.created_at || new Date().toISOString(),
  rating: p.rating ?? 4.5,
  reviews_count: p.reviews_count ?? 0
});

const CATEGORIES: Category[] = [
  { id: "c-mens", name: "Men's Watches", slug: "mens-watches", image: "/images/products/mens-black-dial.jpg", sort_order: 1 },
  { id: "c-womens", name: "Women's Watches", slug: "womens-watches", image: "/images/products/womens-gold-watch.jpg", sort_order: 2 },
  { id: "c-sunglasses", name: "Sunglasses", slug: "sunglasses", image: "/images/products/sunglasses-aviator.jpg", sort_order: 3 },
  { id: "c-optical", name: "Optical Glasses", slug: "optical-glasses", image: "/images/products/optical-frame.jpg", sort_order: 4 },
  { id: "c-lenses", name: "Contact Lenses", slug: "contact-lenses", image: "/images/products/contact-lens.jpg", sort_order: 5 },
  { id: "c-accessories", name: "Accessories", slug: "watch-accessories", image: "/images/products/watch-strap.jpg", sort_order: 6 }
];

const PRODUCTS: Product[] = [
  product({
    id: "p-chrono",
    name: "Alpha Chrono Gold Automatic",
    slug: "alpha-chrono-gold-automatic",
    sku: "AW-M-001",
    brand: "Alpha Signature",
    category_id: "c-mens",
    price: 18999,
    mrp: 24999,
    stock: 12,
    description:
      "A statement piece inspired by classic pilot chronographs. The Alpha Chrono Gold Automatic features a 41mm brushed steel case, gold bezel and a deep navy sunburst dial, powered by a reliable 21-jewel automatic movement with a 40-hour power reserve. Sapphire-coated glass and 5 ATM water resistance make it a daily companion built to last.",
    specs: {
      "Case Diameter": "41 mm",
      Movement: "Automatic (21 jewels)",
      "Glass": "Sapphire-coated mineral",
      "Water Resistance": "5 ATM",
      Strap: "Stainless Steel Bracelet",
      Warranty: "2 Years"
    },
    images: ["/images/products/mens-chrono-gold.jpg", "/images/products/mens-black-dial.jpg"],
    variants: [
      { variant_type: "Strap", value: "Steel Gold", stock: 12 },
      { variant_type: "Strap", value: "Leather Brown", stock: 6 }
    ],
    badges: ["Best Seller"],
    rating: 4.8,
    reviews_count: 3,
    seo_title: "Alpha Chrono Gold Automatic Watch - Alpha Watch & Opticals",
    seo_description:
      "Buy the Alpha Chrono Gold Automatic men's watch in Raebareli. 41mm steel case, gold bezel, navy dial, automatic movement, 2-year warranty."
  }),
  product({
    id: "p-black-dial",
    name: "Steel Night Black Dial Watch",
    slug: "steel-night-black-dial-watch",
    sku: "AW-M-002",
    brand: "Alpha Signature",
    category_id: "c-mens",
    price: 7499,
    mrp: 9999,
    stock: 20,
    description:
      "The Steel Night brings understated luxury to your everyday. A black dial with luminous hands framed by a polished stainless steel bracelet. Quartz precision, hard-wearing mineral glass and a clean, versatile silhouette that moves from office to evening.",
    specs: {
      "Case Diameter": "39 mm",
      Movement: "Japanese Quartz",
      Glass: "Hardened mineral",
      "Water Resistance": "3 ATM",
      Strap: "Stainless Steel",
      Warranty: "1 Year"
    },
    images: ["/images/products/mens-black-dial.jpg", "/images/products/mens-chrono-gold.jpg"],
    variants: [
      { variant_type: "Strap", value: "Steel Black", stock: 20 },
      { variant_type: "Strap", value: "Steel Silver", stock: 12 }
    ],
    badges: ["New"],
    rating: 4.6,
    reviews_count: 1
  }),
  product({
    id: "p-womens-gold",
    name: "Bella Rose Gold Pearl Watch",
    slug: "bella-rose-gold-pearl-watch",
    sku: "AW-W-001",
    brand: "Alpha Petite",
    category_id: "c-womens",
    price: 8999,
    mrp: 11999,
    stock: 15,
    description:
      "Effortless elegance for the modern woman. The Bella features a slim rose-gold-tone mesh bracelet and a luminous mother-of-pearl dial with delicate rose gold markers. A refined 28mm case that feels feather-light on the wrist.",
    specs: {
      "Case Diameter": "28 mm",
      Movement: "Swiss Quartz",
      Glass: "Sapphire-coated",
      "Water Resistance": "3 ATM",
      Strap: "Rose Gold Mesh",
      Warranty: "1 Year"
    },
    images: ["/images/products/womens-gold-watch.jpg"],
    variants: [
      { variant_type: "Strap", value: "Rose Gold Mesh", stock: 15 },
      { variant_type: "Strap", value: "White Leather", stock: 9 }
    ],
    rating: 4.9,
    reviews_count: 2
  }),
  product({
    id: "p-aviator",
    name: "Gold Aviator Gradient Sunglasses",
    slug: "gold-aviator-gradient-sunglasses",
    sku: "AW-S-001",
    brand: "Alpha Eyewear",
    category_id: "c-sunglasses",
    price: 2999,
    mrp: 4499,
    stock: 25,
    description:
      "Timeless aviators, reimagined. A gold-tone metal frame with dark green gradient CR-39 lenses delivering full UV400 protection. Lightweight, adjustable nose pads and a double-bridge design that suits every face.",
    specs: {
      "Frame Material": "Gold-tone Metal",
      Lens: "UV400 CR-39 Gradient",
      "UV Protection": "100% UVA/UVB",
      Fit: "Unisex",
      Included: "Case + Cleaning Cloth",
      Warranty: "1 Year"
    },
    images: ["/images/products/sunglasses-aviator.jpg", "/images/products/optical-frame.jpg"],
    variants: [
      { variant_type: "Lens", value: "Green Gradient", stock: 25 },
      { variant_type: "Lens", value: "Silver Mirror", stock: 14 },
      { variant_type: "Lens", value: "Smoke Black", stock: 10 }
    ],
    badges: ["Best Seller"],
    rating: 4.7,
    reviews_count: 4
  }),
  product({
    id: "p-optical",
    name: "Clarity Rectangular Optical Frame",
    slug: "clarity-rectangular-optical-frame",
    sku: "AW-O-001",
    brand: "Alpha Eyewear",
    category_id: "c-optical",
    price: 1999,
    mrp: 2999,
    stock: 30,
    description:
      "A clean, contemporary rectangular frame in matte black acetate — the everyday essential. Compatible with single vision, bifocal and progressive lenses. Fitted and checked free of charge at our store with every purchase.",
    specs: {
      "Frame Material": "Premium Acetate",
      Shape: "Rectangular",
      "Lens Type": "Single Vision / Progressive",
      "Included": "Hard Case + Cloth",
      "Free": "Frame Fitting & Adjustment",
      Warranty: "1 Year"
    },
    images: ["/images/products/optical-frame.jpg", "/images/products/sunglasses-aviator.jpg"],
    variants: [
      { variant_type: "Lens", value: "Single Vision", stock: 30 },
      { variant_type: "Lens", value: "Blue Cut", stock: 18 },
      { variant_type: "Lens", value: "Progressive", stock: 12 }
    ],
    rating: 4.8,
    reviews_count: 2
  }),
  product({
    id: "p-lens",
    name: "Daily Comfort Contact Lenses",
    slug: "daily-comfort-contact-lenses",
    sku: "AW-L-001",
    brand: "Alpha Vision",
    category_id: "c-lenses",
    price: 999,
    mrp: 1299,
    stock: 60,
    description:
      "Ultra-thin hydrogel daily disposable contact lenses offering all-day hydration and breathability. Corrects short-sight and long-sight. Eye test and fitting available in-store before purchase to ensure the perfect curve for your eyes.",
    specs: {
      Material: "Hydrogel",
      "Wear Time": "Daily Disposable",
      "Base Curve": "8.6 mm",
      "Pack Size": "30 Lenses",
      "Includes": "Fitting & Trial",
      Warranty: "—"
    },
    images: ["/images/products/contact-lens.jpg"],
    variants: [
      { variant_type: "Power", value: "Plano (-0.00)", stock: 60 },
      { variant_type: "Power", value: "-1.00", stock: 40 },
      { variant_type: "Power", value: "-2.00", stock: 35 },
      { variant_type: "Power", value: "-3.00", stock: 30 }
    ],
    rating: 4.9,
    reviews_count: 5
  }),
  product({
    id: "p-strap",
    name: "Premium Leather Watch Strap",
    slug: "premium-leather-watch-strap",
    sku: "AW-A-001",
    brand: "Alpha",
    category_id: "c-accessories",
    price: 699,
    mrp: 999,
    stock: 40,
    description:
      "Genuine top-grain leather watch straps in brown and black, with a brushed gold buckle. Quick-release spring bars for easy fitting — we'll install and adjust it for free in store.",
    specs: {
      Material: "Top-grain Leather",
      "Strap Width": "18 / 20 / 22 mm",
      Buckle: "Brushed Gold Steel",
      "Fitting": "Free In-Store",
      Warranty: "6 Months"
    },
    images: ["/images/products/watch-strap.jpg"],
    variants: [
      { variant_type: "Color", value: "Brown 20mm", stock: 40 },
      { variant_type: "Color", value: "Black 20mm", stock: 35 },
      { variant_type: "Color", value: "Brown 22mm", stock: 25 }
    ],
    rating: 4.5,
    reviews_count: 1
  }),
  // A draft product to demonstrate admin publishing controls
  product({
    id: "p-draft",
    name: "Emerald Automatic Limited Edition",
    slug: "emerald-automatic-limited-edition",
    sku: "AW-M-099",
    brand: "Alpha Signature",
    category_id: "c-mens",
    price: 29999,
    mrp: 37999,
    stock: 5,
    description: "An exclusive limited-edition automatic in emerald green. (Draft product — not yet published.)",
    specs: { "Case Diameter": "42 mm", Movement: "Automatic" },
    images: ["/images/products/mens-chrono-gold.jpg"],
    status: "draft",
    rating: 0,
    reviews_count: 0
  })
];

const COUPONS: Coupon[] = [
  { id: "cp-1", code: "WELCOME10", type: "percent", value: 10, min_cart: 999, expires_at: "2026-12-31", usage_limit: 500, used: 12 },
  { id: "cp-2", code: "ALPHA200", type: "fixed", value: 200, min_cart: 1999, expires_at: "2026-11-30", usage_limit: 200, used: 5 }
];

function seed(): DBShape {
  const now = new Date().toISOString();
  return {
    users: [],
    addresses: [],
    categories: CATEGORIES,
    products: PRODUCTS,
    coupons: COUPONS,
    reviews: [
      {
        id: "rev-1",
        user_id: "u-verified-1",
        user_name: "Verified Customer",
        product_id: "p-chrono",
        rating: 5,
        title: "Stunning piece",
        comment: "Beautiful finish and the movement is very smooth. 100% genuine product with official warranty.",
        status: "approved",
        created_at: now
      }
    ],
    orders: [],
    payment_proofs: [],
    tickets: [],
    notifications: [],
    carts: { guest: [] },
    lastViewed: {},
    wishlist: [],
    settings: {}
  };
}

let cache: DBShape | null = null;

export function getDB(): DBShape {
  if (typeof window === "undefined") return seed();
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(NS);
    cache = raw ? (JSON.parse(raw) as DBShape) : seed();
  } catch {
    cache = seed();
  }
  return cache;
}

export function saveDB() {
  if (typeof window === "undefined") return;
  try {
    if (cache) {
      localStorage.setItem(NS, JSON.stringify(cache));
    }
  } catch (e) {
    console.error("saveDB failed", e);
  }
}

export function resetDB() {
  if (typeof window !== "undefined") localStorage.removeItem(NS);
  cache = null;
}

export function currentUserFromDB(): User | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem("awopticals_session");
  if (!id) return null;
  return getDB().users.find((u) => u.id === id) || null;
}

// ---------- Auth ----------
export function loginGoogle(profile: {
  email: string;
  name: string;
  picture?: string;
}): { user: User; created: boolean } {
  const db = getDB();
  const email = profile.email.trim().toLowerCase();
  let u = db.users.find((x) => x.email === email);
  let created = false;
  if (!u) {
    u = {
      id: "u-" + uid(),
      name: profile.name || email.split("@")[0],
      email,
      phone: "",
      password: "",
      role: "customer",
      provider: "google",
      google_id: email,
      avatar: profile.picture,
      created_at: new Date().toISOString()
    };
    db.users.push(u);
    created = true;
  } else {
    u.google_id = email;
    u.avatar = profile.picture || u.avatar;
    u.provider = "google";
  }
  saveDB();
  return { user: u, created };
}

export function loginOtp(phone: string, name: string): { user: User; created: boolean } {
  const db = getDB();
  let u = db.users.find((x) => x.phone === phone);
  let created = false;
  if (!u) {
    u = {
      id: "u-" + uid(),
      name: name || "Customer " + phone.slice(-4),
      email: "",
      phone,
      password: "",
      role: "customer",
      provider: "otp",
      created_at: new Date().toISOString()
    };
    db.users.push(u);
    created = true;
  }
  saveDB();
  return { user: u, created };
}

export function setSession(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem("awopticals_session", id);
  else localStorage.removeItem("awopticals_session");
}

// ---------- Products ----------
export function getPublishedProducts(): Product[] {
  return getDB().products.filter((p) => p.status === "published");
}
export function getAllProducts(): Product[] {
  return getDB().products;
}
export function getProductBySlug(slug: string): Product | undefined {
  return getDB().products.find((p) => p.slug === slug);
}
export function getProductById(id: string): Product | undefined {
  return getDB().products.find((p) => p.id === id);
}
export function relatedProducts(p: Product): Product[] {
  return getPublishedProducts()
    .filter((x) => x.id !== p.id)
    .sort((a, b) => (a.category_id === p.category_id ? -1 : 1) - (b.category_id === p.category_id ? -1 : 1))
    .slice(0, 4);
}
export function upsertProduct(p: Product) {
  const db = getDB();
  const i = db.products.findIndex((x) => x.id === p.id);
  if (i >= 0) db.products[i] = p;
  else db.products.push(p);
  saveDB();
}
export function deleteProduct(id: string) {
  const db = getDB();
  db.products = db.products.filter((p) => p.id !== id);
  saveDB();
}

// ---------- Categories ----------
export function getCategories(): Category[] {
  return getDB().categories;
}

// ---------- Cart ----------
export function getCart(userId: string): CartItem[] {
  return getDB().carts[userId] || [];
}
export function setCart(userId: string, items: CartItem[]) {
  const db = getDB();
  db.carts[userId] = items;
  saveDB();
}

// ---------- Coupons ----------
export function getCoupon(code: string): Coupon | undefined {
  return getDB().coupons.find((c) => c.code === code.toUpperCase());
}

// ---------- Addresses ----------
export function getAddresses(userId: string): Address[] {
  return getDB().addresses.filter((a) => a.user_id === userId);
}
export function saveAddress(a: Address) {
  const db = getDB();
  const i = db.addresses.findIndex((x) => x.id === a.id);
  if (i >= 0) db.addresses[i] = a;
  else db.addresses.push(a);
  saveDB();
}
export function deleteAddress(id: string) {
  const db = getDB();
  db.addresses = db.addresses.filter((x) => x.id !== id);
  saveDB();
}

// ---------- Orders ----------
export function createOrder(
  user: User,
  items: CartItem[],
  opts: {
    delivery_method: "pickup" | "delivery";
    address?: Address;
    subtotal: number;
    discount: number;
    shipping: number;
    coupon_id?: string;
    shipment?: string;
  }
): Order {
  const db = getDB();
  const now = new Date();
  const order: Order = {
    id: "o-" + uid(),
    order_number: "AW" + now.getFullYear().toString().slice(2) + uid().toUpperCase().slice(0, 6),
    user_id: user.id,
    status: "pending",
    payment_status: "pending",
    delivery_method: opts.delivery_method,
    subtotal: opts.subtotal,
    discount: opts.discount,
    shipping: opts.shipping,
    total: opts.subtotal - opts.discount + opts.shipping,
    coupon_id: opts.coupon_id,
    address_id: opts.address?.id,
    address: opts.address,
    shipment: opts.shipment,
    items: items.map((it) => {
      const p = getProductById(it.product_id);
      return {
        product_id: it.product_id,
        name: p?.name || "Product",
        image: p?.images?.[0] || "",
        variant: it.variant,
        price: p?.price || 0,
        quantity: it.quantity,
        total: (p?.price || 0) * it.quantity
      };
    }),
    created_at: now.toISOString()
  };
  db.orders.unshift(order);
  // decrement stock
  items.forEach((it) => {
    const p = getProductById(it.product_id);
    if (p) p.stock = Math.max(0, p.stock - it.quantity);
  });
  // increment coupon usage
  if (opts.coupon_id) {
    const c = db.coupons.find((x) => x.id === opts.coupon_id);
    if (c) c.used++;
  }
  // notification
  db.notifications.unshift({
    id: "n-" + uid(),
    user_id: user.id,
    title: "Order placed",
    body: "Your order " + order.order_number + " has been placed. " + (opts.delivery_method === "pickup" ? "You can pay at the shop." : "Please submit your UPI payment proof."),
    is_read: false,
    created_at: now.toISOString()
  });
  saveDB();
  return order;
}

export function getOrdersByUser(userId: string): Order[] {
  return getDB().orders.filter((o) => o.user_id === userId);
}
export function getAllOrders(): Order[] {
  return getDB().orders;
}
export function getOrderById(id: string): Order | undefined {
  return getDB().orders.find((o) => o.id === id);
}
export function updateOrder(id: string, patch: Partial<Order>) {
  const db = getDB();
  const o = db.orders.find((x) => x.id === id);
  if (o) {
    Object.assign(o, patch);
    // notify user on status change
    if (patch.status && patch.status !== o.status) {
      db.notifications.unshift({
        id: "n-" + uid(),
        user_id: o.user_id,
        title: "Order " + o.order_number + " updated",
        body: "Your order status is now: " + fmtStatus(patch.status),
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
    saveDB();
  }
}

export const fmtStatus = (s: string) =>
  ({
    pending: "Pending",
    confirmed: "Confirmed",
    packed: "Packed",
    ready_for_pickup: "Ready for Pickup",
    dispatched: "Dispatched",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded"
  } as Record<string, string>)[s] || s;

export const fmtPayment = (s: string) =>
  ({
    pending: "Pending",
    proof_submitted: "Proof Submitted",
    approved: "Approved",
    rejected: "Rejected"
  } as Record<string, string>)[s] || s;

// ---------- Payment Proofs ----------
export function addPaymentProof(orderId: string, userId: string, imageUrl: string): PaymentProof {
  const db = getDB();
  const proof: PaymentProof = {
    id: "pp-" + uid(),
    order_id: orderId,
    user_id: userId,
    image_url: imageUrl,
    status: "proof_submitted",
    created_at: new Date().toISOString()
  };
  db.payment_proofs.unshift(proof);
  const o = db.orders.find((x) => x.id === orderId);
  if (o) o.payment_status = "proof_submitted";
  db.notifications.unshift({
    id: "n-" + uid(),
    user_id: userId,
    title: "Payment proof submitted",
    body: "Your UPI payment receipt is under review. We'll notify you once approved.",
    is_read: false,
    created_at: new Date().toISOString()
  });
  saveDB();
  return proof;
}
export function getProofForOrder(orderId: string): PaymentProof | undefined {
  return getDB().payment_proofs.find((p) => p.order_id === orderId);
}
export function setProofStatus(id: string, status: PaymentProof["status"], note?: string) {
  const db = getDB();
  const p = db.payment_proofs.find((x) => x.id === id);
  if (p) {
    p.status = status;
    p.admin_note = note;
    const o = db.orders.find((x) => x.id === p.order_id);
    if (o) o.payment_status = status;
    db.notifications.unshift({
      id: "n-" + uid(),
      user_id: p.user_id,
      title: "Payment " + status,
      body: note || ("Your UPI payment was " + status + " for order " + (o?.order_number || "")),
      is_read: false,
      created_at: new Date().toISOString()
    });
    saveDB();
  }
}

// ---------- Reviews ----------
export function getReviewsForProduct(productId: string): Review[] {
  return getDB().reviews.filter((r) => r.product_id === productId && r.status === "approved");
}
export function addReview(r: Omit<Review, "id" | "created_at" | "status">) {
  const db = getDB();
  const review: Review = { ...r, id: "r-" + uid(), status: "approved", created_at: new Date().toISOString() };
  db.reviews.unshift(review);
  const p = db.products.find((x) => x.id === r.product_id);
  if (p) {
    const rs = db.reviews.filter((x) => x.product_id === p.id);
    p.reviews_count = rs.length;
    p.rating = Math.round((rs.reduce((a, b) => a + b.rating, 0) / rs.length) * 10) / 10;
    if (p.images && p.images.length === 0) p.images = [""];
  }
  saveDB();
}
export function getMyReviews(userId: string): Review[] {
  return getDB().reviews.filter((r) => r.user_id === userId);
}

// ---------- Wishlist ----------
export function getWishlist(userId: string): string[] {
  const db = getDB();
  return db.wishlist ? db.wishlist.filter((x) => x.user_id === userId).map((x) => x.product_id) : [];
}
export function toggleWishlist(userId: string, productId: string): boolean {
  const db = getDB();
  const i = db.wishlist.findIndex((x) => x.user_id === userId && x.product_id === productId);
  if (i >= 0) {
    db.wishlist.splice(i, 1);
    saveDB();
    return false;
  }
  db.wishlist.push({ id: "w-" + uid(), user_id: userId, product_id: productId });
  saveDB();
  return true;
}

// ---------- Recently viewed ----------
export function addViewed(userId: string, productId: string) {
  if (userId === "guest") return;
  const db = getDB();
  if (!db.lastViewed[userId]) db.lastViewed[userId] = [];
  db.lastViewed[userId] = [productId, ...db.lastViewed[userId].filter((id) => id !== productId)].slice(0, 12);
  saveDB();
}
export function getViewed(userId: string): string[] {
  return getDB().lastViewed[userId] || [];
}

// ---------- Tickets / Notifications ----------
export function addTicket(t: { user_id: string; subject: string; message: string }) {
  const db = getDB();
  db.tickets.unshift({ ...t, id: "t-" + uid(), status: "open", created_at: new Date().toISOString() });
  saveDB();
}
export function getMyTickets(userId: string): SupportTicket[] {
  return getDB().tickets.filter((t) => t.user_id === userId);
}
export function getAllTickets(): SupportTicket[] {
  return getDB().tickets;
}
export function replyTicket(id: string, reply: string) {
  const db = getDB();
  const t = db.tickets.find((x) => x.id === id);
  if (t) {
    t.reply = reply;
    t.status = "answered";
    saveDB();
  }
}
export function getMyNotifications(userId: string): Notification[] {
  return getDB().notifications
    .filter((n) => n.user_id === userId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}
export function markAllRead(userId: string) {
  const db = getDB();
  db.notifications.forEach((n) => {
    if (n.user_id === userId) n.is_read = true;
  });
  saveDB();
}

// ---------- Users (admin) ----------
export function getAllUsers(): User[] {
  return getDB().users;
}
export function setUserRole(id: string, role: Role) {
  const db = getDB();
  const u = db.users.find((x) => x.id === id);
  if (u) {
    u.role = role;
    saveDB();
  }
}
export function setUserBlocked(id: string, blocked: boolean) {
  const db = getDB();
  const u = db.users.find((x) => x.id === id);
  if (u) {
    u.blocked = blocked;
    saveDB();
  }
}
export function updateProfile(id: string, patch: Partial<User>) {
  const db = getDB();
  const u = db.users.find((x) => x.id === id);
  if (u) {
    Object.assign(u, patch);
    saveDB();
  }
}

// ---------- Store settings ----------
export function getSetting(key: string, fallback = ""): string {
  return getDB().settings[key] ?? fallback;
}
export function setSetting(key: string, value: string) {
  const db = getDB();
  db.settings[key] = value;
  saveDB();
}
export function getSettings(): Record<string, string> {
  return getDB().settings;
}
