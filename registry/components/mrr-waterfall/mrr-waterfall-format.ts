// Gelir şelalesinin saf mantığı: basamaklar, göstergeler, ölçek ve yazımlar. Sayılar ve tarihler ABACUS'tandır.
import { math, money } from "@snn/abacus-core";
import { formatMoney, formatMoneyCompact, formatNumber, formatPercent } from "../lib/chart-format";

export type MovementRole = "new" | "expansion" | "reactivation" | "contraction" | "churn";
export interface WaterfallAccount { key: string; name: string; /** Ay ve plan gibi ek bilgi: "Mart 2026 · Pro". */ detail?: string; amount: number }
export interface WaterfallMovement {
  key: string;
  label: string;
  /** Yön: "up" artırır, "down" azaltır. */
  direction: "up" | "down";
  /** Pozitif büyüklük; yön ayrıca verilir. */
  amount: number;
  /** Net elde tutma ve hızlı oran için hareketin türü (isteğe bağlı). */
  role?: MovementRole;
  accounts?: WaterfallAccount[];
  /** Toplam hesap sayısı; verilmezse `accounts.length`. */
  accountCount?: number;
}

export type WaterfallUnit = "amount" | "percent";
export interface WaterfallStep {
  key: string;
  label: string;
  kind: "total" | "up" | "down";
  /** Büyüklük (toplam çubuğunda değerin kendisi). */
  amount: number;
  /** Çubuğun alt ve üst seviyesi (tutar). */
  low: number;
  high: number;
  accountCount: number;
  accounts: WaterfallAccount[];
}

/** Başlangıç, hareketler ve bitiş basamakları; yüzen çubuklar önceki seviyeden başlar. */
export function buildSteps(start: number, movements: WaterfallMovement[], startLabel = "Başlangıç", endLabel = "Bitiş"): WaterfallStep[] {
  let running = start;
  const steps: WaterfallStep[] = [{ key: "start", label: startLabel, kind: "total", amount: start, low: 0, high: start, accountCount: 0, accounts: [] }];
  for (const movement of movements) {
    const from = running, to = running + (movement.direction === "up" ? movement.amount : -movement.amount);
    running = to;
    const accounts = movement.accounts ?? [];
    steps.push({ key: movement.key, label: movement.label, kind: movement.direction, amount: movement.amount, low: Math.min(from, to), high: Math.max(from, to), accountCount: movement.accountCount ?? accounts.length, accounts });
  }
  steps.push({ key: "end", label: endLabel, kind: "total", amount: running, low: 0, high: running, accountCount: 0, accounts: [] });
  return steps;
}

export interface WaterfallIndicators {
  /** Net elde tutma: (başlangıç + genişleme − daralma − kayıp) / başlangıç, yüzde. Başlangıç sıfırsa null. */
  netRetention: number | null;
  /** Hızlı oran: kazanılan / kaybedilen. Kayıp sıfırsa null. */
  quickRatio: number | null;
  /** Müşteri kaybı: kayıp / başlangıç, yüzde. */
  churn: number | null;
}

export function indicators(start: number, movements: WaterfallMovement[]): WaterfallIndicators {
  const sum = (roles: MovementRole[]) => movements.filter(movement => movement.role && roles.includes(movement.role)).reduce((total, movement) => total + movement.amount, 0);
  const gained = sum(["new", "expansion", "reactivation"]), lost = sum(["contraction", "churn"]);
  return {
    netRetention: start > 0 ? ((start + sum(["expansion"]) - lost) / start) * 100 : null,
    quickRatio: lost > 0 ? gained / lost : null,
    churn: start > 0 ? (sum(["churn"]) / start) * 100 : null,
  };
}

/** Eksen üst sınırı: en büyük seviyeyi aşan 1-2-2,5-5 basamaklı değer; çubuklar "güzel" aralıkta durur. */
export function niceTop(max: number): number {
  if (!(max > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  for (const factor of [1, 2, 2.5, 5, 10]) if (factor * magnitude >= max) return factor * magnitude;
  return 10 * magnitude;
}

/** Değeri birime göre yazar: tutar "₺1.250.000" (tam) ya da "₺1,25Mn" (kısa); yüzde birimde başlangıca göre "%112,5". */
export function stepValueText(unit: WaterfallUnit, value: number, base: number, short = false): string {
  if (unit === "percent") return formatPercent(base > 0 ? (value / base) * 100 : 0, 1);
  return short ? formatMoneyCompact(Math.round(value)) : formatMoney(Math.round(value), 0);
}

/** İşaretli hareket yazımı: "+₺120B", "-₺40B" (eksi ABACUS'tan gelir); yüzde birimde "+%12,5". */
export function signedText(unit: WaterfallUnit, step: Pick<WaterfallStep, "kind" | "amount">, base: number, short = true): string {
  if (step.kind === "total") return stepValueText(unit, step.amount, base, short);
  if (unit === "percent") return money.percent((base > 0 ? step.amount / base : 0) * 100 * (step.kind === "down" ? -1 : 1), 1, { sign: "always" });
  return step.kind === "up" ? `+${stepValueText(unit, step.amount, base, short)}` : (short ? formatMoneyCompact(-Math.round(step.amount)) : formatMoney(-Math.round(step.amount), 0));
}

/** Dönem boyu değişim: "+₺180.000 (+%12,3)". */
export function periodChangeText(start: number, end: number): string {
  const diff = Math.round(end - start);
  const change = math.percentChange(end, start);
  const amount = diff >= 0 ? `+${formatMoney(diff, 0)}` : formatMoney(diff, 0);
  return change === null ? amount : `${amount} (${money.percent(change, 1, { sign: "always" })})`;
}

export const retentionText = (percent: number) => formatPercent(percent, 1);
export const ratioText = (ratio: number) => money.fmtDecimalGrouped(ratio, 2);
export const countText = (count: number) => formatNumber(count, 0);

/** Ekran okuyucu: "Yeni: +₺120.000, 14 hesap". */
export function stepAnnouncement(unit: WaterfallUnit, step: WaterfallStep, base: number): string {
  return `${step.label}: ${signedText(unit, step, base, false)}${step.kind === "total" ? "" : `, ${countText(step.accountCount)} hesap`}`;
}
