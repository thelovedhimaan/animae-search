"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; text: string; source?: string; mode?: string };
type AnimeContext = { title: string; nativeTitle?: string; description: string; format: string; status: string; episodes?: number; season?: string; seasonYear?: number; genres: string[]; averageScore?: number; watchLinks?: { site: string; url: string }[] };

export function AskAnime({ mediaId, anime }: { mediaId: number; anime: AnimeContext }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const question = String(new FormData(form).get("question") || "").trim();
    if (!question) return;
    setMessages((current) => [...current, { role: "user", text: question }]);
    setLoading(true);
    form.reset();
    try {
      const response = await fetch(`/api/anime/${mediaId}/ask`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, context: anime }) });
      const result = await response.json();
      setMessages((current) => [...current, { role: "assistant", text: response.ok ? result.answer : result.detail, source: result.source, mode: result.mode }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: "The assistant could not be reached. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return <section className="ask-anime section"><div className="section-head"><div><span className="kicker">ASK ANIME INDEX</span><h2>Questions about {anime.title}</h2></div><p>Answers stay grounded in the current catalogue record and identify their source.</p></div><div className="chat-panel"><div className="chat-messages" aria-live="polite">{messages.length ? messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><strong>{message.role === "user" ? "You" : "Anime Index"}</strong><p>{message.text}</p>{message.source && <small>{message.mode === "ai" ? "AI answer" : "Catalogue answer"} · Source: {message.source}</small>}</div>) : <p className="chat-empty">Try “How many episodes?”, “What genres is it?”, “Where can I watch it?”, or ask for a summary.</p>}</div><form onSubmit={ask}><input name="question" minLength={3} maxLength={500} required placeholder={`Ask about ${anime.title}`} /><button type="submit" disabled={loading}>{loading ? "Thinking…" : "Ask"}</button></form></div></section>;
}
