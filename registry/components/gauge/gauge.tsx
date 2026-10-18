"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type Variants } from "motion/react";
import { formatNumber, roundTo } from "../lib/chart-format";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./gauge.module.css";

type GaugeTone = "accent" | "success" | "warning" | "danger";
/** `from` değerinden başlayan bant: değerin ulaştığı en yüksek bant tonu belirler ve durumu adlandırır; bu yüzden anlam yalnız renge dayanmaz. */
export interface GaugeThreshold { from: number; tone: GaugeTone; label: string; }
export interface GaugeProps { value: number; min?: number | undefined; max?: number | undefined; label: string; detail?: string | undefined; tone?: GaugeTone | undefined; thresholds?: GaugeThreshold[] | undefined; }

/** Metin değerin gittiği yönden girer: artış alttan yükselir, düşüş üstten iner. */
const rise: Variants = { hidden: (direction: number) => ({ opacity: 0, y: `${.3 * direction}em`, filter: `blur(${motionTokens.blur.soft}px)` }), shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } }, gone: (direction: number) => ({ opacity: 0, y: `${-.3 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }) };
// `rise` ile aynı anahtarlar; sunucuda hangi dal çizilirse çizilsin oturmuş stil aynıdır.
const fade: Variants = { hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } } };
/** İlk dolum daha yavaştır ve aşmaz; görünüm açılırken kapanan halka gibi. */
const reveal = { ...motionTokens.spring.smooth, visualDuration: motionTokens.duration.considered * 1.6 };

/** Yeni metin yükselirken eskisi akıştan alınarak çıkar; satır ikisini birden tutmaz. */
function Swap({ text, direction = 1 }: { text: string; direction?: number | undefined }) {
  const reduceMotion = !!useReducedMotion();
  return <span className={styles.swap}><AnimatePresence mode="popLayout" initial={false} custom={direction}><motion.span key={text} className={styles.text} custom={direction} variants={reduceMotion ? fade : rise} initial="hidden" animate="shown" exit="gone">{text}</motion.span></AnimatePresence></span>;
}

/** Altı açık 270 derecelik halka; sol alt ucundan saat yönünde çizilir. Yuvarlak uç tam kalsın diye her karede süpürmeden yeniden çizilir. */
const radius = 42, start = -135, span = 270;
function arcFor(sweep: number) {
  const end = start + span * Math.min(1, Math.max(0, sweep));
  const at = (angle: number) => `${roundTo(50 + radius * Math.sin((angle * Math.PI) / 180), 3)} ${roundTo(50 - radius * Math.cos((angle * Math.PI) / 180), 3)}`;
  return `M ${at(start)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${at(end)}`;
}
const track = arcFor(1);

export function Gauge({ value, min = 0, max = 100, label, detail, tone = "accent", thresholds }: GaugeProps) {
  const safeMax = max > min ? max : min + 1;
  const percentage = Math.min(1, Math.max(0, (value - min) / (safeMax - min)));
  const displayValue = Math.round(percentage * 100);
  const bands = [...thresholds ?? []].sort((a, b) => a.from - b.from);
  const bandAt = (at: number) => bands.filter(threshold => at >= threshold.from - 1e-6).pop();
  const band = bandAt(value);
  const ref = useRef<HTMLElement>(null);
  const sizer = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: .5 });
  const reduceMotion = !!useReducedMotion();
  const sweep = useMotionValue(0);
  const count = useMotionValue(0);
  const digitsWidth = useMotionValue<number | "auto">("auto");
  const [filled, setFilled] = useState(false);
  const [live, setLive] = useState(band);
  const path = useTransform(sweep, arcFor);
  // Uç, nokta olarak patlamak yerine ilk ince dilimde solarak belirir.
  const arcOpacity = useTransform(sweep, current => Math.min(1, Math.max(0, current / .02)));
  const digits = useTransform(count, current => String(Math.round(Math.min(100, Math.max(0, current)))));
  const [moved, setMoved] = useState({ value: displayValue, direction: 1 });
  if (moved.value !== displayValue) setMoved({ value: displayValue, direction: displayValue < moved.value ? -1 : 1 });

  // Halka görününce dolar, sonra her yeni değere biraz canlılıkla yaylanır; sayım aşmadan izler.
  useEffect(() => {
    // Azaltılmış harekette değer hemen oturur; durum bir kare sonra, sunucu çıktısıyla eşleştikten sonra görünür.
    if (reduceMotion) { sweep.jump(percentage); count.jump(percentage * 100); const frame = requestAnimationFrame(() => setFilled(true)); return () => cancelAnimationFrame(frame); }
    if (!inView) return;
    const arc = animate(sweep, percentage, filled ? motionTokens.spring.morph : reveal);
    const number = animate(count, percentage * 100, { ...(filled ? motionTokens.spring.smooth : reveal), onComplete: () => setFilled(true) });
    return () => { arc.stop(); number.stop(); };
  }, [count, filled, inView, percentage, reduceMotion, sweep]);

  // Durum ilk dolum oturunca gelir. Sonra ekrandaki sayıyı izler; sayım eşiği geçtiği anda renk ve etiket değişir.
  useMotionValueEvent(count, "change", current => {
    const next = bandAt(min + (current / 100) * (safeMax - min));
    const changed = next?.from !== live?.from || next?.label !== live?.label;
    if (filled) { if (changed) setLive(next); }
    else if (inView && Math.abs(current - percentage * 100) < 1) { if (changed) setLive(next); setFilled(true); }
  });
  const shown = reduceMotion || !filled ? band : live;
  const activeTone = shown?.tone ?? tone;

  // Rakamlar hedef sayıya göre boyutlanan kutuda sağa hizalanır; sayarken birler sütunu sıçramaz, grup yayla yeniden ortalanır.
  useEffect(() => {
    const node = sizer.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured: string | null = null;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth;
      if (measured !== null && measured !== node.textContent && !reduceMotion) animate(digitsWidth, next, motionTokens.spring.smooth);
      else digitsWidth.jump(next);
      measured = node.textContent;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [digitsWidth, reduceMotion]);

  return <figure ref={ref} className={[styles.figure, styles[activeTone]].join(" ")} aria-label={`${label}: ${formatNumber(value, 1)} / ${formatNumber(safeMax, 1)}${band ? `, ${band.label}` : ""}`}>
    <div className={styles.visual} role="meter" aria-label={label} aria-valuemin={min} aria-valuemax={safeMax} aria-valuenow={Math.min(safeMax, Math.max(min, value))} aria-valuetext={`%${displayValue}${band ? `, ${band.label}` : ""}`}>
      <svg viewBox="0 0 100 90" aria-hidden="true" focusable="false"><path className={styles.track} d={track} /><motion.path className={styles.arc} d={path} style={{ opacity: arcOpacity }} /></svg>
      <div className={styles.readout} aria-hidden="true">
        <span className={styles.number}><span className={styles.unit}>%</span><motion.span className={styles.digits} style={{ width: digitsWidth }}>{digits}</motion.span><span ref={sizer} className={styles.sizer}>{displayValue}</span></span>
        {thresholds && <span className={styles.status}><Swap text={filled ? shown?.label ?? "" : ""} direction={moved.direction} /></span>}
      </div>
    </div>
    <figcaption><strong><Swap text={label} /></strong>{detail && <span className={styles.detail}><Swap text={detail} direction={moved.direction} /></span>}</figcaption>
  </figure>;
}

export default Gauge;
