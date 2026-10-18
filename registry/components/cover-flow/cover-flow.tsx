"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { FramedPhoto, useAnnouncer } from "../lib/shop-parts";
import { useElementWidth, useReducedMotionSafe } from "../lib/viz-utils";
import { coverTransform, dragToPosition, liveText, railKey, reducedStep, settleIndex, slideLabel, tickLabel } from "./cover-flow-format";
import styles from "./cover-flow.module.css";

export interface CoverItem {
  id: string;
  title: string;
  subtitle?: string | undefined;
  /** Üst bilgi (kategori, tarih gibi). */
  kicker?: string | undefined;
  /** Görselin anlamlı açıklaması. */
  alt: string;
  /** Verilmezse kendi yer tutucusu çizilir. */
  src?: string | undefined;
  /** Fotoğrafın odak noktası (CSS object-position), örneğin "20% center". */
  position?: string | undefined;
  tone?: number | undefined;
}

/** Altı ila on iki görsellik kısa bir koleksiyonu (albüm, yer, derleme) tek tek gezdirmek için kullanın: öndeki kart öne çıkar, diğerleri iki yanda geri çekilir; görseller çerçevesinin içinde hafifçe kayar. Fare ya da parmakla sürüklenir ve fırlatılır; altta seçili kartın açıklaması değişir. Büyük kitaplık için `photo-grid` ya da `lightbox-gallery`. */
export interface CoverFlowProps {
  label: string;
  items: CoverItem[];
  defaultIndex?: number | undefined;
  /** Açıklama alanına uygulamanın kendi içeriğini (sayılar, düğme) ekler. */
  renderDetail?: ((item: CoverItem, index: number) => ReactNode) | undefined;
  /** Öndeki kart değişince çağrılır. */
  onChange?: ((item: CoverItem, index: number) => void) | undefined;
}

function Slide({ item, index, count, position, active, reduced, onPick, reach }: { item: CoverItem; index: number; count: number; position: MotionValue<number>; active: boolean; reduced: boolean; onPick: () => void; reach: number }) {
  const transform = useTransform(position, p => coverTransform(index - p, reach));
  const x = useTransform(transform, t => `${t.x * 100}%`);
  const scale = useTransform(transform, t => t.scale);
  const rotateY = useTransform(transform, t => reduced ? 0 : t.rotate);
  const zIndex = useTransform(transform, t => t.z);
  const visibility = useTransform(transform, t => t.hidden ? "hidden" : "visible");
  const shade = useTransform(transform, t => t.shade);
  const reflect = useTransform(shade, v => Math.max(0, .35 - v));
  const inner = useTransform(position, p => reduced ? "0%" : `${(index - p) * -9}%`);
  return <motion.div className={styles.slide} style={{ x, scale, rotateY, zIndex, visibility }} role="group" aria-roledescription="slayt" aria-label={slideLabel(index, count, item.title)} aria-hidden={!active || undefined} data-active={active || undefined}>
    <button type="button" className={styles.frame} tabIndex={-1} aria-label={active ? undefined : tickLabel(item.title)} onClick={onPick} disabled={active}>
      <motion.span className={styles.media} style={{ x: inner }}>
        <FramedPhoto src={item.src} position={item.position} alt={active ? item.alt : ""} ratio="26 / 25" tone={item.tone} initial={Array.from(item.title.trim())[0]} eager={Math.abs(index) < 3} className={styles.photo} />
      </motion.span>
      <motion.span className={styles.shade} style={{ opacity: shade }} aria-hidden="true" />
    </button>
    <motion.span className={styles.reflection} style={{ opacity: reflect }} aria-hidden="true" />
  </motion.div>;
}

