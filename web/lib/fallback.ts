import type { HomeDiscovery } from "./types";
import { artworkFor } from "./artwork";

const updatedAt = "2026-10-24T00:00:00Z";
const openRecord = (id: number, title: string, nativeTitle: string, description: string, format: string, year: number, genres: string[]) => ({
  id,
  qid: `Q${id}`,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  title,
  nativeTitle,
  description,
  coverImage: artworkFor({ id, coverImage: "" }),
  format,
  status: "FINISHED",
  seasonYear: year,
  genres,
  sourceLabel: "Wikidata",
  sourceUrl: `https://www.wikidata.org/wiki/Q${id}`,
  updatedAt,
  watchLinks: [],
});

export const fallbackDiscovery: HomeDiscovery = {
  source: "cached open catalogue",
  updatedAt,
  degraded: true,
  shelves: [
    {
      key: "trending",
      title: "Open catalogue highlights",
      subtitle: "A small cached selection appears while the Wikimedia service reconnects.",
      items: [
        openRecord(155653, "Spirited Away", "千と千尋の神隠し", "A Japanese animated fantasy film.", "MOVIE", 2001, ["Fantasy", "Adventure"]),
        openRecord(101244908, "Cowboy Bebop", "カウボーイビバップ", "A Japanese anime television series.", "TV", 1998, ["Science fiction", "Western"]),
        openRecord(336012, "The Girl Who Leapt Through Time", "時をかける少女", "A Japanese animated science-fiction film.", "MOVIE", 2006, ["Science fiction", "Drama"]),
        openRecord(4006754, "Adolescence of Utena", "少女革命ウテナ アドゥレセンス黙示録", "A Japanese animated film.", "MOVIE", 1999, ["Fantasy", "Drama"]),
        openRecord(5058811, "Cencoroll", "センコロール", "A Japanese anime film.", "MOVIE", 2009, ["Science fiction"]),
      ],
    },
    { key: "current", title: "Recently released", subtitle: "Recent records return when Wikimedia is available.", items: [] },
    { key: "top-rated", title: "Community favourites", subtitle: "Anime Index ratings appear as viewers publish reviews.", items: [] },
    { key: "upcoming", title: "Coming next", subtitle: "Upcoming records return when Wikimedia is available.", items: [] },
  ],
};
