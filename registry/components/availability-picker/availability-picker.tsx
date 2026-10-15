"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { date } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { Button } from "../button/button";
import { EmptyState } from "../empty-state/empty-state";
import { Skeleton } from "../skeleton/skeleton";
import styles from "./availability-picker.module.css";

export interface AvailabilityParticipant { id: string; name: string; src?: string }

export interface AvailabilitySlot {
  /** "2026-10-19T10:30" (başlangıç, veri ve etiket aynı saat diliminde). */
  start: string;
  /** Bu saatte meşgul olan katılımcıların kimlikleri. Boşsa herkes müsait. */
  busy?: string[];
}

export interface AvailabilityDay {
  /** "2026-10-19" */
  date: string;
  slots: AvailabilitySlot[];
}

export interface AvailabilityChoice { date: string; start: string; end: string }

export interface AvailabilityPickerProps {
  /** Toplantı adı. */
  title: string;
  /** Toplantı süresi, dakika. Bitiş saati başlangıca bu eklenerek bulunur. */
  durationMinutes: number;
  /** Saat dilimi etiketi ("İstanbul saati"). Veri de bu dilimde gelir. */
  timezoneLabel: string;
  participants: AvailabilityParticipant[];
  /** En çok beş gün. Veriyi proje hazırlar (takvim servisinden). */
  days: AvailabilityDay[];
  /** "Saati onayla" basıldı. Reddedilirse özet çubuğunda "Planlanamadı." ve "Yeniden dene" çıkar; seçim korunur. */
  onConfirm: (choice: AvailabilityChoice) => void | Promise<void>;
  /** Hiç ortak uygun saat yokken çıkan "Katılımcıları değiştir" düğmesi. */
  onChangeParticipants?: () => void;
  loading?: boolean;
  className?: string;
}

type Phase = "idle" | "busy" | "done" | "error";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Başlangıca süre ekler: "2026-10-19T10:30" + 30 dk → "2026-10-19T11:00". ABACUS'a aday: dakika toplayıp ISO üreten tek çağrılık araç yok. */
function endOf(start: string, minutes: number) {
  const total = Number(start.slice(11, 13)) * 60 + Number(start.slice(14, 16)) + minutes;
  const clamped = Math.min(total, 24 * 60 - 1);
  return `${start.slice(0, 10)}T${pad2(Math.floor(clamped / 60))}:${pad2(clamped % 60)}`;
}

const clock = (iso: string) => date.format(iso, "time");

/** Ok tuşlarıyla düğme grubunda gezinme (satır içi ±1, ızgarada ±sütun). */
function roving(event: KeyboardEvent<HTMLElement>, columns = 1) {
  const items = [...event.currentTarget.querySelectorAll<HTMLElement>("[data-rove]:not(:disabled)")];
  const at = items.indexOf(document.activeElement as HTMLElement);
  if (at < 0) return;
  const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "ArrowDown" ? columns : event.key === "ArrowUp" ? -columns : 0;
  if (step === 0) return;
  const next = items[at + step];
  if (next) { event.preventDefault(); next.focus(); }
}

