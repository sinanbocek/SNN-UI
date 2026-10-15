// availability-picker örneği. Katılımcılar ve saatler uydurmadır.
import { useState } from "react";
import { AvailabilityPicker } from "../../../registry/components/availability-picker/availability-picker";
import type { AvailabilityDay, AvailabilityParticipant } from "../../../registry/components/availability-picker/availability-picker";

const people: AvailabilityParticipant[] = [
  { id: "a", name: "Nilay Karaca" },
  { id: "b", name: "Barış Tunç" },
  { id: "c", name: "Ece Yalın" },
];

const hours = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:30", "14:00", "15:30"];
const slots = (day: string, busyMap: Record<string, string[]>) => hours.map(hour => ({ start: `${day}T${hour}`, busy: busyMap[hour] ?? [] }));

const days: AvailabilityDay[] = [
  { date: "2026-10-19", slots: slots("2026-10-19", { "09:00": ["b"], "09:30": ["b", "c"], "10:00": [], "11:00": ["a"], "13:30": ["c"] }) },
  { date: "2026-10-20", slots: slots("2026-10-20", Object.fromEntries(hours.map(hour => [hour, ["a", "b"]]))) },
  { date: "2026-10-21", slots: slots("2026-10-21", { "09:00": ["c"], "10:30": ["b"], "14:00": ["a"], "15:30": ["a", "c"] }) },
  { date: "2026-10-22", slots: slots("2026-10-22", { "09:00": ["a"], "09:30": ["a"], "10:00": ["a"], "11:00": ["b"], "13:30": ["b"] }) },
  { date: "2026-10-23", slots: slots("2026-10-23", { "10:00": ["c"], "10:30": ["c"], "11:00": ["c"] }) },
];

export function AvailabilityPickerDemo() {
  const [loading, setLoading] = useState(false);
  const [fail, setFail] = useState(false);
  const [none, setNone] = useState(false);
  const [width, setWidth] = useState(680);
  const [log, setLog] = useState("");
  const busyAll = days.map(day => ({ ...day, slots: day.slots.map(slot => ({ ...slot, busy: ["a"] })) }));
  return (
    <div className="col">
      <span className="etiket">Gün kartına, sonra saate basın; ok tuşları grup içinde gezer. Salı günü kimse müsait değil (en yakın uygun gün önerilir).</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={none} onChange={event => setNone(event.target.checked)} /> Hiç ortak saat yok</label>
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Onay başarısız olsun</label>
        <label className="row">Genişlik <input type="range" min={340} max={900} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
        <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{log}</span>
      </div>
      <div style={{ width, maxWidth: "100%" }}>
        <AvailabilityPicker
          title="Keşif toplantısı" durationMinutes={30} timezoneLabel="İstanbul saati" participants={people} days={none ? busyAll : days} loading={loading}
          onChangeParticipants={() => setNone(false)}
          onConfirm={choice => new Promise<void>((resolve, reject) => setTimeout(() => { if (fail) reject(new Error("fail")); else { setLog(`${choice.start} → ${choice.end}`); resolve(); } }, 700))}
        />
      </div>
    </div>
  );
}
