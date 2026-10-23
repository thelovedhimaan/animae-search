import Image from "next/image";
import Link from "next/link";
import type { AnimeTitle } from "@/lib/types";

export function AnimeRelations({ relations, trailer }: { relations: NonNullable<AnimeTitle["relations"]>; trailer: AnimeTitle["trailer"] }) {
  const trailerUrl = trailer?.site === "youtube" ? `https://www.youtube.com/watch?v=${trailer.id}` : undefined;
  if (!relations.length && !trailerUrl) return null;
  return <section className="anime-relations section" id="related"><div className="section-head"><div><span className="kicker">STORY CONNECTIONS</span><h2>Related anime</h2></div>{trailerUrl && <a href={trailerUrl} target="_blank" rel="noreferrer">Watch official trailer ↗</a>}</div><div className="relation-grid">{relations.map((item) => <Link href={`/anime/${item.id}/${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={`${item.relation}-${item.id}`}><div>{item.coverImage && <Image src={item.coverImage} alt="" fill sizes="5rem" />}</div><span><small>{item.relation.replaceAll("_", " ")}</small><strong>{item.title}</strong><p>{item.format}</p></span></Link>)}</div></section>;
}
