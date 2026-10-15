// Ödeme akışı çiziminin saf mantığı: döngü karesi, yol üstünde konum, yerleşim ve yazımlar. Para TRY'dir; sayılar ABACUS'tandır.
// Bu bir anlatım çizimidir: tutar, komisyon ve bakiye uygulamadan gelir ve gerçek fiyatlandırmayla eşleştirilmelidir.
import { math, money } from "@snn/abacus-core";
import { exactText, toMinor } from "../lib/shop-format";

export interface Point { x: number; y: number }

/** Çizgi parçalarından oluşan yolda `u` (0–1) oranındaki konum; uzunluğa göre ilerler. */
export function pointOnPath(points: Point[], u: number): Point {
  if (points.length === 1) return points[0]!;
  const lengths = points.slice(1).map((point, at) => Math.hypot(point.x - points[at]!.x, point.y - points[at]!.y));
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
  let remaining = Math.min(Math.max(u, 0), 1) * total;
  for (let at = 0; at < lengths.length; at++) {
    if (remaining <= lengths[at]! || at === lengths.length - 1) {
      const ratio = lengths[at]! ? Math.min(remaining / lengths[at]!, 1) : 0;
      const a = points[at]!, b = points[at + 1]!;
      return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio };
    }
    remaining -= lengths[at]!;
  }
  return points[points.length - 1]!;
}

export const easeInOut = (t: number): number => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export type StatusKey = "touch" | "risk" | "routed" | "approved" | "cleared" | "commission" | "paid";
export type Leg = "none" | "main" | "back" | "settle1" | "settle2";
export type ChipMode = "amount" | "approved" | "gross" | "net";

export interface Frame {
  leg: Leg;
  /** Yol üstünde ilerleme (0–1), yalnız hareket ederken. */
  u: number;
  chip: ChipMode | null;
  /** Durak sırasına göre durum: 0 ödeme noktası, 1 işlemci, 2 kart ağı, 3 banka, 4 bakiye. */
  statuses: (StatusKey | null)[];
  /** Yetkilendirme süresinin doluluğu (0–1). */
  authFill: number;
  /** Takas aşamasının doluluğu (0–1). */
  clearingFill: number;
  /** Net tutarın bakiyeye geçiş payı (0–1); döngü sonunda 1. */
  payFill: number;
  /** Chip bir durakta bekliyorsa durağın sırası (4: bakiye). */
  at: number | null;
}

const span = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));

/** Döngüde `p` (0–1) anındaki kare. Döngü tek bir zaman fonksiyonudur; her çizimde yeniden hesaplanır. */
export function cycleFrame(p: number): Frame {
  const q = ((p % 1) + 1) % 1;
  const statuses: (StatusKey | null)[] = [null, null, null, null, null];
  if (q < .06) statuses[0] = "touch";
  if (q >= .18 && q < .26) statuses[1] = "risk";
  if (q >= .36 && q < .42) statuses[2] = "routed";
  if (q >= .52 && q < .58) statuses[3] = "approved";
  if (q >= .72 && q < .78) statuses[0] = "approved";
  if (q >= .78 && q < .86) statuses[2] = "cleared";
  if (q >= .86 && q < .9) statuses[1] = "commission";
  if (q >= .94) statuses[4] = "paid";
  const base = { statuses, authFill: span(q, .06, .58), clearingFill: span(q, .78, .96), payFill: span(q, .94, 1) };
  let move: Pick<Frame, "leg" | "u" | "chip" | "at">;
  if (q < .06) move = { leg: "none", u: 0, chip: "amount", at: 0 };
  else if (q < .18) move = { leg: "main", u: easeInOut(span(q, .06, .18)) / 3, chip: "amount", at: null };
  else if (q < .26) move = { leg: "none", u: 1 / 3, chip: "amount", at: 1 };
  else if (q < .36) move = { leg: "main", u: 1 / 3 + easeInOut(span(q, .26, .36)) / 3, chip: "amount", at: null };
  else if (q < .42) move = { leg: "none", u: 2 / 3, chip: "amount", at: 2 };
  else if (q < .52) move = { leg: "main", u: 2 / 3 + easeInOut(span(q, .42, .52)) / 3, chip: "amount", at: null };
  else if (q < .58) move = { leg: "none", u: 1, chip: "amount", at: 3 };
  else if (q < .72) move = { leg: "back", u: easeInOut(span(q, .58, .72)), chip: "approved", at: null };
  else if (q < .78) move = { leg: "none", u: 1, chip: "approved", at: 0 };
  else if (q < .86) move = { leg: "settle1", u: easeInOut(span(q, .78, .86)), chip: "gross", at: null };
  else if (q < .9) move = { leg: "none", u: 1, chip: "net", at: 1 };
  else if (q < .96) move = { leg: "settle2", u: easeInOut(span(q, .9, .96)), chip: "net", at: null };
  else move = { leg: "none", u: 1, chip: null, at: 4 };
  return { ...base, ...move };
}

