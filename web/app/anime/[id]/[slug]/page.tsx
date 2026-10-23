import Image from "next/image";
import Link from "next/link";
import { AnimeActions } from "@/components/AnimeActions";
import { AskAnime } from "@/components/AskAnime";
import { Reviews } from "@/components/Reviews";
import { WatchLinks } from "@/components/WatchLinks";
import { getAnime } from "@/lib/api";

export default async function AnimePage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  const mediaId = Number(id);
  const anime = await getAnime(mediaId);
  if (!anime) return <section className="section detail"><span className="kicker">TITLE RECORD</span><h1>Live title details are connecting.</h1><p>This route is ready for the Django catalogue API.</p><Link href="/search">Return to search</Link></section>;

  return <article className="title-page">
    <section className="title-overview" id="overview">
      <div className="title-backdrop" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,11,18,.96), rgba(8,11,18,.76), rgba(8,11,18,.93)), url(${anime.bannerImage || anime.coverImage})` }} />
      <div className="title-shell">
        <div className="title-poster"><Image src={anime.coverImage} alt={`${anime.title} cover`} fill priority sizes="(max-width: 720px) 44vw, 18rem" /></div>
        <div className="title-summary">
          <span className="kicker">{anime.format} · {anime.status}</span>
          <h1>{anime.title}</h1>
          {anime.nativeTitle && <p className="native">{anime.nativeTitle}</p>}
          <p className="title-description">{anime.description}</p>
          <dl className="title-facts"><div><dt>Score</dt><dd>{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "—"}</dd></div><div><dt>Episodes</dt><dd>{anime.episodes ?? "TBA"}</dd></div><div><dt>Season</dt><dd>{[anime.season, anime.seasonYear].filter(Boolean).join(" ") || "TBA"}</dd></div><div><dt>Source</dt><dd>{anime.sourceLabel}</dd></div></dl>
          <div className="tag-list">{anime.genres.map((genre) => <span key={genre}>{genre}</span>)}</div>
          <div className="title-actions"><Link className="primary-action" href={`/search?q=${encodeURIComponent(anime.title)}`}>Find similar</Link><AnimeActions anime={{ mediaId, title: anime.title, slug: anime.slug, coverImage: anime.coverImage }} /></div>
        </div>
      </div>
    </section>
    <nav className="title-section-nav" aria-label="Title page sections"><a href="#overview">Overview</a><a href="#watch">Where to watch</a><a href="#ask">Ask Anime Index</a><a href="#reviews">Reviews</a></nav>
    <div className="title-content"><WatchLinks links={anime.watchLinks ?? []} /><AskAnime mediaId={mediaId} anime={anime} /><Reviews mediaId={mediaId} title={anime.title} /></div>
  </article>;
}
