import Link from "next/link";
import { CharacterCard } from "@/components/CharacterCard";
import { searchCharacters } from "@/lib/api";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Anime characters", description: "Explore anime character profiles, appearances, relationships and Japanese voice actors.", alternates: { canonical: "/characters" } };

export default async function CharactersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const response = await searchCharacters(query, page);
  const pageHref = (value: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (value > 1) next.set("page", String(value));
    return `/characters?${next}`;
  };
  return <section className="section character-index"><div className="character-intro"><span className="kicker">CHARACTER INDEX</span><h1>{query ? `Characters matching “${query}”` : "Explore stories through their characters."}</h1><p>Search character profiles, discover their major anime appearances, and follow Japanese voice-actor credits.</p><form className="character-search" action="/characters"><input name="q" defaultValue={query} placeholder="Search characters by name" aria-label="Search characters" /><button type="submit">Search characters</button></form></div>{response.degraded && <div className="inline-notice">Character data is temporarily unavailable. Try again shortly.</div>}<div className="result-meta"><strong>{response.page.total ?? response.results.length} characters</strong><span>Source: {response.source} · Page {response.page.currentPage}</span></div>{response.results.length ? <><div className="character-grid">{response.results.map((character) => <CharacterCard character={character} key={character.id} />)}</div><nav className="pagination" aria-label="Character result pages">{page > 1 ? <Link href={pageHref(page - 1)}>← Previous</Link> : <span />}{response.page.hasNextPage && <Link href={pageHref(page + 1)}>Next →</Link>}</nav></> : <div className="empty"><strong>No characters found.</strong><p>Try another spelling or return to the most-favourited character index.</p>{query && <Link className="primary-action" href="/characters">Browse characters</Link>}</div>}</section>;
}
