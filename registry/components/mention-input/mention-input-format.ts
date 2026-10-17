// Anma önerilerinin saf mantığı: eşleştirme puanı ve vurgulanacak aralık. React ve CSS içermez; test doğrudan bunu okur.
import { text } from "@snn/abacus-core";

/** Arama anahtarı: Türkçe harfe duyarsız ("Çağrı" ve "cagri" aynı anahtara iner). */
export const searchKey = (value: string) => text.searchKey(value);

/** Etiket ve ek metin için eşleşme puanı: 4 baştan, 3 sözcük başından, 2 içinden, 1 ek metinden ya da boş sorgu, 0 eşleşmedi. */
export function rank(label: string, extra: string, query: string): number {
  const name = searchKey(label), needle = searchKey(query);
  if (!needle) return 1;
  if (name.startsWith(needle)) return 4;
  if (name.split(/[\s\-_.]+/).some(word => word.startsWith(needle))) return 3;
  if (name.includes(needle)) return 2;
  return searchKey(extra).includes(needle) ? 1 : 0;
}

/** Sorgunun metindeki yeri: [başlangıç, bitiş) ya da yoksa null. Metin harf harf katlanır; böylece aralık özgün metne doğrudan oturur. */
export function matchRange(value: string, query: string): [number, number] | null {
  const needle = searchKey(query);
  if (!needle) return null;
  let folded = "";
  const from: number[] = [], to: number[] = [];
  let index = 0;
  for (const char of value) {
    const key = searchKey(char) || (/\s/.test(char) ? " " : "");
    for (const unit of key) { folded += unit; from.push(index); to.push(index + char.length); }
    index += char.length;
  }
  const at = folded.indexOf(needle);
  if (at < 0) return null;
  return [from[at]!, to[at + needle.length - 1]!];
}
