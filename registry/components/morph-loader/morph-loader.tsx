"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./morph-loader.module.css";

export type MorphLoaderVariant = "dots" | "bars" | "ring" | "square";
export type MorphLoaderState = "loading" | "success" | "error";

export interface MorphLoaderProps {
  /** Yükleniyor biçimi. Üründe tek biçim seçilir, karıştırılmaz. */
  variant?: MorphLoaderVariant | undefined;
  /** Durumu uygulama verir. */
  state?: MorphLoaderState | undefined;
  /** Piksel cinsinden kenar uzunluğu. Yerleşim durum değişince kaymaz. */
  size?: number | undefined;
  /** Görünmez durum metinleri (ekran okuyucu için). */
  labels?: Partial<Record<MorphLoaderState, string>> | undefined;
  /** true iken işaret ekran okuyucudan tümüyle gizlenir (çevresi durumu zaten söylüyorsa). */
  decorative?: boolean | undefined;
  className?: string | undefined;
}

const defaultLabels: Record<MorphLoaderState, string> = { loading: "Yükleniyor", success: "Tamamlandı", error: "Başarısız" };

/** Yükleniyor çizimleri; hepsi 24 birimlik tuvalde durur. */
function LoadingGlyph({ variant, still }: { variant: MorphLoaderVariant; still: boolean }) {
  if (variant === "dots") return <g className={styles.dots} data-still={still || undefined}>{[5, 12, 19].map((x, index) => <circle key={x} className={styles.dot} cx={x} cy={12} r={2.2} style={{ "--index": index } as CSSProperties} />)}</g>;
  if (variant === "bars") return <g className={styles.bars} data-still={still || undefined}>{[[4, 12], [10.5, 16], [17, 12]].map(([x, h], index) => <rect key={x} className={styles.bar} x={x} y={12 - h! / 2} width={3} height={h} rx={1.5} style={{ "--index": index } as CSSProperties} />)}</g>;
  if (variant === "ring") return <circle className={styles.ring} data-still={still || undefined} cx={12} cy={12} r={8} pathLength={100} strokeDasharray="62 38" fill="none" />;
  return <rect className={styles.square} data-still={still || undefined} x={6} y={6} width={12} height={12} rx={2.5} fill="none" />;
}

/** Satır içine sığan küçük yükleniyor işareti. İş bitince aynı yerde onay ya da çarpıya dönüşür. Yüzdesi bilinen iş için `progress` kullanılır. */
export function MorphLoader({ variant = "ring", state = "loading", size = 16, labels, decorative = false, className }: MorphLoaderProps) {
  const reduced = useReducedMotion();
  const text = { ...defaultLabels, ...labels }[state];
  // Küçük boyutta çizgi biraz kalın olur ki simge çizgileriyle uyuşsun.
  const stroke = size <= 20 ? 2.4 : 1.8;
  const result = state === "success" ? "M5.5 12.5 10 17l8.5-9.5" : "M7 7l10 10M17 7 7 17";
  const fade = { duration: reduced ? motionTokens.duration.instant : motionTokens.duration.fast };
  return (
    <span
      className={`${styles.root} ${className ?? ""}`}
      style={{ width: size, height: size }}
      data-state={state}
      role={decorative ? undefined : "status"}
      aria-hidden={decorative || undefined}
    >
      {!decorative && <span className={styles.srOnly}>{text}</span>}
      <svg className={styles.svg} viewBox="0 0 24 24" aria-hidden="true" focusable="false" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        <AnimatePresence mode="wait" initial={false}>
          {state === "loading"
            ? <motion.g key={`loading-${variant}`} initial={{ opacity: 0, scale: reduced ? 1 : .7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: fade }} transition={reduced ? fade : motionTokens.spring.snappy} style={{ transformOrigin: "12px 12px" }}>
              <LoadingGlyph variant={variant} still={!!reduced} />
            </motion.g>
            : <motion.path key={state} className={styles.result} d={result} fill="none" initial={{ pathLength: reduced ? 1 : 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ opacity: 0, transition: fade }} transition={reduced ? fade : { pathLength: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }, opacity: { duration: motionTokens.duration.instant } }} />}
        </AnimatePresence>
      </svg>
    </span>
  );
}

export default MorphLoader;
