// week-calendar örneği. Etkinlikler uydurmadır.
import { useState } from "react";
import { WeekCalendar } from "../../../registry/components/week-calendar/week-calendar";
import type { CalendarEvent, CalendarInfo } from "../../../registry/components/week-calendar/week-calendar";

const calendars: CalendarInfo[] = [
  { id: "work", name: "İş", tone: "accent" },
  { id: "site", name: "Saha", tone: "success" },
  { id: "pay", name: "Ödemeler", tone: "info" },
];

const first: CalendarEvent[] = [
  { id: "e1", title: "Teklif toplantısı", start: "2026-10-12T10:00", end: "2026-10-12T11:30", calendarId: "work", location: "Toplantı odası 2" },
  { id: "e2", title: "Keşif ziyareti", start: "2026-10-13T09:00", end: "2026-10-13T12:00", calendarId: "site", location: "Bursa şantiyesi" },
  { id: "e3", title: "Birim fiyat kontrolü", start: "2026-10-13T10:30", end: "2026-10-13T11:30", calendarId: "work" },
  { id: "e4", title: "Tedarikçi görüşmesi", start: "2026-10-14T14:00", end: "2026-10-14T15:00", calendarId: "work", location: "Çevrim içi" },
  { id: "e5", title: "Hakediş sunumu", start: "2026-10-15T09:30", end: "2026-10-15T10:30", calendarId: "work" },
  { id: "e6", title: "Aplikasyon kontrolü", start: "2026-10-15T13:00", end: "2026-10-15T16:00", calendarId: "site", location: "Konya" },
  { id: "e7", title: "Teminat mektubu son gün", start: "2026-10-16", calendarId: "pay", allDay: true },
  { id: "e8", title: "Aylık ödeme planı", start: "2026-10-16T11:00", end: "2026-10-16T11:30", calendarId: "pay" },
  { id: "e9", title: "Resmî tatil", start: "2026-10-16", calendarId: "pay", allDay: true },
  { id: "e10", title: "Dosya kapanışı", start: "2026-10-16", calendarId: "work", allDay: true },
];

export function WeekCalendarDemo() {
  const [events, setEvents] = useState(first);
  const [loading, setLoading] = useState(false);
  const [fail, setFail] = useState(false);
  const [width, setWidth] = useState(980);
  const [log, setLog] = useState("");
  const wait = () => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("fail")) : resolve()), 350));
  return (
    <div className="col">
      <span className="etiket">Boş zamanı sürükleyin (etkinlik ekler), bloğu sürükleyin (taşır), alt kenarı çekin (uzatır). Klavyede: etkinliğe odaklanıp Alt+ok kaydırır, Delete siler, Ctrl+Z geri alır. Genişliği küçültün.</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Kayıt başarısız olsun</label>
        <label className="row">Genişlik <input type="range" min={340} max={1100} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
        <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{log}</span>
      </div>
      <div style={{ width, maxWidth: "100%" }}>
        <WeekCalendar
          events={events} calendars={calendars} today="2026-10-15" now="2026-10-15T14:35" loading={loading}
          onRangeChange={days => setLog(`Aralık: ${days[0]} → ${days[days.length - 1]}`)}
          onCreate={async draft => { await wait(); setEvents(current => (current.some(event => event.id === draft.id) ? current : [...current, { ...draft, id: draft.id ?? `n-${current.length + 1}` }])); }}
          onUpdate={async (id, patch) => { await wait(); setEvents(current => current.map(event => (event.id === id ? { ...event, ...patch } : event))); }}
          onDelete={async id => { await wait(); setEvents(current => current.filter(event => event.id !== id)); }}
        />
      </div>
    </div>
  );
}
