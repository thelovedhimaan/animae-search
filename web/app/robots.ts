import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://ec2-13-232-238-146.ap-south-1.compute.amazonaws.com";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account"] }, sitemap: `${base}/sitemap.xml` };
}
