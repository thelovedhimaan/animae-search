import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() { return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", color: "#080b12", background: "#d6ff4b", fontSize: 24, fontWeight: 900 }}>AI</div>, size); }
