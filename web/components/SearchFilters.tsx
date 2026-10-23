import type { SearchFilters as Filters } from "@/lib/types";

const options = {
  sort: [["relevance", "Relevance"], ["trending", "Trending"], ["score", "Top rated"], ["popular", "Most popular"], ["newest", "Newest"]],
  format: [["", "All formats"], ["tv", "TV"], ["movie", "Movie"], ["ova", "OVA"], ["ona", "ONA"], ["special", "Special"]],
  status: [["", "Any status"], ["airing", "Airing now"], ["finished", "Finished"], ["upcoming", "Upcoming"]],
  season: [["", "Any season"], ["current", "Current season"], ["winter", "Winter"], ["spring", "Spring"], ["summer", "Summer"], ["fall", "Fall"]],
} as const;

export function SearchFilters({ filters }: { filters: Filters }) {
  return <form className="filter-bar" action="/search">
    {filters.q && <input type="hidden" name="q" value={filters.q} />}
    {Object.entries(options).map(([name, values]) => <label key={name}><span>{name}</span><select name={name} defaultValue={filters[name as keyof Filters]}>{values.map(([value, label]) => <option value={value} key={value || "all"}>{label}</option>)}</select></label>)}
    <label><span>Genre</span><input name="genre" defaultValue={filters.genre} placeholder="e.g. Fantasy" /></label>
    <button type="submit">Apply filters</button>
  </form>;
}
