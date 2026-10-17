"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { CircleAlert, CircleCheck, CircleX, Info, type LucideIcon } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./status-card.module.css";

export type StatusTone = "success" | "warning" | "danger" | "neutral";

export interface StatusCardProps {
  /** Neyin durumu, örneğin "Veri akışı". */
  label: string;
  /** Durum metni, örneğin "Sorun yok", "Kontrol gerekli", "Bağlantı kurulamadı". */
  value: string;
  /** Renk, simge ve ton etiketi birlikte değişir; durum yalnız renge bırakılmaz. Uyarı tonu mavi-gridir. */
  tone?: StatusTone;
  /** Alttaki bağlam cümlesi, örneğin "Son kontrol 09:42". */
  context?: string;
  /** Sağ üstteki ton etiketi. Varsayılan: "Tamam", "Dikkat", "Hata", "Bilgi". */
  toneLabel?: string;
  /** Değer değişince ekran okuyucuya duyurulur (canlı izleme ekranları için). */
  live?: boolean;
  className?: string;
}

const TONES: Record<StatusTone, { icon: LucideIcon; label: string }> = {
  success: { icon: CircleCheck, label: "Tamam" },
  warning: { icon: CircleAlert, label: "Dikkat" },
  danger: { icon: CircleX, label: "Hata" },
  neutral: { icon: Info, label: "Bilgi" },
};

const rise: Variants = {
  hidden: { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } },
  gone: { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } },
};
const fade: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };

/** Metin gösteren durum kartı: gösterge kartıyla aynı ölçüde, değeri sayı yerine bir durum cümlesi. */
export function StatusCard({ label, value, tone = "neutral", context, toneLabel, live = false, className }: StatusCardProps) {
  const reduce = !!useReducedMotion();
  const { icon: Icon, label: defaultToneLabel } = TONES[tone];
  const variants = reduce ? fade : rise;
  return <article className={[styles.card, className].filter(Boolean).join(" ")} data-tone={tone} aria-label={label}>
    <div className={styles.top}>
      <span className={styles.label}>{label}</span>
      <small className={styles.pill}><Icon size={14} strokeWidth={2} aria-hidden="true" />{toneLabel ?? defaultToneLabel}</small>
    </div>
    <div className={styles.value} role={live ? "status" : undefined} aria-live={live ? "polite" : undefined}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={`${tone}:${value}`} className={styles.valueText} variants={variants} initial="hidden" animate="shown" exit="gone">
          <span className={styles.mark} aria-hidden="true"><Icon size={22} strokeWidth={1.75} /></span>{value}
        </motion.span>
      </AnimatePresence>
    </div>
    {context && <p className={styles.context}>{context}</p>}
  </article>;
}

export default StatusCard;
