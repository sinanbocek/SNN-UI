"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Variants } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { metricDisplay, type MetricFormat } from "./metric-card-format";
import styles from "./metric-card.module.css";
export interface MetricCardProps {
  label: string; value: number; context: string; change?: string;
  /** "number" (varsayılan), "money" (₺1.250.000) ya da "compact-money" (₺1,25Mn). Tutar yazımı ABACUS'tandır. */
  format?: MetricFormat;
  /** Tutar biçiminde para birimi; varsayılan TRY. */
  currency?: string;
  /** Ondalık basamak sayısı (düz sayı ve tam tutar için). */
  decimals?: number;
  /** Sayının yanına yazılan ek (örneğin "kişi"). Tutar biçiminde ABACUS'un eki kullanılır. */
  suffix?: string;
}

/** Sayı taşıyan metin hareket ettiği yönden girer: büyüyen değer alttan yükselir, küçülen üstten düşer. */
const rise: Variants = { hidden: (direction: number) => ({ opacity: 0, y: `${.3 * direction}em`, filter: `blur(${motionTokens.blur.soft}px)` }), shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } }, gone: (direction: number) => ({ opacity: 0, y: `${-.3 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }) };
const fade: Variants = { hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } } };
/** Metindeki ilk sayıyı okur. Türkçe yazım: nokta binliktir, virgül ondalıktır ("%12,3", "₺1.234,5"). */
const amountIn = (text: string) => Number((text.replace(/−/g, "-").match(/-?\d[\d.]*(?:,\d+)?/)?.[0] ?? "").replace(/\./g, "").replace(",", ".") || NaN);

/** Yeni metin yükselirken eskisi çıkar; `morph` kabı, yeni metnin genişliğine sıçramak yerine yaylanarak getirir. */
function Swap({ text, morph = false, block = false }: { text: string; morph?: boolean; block?: boolean }) {
  const reduceMotion = !!useReducedMotion();
  const sizer = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  const [shown, setShown] = useState({ text, direction: 1 });
  if (shown.text !== text) setShown({ text, direction: amountIn(text) < amountIn(shown.text) ? -1 : 1 });
  useEffect(() => {
    const node = sizer.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured: string | null = null;
    // Dönüştürülmüş kutu değil yerleşim boyutu ölçülür; ölçekleyen üst öğe metni kırpmaz. Yalnız yeni metin yaylanır, yazı tipi yüklenince boyut atlar.
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth;
      if (next && measured !== null && measured !== node.textContent && !reduceMotion) animate(width, next, motionTokens.spring.morph);
      else width.jump(next || "auto");
      measured = next ? node.textContent : null;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [morph, reduceMotion, width]);
  return <motion.span className={block ? styles.swapBlock : styles.swap} style={morph ? { width } : undefined}>
    {morph && <span ref={sizer} className={styles.sizer} aria-hidden="true">{text}</span>}
    <AnimatePresence mode="popLayout" initial={false} custom={shown.direction}><motion.span key={text} className={styles.text} custom={shown.direction} variants={reduceMotion ? fade : rise} initial="hidden" animate="shown" exit="gone">{text}</motion.span></AnimatePresence>
  </motion.span>;
}

export function MetricCard({ label, value, context, change, format = "number", currency = "TRY", decimals = 0, suffix }: MetricCardProps) {
  const reduceMotion = !!useReducedMotion();
  const shown = metricDisplay(value, format, currency, decimals);
  return <article className={styles.card}>
    <div className={styles.top}><span><Swap text={label} block /></span><AnimatePresence initial={false}>{change && <motion.small key="change" data-trend={/^[+]/.test(change) ? "up" : /^[-−]/.test(change) ? "down" : undefined} initial={{ opacity: 0, scale: reduceMotion ? 1 : .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduceMotion ? 1 : .96, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.snappy}><Swap text={change} morph /></motion.small>}</AnimatePresence></div>
    <AnimatedCounter value={shown.value} prefix={shown.prefix} suffix={format === "number" ? suffix : shown.suffix} decimals={shown.decimals} animateOnView />
    <p><Swap text={context} block /></p>
  </article>;
}