export function CoverFlow({ label, items, defaultIndex = 0, renderDetail, onChange }: CoverFlowProps) {
  const reduced = useReducedMotionSafe();
  const [box, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState(Math.min(defaultIndex, items.length - 1));
  const position = useMotionValue(active);
  const direction = useRef(1);
  const drag = useRef<{ id: number; startX: number; startPosition: number; lastX: number; lastT: number; velocity: number } | null>(null);
  const [live, announce] = useAnnouncer();
  const cardWidth = Math.min(300, Math.max(160, width * .45));
  const reach = items.length > 7 ? 3 : 4;
  const commit = useCallback((index: number) => {
    setActive(previous => {
      if (previous === index) return previous;
      direction.current = index > previous ? 1 : -1;
      onChange?.(items[index]!, index);
      announce(liveText(index, items.length, items[index]!.title));
      return index;
    });
  }, [announce, items, onChange]);

  const goTo = useCallback((index: number, velocity = 0) => {
    const target = Math.min(items.length - 1, Math.max(0, index));
    if (reduced) position.set(target); else animate(position, target, { type: "spring", stiffness: 190, damping: 26, velocity });
    commit(target);
  }, [commit, items.length, position, reduced]);

  // Yatay izleme yüzeyi kaydırması rayı doğrudan oynatır, sonra bir karta oturur.
  const rail = useRef<HTMLDivElement | null>(null);
  const settleTimer = useRef<number>(undefined);
  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      if (reduced) { goTo(active + reducedStep(-event.deltaX)); return; }
      position.set(Math.min(items.length - 1 + .3, Math.max(-.3, position.get() + event.deltaX / (cardWidth * .62))));
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => goTo(settleIndex(position.get(), 0, items.length)), 120);
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => { node.removeEventListener("wheel", wheel); window.clearTimeout(settleTimer.current); };
  });

  const down = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    drag.current = { id: event.pointerId, startX: event.clientX, startPosition: position.get(), lastX: event.clientX, lastT: performance.now(), velocity: 0 };
  };
  const move = (event: PointerEvent) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId || reduced) return;
    if (Math.abs(event.clientX - state.startX) > 4) (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    const now = performance.now(), dt = Math.max(1, now - state.lastT);
    state.velocity = ((state.lastX - event.clientX) / (cardWidth * .62)) / (dt / 1000) * .35 + state.velocity * .65;
    state.lastX = event.clientX; state.lastT = now;
    const raw = dragToPosition(state.startPosition, event.clientX - state.startX, cardWidth);
    const over = raw < 0 ? raw * .35 : raw > items.length - 1 ? items.length - 1 + (raw - (items.length - 1)) * .35 : raw;
    position.set(over);
  };
  const up = (event: PointerEvent) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    const moved = event.clientX - state.startX;
    if (reduced) { goTo(active + reducedStep(moved)); return; }
    if (Math.abs(moved) < 4) return;
    goTo(settleIndex(position.get(), state.velocity, items.length), state.velocity);
  };
  const key = (event: KeyboardEvent) => {
    const next = railKey(event.key, active, items.length);
    if (next === active && !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    goTo(next);
  };

  if (!items.length) return null;
  const item = items[active]!;
  return <section className={styles.root} data-reduced={reduced || undefined}>
    <div ref={node => { rail.current = node; box.current = node; }} className={styles.rail} role="group" aria-roledescription="döner şerit" aria-label={label} tabIndex={0}
      onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ ["--card" as string]: `${cardWidth}px`, touchAction: "pan-y" }}>
      <div className={styles.stage}>{items.map((entry, index) => <Slide key={entry.id} item={entry} index={index} count={items.length} position={position} active={index === active} reduced={reduced} reach={reach} onPick={() => goTo(index)} />)}</div>
    </div>
    {items.length > 2 && <div className={styles.ticks}>{items.map((entry, index) => <button key={entry.id} type="button" tabIndex={-1} className={styles.tick} aria-label={tickLabel(entry.title)} aria-current={index === active || undefined} onClick={() => goTo(index)} />)}</div>}
    <div className={styles.caption}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={item.id} className={styles.captionBody} initial={reduced ? false : { opacity: 0, y: 10 * direction.current }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : motionTokens.duration.standard, ease: [...motionTokens.ease.standard] }}>
          {item.kicker && <p className={styles.kicker}>{item.kicker}</p>}
          <h3 className={styles.title}>{item.title}</h3>
          {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
          {renderDetail?.(item, active)}
        </motion.div>
      </AnimatePresence>
    </div>
    {live}
  </section>;
}

export default CoverFlow;
