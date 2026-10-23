import type { HomeDiscovery } from "./types";

const image = (id: string) => `https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/${id}.jpg`;

export const fallbackDiscovery: HomeDiscovery = {
  source: "curated fallback",
  updatedAt: "2026-10-22T00:00:00Z",
  degraded: true,
  shelves: [
    {
      key: "trending",
      title: "Trending now",
      subtitle: "What the anime community is watching and discussing.",
      items: [
        { id: 16498, slug: "attack-on-titan", title: "Attack on Titan", nativeTitle: "進撃の巨人", description: "Humanity fights for survival beyond enormous walls.", coverImage: image("n16498-C6FPmWm59CyP"), format: "TV", status: "Finished", episodes: 25, genres: ["Action", "Drama", "Fantasy"], averageScore: 84, sourceLabel: "AniList", updatedAt: "2026-10-22T00:00:00Z" },
        { id: 1535, slug: "death-note", title: "Death Note", nativeTitle: "DEATH NOTE", description: "A brilliant student discovers a notebook with lethal power.", coverImage: image("n1535-J5r2Fjr1fTX1"), format: "TV", status: "Finished", episodes: 37, genres: ["Mystery", "Psychological", "Thriller"], averageScore: 84, sourceLabel: "AniList", updatedAt: "2026-10-22T00:00:00Z" },
        { id: 113415, slug: "jujutsu-kaisen", title: "JUJUTSU KAISEN", nativeTitle: "呪術廻戦", description: "A student enters the dangerous world of curses and sorcerers.", coverImage: image("n113415-LHBAeoZDIsnF"), format: "TV", status: "Finished", episodes: 24, genres: ["Action", "Supernatural"], averageScore: 85, sourceLabel: "AniList", updatedAt: "2026-10-22T00:00:00Z" },
        { id: 21, slug: "one-piece", title: "ONE PIECE", nativeTitle: "ONE PIECE", description: "A pirate crew crosses the Grand Line in search of the ultimate treasure.", coverImage: image("n21-YCDoj1EkAxFn"), format: "TV", status: "Releasing", genres: ["Action", "Adventure", "Fantasy"], averageScore: 88, sourceLabel: "AniList", updatedAt: "2026-10-22T00:00:00Z" },
        { id: 11061, slug: "hunter-x-hunter-2011", title: "Hunter x Hunter", nativeTitle: "HUNTER×HUNTER", description: "A young hunter searches for his father and discovers a vast world.", coverImage: image("n11061-sIpBprNRfzCe"), format: "TV", status: "Finished", episodes: 148, genres: ["Action", "Adventure", "Fantasy"], averageScore: 90, sourceLabel: "AniList", updatedAt: "2026-10-22T00:00:00Z" }
      ]
    },
    { key: "current", title: "This season", subtitle: "Popular current-season titles from the preview catalogue.", items: [] },
    { key: "top-rated", title: "Top rated", subtitle: "Highest-scoring titles from the preview catalogue.", items: [] },
    { key: "upcoming", title: "Coming next", subtitle: "Upcoming titles return when the live provider is available.", items: [] }
  ]
};
