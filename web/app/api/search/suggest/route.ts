import { NextRequest, NextResponse } from "next/server";
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  try {
    const response = await fetch(`${API_URL}/api/v1/search/suggest?q=${encodeURIComponent(query)}`, { cache: "no-store" });
    return new NextResponse(await response.text(), { status: response.status, headers: { "content-type": "application/json" } });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
