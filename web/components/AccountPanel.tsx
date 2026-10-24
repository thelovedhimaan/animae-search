"use client";

import { FormEvent, useEffect, useState } from "react";
import { AccountLibrary } from "./AccountLibrary";

type Account = { id: number; email: string; displayName: string };
type Mode = "login" | "register";

export function AccountPanel() {
  const [user, setUser] = useState<Account | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/account/me", { cache: "no-store" })
      .then(async (response) => response.ok ? setUser((await response.json()).user) : undefined)
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch(`/api/account/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(result.detail || "We could not complete that request.");
    setUser(result.user);
    window.dispatchEvent(new Event("account-changed"));
  }

  async function logout() {
    await fetch("/api/account/logout", { method: "POST" });
    setUser(null);
    setMode("login");
    window.dispatchEvent(new Event("account-changed"));
  }

  async function exportData() {
    const response = await fetch("/api/account/data", { cache: "no-store" });
    if (!response.ok) return setMessage("Could not export your data.");
    const blob = new Blob([JSON.stringify(await response.json(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = "anime-index-data.json"; link.click(); URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your Anime Index account, reviews, and library permanently?")) return;
    const response = await fetch("/api/account/data", { method: "DELETE" });
    if (!response.ok) return setMessage("Could not delete your account.");
    setUser(null); setMode("register"); window.dispatchEvent(new Event("account-changed"));
  }

  if (loading) return <div className="account-card"><p>Checking your account…</p></div>;
  if (user) return <div className="account-dashboard"><div className="account-card account-welcome"><span className="kicker">SIGNED IN</span><h2>Welcome, {user.displayName}.</h2><p>{user.email}</p><div className="account-controls"><button type="button" onClick={logout}>Sign out</button><button type="button" onClick={exportData}>Export my data</button><button type="button" className="danger" onClick={deleteAccount}>Delete account</button></div>{message && <p className="form-error" role="alert">{message}</p>}</div><AccountLibrary /></div>;

  return <div className="account-card">
    <div className="account-tabs" aria-label="Account options"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Sign in</button><button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Create account</button></div>
    <form onSubmit={submit}>
      {mode === "register" && <label><span>Display name</span><input name="displayName" autoComplete="name" required maxLength={80} /></label>}
      <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
      <label><span>Password</span><input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></label>
      {message && <p className="form-error" role="alert">{message}</p>}
      <button className="account-submit" type="submit">{mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
    <div className="account-divider"><span>or</span></div><a className="google-signin" href="/api/v1/account/google/start">Continue with Google</a>
    <p className="account-note">Google sign-in becomes available when its OAuth credentials and callback URL are configured.</p>
  </div>;
}
