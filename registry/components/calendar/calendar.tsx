"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import type { AnimationPlaybackControls, MotionValue, Variants } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { useToday } from "../lib/use-today";
import { dayLabel, holidayMap, monthTitle, weekdayLabels, weekIndex, type CalendarHoliday } from "./calendar-format";
import styles from "./calendar.module.css";

export type CalendarDateMatcher = (date: Date) => boolean;
export type { CalendarHoliday };

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: CalendarDateMatcher;
  /** Tatil günleri ("2026-10-29" ve adı). Gün işaretlenir, adı ipucunda ve ekran okuyucuda söylenir; seçimi engellemez (engellemek için `disabledDates`). */
  holidays?: readonly CalendarHoliday[];
  className?: string;
  /** Başlığa "Bugün" düğmesi ekler: bugünün ayına kayar ve seçilebiliyorsa bugünü seçer. */
  showToday?: boolean;
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const sameDay = (a?: Date, b?: Date) => Boolean(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
const sameMonth = (a?: Date, b?: Date) => Boolean(a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth());
const addDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);
/** Tam ay ilerler ve günü korur, kısa ayda sona sıkışır: 31 Ocak artı bir ay 28 Şubat olur. */
const shiftMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, Math.min(date.getDate(), new Date(date.getFullYear(), date.getMonth() + amount + 1, 0).getDate()));
const isBefore = (a: Date, b?: Date) => Boolean(b && startOfDay(a).getTime() < startOfDay(b).getTime());
const isAfter = (a: Date, b?: Date) => Boolean(b && startOfDay(a).getTime() > startOfDay(b).getTime());
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
/** Her ay altı hafta gösterir; ızgara hep aynı boyda kalır, ay değişirken zıplamaz. Hafta pazartesi başlar. */
const makeWeeks = (month: Date) => {
  const start = addDays(month, -weekIndex(month));
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(start, week * 7 + day)));
};

const subscribeNothing = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
/** Bakanın yerel tarihi (lib/use-today.ts, date-picker ile ortak). Calendar'dan içe aktaranlar çalışmaya devam etsin diye yeniden dışa verilir. */
export { useToday } from "../lib/use-today";

const { spring, duration, ease } = motionTokens;
/** Aylar tek şeritte yan yana durur. Hızlı tıklamalar aynı yayı yeniden hedefler; şerit kuyruk yapmaz, bölmeler üst üste binmez. */
const stripSpring = { type: "spring", visualDuration: 0.36, bounce: 0, restDelta: 0.002 } as const;
const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();
const fromIndex = (index: number) => new Date(Math.floor(index / 12), ((index % 12) + 12) % 12, 1);

/** Başlık yerinde geçiş yapar: eski ay şeridin gittiği yana çıkar, yenisi öbür yandan gelir. */
const titleSlide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 12 }),
  center: { opacity: 1, x: 0, transition: { duration: duration.standard, ease: ease.enter } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -12, transition: { duration: 0.14, ease: ease.standard } }),
};
/** Hareket azaltıldığında başlık yerinde değişir; kayma ve boş kare yok. */
const titleFade: Variants = { enter: { opacity: 1, x: 0 }, center: { opacity: 1, x: 0, transition: { duration: 0 } }, exit: { opacity: 0, transition: { duration: 0 } } };

/**
 * Bir ayın seçim diski. Ölçülerek değil hafta ve gün sırasıyla konumlanır; iki gün arasında düz çizgide kayar,
 * şerit kayarken de kaymaya devam eder ve yeni seçimde yolda yön değiştirir.
 * Yalnız seçim bu aya girip çıkarken büyür ya da söner.
 */
function SelectionDisc({ cell, reduced }: { cell: number; reduced: boolean }) {
  const visible = cell >= 0;
  const col = useMotionValue(visible ? cell % 7 : 0);
  const row = useMotionValue(visible ? Math.floor(cell / 7) : 0);
  const opacity = useMotionValue(visible ? 1 : 0);
  const scale = useMotionValue(visible ? 1 : 0.6);
  // Her adım bir hücre artı 4px boşluktur; yüzdeler diskin kendi boyuna göre çözülür, o da bir hücreye eşittir.
  const transform = useTransform(() => `translate(calc(${col.get()} * (100% + 4px)), calc(${row.get()} * (100% + 4px))) scale(${scale.get()})`);
  const hidden = useRef(!visible);
  useLayoutEffect(() => {
    if (!visible) {
      hidden.current = true;
      const fade = reduced ? { duration: 0 } : { duration: 0.14, ease: ease.standard };
      const controls = [animate(opacity, 0, fade), animate(scale, 0.6, fade)];
      return () => controls.forEach((control) => control.stop());
    }
    const nextCol = cell % 7, nextRow = Math.floor(cell / 7);
    const controls: AnimationPlaybackControls[] = [];
    if (hidden.current || reduced) { col.jump(nextCol); row.jump(nextRow); }
    else controls.push(animate(col, nextCol, spring.morph), animate(row, nextRow, spring.morph));
    hidden.current = false;
    controls.push(animate(opacity, 1, reduced ? { duration: 0 } : { duration: duration.fast, ease: ease.enter }), animate(scale, 1, reduced ? { duration: 0 } : spring.snappy));
    return () => controls.forEach((control) => control.stop());
  }, [cell, visible, reduced, col, row, opacity, scale]);
  return <motion.span className={styles.highlight} style={{ transform, opacity }} aria-hidden="true"><span className={styles.highlightFill} /></motion.span>;
}

