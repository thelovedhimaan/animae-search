import Image from "next/image";
import Link from "next/link";
import type { AnimeTitle } from "@/lib/types";

export function AnimeCast({ cast, studios }: { cast: NonNullable<AnimeTitle["cast"]>; studios: NonNullable<AnimeTitle["studios"]> }) {
  return <section className="anime-cast section" id="cast"><div className="section-head"><div><span className="kicker">CAST AND CREW</span><h2>Characters behind the story</h2></div>{studios.length > 0 && <p>Studio: {studios.map((studio) => studio.name).join(", ")}</p>}</div>{cast.length ? <div className="cast-grid">{cast.map((person) => {
    const content = <><div>{person.image ? <Image src={person.image} alt={`${person.name} portrait`} fill sizes="7rem" /> : <span>{person.name.charAt(0)}</span>}</div><strong>{person.name}</strong><small>{person.role.toLowerCase()}</small>{person.voiceActor?.name && <p>JP · {person.voiceActor.name}</p>}</>;
    return person.externalUrl ? <a href={person.externalUrl} target="_blank" rel="noreferrer" key={`kitsu-${person.id}`}>{content}</a> : <Link href={`/characters/${person.id}/${person.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} key={person.id}>{content}</Link>;
  })}</div> : <p className="empty-inline">Cast details are not available in the current catalogue snapshot.</p>}</section>;
}