/** "Hareketi azalt" için durağan kare: komisyon düşüldükten hemen sonrası (net tutar bakiyeye gidiyor). */
export const STATIC_FRAME: Frame = { ...cycleFrame(.915), payFill: 0 };

export interface Layout {
  width: number;
  height: number;
  /** Dört durak, sırasıyla ödeme noktası, işlemci, kart ağı, banka. */
  stops: Point[];
  balance: Point;
  commission: Point;
  /** Takas yolu: kart ağından komisyon noktası (üçüncü nokta) üzerinden bakiyeye. */
  settle: Point[];
  vertical: boolean;
}

/** Geniş kapta yatay, dar kapta (700 px altı) dikey yerleşim. */
export function layoutFor(width: number): Layout {
  if (width > 0 && width < 700) {
    const stops = [{ x: 56, y: 44 }, { x: 56, y: 154 }, { x: 56, y: 264 }, { x: 56, y: 374 }];
    const commission = { x: 150, y: 319 }, balance = { x: 254, y: 319 };
    return { width: 320, height: 470, stops, balance, commission, vertical: true, settle: [stops[2]!, { x: 56, y: 319 }, commission, balance] };
  }
  const stops = [{ x: 70, y: 70 }, { x: 235, y: 70 }, { x: 400, y: 70 }, { x: 565, y: 70 }];
  const commission = { x: 235, y: 196 }, balance = { x: 70, y: 196 };
  return { width: 640, height: 296, stops, balance, commission, vertical: false, settle: [stops[2]!, { x: 400, y: 196 }, commission, balance] };
}

/** Ana hat: dört durak art arda; geri dönen onay aynı hattı tersine izler. */
export const mainPath = (layout: Layout): Point[] => layout.stops;
export const backPath = (layout: Layout): Point[] => [...layout.stops].reverse();

export function positionOf(frame: Frame, layout: Layout): Point {
  if (frame.leg === "main") return pointOnPath(mainPath(layout), frame.u);
  if (frame.leg === "back") return pointOnPath(backPath(layout), frame.u);
  if (frame.leg === "settle1") return pointOnPath(layout.settle.slice(0, 3), frame.u);
  if (frame.leg === "settle2") return pointOnPath(layout.settle.slice(2), frame.u);
  if (frame.at === 4) return layout.balance;
  if (frame.at === 1 && frame.chip === "net") return layout.commission;
  if (frame.at !== null && frame.at <= 3) return layout.stops[frame.at]!;
  return layout.stops[0]!;
}

export interface Economics { /** Ödeme tutarı (ana birimde TRY). */ amount: number; /** İşlemci komisyonu. */ commission: number }
export const netOf = (economics: Economics): number => math.sub(economics.amount, economics.commission);

