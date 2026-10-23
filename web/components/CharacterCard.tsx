import Image from "next/image";
import Link from "next/link";
import type { AnimeCharacter } from "@/lib/types";

export function CharacterCard({ character }: { character: AnimeCharacter }) {
  return <article className="character-card"><Link href={`/characters/${character.id}/${character.slug}`}><div className="character-image">{character.image ? <Image src={character.image} alt={`${character.name} portrait`} fill sizes="(max-width: 600px) 45vw, (max-width: 950px) 30vw, 18vw" /> : <span>{character.name.slice(0, 1)}</span>}<b>{character.favourites.toLocaleString()} favourites</b></div><div><h2>{character.name}</h2><p>{character.nativeName || character.alternativeNames[0] || "Character profile"}</p></div></Link></article>;
}
