import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function proxy(request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await context.params;
  if (!/^\d+$/.test(mediaId)) return NextResponse.json({ detail: "Invalid anime ID." }, { status: 400 });
  const headers = new Headers({ Accept: "application/json" });
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const init: RequestInit = { method: request.method, headers, cache: "no-store" };
  if (request.method === "POST") { headers.set("content-type", "application/json"); init.body = await request.text(); }
  try {
    const upstream = await fetch(`${API_URL}/api/v1/reviews/${mediaId}`, init);
    return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "content-type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Reviews are temporarily unavailable." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
