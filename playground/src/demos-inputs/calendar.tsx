// calendar ve date-picker örnekleri. Tatil listesi örnek içindir; gerçek liste projeden gelir (ABACUS tatil tutmaz).
import { useState } from "react";
import { Calendar } from "../../../registry/components/calendar/calendar";
import { DatePicker } from "../../../registry/components/date-picker/date-picker";
import type { CalendarHoliday } from "../../../registry/components/calendar/calendar";

export const HOLIDAYS: CalendarHoliday[] = [
  { date: "2026-10-28", name: "Cumhuriyet Bayramı arifesi" },
  { date: "2026-10-29", name: "Cumhuriyet Bayramı" },
  { date: "2026-11-10", name: "Atatürk'ü Anma Günü (çalışma günü)" },
  { date: "2027-01-01", name: "Yılbaşı" },
];
const isWeekend = (value: Date) => value.getDay() === 0 || value.getDay() === 6;

export function CalendarDemo() {
  const [value, setValue] = useState<Date | undefined>(new Date(2026, 9, 16));
  return (
    <div className="col">
      <span className="etiket">Hafta pazartesi başlar. Tatil günü mavi-gri yazılır, rakamın üstünde kısa çizgi çıkar; üzerine gelince adı görünür. Ok tuşları günler, PageUp/PageDown aylar arasında gezer.</span>
      <Calendar value={value} onChange={setValue} holidays={HOLIDAYS} showToday />
    </div>
  );
}

export function DatePickerDemo() {
  const [due, setDue] = useState<Date | undefined>(new Date(2026, 9, 16));
  const [start, setStart] = useState<Date | undefined>();
  return (
    <div className="col" style={{ maxWidth: 360 }}>
      <span className="etiket">Kutuya basınca takvim açılır. Gün seçince değişen parça (gün, ay, yıl) yerinde döner.</span>
      <DatePicker label="Ödeme tarihi" value={due} onChange={setDue} holidays={HOLIDAYS} showToday description="Hafta sonları seçilemez." disabledDates={isWeekend} />
      <DatePicker label="Başlangıç" value={start} onChange={setStart} dateStyle="short" holidays={HOLIDAYS} />
    </div>
  );
}
