import type { AnimeTitle } from "./types";

const editorialArtwork: Record<number, string> = {
  155653: "/artwork/spirited-away.webp",
  101244908: "/artwork/cowboy-bebop.webp",
  336012: "/artwork/girl-who-leapt-through-time.webp",
  4006754: "/artwork/adolescence-of-utena.webp",
  5058811: "/artwork/cencoroll.webp",
};

export function artworkFor(anime: Pick<AnimeTitle, "id" | "coverImage">) {
  return anime.coverImage || editorialArtwork[anime.id] || "";
}

export function usesEditorialArtwork(anime: Pick<AnimeTitle, "id" | "coverImage">) {
  return !anime.coverImage && Boolean(editorialArtwork[anime.id]);
}
