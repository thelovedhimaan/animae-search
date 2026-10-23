import Link from "next/link";
import { Mark, SearchIcon } from "./Icons";

export function Header() {
  return <header className="site-header"><Link className="brand" href="/"><span className="brand-mark"><Mark /></span><span><strong>ANIME<span>{"//"}</span>INDEX</strong><small>Find your next world</small></span></Link><nav><Link href="/search">Browse</Link><Link href="/search?sort=trending">Trending</Link><Link href="/search?season=current">Seasons</Link><Link href="/characters">Characters</Link></nav><div className="header-actions"><Link className="header-search" href="/search" aria-label="Search"><SearchIcon /></Link><Link className="sign-in" href="/account">Sign in</Link></div></header>;
}
