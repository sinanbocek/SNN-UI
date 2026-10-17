"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { generatePassword, type PasswordCharset } from "./password-strength-format";
import styles from "./password-strength.module.css";

/** Üretici metinleri. Hepsinin Türkçe varsayılanı var. */
export interface PasswordGeneratorMessages {
  open: string;
  close: string;
  length: string;
  regenerate: string;
  copy: string;
  copied: string;
  copyFailed: string;
  sets: Record<PasswordCharset, string>;
  setsLabel: string;
  note: string;
}

export const defaultPasswordGeneratorMessages: PasswordGeneratorMessages = {
  open: "Parola üret",
  close: "Üreticiyi kapat",
  length: "Uzunluk",
  regenerate: "Yeniden üret",
  copy: "Kopyala",
  copied: "Kopyalandı",
  copyFailed: "Kopyalanamadı",
  sets: { lower: "Küçük harf", upper: "Büyük harf", digits: "Rakam", symbols: "Simge" },
  setsLabel: "Kullanılacak karakterler",
  note: "Parola bu cihazda üretilir, hiçbir yere gönderilmez.",
};

const SET_ORDER: PasswordCharset[] = ["lower", "upper", "digits", "symbols"];
const SAMPLE: Record<PasswordCharset, string> = { lower: "abc", upper: "ABC", digits: "123", symbols: "#$&" };

export interface PasswordGeneratorProps {
  /** Üretilen parolayı alana yazar. */
  onGenerate: (password: string) => void;
  /** Alandaki güncel değer; kopyalama bunu kopyalar. */
  value: string;
  messages: PasswordGeneratorMessages;
  reduced: boolean;
  minLength?: number;
  maxLength?: number;
  defaultLength?: number;
}

/** Parola gücü alanının altındaki üretici: uzunluk sürgüsü, karakter türleri, yeniden üret ve kopyala. Her değişiklik yeni parola üretir. */
export function PasswordGenerator({ onGenerate, value, messages, reduced, minLength = 8, maxLength = 64, defaultLength = 16 }: PasswordGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [length, setLength] = useState(defaultLength);
  const [sets, setSets] = useState<PasswordCharset[]>(SET_ORDER);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const produce = (nextLength = length, nextSets = sets) => { onGenerate(generatePassword({ length: nextLength, sets: nextSets })); setCopyState("idle"); };
  const toggleSet = (set: PasswordCharset) => {
    // Son seçili tür kapatılamaz: en az bir karakter türü kalmalı.
    if (sets.includes(set) && sets.length === 1) return;
    const next = sets.includes(set) ? sets.filter(item => item !== set) : SET_ORDER.filter(item => item === set || sets.includes(item));
    setSets(next); produce(length, next);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopyState("copied"); } catch { setCopyState("error"); }
  };
  const fade = reduced ? { duration: 0 } : motionTokens.spring.smooth;

  return <div className={styles.generator}>
    <button type="button" className={styles.generatorToggle} aria-expanded={open} onClick={() => { const next = !open; setOpen(next); if (next) produce(); }}>
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 4 1.5 3L20 8.5l-3.5 1.5L15 13l-1.5-3L10 8.5l3.5-1.5z" /><path d="M5 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></svg>
      {open ? messages.close : messages.open}
    </button>
    <AnimatePresence initial={false}>
      {open && <motion.div key="panel" className={styles.generatorPanel} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={fade}>
        <div className={styles.generatorInner}>
          <label className={styles.lengthRow}>
            <span>{messages.length}</span>
            <output className={styles.lengthValue}>{length}</output>
            <input type="range" min={minLength} max={maxLength} value={length} onChange={event => { const next = Number(event.target.value); setLength(next); produce(next); }} aria-label={messages.length} />
          </label>
          <fieldset className={styles.sets}>
            <legend className={styles.srOnly}>{messages.setsLabel}</legend>
            {SET_ORDER.map(set => {
              const on = sets.includes(set);
              return <label key={set} className={styles.setChip} data-on={on || undefined}>
                <input type="checkbox" checked={on} onChange={() => toggleSet(set)} disabled={on && sets.length === 1} />
                <span>{messages.sets[set]}</span><span className={styles.setSample} aria-hidden="true">{SAMPLE[set]}</span>
              </label>;
            })}
          </fieldset>
          <div className={styles.generatorActions}>
            <button type="button" className={styles.generatorButton} onClick={() => produce()}>{messages.regenerate}</button>
            <button type="button" className={styles.generatorButton} onClick={copy} disabled={!value}>{copyState === "copied" ? messages.copied : copyState === "error" ? messages.copyFailed : messages.copy}</button>
            <span className={styles.srOnly} role="status">{copyState === "copied" ? messages.copied : copyState === "error" ? messages.copyFailed : ""}</span>
          </div>
          <p className={styles.generatorNote}>{messages.note}</p>
        </div>
      </motion.div>}
    </AnimatePresence>
  </div>;
}
