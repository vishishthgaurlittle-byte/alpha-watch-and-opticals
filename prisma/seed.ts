import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Categories
  const categories = [
    { id: "c-mens", name: "Men's Watches", slug: "mens-watches", image: "/images/products/mens-black-dial.jpg", sortOrder: 1 },
    { id: "c-womens", name: "Women's Watches", slug: "womens-watches", image: "/images/products/womens-gold-watch.jpg", sortOrder: 2 },
    { id: "c-sunglasses", name: "Sunglasses", slug: "sunglasses", image: "/images/products/sunglasses-aviator.jpg", sortOrder: 3 },
    { id: "c-optical", name: "Optical Glasses", slug: "optical-glasses", image: "/images/products/optical-frame.jpg", sortOrder: 4 },
    { id: "c-lenses", name: "Contact Lenses", slug: "contact-lenses", image: "/images/products/contact-lens.jpg", sortOrder: 5 },
    { id: "c-accessories", name: "Accessories", slug: "watch-accessories", image: "/images/products/watch-strap.jpg", sortOrder: 6 }
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: c,
      create: c
    });
  }

  // 2. Published Products
  const products = [
    {
      id: "p-chrono",
      name: "Alpha Chrono Gold Automatic",
      slug: "alpha-chrono-gold-automatic",
      sku: "AW-M-001",
      brand: "Alpha Signature",
      categoryId: "c-mens",
      price: 18999,
      mrp: 24999,
      stock: 12,
      status: "published",
      description:
        "A statement piece inspired by classic pilot chronographs. The Alpha Chrono Gold Automatic features a 41mm brushed steel case, gold bezel and a deep navy sunburst dial, powered by a reliable 21-jewel automatic movement with a 40-hour power reserve. Sapphire-coated crystal and 5 ATM water resistance make it a durable daily companion.",
      specsJson: JSON.stringify({
        "Case Diameter": "41 mm",
        Movement: "Automatic Mechanical (21 jewels)",
        Glass: "Sapphire-coated mineral crystal",
        "Water Resistance": "5 ATM",
        Strap: "Stainless Steel Gold Bracelet",
        Warranty: "2 Years Store Warranty"
      }),
      imagesJson: JSON.stringify(["/images/products/mens-chrono-gold.jpg"]),
      badgesJson: JSON.stringify(["Best Seller"]),
      rating: 4.9,
      reviewsCount: 3,
      variants: [
        { variantType: "Strap", value: "Steel Gold", stock: 12 },
        { variantType: "Strap", value: "Leather Brown", stock: 6 }
      ]
    },
    {
      id: "p-black-dial",
      name: "Steel Night Black Dial Watch",
      slug: "steel-night-black-dial-watch",
      sku: "AW-M-002",
      brand: "Alpha Signature",
      categoryId: "c-mens",
      price: 7499,
      mrp: 9999,
      stock: 20,
      status: "published",
      description:
        "The Steel Night brings understated luxury to your everyday. Features a clean black sunburst dial with luminous hands, framed by a polished stainless steel link bracelet. High-precision Japanese quartz movement and hardened mineral glass.",
      specsJson: JSON.stringify({
        "Case Diameter": "39 mm",
        Movement: "Japanese Quartz Precision",
        Glass: "Hardened mineral crystal",
        "Water Resistance": "3 ATM",
        Strap: "Stainless Steel Link",
        Warranty: "1 Year Official Warranty"
      }),
      imagesJson: JSON.stringify(["/images/products/mens-black-dial.jpg"]),
      badgesJson: JSON.stringify(["New Arrival"]),
      rating: 4.8,
      reviewsCount: 2,
      variants: [
        { variantType: "Strap", value: "Steel Black", stock: 20 },
        { variantType: "Strap", value: "Steel Silver", stock: 12 }
      ]
    },
    {
      id: "p-womens-gold",
      name: "Bella Rose Gold Pearl Watch",
      slug: "bella-rose-gold-pearl-watch",
      sku: "AW-W-001",
      brand: "Alpha Petite",
      categoryId: "c-womens",
      price: 8999,
      mrp: 11999,
      stock: 15,
      status: "published",
      description:
        "Effortless elegance for Indian celebrations and everyday grace. Featuring a slim rose-gold-tone mesh bracelet and an iridescent mother-of-pearl dial with delicate crystal hour markers. A refined 28mm case that feels feather-light on the wrist.",
      specsJson: JSON.stringify({
        "Case Diameter": "28 mm",
        Movement: "Swiss Quartz Movement",
        Glass: "Sapphire-coated mineral",
        "Water Resistance": "3 ATM",
        Strap: "Rose Gold Mesh Bracelet",
        Warranty: "1 Year Warranty"
      }),
      imagesJson: JSON.stringify(["/images/products/womens-gold-watch.jpg"]),
      badgesJson: JSON.stringify(["Trending"]),
      rating: 5.0,
      reviewsCount: 2,
      variants: [
        { variantType: "Strap", value: "Rose Gold Mesh", stock: 15 },
        { variantType: "Strap", value: "White Leather", stock: 8 }
      ]
    },
    {
      id: "p-aviator",
      name: "Gold Aviator Gradient Sunglasses",
      slug: "gold-aviator-gradient-sunglasses",
      sku: "AW-S-001",
      brand: "Alpha Eyewear",
      categoryId: "c-sunglasses",
      price: 2499,
      mrp: 3499,
      stock: 25,
      status: "published",
      description:
        "Timeless aviator sunglasses engineered with a feather-light gold metal frame and high-clarity CR-39 UV400 lenses. Provides 100% protection against harmful UVA and UVB rays. Includes premium hard case and microfiber cleaning cloth.",
      specsJson: JSON.stringify({
        "Frame Material": "Lightweight Monel Metal",
        Lens: "CR-39 UV400 Gradient",
        "UV Protection": "100% UVA/UVB Filter",
        Fit: "Unisex Standard",
        Included: "Hard Protective Case + Cloth",
        Warranty: "1 Year Warranty"
      }),
      imagesJson: JSON.stringify(["/images/products/sunglasses-aviator.jpg"]),
      badgesJson: JSON.stringify(["Best Seller"]),
      rating: 4.8,
      reviewsCount: 3,
      variants: [
        { variantType: "Lens", value: "Green Gradient", stock: 25 },
        { variantType: "Lens", value: "Smoke Black", stock: 14 }
      ]
    },
    {
      id: "p-optical",
      name: "Clarity Rectangular Optical Frame",
      slug: "clarity-rectangular-optical-frame",
      sku: "AW-O-001",
      brand: "Alpha Eyewear",
      categoryId: "c-optical",
      price: 1999,
      mrp: 2999,
      stock: 30,
      status: "published",
      description:
        "Contemporary rectangular frame handcrafted in premium lightweight acetate. Extremely durable, flexible, and comfortable for all-day wear. Compatible with single vision, computer blue-cut, and progressive lenses. Free computerized eye checkup and fitting at our Raebareli store.",
      specsJson: JSON.stringify({
        "Frame Material": "High-Density Acetate",
        Shape: "Rectangular Full-Rim",
        "Lens Compatibility": "Single Vision / Blue Cut / Progressive",
        "Free In-Store Service": "Computerized Eye Testing & Custom Fitting",
        Warranty: "1 Year Frame Warranty"
      }),
      imagesJson: JSON.stringify(["/images/products/optical-frame.jpg"]),
      badgesJson: JSON.stringify([]),
      rating: 4.7,
      reviewsCount: 2,
      variants: [
        { variantType: "Lens Option", value: "Single Vision", stock: 30 },
        { variantType: "Lens Option", value: "Blue Cut Anti-Glare", stock: 18 },
        { variantType: "Lens Option", value: "Progressive Multifocal", stock: 12 }
      ]
    },
    {
      id: "p-lens",
      name: "Daily Comfort Contact Lenses",
      slug: "daily-comfort-contact-lenses",
      sku: "AW-L-001",
      brand: "Alpha Vision",
      categoryId: "c-lenses",
      price: 999,
      mrp: 1299,
      stock: 60,
      status: "published",
      description:
        "Ultra-thin daily disposable hydrogel contact lenses providing continuous hydration and high oxygen permeability. Free trial and keratometry eye fitting available in-store to ensure optimal comfort for your cornea.",
      specsJson: JSON.stringify({
        Material: "Hilafilcon B Hydrogel (59% Water)",
        "Wear Schedule": "Daily Disposable",
        "Base Curve": "8.6 mm",
        "Pack Size": "30 Sterile Lenses",
        "Free Service": "Trial & Power Fitting at Store"
      }),
      imagesJson: JSON.stringify(["/images/products/contact-lens.jpg"]),
      badgesJson: JSON.stringify([]),
      rating: 4.9,
      reviewsCount: 1,
      variants: [
        { variantType: "Power", value: "Plano (-0.00)", stock: 60 },
        { variantType: "Power", value: "-1.00", stock: 40 },
        { variantType: "Power", value: "-2.00", stock: 35 },
        { variantType: "Power", value: "-3.00", stock: 30 }
      ]
    },
    {
      id: "p-strap",
      name: "Premium Leather Quick-Release Strap",
      slug: "premium-leather-watch-strap",
      sku: "AW-A-001",
      brand: "Alpha Signature",
      categoryId: "c-accessories",
      price: 699,
      mrp: 999,
      stock: 40,
      status: "published",
      description:
        "Genuine top-grain leather watch straps featuring stainless steel buckles and quick-release spring bars for tool-free installation. Free installation and strap sizing available at Alpha Watch & Opticals.",
      specsJson: JSON.stringify({
        Material: "Top-grain Genuine Leather",
        "Strap Width": "20 mm / 22 mm",
        Buckle: "Brushed Gold Stainless Steel",
        "Free Service": "In-Store Fitting & Wrist Sizing",
        Warranty: "6 Months"
      }),
      imagesJson: JSON.stringify(["/images/products/watch-strap.jpg"]),
      badgesJson: JSON.stringify([]),
      rating: 4.8,
      reviewsCount: 2,
      variants: [
        { variantType: "Color", value: "Classic Brown (20mm)", stock: 20 },
        { variantType: "Color", value: "Midnight Black (20mm)", stock: 20 },
        { variantType: "Color", value: "Tan Brown (22mm)", stock: 15 }
      ]
    },
    {
      id: "p-emerald-draft",
      name: "Emerald Automatic Limited Edition",
      slug: "emerald-automatic-limited-edition",
      sku: "AW-M-003",
      brand: "Alpha Signature",
      categoryId: "c-mens",
      price: 32999,
      mrp: 39999,
      stock: 0,
      status: "draft",
      description: "Unpublished prototype watch.",
      specsJson: "{}",
      imagesJson: JSON.stringify(["/images/products/mens-chrono-gold.jpg"]),
      badgesJson: "[]",
      rating: 5.0,
      reviewsCount: 0,
      variants: []
    }
  ];

  for (const p of products) {
    const { variants, ...prodData } = p;
    await prisma.product.upsert({
      where: { id: p.id },
      update: prodData,
      create: prodData
    });

    if (variants && variants.length > 0) {
      await prisma.variant.deleteMany({ where: { productId: p.id } });
      for (const v of variants) {
        await prisma.variant.create({
          data: {
            productId: p.id,
            variantType: v.variantType,
            value: v.value,
            stock: v.stock
          }
        });
      }
    }
  }

  // 3. Clean up legacy admin/demo accounts and seed real Google Admin
  const adminEmail = (process.env.ADMIN_EMAIL || "vishishthgaurlittle@gmail.com").toLowerCase().trim();

  // Delete legacy/demo accounts
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ["admin@alpha.com", "demo@customer.com", "demo@alpha.com"]
      }
    }
  });

  // Provision the real Google owner account
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Little Vishishth Gaur",
      role: "admin",
      provider: "google"
    },
    create: {
      name: "Little Vishishth Gaur",
      email: adminEmail,
      role: "admin",
      provider: "google"
    }
  });

  // 4. Coupons
  const coupons = [
    { code: "WELCOME10", type: "percent", value: 10, minCart: 999, usageLimit: 500, used: 12 },
    { code: "ALPHA200", type: "fixed", value: 200, minCart: 1999, usageLimit: 200, used: 5 }
  ];

  for (const cp of coupons) {
    await prisma.coupon.upsert({
      where: { code: cp.code },
      update: cp,
      create: cp
    });
  }

  // 5. Store Global Setting
  await prisma.setting.upsert({
    where: { id: "global_settings" },
    update: {},
    create: {
      id: "global_settings",
      globalTheme: "obsidian"
    }
  });

  console.log("Database seeded successfully! Real Google admin account provisioned.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
