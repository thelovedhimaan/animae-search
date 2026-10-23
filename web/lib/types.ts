export type AnimeTitle = {
  id: number;
  slug: string;
  title: string;
  nativeTitle?: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  format: string;
  status: string;
  season?: string;
  seasonYear?: number;
  episodes?: number;
  duration?: number;
  genres: string[];
  averageScore?: number;
  popularity?: number;
  trending?: number;
  studios?: string[];
  sourceLabel: string;
  updatedAt: string;
};

export type DiscoveryShelf = { key: string; title: string; subtitle: string; items: AnimeTitle[] };
export type HomeDiscovery = { shelves: DiscoveryShelf[]; source: string; updatedAt: string; degraded?: boolean };
export type SearchFilters = { q: string; page: number; sort: string; format: string; status: string; season: string; genre: string };
export type SearchResponse = { results: AnimeTitle[]; page: { currentPage: number; lastPage?: number; hasNextPage: boolean; total?: number; perPage?: number }; degraded?: boolean };
