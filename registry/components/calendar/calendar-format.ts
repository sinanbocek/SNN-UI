// Takvimin Türkçe yazımları ABACUS `date` motorundan gelir (giris-alanlari-standardi.md).
// Arc ay başlığını, gün adlarını ve gün etiketini tarayıcının yerel biçimleyicisiyle yazıyordu; burada sabit Türkçe adlar kullanılır.
// Hafta pazartesi başlar (Türkiye takvimi). Saf dosya: React yok, test edilir.
import { date as abacusDate } from "@snn/abacus-core";

/** Projenin verdiği tatil günü. `date` ISO gündür ("2026-10-29"); ABACUS tatil tutmaz, liste projeden gelir. */
export type CalendarHoliday = { date: string; name: string };

/** Yerel tarihi ISO gün anahtarına çevirir: 16 Ekim 2026 → "2026-10-16". */
export const isoKey = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

/** Haftadaki sıra, pazartesi 0 ve pazar 6. */
export const weekIndex = (value: Date) => (value.getDay() + 6) % 7;

/** Ay başlığı: "Ekim 2026". */
export const monthTitle = (value: Date) => `${abacusDate.monthName(value.getMonth() + 1)} ${value.getFullYear()}`;

/** Sütun başlıkları pazartesiden pazara: "Pzt", "Sal", … "Paz". 1 Ocak 2024 pazartesidir. */
export const weekdayLabels = () => Array.from({ length: 7 }, (_, index) => abacusDate.dayName(`2024-01-0${index + 1}`));

/** Ekran okuyucunun okuduğu gün: "29 Ekim 2026 Perşembe", tatilse ", tatil: Cumhuriyet Bayramı" eklenir. */
export function dayLabel(value: Date, holiday?: string) {
  const key = isoKey(value);
  const base = `${abacusDate.format(key, "long")} ${abacusDate.dayName(key, "long")}`;
  return holiday ? `${base}, tatil: ${holiday}` : base;
}

/** Tatil listesini gün anahtarına göre açar; aynı güne iki ad verilirse ikisi birlikte yazılır. Geçersiz tarih atlanır. */
export function holidayMap(holidays: readonly CalendarHoliday[] = []) {
  const map = new Map<string, string>();
  for (const holiday of holidays) {
    const key = abacusDate.parse(holiday.date);
    if (!key || !holiday.name) continue;
    const day = key.slice(0, 10);
    map.set(day, map.has(day) ? `${map.get(day)}, ${holiday.name}` : holiday.name);
  }
  return map;
}
