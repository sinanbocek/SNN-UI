"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { date } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { usePointerDrag } from "../lib/pointer-drag";
import type { PointerDragState } from "../lib/pointer-drag";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { Dialog, DialogContent } from "../dialog/dialog";
import { Input } from "../input/input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import SegmentedControl from "../segmented-control/segmented-control";
import { Select } from "../select/select";
import { Skeleton } from "../skeleton/skeleton";
import { SNAP, addDays, clamp, clockLabel, dayOf, firstFreeStart, minuteOf, packDay, rangeDays, rangeTitle, shiftAnchor, snap, toIso } from "./calendar-math";
import type { CalendarView } from "./calendar-math";
import styles from "./week-calendar.module.css";

export type { CalendarView } from "./calendar-math";

export type CalendarTone = "accent" | "success" | "info" | "muted";

export interface CalendarInfo { id: string; name: string; tone: CalendarTone }

export interface CalendarEvent {
  id: string;
  title: string;
  /** "2026-10-15T09:30" (saatli) ya da tüm gün etkinliğinde "2026-10-15". Uygulamanın saat diliminde. */
  start: string;
  /** Bitiş, aynı biçimde. Tüm gün etkinliğinde gerekmez. */
  end?: string | undefined;
  calendarId: string;
  location?: string | undefined;
  allDay?: boolean | undefined;
}

export interface EventDraft { title: string; start: string; end?: string | undefined; calendarId: string; location?: string | undefined; allDay?: boolean | undefined }
export interface EventPatch { start?: string; end?: string | undefined; title?: string; calendarId?: string; location?: string | undefined }

export interface WeekCalendarProps {
  events: CalendarEvent[];
  calendars: CalendarInfo[];
  /** Bugünün tarihi, "2026-10-15". Gün başlığında vurgulanır. */
  today: string;
  /** "Şimdi" çizgisi için an, "2026-10-15T14:35". Verilmezse çizgi çıkmaz. */
  now?: string | undefined;
  /** Izgaranın ilk ve son saati (0–24). Varsayılan 7 ve 21. */
  startHour?: number | undefined;
  endHour?: number | undefined;
  defaultView?: CalendarView | undefined;
  onViewChange?: ((view: CalendarView) => void) | undefined;
  /** Görünen aralık değişti; proje yalnız bu günlerin etkinliklerini yükler. */
  onRangeChange?: ((days: string[]) => void) | undefined;
  /** Yeni etkinlik. Silmeyi geri alırken aynı kimlikle çağrılır (`id` dolu gelir). Reddedilirse etkinlik geri alınır ve "Yeniden dene" çıkar. */
  onCreate: (draft: EventDraft & { id?: string | undefined }) => void | Promise<void>;
  /** Taşıma, boyutlandırma ya da ayrıntı kutusundan değişiklik. */
  onUpdate: (id: string, patch: EventPatch) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  loading?: boolean | undefined;
  className?: string | undefined;
}

type Mode = "create" | "move" | "resize";
type DragItem = { mode: "create"; day: string; anchor: number } | { mode: "move"; id: string; grab: number } | { mode: "resize"; id: string };
type Preview = { mode: Mode; id?: string | undefined; day: string; start: number; end: number };
type Dialogue = { mode: "create" | "edit"; id?: string | undefined; title: string; day: string; start: number; end: number; calendarId: string; location: string; allDay: boolean; error: string };
type Notice = { text: string; tone?: "error" | undefined; undo?: (() => void) | undefined; retry?: (() => void) | undefined };

const viewLabels: Record<CalendarView, string> = { week: "Hafta", workweek: "İş haftası", day: "Gün", threeDay: "3 gün", agenda: "Gündem" };
const toneVar: Record<CalendarTone, string> = { accent: "var(--accent)", success: "var(--success)", info: "var(--warning)", muted: "var(--text-muted)" };

