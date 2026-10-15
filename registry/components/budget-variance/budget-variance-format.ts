// Bütçe sapmasının saf mantığı: toplamlar, sapma, ortak ölçek ve yazımlar. Para TRY'dir; sayılar ABACUS'tandır.
import { math, money } from "@snn/abacus-core";
import { formatMoney, formatMoneyCompact, formatPercent } from "../lib/chart-format";

export interface VarianceItem { key: string; name: string; budget: number; actual: number }
export interface VarianceDepartment {
  key: string;
  name: string;
  /** Sorumlu kişinin adı (avatar için). */
  owner?: string;
  /** Kalemler verilirse bütçe ve gerçekleşen kalemlerden toplanır; verilmezse aşağıdaki değerler kullanılır. */
  items?: VarianceItem[];
  budget?: number;
  actual?: number;
}

export interface Resolved { key: string; name: string; owner?: string; budget: number; actual: number; items: VarianceItem[] }

/** Bölümü kalemlerinden toplayarak çözer: toplamlar kalemlerle tutarlı olmak zorundadır. */
export function resolveDepartment(department: VarianceDepartment): Resolved {
  const items = department.items ?? [];
  const budget = items.length ? items.reduce((sum, item) => sum + item.budget, 0) : department.budget ?? 0;
  const actual = items.length ? items.reduce((sum, item) => sum + item.actual, 0) : department.actual ?? 0;
  return { key: department.key, name: department.name, owner: department.owner, budget, actual, items };
}

export type VarianceKind = "over" | "under" | "on";

/** Sapma: gerçekleşen - bütçe (gider: pozitif aşım). `tolerance`: bütçeye oranla "plana uygun" bandı. */
export function variance(budget: number, actual: number, tolerance = .02): { amount: number; percent: number | null; kind: VarianceKind } {
  const amount = actual - budget;
  const percent = math.percentChange(actual, budget);
  const kind: VarianceKind = budget > 0 && Math.abs(amount) <= budget * tolerance ? "on" : amount > 0 ? "over" : amount < 0 ? "under" : "on";
  return { amount, percent, kind };
}

export const kindWord = (kind: VarianceKind) => kind === "over" ? "aşım" : kind === "under" ? "altında" : "plana uygun";

/** İşaretli tutar: "+₺12.000", "-₺8.500" (eksi ABACUS'tan). */
export function signedMoney(amount: number): string {
  const rounded = Math.round(amount);
  return rounded > 0 ? `+${formatMoney(rounded, 0)}` : formatMoney(rounded, 0);
}

/** Sapma yüzdesi ve sözü: "+%12,3 aşım", "-%4,0 altında", "plana uygun". Bütçe sıfırsa yalnız söz. */
export function variancePercentText(budget: number, actual: number, tolerance = .02): string {
  const { percent, kind } = variance(budget, actual, tolerance);
  if (kind === "on" || percent === null) return kindWord(kind);
  return `${money.percent(percent, 1, { sign: "always" })} ${kindWord(kind)}`;
}

export const moneyFull = (value: number) => formatMoney(Math.round(value), 0);
export const moneyShort = (value: number) => formatMoneyCompact(Math.round(value));
export const scalePercent = (ratio: number) => formatPercent(ratio * 100, 0);

/** Çubuk oranı: gerçekleşen / bütçe; bütçe sıfırsa gerçekleşen varsa 2, yoksa 0 (çubuk görünsün). */
export const ratioOf = (budget: number, actual: number) => budget > 0 ? actual / budget : actual > 0 ? 2 : 0;

/** Ortak ölçek tavanı (bütçeye oran): en az 1,2; en büyük orana göre 0,1 basamakla yukarı yuvarlanır. */
export function scaleMax(rows: { budget: number; actual: number }[], floor = 1.2): number {
  const peak = Math.max(floor, ...rows.map(row => ratioOf(row.budget, row.actual)));
  return Math.ceil(peak * 10 - 1e-9) / 10;
}

/** Ekran okuyucu cümlesi: "Satış: bütçe ₺1.200.000, gerçekleşen ₺1.350.000, +₺150.000 (+%12,5 aşım)". */
export function varianceSentence(name: string, budget: number, actual: number, tolerance = .02): string {
  const { amount } = variance(budget, actual, tolerance);
  return `${name}: bütçe ${moneyFull(budget)}, gerçekleşen ${moneyFull(actual)}, ${signedMoney(amount)} (${variancePercentText(budget, actual, tolerance)})`;
}
