type WatchLink = { site: string; url: string };

export function WatchLinks({ links }: { links: WatchLink[] }) {
  return <section className="watch-links"><span className="kicker">WHERE TO WATCH</span><h2>Official viewing options</h2>{links.length ? <div>{links.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={`${link.site}-${link.url}`}>{link.site}<span>↗</span></a>)}</div> : <p>No official streaming link is listed for this title yet. Availability varies by country and can change over time.</p>}</section>;
}
