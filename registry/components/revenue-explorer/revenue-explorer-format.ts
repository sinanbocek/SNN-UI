// Gelir gezgininin saf mantığı: dönem penceresi, özet hesabı ve yazımlar. Sayılar ve tarihler ABACUS'tandır.
import { date, math } from "@snn/abacus-core";
import { formatChange, formatMoney, formatMoneyCompact, formatNumber, formatPercent } from "../lib/chart-format";

export interface RevenueMonth {
  /** Ay anahtarı: "2026-03". */
  key: string;
  /** Yeni müşterilerden gelen aylık yinelenen gelir. */
  newMrr: number;
  /** Mevcut müşterilerde artış (genişleme). */
  expansion: number;
  /** Kayıp: pozitif büyüklük olarak verilir, grafikte sıfırın altına çizilir. */
  churn: number;
  /** Ay sonu toplam gelir. */
  total: number;
}

export interface MonthRange { start: number; end: number }

/** "2026-03" → "Mart 2026". */
export const monthLabel = (key: string) => date.format(key, "monthYear");
/** "2026-03" → "Mar". */
export function shortMonth(key: string): string {
  return date.monthName(Number(key.slice(5, 7)), "short");
}
/** Eksen etiketi: ocakta yıl da yazılır ("Oca 2026"), diğer aylarda kısa ay adı. */
export function axisMonth(key: string): string {
  return key.endsWith("-01") ? `${shortMonth(key)} ${key.slice(0, 4)}` : shortMonth(key);
}

/** Dönem düğmesi: `length` ay (0 = tümü), pencerenin sonu korunur. */
export function rangeFor(length: number, end: number, count: number): MonthRange {
  if (length <= 0 || length >= count) return { start: 0, end: count - 1 };
  const clampedEnd = Math.min(Math.max(end, length - 1), count - 1);
  return { start: clampedEnd - length + 1, end: clampedEnd };
}

/** Pencereyi ya da bir tutamacı aylık adımlarla oynatır; en az iki ay kalır, uçlar geçmişin dışına çıkmaz. */
export function moveRange(range: MonthRange, part: "start" | "end" | "window", delta: number, count: number): MonthRange {
  if (part === "window") {
    const span = range.end - range.start;
    const start = Math.min(Math.max(range.start + delta, 0), count - 1 - span);
    return { start, end: start + span };
  }
  if (part === "start") return { start: Math.min(Math.max(range.start + delta, 0), range.end - 1), end: range.end };
  return { start: range.start, end: Math.max(Math.min(range.end + delta, count - 1), range.start + 1) };
}

/** Yatay konumdan (0–genişlik) ay sırası. */
export function indexAt(x: number, width: number, count: number): number {
  if (width <= 0) return 0;
  return Math.min(count - 1, Math.max(0, Math.round((x / width) * (count - 1))));
}

export const netNew = (month: RevenueMonth) => month.newMrr + month.expansion - month.churn;

export interface RangeSummary {
  /** Penceredeki son ayın toplam geliri. */
  total: number;
  /** Pencere başındaki (ilk ayın başı) toplam gelir. */
  opening: number;
  /** Pencerenin başından beri büyüme yüzdesi (başlangıç sıfırsa null). */
  growth: number | null;
  /** Aylık ortalama net yeni gelir. */
  netNewAverage: number;
  /** Aylık kayıp oranı ortalaması (yüzde): ay kaybı / ay başı toplam. */
  churnRate: number;
}

export function summarize(months: RevenueMonth[], range: MonthRange): RangeSummary {
  const slice = months.slice(range.start, range.end + 1);
  const last = slice[slice.length - 1];
  const before = months[range.start - 1];
  const opening = before?.total ?? (slice[0] ? slice[0].total - netNew(slice[0]) : 0);
  const rates = slice.map((month, at) => {
    const start = at === 0 ? opening : slice[at - 1]!.total;
    return start > 0 ? (month.churn / start) * 100 : 0;
  });
  return {
    total: last?.total ?? 0,
    opening,
    growth: opening > 0 && last ? math.percentChange(last.total, opening) : null,
    netNewAverage: slice.length ? slice.reduce((sum, month) => sum + netNew(month), 0) / slice.length : 0,
    churnRate: rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0,
  };
}

/** Bir önceki aynı uzunlukta pencere; geçmiş yetmiyorsa null. */
export const previousRange = (range: MonthRange): MonthRange | null => {
  const length = range.end - range.start + 1;
  return range.start - length >= 0 ? { start: range.start - length, end: range.start - 1 } : null;
};

export const moneyText = (value: number) => formatMoney(Math.round(value), 0);
export const moneyShort = (value: number) => formatMoneyCompact(Math.round(value));
export const rateText = (percent: number) => formatPercent(percent, 2, true);
export const growthText = (summary: RangeSummary) => formatChange(summary.total, summary.opening, 1);
/** Kayıp oranı farkı: "+0,12 puan". */
export function pointsText(current: number, previous: number): string {
  const diff = math.round(current - previous, 2);
  return `${diff > 0 ? "+" : ""}${formatNumber(diff, 2)} puan`;
}
/** Net yeni gelir değişimi: önceki dönem ortalamasına göre "+%12,3" ya da "—". */
export const netChangeText = (current: number, previous: number) => formatChange(current, previous, 1);
