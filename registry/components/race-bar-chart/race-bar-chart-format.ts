// Sıralama yarışının saf mantığı: ara değer, sıralama, eksen ölçeği ve yazımlar. Sayılar ABACUS'tandır (chart-format).
import { formatCompact, formatMoney, formatMoneyCompact, formatNumber } from "../lib/chart-format";

export interface RaceItem { key: string; label: string; /** Aynı gruptaki çubuklar aynı renkte; en çok dört grup renk alır. */ group?: string | undefined; /** Her dönemdeki değer (dönem sırasıyla); eksik değer sıfır sayılır. */ values: number[] }
export interface RacePeriod { key: string; label: string }
export type RaceKind = "count" | "money";

const at = (values: number[], index: number) => values[index] ?? 0;

/** Zaman `t` (kesirli dönem sırası) için doğrusal ara değer. */
export function valueAt(values: number[], t: number): number {
  if (!values.length) return 0;
  const last = values.length - 1, clamped = Math.min(Math.max(t, 0), last), low = Math.floor(clamped), high = Math.min(low + 1, last);
  const share = clamped - low;
  return at(values, low) + (at(values, high) - at(values, low)) * share;
}

export interface RaceRow { key: string; label: string; group: string | undefined; value: number; rank: number }

/** Zaman `t` için tüm öğeleri sıralar; sıra 0'dan başlar. Eşitlikte girdi sırası korunur. */
export function rowsAt(items: RaceItem[], t: number): RaceRow[] {
  return items
    .map((item, order) => ({ item, order, value: valueAt(item.values, t) }))
    .sort((a, b) => b.value - a.value || a.order - b.order)
    .map(({ item, value }, rank) => ({ key: item.key, label: item.label, group: item.group, value, rank }));
}

/** Eksen için "güzel" üst sınır: en büyük değeri aşan, 1-2-2,5-5 basamaklı en küçük değer. */
export function niceMax(max: number): number {
  if (!(max > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  for (const factor of [1, 2, 2.5, 5, 10]) if (factor * magnitude >= max) return factor * magnitude;
  return 10 * magnitude;
}

/** Eksen çizgileri: en çok `count` adet, eşit aralıklı, 0 hariç. */
export function axisTicks(axisMax: number, count = 4): number[] {
  const step = niceMax(axisMax / count);
  const ticks: number[] = [];
  for (let value = step; value <= axisMax * 1.0001 && ticks.length < count + 2; value += step) ticks.push(value);
  return ticks;
}

/** Zaman `t` için eksenin hedef üst sınırı: en çok görünen N çubuğun en büyüğü. */
export function axisTarget(items: RaceItem[], t: number, topN: number): number {
  const rows = rowsAt(items, t).slice(0, topN);
  return niceMax(rows[0]?.value ?? 0);
}

export const fullText = (kind: RaceKind, value: number) => kind === "money" ? formatMoney(Math.round(value), 0) : formatNumber(Math.round(value), 0);
/** Çubuk ucundaki kısa yazım: ara değerler yuvarlanır, ekranda kuruş görünmez. */
export const shortText = (kind: RaceKind, value: number) => kind === "money" ? formatMoneyCompact(Math.round(value)) : formatCompact(Math.round(value));

/** Ekran okuyucu: "Ahmet Yıldız, 2. sıra, ₺1.250.000". */
export const rankAnnouncement = (kind: RaceKind, label: string, rank: number, value: number) => `${label}, ${rank + 1}. sıra, ${fullText(kind, value)}`;
/** Dönem duyurusu: "Ekim 2026, lider Marmara". */
export const periodAnnouncement = (period: string, leader: string) => `${period}, lider ${leader}`;
