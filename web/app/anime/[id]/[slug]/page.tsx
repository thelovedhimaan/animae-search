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
  return <><section className="detail-hero" style={{ backgroundImage: `linear-gradient(90deg, #080b12 32%, rgba(8,11,18,.76), #080b12), url(${anime.bannerImage || anime.coverImage})` }}><span className="kicker">{anime.format} · {anime.status}</span><h1>{anime.title}</h1><p className="native">{anime.nativeTitle}</p><p>{anime.description}</p><div className="tag-list">{anime.genres.map((genre) => <span key={genre}>{genre}</span>)}</div><dl><div><dt>Score</dt><dd>{anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "—"}</dd></div><div><dt>Episodes</dt><dd>{anime.episodes ?? "TBA"}</dd></div><div><dt>Source</dt><dd>{anime.sourceLabel}</dd></div></dl><Link className="primary-action" href={`/search?q=${encodeURIComponent(anime.title)}`}>Find similar anime</Link><AnimeActions anime={{ mediaId, title: anime.title, slug: anime.slug, coverImage: anime.coverImage }} /></section><WatchLinks links={anime.watchLinks ?? []} /><AskAnime mediaId={mediaId} anime={anime} /><Reviews mediaId={mediaId} title={anime.title} /></>;
}
