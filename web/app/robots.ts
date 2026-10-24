import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://anime-index.65-0-27-27.sslip.io";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/search?"] }, sitemap: `${base}/sitemap.xml`, host: base };
}
