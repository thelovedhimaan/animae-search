"use client";

import { useEffect, useRef } from "react";

type Player = { destroy(): void };
type YouTubeApi = { Player: new (element: HTMLIFrameElement, options: { events: { onReady(): void; onError(): void } }) => Player };
type YouTubeWindow = Window & { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void };
let apiPromise: Promise<YouTubeApi> | undefined;

function loadApi(): Promise<YouTubeApi> {
  const host = window as YouTubeWindow;
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
    const previous = host.onYouTubeIframeAPIReady;
    host.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (host.YT?.Player) resolve(host.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => reject(new Error("Trailer player unavailable"));
    document.head.appendChild(script);
  });
  return apiPromise;
}

export function TrailerPlayer({ videoId, onUnavailable }: { videoId: string; onUnavailable: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    let disposed = false;
    let player: Player | undefined;
    const timeout = window.setTimeout(() => { if (!disposed) onUnavailable(); }, 15000);
    loadApi().then((api) => {
      if (disposed || !frame.current) return;
      player = new api.Player(frame.current, { events: {
        onReady: () => window.clearTimeout(timeout),
        onError: () => { if (!disposed) onUnavailable(); },
      } });
    }).catch(() => { if (!disposed) onUnavailable(); });
    return () => { disposed = true; window.clearTimeout(timeout); player?.destroy(); };
  }, [videoId, onUnavailable]);

  return <div className="trailer-player"><iframe ref={frame} src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`} title="Anime trailer" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /></div>;
}
