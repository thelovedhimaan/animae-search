"use client";

import { useEffect, useState } from "react";

type AnimeRef = { mediaId: number; title: string; slug: string; coverImage: string };
type Status = "" | "watching" | "completed" | "paused" | "dropped";
type Library = { liked: AnimeRef[]; watch_later: AnimeRef[]; watching: AnimeRef[]; completed: AnimeRef[]; paused: AnimeRef[]; dropped: AnimeRef[] };

export function AnimeActions({ anime }: { anime: AnimeRef }) {
  const [signedIn, setSignedIn] = useState(false);
  const [liked, setLiked] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("");

  useEffect(() => {
    Promise.all([fetch("/api/account/me", { cache: "no-store" }), fetch("/api/library", { cache: "no-store" })]).then(async ([accountResponse, libraryResponse]) => {
      if (!accountResponse.ok) return;
      setSignedIn(true);
      if (libraryResponse.ok) {
        const library: Library = await libraryResponse.json();
        setLiked(library.liked.some((item) => item.mediaId === anime.mediaId));
        setWatchLater(library.watch_later.some((item) => item.mediaId === anime.mediaId));
        setStatus((["watching", "completed", "paused", "dropped"] as Status[]).find((kind) => kind && library[kind].some((item) => item.mediaId === anime.mediaId)) || "");
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

  async function changeStatus(next: Status) {
    setMessage("");
    if (status) await fetch("/api/library", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...anime, kind: status, active: false }) });
    if (next) {
      const response = await fetch("/api/library", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...anime, kind: next }) });
      if (!response.ok) return setMessage("Could not update your status.");
    }
    setStatus(next); setMessage(next ? "Watching status updated." : "Watching status cleared.");
  }

  if (!signedIn) return null;
  return <div className="anime-actions"><button type="button" className={liked ? "active" : ""} onClick={() => toggle("liked", !liked)}>{liked ? "Liked" : "Like"}</button><button type="button" className={watchLater ? "active" : ""} onClick={() => toggle("watch_later", !watchLater)}>{watchLater ? "Saved for later" : "Watch later"}</button><label><span className="sr-only">Watching status</span><select value={status} onChange={(event) => changeStatus(event.target.value as Status)}><option value="">Set status</option><option value="watching">Watching</option><option value="completed">Completed</option><option value="paused">Paused</option><option value="dropped">Dropped</option></select></label>{message && <span role="status">{message}</span>}</div>;
}
