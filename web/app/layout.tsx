import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://ec2-13-232-238-146.ap-south-1.compute.amazonaws.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Anime Index",
  title: { default: "Anime Index - Discover anime, characters and where to watch", template: "%s | Anime Index" },
  description: "Discover anime by title, character, genre and season. Explore cast, relationships, ratings, reviews, official viewing links and grounded title Q&A.",
  keywords: ["anime search", "anime database", "anime characters", "anime recommendations", "where to watch anime", "anime ratings", "anime cast"],
  authors: [{ name: "Anime Index" }],
  creator: "Anime Index",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined
  },
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: "Anime Index", title: "Anime Index - Find your next world", description: "Search anime, characters, cast, relationships, ratings and official viewing options.", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Anime Index discovery platform" }] },
  twitter: { card: "summary_large_image", title: "Anime Index", description: "Search anime, characters, ratings and official viewing options.", images: ["/opengraph-image"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
};

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "Anime Index", url: siteUrl, logo: `${siteUrl}/icon` },
    { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: "Anime Index", description: metadata.description, publisher: { "@id": `${siteUrl}/#organization` }, potentialAction: { "@type": "SearchAction", target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/search?q={search_term_string}` }, "query-input": "required name=search_term_string" } }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip" href="#content">Skip to content</a><Header /><main id="content">{children}</main><footer><div><span className="brand-mark"><span>AI</span></span><strong>Anime Index</strong></div><p>Anime discovery with clear sources, regional availability and spoiler-aware intelligence. <Link href="/about">How Anime Index works</Link></p><small>Metadata remains attributed to its original providers.</small></footer><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} /></body></html>;
}
