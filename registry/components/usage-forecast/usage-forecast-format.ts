// Kullanım tahmininin saf mantığı: gidiş, belirsizlik konisi, bütçe kesişimi, uyarı eşikleri ve yazımlar. Sayılar ve tarihler ABACUS'tandır.
import { date } from "@snn/abacus-core";
import { formatCompact, formatMoney, formatNumber, formatPercent } from "../lib/chart-format";

export interface Forecast {
  /** Geçen gün sayısı (okuma sayısı). */
  elapsed: number;
  /** Tahmin için yeterli veri var mı (en az üç gün). */
  enough: boolean;
  /** Günlük ortalama artış (son yedi gün). */
  rate: number;
  /** Günlük artışın standart sapması (son 14 gün). */
  sigma: number;
  /** Gün başına değer; gerçekleşen gün sayısından sonrası null. */
  actual: (number | null)[];
  /** Tahmin ve olası aralık (bugünden dönem sonuna); önceki günler null. */
  mid: (number | null)[];
  low: (number | null)[];
  high: (number | null)[];
}

/** Gerçekleşen kümülatif kullanımdan dönem sonuna doğrusal gidiş ve yaklaşık %80'lik olası aralık (koni). */
export function forecastUsage(used: number[], days: number): Forecast {
  const elapsed = Math.min(used.length, days);
  const actual: (number | null)[] = Array.from({ length: days }, (_, at) => at < elapsed ? used[at] ?? 0 : null);
  const empty = Array.from({ length: days }, () => null);
  if (elapsed < 3) return { elapsed, enough: false, rate: 0, sigma: 0, actual, mid: empty, low: empty, high: empty };
  const steps = used.slice(0, elapsed).map((value, at) => value - (used[at - 1] ?? 0));
  const recent = steps.slice(-7), spread = steps.slice(-14);
  const rate = recent.reduce((sum, step) => sum + step, 0) / recent.length;
  const average = spread.reduce((sum, step) => sum + step, 0) / spread.length;
  const sigma = Math.sqrt(spread.reduce((sum, step) => sum + (step - average) ** 2, 0) / spread.length);
  const base = used[elapsed - 1] ?? 0;
  const mid = Array.from({ length: days }, (_, at) => at < elapsed - 1 ? null : base + rate * (at - (elapsed - 1)));
  const band = (at: number) => 1.28 * sigma * Math.sqrt(Math.max(at - (elapsed - 1), 0));
  const low = mid.map((value, at) => value === null ? null : Math.max(base, value - band(at)));
  const high = mid.map((value, at) => value === null ? null : value + band(at));
  return { elapsed, enough: true, rate, sigma, actual, mid, low, high };
}

/** Serinin eşiği ilk aştığı gün sırası (kesirli, doğrusal ara değerle); hiç aşmıyorsa null. */
export function crossingDay(series: (number | null)[], threshold: number): number | null {
  for (let at = 0; at < series.length; at++) {
    const value = series[at];
    if (value === null || value === undefined || value < threshold) continue;
    const before = series[at - 1];
    if (at === 0 || before === null || before === undefined || before >= threshold) return at;
    return at - 1 + (threshold - before) / (value - before);
  }
  return null;
}

/** Bütçe aşma bilgisi: gerçekleşen kullanım aştıysa `exceeded`; yoksa tahminle beklenen gün ve aralık. */
export interface BudgetOutlook {
  exceeded: boolean;
  /** Aşma günü sırası (gerçekleşen ya da tahmin); aşılmayacaksa null. */
  day: number | null;
  /** Olası aralık: en erken ve en geç gün sırası (yalnız tahmin aşmasında). */
  earliest: number | null;
  latest: number | null;
  /** Dönem sonu tahmini ve aralığı. */
  endMid: number | null;
  endLow: number | null;
  endHigh: number | null;
}

