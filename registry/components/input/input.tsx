"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string | undefined;
  error?: string | undefined;
}

/* Sayı büyüyünce rakamlar yukarı, küçülünce aşağı döner;`custom` son yönü zaten çıkmakta olan rakamlara iletir. */
const digit = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.6}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.6}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
};
const isNumber = (word: string) => /^\d[\d.,/:]*%?$/.test(word);

/** Metindeki bir sayı, örneğin "12 characters", yalnız değişen rakamları döndürür; kazanılan ya da yitirilen rakam genişliğini açar ya da kapatır. */
function RollingNumber({ word }: { word: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState({ word, direction: 1 });
  if (shown.word !== word) setShown({ word, direction: parseFloat(word.replace(/,/g, "")) < parseFloat(shown.word.replace(/,/g, "")) ? -1 : 1 });
  const characters = word.split("");
  const transition = reduced ? { duration: 0 } : { y: motionTokens.spring.snappy, width: motionTokens.spring.morph, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } };
  return <AnimatePresence initial={false}>{characters.map((character, index) => <motion.span key={characters.length - index} className={styles.column} initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={transition}>
    <AnimatePresence initial={false} mode="popLayout" custom={shown.direction}><motion.span key={character} custom={shown.direction} variants={digit} initial="enter" animate="center" exit="exit" transition={transition}>{character}</motion.span></AnimatePresence>
  </motion.span>)}</AnimatePresence>;
}

/** Değişen kelimeler yükselir ve netleşir, değişmeyenler yerinde durur, sayılar döner. Yardımcı teknoloji düz metni okur. */
function MotionText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const words = text.split(" ");
  return <><span className={styles.srOnly}>{text}</span><span className={styles.words} aria-hidden="true"><AnimatePresence initial={false} mode="popLayout">{words.map((word, index) => <motion.span key={`${index}:${isNumber(word) ? "#" : word}`} className={styles.word}
    initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.35em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.exit, ease: [...motionTokens.ease.standard] } }}
    transition={reduced ? { duration: motionTokens.duration.instant } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{isNumber(word) ? <RollingNumber word={word} /> : word}{index < words.length - 1 ? " " : null}</motion.span>)}</AnimatePresence></span></>;
}

/** Yardım ve hata metni: satır yüksekliğini yayla açar, sonra kelimeler yerleşir. */
function FieldMessage({ id, text, className, alert }: { id?: string | undefined; text?: string | undefined; className?: string | undefined; alert?: boolean | undefined }) {
  return <AnimatePresence initial={false}>{text ? <MessageRow key="message" id={id} text={text} className={className} alert={alert} /> : null}</AnimatePresence>;
}

/** Satır ölçülen metni izler; satır atlayan uzun bir ileti, birden değişmek yerine sonraki satırını açar. */
function MessageRow({ id, text, className, alert }: { id?: string | undefined; text: string; className?: string | undefined; alert?: boolean | undefined }) {
  const reduced = useReducedMotion();
  const copyRef = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useEffect(() => {
    const node = copyRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setHeight(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight); });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  // Azaltılmış harekette satır tam yükseklikte bağlanır: sıfır süreli bir açılış yine de kapalı bir kare çizerdi. Presence
  // initial={false} ile başlar; böylece hidrasyonda var olan satırlar sunucuda da istemcide de aynı çizilir.
  return <motion.span className={styles.messageSlot} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height, opacity: 1 }} exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant } } }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
    <motion.span ref={copyRef} id={id} className={className} role={alert ? "alert" : undefined} initial={reduced ? false : { y: "0.35em", filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ y: 0, filter: "blur(0px)" }} transition={{ duration: reduced ? 0 : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}><MotionText text={text} /></motion.span>
  </motion.span>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, description, error, id, className, ...props }, ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;
  return <div className={styles.field}>
    <label className={styles.label} htmlFor={controlId}>{label}</label>
    <input {...props} id={controlId} ref={ref} className={[styles.input, className].filter(Boolean).join(" ")} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={describedBy}/>
    <FieldMessage id={hintId} text={description} className={styles.description} />
    <FieldMessage id={errorId} text={error} className={styles.error} alert />
  </div>;
});

Input.displayName = "Input";