/** Ortak uygun saat seçici: beş günlük şerit, seçili günün saatleri, her saatte kimin müsait olduğu ve onay çubuğu. */
export function AvailabilityPicker({ title, durationMinutes, timezoneLabel, participants, days, onConfirm, onChangeParticipants, loading = false, className }: AvailabilityPickerProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const listRef = useRef<HTMLDivElement>(null);
  const shown = days.slice(0, 5);
  const [dayIndex, setDayIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [slotStart, setSlotStart] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [note, setNote] = useState("");

  const freeCount = (day: AvailabilityDay) => day.slots.filter(slot => (slot.busy ?? []).length === 0).length;
  const name = (id: string) => participants.find(person => person.id === id)?.name ?? id;
  const anyFree = shown.some(day => freeCount(day) > 0);

  const day = shown[Math.min(dayIndex, Math.max(shown.length - 1, 0))];
  const slot = day?.slots.find(item => item.start === slotStart);
  const nearestFree = useMemo(() => {
    for (let step = 1; step < shown.length; step += 1) {
      for (const index of [dayIndex + step, dayIndex - step]) if (shown[index] && freeCount(shown[index]) > 0) return index;
    }
    return -1;
  }, [shown, dayIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (phase !== "idle" && phase !== "busy") setPhase("idle"); }, [slotStart]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectDay(index: number) {
    if (index === dayIndex) return;
    setDirection(index > dayIndex ? 1 : -1);
    setDayIndex(index);
    setSlotStart(null);
    setPhase("idle");
    setNote(`Seçilen gün: ${date.format(shown[index].date, "dayMonthWeekday")}`);
  }

  function selectSlot(item: AvailabilitySlot) {
    setSlotStart(item.start);
    const people = (item.busy ?? []).map(name);
    setNote(`Seçilen: ${date.format(day.date, "dayMonthWeekday")}, saat ${clock(item.start)}–${clock(endOf(item.start, durationMinutes))}${people.length ? `. Herkes müsait değil: ${people.join(", ")}` : ". Herkes müsait"}`);
  }

  async function confirm() {
    if (!slot || !day || phase === "busy") return;
    setPhase("busy");
    try {
      await onConfirm({ date: day.date, start: slot.start, end: endOf(slot.start, durationMinutes) });
      setPhase("done");
      setNote("Planlandı.");
    } catch {
      setPhase("error");
      setNote("Planlanamadı.");
    }
  }

  const rowText = (item: AvailabilitySlot) => {
    const busy = item.busy ?? [];
    return busy.length === 0 ? "Herkes müsait" : busy.length === 1 ? `${name(busy[0])} meşgul` : `${busy.length} kişi meşgul`;
  };

  const summary = !slot
    ? "Bir saat seçin"
    : `${date.format(day.date, "dayMonthWeekday")}, ${clock(slot.start)}–${clock(endOf(slot.start, durationMinutes))}`;
  const warning = slot && (slot.busy ?? []).length > 0 ? `Herkes müsait değil: ${(slot.busy ?? []).map(name).join(", ")}` : "";

  const slideProps = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: motionTokens.duration.instant } }
    : { initial: { opacity: 0, x: direction * 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: direction * -24 }, transition: { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } } };

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-labelledby={`${uid}-title`}>
      <div className={styles.srOnly} role="status" aria-live="polite">{note}</div>

      <header className={styles.header}>
        <div className={styles.headText}>
          <h2 id={`${uid}-title`} className={styles.title}>{title}</h2>
          <p className={styles.lead}>{`${durationMinutes} dakika · ${timezoneLabel}`}</p>
        </div>
        <div className={styles.people} role="group" aria-label="Katılımcılar">
          <span className={styles.avatars}>{participants.slice(0, 5).map(person => <span key={person.id} className={styles.avatarItem}><Avatar name={person.name} src={person.src} size="sm" /></span>)}</span>
          <span className={styles.names}>{participants.slice(0, 2).map(person => person.name.split(" ")[0]).join(", ")}{participants.length > 2 ? ` +${participants.length - 2}` : ""}</span>
        </div>
      </header>

      {loading ? (
        <div className={styles.skeletons}><Skeleton lines={5} label="Müsaitlik yükleniyor" /></div>
      ) : !anyFree ? (
        <EmptyState title="Ortak uygun saat bulunamadı." description="Seçilen katılımcıların bu günlerde ortak boş saati yok." action={onChangeParticipants ? <Button variant="secondary" onClick={onChangeParticipants}>Katılımcıları değiştir</Button> : undefined} />
      ) : (
        <>
          <div className={styles.strip} role="group" aria-label="Gün seçimi" onKeyDown={event => roving(event)}>
            {shown.map((item, index) => {
              const free = freeCount(item);
              const selected = index === dayIndex;
              return (
                <button key={item.date} type="button" className={styles.dayCard} data-rove aria-pressed={selected} tabIndex={selected ? 0 : -1} onClick={() => selectDay(index)}>
                  <span className={styles.dayName}>{date.dayName(item.date, "short")}</span>
                  <span className={styles.dayNumber}>{String(Number(item.date.slice(8, 10)))}</span>
                  <span className={styles.dayFree}>{free > 0 ? `${free} boş` : "Boş yok"}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.slots}>
            <div className={styles.slotsHead}>
              <h3 className={styles.slotsTitle}>{date.format(day.date, "dayMonthWeekday")}</h3>
              <span className={styles.legend}>
                <span className={styles.legendItem}><span className={styles.bar} data-busy="false" aria-hidden="true" />Müsait</span>
                <span className={styles.legendItem}><span className={styles.bar} data-busy="true" aria-hidden="true" />Meşgul</span>
              </span>
            </div>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div key={day.date} className={styles.slotPage} {...slideProps}>
                {freeCount(day) === 0 ? (
                  <div className={styles.noFree}>
                    <p className={styles.noFreeText}>Bu gün için uygun saat yok.</p>
                    {nearestFree >= 0 && <Button variant="secondary" size="sm" onClick={() => selectDay(nearestFree)}>{`En yakın uygun gün: ${date.format(shown[nearestFree].date, "dayMonthWeekday")}`}</Button>}
                  </div>
                ) : null}
                {day.slots.length > 0 && (
                  <div ref={listRef} className={styles.slotGrid} role="group" aria-label={`${date.format(day.date, "dayMonthWeekday")} saatleri`} onKeyDown={event => roving(event, 2)}>
                    {day.slots.map((item, index) => {
                      const busy = item.busy ?? [];
                      const selected = item.start === slotStart;
                      const first = slotStart === null ? index === 0 : selected;
                      return (
                        <button
                          key={item.start} type="button" className={styles.slot} data-rove data-busy={busy.length > 0 ? "true" : undefined} aria-pressed={selected} tabIndex={first ? 0 : -1}
                          aria-label={`${clock(item.start)}, ${rowText(item)}`} onClick={() => selectSlot(item)}
                        >
                          {selected && <motion.span layoutId={`${uid}-slot`} className={styles.slotMark} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth} aria-hidden="true" />}
                          <span className={styles.slotContent}>
                            <span className={styles.slotText}>
                              <span className={styles.slotTime}>{clock(item.start)}</span>
                              <span className={styles.slotStatus}>{rowText(item)}</span>
                            </span>
                            <span className={styles.bars} aria-hidden="true">
                              {participants.slice(0, 5).map(person => <span key={person.id} className={styles.bar} data-busy={busy.includes(person.id) ? "true" : "false"} />)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className={styles.summary}>
            <div className={styles.summaryText}>
              <span className={styles.summaryMain}>{phase === "done" ? `Planlandı: ${summary}` : summary}</span>
              {warning && phase !== "done" && <span className={styles.summaryWarn}>{warning}</span>}
              {phase === "error" && <span className={styles.summaryError} role="alert">Planlanamadı.</span>}
            </div>
            <Button onClick={() => void confirm()} loading={phase === "busy"} disabled={!slot || phase === "busy" || phase === "done"}>
              {phase === "done" ? "Planlandı" : phase === "error" ? "Yeniden dene" : "Saati onayla"}
            </Button>
          </footer>
        </>
      )}
    </section>
  );
}

export default AvailabilityPicker;
