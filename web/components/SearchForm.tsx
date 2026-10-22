import { SearchIcon } from "./Icons";

export function SearchForm({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  return <form className={`search-box ${compact ? "compact" : ""}`} action="/search"><SearchIcon /><input name="q" defaultValue={defaultValue} placeholder="Search anime, characters, studios, moods…" aria-label="Search anime" /><button type="submit">Search</button></form>;
}
