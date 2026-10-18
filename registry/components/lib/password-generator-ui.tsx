"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { motionTokens } from "./motion-tokens";
import type { PasswordCharset } from "./password-generator";
import styles from "./password-generator-ui.module.css";

/** Üretici metinleri; hepsinin Türkçe varsayılanı var. */
export interface PasswordGeneratorText {
  generate: string;
  generating: string;
  copy: string;
  copied: string;
  copyFailed: string;
  options: string;
  length: string;
  sets: Record<PasswordCharset, string>;
  setsLabel: string;
  create: string;
  note: string;
}

export const defaultPasswordGeneratorText: PasswordGeneratorText = {
  generate: "Parola üret",
  generating: "Parola üretiliyor",
  copy: "Parolayı kopyala",
  copied: "Parola kopyalandı",
  copyFailed: "Kopyalanamadı",
  options: "Parola üretme seçenekleri",
  length: "Uzunluk",
  sets: { lower: "Küçük harf", upper: "Büyük harf", digits: "Rakam", symbols: "Simge" },
  setsLabel: "Kullanılacak karakterler",
  create: "Üret",
  note: "Parola bu cihazda üretilir, hiçbir yere gönderilmez.",
};

/** Göz simgesiyle aynı çizgi kalınlığında, 18 px: büyük ve küçük iki yıldız. Üret düğmesinin simgesi. */
export function GenerateIcon({ spinning = false, reduced = false }: { spinning?: boolean | undefined; reduced?: boolean | undefined }) {
  return <motion.svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    animate={spinning && !reduced ? { rotate: [0, 18, -12, 0] } : { rotate: 0 }} transition={spinning && !reduced ? { duration: .6, ease: [...motionTokens.ease.standard] } : { duration: 0 }}>
    <path d="M10 3.5 11.6 8.4 16.5 10 11.6 11.6 10 16.5 8.4 11.6 3.5 10 8.4 8.4z" />
    <path d="M18 14.5 18.8 16.7 21 17.5 18.8 18.3 18 20.5 17.2 18.3 15 17.5 17.2 16.7z" />
  </motion.svg>;
}

/** Kopyala simgesi; kopyalanınca çizilen bir onay işaretine döner. */
function CopyGlyph({ done, reduced }: { done: boolean; reduced: boolean }) {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <AnimatePresence initial={false} mode="popLayout">
      {done
        ? <motion.path key="check" d="M5 12.5 9.5 17 19 7.5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }} />
        : <motion.g key="copy" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>
            <rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9" />
          </motion.g>}
    </AnimatePresence>
  </svg>;
}

/** Üretim bitince alanda beliren kopyala düğmesi. `className` alanın düğme biçimini taşır (göz düğmesiyle aynı görünsün). */
export function GeneratedCopyButton({ show, value, text, reduced, className }: { show: boolean; value: string; text: PasswordGeneratorText; reduced: boolean; className?: string | undefined }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  useEffect(() => { if (!show) setState("idle"); }, [show]);
  useEffect(() => { if (state === "idle") return; const timer = window.setTimeout(() => setState("idle"), 1600); return () => window.clearTimeout(timer); }, [state]);
  const copy = async () => { try { await navigator.clipboard.writeText(value); setState("copied"); } catch { setState("error"); } };
  return <>
    <AnimatePresence initial={false}>
      {show && <motion.button key="copy" type="button" className={className} onClick={copy} aria-label={state === "copied" ? text.copied : text.copy}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: .6, transition: { duration: motionTokens.duration.fast } }}
        transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>
        <CopyGlyph done={state === "copied"} reduced={reduced} />
      </motion.button>}
    </AnimatePresence>
    <span className={styles.srOnly} role="status">{state === "copied" ? text.copied : state === "error" ? text.copyFailed : ""}</span>
  </>;
}

/**
 * Parolayı soldan sağa harf harf yazar ("akan yazı"). `write` her adımda o ana kadarki metni alır.
 * Hareket azaltılmışsa tek seferde yazar. Kullanıcı yazmaya başlarsa `cancel` ile kesilir.
 */
export function useTypeOut(write: (partial: string) => void, reduced: boolean, stepMs = 32) {
  const timer = useRef<number | null>(null);
  const [typing, setTyping] = useState(false);
  const writeRef = useRef(write);
  useEffect(() => { writeRef.current = write; });
  const cancel = useCallback(() => { if (timer.current !== null) window.clearInterval(timer.current); timer.current = null; setTyping(false); }, []);
  const start = useCallback((full: string) => {
    cancel();
    if (reduced || full.length < 2) { writeRef.current(full); return; }
    let index = 0;
    setTyping(true);
    writeRef.current("");
    timer.current = window.setInterval(() => {
      index += 1;
      writeRef.current(full.slice(0, index));
      if (index >= full.length) cancel();
    }, stepMs);
  }, [cancel, reduced, stepMs]);
  useEffect(() => cancel, [cancel]);
  return { start, cancel, typing };
}

const SET_ORDER: PasswordCharset[] = ["lower", "upper", "digits", "symbols"];
const SAMPLE: Record<PasswordCharset, string> = { lower: "abc", upper: "ABC", digits: "123", symbols: "#$&" };

/** Seçenek paneli: uzunluk ve karakter türleri; "Üret" seçilen ayarla üretir. Parola alanında üret simgesinin altında açılır. */
export function PasswordGeneratorOptions({ id, length, sets, onLengthChange, onSetsChange, onCreate, text, minLength = 8, maxLength = 64 }: {
  id: string; length: number; sets: PasswordCharset[]; onLengthChange: (length: number) => void; onSetsChange: (sets: PasswordCharset[]) => void; onCreate: () => void; text: PasswordGeneratorText; minLength?: number | undefined; maxLength?: number | undefined;
}) {
  const toggle = (set: PasswordCharset) => {
    // Son seçili tür kapatılamaz: en az bir karakter türü kalmalı.
    if (sets.includes(set) && sets.length === 1) return;
    onSetsChange(sets.includes(set) ? sets.filter(item => item !== set) : SET_ORDER.filter(item => item === set || sets.includes(item)));
  };
  return <div id={id} className={styles.panel} role="group" aria-label={text.options}>
    <label className={styles.lengthRow}>
      <span>{text.length}</span>
      <output className={styles.lengthValue}>{length}</output>
      <input type="range" min={minLength} max={maxLength} value={length} onChange={event => onLengthChange(Number(event.target.value))} aria-label={text.length} />
    </label>
    <fieldset className={styles.sets}>
      <legend className={styles.srOnly}>{text.setsLabel}</legend>
      {SET_ORDER.map(set => {
        const on = sets.includes(set);
        return <label key={set} className={styles.chip} data-on={on || undefined}>
          <input type="checkbox" checked={on} onChange={() => toggle(set)} disabled={on && sets.length === 1} />
          <span>{text.sets[set]}</span><span className={styles.sample} aria-hidden="true">{SAMPLE[set]}</span>
        </label>;
      })}
    </fieldset>
    <div className={styles.actions}>
      <button type="button" className={styles.create} onClick={onCreate}><GenerateIcon />{text.create}</button>
      <span className={styles.note}>{text.note}</span>
    </div>
  </div>;
}
