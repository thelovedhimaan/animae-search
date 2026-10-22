import { fallbackDiscovery } from "./fallback";
import type { AnimeTitle, HomeDiscovery } from "./types";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getHomeDiscovery(): Promise<HomeDiscovery> {
  try {
    const response = await fetch(`${API_URL}/api/v1/discovery/home`, { next: { revalidate: 900 }, signal: AbortSignal.timeout(4500) });
    if (!response.ok) throw new Error(`Discovery request failed: ${response.status}`);
    return response.json() as Promise<HomeDiscovery>;
  } catch {
    return fallbackDiscovery;
  }
}

export async function searchAnime(query: string): Promise<AnimeTitle[]> {
  if (!query.trim()) return [];
  try {
    const response = await fetch(`${API_URL}/api/v1/search?q=${encodeURIComponent(query)}`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Search request failed: ${response.status}`);
    const body = await response.json() as { results: AnimeTitle[] };
    return body.results;
  } catch {
    return fallbackDiscovery.shelves.flatMap((shelf) => shelf.items).filter((item) => `${item.title} ${item.nativeTitle} ${item.genres.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  }
}

export async function getAnime(mediaId: number): Promise<AnimeTitle | undefined> {
  try {
    const response = await fetch(`${API_URL}/api/v1/anime/${mediaId}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Title request failed: ${response.status}`);
    return response.json() as Promise<AnimeTitle>;
  } catch {
    return fallbackDiscovery.shelves.flatMap((shelf) => shelf.items).find((item) => item.id === mediaId);
  }
}
