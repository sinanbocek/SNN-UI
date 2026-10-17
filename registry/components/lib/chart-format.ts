// Grafik ve sayı bileşenlerinin ortak biçimleyicileri. Hepsi ABACUS'a dayanır (giris-alanlari-standardi.md):
// binlik ayracı nokta, ondalık ayracı virgül ("1.234,5"). Tarayıcı yerel biçimleyicileri ve toFixed kullanılmaz.
import { math, money } from "@snn/abacus-core";

/** Kısaltmanın başladığı eşik: bunun altındaki sayı kısaltılmadan yazılır. */
export const COMPACT_FROM = 1000;

/**
 * Sayıyı binlik ayraçlı yazar; en çok `maxDigits` ondalık basamak, sondaki sıfırlar atılır.
 * 1234.5 → "1.234,5", 1234 → "1.234", -0.5 → "-0,5".
 * İşareti burada ayrıca yönetiriz: ABACUS `fmtDecimalGrouped` -1 ile 0 arasındaki değerde eksiyi düşürüyor (ABACUS'a aday).
 */
export function formatNumber(value: number, maxDigits = 1): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = math.round(value, maxDigits);
  const text = money.fmtDecimalGrouped(math.abs(rounded), maxDigits);
  const trimmed = text.includes(",") ? text.replace(/0+$/, "").replace(/,$/, "") : text;
  return rounded < 0 ? `-${trimmed}` : trimmed;
}

/**
 * Birimsiz kısaltma (eksen etiketi için): 1250000 → "1,25Mn", 12500 → "12,5B" (B = bin, Mn = milyon, Mr = milyar).
 * Eşiğin altı kısaltılmaz ve en çok 1 ondalıkla yazılır. ABACUS kısaltması para birimi simgesi koyar; burada simge atılır
 * (birimsiz kısaltma ABACUS'ta yok, aday).
 */
export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (math.abs(value) < COMPACT_FROM) return formatNumber(value, 1);
  return money.compactMajor(value, { style: "B/Mn/Mr" }).replace("₺", "");
}

/** Para tutarı; varsayılan birim TRY: 1250000 → "₺1.250.000", 1234.5 ve `digits: 2` → "₺1.234,50". */
export function formatMoney(value: number, digits = 0, currency = "TRY"): string {
  return money.formatMajor(value, { currency, digits, kurus: digits > 0 });
}

/** Kısaltılmış para tutarı: 1250000 → "₺1,25Mn". */
export function formatMoneyCompact(value: number, currency = "TRY"): string {
  return money.compactMajor(value, { style: "B/Mn/Mr", currency });
}

/** Oranı yüzde yazar: 0.123 → "%12,3". `digits` ondalık basamak sayısıdır. */
export function formatRatio(ratio: number, digits = 0): string {
  return money.percent(math.mul(ratio, 100), digits);
}

/** Zaten yüzde olan sayıyı yazar: 12.3 → "%12,3". `fixed` ile ondalık basamak hep tamamlanır ("%12,0"); sütunda hizalamak için. */
export function formatPercent(percent: number, digits = 0, fixed = false): string {
  return money.percent(percent, digits, { fixed });
}

/** Değişim yüzdesi, işaretli: önceki 100, şimdi 120 → "+%20". Önceki sıfırsa "—". */
export function formatChange(current: number, previous: number, digits = 1): string {
  const change = math.percentChange(current, previous);
  return change === null ? "—" : money.percent(change, digits, { sign: "always" });
}

/**
 * Çizim koordinatını `digits` basamağa yuvarlar (SVG yolu, CSS dönüşümü). Görüntülenen sayı için değil, geometri içindir;
 * kare başına çok çağrıldığı için ABACUS yerine düz `Math.round` kullanır. Sonuç sayıdır, şablon metnine konunca yazılır.
 */
export function roundTo(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** Noktalardan yumuşak çizgi yolu: noktaların orta noktalarından geçen ikinci derece eğriler. */
export function smoothLine(points: { x: number; y: number }[]): string {
  if (!points.length) return "";
  const round = (value: number) => Math.round(value * 100) / 100;
  const first = points[0]!;
  if (points.length === 1) return `M${round(first.x)} ${round(first.y)}`;
  let d = `M${round(first.x)} ${round(first.y)}`;
  for (let at = 1; at < points.length - 1; at++) {
    const p = points[at]!, q = points[at + 1]!;
    d += `Q${round(p.x)} ${round(p.y)} ${round((p.x + q.x) / 2)} ${round((p.y + q.y) / 2)}`;
  }
  const last = points[points.length - 1]!;
  return `${d}L${round(last.x)} ${round(last.y)}`;
}

/** Değer dizisinden `width` × `height` kutusuna sığan yumuşak mini çizgi yolu (küçük kart grafikleri için). `low`/`high` verilirse ölçek ortaktır. */
export function miniLinePath(values: number[], width = 100, height = 32, pad = 2, low?: number, high?: number): string {
  if (!values.length) return "";
  const min = low ?? Math.min(...values), max = high ?? Math.max(...values), span = max - min || 1;
  return smoothLine(values.map((value, at) => ({ x: values.length === 1 ? width / 2 : (at / (values.length - 1)) * width, y: pad + (1 - (value - min) / span) * (height - 2 * pad) })));
}
