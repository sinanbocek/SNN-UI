"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, Reorder, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import type { MotionStyle, Transition } from "motion/react";
import { Check, Pipette, Plus } from "lucide-react";
import { TextMorph } from "../text-morph/text-morph";
import { text } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { byte, clamp, contrast, formatColor, formatRatio, hsvToRgb, level, parseColor, round, toHex } from "./color-picker-format";
import type { ColorFormat, Hsva } from "./color-picker-format";
import styles from "./color-picker.module.css";

export type { ColorFormat, Hsva } from "./color-picker-format";
export { parseColor, toHex } from "./color-picker-format";
export interface ColorSwatch { id: string; color: string }

/**
 * Renk kutusu tam bir seçiciye dönüşen renk alanı. Doygunluk ve parlaklığı alanda, tonu ve saydamlığı sürgülerde seçin ya da hex, RGB, HSL veya OKLCH
 * değeri yazın; biçim düğmesi yazıyı biçimler arasında dönüştürür. Damlalık, tarayıcı destekliyorsa görünür. Kayıtlı renkler eklenebilir,
 * uygulanabilir, sürüklenebilir ya da Alt ve ok tuşlarıyla taşınabilir, Delete ile silinir. Karşıtlık göstergesi rengi üzerinde duracağı
 * arka planla karşılaştırır. Ok tuşları her başparmağı oynatır, Shift daha büyük adım atar, Escape paneli kapatır.
 */
export interface ColorPickerProps {
  /** Seçicinin okuyabildiği herhangi bir renk: hex, rgb(), hsl() ya da oklch(). */
  value?: string | undefined;
  defaultValue?: string | undefined;
  /** Rengi hex olarak alır; opak değilse iki saydamlık basamağı eklenir. */
  onValueChange?: ((hex: string) => void) | undefined;
  /** Rengin üzerinde duracağı arka plan; karşıtlık göstergesi için. */
  background?: string | undefined;
  /** Renk kutusunda görünen ad, ör. "Vurgu". */
  label?: string | undefined;
  swatches?: ColorSwatch[] | undefined;
  defaultSwatches?: ColorSwatch[] | undefined;
  onSwatchesChange?: ((swatches: ColorSwatch[]) => void) | undefined;
  /** En çok kayıtlı renk sayısı. Aşılırsa en eskisi düşer. */
  maxSwatches?: number | undefined;
  defaultFormat?: ColorFormat | undefined;
  className?: string | undefined;
}

const { spring, duration, ease, blur } = motionTokens;
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1, restDelta: .0005, restSpeed: .005 };
};
/** Başparmaklar imleci canlı, hızlı bir yayla kovalar; tıklama yumuşak oturur, sürükleme kıl payı geriden gelir. */
const thumbSpring = physical(.26, .22);
/** Parmak ya da fare sürüklemesinde başparmak imlece yapışık kalır: sıçramasız sert yay; geride kalmaz, sallanmaz. */
const dragSpring = physical(.1, 0);
const openSpring = physical(spring.morph.visualDuration, .1), closeSpring = physical(.3, 0);
const instant: Transition = { duration: 0 };

const formats: ColorFormat[] = ["hex", "rgb", "hsl", "oklch"];
const formatNames: Record<ColorFormat, string> = { hex: "Hex", rgb: "RGB", hsl: "HSL", oklch: "OKLCH" };

const subscribe = () => () => {};
function useHydrated() { return useSyncExternalStore(subscribe, () => true, () => false); }
function useEyeDropper() { return useSyncExternalStore(subscribe, () => "EyeDropper" in window, () => false); }
type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

/** Her çizimde güncel kalan, ama kimliği değişmeyen bir geri çağrı (React'in `useEffectEvent`'i yerine; eski React türleriyle de derlenir). */
function useLatestCallback<Args extends unknown[]>(callback: (...args: Args) => void) {
  const latest = useRef(callback);
  useLayoutEffect(() => { latest.current = callback; });
  return useCallback((...args: Args) => latest.current(...args), []);
}

