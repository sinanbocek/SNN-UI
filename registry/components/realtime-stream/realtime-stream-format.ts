// Canlı akışın saf mantığı: pencere, eksen aralığı, en yakın okuma ve yazımlar. Sayılar ve saatler ABACUS'tandır.
import { date } from "@snn/abacus-core";
import { formatCompact, formatMoney, formatMoneyCompact, formatNumber } from "../lib/chart-format";

export interface StreamReading { /** Okuma zamanı: epoch milisaniyesi. */ t: number; value: number; /** Anomali notu ("Sıçrama" gibi). Grafik anomali bulmaz; etiketi veri sağlar. */ note?: string }
export type StreamKind = "number" | "money";

const pad2 = (value: number) => String(value).padStart(2, "0");

/**
 * Saat:dakika:saniye, Türkiye saatiyle ("14:03:27"). Saat ve dakika ABACUS `date.format(…, "time")`, saniye damgadan gelir.
 * ABACUS'ta saniyeli saat biçimi yok (ABACUS'a aday).
 */
export function clockText(ms: number): string {
  const stamp = new Date(ms);
  return `${date.format(stamp.toISOString(), "time")}:${pad2(stamp.getUTCSeconds())}`;
}

/** Pencere içindeki okumalar: [end - windowMs, end] ve çizgi kenardan çıksın diye bir yanındaki komşular. */
export function windowReadings(readings: StreamReading[], end: number, windowMs: number): StreamReading[] {
  const start = end - windowMs;
  const out: StreamReading[] = [];
  for (let at = 0; at < readings.length; at++) {
    const reading = readings[at]!;
    const next = readings[at + 1], before = readings[at - 1];
    const inside = reading.t >= start && reading.t <= end;
    const edge = (next && next.t >= start && reading.t < start) || (before && before.t <= end && reading.t > end);
    if (inside || edge) out.push(reading);
  }
  return out;
}

/** Değer ekseni aralığı: sabit sınır verilmişse o; yoksa görünen okumaların aralığı, iki yanda %12 payla. */
export function domainFor(visible: StreamReading[], fixedMin?: number, fixedMax?: number): [number, number] {
  let low = fixedMin, high = fixedMax;
  if (low === undefined || high === undefined) {
    const values = visible.map(reading => reading.value);
    const min = values.length ? Math.min(...values) : 0, max = values.length ? Math.max(...values) : 1;
    const pad = (max - min || Math.abs(max) || 1) * .12;
    low ??= min - pad; high ??= max + pad;
  }
  return high > low ? [low, high] : [low, low + 1];
}

/** Verilen zamana en yakın okumanın sırası; okuma yoksa -1. */
export function nearestIndex(readings: StreamReading[], t: number): number {
  let best = -1, gap = Infinity;
  readings.forEach((reading, at) => { const distance = Math.abs(reading.t - t); if (distance < gap) { gap = distance; best = at; } });
  return best;
}

/** Zaman ekseni etiketleri: pencereyi `count` eşit parçaya bölen anlar (en eski sol). */
export function timeTicks(end: number, windowMs: number, count = 3): number[] {
  return Array.from({ length: count + 1 }, (_, at) => end - windowMs + (windowMs * at) / count);
}

/** Büyük değer ve nokta değeri: sayı `decimals` ondalıkla ("1.234,5"), tutar TRY ("₺1.234,50"). */
export function valueText(kind: StreamKind, value: number, decimals = 0): string {
  return kind === "money" ? formatMoney(value, 2) : formatNumber(value, decimals);
}
/** Eksen etiketi: kısa biçim ("1,2B", "₺1,25Mn"). */
export const tickText = (kind: StreamKind, value: number) => kind === "money" ? formatMoneyCompact(value) : formatCompact(value);

/** Nokta okuması: "14:03:27 · 142 ms · Sıçrama". */
export function readingText(kind: StreamKind, reading: StreamReading, unit = "", decimals = 0): string {
  return `${clockText(reading.t)} · ${valueText(kind, reading.value, decimals)}${unit ? ` ${unit}` : ""}${reading.note ? ` · ${reading.note}` : ""}`;
}
export const anomalyAnnouncement = (kind: StreamKind, reading: StreamReading, unit = "", decimals = 0) =>
  `Olağandışı değer: ${reading.note ?? ""}, ${valueText(kind, reading.value, decimals)}${unit ? ` ${unit}` : ""}`;

/** Yumuşak çizgi: noktaların orta noktalarından geçen ikinci derece eğriler. */
export function smoothPath(points: { x: number; y: number }[]): string {
  if (!points.length) return "";
  const round = (value: number) => Math.round(value * 100) / 100;
  if (points.length === 1) return `M${round(points[0]!.x)} ${round(points[0]!.y)}`;
  let d = `M${round(points[0]!.x)} ${round(points[0]!.y)}`;
  for (let at = 1; at < points.length - 1; at++) {
    const p = points[at]!, q = points[at + 1]!;
    d += `Q${round(p.x)} ${round(p.y)} ${round((p.x + q.x) / 2)} ${round((p.y + q.y) / 2)}`;
  }
  const last = points[points.length - 1]!;
  return `${d}L${round(last.x)} ${round(last.y)}`;
}