/** Şeritteki bir ay. Yalnız gidilen ay odaklanabilir ve görünürdür; yanından kayıp geçen ay etkisizdir. */
function MonthPane({ index, position, present, children }: { index: number; position: MotionValue<number>; present: boolean; children: ReactNode }) {
  const x = useTransform(position, (value) => `calc(${(index - value) * 100}% + ${(index - value) * 16}px)`);
  const opacity = useTransform(position, (value) => 1 - Math.min(1, Math.abs(index - value)) * 0.6);
  return <motion.div className={styles.monthBody} style={{ x, opacity }} data-present={present || undefined} aria-hidden={present ? undefined : true} inert={!present}>{children}</motion.div>;
}

export function Calendar({
  value,
  onChange,
  month: controlledMonth,
  onMonthChange,
  minDate,
  maxDate,
  disabledDates,
  holidays,
  className,
  showToday = false,
}: CalendarProps) {
  const titleId = useId();
  const today = useToday();
  // Hareket tercihi yalnız hidrasyondan sonra sayılır; sunucu ve istemci çıktısı aynı kalır.
  const hydrated = useSyncExternalStore(subscribeNothing, clientSnapshot, serverSnapshot);
  const reducedMotion = (useReducedMotion() ?? false) && hydrated;
  const [internalMonth, setInternalMonth] = useState(() => (value ? monthStart(value) : undefined));
  const [focusedDate, setFocusedDate] = useState(value);
  const viewportRef = useRef<HTMLDivElement>(null);
  const focusRequest = useRef<string | null>(null);
  // Değer ya da ay verilmezse takvim istemcinin bugününü bekler, sonra bir kez o aya yerleşir.
  const fallback = value ?? today;
  const month = controlledMonth ? monthStart(controlledMonth) : internalMonth ?? (fallback && monthStart(fallback));
  if (!controlledMonth && !internalMonth && month) setInternalMonth(month);
  const monthTime = month?.getTime();
  const monthKey = month ? dateKey(month) : "pending";
  // Yön ayın kendisinden okunur; oklar, tuşlar, Bugün ve dışarıdan verilen ay aynı yöne gider.
  const [shownMonth, setShownMonth] = useState(monthTime);
  const [direction, setDirection] = useState(0);
  if (shownMonth !== monthTime) {
    setShownMonth(monthTime);
    setDirection(shownMonth === undefined || monthTime === undefined ? 0 : monthTime > shownMonth ? 1 : -1);
  }
  const weeks = useMemo(() => (monthTime === undefined ? [] : makeWeeks(new Date(monthTime))), [monthTime]);
  // Şerit konumu ay cinsindendir. Konumun iki yanındaki bölmeler ve gidilen ay çizilir.
  const target = month ? monthIndex(month) : 0;
  const position = useMotionValue(target);
  const [span, setSpan] = useState<[number, number]>([target, target]);
  useMotionValueEvent(position, "change", (value) => {
    const next: [number, number] = [Math.floor(value + 1e-3), Math.ceil(value - 1e-3)];
    setSpan((current) => (current[0] === next[0] && current[1] === next[1] ? current : next));
  });
  const ready = month !== undefined;
  const placed = useRef(ready);
  useLayoutEffect(() => {
    if (!ready) return;
    const from = position.get();
    if (from === target) return;
    // İlk ay ve azaltılmış hareket yerine konur; geri kalan her şey şeritte kayar.
    if (!placed.current || reducedMotion) { placed.current = true; position.jump(target); return; }
    // Uzun atlamalar (Bugün, Shift ile bir yıl) bir ay öteden başlar; şerit aradaki aylardan geçmez.
    if (Math.abs(target - from) > 2) position.jump(target - Math.sign(target - from));
    const controls = animate(position, target, stripSpring);
    return () => controls.stop();
  }, [ready, target, reducedMotion, position]);
  const paneIndexes = Array.from(new Set([span[0], span[1], target])).sort((a, b) => a - b);
  const weekdays = useMemo(() => weekdayLabels(), []);
  const holidayNames = useMemo(() => holidayMap(holidays), [holidays]);
  const monthLabel = month ? monthTitle(month) : "";
  // Seçim diski günler arasında kayar; her rakam disk gerçekten üstünden geçerken renk değiştirir:
  // kısa sıçramada bırakılan gün, uzun sıçramada varılan gün daha uzun bekler.
  const valueKey = value ? dateKey(value) : "";
  const [last, setLast] = useState({ key: valueKey, date: value });
  const [handoff, setHandoff] = useState({ from: "", to: "", distance: 0 });
  if (last.key !== valueKey) {
    const days = last.date && value ? Math.round((startOfDay(value).getTime() - startOfDay(last.date).getTime()) / 864e5) : 0;
    const columns = last.date && value ? weekIndex(value) - weekIndex(last.date) : 0;
    setLast({ key: valueKey, date: value });
    setHandoff({ from: last.key, to: valueKey, distance: Math.hypot(columns, (days - columns) / 7) });
  }
  const numberDelay = (key: string): CSSProperties | undefined => {
    if (!handoff.distance || reducedMotion || (key !== handoff.to && key !== handoff.from)) return undefined;
    const delay = key === handoff.to ? Math.min(260, 95 + 85 * Math.log(handoff.distance)) : Math.max(20, 130 / handoff.distance);
    return { "--number-delay": `${Math.round(delay)}ms` } as CSSProperties;
  };

  const isDisabled = (date: Date) => isBefore(date, minDate) || isAfter(date, maxDate) || Boolean(disabledDates?.(date));
  const previousMonth = month && addMonths(month, -1);
  const nextMonth = month && addMonths(month, 1);
  // Ay henüz bilinmezken denetimler dinlenme görünümünde kalır; hidrasyon onları soluk yakıp söndürmez.
  const previousDisabled = Boolean(previousMonth && minDate && previousMonth.getTime() < monthStart(minDate).getTime());
  const nextDisabled = Boolean(nextMonth && maxDate && nextMonth.getTime() > monthStart(maxDate).getTime());
  const todaySelectable = Boolean(today && !isDisabled(today) && onChange);
  const todayIdle = Boolean(today && sameMonth(month, today) && (!todaySelectable || sameDay(value, today)));
  // Gezici sekme durağı: son odaklanan gün, yoksa seçim, yoksa bugün, yoksa ayın ilk açık günü.
  const tabbableKey = (() => {
    const open = (date?: Date) => (date && sameMonth(date, month) && !isDisabled(date) ? dateKey(date) : "");
    return open(focusedDate) || open(value) || open(today) || dateKey(weeks.flat().find((date) => sameMonth(date, month) && !isDisabled(date)) ?? new Date(0));
  })();

  const changeMonth = (target: Date) => {
    const normalized = monthStart(target);
    if (!controlledMonth) setInternalMonth(normalized);
    onMonthChange?.(normalized);
  };

  /** Klavye odağı, ay kaymaya başladığı karede yeni güne iner. */
  useLayoutEffect(() => {
    const key = focusRequest.current;
    if (!key) return;
    const button = viewportRef.current?.querySelector<HTMLButtonElement>(`[data-present] [data-date="${key}"]`);
    if (button) { focusRequest.current = null; button.focus({ preventScroll: true }); }
  });

  /** Klavye hareketini izinli aralığa sıkıştırır ve gidiş yönünde kapalı günlerin üstünden atlar. */
  const moveFocus = (from: Date, target: Date, step: number) => {
    let next = isBefore(target, minDate) && minDate ? startOfDay(minDate) : isAfter(target, maxDate) && maxDate ? startOfDay(maxDate) : target;
    for (let tries = 0; tries < 42 && isDisabled(next); tries += 1) next = addDays(next, step);
    if (isDisabled(next) || sameDay(next, from)) return;
    setFocusedDate(next);
    focusRequest.current = dateKey(next);
    if (!sameMonth(next, month)) changeMonth(next);
  };

  const onDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!isDisabled(date)) onChange?.(date);
      return;
    }
    const moves: Record<string, [Date, number]> = {
      ArrowLeft: [addDays(date, -1), -1],
      ArrowRight: [addDays(date, 1), 1],
      ArrowUp: [addDays(date, -7), -1],
      ArrowDown: [addDays(date, 7), 1],
      Home: [addDays(date, -weekIndex(date)), 1],
      End: [addDays(date, 6 - weekIndex(date)), -1],
      PageUp: [shiftMonths(date, event.shiftKey ? -12 : -1), -1],
      PageDown: [shiftMonths(date, event.shiftKey ? 12 : 1), 1],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveFocus(date, move[0], move[1]);
  };

  const goToToday = () => {
    if (!today || !month || todayIdle) return;
    setFocusedDate(today);
    if (!sameMonth(today, month)) changeMonth(today);
    if (todaySelectable && !sameDay(value, today)) onChange?.(today);
  };

  const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");
  // Her ay sabit altı hafta; bir günün hücresi ızgaradaki ilk günden uzaklığıdır.
  const cellOf = (paneMonth: Date) => {
    if (!value) return -1;
    const first = addDays(paneMonth, -weekIndex(paneMonth));
    const index = Math.round((startOfDay(value).getTime() - first.getTime()) / 864e5);
    return index >= 0 && index < 42 ? index : -1;
  };

  const renderMonth = (paneMonth: Date, present: boolean) => <>
    <SelectionDisc cell={cellOf(paneMonth)} reduced={reducedMotion} />
    <div className={styles.grid} role="grid" aria-label={monthTitle(paneMonth)}>
    {makeWeeks(paneMonth).map((week) => <div key={dateKey(week[0]!)} className={styles.week} role="row">
      {week.map((date) => {
        const key = dateKey(date);
        const selected = sameDay(date, value);
        const isToday = sameDay(date, today);
        const holiday = holidayNames.get(key);
        return <button
          key={key}
          type="button"
          role="gridcell"
          data-date={key}
          data-holiday={holiday ? "" : undefined}
          title={holiday}
          aria-label={dayLabel(date, holiday)}
          aria-selected={selected}
          aria-current={isToday ? "date" : undefined}
          tabIndex={present && key === tabbableKey ? 0 : -1}
          disabled={isDisabled(date)}
          style={present ? numberDelay(key) : undefined}
          className={cx(styles.day, !sameMonth(date, paneMonth) && styles.outside, selected && styles.selected, isToday && styles.today, holiday && styles.holiday)}
          onFocus={() => setFocusedDate(date)}
          onKeyDown={(event) => onDayKeyDown(event, date)}
          onClick={() => onChange?.(date)}
        ><span className={styles.dayNumber}>{date.getDate()}</span></button>;
      })}
    </div>)}
    </div>
  </>;

  return <section className={cx(styles.calendar, className)} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 id={titleId} className={styles.heading}>
          <span className={styles.srOnly}>{monthLabel}</span>
          <span className={styles.title} aria-hidden="true">
            <AnimatePresence initial={false} custom={direction}>
              {month && <motion.span key={monthKey} className={styles.titleRow} custom={direction} variants={reducedMotion || !direction ? titleFade : titleSlide} initial="enter" animate="center" exit="exit">{monthLabel}</motion.span>}
            </AnimatePresence>
          </span>
        </h2>
        <span className={styles.srOnly} aria-live="polite">{direction ? monthLabel : ""}</span>
        <div className={styles.navigation}>
          {showToday && <button type="button" className={styles.todayButton} aria-disabled={todayIdle || undefined} aria-label={today ? `Bugün, ${dayLabel(today)}` : "Bugün"} onClick={goToToday}>Bugün</button>}
          <button type="button" className={styles.navButton} aria-label="Önceki ay" aria-disabled={previousDisabled || undefined} onClick={() => { if (!previousDisabled && previousMonth) changeMonth(previousMonth); }}><ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" /></button>
          <button type="button" className={styles.navButton} aria-label="Sonraki ay" aria-disabled={nextDisabled || undefined} onClick={() => { if (!nextDisabled && nextMonth) changeMonth(nextMonth); }}><ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" /></button>
        </div>
      </div>
      <div className={styles.weekdays} aria-hidden="true">{weekdays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className={styles.monthViewport} ref={viewportRef}>
        {month ? paneIndexes.map((index) => <MonthPane key={index} index={index} position={position} present={index === target}>{renderMonth(fromIndex(index), index === target)}</MonthPane>)
          : <div className={styles.monthBody} aria-hidden="true"><div className={styles.grid}>{Array.from({ length: 6 }, (_, week) => <div key={week} className={styles.week}>{Array.from({ length: 7 }, (_, day) => <span key={day} className={styles.placeholderDay} />)}</div>)}</div></div>}
      </div>
    </section>;
}

export { addDays, addMonths, sameDay, startOfDay };
