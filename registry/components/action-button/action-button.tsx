"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./action-button.module.css";

export interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"> {
  label: string;
  successLabel?: string;
  pendingLabel?: string;
  onAction: () => void | Promise<void>;
  resetAfterMs?: number;
  onActionError?: (error: unknown) => void;
}

const pressVariants: Variants = {
  pressed: (button: RefObject<HTMLButtonElement | null>) => ({ scale: (button.current?.offsetWidth ?? 0) > 220 ? .985 : .97, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }),
};
const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
const glyphIn: TargetAndTransition = { opacity: 0, y: 5, filter: `blur(${motionTokens.blur.soft}px)` };
const glyphOut: TargetAndTransition = { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
/** Ok, eylemin yönünde çıkar; düğme sıfırlanınca arkadan geri döner. */
const arrowIn: TargetAndTransition = { opacity: 0, x: -6, filter: `blur(${motionTokens.blur.subtle}px)` };
const arrowOut: TargetAndTransition = { opacity: 0, x: 8, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
const iconRest: TargetAndTransition = { ...rest, x: 0 };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };
/** Ölçek yayla gider; saydamlık ve bulanıklık ara değerle gider, böylece bulanıklık sıfırın altına taşmaz. */
const iconEnter = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }, filter: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } as const;

/** Yazı değişince sarmalayıcıyı içeriğin doğal genişliğine yaylandırır; yeni yazı düzeni sıçratmaz.
 *  Diğer boyut değişiklikleri (geç yüklenen yazı tipi, üst öğenin yeniden akışı) doğrudan yeni genişliğe atlar; ilk boyamada titreme olmaz. */
function useMorphWidth(content: RefObject<HTMLElement | null>, key: string, reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto");
  const lastKey = useRef(key), armedUntil = useRef(0);
  useLayoutEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    armedUntil.current = performance.now() + 700;
  }, [key]);
  useEffect(() => {
    const node = content.current, slot = node?.parentElement;
    if (!node || !slot || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.contentRect.width;
      if (!next || !measured || reduced || performance.now() > armedUntil.current) { measured = next > 0; width.jump(next || "auto"); delete slot.dataset.morphing; return; }
      slot.dataset.morphing = "";
      animate(width, next, { ...motionTokens.spring.morph, onComplete: () => { delete slot.dataset.morphing; } });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [content, reduced, width]);
  return width;
}

/** Başarı tiki kısa çizgisinden başlayıp kendini çizer, tıpkı elle yazılır gibi. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return <svg className={styles.statusIcon} width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <motion.path d="M4 12l5 5L20 6" initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay: .05 }, opacity: { duration: .05, delay: .05 } }} />
  </svg>;
}

type Glyph = { id: string; char: string; order: number };
const toGlyphs = (chars: string[], seq: number): Glyph[] => chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }));

/** Ortak baş ve son harfler kimliğini korur; yalnız değişen yazı parçası yenilenir. */
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

/** Bir yazıyı ötekine dönüştürür: kalan harfler yerine süzülür, yeniler yumuşak bir bulanıklıktan yükselir, genişlik yayla izler. */
function MorphText({ text, reduced }: { text: string; reduced: boolean }) {
  const glyphs = useGlyphs(text);
  const rowRef = useRef<HTMLSpanElement>(null);
  const width = useMorphWidth(rowRef, text, reduced);
  return <motion.span className={styles.morph} style={{ width }} aria-hidden="true">
    <span ref={rowRef} className={styles.glyphs}>
      <AnimatePresence mode="popLayout" initial={false}>
        {glyphs.map(glyph => <motion.span key={glyph.id} className={styles.glyph} layout={reduced ? false : "position"} layoutDependency={text} initial={reduced ? fadeIn : glyphIn} animate={rest} exit={reduced ? fadeOut : glyphOut} transition={reduced ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay: Math.min(glyph.order * motionTokens.stagger.char, .1), layout: motionTokens.spring.morph }}>{glyph.char}</motion.span>)}
      </AnimatePresence>
    </span>
  </motion.span>;
}

export function ActionButton({ label, successLabel = "Kaydedildi", pendingLabel = "Kaydediliyor", onAction, resetAfterMs = 2400, onActionError, className, disabled, ...props }: ActionButtonProps) {
  const [state, setState] = useState<"idle" | "pending" | "success">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const text = state === "pending" ? pendingLabel : state === "success" ? successLabel : label;

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  async function run() {
    if (state === "pending") return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setState("pending");
    try {
      await onAction();
      setState("success");
      if (resetAfterMs > 0) resetTimer.current = setTimeout(() => setState("idle"), resetAfterMs);
    } catch (error) {
      setState("idle");
      onActionError?.(error);
    }
  }

  const pending = state === "pending";
  const arrow = state === "idle";

  // Bekleme sırasında düğme odaklanabilir kalır (disabled yerine aria-disabled); klavye kullanan kayıt boyunca odağını yitirmez.
  return <motion.button {...props} ref={buttonRef} tabIndex={props.tabIndex ?? 0} type={props.type ?? "button"} className={[styles.button, className].filter(Boolean).join(" ")} disabled={disabled} aria-disabled={pending ? true : props["aria-disabled"]} aria-busy={pending} data-state={state} onClick={run} custom={buttonRef} variants={pressVariants} whileTap={reduceMotion || disabled || pending ? undefined : "pressed"} transition={motionTokens.spring.snappy}>
    <span className={styles.content} aria-hidden="true">
      <MorphText text={text} reduced={reduceMotion} />
      <span className={styles.iconSlot}><AnimatePresence initial={false}><motion.span key={state} className={styles.phase} initial={reduceMotion ? fadeIn : arrow ? arrowIn : iconIn} animate={iconRest} exit={reduceMotion ? fadeOut : arrow ? arrowOut : iconOut} transition={reduceMotion ? { duration: motionTokens.duration.instant } : iconEnter}>{pending ? <span className={styles.spinner} /> : state === "success" ? <DrawnCheck reduced={reduceMotion} /> : <ArrowRight className={styles.arrow} width={17} height={17} />}</motion.span></AnimatePresence></span>
    </span>
    <span className={styles.visuallyHidden}>{label}</span>
    <span className={styles.visuallyHidden} role="status">{state === "pending" ? pendingLabel : state === "success" ? successLabel : ""}</span>
  </motion.button>;
}

export default ActionButton;
