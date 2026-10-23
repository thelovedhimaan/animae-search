"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Item = { mediaId: number; title: string; slug?: string; coverImage?: string; rating?: number };
type Library = { visited: Item[]; liked: Item[]; watch_later: Item[]; reviewed: Item[] };
const sections: [keyof Library, string][] = [["watch_later", "Watch later"], ["liked", "Liked"], ["reviewed", "Reviewed"], ["visited", "Recently visited"]];

export function AccountLibrary() {
  const [library, setLibrary] = useState<Library | null>(null);
  useEffect(() => { fetch("/api/library", { cache: "no-store" }).then(async (response) => { if (response.ok) setLibrary(await response.json()); }); }, []);
  if (!library) return <p className="library-loading">Loading your anime library…</p>;
  return <div className="account-library">{sections.map(([key, label]) => <section key={key}><header><h3>{label}</h3><span>{library[key].length}</span></header>{library[key].length ? <div>{library[key].map((item) => <Link href={`/anime/${item.mediaId}/${item.slug || item.mediaId}`} key={item.mediaId}>{item.coverImage && <Image src={item.coverImage} alt="" width={44} height={60} unoptimized />}<span><strong>{item.title}</strong>{item.rating && <small>{item.rating}/10</small>}</span></Link>)}</div> : <p>Nothing here yet.</p>}</section>)}</div>;
}
