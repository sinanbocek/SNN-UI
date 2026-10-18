"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useReducedMotion, useTransform, useVelocity } from "motion/react";
import { text as abacusText } from "@snn/abacus-core";
import { formatNumber, roundTo } from "../lib/chart-format";
import styles from "./slot-text.module.css";

/**
 * Yeni değerine kumar makinesi makaraları gibi dönen metin ve sayılar. Her karakter bir makaradır; rakamlar sayının gittiği
 * yönde çarkta sayar, harfler alfabede karışır, makaralar soldan sağa birer birer, yumuşak ve aşmayan bir inişle durur.
 * Fiyat, istatistik ve bir değişimin bir vuruşu hak ettiği lansman anları için kullanın.
 */
export interface SlotTextProps {
  /** Gösterilecek değer. Sayılar `format`tan geçer; metinler olduğu gibi çizilir. */
  value: string | number;
  /** Sayı değerini biçimler. Varsayılan ABACUS biçimidir: 12480 → "12.480", 1234.5 → "1.234,5". */
  format?: ((value: number) => string) | undefined;
  /** İlk makaranın dönme süresi (saniye). Sonraki makaralar kademe ekler. */
  duration?: number | undefined;
  /** Makaraların soldan sağa durması arasındaki süre (saniye). */
  stagger?: number | undefined;
  /** Bir rakamın inmeden önce yaptığı ek tam tur. 0, doğrudan yeni rakama yuvarlanır. */
  spins?: number | undefined;
  /** Uzunluk değişince makaraların hangi uçtan eşleştirileceği. Sayılarda varsayılan sondur; 999 → 1.000 solda büyür. */
  align?: "start" | "end" | undefined;
  /** Yeni değerleri ekran okuyuculara nazikçe duyurur. */
  announce?: boolean | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

const DIGITS = "0123456789";
/** Türk alfabesi (ç, ğ, ı, ö, ş, ü dahil) ve büyük harfleri ABACUS `text.upper` ile (i → İ, ı → I). */
const LOWER = "abcçdefgğhıijklmnoöpqrsştuüvwxyz";
const UPPER = [...LOWER].map(char => abacusText.upper(char)).join("");
/** Hızlı çıkış, uzun yumuşak iniş; hedefi hiç aşmaz. */
const LANDING = [.12, .8, .16, 1] as const;
const subscribe = () => () => {};
/** Hücre aralığı (em). Stil dosyasındaki .cell ile aynı tutulmalı. */
const CELL = 1.6;

function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

const classOf = (char: string) => DIGITS.includes(char) ? DIGITS : LOWER.includes(char) ? LOWER : UPPER.includes(char) ? UPPER : null;

/** Belirlenimli karıştırma; aynı değişim her zaman aynı harfleri döndürür. */
function seeded(seed: number) {
  let state = seed >>> 0 || 1;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

/** Makaranın hücreleri; şu an görünenden hedefe. */
function buildStrip(from: string, to: string, spins: number, rising: boolean, seed: number) {
  if (from === to) return [to];
  const set = classOf(to);
  if (!set) return [from, to];
  if (set === DIGITS && classOf(from) === DIGITS) {
    const a = Number(from), b = Number(to);
    const steps = spins * 10 + (rising ? (b - a + 10) % 10 : (a - b + 10) % 10);
    return Array.from({ length: steps + 1 }, (_, i) => String((a + (rising ? i : -i) + 100) % 10));
  }
  const random = seeded(seed);
  const fillers = Array.from({ length: Math.max(2, spins * 5 + 2) }, () => set[Math.floor(random() * set.length)]);
  return [from, ...fillers, to];
}

interface ReelProps {
  char: string;
  order: number;
  entering: boolean;
  rising: boolean;
  duration: number;
  stagger: number;
  spins: number;
  reduced: boolean;
}

function Reel({ char, order, entering, rising, duration, stagger, spins, reduced }: ReelProps) {
  const pos = useMotionValue(0);
  const width = useMotionValue<number | "auto">("auto");
  const sizer = useRef<HTMLSpanElement>(null);
  const [isPresent, safeToRemove] = usePresence();
  const [reel, setReel] = useState(() => ({
    char,
    strip: entering && !reduced ? buildStrip("", char, spins, rising, char.charCodeAt(0) + order) : [char],
    from: 0,
    grow: entering,
    time: duration + order * stagger,
  }));

  // Yeni hedef makarayı şu an ekranda olan hücreden, hücre içi kaymasını koruyarak yeniden başlatır; hiçbir şey sıçramaz.
  if (reel.char !== char) {
    const current = pos.get();
    const index = Math.max(0, Math.min(reel.strip.length - 1, Math.round(current)));
    const visible = reel.strip[index]!;
    setReel({
      char,
      strip: reduced ? [char] : buildStrip(visible, char, spins, rising, char.charCodeAt(0) * 31 + visible.charCodeAt(0) * 7 + order + reel.strip.length),
      from: reduced ? 0 : current - index,
      grow: false,
      time: duration + order * stagger,
    });
  }

  const blur = useTransform(useVelocity(pos), velocity => {
    const amount = Math.min(Math.abs(velocity) * .05, 2.4);
    return amount < .15 ? "none" : `blur(${roundTo(amount, 2)}px)`;
  });
  // Hücreler satırdan uzundur; inmiş harfin komşuları pencerenin tamamen dışında kalır.
  const y = useTransform(pos, value => `translate3d(0, ${roundTo(-value * CELL, 4)}em, 0)`);

  useLayoutEffect(() => {
    const measured = sizer.current?.getBoundingClientRect().width ?? 0;
    const last = reel.strip.length - 1;
    if (reduced) {
      pos.jump(last);
      width.jump(measured);
      return;
    }
    pos.jump(reel.from);
    const spin = animate(pos, last, { duration: last === 0 ? .2 : reel.time, ease: [...LANDING] });
    if (reel.grow) width.jump(0);
    if (width.get() === "auto") { width.jump(measured); return () => spin.stop(); }
    const size = animate(width, measured, { type: "spring", visualDuration: Math.min(reel.time, .6), bounce: 0 });
    return () => { spin.stop(); size.stop(); };
  }, [reel, pos, width, reduced]);

  useLayoutEffect(() => {
    if (isPresent) return;
    if (reduced) { safeToRemove(); return; }
    const exit = animate(width, 0, { type: "spring", visualDuration: .35, bounce: 0, onComplete: safeToRemove });
    return () => exit.stop();
  }, [isPresent, safeToRemove, width, reduced]);

  return <motion.span className={styles.slot} style={{ width }} data-exiting={isPresent ? undefined : ""}>
    <span ref={sizer} className={styles.sizer}>{char === " " ? "\u00a0" : char}</span>
    <span className={styles.window}>
      <motion.span className={styles.strip} style={{ transform: y, filter: blur }}>
        {reel.strip.map((cell, i) => <span key={i} className={styles.cell}>{cell === " " ? "\u00a0" : cell}</span>)}
      </motion.span>
    </span>
  </motion.span>;
}

export function SlotText({ value, format, duration = .9, stagger = .07, spins = 1, align, announce = false, className, style }: SlotTextProps) {
  const reduced = useReducedFlag();
  const text = typeof value === "number" ? (format ? format(value) : formatNumber(value, 3)) : value;
  const fromEnd = (align ?? (typeof value === "number" ? "end" : "start")) === "end";
  const chars = Array.from(text);
  // Baştaki simge dizisi (para simgesi, artı) baştan anahtarlanır ve hiç rakama dönmez; kalanı hizalanan uçtan
  // anahtarlanır; sayı büyüyünce ayraçlar ve ekler kendi makaralarında kalır.
  const lead = fromEnd ? chars.findIndex(char => /[\p{L}\p{N}]/u.test(char)) : 0;
  const prefix = lead < 0 ? chars.length : lead;
  const keyOf = (i: number) => i < prefix ? `p${i}` : fromEnd ? `e${chars.length - 1 - i}` : `s${i}`;
  const [initialKeys] = useState(() => new Set(chars.map((_, i) => keyOf(i))));
  const [trend, setTrend] = useState({ value, rising: true });
  if (trend.value !== value) {
    setTrend({ value, rising: typeof value === "number" && typeof trend.value === "number" ? value >= trend.value : true });
  }

  return <span className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
    <span className={styles.srOnly} aria-live={announce ? "polite" : undefined}>{text}</span>
    <span className={styles.reels} aria-hidden="true">
      <AnimatePresence initial={false}>
        {chars.map((char, i) => <Reel
          key={keyOf(i)}
          char={char}
          order={i}
          entering={!initialKeys.has(keyOf(i))}
          rising={trend.rising}
          duration={duration}
          stagger={stagger}
          spins={spins}
          reduced={reduced}
        />)}
      </AnimatePresence>
    </span>
  </span>;
}

export default SlotText;
