"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; text: string; source?: string; mode?: string; provider?: string };
type AnimeContext = { title: string; nativeTitle?: string; description: string; format: string; status: string; episodes?: number; season?: string; seasonYear?: number; genres: string[]; averageScore?: number; watchLinks?: { site: string; url: string }[]; cast?: unknown[]; studios?: unknown[]; relations?: unknown[] };

export function AskAnime({ mediaId, anime }: { mediaId: number; anime: AnimeContext }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const question = String(new FormData(form).get("question") || "").trim();
    if (!question) return;
    const history = messages.map(({ role, text }) => ({ role, text }));
    setMessages((current) => [...current, { role: "user", text: question }]);
    setLoading(true);
    form.reset();
    try {
      const response = await fetch(`/api/anime/${mediaId}/ask`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, context: anime, history }) });
      const result = await response.json();
      setMessages((current) => [...current, { role: "assistant", text: response.ok ? result.answer : result.detail, source: result.source, mode: result.mode, provider: result.provider }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", text: "The assistant could not be reached. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return <section className="ask-anime section" id="ask"><div className="section-head"><div><span className="kicker">ASK ANIME INDEX</span><h2>Questions about {anime.title}</h2></div><p>Ask follow-up questions in the same conversation. Answers stay grounded in the title record.</p></div><div className="chat-panel"><div className="chat-messages" aria-live="polite">{messages.length ? messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}><strong>{message.role === "user" ? "You" : "Anime Index"}</strong><p>{message.text}</p>{message.source && <small>{message.mode === "ai" ? `${message.provider || "AI"} answer` : "Catalogue answer"} · Source: {message.source}</small>}</div>) : <p className="chat-empty">Try “Who voices the main character?”, “How many episodes?”, “Where can I watch it?”, then ask a follow-up.</p>}</div><form onSubmit={ask}><input name="question" minLength={3} maxLength={500} required placeholder={`Ask about ${anime.title}`} /><button type="submit" disabled={loading}>{loading ? "Thinking…" : "Ask"}</button></form></div></section>;
}
