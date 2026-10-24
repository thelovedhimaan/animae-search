import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About, sources and editorial method",
  description: "Learn how Anime Index sources anime metadata, attributes ratings, verifies viewing links, handles reviews, and grounds AI answers.",
  alternates: { canonical: "/about" }
};

const principles = [
  ["Attributed data", "Provider scores stay labelled by source. We do not combine unrelated rating systems into a misleading universal score."],
  ["Official viewing first", "Viewing links come from official catalogue records. Availability changes by country and should be confirmed on the provider before subscribing."],
  ["Grounded answers", "The title assistant receives the visible catalogue record, cast, studios, relationships and viewing links. When evidence is missing, it is instructed to say so."],
  ["Community separation", "Anime Index reviews and ratings are shown separately from external platform scores, so readers can understand who supplied each opinion."],
  ["Spoiler control", "Community reviewers can label spoilers. AI instructions avoid inventing plot details and should keep answers within the supplied title record."],
  ["Corrections and freshness", "Live catalogue responses are cached briefly for performance. Source links and freshness labels help readers verify details at the original provider."]
];

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://ec2-13-232-238-146.ap-south-1.compute.amazonaws.com";
  const graph = { "@context": "https://schema.org", "@type": "AboutPage", name: "About Anime Index", url: `${siteUrl}/about`, description: "Anime Index data sources, attribution and editorial method.", isPartOf: { "@id": `${siteUrl}/#website` } };
  return <section className="section about-page"><span className="kicker">ABOUT ANIME INDEX</span><h1>Anime discovery with visible sources.</h1><p className="about-lead">Anime Index brings title metadata, characters, cast, relationships, community reviews and official viewing links into one searchable place. The goal is to help people choose what to watch while keeping source and uncertainty clear.</p><div className="about-grid">{principles.map(([title, copy]) => <article key={title}><h2>{title}</h2><p>{copy}</p></article>)}</div><section className="about-source"><div><span className="kicker">CURRENT CATALOGUE SOURCE</span><h2>AniList GraphQL</h2><p>AniList supplies the live title and character catalogue used by the current release. Anime Index normalizes these records for consistent search and detail pages while retaining provider attribution.</p></div><nav aria-label="Explore Anime Index"><Link href="/search?sort=trending">Browse trending anime</Link><Link href="/characters">Explore characters</Link></nav></section><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} /></section>;
}
