// Kohort elde tutma tablosunun saf mantığı: ağırlıklı ortalama, göstergeler ve yazımlar. Sayılar ve tarihler ABACUS'tandır.
import { date, math } from "@snn/abacus-core";
import { formatNumber, formatPercent } from "../lib/chart-format";

export interface Cohort {
  /** Katılım ayı: "2025-11". */
  key: string;
  /** Kohort büyüklüğü (o ay katılan kişi sayısı). */
  size: number;
  /** Katılımdan sonraki her ay için kalan yüzde (0–100); ölçülmemiş ay null. İlk eleman 1. aydır. */
  retention: (number | null)[];
}

/** "2025-11" → "Kasım 2025". */
export const cohortLabel = (key: string) => date.format(key, "monthYear");

/** Hücre yazımı: tam sayı yüzde ("%68"); ipucunda bir ondalık ("%68,4"). */
export const cellText = (percent: number) => formatPercent(percent, 0);
export const tipPercent = (percent: number) => formatPercent(percent, 1);
export const sizeText = (size: number) => formatNumber(size, 0);

/** Bir aydaki kohort büyüklüğüne göre ağırlıklı ortalama; ölçülmüş kohort yoksa null. */
export function weightedAverage(cohorts: Cohort[], month: number): number | null {
  let weight = 0, sum = 0;
  for (const cohort of cohorts) {
    const value = cohort.retention[month];
    if (value === null || value === undefined) continue;
    weight += cohort.size;
    sum += value * cohort.size;
  }
  return weight > 0 ? sum / weight : null;
}

/** Göstergenin değişimi: son üç ölçülmüş kohortun ortalaması eksi ilk üç ölçülmüş kohortun ortalaması (puan). Yeterli kohort yoksa null. */
export function trendPoints(cohorts: Cohort[], month: number): number | null {
  const measured = cohorts.filter(cohort => cohort.retention[month] !== null && cohort.retention[month] !== undefined);
  if (measured.length < 4) return null;
  const first = weightedAverage(measured.slice(0, 3), month), last = weightedAverage(measured.slice(-3), month);
  return first === null || last === null ? null : math.round(last - first, 1);
}

/** Puan farkı: "+5,2 puan". */
export function pointsText(diff: number): string {
  return `${diff > 0 ? "+" : ""}${formatNumber(diff, 1)} puan`;
}

export const totalSignups = (cohorts: Cohort[]) => cohorts.reduce((sum, cohort) => sum + cohort.size, 0);

/** Hücre rengi için vurgu payı (yüzde): elde tutma yüzdesiyle orantılı, en koyu %90. */
export const tintShare = (percent: number) => Math.round(Math.min(Math.max(percent, 0), 100) * .9);

/** Okunan hücre: "Kasım 2025, 3. ay: %68,4 (214 kişi)". */
export function cellAnnouncement(cohort: Cohort, month: number): string {
  const value = cohort.retention[month];
  if (value === null || value === undefined) return `${cohortLabel(cohort.key)}, ${month + 1}. ay: henüz ölçülmedi`;
  return `${cohortLabel(cohort.key)}, ${month + 1}. ay: ${tipPercent(value)} (${sizeText(cohort.size)} kişi katıldı)`;
}
