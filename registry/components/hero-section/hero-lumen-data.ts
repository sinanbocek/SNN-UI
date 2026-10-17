import { date } from "@snn/abacus-core";
import type { LineChartDatum } from "../line-chart/line-chart";

/** Parıltı için örnek veri: bir gelir analitiği ürünü. Yerine kendi ürününüzün sayılarını koyun. */

export type LumenRange = "30d" | "90d" | "12m";

export const lumenRanges: { value: LumenRange; label: string }[] = [
  { value: "30d", label: "30G" },
  { value: "90d", label: "90G" },
  { value: "12m", label: "12A" },
];

/** Düzgün, belirleyici bir yürüyüş: bir eğilim, yavaş bir dalga ve aynı tohum için tekrar eden küçük bir gürültü. */
function walk(count: number, start: number, end: number, wave: number, seed: number) {
  let s = seed;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647 - .5; };
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    return Math.round(start + (end - start) * (t * t * .35 + t * .65) + Math.sin(t * Math.PI * 2.3) * wave + rand() * wave * .6);
  });
}

const months = ["Eki", "Kas", "Ara", "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl"];

function series(range: LumenRange): LineChartDatum[] {
  if (range === "12m") {
    const now = walk(12, 9_800, 36_400, 2_600, 7), before = walk(12, 6_200, 21_900, 2_200, 19);
    return months.map((month, i) => ({ key: `m${i}`, label: `${month} ${i < 3 ? 2025 : 2026}`, axisLabel: i % 2 === 0 ? month : undefined, values: { mrr: now[i], last: before[i] } }));
  }
  const days = range === "30d" ? 30 : 13;
  const step = range === "30d" ? 1 : 7;
  const now = walk(days, range === "30d" ? 640 : 4_300, range === "30d" ? 1_960 : 9_800, range === "30d" ? 260 : 900, range === "30d" ? 3 : 11);
  const before = walk(days, range === "30d" ? 520 : 3_600, range === "30d" ? 1_180 : 6_100, range === "30d" ? 220 : 700, 29);
  const end = new Date(Date.UTC(2026, 8, 24));
  return now.map((value, i) => {
    const day = new Date(end.getTime() - (days - 1 - i) * step * 86_400_000);
    const iso = day.toISOString().slice(0, 10);
    const label = date.format(iso, "dayMonth");
    const every = range === "30d" ? 7 : 3;
    return { key: iso, label, axisLabel: (days - 1 - i) % every === 0 ? label : undefined, values: { mrr: value, last: before[i] } };
  });
}

export const lumenSeries: Record<LumenRange, LineChartDatum[]> = { "30d": series("30d"), "90d": series("90d"), "12m": series("12m") };

export interface LumenKpi {
  id: string;
  label: string;
  tone: "accent" | "success" | "warning" | "danger";
  byRange: Record<LumenRange, { value: string; change: string; data: number[] }>;
}

export const lumenKpis: LumenKpi[] = [
  { id: "mrr", label: "Aylık yinelenen gelir", tone: "accent", byRange: {
    "30d": { value: "₺482,9B", change: "+%8,2", data: walk(12, 446, 483, 4, 5) },
    "90d": { value: "₺482,9B", change: "+%19,9", data: walk(12, 402, 483, 6, 9) },
    "12m": { value: "₺482,9B", change: "+%51,7", data: walk(12, 318, 483, 8, 13) },
  } },
  { id: "nrr", label: "Net elde tutma", tone: "success", byRange: {
    "30d": { value: "%118", change: "+3 puan", data: walk(12, 112, 118, 1.5, 17) },
    "90d": { value: "%116", change: "+5 puan", data: walk(12, 109, 116, 1.8, 21) },
    "12m": { value: "%114", change: "+9 puan", data: walk(12, 103, 114, 2.4, 23) },
  } },
  { id: "new", label: "Yeni müşteri", tone: "success", byRange: {
    "30d": { value: "214", change: "+%12", data: walk(12, 5, 9, 2, 31) },
    "90d": { value: "602", change: "+%18", data: walk(12, 38, 56, 6, 37) },
    "12m": { value: "2.140", change: "+%34", data: walk(12, 120, 214, 16, 41) },
  } },
  { id: "churn", label: "Kaybedilen gelir", tone: "success", byRange: {
    "30d": { value: "₺6,1B", change: "−%14", data: walk(12, 9, 6, 1.2, 43) },
    "90d": { value: "₺21,4B", change: "−%9", data: walk(12, 26, 21, 2, 47) },
    "12m": { value: "₺96,8B", change: "−%22", data: walk(12, 12, 7, 1.4, 53) },
  } },
];

export interface LumenMover {
  name: string;
  change: string;
  amount: number;
}

/** Örnek müşteriler: şirket adları uydurmadır. Her birinin başında adının baş harfi çizilir. */
export const lumenMovers: LumenMover[] = [
  { name: "Kuzey Lojistik", change: "Kurumsal plana geçti", amount: 4_200 },
  { name: "Marmara Gıda", change: "120 koltuk ekledi", amount: 2_850 },
  { name: "Anadolu Yapı", change: "Yıllık ön ödeme", amount: 1_900 },
  { name: "Ege Tekstil", change: "40 koltuk kaldırdı", amount: -1_240 },
  { name: "Toros Enerji", change: "Tahmin modülünü ekledi", amount: 980 },
  { name: "Karadeniz Tarım", change: "Büyüme planına yükseldi", amount: 760 },
];

export const lumenInsight: Record<LumenRange, { lead: string; rest: string }> = {
  "30d": { lead: "Aylık gelir bu ay ₺36,4B büyüdü.", rest: "%62'si Büyüme planındaki 14 genişlemeden geldi; başta Kuzey Lojistik." },
  "90d": { lead: "Aylık gelir bu çeyrekte ₺80,6B büyüdü.", rest: "Genişleme, Mart'tan beri ilk kez yeni müşteriyi geçti." },
  "12m": { lead: "Aylık gelir on iki ayda ₺164,5B büyüdü.", rest: "%110'un üstündeki net elde tutma, yeni müşterilerden fazlasını yaptı." },
};
