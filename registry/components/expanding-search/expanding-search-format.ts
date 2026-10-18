// Açılan aramanın saf mantığı: sıralı süzme, gruplama ve vurgu aralığı. React ve CSS içermez; test doğrudan bunu okur.
import { text } from "@snn/abacus-core";

export interface SearchableItem {
  id: string;
  title: string;
  /** Başlığın altında kısa bir satır: tür, sahip ya da son düzenleme gibi. */
  meta?: string | undefined;
  /** Sonuçlar bu başlık altında toplanır; gruplar `items` içinde ilk göründükleri sırayla dizilir. */
  group?: string | undefined;
  /** Öğeyi bulması gereken ek sözcükler. */
  keywords?: string[] | undefined;
}

export interface SearchGroup<T extends SearchableItem = SearchableItem> { name: string; items: T[] }

/**
 * Başlık başı eşleşmesi sözcük başı eşleşmesinden, o da sözcük içi eşleşmesinden, o da anahtar sözcük ve ek bilgi eşleşmesinden önce gelir.
 * Eşitlikte özgün sıra korunur. Eşleştirme Türkçe harfe duyarsızdır: "cagri" "Çağrı"yı, "ismail" "İsmail"i bulur.
 */
export function rank<T extends SearchableItem>(items: T[], query: string, limit: number): T[] {
  const q = text.searchKey(query);
  if (!q) return [];
  const scored: { item: T; score: number; order: number }[] = [];
  items.forEach((item, order) => {
    const title = text.searchKey(item.title);
    const at = title.indexOf(q);
    const extra = [item.meta ?? "", ...(item.keywords ?? [])].some(word => text.searchKey(word).includes(q));
    const score = at === 0 ? 0 : at > 0 && /[\s\-/]/.test(title[at - 1]!) ? 1 : at > 0 ? 2 : extra ? 3 : -1;
    if (score >= 0) scored.push({ item, score, order });
  });
  return scored.sort((a, b) => a.score - b.score || a.order - b.order).slice(0, limit).map(entry => entry.item);
}

/** Sonuçları grup adına göre toplar; gruplar kaynak listede ilk göründükleri sırayla gelir. */
export function groupBy<T extends SearchableItem>(list: T[], source: T[]): SearchGroup<T>[] {
  const order = new Map<string, number>();
  source.forEach((item, index) => { const name = item.group ?? ""; if (!order.has(name)) order.set(name, index); });
  const groups = new Map<string, T[]>();
  list.forEach(item => { const name = item.group ?? ""; groups.set(name, [...(groups.get(name) ?? []), item]); });
  return [...groups].sort((a, b) => (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0)).map(([name, items]) => ({ name, items }));
}

/** Başlıkta sorguyla eşleşen ilk parçanın [başlangıç, bitiş] aralığı; harf katlama uzunluğu değiştiriyorsa vurgulanmaz (null). */
export function matchRange(title: string, query: string): [number, number] | null {
  const q = text.searchKey(query);
  if (!q) return null;
  const key = text.searchKey(title);
  if (key.length !== title.length) return null;
  const start = key.indexOf(q);
  return start === -1 ? null : [start, start + q.length];
}
