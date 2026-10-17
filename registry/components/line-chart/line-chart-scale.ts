// Çizgi grafiğin değer ekseni ölçeği. Saf mantık: React ve CSS içermez; test doğrudan bunu okur.

/** "zero": eksen sıfırdan başlar (toplam, adet). "auto": eksen verinin aralığına oturur (kur, fiyat, endeks). */
export type LineChartBaseline = "zero" | "auto";

export interface LineScale { min: number; max: number; step: number; ticks: number[] }

const clean = (value: number) => Number(value.toPrecision(12));

/**
 * Temiz kılavuz çizgileri: veriyi en çok dört satırda kapayan en küçük 1, 2, 2,5 ya da 5 adımı.
 * "zero" iken veri sıfırın altına inmedikçe sıfırdan başlar. "auto" iken verinin aralığına oturur; düz seride aralık değerin %1'i kadar açılır.
 */
export function niceScale(low: number, high: number, baseline: LineChartBaseline = "zero"): LineScale {
  let lo: number, hi: number;
  if (baseline === "auto") {
    const pad = high === low ? Math.abs(low) * .01 || 1 : 0;
    lo = low - pad; hi = high + pad;
  } else {
    lo = Math.min(0, low); hi = Math.max(high, lo + 1);
  }
  const span = hi - lo, magnitude = 10 ** Math.floor(Math.log10(span / 4));
  for (const factor of [1, 2, 2.5, 5, 10]) {
    const step = factor * magnitude, bottom = Math.floor(clean(lo / step)) * step, top = Math.ceil(clean(hi / step)) * step;
    if ((top - bottom) / step <= 4 + 1e-9) {
      const ticks: number[] = [];
      for (let value = bottom; value <= top + step / 2; value += step) ticks.push(clean(value));
      return { min: clean(bottom), max: clean(top), step: clean(step), ticks };
    }
  }
  return { min: lo, max: hi, step: span, ticks: [lo, hi] };
}

/** Eksen etiketlerinin birbirinden ayrılması için gereken ondalık sayısı; en az 1. Adım 0,05 → 2, adım 0,25 → 2, adım 5 → 1. */
export function tickDigits(step: number): number {
  if (!(step > 0)) return 1;
  let digits = 0;
  while (digits < 6 && Math.abs(step * 10 ** digits - Math.round(step * 10 ** digits)) > 1e-9) digits++;
  return Math.max(1, digits);
}
