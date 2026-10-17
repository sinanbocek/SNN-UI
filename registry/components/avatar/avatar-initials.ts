// Kişi simgesinin baş harf mantığı. Saf mantık: React ve CSS içermez; test doğrudan bunu okur.
import { text } from "@snn/abacus-core";

/**
 * Adın ilk iki sözcüğünün baş harfleri, Türkçe büyük harfle ("ismail yılmaz" → "İY").
 * Parantez içi atılır; tire ve alt çizgi sözcük ayracı sayılır; yalnız harf ya da rakam baş harf olur ("trade-kasa (tarayıcı)" → "TK").
 */
export function avatarInitials(name: string): string {
  return name.replace(/\([^)]*\)/g, " ").split(/[\s_-]+/)
    .map(word => word.match(/[\p{L}\p{N}]/u)?.[0] ?? "").filter(Boolean)
    .slice(0, 2).map(letter => text.upper(letter)).join("");
}
