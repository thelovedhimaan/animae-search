import { fallbackDiscovery } from "./fallback";
import type { AnimeTitle, HomeDiscovery, SearchFilters, SearchResponse } from "./types";

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

export async function searchAnime(filters: SearchFilters): Promise<SearchResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value !== "" && value !== 1) params.set(key, String(value)); });
  try {
    const response = await fetch(`${API_URL}/api/v1/search?${params}`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Search request failed: ${response.status}`);
    return response.json() as Promise<SearchResponse>;
  } catch {
    const all = Array.from(new Map(fallbackDiscovery.shelves.flatMap((shelf) => shelf.items).map((item) => [item.id, item])).values());
    const filtered = all.filter((item) => (!filters.q || `${item.title} ${item.nativeTitle} ${item.genres.join(" ")}`.toLowerCase().includes(filters.q.toLowerCase())) && (!filters.format || item.format.toLowerCase() === filters.format) && (!filters.status || item.status.toLowerCase().includes(filters.status)) && (!filters.season || item.season?.toLowerCase() === filters.season) && (!filters.genre || item.genres.some((genre) => genre.toLowerCase() === filters.genre.toLowerCase())));
    return { results: filtered, page: { currentPage: 1, lastPage: 1, hasNextPage: false, total: filtered.length }, degraded: true };
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
