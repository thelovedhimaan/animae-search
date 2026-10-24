import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://ec2-13-232-238-146.ap-south-1.compute.amazonaws.com";
  return ["", "/search", "/characters", "/account"].map((path, index) => ({ url: `${base}${path}`, changeFrequency: index === 0 ? "daily" : "weekly", priority: index === 0 ? 1 : .8 }));
}
