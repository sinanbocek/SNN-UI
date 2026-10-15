// Çizgi tekrarının saf mantığı: ara değer, tepe, kıyas oranı, kilit an etkisi ve yazımlar. Sayılar ve saatler ABACUS'tandır.
import { date, math, money } from "@snn/abacus-core";
import { formatCompact, formatMoney, formatMoneyCompact, formatNumber } from "../lib/chart-format";

export interface ReplayPoint { /** Zaman: epoch milisaniyesi, artan sırada (eşit aralıklı olmayabilir). */ t: number; value: number }
export interface ReplayEvent { t: number; /** "issue": sorun anı (farklı simge ve etiketle gösterilir). */ kind?: "event" | "issue"; title: string; detail?: string }
export type ReplayKind = "count" | "money";

const pad2 = (value: number) => String(value).padStart(2, "0");

/** Saat:dakika, Türkiye saatiyle ("09:40"): ABACUS `date.format(…, "time")`. */
export const timeText = (ms: number) => date.format(new Date(ms).toISOString(), "time");
/** Saat:dakika:saniye, Türkiye saatiyle (kaydırıcı hızlı giderken). Saniye damgadan eklenir (ABACUS'a aday). */
export const clockText = (ms: number) => `${timeText(ms)}:${pad2(new Date(ms).getUTCSeconds())}`;

/** Zaman `t` için doğrusal ara değer; aralığın dışında uç değer. Seri boşsa 0. */
export function valueAtTime(points: ReplayPoint[], t: number): number {
  const first = points[0], last = points[points.length - 1];
  if (!first || !last) return 0;
  if (t <= first.t) return first.value;
  if (t >= last.t) return last.value;
  let low = 0, high = points.length - 1;
  while (high - low > 1) { const mid = (low + high) >> 1; if (points[mid]!.t <= t) low = mid; else high = mid; }
  const a = points[low]!, b = points[high]!;
  return a.value + ((b.value - a.value) * (t - a.t)) / (b.t - a.t || 1);
}

/** Zaman `t`'ye kadarki çizgi: `t`'den önceki noktalar ve `t`'deki ara değer. */
export function pointsUntil(points: ReplayPoint[], t: number): ReplayPoint[] {
  const done = points.filter(point => point.t <= t);
  const last = done[done.length - 1];
  if (last && last.t === t) return done;
  return points.length ? [...done, { t, value: valueAtTime(points, t) }] : [];
}

/** Şu ana kadarki tepe: değer ve zamanı. */
export function peakUntil(points: ReplayPoint[], t: number): ReplayPoint | null {
  let best: ReplayPoint | null = null;
  for (const point of points) { if (point.t > t) break; if (!best || point.value > best.value) best = point; }
  return best;
}

/** Değer eksenindeki "güzel" üst sınır (tüm seriye göre sabit): 1-2-2,5-5 basamaklı. */
export function niceTop(max: number): number {
  if (!(max > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  for (const factor of [1, 2, 2.5, 5, 10]) if (factor * magnitude >= max) return factor * magnitude;
  return 10 * magnitude;
}

export const valueText = (kind: ReplayKind, value: number) => kind === "money" ? formatMoney(Math.round(value), 0) : formatNumber(Math.round(value), 0);
export const tickText = (kind: ReplayKind, value: number) => kind === "money" ? formatMoneyCompact(Math.round(value)) : formatCompact(Math.round(value));
/** Kıyasa göre çarpan: "4,8×". Kıyas sıfırsa null. */
export const ratioText = (value: number, base: number): string | null => base > 0 ? `${money.fmtDecimalGrouped(Math.round((value / base) * 10) / 10, 1)}×` : null;

/** Zaman penceresi sonundaki fark: değer(t + ms) - değer(t). */
export const deltaAfter = (points: ReplayPoint[], t: number, ms: number) => valueAtTime(points, t + ms) - valueAtTime(points, t);

/** Kilit an etkisi: sorunda "20 dakikada -%12,3", diğerlerinde "sonraki saatte +1.240". */
export function effectText(kind: ReplayKind, event: ReplayEvent, points: ReplayPoint[]): string {
  if (event.kind === "issue") {
    const before = valueAtTime(points, event.t), after = valueAtTime(points, event.t + 20 * 60000);
    const change = math.percentChange(after, before);
    return change === null ? "20 dakikada değişim yok" : `20 dakikada ${money.percent(change, 1, { sign: "always" })}`;
  }
  const diff = Math.round(deltaAfter(points, event.t, 60 * 60000));
  const text = kind === "money" ? (diff >= 0 ? `+${formatMoney(diff, 0)}` : formatMoney(diff, 0)) : `${diff >= 0 ? "+" : ""}${formatNumber(diff, 0)}`;
  return `sonraki saatte ${text}`;
}

/** Duyuru: "09:40. Sıralamada öne çıktı." */
export const eventAnnouncement = (event: ReplayEvent) => `${timeText(event.t)}. ${event.title}${event.kind === "issue" ? " (sorun)" : ""}.`;
/** Bitiş duyurusu: "Tekrar bitti. Tepe: 6.041, 10:25". */
export const endAnnouncement = (kind: ReplayKind, peak: ReplayPoint | null) => `Tekrar bitti.${peak ? ` Tepe: ${valueText(kind, peak.value)}, ${timeText(peak.t)}` : ""}`;
