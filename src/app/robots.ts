import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

// Public crawl rules. The authenticated app, the API and private shared
// reports (/r/<token>) are kept out of the index; marketing/legal pages
// are crawlable.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard",
          "/inspections",
          "/reports",
          "/billing",
          "/settings",
          "/support",
          "/admin",
          "/r/",
          "/auth/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
