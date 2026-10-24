import type { AnimeTitle } from "@/lib/types";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const shown = (input?: string | number | null) => input === undefined || input === null || input === "" ? "Not recorded" : String(input);

export function AnimeInformation({ anime }: { anime: AnimeTitle }) {
  const facts = [
    ["Release", anime.releaseStart ? `${anime.releaseStart}${anime.releaseEnd ? ` – ${anime.releaseEnd}` : ""}` : anime.seasonYear],
    ["Format", anime.format], ["Status", anime.status.replaceAll("_", " ")], ["Episodes", anime.episodes],
    ["Episode runtime", anime.duration ? `${anime.duration} min` : null],
    ["Content rating", [anime.ageRating, anime.ageRatingGuide].filter(Boolean).join(" · ")],
    ["Studios", anime.studios?.map((studio) => studio.name).join(", ")], ["Genres", anime.genres.join(", ")],
  ];
  const audience = anime.audience;
  return <>
    <section className="anime-story section" id="story"><div className="section-head"><div><span className="kicker">STORYLINE</span><h2>About {anime.title}</h2></div></div><p>{anime.description || "A complete synopsis has not been added to the open catalogue yet."}</p></section>
    <section className="anime-information section" id="details"><div className="section-head"><div><span className="kicker">TITLE RECORD</span><h2>Details and audience signals</h2></div><p>Facts are combined from attributed open catalogue sources.</p></div><div className="information-layout">
      <dl className="information-facts">{facts.map(([label, item]) => <div key={String(label)}><dt>{label}</dt><dd>{shown(item)}</dd></div>)}</dl>
      <div className="audience-panel"><h3>Ratings and popularity</h3>{anime.externalRatings?.map((rating) => <a href={rating.url} target="_blank" rel="noreferrer" key={rating.source}><span>{rating.source} users</span><strong>{(rating.score / 10).toFixed(1)}<small>/10</small></strong><em>{compact.format(rating.count)} ratings ↗</em></a>)}<dl><div><dt>Rating rank</dt><dd>{audience?.ratingRank ? `#${compact.format(audience.ratingRank)}` : "—"}</dd></div><div><dt>Popularity rank</dt><dd>{audience?.popularityRank ? `#${compact.format(audience.popularityRank)}` : "—"}</dd></div><div><dt>Library users</dt><dd>{audience?.userCount ? compact.format(audience.userCount) : "—"}</dd></div><div><dt>Favorites</dt><dd>{audience?.favoritesCount ? compact.format(audience.favoritesCount) : "—"}</dd></div></dl></div>
    </div></section>
  </>;
}
