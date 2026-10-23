"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mark, SearchIcon } from "./Icons";

export function Header() {
  const [account, setAccount] = useState<{ displayName: string } | null>(null);

  useEffect(() => {
    const refresh = () => fetch("/api/account/me", { cache: "no-store" }).then(async (response) => setAccount(response.ok ? (await response.json()).user : null));
    refresh();
    window.addEventListener("account-changed", refresh);
    return () => window.removeEventListener("account-changed", refresh);
  }, []);

  return <header className="site-header"><Link className="brand" href="/"><span className="brand-mark"><Mark /></span><span><strong>ANIME<span>{"//"}</span>INDEX</strong><small>Find your next world</small></span></Link><nav><Link href="/search">Browse</Link><Link href="/search?sort=trending">Trending</Link><Link href="/search?season=current">Seasons</Link><Link href="/characters">Characters</Link></nav><div className="header-actions"><Link className="header-search" href="/search" aria-label="Search"><SearchIcon /></Link><Link className={account ? "account-link" : "sign-in"} href="/account">{account ? <><span aria-hidden="true">{account.displayName.charAt(0).toUpperCase()}</span><strong>{account.displayName}</strong></> : "Sign in"}</Link></div></header>;
}
