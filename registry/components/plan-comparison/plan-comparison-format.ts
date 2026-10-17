// Plan karşılaştırmasının saf fiyat mantığı: yıllık indirim hesabı ve tutar yazımı. React ve CSS içermez; test doğrudan bunu okur.
import { math, money } from "@snn/abacus-core";

export type PlanId = "team" | "studio";
export type BillingPeriod = "monthly" | "yearly";

/** Aylık liste fiyatı (TRY, kullanıcı başına) ve yıllık planda uygulanan indirim yüzdesi. */
export const MONTHLY_PRICE: Record<PlanId, number> = { team: 399, studio: 849 };
export const YEARLY_DISCOUNT_PERCENT: Record<PlanId, number> = { team: 20, studio: 20 };

/** Yıllık planda ayın eşdeğer fiyatı: aylık fiyattan yüzde indirim düşülür, tam liraya yuvarlanır. */
export function yearlyEquivalent(monthly: number, discountPercent: number): number {
  const rate = math.div(discountPercent, 100) ?? 0;
  return math.round(math.mul(monthly, math.sub(1, rate)), 0);
}

/** Plan ve dönem için kullanıcı başına aylık tutar (TRY). */
export function planPrice(plan: PlanId, period: BillingPeriod): number {
  const monthly = MONTHLY_PRICE[plan];
  return period === "yearly" ? yearlyEquivalent(monthly, YEARLY_DISCOUNT_PERCENT[plan]) : monthly;
}

/** Aylık fiyata göre indirim yüzdesi, tam sayıya yuvarlanır. Aylık fiyat sıfır ya da geçersizse 0. */
export function savingsPercent(monthly: number, yearly: number): number {
  if (!Number.isFinite(monthly) || !Number.isFinite(yearly)) return 0;
  const percent = math.percent(math.sub(monthly, yearly), monthly);
  return percent === null ? 0 : math.round(percent, 0);
}

/** Planlar arasındaki en yüksek yıllık indirim yüzdesi ("en çok %20 indirim" yazısı için). */
export function maxSavingsPercent(): number {
  const percents = (Object.keys(MONTHLY_PRICE) as PlanId[]).map(plan => savingsPercent(MONTHLY_PRICE[plan], planPrice(plan, "yearly")));
  return math.max(...percents) ?? 0;
}

/** Para birimi simgesi ("TRY" → "₺"); ABACUS simgeyi tutarın önüne koyar, simge sıfır tutarın yazımından ayıklanır. */
export function currencyPrefix(currency = "TRY"): string {
  const zero = money.formatMajor(0, { currency, digits: 0, zero: "symbol" });
  return zero === "—" ? "" : zero.replace(/0$/, "");
}

/** Tam sayı tutarın binlik ayraçlı yazımı: 1249 → "1.249". */
export function formatAmount(amount: number): string {
  return money.fmtDecimalGrouped(amount, 0);
}
