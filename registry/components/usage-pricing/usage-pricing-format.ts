// Kullanıma göre fiyat hesaplayıcının saf mantığı: en uygun plan, kalem kalem döküm, yıllık tasarruf ve yazımlar.
// Para hesabı kuruş tamsayısıyla ABACUS'un `math` ve `money.toMinor` araçlarıyla yapılır; fiyat tablosu uygulamadan gelir.
import { math, money } from "@snn/abacus-core";
import { formatCompact, formatMoney, formatNumber, formatPercent } from "../lib/chart-format";

export type BillingPeriod = "month" | "year";
export interface UsagePlan {
  key: string;
  name: string;
  /** Koltuk başı aylık fiyat (TRY). */
  seatPrice: number;
  /** Planın aylık dahil kullanım payı (örneğin istek sayısı). */
  includedUsage: number;
  /** Aşımda her milyon birim için fiyat (TRY). */
  overagePerMillion: number;
  /** Plan bu koltuk sayısından büyük seçime satılmaz. */
  maxSeats?: number | undefined;
  features: string[];
  description?: string | undefined;
}

export interface Breakdown {
  seats: number;
  seatLineMinor: number;
  /** Dahil payı aşan kullanım miktarı ve tutarı. */
  overage: number;
  overageLineMinor: number;
  /** Dönem başı: aylık ise bir ay, yıllıkta indirimli aylık karşılığı. */
  monthlyMinor: number;
  /** Dönemlik toplam (yıllıkta 12 ay, indirimli). */
  periodMinor: number;
  /** Yıllık ödemeyle tasarruf (aylıkta 0). */
  savingsMinor: number;
}

const minor = (major: number) => money.toMinor(major) ?? 0;

/** Bir planın seçime göre dökümü: koltuk × fiyat + aşım × milyon başı fiyat; yıllıkta indirim toplama uygulanır. */
export function breakdown(plan: UsagePlan, seats: number, usage: number, period: BillingPeriod, yearlyDiscount: number): Breakdown {
  const seatLineMinor = math.mul(minor(plan.seatPrice), seats);
  const overage = Math.max(usage - plan.includedUsage, 0);
  const overageLineMinor = math.round(math.mul(minor(plan.overagePerMillion), overage / 1_000_000), 0);
  const monthMinor = math.add(seatLineMinor, overageLineMinor);
  const yearMinor = math.round(math.mul(math.mul(monthMinor, 12), (100 - yearlyDiscount) / 100), 0);
  return {
    seats, seatLineMinor, overage, overageLineMinor,
    monthlyMinor: period === "year" ? math.round(yearMinor / 12, 0) : monthMinor,
    periodMinor: period === "year" ? yearMinor : monthMinor,
    savingsMinor: period === "year" ? math.sub(math.mul(monthMinor, 12), yearMinor) : 0,
  };
}

/** Önerilen plan: seçime satılan planlar arasında aylık toplamı en düşük olan; eşitlikte küçük plan. Hiçbiri satılmıyorsa null (özel teklif). */
export function recommendPlan(plans: UsagePlan[], seats: number, usage: number): UsagePlan | null {
  const eligible = plans.filter(plan => plan.maxSeats === undefined || seats <= plan.maxSeats);
  let best: UsagePlan | null = null, bestCost = Infinity;
  for (const plan of eligible) {
    const cost = breakdown(plan, seats, usage, "month", 0).periodMinor;
    if (cost < bestCost) { best = plan; bestCost = cost; }
  }
  return best;
}

/** Bir önceki plana göre yeni özellikler (iki plan karşılaştırması). */
export function newFeatures(plans: UsagePlan[], plan: UsagePlan): Set<string> {
  const at = plans.findIndex(item => item.key === plan.key);
  const previous = at > 0 ? plans[at - 1] : undefined;
  return new Set(plan.features.filter(feature => !previous?.features.includes(feature)));
}

export const minorMoney = (value: number) => formatMoney(math.div(value, 100) ?? 0, 2);
export const majorOf = (value: number) => math.div(value, 100) ?? 0;
export const seatsText = (seats: number) => `${formatNumber(seats, 0)} koltuk`;
/** Kısa kullanım: 15000000 → "15Mn"; tam biçim tablo ve etikette. */
export const usageShort = (usage: number) => formatCompact(usage);
export const usageFull = (usage: number) => formatNumber(usage, 0);
export const usageSpoken = (usage: number, label: string) => `${usageFull(usage)} ${label}`;
export const percentText = (percent: number) => formatPercent(percent, 0);
/** Aşım miktarı milyon cinsinden: 2500000 → "2,5 Mn". */
export const overageText = (overage: number) => `${money.decimal(overage / 1_000_000, 2)} Mn`;
export const pricePerMillion = (plan: UsagePlan) => `${formatMoney(plan.overagePerMillion, 2)} / Mn`;

/** Plan değişim duyurusu: "Takım planı önerilir: 20 koltuk ve 15Mn istek". */
export const recommendationAnnouncement = (plan: UsagePlan | null, seats: number, usage: number, label: string) =>
  plan ? `${plan.name} planı önerilir: ${seatsText(seats)} ve ${usageShort(usage)} ${label}` : "Bu seçim için özel teklif gerekir";

/** Plan ölçeğinde bir seçimin konumu (0–1): koltuk sayısının planların koltuk sınırlarına göre ilerlemesi. */
export function scalePosition(plans: UsagePlan[], plan: UsagePlan | null): number {
  if (!plan || plans.length < 2) return 0;
  return plans.findIndex(item => item.key === plan.key) / (plans.length - 1);
}
