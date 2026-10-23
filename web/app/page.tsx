import Link from "next/link";
import { AnimeCard } from "@/components/AnimeCard";
import { SearchForm } from "@/components/SearchForm";
import { getHomeDiscovery } from "@/lib/api";

const paths = [
  ["Explore by mood", "Quiet, strange, triumphant or devastating—start with how you want a story to feel.", "Moods", "#d6ff4b"],
  ["Follow every connection", "Move through sequels, adaptations, characters, studios and shared creative teams.", "Relations", "#8c7cff"],
  ["Know where to watch", "Compare current official availability by region and understand when it was verified.", "Watch", "#ff6b6b"]
];

export default async function HomePage() {
  const discovery = await getHomeDiscovery();
  const trending = discovery.shelves[0]?.items ?? [];
  const hero = trending[0];
  return <>
    <section className="hero">
      <div className="hero-noise" />
      <div className="hero-copy"><span className="kicker">THE ANIME DISCOVERY ENGINE</span><h1>Find the story<br />that stays with you.</h1><p>Search across worlds, characters, studios and seasons. Compare trusted ratings, understand every connection, and find official places to watch.</p><SearchForm /><div className="quick-links"><span>Try:</span><Link href="/search?q=psychological">Psychological</Link><Link href="/search?q=short+anime">Short series</Link><Link href="/search?q=found+family">Found family</Link></div></div>
      <div className="hero-art" aria-hidden="true"><div className="sun"/><div className="slash one"/><div className="slash two"/><div className="hero-stat"><small>COMMUNITY PULSE</small><strong>Trending changes fast.</strong><span>Fresh catalogue snapshots keep discovery honest.</span></div></div>
    </section>

    {discovery.degraded && <div className="degraded"><strong>Preview data active.</strong> Live catalogue sync will resume when the API is available.</div>}

    {discovery.shelves.map((shelf, shelfIndex) => shelf.items.length > 0 && <section className="section shelf" key={shelf.key}><div className="section-head"><div><span className="kicker">{shelfIndex === 0 ? "COMMUNITY PULSE" : "CURATED DISCOVERY"}</span><h2>{shelf.title}</h2><p>{shelf.subtitle}</p></div><Link href={`/search?sort=${shelf.key === "top-rated" ? "score" : shelf.key === "upcoming" ? "popular&status=upcoming" : shelf.key === "current" ? "popular" : "trending"}`}>View all <span>→</span></Link></div><div className="card-row">{shelf.items.slice(0, 5).map((anime, index) => <AnimeCard anime={anime} rank={shelfIndex === 0 ? index + 1 : undefined} key={anime.id} />)}</div></section>)}

    <section className="section editorial"><span className="kicker">DISCOVER DIFFERENTLY</span><h2>More than a title search.</h2><div className="editorial-grid">{paths.map(([title, copy, label, color], index) => <article style={{ "--card-accent": color } as React.CSSProperties} key={title}><span>0{index + 1} / {label}</span><h3>{title}</h3><p>{copy}</p><Link href="/search">Explore <b>↗</b></Link></article>)}</div></section>

    {hero && <section className="spotlight"><div><span className="kicker">START WITH A CLASSIC</span><h2>{hero.title}</h2><p>{hero.description}</p><div className="tag-list">{hero.genres.map((genre) => <span key={genre}>{genre}</span>)}</div><Link className="primary-action" href={`/anime/${hero.id}/${hero.slug}`}>Open title page</Link></div><div className="spotlight-type"><span>{hero.nativeTitle}</span><strong>{hero.averageScore ? (hero.averageScore / 10).toFixed(1) : "—"}</strong><small>ANILIST COMMUNITY SCORE</small></div></section>}
  </>;
}
