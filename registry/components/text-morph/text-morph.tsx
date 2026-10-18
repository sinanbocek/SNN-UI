"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./text-morph.module.css";

/**
 * Kısa bir etiketi yerinde bir sonrakine dönüştürür. İki yazıda ortak harfler yeni konumlarına süzülür, yeni harfler netleşerek gelir, kalkan harfler bulanıp kaybolur;
 * genişlik yay ile izler, böylece çevre yerleşim sıçramak yerine süzülür. Birkaç harfi değişen durum sözcükleri için kullanın,
 * örneğin Yayınla, Yayınlanıyor, Yayınlandı ya da Takip et, Takiptesin. Tek satırda kalır; yardımcı teknolojiler düz metni okur.
 */
export interface TextMorphProps { children: string; as?: "span" | "div" | "p" | "strong" | "h1" | "h2" | "h3" | undefined; className?: string | undefined; id?: string | undefined }

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const blurred = `blur(${motionTokens.blur.soft}px)`;
/** Ayrılan harflerin, yerlerine ilk yeni harf netleşmeden önce silinmeye başlamasını sağlar. */
const HANDOFF = .05;
/** Harfler karakter ve sıraya göre eşleşir; bir yazıdaki ikinci "i", sonrakindeki ikinci "i" ile eşlenir. */
function toGlyphs(text: string) {
  const seen = new Map<string, number>();
  return Array.from(text).map(char => { const count = seen.get(char) ?? 0; seen.set(char, count + 1); return { char, key: `${char}-${count}` }; });
}
const measure = (element: HTMLElement) => parseFloat(getComputedStyle(element).width);

export function TextMorph({ children, as = "span", className, id }: TextMorphProps) {
  const Tag = as;
  const reduced = useReducedMotion();
  const frame = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLSpanElement>(null);
  const width = useRef(0);
  const sizing = useRef<AnimationPlaybackControls | null>(null);
  const glyphs = useMemo(() => toGlyphs(children), [children]);
  // Önceki etiket hangi harflerin yeni olduğunu söyler; yalnız onlar, sözcükte nerede olurlarsa olsunlar, okuma sırasıyla kademelenir.
  const [labels, setLabels] = useState({ current: children, previous: children });
  if (labels.current !== children) setLabels({ current: children, previous: labels.current });
  const kept = useMemo(() => new Set(toGlyphs(labels.previous).map(glyph => glyph.key)), [labels.previous]);
  let entering = 0;

  // Çerçeve açık bir genişlik tutar, yeni etiket onu hiç sıçratmaz; yay ardından yeni harfleri yerinde olan izi takip eder.
  useLayoutEffect(() => {
    const frameElement = frame.current, trackElement = track.current;
    if (!frameElement || !trackElement) return;
    const next = measure(trackElement);
    if (!Number.isFinite(next)) return;
    if (width.current && Math.abs(next - width.current) > .5 && !reduced) sizing.current = animate(frameElement, { width: next }, motionTokens.spring.morph);
    else { sizing.current?.stop(); frameElement.style.width = `${next}px`; }
    width.current = next;
  }, [children, reduced]);
  // Yazı tipi yüklenmesi ya da duyarlı yazı boyutu, yeni etiket olmadan genişliği değiştirir: hemen izle.
  useEffect(() => {
    const frameElement = frame.current, trackElement = track.current;
    if (!frameElement || !trackElement || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = measure(trackElement);
      if (!Number.isFinite(next) || Math.abs(next - width.current) < .5) return;
      sizing.current?.stop(); frameElement.style.width = `${next}px`; width.current = next;
    });
    observer.observe(trackElement);
    return () => observer.disconnect();
  }, []);

  return <Tag id={id} className={className}>
    <span className={styles.srOnly}>{children}</span>
    <span ref={frame} className={styles.frame} aria-hidden="true"><span ref={track} className={styles.track}>
      <AnimatePresence mode="popLayout" initial={false}>
        {glyphs.map(({ char, key }) => { const order = kept.has(key) ? 0 : entering++; return <motion.span key={key} layout="position" className={styles.glyph}
          initial={reduced ? false : { opacity: 0, scale: .8, y: "0.14em", filter: blurred }}
          animate={{ opacity: 1, scale: 1, y: "0em", filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: .86, y: "-0.1em", filter: blurred, transition: { duration: motionTokens.duration.exit, ease: standard } }}
          transition={reduced ? { duration: 0 } : { layout: motionTokens.spring.morph, default: { duration: motionTokens.duration.standard + .04, ease: enter, delay: HANDOFF + Math.min(order, 8) * motionTokens.stagger.char * 2 } }}>
          {char === " " ? "\u00a0" : char}
        </motion.span>; })}
      </AnimatePresence>
    </span></span>
  </Tag>;
}

export default TextMorph;