export function statusText(key: StatusKey, economics: Economics): string {
  switch (key) {
    case "touch": return "Kart okutuldu";
    case "risk": return "Risk denetleniyor";
    case "routed": return "Bankaya yönlendirildi";
    case "approved": return "Onaylandı";
    case "cleared": return "Takas oldu";
    case "commission": return `Komisyon ${exactText(toMinor(economics.commission))}`;
    case "paid": return "Ödendi";
  }
}

export const chipText = (mode: ChipMode, economics: Economics): string =>
  mode === "approved" ? "✓ Onaylandı" : mode === "net" ? exactText(toMinor(netOf(economics))) : exactText(toMinor(economics.amount));

/** Yetkilendirme süresi saniye, iki ondalık: 1.84 → "1,84 sn". */
export const secondsText = (seconds: number): string => `${money.fmtDecimalGrouped(math.round(seconds, 2), 2)} sn`;
export const balanceAfter = (initial: number, cycles: number, economics: Economics): number => math.add(initial, math.mul(cycles, netOf(economics)));
export const balanceText = (value: number): string => exactText(toMinor(value));

export interface StopInfo { name: string; rest: string; detail: string }
export const DEFAULT_STOPS: StopInfo[] = [
  { name: "Ödeme noktası", rest: "Müşteri kartını okutur", detail: "Ödeme noktası tutarı ve kart bilgisini işlemciye iletir." },
  { name: "İşlemci", rest: "Ödemeyi alır, riski denetler", detail: "İşlemci ödemeyi alır, riski denetler ve kart ağına yönlendirir." },
  { name: "Kart ağı", rest: "Bankayı bulur, takas eder", detail: "Kart ağı ödemeyi doğru bankaya iletir; gün sonunda takası yapar." },
  { name: "Banka", rest: "Limit ve kartı doğrular", detail: "Karta veren banka limiti ve kartı doğrular, onay verir." },
  { name: "Bakiyeniz", rest: "Net tutar buraya gelir", detail: "Komisyon düşüldükten sonra net tutar bakiyenize yatar." },
];

/** Şemanın tek cümlelik sesli anlatımı: tutar, her durak, onay, komisyon ve ödeme. */
export function describeFlow(economics: Economics, stops: StopInfo[], settlement: string): string {
  const names = stops.slice(0, 4).map(stop => stop.name).join(", ");
  return `${exactText(toMinor(economics.amount))} tutarındaki ödeme sırasıyla ${names} duraklarından geçer; banka onaylar, onay ödeme noktasına döner. Takasta ${exactText(toMinor(economics.commission))} komisyon düşülür ve ${exactText(toMinor(netOf(economics)))} net tutar ${settlement} bakiyenize ödenir.`;
}

/** Takas yolunda komisyon noktasının yoldaki payı (0–1); vurgu çizgisi iki parçada dolar. */
export function settleSplit(layout: Layout): number {
  const lengths = layout.settle.slice(1).map((point, at) => Math.hypot(point.x - layout.settle[at]!.x, point.y - layout.settle[at]!.y));
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
  return (lengths[0]! + lengths[1]!) / total;
}

/** Vurgu çizgilerinin doluluğu: ana hat, geri dönen onay (başarı rengi) ve takas hattı. */
export function lineFills(frame: Frame, p: number, split: number): { main: number; back: number; settle: number } {
  const q = ((p % 1) + 1) % 1;
  const main = q < .06 || q >= .96 ? 0 : q >= .52 ? 1 : frame.leg === "main" ? frame.u : frame.at === 1 ? 1 / 3 : frame.at === 2 ? 2 / 3 : frame.at === 3 ? 1 : 0;
  const back = frame.leg === "back" ? frame.u : q >= .72 && q < .96 ? 1 : 0;
  const settle = frame.leg === "settle1" ? frame.u * split : frame.leg === "settle2" ? split + frame.u * (1 - split) : q >= .86 && q < .9 ? split : q >= .9 && q < .96 ? 1 : 0;
  return { main, back, settle };
}
