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
  sourceLabel: string;
  updatedAt: string;
  watchLinks?: { site: string; url: string; icon?: string; color?: string }[];
  cast?: { id: number; name: string; nativeName?: string; image: string; role: string; voiceActor?: { id: number; name: string; image: string } | null }[];
  studios?: { id: number; name: string; url?: string }[];
  relations?: { relation: string; id: number; title: string; format: string; coverImage: string }[];
  trailer?: { id: string; site: string; thumbnail?: string } | null;
};

export type DiscoveryShelf = { key: string; title: string; subtitle: string; items: AnimeTitle[] };
export type HomeDiscovery = { shelves: DiscoveryShelf[]; source: string; updatedAt: string; degraded?: boolean };
export type SearchFilters = { q: string; page: number; sort: string; format: string; status: string; season: string; genre: string };
export type SearchResponse = { results: AnimeTitle[]; page: { currentPage: number; lastPage?: number; hasNextPage: boolean; total?: number; perPage?: number }; degraded?: boolean };

export type CharacterAppearance = { id: number; slug: string; title: string; coverImage: string; role: string };
export type VoiceActor = { id: number; name: { full?: string; native?: string }; image?: { large?: string }; languageV2?: string; siteUrl?: string };
export type AnimeCharacter = { id: number; slug: string; name: string; nativeName: string; alternativeNames: string[]; image: string; description: string; gender: string; age: string; favourites: number; sourceUrl: string; appearances: CharacterAppearance[]; voiceActors: VoiceActor[] };
export type CharacterSearchResponse = { results: AnimeCharacter[]; page: { currentPage: number; lastPage?: number; hasNextPage: boolean; total?: number; perPage?: number }; source: string; degraded?: boolean };
