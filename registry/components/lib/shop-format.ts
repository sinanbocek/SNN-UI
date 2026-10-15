// Satış bloklarının ortak yazımı ve kuruş hesabı. Para TRY'dir; sayılar ABACUS'tandır (yerel biçimleyici kullanılmaz).
import { math, money } from "@snn/abacus-core";
import { formatMoney, formatNumber } from "./chart-format";

/** Ana birimdeki tutarı kuruş tamsayısına çevirir (12.5 → 1250). Geçersizse 0. */
export const toMinor = (major: number): number => money.toMinor(major) ?? 0;
/** Kuruş tamsayısını ana birime çevirir (1250 → 12.5), yalnız gösterim için. */
export const toMajor = (minor: number): number => math.div(minor, 100) ?? 0;

/** Ürün fiyatı: kuruşu yoksa "₺1.250", varsa "₺1.250,50". */
export function priceText(major: number): string {
  return formatMoney(major, toMinor(major) % 100 === 0 ? 0 : 2);
}

/** Tutar her zaman iki ondalıkla ("₺4.801,80"); toplam satırlarında hizalı durur. */
export const exactText = (minor: number): string => formatMoney(toMajor(minor), 2);

/** İşaretli tutar: "+₺12,00", "-₺12,00". Sıfır işaretsiz yazılır. */
export function signedMinorText(minor: number): string {
  return minor > 0 ? `+${exactText(minor)}` : exactText(minor);
}

/** Adet ya da sayaç: "1.234". */
export const countText = (count: number): string => formatNumber(count, 0);

/** Tek ondalıklı ortalama: 4.6 → "4,6". */
export const averageText = (value: number): string => money.fmtDecimalGrouped(math.round(value, 1), 1);

/** Adet × birim fiyat, kuruş tamsayısıyla. */
export const lineMinor = (unitMinor: number, quantity: number): number => math.mul(unitMinor, Math.max(0, quantity));

/** Yüzde yazımı: 20 → "%20". */
export const percentText = (percent: number, digits = 0): string => money.percent(percent, digits);

/** Sayıyı aralığa sıkıştırır. */
export const clampInt = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, Math.round(value)));
