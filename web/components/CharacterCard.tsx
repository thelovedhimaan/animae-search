import { SafePortrait } from "@/components/SafePortrait";
import Link from "next/link";
import type { AnimeCharacter } from "@/lib/types";

export function CharacterCard({ character }: { character: AnimeCharacter }) {
  return <article className="character-card"><Link href={`/characters/${character.id}/${character.slug}`}><div className="character-image"><SafePortrait src={character.image} alt={`${character.name} portrait`} fallback={character.name.slice(0, 1)} /><b>{character.favourites.toLocaleString()} favourites</b></div><div><h2>{character.name}</h2><p>{character.nativeName || character.alternativeNames[0] || "Character profile"}</p></div></Link></article>;
}
