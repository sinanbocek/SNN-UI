"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";
import { CircleAlert, Copy } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { useCopyFeedback } from "../lib/use-copy-feedback";
import styles from "./copy-button.module.css";

export interface CopyButtonProps {
  value: string;
  label?: string | undefined;
  className?: string | undefined;
  iconOnly?: boolean | undefined;
  variant?: "outline" | "plain" | undefined;
  disabled?: boolean | undefined;
  onCopied?: (() => void) | undefined;
}

/** Kopyalama geri bildirimi bilerek aceleci değildir: yavaş, neredeyse kritik sönümlü yay ve uzun, yumuşak geçişler sakin okunur, hiç telaşlı durmaz.
 *  Onay boşta durumuna dönerken aynı hareket tersine oynar; hiçbir şey sert kırılmaz. */
const settle = { type: "spring", visualDuration: .5, bounce: .06 } as const;
const enter = { duration: .36, ease: [...motionTokens.ease.enter] } as const;
const leave = { duration: .2, ease: [...motionTokens.ease.standard] } as const;
const instant = { duration: motionTokens.duration.instant } as const;
const soft = `blur(${motionTokens.blur.soft}px)`;
const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: instant };
/** Simgeler tek yumuşak nefeste yer değiştirir: eski simge bulanıklığa küçülürken yenisi yavaş yayla ondan büyür. */
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: soft };
const iconOut: TargetAndTransition = { opacity: 0, scale: .6, filter: soft, transition: { duration: .24, ease: [...motionTokens.ease.standard] } };
const iconEnter: Transition = { scale: settle, opacity: { ...enter, delay: .03 }, filter: { ...enter, delay: .03 } };
/** Harfler yumuşak bir bulanıklıktan yaklaşık .3em yükselir; çıkanlar biraz daha hızlı kalkar. */
const glyphIn: TargetAndTransition = { opacity: 0, y: 4, filter: soft };
const glyphOut: TargetAndTransition = { opacity: 0, y: -3, filter: soft, transition: leave };

/** Başarı işareti kısa vuruşundan kendini çizer, elle yazılır gibi: hızlı başlar, simge otururken yerine yavaşlar. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <motion.path d="M4 12l5 5L20 6" initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: .5, ease: [...motionTokens.ease.standard], delay: .05 }, opacity: { duration: .01, delay: .05 } }} />
  </svg>;
}

type Glyph = { id: string; char: string; order: number };
const toGlyphs = (chars: string[], seq: number): Glyph[] => chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }));

/** Ortak baş ve son karakterler kimliğini korur; böylece yazı değişirken yalnız değişen harfler yenilenir. */
function useGlyphs(text: string) {
  const [state, setState] = useState(() => ({ text, seq: 0, glyphs: toGlyphs([...text], 0) }));
  if (state.text === text) return state.glyphs;
  const prev = [...state.text], next = [...text];
  let start = 0, end = 0;
  while (start < prev.length && start < next.length && prev[start] === next[start]) start++;
  while (end < prev.length - start && end < next.length - start && prev[prev.length - 1 - end] === next[next.length - 1 - end]) end++;
  if (start < 2) start = 0;
  if (end < 2) end = 0;
  const seq = state.seq + 1;
  const glyphs = [...state.glyphs.slice(0, start), ...toGlyphs(next.slice(start, next.length - end), seq), ...state.glyphs.slice(state.glyphs.length - end)];
  setState({ text, seq, glyphs });
  return glyphs;
}

/**
 * Etiket hücresi en geniş durumunu zaten ayırır; satır yerinde kalır, yalnız harfler oynar. Bir yerleşim köküdür:
 * harfler kaymalarını yalnız etiketin içinde ölçer. Düğmenin kendisi hareket ederse (sayfa girerken, panel
 * kayarken, liste yeniden dizilirken) harfler düğmenin eski yerinden uçarak gelmez, onunla birlikte gider.
 */
function MorphText({ text, reduced }: { text: string; reduced: boolean }) {
  const glyphs = useGlyphs(text);
  return <motion.span className={styles.glyphs} layoutRoot>
    <AnimatePresence mode="popLayout" initial={false}>
      {glyphs.map(glyph => <motion.span key={glyph.id} className={styles.glyph} layout={reduced ? false : "position"} layoutDependency={text} initial={reduced ? fadeIn : glyphIn} animate={rest} exit={reduced ? fadeOut : glyphOut} transition={reduced ? instant : { ...enter, delay: Math.min(glyph.order * .02, .12), layout: settle }}>{glyph.char}</motion.span>)}
    </AnimatePresence>
  </motion.span>;
}

export function CopyButton({ value, label = "Kopyala", className, iconOnly = false, variant = "outline", disabled, onCopied }: CopyButtonProps) {
  const { state, copy } = useCopyFeedback();
  const reduced = useReducedMotion() ?? false;
  const text = state === "copied" ? "Kopyalandı" : state === "error" ? "Başarısız" : label;

  async function handleCopy() {
    if (await copy(value)) onCopied?.();
  }

  return <><button
    type="button"
    className={[styles.button, iconOnly && styles.iconOnly, variant === "plain" && styles.plain, className].filter(Boolean).join(" ")}
    onClick={() => void handleCopy()}
    aria-label={label}
    data-copy-state={state}
    disabled={disabled}
  >
    <span className={styles.icon} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.span key={state} className={styles.iconInner} data-state={state} initial={reduced ? fadeIn : iconIn} animate={rest} exit={reduced ? fadeOut : iconOut} transition={reduced ? instant : iconEnter}>
          {state === "copied" ? <DrawnCheck reduced={reduced} /> : state === "error" ? <CircleAlert size={16} strokeWidth={1.75} /> : <Copy size={16} strokeWidth={1.75} />}
        </motion.span>
      </AnimatePresence>
    </span>
    {!iconOnly && <span className={styles.label} aria-hidden="true">
      <span className={styles.measure}>{label}</span><span className={styles.measure}>Kopyalandı</span><span className={styles.measure}>Başarısız</span>
      <MorphText text={text} reduced={reduced} />
    </span>}
  </button><span className={styles.srOnly} role="status" aria-live="polite">{state === "idle" ? "" : state === "error" ? `${label}: Kopyalanamadı` : `${label}: Kopyalandı`}</span></>;
}