/** Haftalık zaman ızgarası: boş zamanı sürükleyerek etkinlik oluşturma, taşıma, uzatma; gün, hafta, iş haftası, 3 gün ve gündem görünümleri. */
export function WeekCalendar({
  events, calendars, today, now, startHour = 7, endHour = 21, defaultView = "week", onViewChange, onRangeChange, onCreate, onUpdate, onDelete, loading = false, className,
}: WeekCalendarProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);
  const focusRequest = useRef<{ day?: string | undefined; event?: string | undefined } | null>(null);
  const tempId = useRef(0);
  const [items, setItems] = useState(events);
  const [view, setView] = useState<CalendarView>(defaultView);
  const [anchor, setAnchor] = useState(today);
  const [direction, setDirection] = useState(1);
  const [hidden, setHidden] = useState<string[]>([]);
  const [activeDay, setActiveDay] = useState(today);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [note, setNote] = useState("");
  const [compact, setCompact] = useState(false);
  const [allDayOpen, setAllDayOpen] = useState(false);

  useEffect(() => { setItems(events); }, [events]);

  const startMin = clamp(startHour, 0, 23) * 60;
  const endMin = clamp(endHour, startHour + 1, 24) * 60;
  const total = endMin - startMin;
  const days = useMemo(() => rangeDays(view, anchor), [view, anchor]);
  const calendarOf = (id: string) => calendars.find(calendar => calendar.id === id);
  const shown = useMemo(() => items.filter(event => !hidden.includes(event.calendarId)), [items, hidden]);
  const hours = Array.from({ length: Math.ceil(total / 60) }, (_, index) => startMin + index * 60);

  const timedFor = (day: string) => shown
    .filter(event => !event.allDay && dayOf(event.start) === day)
    .map(event => ({ event, start: clamp(minuteOf(event.start), startMin, endMin), end: clamp(event.end && dayOf(event.end) === day ? minuteOf(event.end) : minuteOf(event.start) + 60, startMin, endMin) }))
    .filter(entry => entry.end > entry.start);
  const allDayFor = (day: string) => shown.filter(event => event.allDay && dayOf(event.start) === day);

  useEffect(() => { onRangeChange?.(days); }, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bileşen darsa (telefon) hafta görünümü yerine 3 gün gösterilir.
  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setCompact(element.clientWidth < 640));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { if (compact && (view === "week" || view === "workweek")) changeView("threeDay"); }, [compact]); // eslint-disable-line react-hooks/exhaustive-deps

  // Odak isteği: aralık değişince ya da etkinlik yeniden çizilince odak ilgili öğeye gider.
  useEffect(() => {
    const request = focusRequest.current;
    if (!request) return;
    const root = rootRef.current;
    const target = request.event ? root?.querySelector<HTMLElement>(`[data-event="${request.event}"]`) : root?.querySelector<HTMLElement>(`[data-daycell="${request.day}"]`);
    if (target) { focusRequest.current = null; target.focus({ preventScroll: true }); }
  });

  function changeView(next: CalendarView) {
    setView(next);
    onViewChange?.(next);
    setNote(`${viewLabels[next]} görünümü`);
  }

  function go(directionStep: 1 | -1, toDay?: string) {
    setDirection(directionStep);
    const next = shiftAnchor(view, anchor, directionStep);
    setAnchor(next);
    const nextDays = rangeDays(view, next);
    const landing = toDay ?? (directionStep === 1 ? nextDays[0] : nextDays[nextDays.length - 1]) ?? next;
    setActiveDay(landing);
    focusRequest.current = { day: landing };
    setNote(`${rangeTitle(nextDays)}`);
  }

  function goToday() {
    setDirection(today >= (days[0] ?? today) ? 1 : -1);
    setAnchor(today);
    setActiveDay(today);
    setNote("Bugün");
  }

  // ---- Hareket: iyimser güncelleme, reddedilirse geri alma ----

  async function applyUpdate(id: string, patch: EventPatch, announce: string, undoable = true) {
    const before = items.find(event => event.id === id);
    if (!before) return;
    setItems(current => current.map(event => (event.id === id ? { ...event, ...patch } : event)));
    setNote(announce);
    const revert: EventPatch = { start: before.start, end: before.end, title: before.title, calendarId: before.calendarId, location: before.location };
    const undo = () => void applyUpdate(id, revert, "Geri alındı.", false);
    setNotice(undoable ? { text: announce, undo } : null);
    try { await onUpdate(id, patch); }
    catch {
      setItems(current => current.map(event => (event.id === id ? before : event)));
      setNotice({ text: "Etkinlik kaydedilemedi.", tone: "error", retry: () => void applyUpdate(id, patch, announce) });
      setNote("Etkinlik kaydedilemedi.");
    }
  }

  async function create(draft: EventDraft & { id?: string | undefined }, announce = "Etkinlik oluşturuldu.") {
    const id = draft.id ?? `tmp-${(tempId.current += 1)}`;
    setItems(current => [...current, { ...draft, id }]);
    setNote(announce);
    try { await onCreate(draft.id ? draft : { ...draft }); setNotice(null); }
    catch {
      setItems(current => current.filter(event => event.id !== id));
      setNotice({ text: "Etkinlik kaydedilemedi.", tone: "error", retry: () => void create(draft, announce) });
      setNote("Etkinlik kaydedilemedi.");
    }
  }

  async function remove(event: CalendarEvent) {
    setItems(current => current.filter(item => item.id !== event.id));
    setNote("Etkinlik silindi.");
    setNotice({ text: "Etkinlik silindi.", undo: () => void create({ ...event }, "Etkinlik geri getirildi.") });
    try { await onDelete(event.id); }
    catch {
      setItems(current => [...current, event]);
      setNotice({ text: "Etkinlik silinemedi.", tone: "error", retry: () => void remove(event) });
    }
  }

  // ---- Sürükleme: oluşturma, taşıma, boyutlandırma ----

  function cellAt(x: number, y: number) {
    const box = colsRef.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return null;
    const index = clamp(Math.floor(((x - box.left) / box.width) * days.length), 0, days.length - 1);
    const minute = startMin + ((y - box.top) / box.height) * total;
    const day = days[index];
    return day === undefined ? null : { day, minute };
  }

  function update(state: PointerDragState<DragItem>) {
    const cell = cellAt(state.x, state.y);
    if (!cell) return;
    const item = state.item;
    if (item.mode === "create") {
      const current = clamp(snap(cell.minute), startMin, endMin);
      const low = Math.min(item.anchor, current);
      const high = Math.max(item.anchor, current);
      setPreview({ mode: "create", day: item.day, start: low, end: high === low ? Math.min(low + SNAP, endMin) : high });
    } else {
      const event = items.find(entry => entry.id === item.id);
      if (!event) return;
      const duration = Math.max((event.end ? minuteOf(event.end) : minuteOf(event.start) + 60) - minuteOf(event.start), SNAP);
      if (item.mode === "move") {
        const start = clamp(snap(cell.minute - item.grab), startMin, endMin - duration);
        setPreview({ mode: "move", id: item.id, day: cell.day, start, end: start + duration });
      } else {
        const from = minuteOf(event.start);
        setPreview({ mode: "resize", id: item.id, day: dayOf(event.start), start: from, end: clamp(snap(cell.minute), from + SNAP, endMin) });
      }
    }
  }

  const previewRef = useRef<Preview | null>(null);
  previewRef.current = preview;
  const { bind } = usePointerDrag<DragItem>({
    scrollContainers: () => [scrollRef.current],
    onStart: update,
    onMove: update,
    onEnd: (state, cancelled) => {
      const last = previewRef.current;
      setPreview(null);
      if (cancelled || !last) { if (state.item.mode !== "create") setNote("Taşıma iptal edildi."); return; }
      if (last.mode === "create") {
        setDialogue({ mode: "create", title: "", day: last.day, start: last.start, end: last.end, calendarId: calendars.find(calendar => !hidden.includes(calendar.id))?.id ?? calendars[0]?.id ?? "", location: "", allDay: false, error: "" });
        return;
      }
      const event = items.find(entry => entry.id === last.id);
      if (!event) return;
      const patch: EventPatch = { start: toIso(last.day, last.start), end: toIso(last.day, last.end) };
      if (patch.start === event.start && patch.end === event.end) return;
      void applyUpdate(event.id, patch, last.mode === "move" ? `${event.title} ${clockLabel(last.start)} saatine taşındı` : `${event.title} ${clockLabel(last.end)} saatinde bitiyor`);
    },
  });
  function openCreate(day: string, start?: number) {
    const busy = timedFor(day).map(entry => ({ start: entry.start, end: entry.end }));
    const from = start ?? firstFreeStart(busy, clamp(9 * 60, startMin, endMin - 60), endMin, 60);
    setDialogue({ mode: "create", title: "", day, start: from, end: Math.min(from + 60, endMin), calendarId: calendars.find(calendar => !hidden.includes(calendar.id))?.id ?? calendars[0]?.id ?? "", location: "", allDay: false, error: "" });
  }

  function openEdit(event: CalendarEvent) {
    const day = dayOf(event.start);
    const start = event.allDay ? startMin : minuteOf(event.start);
    setDialogue({ mode: "edit", id: event.id, title: event.title, day, start, end: event.allDay ? start + 60 : event.end ? minuteOf(event.end) : start + 60, calendarId: event.calendarId, location: event.location ?? "", allDay: event.allDay === true, error: "" });
  }

  function saveDialogue(event: FormEvent) {
    event.preventDefault();
    if (!dialogue) return;
    if (dialogue.title.trim() === "") { setDialogue({ ...dialogue, error: "Başlık yazın." }); return; }
    if (!dialogue.allDay && dialogue.end <= dialogue.start) { setDialogue({ ...dialogue, error: "Bitiş başlangıçtan sonra olmalı." }); return; }
    const data = {
      title: dialogue.title.trim(), calendarId: dialogue.calendarId, location: dialogue.location.trim() || undefined,
      start: dialogue.allDay ? dialogue.day : toIso(dialogue.day, dialogue.start), end: dialogue.allDay ? undefined : toIso(dialogue.day, dialogue.end), allDay: dialogue.allDay || undefined,
    };
    const current = dialogue;
    setDialogue(null);
    if (current.mode === "create") void create(data);
    else if (current.id) void applyUpdate(current.id, { title: data.title, calendarId: data.calendarId, location: data.location, start: data.start, end: data.end }, `${data.title} güncellendi`);
  }

  // ---- Klavye ----

  function onRootKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (dialogue) return;
    const target = event.target as HTMLElement;
    if (target.matches("input, textarea, select, [role='combobox']")) return;
    if ((event.ctrlKey || event.metaKey) && event.code === "KeyZ" && notice?.undo) { event.preventDefault(); notice.undo(); setNotice(null); return; }
    if (event.ctrlKey || event.metaKey) return;
    const key = event.key.length === 1 ? event.code : event.key;
    const cell = target.closest<HTMLElement>("[data-daycell]");
    const eventNode = target.closest<HTMLElement>("[data-event]");

    // Alt+ok: odaktaki etkinliği kaydırır; Alt+Shift+yukarı/aşağı süreyi değiştirir.
    if (event.altKey && eventNode) {
      const item = items.find(entry => entry.id === eventNode.dataset.event);
      if (!item || item.allDay) return;
      const from = minuteOf(item.start);
      const to = item.end ? minuteOf(item.end) : from + 60;
      let day = dayOf(item.start);
      let nextStart = from;
      let nextEnd = to;
      if (key === "ArrowLeft") day = addDays(day, -1);
      else if (key === "ArrowRight") day = addDays(day, 1);
      else if (key === "ArrowUp" && event.shiftKey) nextEnd = Math.max(to - SNAP, from + SNAP);
      else if (key === "ArrowDown" && event.shiftKey) nextEnd = Math.min(to + SNAP, endMin);
      else if (key === "ArrowUp") { nextStart = Math.max(from - SNAP, startMin); nextEnd = to - (from - nextStart); }
      else if (key === "ArrowDown") { nextEnd = Math.min(to + SNAP, endMin); nextStart = from + (nextEnd - to); }
      else return;
      event.preventDefault();
      focusRequest.current = { event: item.id };
      void applyUpdate(item.id, { start: toIso(day, nextStart), end: toIso(day, nextEnd) }, `${item.title} ${date.format(day, "dayMonthWeekday")} ${clockLabel(nextStart)} saatine taşındı`);
      return;
    }
    if (event.altKey) return;

    if (key === "KeyT") { event.preventDefault(); goToday(); return; }
    if (key === "KeyD") { event.preventDefault(); changeView("day"); return; }
    if (key === "KeyW") { event.preventDefault(); changeView(compact ? "threeDay" : "week"); return; }
    if (key === "KeyN" && !eventNode) { event.preventDefault(); openCreate(cell?.dataset.daycell ?? activeDay); return; }
    if ((key === "Delete" || key === "Backspace") && eventNode) {
      const item = items.find(entry => entry.id === eventNode.dataset.event);
      if (item) { event.preventDefault(); void remove(item); }
      return;
    }

    if (cell && !eventNode) {
      const index = days.indexOf(cell.dataset.daycell ?? "");
      if (key === "ArrowRight") { event.preventDefault(); const next = days[index + 1]; if (next !== undefined) { setActiveDay(next); focusRequest.current = { day: next }; setNote(dayNote(next)); } else go(1); }
      else if (key === "ArrowLeft") { event.preventDefault(); const previous = index > 0 ? days[index - 1] : undefined; if (previous !== undefined) { setActiveDay(previous); focusRequest.current = { day: previous }; setNote(dayNote(previous)); } else go(-1); }
      else if (key === "ArrowDown") { const first = cell.querySelector<HTMLElement>("[data-event]"); if (first) { event.preventDefault(); first.focus(); } }
      else if (key === "Enter" && target === cell) { event.preventDefault(); openCreate(cell.dataset.daycell ?? activeDay); }
    } else if (eventNode) {
      const siblings = [...(eventNode.closest("[data-daycell]")?.querySelectorAll<HTMLElement>("[data-event]") ?? [])].sort((a, b) => minuteOf(items.find(entry => entry.id === a.dataset.event)?.start ?? "") - minuteOf(items.find(entry => entry.id === b.dataset.event)?.start ?? ""));
      const at = siblings.indexOf(eventNode);
      if (key === "ArrowDown" && siblings[at + 1]) { event.preventDefault(); siblings[at + 1]?.focus(); }
      else if (key === "ArrowUp") { event.preventDefault(); (siblings[at - 1] ?? eventNode.closest<HTMLElement>("[data-daycell]"))?.focus(); }
      else if (key === "ArrowLeft" || key === "ArrowRight") {
        event.preventDefault();
        const day = eventNode.closest<HTMLElement>("[data-daycell]")?.dataset.daycell ?? activeDay;
        const index = days.indexOf(day);
        const next = days[index + (key === "ArrowRight" ? 1 : -1)];
        if (next) { setActiveDay(next); focusRequest.current = { day: next }; } else go(key === "ArrowRight" ? 1 : -1);
      }
    }
  }

  function dayNote(day: string) {
    const count = timedFor(day).length + allDayFor(day).length;
    return `${date.format(day, "dayMonthWeekday")} günü, ${count} etkinlik`;
  }

  // ---- Çizim ----

  const nowDay = now ? dayOf(now) : undefined;
  const nowMinute = now ? minuteOf(now) : undefined;
  const slide = reduced ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: motionTokens.duration.instant } } : {
    initial: { opacity: 0, x: direction * 28 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: direction * -28 },
    transition: { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } },
  };
  const options = (compact ? ["threeDay", "day", "agenda"] : ["week", "workweek", "threeDay", "day", "agenda"]) as CalendarView[];
  const visibleCount = shown.filter(event => days.includes(dayOf(event.start))).length;
  const timeOptions = Array.from({ length: Math.floor(total / SNAP) + 1 }, (_, index) => startMin + index * SNAP).map(minute => ({ value: String(minute), label: clockLabel(minute) }));
  const dayOptions = [...new Set([...days, ...(dialogue ? [dialogue.day] : [])])].map(day => ({ value: day, label: date.format(day, "dayMonthWeekday") }));

  const renderEvent = (entry: { event: CalendarEvent; start: number; end: number }, slot: { column: number; columns: number } | undefined) => {
    const { event, start, end } = entry;
    const calendar = calendarOf(event.calendarId);
    const dragging = preview?.id === event.id && preview.mode !== "create";
    const duration = end - start;
    const column = slot?.column ?? 0;
    const columns = slot?.columns ?? 1;
    return (
      <div
        key={event.id} className={styles.event} data-tone={calendar?.tone ?? "muted"} data-dragging={dragging ? "true" : undefined} data-compact={duration <= 30 ? "true" : undefined}
        style={{ top: `calc(var(--hour-size) * ${(start - startMin) / 60})`, height: `calc(var(--hour-size) * ${duration / 60})`, left: `${(column / columns) * 100}%`, width: `${100 / columns}%` }}
        {...bind({ mode: "move", id: event.id, grab: 0 })}
        onPointerDown={(pointer: ReactPointerEvent<HTMLElement>) => {
          const box = pointer.currentTarget.getBoundingClientRect();
          const grab = ((pointer.clientY - box.top) / box.height) * duration;
          bind({ mode: "move", id: event.id, grab: Number.isFinite(grab) ? grab : 0 }).onPointerDown(pointer);
        }}
      >
        <button
          type="button" className={styles.eventButton} data-event={event.id} onClick={() => openEdit(event)}
          aria-label={`${event.title}, ${date.format(dayOf(event.start), "long")}, ${clockLabel(start)}–${clockLabel(end)}, ${calendar?.name ?? ""}${event.location ? `, ${event.location}` : ""}`}
        >
          <span className={styles.eventTitle}>{event.title}</span>
          <span className={styles.eventMeta}>{`${clockLabel(start)}–${clockLabel(end)}`}</span>
          {event.location && <span className={styles.eventPlace}>{event.location}</span>}
        </button>
        <div className={styles.resize} aria-hidden="true" {...bind({ mode: "resize", id: event.id })} />
      </div>
    );
  };

  return (
    <section ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-label="Haftalık takvim" onKeyDown={onRootKeyDown}>
      <div className={styles.srOnly} role="status" aria-live="polite">{note}</div>

      <header className={styles.toolbar}>
        <div className={styles.navGroup}>
          <Button variant="secondary" size="sm" onClick={goToday}>Bugün</Button>
          <Button variant="ghost" size="sm" aria-label="Önceki" onClick={() => go(-1, undefined)}><ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" /></Button>
          <Button variant="ghost" size="sm" aria-label="Sonraki" onClick={() => go(1, undefined)}><ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" /></Button>
          <h2 className={styles.range}>{rangeTitle(days)}</h2>
        </div>
        <div className={styles.toolGroup}>
          <SegmentedControl label="Görünüm" value={view} onValueChange={value => changeView(value as CalendarView)} options={options.map(value => ({ value, label: viewLabels[value] }))} />
          <Popover>
            <PopoverTrigger asChild><Button variant="secondary" size="sm">Takvimler</Button></PopoverTrigger>
            <PopoverContent>
              <div className={styles.calendarList} role="group" aria-label="Takvimler">
                {calendars.map(calendar => (
                  <div key={calendar.id} className={styles.calendarRow}>
                    <span className={styles.swatch} style={{ background: toneVar[calendar.tone] }} aria-hidden="true" />
                    <Checkbox label={calendar.name} checked={!hidden.includes(calendar.id)} onCheckedChange={checked => { setHidden(current => (checked === true ? current.filter(id => id !== calendar.id) : [...current, calendar.id])); setNote(`${calendar.name} ${checked === true ? "gösterildi" : "gizlendi"}`); }} />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button size="sm" aria-label="Yeni etkinlik" onClick={() => openCreate(activeDay)}><Plus size={16} strokeWidth={1.75} aria-hidden="true" /></Button>
        </div>
      </header>

      {loading ? (
        <div className={styles.skeletons}><Skeleton lines={8} label="Takvim yükleniyor" /></div>
      ) : (
        <div className={styles.frame}>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div key={`${view}-${days[0]}`} className={styles.page} {...slide}>
              {view === "agenda" ? (
                <div className={styles.agenda}>
                  {days.map(day => {
                    const list = [...allDayFor(day).map(event => ({ event, start: 0, end: 0 })), ...timedFor(day)].sort((a, b) => a.start - b.start);
                    return (
                      <section key={day} className={styles.agendaDay} aria-label={date.format(day, "dayMonthWeekday")}>
                        <h3 className={styles.agendaHead} data-today={day === today ? "true" : undefined}>{`${date.format(day, "dayMonthWeekday")}${day === today ? " · Bugün" : ""}`}</h3>
                        {list.length === 0 ? <p className={styles.agendaEmpty}>Etkinlik yok.</p> : list.map(({ event, start, end }) => (
                          <button key={event.id} type="button" className={styles.agendaRow} data-event={event.id} data-tone={calendarOf(event.calendarId)?.tone ?? "muted"} onClick={() => openEdit(event)}>
                            <span className={styles.agendaTime}>{event.allDay ? "Tüm gün" : `${clockLabel(start)}–${clockLabel(end)}`}</span>
                            <span className={styles.agendaTitle}>{event.title}</span>
                            {event.location && <span className={styles.agendaPlace}>{event.location}</span>}
                          </button>
                        ))}
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.grid} role="grid" aria-label={`Takvim, ${rangeTitle(days)}`} aria-describedby={`${uid}-hint`} style={{ ["--days" as string]: days.length }}>
                  <div className={styles.headRow} role="row">
                    <div className={styles.gutter} aria-hidden="true" />
                    {days.map(day => (
                      <div key={day} role="columnheader" className={styles.dayHead} data-today={day === today ? "true" : undefined}>
                        <span className={styles.dayName}>{date.dayName(day, "short")}</span>
                        <span className={styles.dayNumber}>{String(Number(day.slice(8, 10)))}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.allDayRow} role="row">
                    <div className={styles.gutter} aria-hidden="true"><span className={styles.allDayLabel}>Tüm gün</span></div>
                    {days.map(day => {
                      const list = allDayFor(day);
                      const visible = allDayOpen ? list : list.slice(0, 2);
                      return (
                        <div key={day} role="gridcell" className={styles.allDayCell} aria-label={`${date.format(day, "dayMonthWeekday")} tüm gün, ${list.length} etkinlik`}>
                          {visible.map(event => (
                            <button key={event.id} type="button" className={styles.allDayEvent} data-event={event.id} data-tone={calendarOf(event.calendarId)?.tone ?? "muted"} onClick={() => openEdit(event)}>{event.title}</button>
                          ))}
                          {list.length > 2 && <button type="button" className={styles.more} aria-expanded={allDayOpen} onClick={() => setAllDayOpen(open => !open)}>{allDayOpen ? "Daralt" : `+${list.length - 2} daha`}</button>}
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.scroll} ref={scrollRef}>
                    <div className={styles.body} role="row" style={{ ["--hour-count" as string]: total / 60 }}>
                      <div className={styles.gutter} aria-hidden="true">
                        {hours.map(minute => <span key={minute} className={styles.hourLabel} style={{ top: `calc(var(--hour-size) * ${(minute - startMin) / 60})` }}>{clockLabel(minute)}</span>)}
                      </div>
                      <div className={styles.cols} ref={colsRef}>
                        {hours.map(minute => <span key={minute} className={styles.hourLine} style={{ top: `calc(var(--hour-size) * ${(minute - startMin) / 60})` }} aria-hidden="true" />)}
                        {days.map(day => {
                          const entries = timedFor(day);
                          const packed = packDay(entries.map(entry => ({ id: entry.event.id, start: entry.start, end: entry.end })));
                          return (
                            <div
                              key={day} role="gridcell" className={styles.dayCol} data-daycell={day} data-today={day === today ? "true" : undefined}
                              tabIndex={day === (days.includes(activeDay) ? activeDay : days[0]) ? 0 : -1} aria-label={dayNote(day)}
                              onFocus={event => { if (event.target === event.currentTarget) setActiveDay(day); }}
                              onPointerDown={event => {
                                if (event.target !== event.currentTarget) return;
                                const cell = cellAt(event.clientX, event.clientY);
                                if (!cell) return;
                                bind({ mode: "create", day, anchor: clamp(Math.floor(cell.minute / SNAP) * SNAP, startMin, endMin - SNAP) }).onPointerDown(event);
                              }}
                              onDoubleClick={event => { if (event.target === event.currentTarget) { const cell = cellAt(event.clientX, event.clientY); if (cell) openCreate(day, clamp(Math.floor(cell.minute / 60) * 60, startMin, endMin - 60)); } }}
                            >
                              {entries.map(entry => renderEvent(entry, packed.get(entry.event.id)))}
                              {preview?.day === day && (
                                <div className={styles.ghost} data-mode={preview.mode} style={{ top: `calc(var(--hour-size) * ${(preview.start - startMin) / 60})`, height: `calc(var(--hour-size) * ${(preview.end - preview.start) / 60})` }} aria-hidden="true">
                                  <span className={styles.ghostTime}>{`${clockLabel(preview.start)}–${clockLabel(preview.end)}`}</span>
                                </div>
                              )}
                              {nowDay === day && nowMinute !== undefined && nowMinute >= startMin && nowMinute <= endMin && (
                                <span className={styles.nowLine} style={{ top: `calc(var(--hour-size) * ${(nowMinute - startMin) / 60})` }} aria-hidden="true" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <p id={`${uid}-hint`} className={styles.hint}>
        {visibleCount === 0 && !loading ? "Etkinlik eklemek için bir saat aralığı sürükleyin." : "Boş zamanı sürükleyerek etkinlik ekleyin. Yön tuşları günler arasında gezer; N yeni, T bugün, D ve W görünüm, Alt ile ok kaydırır."}
      </p>

      <div className={styles.noticeRegion}>
        <AnimatePresence>
          {notice && (
            <motion.div key={notice.text} className={styles.notice} data-tone={notice.tone} role={notice.tone === "error" ? "alert" : "status"}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={reduced ? { duration: motionTokens.duration.instant } : motionTokens.spring.smooth}>
              <span>{notice.text}</span>
              {notice.undo && <Button size="sm" variant="ghost" onClick={() => { notice.undo?.(); setNotice(null); }}>Geri al</Button>}
              {notice.retry && <Button size="sm" variant="ghost" onClick={() => { notice.retry?.(); setNotice(null); }}>Yeniden dene</Button>}
              <Button size="sm" variant="ghost" aria-label="Kapat" onClick={() => setNotice(null)}>Kapat</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={dialogue !== null} onOpenChange={open => { if (!open) setDialogue(null); }}>
        <DialogContent title={dialogue?.mode === "edit" ? "Etkinliği düzenle" : "Yeni etkinlik"} description={dialogue ? `${date.format(dialogue.day, "dayMonthWeekday")}${dialogue.allDay ? " · Tüm gün" : ` · ${clockLabel(dialogue.start)}–${clockLabel(dialogue.end)}`}` : undefined}>
          {dialogue && (
            <form className={styles.form} onSubmit={saveDialogue} noValidate>
              <Input label="Başlık" value={dialogue.title} error={dialogue.title === "" && dialogue.error === "Başlık yazın." ? dialogue.error : undefined} autoFocus onChange={event => setDialogue({ ...dialogue, title: event.target.value, error: "" })} />
              <Select label="Gün" value={dialogue.day} options={dayOptions} onValueChange={value => setDialogue({ ...dialogue, day: value })} />
              {!dialogue.allDay && (
                <div className={styles.times}>
                  <Select label="Başlangıç" value={String(dialogue.start)} options={timeOptions} onValueChange={value => setDialogue({ ...dialogue, start: Number(value), end: Math.max(dialogue.end, Number(value) + SNAP), error: "" })} />
                  <Select label="Bitiş" value={String(dialogue.end)} options={timeOptions.filter(option => Number(option.value) > dialogue.start)} onValueChange={value => setDialogue({ ...dialogue, end: Number(value), error: "" })} />
                </div>
              )}
              <Select label="Takvim" value={dialogue.calendarId} options={calendars.map(calendar => ({ value: calendar.id, label: calendar.name }))} onValueChange={value => setDialogue({ ...dialogue, calendarId: value })} />
              <Input label="Yer" value={dialogue.location} onChange={event => setDialogue({ ...dialogue, location: event.target.value })} />
              {dialogue.error && dialogue.error !== "Başlık yazın." && <p className={styles.formError} role="alert">{dialogue.error}</p>}
              <div className={styles.formActions}>
                {dialogue.mode === "edit" && dialogue.id && (
                  <Button type="button" variant="danger" onClick={() => { const target = items.find(item => item.id === dialogue.id); setDialogue(null); if (target) void remove(target); }}>Sil</Button>
                )}
                <span className={styles.spacer} />
                <Button type="button" variant="ghost" onClick={() => setDialogue(null)}>Vazgeç</Button>
                <Button type="submit">Kaydet</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default WeekCalendar;
