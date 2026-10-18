// Fiyat hesaplayıcının saf mantığı: hacim kademeleri, dönemlik toplam, tasarruf, önerilen plan ve yazımlar.
// Para hesabı kuruş tamsayısıyla ABACUS'un `math` ve `money.toMinor` araçlarıyla yapılır; fiyat tablosu uygulamadan gelir.
import { math, money } from "@snn/abacus-core";
import { formatMoney, formatNumber, formatPercent } from "../lib/chart-format";

export type BillingPeriod = "month" | "year";
export interface PriceTier { /** Bu koltuk sayısından itibaren geçerli koltuk başı aylık fiyat (TRY). */ fromSeats: number; price: number }
export interface PlanFeature { label: string; /** Yalnız bu koltuk sayısından itibaren listede. */ fromSeats?: number | undefined; /** Yalnız bu koltuk sayısına kadar listede. */ toSeats?: number | undefined }
export interface PricingPlan {
  key: string;
  name: string;
  description?: string | undefined;
  /** Hacim kademeleri, artan `fromSeats` sırasıyla; ilki taban fiyattır. */
  tiers: PriceTier[];
  /** Plan bu koltuk sayısından büyük seçime satılmaz (sınırlı plan). */
  maxSeats?: number | undefined;
  /** Plan "önerilen" sayılacağı koltuk aralığı: [en az, en çok]; en çok yoksa üst sınırsız. */
  fitsSeats: [number, number | null];
  features: PlanFeature[];
}

/** Koltuk sayısına uyan kademenin koltuk başı aylık fiyatı (kuruş tamsayısı). */
export function seatPriceMinor(plan: PricingPlan, seats: number): number {
  const tier = [...plan.tiers].sort((a, b) => a.fromSeats - b.fromSeats).filter(item => item.fromSeats <= seats).pop() ?? plan.tiers[0];
  return money.toMinor(tier?.price ?? 0) ?? 0;
}

/** Dönem için koltuk başı aylık fiyat: yıllıkta indirim uygulanır, kuruşa yuvarlanır. */
export function periodSeatMinor(plan: PricingPlan, seats: number, period: BillingPeriod, yearlyDiscount: number): number {
  const monthly = seatPriceMinor(plan, seats);
  return period === "year" ? math.round(math.mul(monthly, (100 - yearlyDiscount) / 100), 0) : monthly;
}

/** Dönemlik toplam (kuruş): koltuk başı aylık fiyat × koltuk × ay sayısı. */
export function totalMinor(plan: PricingPlan, seats: number, period: BillingPeriod, yearlyDiscount: number): number {
  return math.mul(math.mul(periodSeatMinor(plan, seats, period, yearlyDiscount), seats), period === "year" ? 12 : 1);
}

/** Yıllık ödemeyle tasarruf (kuruş): 12 aylık aylık-ödeme toplamı eksi yıllık toplam. */
export const savingsMinor = (plan: PricingPlan, seats: number, yearlyDiscount: number) => totalMinor(plan, seats, "month", yearlyDiscount) * 12 - totalMinor(plan, seats, "year", yearlyDiscount);

/** Hacim indirimi: koltuk başı fiyatın tabandan farkı (kuruş); indirim yoksa 0. */
export function volumeDiscountMinor(plan: PricingPlan, seats: number): number {
  const base = money.toMinor(plan.tiers[0]?.price ?? 0) ?? 0;
  return Math.max(base - seatPriceMinor(plan, seats), 0);
}

/** Plan bu seçime satılıyor mu (sınırlı plan üst sınırı aştıysa hayır). */
export const sellable = (plan: PricingPlan, seats: number) => plan.maxSeats === undefined || seats <= plan.maxSeats;

/** Koltuk sayısına en uygun plan: aralığı kapsayan ilk plan; hiçbiri değilse sonuncu. */
export function recommendedKey(plans: PricingPlan[], seats: number): string | undefined {
  const fit = plans.find(plan => seats >= plan.fitsSeats[0] && (plan.fitsSeats[1] === null || seats <= plan.fitsSeats[1]));
  return (fit ?? plans[plans.length - 1])?.key;
}

/** Koltuk sayısına göre listeye giren özellikler. */
export const visibleFeatures = (plan: PricingPlan, seats: number) => plan.features.filter(feature => (feature.fromSeats === undefined || seats >= feature.fromSeats) && (feature.toSeats === undefined || seats <= feature.toSeats));

export const minorMoney = (minor: number) => formatMoney(math.div(minor, 100) ?? 0, 2);
/** Kuruş tamsayısı → ana birim (sayaç için). */
export const majorOf = (minor: number) => math.div(minor, 100) ?? 0;
export const seatsText = (seats: number) => `${formatNumber(seats, 0)} koltuk`;
export const percentText = (percent: number) => formatPercent(percent, 0);
export const periodWord = (period: BillingPeriod) => period === "year" ? "yıllık" : "aylık";

/** Kart altı: "yıllık olarak ödenir, 20 koltuk için". */
export const paymentNote = (period: BillingPeriod, seats: number) => `${period === "year" ? "Yıllık olarak ödenir" : "Aylık olarak ödenir"}, ${seatsText(seats)} için`;
/** Sınırlı plan uyarısı: "Bu plan en çok 10 koltuğa uygun. Siz 20 koltuk seçtiniz." */
export const limitMessage = (max: number, seats: number) => `Bu plan en çok ${formatNumber(max, 0)} koltuğa uygun. Siz ${seatsText(seats)} seçtiniz.`;
