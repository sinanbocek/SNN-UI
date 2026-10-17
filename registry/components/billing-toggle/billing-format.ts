// Faturalama anahtarının saf fiyat mantığı: para yazımı ve yıllık indirim hesabı. React ve CSS içermez; test doğrudan bunu okur.
import { math, money } from "@snn/abacus-core";

/** Para birimi simgesi ("TRY" → "₺"). ABACUS simgeyi tutarın önüne koyar; simge, sıfır tutarın yazımından ayıklanır. */
export function currencyPrefix(currency = "TRY"): string {
  const zero = money.formatMajor(0, { currency, digits: 0, zero: "symbol" });
  return zero === "—" ? "" : zero.replace(/0$/, "");
}

/** Tutarı para birimiyle yazar: (1250, "TRY") → "₺1.250"; `decimals: 2` ile "₺1.250,00". */
export function formatPrice(amount: number, currency = "TRY", decimals = 0): string {
  return money.formatMajor(amount, { currency, digits: decimals, kurus: decimals > 0 });
}

/** Yıllık planda ayın eşdeğer fiyatı: aylık fiyattan yüzde indirim düşülür, tam liraya yuvarlanır. */
export function yearlyMonthlyEquivalent(monthly: number, discountPercent: number): number {
  const rate = math.div(discountPercent, 100) ?? 0;
  return math.round(math.mul(monthly, math.sub(1, rate)), 0);
}

/** Aylık fiyata göre indirim yüzdesi, tam sayıya yuvarlanır. Aylık fiyat sıfır ya da geçersizse 0. */
export function savingsPercent(monthly: number, yearlyEquivalent: number): number {
  if (!Number.isFinite(monthly) || !Number.isFinite(yearlyEquivalent)) return 0;
  const percent = math.percent(math.sub(monthly, yearlyEquivalent), monthly);
  return percent === null ? 0 : math.round(percent, 0);
}

/** Yıl boyunca biriken tasarruf: (aylık − yıllık eşdeğer) × 12. Negatif çıkarsa 0. */
export function yearlySavings(monthly: number, yearlyEquivalent: number): number {
  return math.max(0, math.mul(math.sub(monthly, yearlyEquivalent), 12)) ?? 0;
}
