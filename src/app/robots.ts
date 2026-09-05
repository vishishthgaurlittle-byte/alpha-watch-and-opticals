import { MetadataRoute } from "next";
import { CANONICAL_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/auth/"]
    },
    sitemap: `${CANONICAL_URL}/sitemap.xml`
  };
}
