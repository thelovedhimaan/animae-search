"use client";

import { useEffect, useState } from "react";

type AnimeRef = { mediaId: number; title: string; slug: string; coverImage: string };
type Library = { liked: AnimeRef[]; watch_later: AnimeRef[] };

export function AnimeActions({ anime }: { anime: AnimeRef }) {
  const [signedIn, setSignedIn] = useState(false);
  const [liked, setLiked] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/account/me", { cache: "no-store" }), fetch("/api/library", { cache: "no-store" })]).then(async ([accountResponse, libraryResponse]) => {
      if (!accountResponse.ok) return;
      setSignedIn(true);
      if (libraryResponse.ok) {
        const library: Library = await libraryResponse.json();
        setLiked(library.liked.some((item) => item.mediaId === anime.mediaId));
        setWatchLater(library.watch_later.some((item) => item.mediaId === anime.mediaId));
      }
      fetch("/api/library", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...anime, kind: "visited" }) });
    });
  }, [anime]);

  async function toggle(kind: "liked" | "watch_later", active: boolean) {
    setMessage("");
    const response = await fetch("/api/library", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...anime, kind, active }) });
    if (!response.ok) return setMessage("Could not update your library.");
    if (kind === "liked") setLiked(active); else setWatchLater(active);
    setMessage(active ? "Added to your account." : "Removed from your account.");
  }

  if (!signedIn) return null;
  return <div className="anime-actions"><button type="button" className={liked ? "active" : ""} onClick={() => toggle("liked", !liked)}>{liked ? "Liked" : "Like"}</button><button type="button" className={watchLater ? "active" : ""} onClick={() => toggle("watch_later", !watchLater)}>{watchLater ? "Saved for later" : "Watch later"}</button>{message && <span role="status">{message}</span>}</div>;
}
