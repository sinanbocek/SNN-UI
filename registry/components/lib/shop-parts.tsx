"use client";

import { useCallback, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { countText } from "./shop-format";
import styles from "./shop-parts.module.css";

/** Görsel yer tutucu: düz renk yüzey ve küçük bir çizim. Gerçek fotoğraf yerine geçer; `label` ekran okuyucu için alt metindir. */
export function Placeholder({ tone = 0, label, ratio = "4 / 5", className, children }: { tone?: number; label: string; ratio?: string; className?: string; children?: ReactNode }) {
  return <div className={[styles.placeholder, className].filter(Boolean).join(" ")} data-tone={Math.abs(tone) % 6} role="img" aria-label={label} style={{ aspectRatio: ratio }}>
    {children ?? <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="6" y="9" width="36" height="30" rx="4" /><circle cx="17" cy="20" r="3.5" /><path d="M6 34l10-9 8 7 6-5 12 9" /></svg>}
  </div>;
}

export interface SwatchOption { value: string; label: string; /** Örneğin rengi (CSS rengi); uygulamanın verisidir. */ color: string; disabled?: boolean }

/**
 * Renk örnekleri. `mode="multi"`: her örnek açma-kapama düğmesidir (`aria-pressed`, süzgeç için).
 * `mode="single"`: radyo grubu, gezen odak ve ok tuşları (ürün sayfası seçimi için).
 */
export function SwatchGroup({ label, options, value, onToggle, mode = "multi" }: { label: string; options: SwatchOption[]; value: string[]; onToggle: (value: string) => void; mode?: "multi" | "single" }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkedAt = Math.max(0, options.findIndex(option => value.includes(option.value)));
  const move = (event: KeyboardEvent, at: number) => {
    if (mode !== "single") return;
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (at + step + options.length) % options.length;
    refs.current[next]?.focus();
    onToggle(options[next]!.value);
  };
  return <div className={styles.swatches} role={mode === "single" ? "radiogroup" : "group"} aria-label={label}>
    {options.map((option, at) => {
      const on = value.includes(option.value);
      const common = { type: "button" as const, className: styles.swatch, style: { "--swatch": option.color } as CSSProperties, disabled: option.disabled, "aria-label": option.label, title: option.label, onClick: () => onToggle(option.value), onKeyDown: (event: KeyboardEvent) => move(event, at), ref: (node: HTMLButtonElement | null) => { refs.current[at] = node; } };
      return mode === "single"
        ? <button key={option.value} {...common} role="radio" aria-checked={on} tabIndex={at === checkedAt ? 0 : -1} />
        : <button key={option.value} {...common} aria-pressed={on} />;
    })}
  </div>;
}

/** Üst sınırı olan adet düzenleyici. `removeAtMin`: en küçük değerde eksi düğmesi "Kaldır" olur ve `onRemove` çağrılır. */
export function NumberStepper({ label, value, min = 1, max = 99, onChange, onRemove, removeLabel = "Kaldır" }: { label: string; value: number; min?: number; max?: number; onChange: (value: number) => void; onRemove?: () => void; removeLabel?: string }) {
  const atMin = value <= min;
  const minusLabel = atMin && onRemove ? `${label}: ${removeLabel}` : `${label}: azalt`;
  return <div className={styles.stepper} role="group" aria-label={label}>
    <button type="button" aria-label={minusLabel} disabled={atMin && !onRemove} onClick={() => atMin ? onRemove?.() : onChange(value - 1)}>{atMin && onRemove ? "✕" : "−"}</button>
    <output aria-live="off">{countText(value)}</output>
    <button type="button" aria-label={`${label}: artır`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
  </div>;
}

/** Kibar canlı bölge: `announce` metni yazar. Aynı metin art arda gelirse ekran okuyucu yine okusun diye sonuna görünmez ayraç eklenir. */
export function useAnnouncer(): [ReactNode, (message: string) => void] {
  const [message, setMessage] = useState("");
  const toggle = useRef(false);
  const announce = useCallback((next: string) => { toggle.current = !toggle.current; setMessage(toggle.current ? next : `${next} `); }, []);
  return [<div key="live" className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{message}</div>, announce];
}

export const srOnly = styles.srOnly;
