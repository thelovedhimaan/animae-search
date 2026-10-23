"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

type Review = { id: number; displayName: string; rating: number; body: string; containsSpoilers: boolean; updatedAt: string; isOwner: boolean };

export function Reviews({ mediaId, title }: { mediaId: number; title: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const load = useCallback(async () => { const response = await fetch(`/api/reviews/${mediaId}`, { cache: "no-store" }); if (response.ok) setReviews((await response.json()).reviews); }, [mediaId]);
  useEffect(() => {
    let active = true;
    Promise.all([fetch(`/api/reviews/${mediaId}`, { cache: "no-store" }), fetch("/api/account/me", { cache: "no-store" })]).then(async ([reviewsResponse, accountResponse]) => {
      if (!active) return;
      if (reviewsResponse.ok) setReviews((await reviewsResponse.json()).reviews);
      setSignedIn(accountResponse.ok);
    });
    return () => { active = false; };
  }, [mediaId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setMessage("");
    setSubmitting(true);
    const form = new FormData(formElement);
    try {
      const response = await fetch(`/api/reviews/${mediaId}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title, rating: Number(form.get("rating")), body: form.get("body"), containsSpoilers: form.get("containsSpoilers") === "on" }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) return setMessage(result.detail || "Your review could not be published.");
      formElement.reset();
      setMessage("Your review is published.");
      await load();
    } catch {
      setMessage("The review service could not be reached. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteReview() {
    if (!window.confirm("Delete your review?")) return;
    setMessage("");
    const response = await fetch(`/api/reviews/${mediaId}`, { method: "DELETE" });
    if (!response.ok) return setMessage("Your review could not be deleted.");
    setMessage("Your review was deleted.");
    await load();
  }

  return <section className="reviews section" id="reviews"><div className="section-head"><div><span className="kicker">COMMUNITY REVIEWS</span><h2>What viewers think</h2></div><p>Anime Index ratings are separate from external platform scores.</p></div>
    {signedIn ? <form className="review-form" onSubmit={submit}><label><span>Your rating</span><select name="rating" defaultValue="8">{Array.from({ length: 10 }, (_, index) => 10 - index).map((rating) => <option value={rating} key={rating}>{rating} / 10</option>)}</select></label><label className="review-copy"><span>Your review</span><textarea name="body" minLength={10} maxLength={2000} required placeholder="What worked, what did not, and who would enjoy it?" /></label><label className="spoiler-check"><input name="containsSpoilers" type="checkbox" /> Contains spoilers</label><button type="submit" disabled={submitting}>{submitting ? "Publishing…" : "Publish review"}</button>{message && <p className="review-message" role="status">{message}</p>}</form> : <div className="review-signin"><p>Sign in to rate this title and join the discussion.</p><Link className="primary-action" href="/account">Sign in or create account</Link></div>}
    <div className="review-list">{reviews.map((review) => <article key={review.id}><header><strong>{review.displayName}</strong><b>{review.rating}/10</b></header>{review.containsSpoilers ? <details><summary>Spoiler review — reveal</summary><p>{review.body}</p></details> : <p>{review.body}</p>}<div className="review-footer"><small>{new Date(review.updatedAt).toLocaleDateString()}</small>{review.isOwner && <button type="button" onClick={deleteReview}>Delete review</button>}</div></article>)}{!reviews.length && <p className="no-reviews">No community reviews yet. Be the first to share a considered take.</p>}</div>
  </section>;
}
