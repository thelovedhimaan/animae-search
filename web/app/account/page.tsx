import type { Metadata } from "next";
import { AccountPanel } from "@/components/AccountPanel";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return <section className="account-page section"><div className="account-intro"><span className="kicker">YOUR ANIME INDEX</span><h1>Save what you love. Join the conversation.</h1><p>Create an account to build your anime identity. Watchlists, personal ratings, reviews, and community discussions will connect to this profile.</p></div><AccountPanel /></section>;
}
