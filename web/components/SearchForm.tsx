"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "./Icons";

type Suggestion = { id: number; title: string; slug: string; format?: string; seasonYear?: number };

export function SearchForm({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function update(value: string) {
    setQuery(value); setActive(-1);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 2) return setResults([]);
    timer.current = setTimeout(async () => {
      const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(value.trim())}`);
      setResults(response.ok ? (await response.json()).results ?? [] : []);
    }, 220);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (active >= 0 && results[active]) return router.push(`/anime/${results[active].id}/${results[active].slug}`);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setResults([]);
  }

  function keys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((value) => Math.min(value + 1, results.length - 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive((value) => Math.max(value - 1, 0)); }
    if (event.key === "Escape") setResults([]);
  }

  return <div className="search-combobox"><form className={`search-box ${compact ? "compact" : ""}`} onSubmit={submit}><SearchIcon /><input name="q" value={query} onChange={(event) => update(event.target.value)} onKeyDown={keys} placeholder="Search anime, characters, studios, moods…" aria-label="Search anime" role="combobox" aria-expanded={results.length > 0} aria-controls="search-suggestions" aria-activedescendant={active >= 0 ? `suggestion-${active}` : undefined} autoComplete="off" /><button type="submit">Search</button></form>{results.length > 0 && <div className="search-suggestions" id="search-suggestions" role="listbox">{results.map((item, index) => <a id={`suggestion-${index}`} role="option" aria-selected={active === index} className={active === index ? "active" : ""} href={`/anime/${item.id}/${item.slug}`} key={item.id}><strong>{item.title}</strong><span>{[item.format, item.seasonYear].filter(Boolean).join(" · ")}</span></a>)}</div>}</div>;
}
