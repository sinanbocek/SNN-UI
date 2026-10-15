"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { motionTokens } from "./motion-tokens";
import { countText } from "./shop-format";
import { useElementWidth, useReducedMotionSafe } from "./viz-utils";
import styles from "./shop-parts.module.css";

/** Görsel yer tutucu: yüzey rengi, ince çapraz doku ve (varsa) baş harf. Gerçek fotoğraf yerine geçer; `label` ekran okuyucu için alt metindir. `initial` verilmezse `label`ın ilk harfi kullanılır; `children` her şeyin yerine geçer. */
export function Placeholder({ tone = 0, label, ratio = "4 / 5", className, children, initial }: { tone?: number; label: string; ratio?: string; className?: string; children?: ReactNode; initial?: string }) {
  const letter = initial ?? Array.from(label.trim())[0] ?? "";
  return <div className={[styles.placeholder, className].filter(Boolean).join(" ")} data-tone={Math.abs(tone) % 6} role="img" aria-label={label} style={{ aspectRatio: ratio }}>
    {children ?? (letter && <span className={styles.initial} aria-hidden="true">{letter}</span>)}
  </div>;
}

/**
 * Oran kutulu fotoğraf: `ratio` kadar yer ayırır (sayfa zıplamaz), `object-fit: cover` ile doldurur, yüklenirken iskelet gösterir,
 * adres yoksa ya da açılmazsa yer tutucuya döner. `position` odak noktasıdır (örneğin "left center").
 */
export function FramedPhoto({ src, alt, ratio = "4 / 5", position, tone, initial, eager, className, onClick }: { src?: string; alt: string; ratio?: string; position?: string; tone?: number; initial?: string; eager?: boolean; className?: string; onClick?: () => void }) {
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const image = useRef<HTMLImageElement | null>(null);
  useEffect(() => { setState("loading"); }, [src]);
  useEffect(() => { if (image.current?.complete && image.current.naturalWidth > 0) setState("ready"); }, [src]);
  if (!src || state === "failed") return <Placeholder tone={tone} label={alt} ratio={ratio} className={className} initial={initial} />;
  return <div className={[styles.photo, className].filter(Boolean).join(" ")} data-state={state} style={{ aspectRatio: ratio }} onClick={onClick}>
    <img ref={image} src={src} alt={alt} draggable={false} loading={eager ? "eager" : "lazy"} decoding="async" style={position ? { objectPosition: position } : undefined} onLoad={() => setState("ready")} onError={() => setState("failed")} />
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

/**
 * Sürüklenebilir yatay slayt şeridi (galeri için). Parmağı bire bir izler, uçlarda esner; yeterince sürüklenince ya da hızlı atılınca
 * komşu slayta geçer. Sol/sağ ok tuşları şerit odaktayken çalışır. Görünmeyen slaytlar `aria-hidden`dır.
 * "Hareketi azalt" açıkken geçiş anidir.
 */
export function SwipeTrack({ count, index, onIndexChange, renderSlide, label, className }: { count: number; index: number; onIndexChange: (index: number) => void; renderSlide: (index: number) => ReactNode; label: string; className?: string }) {
  const reduced = useReducedMotionSafe();
  const [box, width] = useElementWidth<HTMLDivElement>();
  const x = useMotionValue(0);
  useEffect(() => {
    const target = -index * width;
    if (reduced || !width) { x.set(target); return; }
    const controls = animate(x, target, motionTokens.spring.smooth);
    return () => controls.stop();
  }, [index, width, reduced, x]);
  const key = (event: KeyboardEvent) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight") { event.preventDefault(); onIndexChange(Math.min(count - 1, index + 1)); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); onIndexChange(Math.max(0, index - 1)); }
  };
  return <div ref={box} className={[styles.viewport, className].filter(Boolean).join(" ")} role="group" aria-roledescription="galeri" aria-label={label} tabIndex={0} onKeyDown={key}>
    <motion.div className={styles.track} style={{ x }} drag={width && count > 1 && !reduced ? "x" : false} dragConstraints={{ left: -(count - 1) * width, right: 0 }} dragElastic={.18} dragMomentum={false}
      onDragEnd={(_, info) => {
        const projected = info.offset.x + info.velocity.x * .2;
        const step = Math.abs(projected) > width * .25 ? (projected < 0 ? 1 : -1) : 0;
        const next = Math.min(count - 1, Math.max(0, index + step));
        if (next === index) animate(x, -index * width, motionTokens.spring.smooth); else onIndexChange(next);
      }}>
      {Array.from({ length: count }, (_, at) => <div key={at} className={styles.slide} role="group" aria-roledescription="slayt" aria-label={`${at + 1} / ${count}`} aria-hidden={at !== index || undefined}>{renderSlide(at)}</div>)}
    </motion.div>
  </div>;
}

export const srOnly = styles.srOnly;
