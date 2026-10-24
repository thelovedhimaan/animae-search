import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const allowed = new Set(["register", "login", "logout", "me", "data"]);

async function proxy(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  if (!allowed.has(action)) return NextResponse.json({ detail: "Unknown account action." }, { status: 404 });
  const headers = new Headers({ Accept: "application/json" });
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const init: RequestInit = { method: request.method, headers, cache: "no-store" };
  if (request.method !== "GET") {
    headers.set("content-type", "application/json");
    init.body = await request.text();
  }
  try {
    const upstream = await fetch(`${API_URL}/api/v1/account/${action}`, init);
    const response = new NextResponse(upstream.status === 204 ? null : await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
    const setCookie = upstream.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);
    return response;
  } catch {
    return NextResponse.json({ detail: "Account service is temporarily unavailable." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
