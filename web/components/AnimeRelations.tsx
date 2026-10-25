"use client";

import { SafePortrait } from "@/components/SafePortrait";
import { useCallback, useState } from "react";
import { TrailerPlayer } from "@/components/TrailerPlayer";
import Link from "next/link";
import type { AnimeTitle } from "@/lib/types";

export function AnimeRelations({ relations, trailer }: { relations: NonNullable<AnimeTitle["relations"]>; trailer: AnimeTitle["trailer"] }) {
  const [failedVideo, setFailedVideo] = useState<string>();
  const hideTrailer = useCallback(() => setFailedVideo(trailer?.id), [trailer?.id]);
  const videoId = trailer?.site === "youtube" && trailer.id !== failedVideo && /^[\w-]{11}$/.test(trailer.id) ? trailer.id : undefined;
  const trailerUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined;
  if (!relations.length && !trailerUrl) return null;
  return <section className="anime-relations section" id="related"><div className="section-head"><div><span className="kicker">MEDIA AND CONNECTIONS</span><h2>{videoId ? "Trailer and related anime" : "Related anime"}</h2></div>{trailerUrl && <a href={trailerUrl} target="_blank" rel="noreferrer">Watch on YouTube ↗</a>}</div>{videoId && <TrailerPlayer key={videoId} videoId={videoId} onUnavailable={hideTrailer} />}<div className="relation-grid">{relations.map((item) => <Link href={`/anime/${item.id}/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={`${item.relation}-${item.id}`}><div><SafePortrait src={item.coverImage} alt={`${item.title} poster`} fallback={item.title.charAt(0)} /></div><span><small>{item.relation.replaceAll("_", " ")}</small><strong>{item.title}</strong><p>{item.format}</p></span></Link>)}</div></section>;
}
