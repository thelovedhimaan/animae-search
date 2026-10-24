import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://anime-index.13-232-238-146.sslip.io";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/search?"] }, sitemap: `${base}/sitemap.xml`, host: base };
}
