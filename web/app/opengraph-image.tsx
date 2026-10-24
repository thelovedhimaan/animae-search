import { ImageResponse } from "next/og";

export const alt = "Anime Index - Find your next world";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#f7f8fb", background: "linear-gradient(135deg,#080b12 0%,#121826 65%,#202b0a 100%)", fontFamily: "Arial, sans-serif" }}><div style={{ display: "flex", alignItems: "center", gap: 24 }}><div style={{ display: "flex", width: 86, height: 86, alignItems: "center", justifyContent: "center", color: "#080b12", background: "#d6ff4b", fontSize: 34, fontWeight: 900 }}>AI</div><div style={{ display: "flex", fontSize: 38, fontWeight: 800 }}>ANIME / INDEX</div></div><div style={{ display: "flex", flexDirection: "column" }}><div style={{ display: "flex", maxWidth: 980, fontSize: 80, lineHeight: 1, fontWeight: 850, letterSpacing: -4 }}>Find the story that stays with you.</div><div style={{ display: "flex", marginTop: 26, color: "#b8c1cf", fontSize: 28 }}>Anime, characters, cast, ratings, relationships and official places to watch.</div></div><div style={{ display: "flex", color: "#d6ff4b", fontSize: 22, fontWeight: 700 }}>animeindex · discovery with clear sources</div></div>, size);
}
