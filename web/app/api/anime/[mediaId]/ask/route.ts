import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest, context: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await context.params;
  if (!/^\d+$/.test(mediaId)) return NextResponse.json({ detail: "Invalid anime ID." }, { status: 400 });
  try {
    const upstream = await fetch(`${API_URL}/api/v1/anime/${mediaId}/ask`, { method: "POST", headers: { "content-type": "application/json" }, body: await request.text(), cache: "no-store" });
    return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "content-type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "The anime assistant is temporarily unavailable." }, { status: 503 });
  }
}
