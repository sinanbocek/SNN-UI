"use client";
import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./radio-group.module.css";
export interface RadioGroupProps { label: string; options: { value: string; label: string; description?: string | undefined }[]; value: string; onValueChange: (value: string) => void; name?: string | undefined }

/** Vurguyu seçilen satıra göre boyutlandırır. Yeni seçim dönüşüm yayında kayar; ilk boyama ve yeniden boyutlandırmalar anında yerleşir. */
function place(highlight: HTMLElement | null, row: HTMLElement | null | undefined, at: { current: string }, glide: boolean) {
  const next = row ? `${row.offsetTop} ${row.offsetHeight}` : "";
  if (!highlight || next === at.current) return;
  const visible = at.current !== "";
  at.current = next;
  if (!row) { animate(highlight, { opacity: 0 }, { duration: 0 }); return; }
  const target = { y: row.offsetTop, height: row.offsetHeight, opacity: 1 };
  if (glide && visible) { animate(highlight, target, { ...motionTokens.spring.morph, opacity: { duration: 0 } }); return; }
  // Elemana da yazılır; böylece sunucu yedeğini bırakan boyama vurguyu zaten yerinde gösterir.
  Object.assign(highlight.style, { transform: `translateY(${target.y}px)`, height: `${target.height}px`, opacity: "1" });
  animate(highlight, target, { duration: 0 });
}

/** Tek bir vurgu seçilen satıra gider, yeni nokta yayla girer, eskisi küçülüp kaybolur; böylece değişiklik tek bir fiziksel hareket gibi okunur. Ok tuşları da aynı yolu izler. Satırlar ve metin hiç boyut değiştirmez. */
export function RadioGroup({ label, options, value, onValueChange, name }: RadioGroupProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const rows = useRef<(HTMLLabelElement | null)[]>([]);
  const shown = useRef<number | null>(null);
  const at = useRef("");
  const selected = options.findIndex(option => option.value === value);
  useLayoutEffect(() => {
    place(highlightRef.current, rows.current[selected], at, shown.current !== null && shown.current !== selected && !reduced);
    shown.current = selected;
    listRef.current?.setAttribute("data-ready", "");
  }, [selected, reduced]);
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => place(highlightRef.current, rows.current[shown.current ?? -1], at, false));
    observer.observe(list); rows.current.forEach(row => row && observer.observe(row));
    return () => observer.disconnect();
  }, [options.length]);
  return <fieldset className={styles.group}><legend>{label}</legend><div ref={listRef} className={styles.options}>
    <span ref={highlightRef} className={styles.highlight} aria-hidden="true" />
    {options.map((option, index) => { const checked = value === option.value; return <label className={styles.option} key={option.value} ref={node => { rows.current[index] = node; }}>
      <input type="radio" name={name ?? id} value={option.value} checked={checked} onChange={() => onValueChange(option.value)}/>
      <span className={styles.mark} aria-hidden="true"><motion.span className={styles.dot} initial={false} animate={checked ? { scale: 1, opacity: 1 } : { scale: .4, opacity: 0 }} transition={reduced ? { duration: 0 } : { ...motionTokens.spring.snappy, opacity: { duration: checked ? motionTokens.duration.fast : motionTokens.duration.instant } }}/></span>
      <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
    </label>; })}
  </div></fieldset>;
}