export function budgetOutlook(forecast: Forecast, budget: number): BudgetOutlook {
  const last = forecast.actual.length - 1;
  const done = crossingDay(forecast.actual, budget);
  const endMid = forecast.mid[last] ?? null, endLow = forecast.low[last] ?? null, endHigh = forecast.high[last] ?? null;
  if (done !== null) return { exceeded: true, day: done, earliest: null, latest: null, endMid, endLow, endHigh };
  if (!forecast.enough) return { exceeded: false, day: null, earliest: null, latest: null, endMid, endLow, endHigh };
  const day = crossingDay(forecast.mid, budget);
  return { exceeded: false, day, earliest: day === null ? null : crossingDay(forecast.high, budget), latest: day === null ? null : crossingDay(forecast.low, budget), endMid, endLow, endHigh };
}

/** Başlangıç tarihine gün ekler (ISO "2026-09-01" → "2026-09-26"). */
export function addDays(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1, day + Math.floor(days))).toISOString().slice(0, 10);
}

/** Gün sırasını tarih metnine çevirir: "26 Eylül 2026". */
export const dayText = (start: string, day: number) => date.format(addDays(start, day), "long");

export const usageText = (value: number) => formatNumber(Math.round(value), 0);
export const usageShort = (value: number) => formatCompact(Math.round(value));
export const percentOf = (value: number, budget: number) => formatPercent(budget > 0 ? (value / budget) * 100 : 0, 0);
export const moneyText = (value: number) => formatMoney(Math.round(value * 100) / 100, 2);

/** Bütçe üstü maliyet: aşım miktarı / birim miktarı × birim fiyat (TRY). */
export function overageCost(endMid: number | null, budget: number, per: number, price: number): number | null {
  if (endMid === null || endMid <= budget || per <= 0) return null;
  return ((endMid - budget) / per) * price;
}

/** Ana cümle. `todayDay`: bugünün gün sırası (dönem kapanışına kalan gün hesabı için). */
export function forecastSentence(start: string, days: number, elapsed: number, budget: number, outlook: BudgetOutlook, enough: boolean, exceededBy: number): string {
  if (outlook.exceeded && outlook.day !== null) return `Bütçeyi ${dayText(start, outlook.day)} günü aştınız; aşım ${usageText(exceededBy)}.`;
  if (!enough) return "Tahmin için yeterli veri yok.";
  const remaining = days - elapsed;
  if (outlook.day === null) return `Dönem sonunda bütçenin altında kalırsınız. Dönem kapanmasına ${formatNumber(remaining, 0)} gün var.`;
  const range = outlook.earliest !== null && outlook.latest !== null ? `, büyük olasılıkla ${dayText(start, outlook.earliest)} – ${dayText(start, outlook.latest)} arası` : outlook.earliest !== null ? `, en erken ${dayText(start, outlook.earliest)}` : "";
  return `Bu hızla bütçeye ${dayText(start, outlook.day)} günü ulaşırsınız. Dönem kapanmasına ${formatNumber(remaining, 0)} gün var${range}.`;
}

export interface ThresholdState { percent: number; /** "reached": gerçekleşti, "expected": beklenen, "none": beklenmiyor. */ state: "reached" | "expected" | "none"; day: number | null }

/** Uyarı eşiklerinin durumu: gerçekleşen kullanım ya da tahminle ulaşılacak gün. */
export function thresholdStates(forecast: Forecast, budget: number, percents: number[] = [50, 80, 100]): ThresholdState[] {
  return percents.map(percent => {
    const level = (budget * percent) / 100;
    const done = crossingDay(forecast.actual, level);
    if (done !== null) return { percent, state: "reached", day: done };
    const expected = forecast.enough ? crossingDay(forecast.mid, level) : null;
    return expected === null ? { percent, state: "none", day: null } : { percent, state: "expected", day: expected };
  });
}

/** Bütçe tutamacı adımı: en az–en çok aralığının yirmide biri, en az 1. */
export const budgetStep = (min: number, max: number) => Math.max(1, Math.round((max - min) / 20));

/** Ekran okuyucu: "bütçe 38 milyon, 26 Eylül 2026'da aşılır". */
export function budgetSpoken(start: string, budget: number, outlook: BudgetOutlook): string {
  const base = `bütçe ${usageText(budget)}`;
  if (outlook.exceeded && outlook.day !== null) return `${base}, ${dayText(start, outlook.day)} günü aşıldı`;
  if (outlook.day !== null) return `${base}, ${dayText(start, outlook.day)} günü aşılır`;
  return `${base}, dönem sonunda aşılmaz`;
}