/** Hareket değerini yeni hedefe yayla götürür; azaltılmış harekette doğrudan atlar. Hedef değişince mevcut hız korunur. */
function useFollow(target: number, reduced: boolean, dragging = false) {
  const value = useMotionValue(target);
  useEffect(() => {
    if (reduced) { value.jump(target); return; }
    const controls = animate(value, target, dragging ? dragSpring : thumbSpring);
    return () => controls.stop();
  }, [dragging, reduced, target, value]);
  return value;
}

/** Bir öğe üzerindeki imleç sürüklemesini izler ve konumu öğenin kutusuna oranla bildirir. */
function usePad(onMove: (x: number, y: number) => void, onActive: (active: boolean) => void) {
  const pointer = useRef<number | null>(null);
  const read = (event: ReactPointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    onMove(clamp((event.clientX - box.left) / box.width), clamp((event.clientY - box.top) / box.height));
  };
  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (event.button !== 0 || pointer.current !== null) return;
      pointer.current = event.pointerId;
      event.currentTarget.setPointerCapture(event.pointerId);
      onActive(true);
      read(event);
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) { if (event.pointerId === pointer.current) read(event); },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) { if (event.pointerId !== pointer.current) return; pointer.current = null; onActive(false); },
    onPointerCancel(event: ReactPointerEvent<HTMLElement>) { if (event.pointerId !== pointer.current) return; pointer.current = null; onActive(false); },
  };
}

/** Ok tuşları küçük adım atar, Shift ve Page tuşları on adım, Home ve End uçlara gider. */
function stepFor(event: ReactKeyboardEvent, axis: "x" | "y" | "both") {
  const big = event.shiftKey || event.key.startsWith("Page");
  const size = big ? 10 : 1;
  const map: Record<string, [number, number]> = {
    ArrowRight: [size, 0], ArrowLeft: [-size, 0], ArrowUp: axis === "both" ? [0, size] : [size, 0], ArrowDown: axis === "both" ? [0, -size] : [-size, 0],
    PageUp: [10, 0], PageDown: [-10, 0],
  };
  return map[event.key] ?? null;
}

interface SliderProps { label: string; value: number; valueText: string; max: number; unit: number; onChange: (value: number) => void; className?: string | undefined; style?: CSSProperties | undefined; reduced: boolean; fill: string; onActive: (active: boolean) => void; active: boolean }
function Slider({ label, value, valueText, max, unit, onChange, className, style, reduced, fill, onActive, active }: SliderProps) {
  const x = useFollow(value / max, reduced, active);
  const left = useTransform(x, v => `${v * 100}%`);
  const pad = usePad(fx => onChange(fx * max), onActive);
  return <div className={`${styles.slider} ${className}`} style={style} {...pad}>
    <motion.div className={styles.sliderThumb} role="slider" tabIndex={0} aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)} aria-valuetext={valueText}
      style={{ left, "--thumb-fill": fill } as MotionStyle} data-active={active || undefined}
      onKeyDown={event => {
        if (event.key === "Home" || event.key === "End") { event.preventDefault(); onChange(event.key === "Home" ? 0 : max); return; }
        const step = stepFor(event, "x");
        if (!step) return;
        event.preventDefault();
        onChange(clamp(value + step[0] * unit, 0, max));
      }} />
  </div>;
}

function Chip({ color, className }: { color: string; className?: string | undefined }) {
  return <span className={`${styles.chip} ${className ?? ""}`}><span style={{ background: color }} /></span>;
}

let swatchCount = 0;
const newId = () => `swatch-${Date.now().toString(36)}-${swatchCount++}`;

