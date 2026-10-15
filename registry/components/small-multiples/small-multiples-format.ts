// Küçük çoklu grafiklerin saf mantığı: büyüme, trend, sıralama, ölçek ve yazımlar. Sayılar ve tarihler ABACUS'tandır.
import { collate, date, math, money } from "@snn/abacus-core";

export interface MultiSeries { key: string; label: string; /** Dönem sırasıyla değerler (periods ile aynı uzunlukta). */ values: number[] }
export type SortMode = "last" | "growth" | "name";
export type ScaleMode = "independent" | "shared";
export type Trend = "up" | "flat" | "down" | "none";

/** Geçen yıla göre büyüme yüzdesi: `index` ayı ile `lookback` ay öncesi; geçmiş yoksa ya da taban sıfırsa null. */
export function growthAt(values: number[], index: number, lookback = 12): number | null {
  const base = values[index - lookback], now = values[index];
  if (base === undefined || now === undefined || base === 0) return null;
  return math.percentChange(now, base);
}

/** Trend: büyüme eşiğin (yüzde) altındaysa düz. */
export function trendOf(growth: number | null, flatBelow = 2): Trend {
  if (growth === null) return "none";
  return Math.abs(growth) < flatBelow ? "flat" : growth > 0 ? "up" : "down";
}

export const trendWord = (trend: Trend) => trend === "up" ? "Yükseliyor" : trend === "down" ? "Düşüyor" : trend === "flat" ? "Düz" : "Yeterli geçmiş yok";
export const trendArrow = (trend: Trend) => trend === "up" ? "▲" : trend === "down" ? "▼" : trend === "flat" ? "▬" : "";

/** Büyüme metni: "+%12,3" (gerçek eksi işaretiyle "-%4,0"); yoksa "—". */
export const growthText = (growth: number | null) => growth === null ? "—" : money.percent(growth, 1, { sign: "always" });

/** Panelleri sıralar: son değer (büyükten küçüğe), büyüme (büyükten küçüğe, büyümesizler sonda), ad (Türkçe sıra). */
export function sortSeries<T extends MultiSeries>(series: T[], mode: SortMode, index: number, lookback = 12): T[] {
  const copy = [...series];
  if (mode === "name") return collate.sortBy(copy, item => item.label);
  if (mode === "growth") return copy.sort((a, b) => (growthAt(b.values, index, lookback) ?? -Infinity) - (growthAt(a.values, index, lookback) ?? -Infinity));
  return copy.sort((a, b) => (b.values[index] ?? 0) - (a.values[index] ?? 0));
}

/** Değer ekseni aralığı: bağımsız ölçekte serinin kendi aralığı (iki yanda %10 pay), ortak ölçekte hepsi sıfırdan en büyük değere. */
export function domainFor(series: MultiSeries, all: MultiSeries[], mode: ScaleMode): [number, number] {
  if (mode === "shared") {
    const peak = Math.max(...all.flatMap(item => item.values), 1);
    return [0, peak];
  }
  const min = Math.min(...series.values), max = Math.max(...series.values);
  const pad = (max - min || Math.abs(max) || 1) * .1;
  return [min - pad, max + pad];
}

/** Dönemlerin toplamı: her ayda tüm serilerin toplamı. */
export const totals = (series: MultiSeries[], count: number) => Array.from({ length: count }, (_, at) => series.reduce((sum, item) => sum + (item.values[at] ?? 0), 0));

/** "2026-09" → "Eylül 2026". */
export const periodLabel = (key: string) => date.format(key, "monthYear");

/** Okuma duyurusu: "Eylül 2026: toplam ₺x, en yüksek Marmara ₺y". */
export function readingAnnouncement(label: string, total: string, top: { label: string; value: string } | null): string {
  return `${label}: toplam ${total}${top ? `, en yüksek ${top.label} ${top.value}` : ""}`;
}
