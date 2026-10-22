import { AnimeCard } from "@/components/AnimeCard";
import { SearchForm } from "@/components/SearchForm";
import { searchAnime } from "@/lib/api";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = await searchAnime(q);
  return <section className="search-page section"><span className="kicker">CATALOGUE SEARCH</span><h1>{q ? `Results for “${q}”` : "Search the anime index"}</h1><p>Titles, alternate names, genres, studios and themes in one query.</p><SearchForm defaultValue={q} compact /><div className="result-meta"><strong>{results.length} results</strong><span>Sorted by relevance</span></div>{results.length ? <div className="results-grid">{results.map((anime) => <AnimeCard anime={anime} key={anime.id} />)}</div> : <div className="empty"><strong>{q ? "No close matches yet." : "Begin with a title, character, studio or mood."}</strong><p>Try a broader phrase or explore a genre from the homepage.</p></div>}</section>;
}
