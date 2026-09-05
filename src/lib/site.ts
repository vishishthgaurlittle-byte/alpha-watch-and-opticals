// Canonical Site & Store Constants

export const CANONICAL_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://alpha-watch-and-opticals.vercel.app"
).replace(/\/$/, "");

export const SITE = {
  name: "Alpha Watch & Opticals",
  shortName: "Alpha",
  owner: "Mohd. Shoeb",
  tagline: "Timeless Watches. Perfect Vision.",
  url: CANONICAL_URL,
  address: "Chowdhary Complex, Degree College Chauraha, Raebareli, Uttar Pradesh 229001",
  phone: process.env.SHOP_PHONE || "+91 90444 77735",
  phoneHref: "+919044477735",
  whatsapp: process.env.SHOP_WHATSAPP || "919044477735",
  whatsappLink: "https://wa.me/919044477735",
  email: process.env.SHOP_EMAIL || "alpha.watch.opticals@gmail.com",
  timings: "Monday – Sunday, 10:00 AM – 9:00 PM",
  upiId: process.env.SHOP_UPI_ID || "",
  legalEntity: process.env.LEGAL_ENTITY || "Alpha Watch & Opticals",
  gstin: process.env.GSTIN || "",
  grievanceName: process.env.GRIEVANCE_NAME || "Mohd. Shoeb",
  grievanceEmail: process.env.GRIEVANCE_EMAIL || "alpha.watch.opticals@gmail.com",
  justdial:
    "https://www.justdial.com/Raebareli/Alpha-Watch-Opticals-Near-Good-Morning-Bakery-Indira-Nagar/9999PX535-X535-181015003007-B3W8_BZDET",
  mapEmbed:
    "https://www.google.com/maps?q=Chowdhary+Complex,+Degree+College+Chauraha,+Raebareli,+Uttar+Pradesh+229001&output=embed",
  mapLink: "https://maps.google.com/?q=Chowdhary+Complex,+Degree+College+Chauraha,+Raebareli,+Uttar+Pradesh+229001",
  brands: ["Titan", "Casio", "Timex", "Fastrack", "Sonata", "Maxima", "Titan Eyewear", "SKINN Perfumes", "Fire-Boltt"],
  instagram: "#",
  currency: "₹",
  founded: 1998,
  categories: [
    { name: "Men's Watches", slug: "mens-watches", image: "/images/products/mens-black-dial.jpg", href: "/shop?cat=mens-watches" },
    { name: "Women's Watches", slug: "womens-watches", image: "/images/products/womens-gold-watch.jpg", href: "/shop?cat=womens-watches" },
    { name: "Sunglasses", slug: "sunglasses", image: "/images/products/sunglasses-aviator.jpg", href: "/shop?cat=sunglasses" },
    { name: "Optical Glasses", slug: "optical-glasses", image: "/images/products/optical-frame.jpg", href: "/shop?cat=optical-glasses" },
    { name: "Contact Lenses", slug: "contact-lenses", image: "/images/products/contact-lens.jpg", href: "/shop?cat=contact-lenses" },
    { name: "Accessories", slug: "watch-accessories", image: "/images/products/watch-strap.jpg", href: "/shop?cat=watch-accessories" }
  ],
  services: [
    { icon: "watch", title: "Watch Repair", desc: "Expert servicing and repairs for all major watch brands." },
    { icon: "eye", title: "Eye Test", desc: "Computerised eye testing by experienced optometrists." },
    { icon: "lens", title: "Lens Fitting", desc: "Precision lens fitting, blue-cut & progressive options." },
    { icon: "battery", title: "Battery Replacement", desc: "Genuine battery replacement while you wait." },
    { icon: "strap", title: "Strap Adjustment", desc: "Free strap fitting and adjustment with purchase." },
    { icon: "lens2", title: "Contact Lens Fitting", desc: "Trial lenses and personalised contact lens fitting." }
  ]
};

export const formatINR = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const discountPct = (price: number, mrp: number) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const dateFmt = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const timeFmt = (iso: string | Date) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
