import Image from "next/image";
import Link from "next/link";
import type { AnimeTitle } from "@/lib/types";

export function AnimeRelations({ relations, trailer }: { relations: NonNullable<AnimeTitle["relations"]>; trailer: AnimeTitle["trailer"] }) {
  const trailerUrl = trailer?.site === "youtube" ? `https://www.youtube.com/watch?v=${trailer.id}` : undefined;
  const videoId = trailer?.site === "youtube" && /^[\w-]{11}$/.test(trailer.id) ? trailer.id : undefined;
  if (!relations.length && !trailerUrl) return null;
  return <section className="anime-relations section" id="related"><div className="section-head"><div><span className="kicker">MEDIA AND CONNECTIONS</span><h2>{videoId ? "Trailer and related anime" : "Related anime"}</h2></div>{trailerUrl && <a href={trailerUrl} target="_blank" rel="noreferrer">Watch on YouTube ↗</a>}</div>{videoId && <div className="trailer-player"><iframe src={`https://www.youtube-nocookie.com/embed/${videoId}`} title="Anime trailer" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>}<div className="relation-grid">{relations.map((item) => <Link href={`/anime/${item.id}/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={`${item.relation}-${item.id}`}><div>{item.coverImage && <Image src={item.coverImage} alt="" fill sizes="5rem" />}</div><span><small>{item.relation.replaceAll("_", " ")}</small><strong>{item.title}</strong><p>{item.format}</p></span></Link>)}</div></section>;
}
