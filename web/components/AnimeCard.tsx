import { SafePortrait } from "@/components/SafePortrait";

import Link from "next/link";
import type { AnimeTitle } from "@/lib/types";
import { artworkFor, usesEditorialArtwork } from "@/lib/artwork";
import { StarIcon } from "./Icons";

export function AnimeCard({ anime, rank }: { anime: AnimeTitle; rank?: number }) {
  const credit = anime.imageAttribution;
  const artwork = artworkFor(anime);
  const editorial = usesEditorialArtwork(anime);
  return <article className="anime-card">
    <Link href={`/anime/${anime.id}/${anime.slug}`}>
      <div className="poster">
        {artwork
          ? <SafePortrait fallback={anime.title.charAt(0)} src={artwork} alt={`${anime.title} editorial artwork`} sizes="(max-width: 600px) calc(50vw - 2rem), (max-width: 950px) calc(33vw - 2rem), 18vw" />
          : <div className="poster-placeholder"><span>{anime.title.slice(0, 2).toUpperCase()}</span><small>OPEN CATALOGUE</small></div>}
        {rank && <span className="rank">{String(rank).padStart(2, "0")}</span>}
        <span className="score" title="Anime Index community rating"><StarIcon />{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "NEW"}</span>
      </div>
      <div className="card-copy"><h3>{anime.title}</h3><p>{[anime.format, anime.seasonYear, anime.episodes ? `${anime.episodes} eps` : undefined].filter(Boolean).join(" · ")}</p><div>{anime.genres.slice(0, 2).map((genre) => <span key={genre}>{genre}</span>)}</div></div>
    </Link>
    {credit && <a className="card-credit" href={credit.sourceUrl} target="_blank" rel="noreferrer">Image: {credit.creator} · {credit.license}</a>}
    {editorial && <span className="card-credit">Original Anime Index editorial artwork</span>}
  </article>;
}
