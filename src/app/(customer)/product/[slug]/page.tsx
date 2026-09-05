import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlugRSC, getRelatedProductsRSC } from "@/lib/server-products";
import { CANONICAL_URL, SITE } from "@/lib/site";
import ProductDetail from "@/components/product/ProductDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProductBySlugRSC(params.slug);
  if (!p) {
    return {
      title: "Product Not Found",
      description: "The requested product is not available."
    };
  }

  const title = `${p.name} | ${SITE.name}`;
  const description = p.description.slice(0, 160);
  const imageUrl = p.images[0]
    ? p.images[0].startsWith("http")
      ? p.images[0]
      : `${CANONICAL_URL}${p.images[0]}`
    : `${CANONICAL_URL}/images/shop/shop-front.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: `${CANONICAL_URL}/product/${p.slug}`
    },
    openGraph: {
      title,
      description,
      url: `${CANONICAL_URL}/product/${p.slug}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: p.name
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlugRSC(params.slug);

  // Strictly enforce 404 for missing or draft products
  if (!product || product.status !== "published") {
    notFound();
  }

  const related = await getRelatedProductsRSC(product);

  const productUrl = `${CANONICAL_URL}/product/${product.slug}`;
  const imageUrl = product.images[0]?.startsWith("http")
    ? product.images[0]
    : `${CANONICAL_URL}${product.images[0] || "/images/products/mens-chrono-gold.jpg"}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [imageUrl],
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand
    },
    aggregateRating:
      product.reviews_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews_count
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE.name
      },
      url: productUrl
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: CANONICAL_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${CANONICAL_URL}/shop`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
