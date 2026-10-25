import { SafePortrait } from "@/components/SafePortrait";

import Link from "next/link";
import type { Metadata } from "next";
import { AnimeActions } from "@/components/AnimeActions";
import { AnimeCast } from "@/components/AnimeCast";
import { AnimeRelations } from "@/components/AnimeRelations";
import { AnimeInformation } from "@/components/AnimeInformation";
import { AskAnime } from "@/components/AskAnime";
import { Reviews } from "@/components/Reviews";
import { WatchLinks } from "@/components/WatchLinks";
import { getAnime } from "@/lib/api";
import { artworkFor, usesEditorialArtwork } from "@/lib/artwork";

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  const { id, slug } = await params;
  const anime = await getAnime(Number(id));
  if (!anime) return { title: "Anime title", robots: { index: false } };
  const description = anime.description?.replace(/<[^>]+>/g, "").slice(0, 155);
  const artwork = artworkFor(anime);
  return { title: `${anime.title} - cast, community rating and official links`, description, alternates: { canonical: `/anime/${id}/${slug}` }, openGraph: { type: "video.tv_show", url: `/anime/${id}/${slug}`, title: anime.title, description, images: artwork ? [{ url: artwork, alt: `${anime.title} editorial artwork` }] : [] }, twitter: { card: "summary_large_image", title: anime.title, description, images: artwork ? [artwork] : [] } };
}

export default async function AnimePage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params;
  const mediaId = Number(id);
  const anime = await getAnime(mediaId);
  if (!anime) return <section className="section detail"><span className="kicker">TITLE RECORD</span><h1>Live title details are connecting.</h1><p>This title is temporarily unavailable from the catalogue provider.</p><Link href="/search">Return to search</Link></section>;
  const artwork = artworkFor(anime);
  const editorial = usesEditorialArtwork(anime);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anime-index.65-0-27-27.sslip.io";
  const titleUrl = `${siteUrl}/anime/${id}/${slug}`;
  const work = {
    "@type": anime.format === "MOVIE" ? "Movie" : "TVSeries",
    "@id": `${titleUrl}#title`,
    url: titleUrl,
    name: anime.title,
    alternateName: anime.nativeTitle || undefined,
    image: artwork || undefined,
    description: anime.description,
    genre: anime.genres,
    numberOfEpisodes: anime.episodes,
    datePublished: anime.seasonYear ? String(anime.seasonYear) : undefined,
    actor: anime.cast?.slice(0, 12).map((member) => ({ "@type": "Person", name: member.voiceActor?.name || member.name })),
    potentialAction: anime.watchLinks?.map((link) => ({ "@type": "WatchAction", target: link.url, name: `Watch on ${link.site}` }))
  };
  const graph = { "@context": "https://schema.org", "@graph": [work, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Anime", item: siteUrl }, { "@type": "ListItem", position: 2, name: anime.title, item: titleUrl }] }] };

  return <article className="title-page">
    <section className="title-overview" id="overview">
      <div className="title-backdrop" style={{ backgroundImage: anime.bannerImage || artwork ? `linear-gradient(90deg, rgba(8,11,18,.96), rgba(8,11,18,.76), rgba(8,11,18,.93)), url(${anime.bannerImage || artwork})` : "radial-gradient(circle at 20% 30%, rgba(214,255,75,.14), transparent 34rem)" }} />
      <div className="title-shell">
        <div><div className="title-poster">{artwork ? <SafePortrait fallback={anime.title.charAt(0)} src={artwork} alt={`${anime.title} editorial artwork`} priority sizes="(max-width: 720px) 44vw, 18rem" /> : <div className="poster-placeholder"><span>{anime.title.slice(0, 2).toUpperCase()}</span><small>WIKIDATA RECORD</small></div>}</div>{anime.imageAttribution && <a className="media-credit" href={anime.imageAttribution.sourceUrl} target="_blank" rel="noreferrer">Image: {anime.imageAttribution.creator} · {anime.imageAttribution.license}</a>}{editorial && <span className="media-credit">Original Anime Index editorial artwork</span>}</div>
        <div className="title-summary">
          <span className="kicker">{anime.format} · {anime.status}</span>
          <h1>{anime.title}</h1>
          {anime.nativeTitle && <p className="native">{anime.nativeTitle}</p>}
          <p className="title-description">{anime.description}</p>
          <dl className="title-facts"><div><dt>Anime Index rating</dt><dd>{anime.averageScore ? `${(anime.averageScore / 10).toFixed(1)} (${anime.ratingCount ?? 0})` : "New"}</dd></div><div><dt>Episodes</dt><dd>{anime.episodes ?? "TBA"}</dd></div><div><dt>Season</dt><dd>{[anime.season, anime.seasonYear].filter(Boolean).join(" ") || "TBA"}</dd></div><div><dt>Source</dt><dd>{anime.sourceUrl ? <a href={anime.sourceUrl} target="_blank" rel="noreferrer">{anime.sourceLabel} ↗</a> : anime.sourceLabel}</dd></div></dl>
          <div className="tag-list">{anime.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
          <div className="title-actions"><Link className="primary-action" href={`/search?q=${encodeURIComponent(anime.title)}`}>Find similar</Link><AnimeActions anime={{ mediaId, title: anime.title, slug: anime.slug, coverImage: artwork }} /></div>
          {anime.textAttribution && <p className="text-credit">Summary adapted from <a href={anime.textAttribution.sourceUrl} target="_blank" rel="noreferrer">{anime.textAttribution.source}</a> under <a href={anime.textAttribution.licenseUrl} target="_blank" rel="noreferrer">{anime.textAttribution.license}</a>.</p>}
        </div>
      </div>
    </section>
    <nav className="title-section-nav" aria-label="Title page sections"><a href="#overview">Overview</a><a href="#story">Story</a><a href="#cast">Cast</a><a href="#details">Details</a><a href="#related">Related</a><a href="#watch">Where to watch</a><a href="#ask">Ask Anime Index</a><a href="#reviews">Reviews</a></nav>
    <div className="title-content"><AnimeInformation anime={anime} /><AnimeCast cast={anime.cast ?? []} studios={anime.studios ?? []} /><AnimeRelations relations={anime.relations ?? []} trailer={anime.trailer} /><WatchLinks links={anime.watchLinks ?? []} officialLinks={anime.officialLinks ?? []} /><AskAnime mediaId={mediaId} anime={anime} /><Reviews mediaId={mediaId} title={anime.title} />{anime.mediaCredits && anime.mediaCredits.length > 0 && <section className="source-credits"><span className="kicker">MEDIA CREDITS</span><h2>Reusable artwork sources</h2><div>{anime.mediaCredits.map((credit) => <a href={credit.sourceUrl} target="_blank" rel="noreferrer" key={credit.sourceUrl}><strong>{credit.creator}</strong><span>{credit.license}</span></a>)}</div></section>}</div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
  </article>;
}
