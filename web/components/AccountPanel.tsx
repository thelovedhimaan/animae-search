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

  if (loading) return <div className="account-card"><p>Checking your account…</p></div>;
  if (user) return <div className="account-dashboard"><div className="account-card account-welcome"><span className="kicker">SIGNED IN</span><h2>Welcome, {user.displayName}.</h2><p>{user.email}</p><button type="button" onClick={logout}>Sign out</button></div><AccountLibrary /></div>;

  return <div className="account-card">
    <div className="account-tabs" aria-label="Account options"><button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Sign in</button><button type="button" className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setMessage(""); }}>Create account</button></div>
    <form onSubmit={submit}>
      {mode === "register" && <label><span>Display name</span><input name="displayName" autoComplete="name" required maxLength={80} /></label>}
      <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
      <label><span>Password</span><input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></label>
      {message && <p className="form-error" role="alert">{message}</p>}
      <button className="account-submit" type="submit">{mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
    <p className="account-note">Google sign-in will be added after its OAuth credentials and production HTTPS callback are configured.</p>
  </div>;
}
