type WatchLink = { site: string; url: string };

export function WatchLinks({ links, officialLinks = [] }: { links: WatchLink[]; officialLinks?: WatchLink[] }) {
  return <section className="watch-links" id="watch">
    <span className="kicker">OFFICIAL LINKS</span>
    <h2>Watch and verify</h2>
    {links.length
      ? <><p>Verified viewing links from official providers. Availability can vary by country.</p><div>{links.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={`${link.site}-${link.url}`}>{link.site}<span>↗</span></a>)}</div></>
      : <p>No verified streaming link is recorded yet. We do not guess availability or link to unlicensed streams.</p>}
    {officialLinks.length > 0 && <div className="official-source-links">{officialLinks.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={`${link.site}-${link.url}`}>{link.site}<span>↗</span></a>)}</div>}
  </section>;
}
