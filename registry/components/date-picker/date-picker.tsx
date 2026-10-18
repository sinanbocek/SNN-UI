"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ButtonHTMLAttributes, FocusEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar, type CalendarDateMatcher, type CalendarHoliday } from "../calendar/calendar";
import { motionTokens } from "../lib/motion-tokens";
import { dateParts, formatPickerDate, type DatePickerStyle } from "./date-picker-format";
import styles from "./date-picker.module.css";

export type { DatePickerStyle };

export interface DatePickerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange"> {
  label: string;
  value?: Date | undefined;
  onChange?: ((date: Date | undefined) => void) | undefined;
  description?: string | undefined;
  placeholder?: string | undefined;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  disabledDates?: CalendarDateMatcher | undefined;
  /** Tatil günleri; takvimde işaretlenir. Liste projeden gelir (ABACUS tatil tutmaz). */
  holidays?: readonly CalendarHoliday[] | undefined;
  /** ABACUS yazım biçimi: "long" → "16 Ekim 2026", "short" → "16.10.2026", "dayMonthWeekday" → "16 Eki. Cum.". */
  dateStyle?: DatePickerStyle | undefined;
  /** Takvim başlığına "Bugün" düğmesi ekler. */
  showToday?: boolean | undefined;
}

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const { spring, duration, ease, blur } = motionTokens;
const instant = { duration: duration.instant };
/** Tarihin her parçası zamanla döner: ileri tarih alttan yükselir, geri tarih üstten iner. Değişmeyen parçalar yerinde kalır. */
const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.35}em`, filter: `blur(${blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: ease.enter } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.3}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: 0.14, ease: ease.standard } }),
};
/** Azaltılmış harekette kısa bir geçiş kalır; dinlenme değerleri dönüşle aynıdır, sunucu ve istemci çıktısı tutar. */
const valueFade: Variants = { enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: instant }, exit: { opacity: 0, transition: instant } };
/** Alt satır seçimi onaylar: yeni metin hafif bulanıklıkla yükselir, eskisi yukarı kalkar. */
const statusRise: Variants = {
  enter: { opacity: 0, y: "0.3em", filter: `blur(${blur.soft}px)` },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: ease.enter } },
  exit: { opacity: 0, y: "-0.3em", filter: `blur(${blur.subtle}px)`, transition: { duration: 0.14, ease: ease.standard } },
};

