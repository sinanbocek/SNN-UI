// Takvim hesapları: saf mantık, ekran yok. Tarih ve saat biçimi ABACUS `date` / `period` ile yapılır.
import { date, period } from "@snn/abacus-core";

/** Sürükleme ve boyutlandırma adımı, dakika. */
export const SNAP = 15;

export type CalendarView = "week" | "workweek" | "day" | "threeDay" | "agenda";

/** Etkinlik bloğunun gün içindeki yeri ve yan yana kaçıncı sütunda durduğu. */
export interface DaySlot { column: number; columns: number }

/** İki haneye sıfır dolgusu. ABACUS'a aday: dakika sayısından "SS:DD" / ISO üretmek için tek çağrılık araç yok. */
const pad2 = (n: number) => String(n).padStart(2, "0");

/** "2026-10-15T09:30" → "2026-10-15". */
export const dayOf = (iso: string) => iso.slice(0, 10);

/** "2026-10-15T09:30" → 570 (gün içindeki dakika). Saatsiz tarihte 0. */
export const minuteOf = (iso: string) => (iso.length >= 16 ? Number(iso.slice(11, 13)) * 60 + Number(iso.slice(14, 16)) : 0);

/** Gün ve dakikadan "2026-10-15T09:30" üretir. */
export const toIso = (day: string, minute: number) => `${day}T${pad2(Math.floor(minute / 60))}:${pad2(minute % 60)}`;

/** Dakikayı "09:30" olarak yazar (ABACUS `date.format(…, "time")`). 24:00 kapanış noktası ayrıca yazılır. */
export const clockLabel = (minute: number) => (minute >= 1440 ? "24:00" : date.format(toIso("2000-01-01", minute), "time"));

export const addDays = (iso: string, days: number) => period.addDays(iso, days) ?? iso;

/** Haftanın pazartesisi (hafta başı pazartesi). */
export function mondayOf(iso: string): string {
  const weekday = date.weekday(iso) ?? 1;
  return addDays(iso, -((weekday + 6) % 7));
}

/** Görünüme göre gösterilen günler. */
export function rangeDays(view: CalendarView, anchor: string): string[] {
  const first = view === "day" || view === "threeDay" ? anchor : mondayOf(anchor);
  const count = view === "day" ? 1 : view === "threeDay" ? 3 : view === "workweek" ? 5 : 7;
  return Array.from({ length: count }, (_, index) => addDays(first, index));
}

/** Bir sonraki (+1) ya da önceki (-1) aralığın çapa günü. */
export function shiftAnchor(view: CalendarView, anchor: string, direction: 1 | -1): string {
  const step = view === "day" ? 1 : view === "threeDay" ? 3 : 7;
  return addDays(view === "workweek" || view === "week" || view === "agenda" ? mondayOf(anchor) : anchor, direction * step);
}

export const snap = (minute: number) => Math.round(minute / SNAP) * SNAP;
export const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/** Kısa durum: "12–18 Ekim 2026" ya da "28 Eki. – 3 Kasım 2026". */
export function rangeTitle(days: string[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (first === undefined || last === undefined) return "";
  if (first === last) return `${date.format(first, "long")} ${date.dayName(first, "long")}`;
  const sameMonth = first.slice(0, 7) === last.slice(0, 7);
  return sameMonth ? `${Number(first.slice(8, 10))}–${date.format(last, "long")}` : `${date.format(first, "dayMonth")} – ${date.format(last, "long")}`;
}

/** Çakışan etkinlikleri yan yana sütunlara böler; çakışmayanlar tam genişlikte kalır. */
export function packDay<T extends { id: string; start: number; end: number }>(items: T[]): Map<string, DaySlot> {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
  const result = new Map<string, DaySlot>();
  let cluster: { id: string; column: number; end: number }[] = [];
  let clusterEnd = -1;
  let columns = 0;

  const flush = () => {
    for (const entry of cluster) result.set(entry.id, { column: entry.column, columns });
    cluster = [];
    columns = 0;
  };

  for (const item of sorted) {
    if (item.start >= clusterEnd) { flush(); clusterEnd = -1; }
    const taken = new Set(cluster.filter(entry => entry.end > item.start).map(entry => entry.column));
    let column = 0;
    while (taken.has(column)) column += 1;
    cluster.push({ id: item.id, column, end: item.end });
    columns = Math.max(columns, column + 1);
    clusterEnd = Math.max(clusterEnd, item.end);
  }
  flush();
  return result;
}

/** Günün ilk boş saati (en az `from` dakikasından itibaren, süre kadar yer arar). */
export function firstFreeStart(busy: { start: number; end: number }[], from: number, until: number, duration: number): number {
  let candidate = from;
  const sorted = [...busy].sort((a, b) => a.start - b.start);
  for (const slot of sorted) {
    if (slot.end <= candidate) continue;
    if (slot.start >= candidate + duration) break;
    candidate = snap(slot.end);
  }
  return candidate + duration <= until ? candidate : from;
}
