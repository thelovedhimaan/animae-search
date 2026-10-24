import { NextResponse } from "next/server";
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export async function GET() {
  try {
    const upstream = await fetch(`${API_URL}/api/v1/account/google/start`, { redirect: "manual", cache: "no-store" });
    const location = upstream.headers.get("location");
    if (!location) return NextResponse.redirect(new URL("/account?google=unavailable", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
    return NextResponse.redirect(location);
  } catch {
    return NextResponse.redirect(new URL("/account?google=unavailable", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  }
}
