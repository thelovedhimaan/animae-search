import { NextRequest, NextResponse } from "next/server";
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export async function GET(request: NextRequest) {
  try {
    const upstream = await fetch(`${API_URL}/api/v1/account/google/callback${request.nextUrl.search}`, { redirect: "manual", cache: "no-store" });
    const response = NextResponse.redirect(upstream.headers.get("location") || new URL("/account?google=error", request.url));
    const cookie = upstream.headers.get("set-cookie"); if (cookie) response.headers.set("set-cookie", cookie);
    return response;
  } catch {
    return NextResponse.redirect(new URL("/account?google=error", request.url));
  }
}
