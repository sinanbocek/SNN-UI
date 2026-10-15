// Grafik ve sayı bileşenlerinin ortak biçimleyicileri. Hepsi ABACUS'a dayanır (giris-alanlari-standardi.md):
// binlik ayracı nokta, ondalık ayracı virgül ("1.234,5"). Tarayıcı yerel biçimleyicileri ve toFixed kullanılmaz.
import { math, money } from "@snn/abacus-core";

/** Kısaltmanın başladığı eşik: bunun altındaki sayı kısaltılmadan yazılır. */
const COMPACT_FROM = 1000;

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

/** Zaten yüzde olan sayıyı yazar: 12.3 → "%12,3". */
export function formatPercent(percent: number, digits = 0): string {
  return money.percent(percent, digits);
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
