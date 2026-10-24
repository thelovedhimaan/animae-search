import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://ec2-13-232-238-146.ap-south-1.compute.amazonaws.com"),
  title: { default: "Anime Index - Find your next world", template: "%s | Anime Index" },
  description: "Search anime, characters, ratings, relationships and verified viewing options in one place.",
  openGraph: { type: "website", siteName: "Anime Index", title: "Anime Index - Find your next world", description: "Anime discovery, personal lists, reviews, cast, relationships, official viewing links and contextual AI." },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip" href="#content">Skip to content</a><Header /><main id="content">{children}</main><footer><div><span className="brand-mark"><span>AI</span></span><strong>Anime Index</strong></div><p>Anime discovery with clear sources, regional availability and spoiler-aware intelligence.</p><small>Metadata remains attributed to its original providers.</small></footer></body></html>;
}
