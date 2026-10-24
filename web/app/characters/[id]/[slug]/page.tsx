import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCharacter } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  const { id, slug } = await params;
  const character = await getCharacter(Number(id));
  if (!character) return { title: "Anime character", robots: { index: false } };
  const description = (character.description || `Explore ${character.name}'s anime appearances and Japanese voice actors.`).slice(0, 155);
  return { title: character.name, description, alternates: { canonical: `/characters/${id}/${slug}` }, openGraph: { title: character.name, description, images: character.image ? [character.image] : [] } };
}

export default async function CharacterPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  const character = await getCharacter(Number(id));
  if (!character) return <section className="section search-page"><span className="kicker">CHARACTER RECORD</span><h1>Character details are unavailable.</h1><p>The provider may be rate limited. Return to the index and try again.</p><Link className="primary-action" href="/characters">Back to characters</Link></section>;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anime-index.65-0-27-27.sslip.io";
  const graph = { "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: { "@type": "Person", name: character.name, alternateName: character.nativeName || undefined, image: character.image || undefined, description: character.description || undefined, sameAs: character.sourceUrl ? [character.sourceUrl] : undefined }, breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Characters", item: `${siteUrl}/characters` }, { "@type": "ListItem", position: 2, name: character.name }] } };

  return <section className="section character-detail">
    <div className="character-profile"><div><div className="character-portrait">{character.image ? <Image src={character.image} alt={`${character.name} portrait`} fill sizes="(max-width: 700px) 80vw, 24rem" /> : <div className="poster-placeholder"><span>{character.name.slice(0, 2).toUpperCase()}</span><small>OPEN CATALOGUE</small></div>}</div>{character.imageAttribution && <a className="media-credit" href={character.imageAttribution.sourceUrl} target="_blank" rel="noreferrer">Image: {character.imageAttribution.creator} · {character.imageAttribution.license}</a>}</div><div><span className="kicker">CHARACTER PROFILE</span><h1>{character.name}</h1>{character.nativeName && <p className="native">{character.nativeName}</p>}<div className="character-facts">{character.gender && <span>{character.gender}</span>}{character.age && <span>Age {character.age}</span>}<span>Open knowledge record</span></div><p className="character-description">{character.description || "A detailed biography has not been supplied by the source."}</p>{character.sourceUrl && <a className="source-link" href={character.sourceUrl} target="_blank" rel="noreferrer">View source on {character.sourceLabel || "Wikidata"} ↗</a>}</div></div>
    <div className="character-sections"><section><span className="kicker">APPEARANCES</span><h2>Anime roles</h2><div className="appearance-grid">{character.appearances.map((anime) => <Link href={`/anime/${anime.id}/${anime.slug}`} key={anime.id}><div>{anime.coverImage && <Image src={anime.coverImage} alt="" fill sizes="8rem" />}</div><span><b>{anime.title}</b><small>{anime.role}</small></span></Link>)}</div></section><section><span className="kicker">JAPANESE CAST</span><h2>Voice actors</h2><div className="voice-list">{character.voiceActors.map((actor) => <a href={actor.siteUrl || "#"} target={actor.siteUrl ? "_blank" : undefined} rel="noreferrer" key={actor.id}>{actor.image?.large && <Image src={actor.image.large} alt="" width={56} height={56} />}<span><b>{actor.name.full || actor.name.native}</b><small>{actor.languageV2}</small></span></a>)}</div></section></div>
    {character.mediaCredits && character.mediaCredits.length > 0 && <section className="source-credits"><span className="kicker">MEDIA CREDITS</span><h2>Reusable artwork sources</h2><div>{character.mediaCredits.map((credit) => <a href={credit.sourceUrl} target="_blank" rel="noreferrer" key={credit.sourceUrl}><strong>{credit.creator}</strong><span>{credit.license}</span></a>)}</div></section>}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
  </section>;
}