export function DatePicker({ label, value, onChange, description, placeholder = "Tarih seçin", minDate, maxDate, disabledDates, holidays, dateStyle = "long", showToday, id, className, disabled, ...buttonProps }: DatePickerProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(monthStart(value ?? new Date()));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const reduce = useReducedMotion() ?? false;
  const time = value?.getTime() ?? null;
  const [previousTime, setPreviousTime] = useState(time);
  const [direction, setDirection] = useState(1);
  if (previousTime !== time) { setPreviousTime(time); setDirection(time === null || previousTime === null || time >= previousTime ? 1 : -1); }
  const shown = value ? formatPickerDate(value, dateStyle) : placeholder;
  const parts = value ? dateParts(value, dateStyle) : [];
  // Genişleyen ya da daralan bir parçadan sonraki parçalar yeni metnin geldiği eğriyle kayar; üst üste binmezler.
  const partMotion = reduce ? { duration: 0 } : { duration: duration.standard, ease: ease.enter };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) { window.clearTimeout(closeTimer.current); setOpen(false); } };
    document.addEventListener("pointerdown", onPointerDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); window.clearTimeout(closeTimer.current); };
  }, []);

  /** Açılınca odak sekme durağını taşıyan güne gider; oklar hemen çalışır, fareyle açılışta halka görünmez. */
  useEffect(() => {
    if (open) popoverRef.current?.querySelector<HTMLButtonElement>("[data-present] [data-date][tabindex=\"0\"]")?.focus({ preventScroll: true });
  }, [open]);

  /** Kapanırken odak takvimin içindeyse tetikleyiciye döner; klavye kullanıcısı sayfa gövdesine düşmez. */
  const close = () => {
    window.clearTimeout(closeTimer.current);
    if (popoverRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    setOpen(false);
  };
  /** Takvim hep geçerli değerin ayında, yoksa bu ayda açılır. */
  const show = () => { window.clearTimeout(closeTimer.current); setMonth(monthStart(value ?? new Date())); setOpen(true); };
  /** Seçilen güne vurgu kayar ve alt satır onaylar; sonra takvim kutuya döner. */
  const selectDate = (date: Date | undefined) => {
    onChange?.(date);
    window.clearTimeout(closeTimer.current);
    if (reduce || !date) close();
    else closeTimer.current = window.setTimeout(close, 300);
  };
  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") && !open) { event.preventDefault(); show(); }
    if (event.key === "Escape") close();
  };
  /** Sekmeyle açılır kutunun dışına çıkmak onu kapatır; alan içinde dolaşan odak açık tutar. */
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (open && next && !rootRef.current?.contains(next)) { window.clearTimeout(closeTimer.current); setOpen(false); }
  };

  return <div className={[styles.field, className].filter(Boolean).join(" ")} ref={rootRef} onBlur={onBlur}>
    <label className={styles.label} htmlFor={controlId}>{label}</label>
    <div className={styles.anchor}>
      <button {...buttonProps} ref={triggerRef} id={controlId} type="button" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} aria-describedby={hintId} className={styles.trigger} onClick={() => (open ? close() : show())} onKeyDown={onTriggerKeyDown}>
        <CalendarDays size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className={styles.srOnly}>{shown}</span>
        <span className={styles.valueText} aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false} custom={1}>
            {value ? <motion.span key="value" className={styles.value} custom={1} variants={reduce ? valueFade : valueRoll} initial="enter" animate="center" exit="exit">
              {parts.map((part, index) => <motion.span key={`${index}-${part.type}`} className={styles.part} layout="position" layoutDependency={time} transition={partMotion}>
                {part.type === "literal" ? <span className={styles.partValue}>{part.value}</span> : <AnimatePresence mode="popLayout" initial={false} custom={direction}><motion.span key={part.value} className={styles.partValue} custom={direction} variants={reduce ? valueFade : valueRoll} initial="enter" animate="center" exit="exit">{part.value}</motion.span></AnimatePresence>}
              </motion.span>)}
            </motion.span> : <motion.span key="placeholder" className={styles.placeholder} custom={-1} variants={reduce ? valueFade : valueRoll} initial="enter" animate="center" exit="exit">{placeholder}</motion.span>}
          </AnimatePresence>
        </span>
        <ChevronDown className={styles.chevron} size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && <motion.div ref={popoverRef} className={styles.popover} role="dialog" aria-label={`${label} takvimi`} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: .95 }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? instant : { ...spring.snappy, opacity: { duration: duration.fast, ease: ease.enter } } }}
          exit={{ opacity: 0, ...(reduce ? {} : { y: -6, scale: .97 }), transition: { duration: 0.14, ease: ease.standard } }}>
          <Calendar value={value} onChange={selectDate} month={month} onMonthChange={setMonth} minDate={minDate} maxDate={maxDate} disabledDates={disabledDates} holidays={holidays} showToday={showToday} />
          <div className={styles.footer}><button type="button" onClick={() => selectDate(undefined)} disabled={!value}>Temizle</button><span className={styles.status}><AnimatePresence initial={false}><motion.span key={time ?? "none"} variants={reduce ? valueFade : statusRise} initial="enter" animate="center" exit="exit">{value ? `Seçilen: ${formatPickerDate(value, dateStyle)}` : "Bir gün seçin"}</motion.span></AnimatePresence></span></div>
        </motion.div>}
      </AnimatePresence>
    </div>
    {description && <span id={hintId} className={styles.description}>{description}</span>}
  </div>;
}
