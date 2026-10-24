import type { MetadataRoute } from "next";
import { getHomeDiscovery } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://anime-index.65-0-27-27.sslip.io";
  const discovery = await getHomeDiscovery();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/characters`, changeFrequency: "daily", priority: .8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: .6 }
  ];
  const titles = Array.from(new Map(discovery.shelves.flatMap((shelf) => shelf.items).map((anime) => [anime.id, anime])).values());
  return [...staticRoutes, ...titles.map((anime) => ({ url: `${base}/anime/${anime.id}/${anime.slug}`, lastModified: anime.updatedAt ? new Date(anime.updatedAt) : undefined, changeFrequency: "weekly" as const, priority: .75 }))];
}
