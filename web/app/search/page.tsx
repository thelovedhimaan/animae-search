import Link from "next/link";
import { AnimeCard } from "@/components/AnimeCard";
import { SearchFilters } from "@/components/SearchFilters";
import { SearchForm } from "@/components/SearchForm";
import { searchAnime } from "@/lib/api";
import type { SearchFilters as Filters } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search anime", description: "Search and filter anime by title, genre, format, season, status and ranking.", robots: { index: false, follow: true } };

const clean = (value: string | undefined) => value?.trim().toLowerCase() ?? "";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const filters: Filters = { q: params.q?.trim() ?? "", page: Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1), sort: clean(params.sort) || "relevance", format: clean(params.format), status: clean(params.status), season: clean(params.season), genre: params.genre?.trim() ?? "" };
  const response = await searchAnime(filters);
  const pageHref = (page: number) => { const next = new URLSearchParams(); Object.entries({ ...filters, page }).forEach(([key, value]) => { if (value !== "" && value !== 1) next.set(key, String(value)); }); return `/search?${next}`; };
  const filterCount = [filters.format, filters.status, filters.season, filters.genre].filter(Boolean).length;
  return <section className="search-page section"><span className="kicker">CATALOGUE SEARCH</span><h1>{filters.q ? `Results for “${filters.q}”` : "Explore the anime index"}</h1><p>Search open title records, then narrow the catalogue by format, status, season, genre, or community ranking.</p><SearchForm defaultValue={filters.q} compact /><SearchFilters filters={filters} />{response.degraded && <div className="inline-notice">Live Wikimedia search is temporarily unavailable, so these results use a small cached open catalogue.</div>}<div className="result-meta"><strong>{response.page.total ?? response.results.length} results</strong><span>{filterCount ? `${filterCount} active filters · ` : ""}Page {response.page.currentPage}</span></div>{response.results.length ? <><div className="results-grid">{response.results.map((anime) => <AnimeCard anime={anime} key={anime.id} />)}</div><nav className="pagination" aria-label="Search result pages">{filters.page > 1 ? <Link href={pageHref(filters.page - 1)}>← Previous</Link> : <span />}{response.page.hasNextPage && <Link href={pageHref(filters.page + 1)}>Next →</Link>}</nav></> : <div className="empty"><strong>No titles match this combination yet.</strong><p>Remove a filter, try a broader title, or browse the most documented anime.</p><Link className="primary-action" href="/search?sort=popular">Browse open catalogue</Link></div>}</section>;
}
