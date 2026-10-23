import Image from "next/image";
import Link from "next/link";
import type { AnimeTitle } from "@/lib/types";
import { StarIcon } from "./Icons";

export function AnimeCard({ anime, rank }: { anime: AnimeTitle; rank?: number }) {
  return <article className="anime-card"><Link href={`/anime/${anime.id}/${anime.slug}`}><div className="poster"><Image src={anime.coverImage} alt={`${anime.title} cover`} fill sizes="(max-width: 600px) calc(50vw - 2rem), (max-width: 950px) calc(33vw - 2rem), 18vw" />{rank && <span className="rank">{String(rank).padStart(2, "0")}</span>}<span className="score"><StarIcon />{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "—"}</span></div><div className="card-copy"><h3>{anime.title}</h3><p>{[anime.format, anime.seasonYear, anime.episodes ? `${anime.episodes} eps` : undefined].filter(Boolean).join(" · ")}</p><div>{anime.genres.slice(0, 2).map((genre) => <span key={genre}>{genre}</span>)}</div></div></Link></article>;
}