export function ColorPicker({
  value, defaultValue = "#2F6BFF", onValueChange, background = "#FFFFFF", label = "Renk", swatches: swatchesProp, defaultSwatches, onSwatchesChange,
  maxSwatches = 7, defaultFormat = "hex", className,
}: ColorPickerProps) {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const hydrated = useHydrated();
  const reduced = !!useReducedMotion() && hydrated;
  const canPick = useEyeDropper();

  const [hsva, setHsva] = useState<Hsva>(() => parseColor(value ?? defaultValue) ?? { h: 220, s: .8, v: 1, a: 1 });
  const [synced, setSynced] = useState(value);
  if (value !== undefined && value !== synced) {
    setSynced(value);
    if (text.upper(value) !== toHex(hsva)) { const next = parseColor(value, hsva.h); if (next) setHsva(next); }
  }
  const [ownSwatches, setOwnSwatches] = useState<ColorSwatch[]>(defaultSwatches ?? []);
  const swatches = swatchesProp ?? ownSwatches;
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [kind, setKind] = useState<ColorFormat>(defaultFormat);
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [morph, setMorph] = useState<{ id: number; from: string; to: string; phase: 0 | 1 } | null>(null);
  const [active, setActive] = useState<"area" | "hue" | "alpha" | null>(null);
  const [focusSwatch, setFocusSwatch] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const areaThumb = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const swatchRefs = useRef(new Map<string, HTMLButtonElement>());
  const dragged = useRef(false);
  const fieldX = useMotionValue(0);
  /** Panelin şu an açık olması gerekip gerekmediği; kapanış animasyonu bitince okunur. */
  const openNow = useRef(false);

  const hex = toHex(hsva);
  const rgb = hsvToRgb(hsva);
  const css = `rgb(${byte(rgb.r)} ${byte(rgb.g)} ${byte(rgb.b)} / ${round(hsva.a, 3)})`;
  const opaque = `rgb(${byte(rgb.r)} ${byte(rgb.g)} ${byte(rgb.b)})`;
  const pure = `hsl(${hsva.h} 100% 50%)`;
  const bg = parseColor(background);
  const ratio = contrast(hsva, bg ? hsvToRgb(bg) : { r: 1, g: 1, b: 1, a: 1 });
  const display = formatColor(hsva, kind);

  function commit(next: Hsva) {
    setHsva(next);
    const nextHex = toHex(next);
    if (nextHex !== hex) onValueChange?.(nextHex);
  }
  function setSwatches(next: ColorSwatch[]) { if (!swatchesProp) setOwnSwatches(next); onSwatchesChange?.(next); }

  // Yüzey: tek bir ilerleme değeri renk kutusunu panelin kutusuna büyütür; içerik öncü kenarın arkasından belirir.
  const progress = useMotionValue(0), fade = useMotionValue(0);
  const size = { W: useMotionValue(300), H: useMotionValue(420), w: useMotionValue(160), h: useMotionValue(44) };
  const clipPath = useTransform(() => {
    const q = clamp(progress.get());
    return `inset(0px ${round((size.W.get() - size.w.get()) * (1 - q), 2)}px ${round((size.H.get() - size.h.get()) * (1 - q), 2)}px 0px round ${round(22 + 4 * q, 2)}px)`;
  });
  const contentOpacity = useTransform(progress, [.35, .9], [0, 1]);
  const contentY = useTransform(progress, [0, 1], [-10, 0]);

  useLayoutEffect(() => {
    if (!shown) return;
    const panel = panelRef.current, trigger = triggerRef.current;
    if (!panel || !trigger) return;
    const measure = () => { size.W.set(panel.offsetWidth); size.H.set(panel.offsetHeight); size.w.set(trigger.offsetWidth); size.h.set(trigger.offsetHeight); };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [shown, size.W, size.H, size.w, size.h]);

  useEffect(() => {
    if (!shown) return;
    if (reduced) {
      progress.jump(open ? 1 : progress.get());
      const controls = animate(fade, open ? 1 : 0, { duration: duration.fast, ease: [...ease.standard] });
      controls.then(() => { if (!openNow.current) { progress.jump(0); setShown(false); } });
      return () => controls.stop();
    }
    fade.jump(1);
    const controls = animate(progress, open ? 1 : 0, open ? openSpring : closeSpring);
    if (!open) controls.then(() => { if (!openNow.current) setShown(false); });
    return () => controls.stop();
  }, [fade, open, progress, reduced, shown]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => areaThumb.current?.focus({ preventScroll: true }));
  }, [open]);

  function show() { openNow.current = true; setShown(true); setOpen(true); }
  function hide(returnFocus = true) {
    openNow.current = false;
    setOpen(false); setDraft(null); setInvalid(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  const dismiss = useLatestCallback((event: Event) => {
    if (event instanceof KeyboardEvent) {
      if (event.key !== "Escape") return;
      hide(!!rootRef.current?.contains(document.activeElement));
      return;
    }
    if (!rootRef.current?.contains(event.target as Node)) hide(false);
  });
  useEffect(() => {
    if (!open) return;
    const listener = (event: Event) => dismiss(event);
    document.addEventListener("pointerdown", listener, true);
    document.addEventListener("keydown", listener);
    return () => { document.removeEventListener("pointerdown", listener, true); document.removeEventListener("keydown", listener); };
  }, [open]);

  // Doygunluk ve parlaklık alanı.
  const areaX = useFollow(hsva.s, reduced, active === "area"), areaY = useFollow(1 - hsva.v, reduced, active === "area");
  const areaLeft = useTransform(areaX, v => `${v * 100}%`), areaTop = useTransform(areaY, v => `${v * 100}%`);
  const areaPad = usePad((x, y) => commit({ ...hsva, s: x, v: 1 - y }), on => setActive(on ? "area" : null));

  // Biçim dönüşümü: yeni yazı eski dizeyi göstererek bağlanır, sonra yenisine dönüşür; oturunca canlı alan geri gelir.
  useEffect(() => {
    if (!morph || morph.phase === 1) return;
    const frame = requestAnimationFrame(() => setMorph(current => current && current.id === morph.id ? { ...current, phase: 1 } : current));
    return () => cancelAnimationFrame(frame);
  }, [morph]);
  useEffect(() => {
    if (!morph || morph.phase === 0) return;
    const timer = window.setTimeout(() => setMorph(current => current?.id === morph.id ? null : current), 620);
    return () => window.clearTimeout(timer);
  }, [morph]);

  function cycleFormat() {
    const next = formats[(formats.indexOf(kind) + 1) % formats.length]!;
    setKind(next); setDraft(null); setInvalid(false);
    if (!reduced) setMorph({ id: Date.now(), from: display, to: formatColor(hsva, next), phase: 0 });
  }

  function submitDraft() {
    if (draft === null) return true;
    const next = parseColor(draft, hsva.h);
    if (!next) {
      setInvalid(true);
      if (!reduced) animate(fieldX, [0, -5, 4, -2, 0], { duration: .32, ease: [...ease.standard] });
      return false;
    }
    commit(next); setDraft(null); setInvalid(false);
    return true;
  }

  function pickFromScreen() {
    if (!canPick) return;
    const Ctor = (window as unknown as { EyeDropper: EyeDropperCtor }).EyeDropper;
    new Ctor().open().then(result => { const next = parseColor(result.sRGBHex, hsva.h); if (next) commit({ ...next, a: hsva.a }); }).catch(() => {});
  }

  function saveSwatch() {
    const entry = { id: newId(), color: hex };
    setSwatches([entry, ...swatches].slice(0, maxSwatches));
    setFocusSwatch(entry.id);
  }
  function onSwatchKey(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const item = swatches[index]!;
    const move = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      const next = swatches.filter(entry => entry.id !== item.id);
      setSwatches(next);
      const neighbor = next[Math.min(index, next.length - 1)];
      setFocusSwatch(neighbor?.id ?? null);
      requestAnimationFrame(() => neighbor ? swatchRefs.current.get(neighbor.id)?.focus({ preventScroll: true }) : inputRef.current?.focus({ preventScroll: true }));
      return;
    }
    if (!move && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    if (move && event.altKey) {
      const to = index + move;
      if (to < 0 || to >= swatches.length) return;
      const next = [...swatches];
      next.splice(index, 1); next.splice(to, 0, item);
      setSwatches(next);
      requestAnimationFrame(() => swatchRefs.current.get(item.id)?.focus({ preventScroll: true }));
      return;
    }
    const target = event.key === "Home" ? 0 : event.key === "End" ? swatches.length - 1 : (index + move + swatches.length) % swatches.length;
    setFocusSwatch(swatches[target]!.id);
    swatchRefs.current.get(swatches[target]!.id)?.focus({ preventScroll: true });
  }

  const ratioValue = useFollow(ratio, reduced);
  const ratioText = useTransform(ratioValue, v => formatRatio(v));
  const grade = level(ratio);
  const hidden = reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${blur.subtle}px)` };
  const swatchTab = swatches.some(entry => entry.id === focusSwatch) ? focusSwatch : swatches[0]?.id;
  const style = { "--picker-color": css, "--picker-opaque": opaque, "--picker-hue": pure, "--picker-bg": background } as CSSProperties;

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
    <button ref={triggerRef} type="button" className={styles.trigger} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? `${uid}-panel` : undefined}
      onClick={() => open ? hide() : show()}>
      <Chip color={css} />
      <span className={styles.triggerText}><span className={styles.name}>{label}</span><span className={styles.hex}>{hex}</span></span>
    </button>

    {shown && <div className={styles.float} data-open={open || undefined}>
      <motion.div ref={panelRef} id={`${uid}-panel`} role="dialog" aria-label={`${label} rengi`} className={styles.panel} inert={!open} style={{ clipPath, opacity: fade }}>
        <div className={styles.head}>
          <Chip color={css} />
          <span className={styles.triggerText}><span className={styles.name}>{label}</span><span className={styles.hex}>{hex}</span></span>
          <motion.span className={styles.headActions} style={{ opacity: contentOpacity }}>
            {canPick && <button type="button" className={styles.iconButton} aria-label="Ekrandan renk seç" onClick={pickFromScreen}><Pipette size={18} strokeWidth={1.75} aria-hidden="true" /></button>}
            <button type="button" className={styles.iconButton} aria-label="Bitti" onClick={() => hide()}><Check size={18} strokeWidth={1.75} aria-hidden="true" /></button>
          </motion.span>
        </div>

        <motion.div className={styles.body} style={{ opacity: contentOpacity, y: contentY }}>
          <div className={styles.area} data-active={active === "area" || undefined} {...areaPad}>
            <motion.div ref={areaThumb} className={styles.areaThumb} role="slider" tabIndex={0} aria-roledescription="2 boyutlu sürgü"
              aria-label="Doygunluk ve parlaklık" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(hsva.s * 100)}
              aria-valuetext={`Doygunluk %${Math.round(hsva.s * 100)}, parlaklık %${Math.round(hsva.v * 100)}`}
              style={{ left: areaLeft, top: areaTop }}
              onKeyDown={event => {
                const step = stepFor(event, "both");
                if (!step) return;
                event.preventDefault();
                commit({ ...hsva, s: clamp(hsva.s + step[0] / 100), v: clamp(hsva.v + step[1] / 100) });
              }} />
          </div>

          <Slider label="Ton" value={hsva.h} valueText={`${Math.round(hsva.h)} derece`} max={360} unit={1} className={styles.hue} reduced={reduced} fill={pure}
            onChange={h => commit({ ...hsva, h: clamp(h, 0, 359.9) })} active={active === "hue"} onActive={on => setActive(on ? "hue" : null)} />
          <Slider label="Saydamlık" value={hsva.a * 100} valueText={`%${Math.round(hsva.a * 100)}`} max={100} unit={1} className={styles.alpha} reduced={reduced} fill={css}
            onChange={a => commit({ ...hsva, a: clamp(a / 100) })} active={active === "alpha"} onActive={on => setActive(on ? "alpha" : null)} />

          <motion.div className={styles.field} data-invalid={invalid || undefined} style={{ x: fieldX }}>
            <button type="button" className={styles.format} onClick={cycleFormat} aria-label={`Biçim: ${formatNames[kind]}. Biçimi değiştir`}>
              <TextMorph>{formatNames[kind]}</TextMorph>
            </button>
            <span className={styles.inputWrap}>
              <input ref={inputRef} className={styles.input} value={draft ?? display} spellCheck={false} autoComplete="off" aria-label={`${label}, ${formatNames[kind]} olarak`}
                aria-invalid={invalid || undefined} aria-describedby={invalid ? `${uid}-error` : undefined} data-morphing={morph ? "" : undefined}
                onChange={event => { setDraft(event.target.value); setInvalid(false); }}
                onKeyDown={event => {
                  if (event.key === "Enter") { event.preventDefault(); if (submitDraft()) event.currentTarget.select(); }
                  if (event.key === "Escape" && draft !== null) { event.stopPropagation(); event.nativeEvent.stopImmediatePropagation(); setDraft(null); setInvalid(false); }
                }}
                onBlur={() => { if (!submitDraft()) { setDraft(null); setInvalid(false); } }} />
              {morph && <span className={styles.morph} aria-hidden="true"><TextMorph>{morph.phase === 0 ? morph.from : morph.to}</TextMorph></span>}
            </span>
          </motion.div>
          <p id={`${uid}-error`} className={styles.error} aria-live="polite">{invalid ? "Hex, RGB, HSL ya da OKLCH renk girin" : ""}</p>

          <div className={styles.contrast}>
            <span className={styles.sample} aria-hidden="true">Aa</span>
            <span className={styles.ratio}><motion.span>{ratioText}</motion.span>:1</span>
            <span className={styles.against}>arka plana göre</span>
            <span className={styles.grade} data-grade={grade === "Geçmedi" ? "fail" : grade === "AA büyük" ? "large" : "pass"}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={grade} initial={hidden} animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
                  exit={{ ...hidden, transition: { duration: duration.instant } }} transition={reduced ? { duration: duration.instant } : { duration: duration.standard, ease: [...ease.enter] }}>{grade}</motion.span>
              </AnimatePresence>
            </span>
            <span className={styles.srOnly}>{`Karşıtlık ${formatRatio(ratio)}:1, ${grade === "Geçmedi" ? "Geçmedi" : `${grade} düzeyini geçti`}`}</span>
          </div>

          <div className={styles.swatches}>
            <button type="button" className={styles.add} onClick={saveSwatch} aria-label={`${hex} rengini kaydet`}><Plus size={16} strokeWidth={1.75} aria-hidden="true" /></button>
            <Reorder.Group as="div" axis="x" values={swatches} onReorder={setSwatches} className={styles.swatchList} role="listbox" aria-label="Kayıtlı renkler" aria-orientation="horizontal">
              <AnimatePresence initial={false}>
                {swatches.map((entry, index) => <Reorder.Item key={entry.id} value={entry} as="div" className={styles.swatchSlot} dragElastic={.12}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .4 }} animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, scale: .4, transition: { duration: duration.fast } }}
                  transition={reduced ? instant : { ...spring.snappy, layout: spring.smooth }} {...(reduced ? {} : { whileDrag: { scale: 1.15, zIndex: 2 } })}
                  onDragStart={() => { dragged.current = true; }} onDragEnd={() => requestAnimationFrame(() => { dragged.current = false; })}>
                  <button ref={node => { if (node) swatchRefs.current.set(entry.id, node); else swatchRefs.current.delete(entry.id); }}
                    type="button" role="option" aria-selected={text.upper(entry.color) === hex} className={styles.swatch} data-current={text.upper(entry.color) === hex || undefined}
                    aria-label={`${entry.color}. Taşımak için Alt ve ok tuşları, silmek için Delete`} tabIndex={entry.id === swatchTab ? 0 : -1}
                    onFocus={() => setFocusSwatch(entry.id)} onKeyDown={event => onSwatchKey(event, index)}
                    onClick={() => { if (dragged.current) return; const next = parseColor(entry.color, hsva.h); if (next) commit(next); }}>
                    <Chip color={entry.color} className={styles.swatchChip} />
                  </button>
                </Reorder.Item>)}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        </motion.div>
      </motion.div>
    </div>}
  </div>;
}

export default ColorPicker;
