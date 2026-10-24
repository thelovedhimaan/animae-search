import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About, sources and editorial method",
  description: "Learn how Anime Index sources open anime metadata, attributes reusable media, verifies viewing links, handles reviews, and grounds AI answers.",
  alternates: { canonical: "/about" },
};

const principles = [
  ["Open catalogue", "Structured title facts come from CC0 Wikidata records. Source links stay visible so readers can verify and improve them."],
  ["Licensed media", "Every Wikimedia image keeps its creator, source and licence. Titles without reusable artwork receive an original Anime Index placeholder."],
  ["Grounded answers", "The title assistant receives the visible catalogue record, cast, studios, relationships and verified links. When evidence is missing, it is instructed to say so."],
  ["Community ownership", "Ratings, reviews and trending order come from Anime Index viewers instead of copied platform scores."],
  ["Spoiler control", "Community reviewers can label spoilers. AI instructions avoid inventing plot details and keep answers within the supplied title record."],
  ["Corrections and freshness", "Open catalogue responses are cached for performance. Source links and freshness labels let readers verify details at the origin."],
];

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://anime-index.13-232-238-146.sslip.io";
  const graph = { "@context": "https://schema.org", "@type": "AboutPage", name: "About Anime Index", url: `${siteUrl}/about`, description: "Anime Index data sources, attribution and editorial method.", isPartOf: { "@id": `${siteUrl}/#website` } };
  return <section className="section about-page">
    <span className="kicker">ABOUT ANIME INDEX</span>
    <h1>Anime discovery with visible sources.</h1>
    <p className="about-lead">Anime Index brings open title metadata, characters, cast, relationships, community reviews and verified official links into one searchable place. The goal is to help people choose what to watch while keeping source, licence and uncertainty clear.</p>
    <div className="about-grid">{principles.map(([title, copy]) => <article key={title}><h2>{title}</h2><p>{copy}</p></article>)}</div>
    <section className="about-source"><div><span className="kicker">CURRENT CATALOGUE SOURCE</span><h2>Wikidata + Wikimedia</h2><p>Wikidata supplies CC0 structured facts. Attributed Wikipedia summaries and individually licensed Commons media enrich detail pages. Anime Index owns its community ratings, reviews and activity signals.</p></div><nav aria-label="Explore Anime Index"><Link href="/search?sort=trending">Browse trending anime</Link><Link href="/characters">Explore characters</Link></nav></section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\u003c") }} />
  </section>;
}
