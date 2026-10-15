"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { ImageViewer, type Rect } from "../lib/image-viewer";
import { type ViewerImage } from "../lib/image-viewer-format";
import { motionTokens } from "../lib/motion-tokens";
import { Placeholder, useAnnouncer } from "../lib/shop-parts";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { DEFAULT_LEVEL, HINT, LEVELS, cellLabel, favoriteLabel, gridFocus, nearestLevel, pinchColumns, stepLevel } from "./photo-grid-format";
import styles from "./photo-grid.module.css";

export type { ViewerImage };

/** Bir albümü eş boyutlu hücrelerle gösteren fotoğraf ızgarası için kullanın: iki parmakla sıkıştırarak (ya da Ctrl+kaydırma, düğmeler, `+` `-`) sütun sayısı değişir (yoğun, orta, geniş); fotoğrafa basınca tam ekran görüntüleyici o hücreden büyür, altında küçük resim şeridi vardır; fotoğraflar favorilenebilir. Oranı koruyan duvar için `lightbox-gallery`. Favorilerin saklanmasını uygulama bağlar. Çok büyük kitaplıklar sayfalanır, ızgara sanallaştırılmaz. */
export interface PhotoGridProps {
  title: string;
  images: ViewerImage[];
  defaultFavorites?: string[];
  /** Favori açılıp kapanınca çağrılır (kalıcı saklamak için). */
  onFavoriteChange?: (id: string, favorite: boolean) => void;
  loading?: boolean;
}

export function PhotoGrid({ title, images, defaultFavorites = [], onFavoriteChange, loading = false }: PhotoGridProps) {
  const reduced = useReducedMotionSafe();
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [favorites, setFavorites] = useState<string[]>(defaultFavorites);
  const [open, setOpen] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [live, announce] = useAnnouncer();
  const grid = useRef<HTMLDivElement>(null);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; level: number; pivot: number } | null>(null);
  const wheel = useRef(0);
  const anchor = useRef<{ index: number; top: number } | null>(null);
  const [scale, setScale] = useState(1);
  const columns = LEVELS[level]!;

  const change = (way: "in" | "out", pivot?: number) => {
    const next = stepLevel(level, way);
    if (next === level) return;
    keepAnchor(pivot ?? focus);
    setLevel(next);
    announce(`${LEVELS[next]} sütun`);
  };
  const keepAnchor = (index: number) => { const rect = cells.current[index]?.getBoundingClientRect(); if (rect) anchor.current = { index, top: rect.top }; };
  // Düzen değişince çevresinde yakınlaştırılan fotoğraf ekranda yerinde kalsın diye sayfa kaydırması düzeltilir.
  useLayoutEffect(() => {
    const saved = anchor.current;
    anchor.current = null;
    const rect = saved ? cells.current[saved.index]?.getBoundingClientRect() : null;
    if (saved && rect && Math.abs(rect.top - saved.top) > 1) window.scrollBy(0, rect.top - saved.top);
  }, [level]);

  // Ctrl+tekerlek seviye değiştirir; sayfa yakınlaştırmasını engellemek için pasif olmayan dinleyici gerekir.
  useEffect(() => {
    const node = grid.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      wheel.current += event.deltaY;
      if (Math.abs(wheel.current) < 40) return;
      const way = wheel.current < 0 ? "in" : "out";
      wheel.current = 0;
      const target = (event.target as HTMLElement).closest("button");
      const index = target ? cells.current.indexOf(target as HTMLButtonElement) : -1;
      change(way, index >= 0 ? index : focus);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  });

  const cellAt = (x: number, y: number) => { const element = document.elementFromPoint(x, y)?.closest("button"); const index = element ? cells.current.indexOf(element as HTMLButtonElement) : -1; return index >= 0 ? index : focus; };
  const down = (event: PointerEvent) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), level, pivot: cellAt((a.x + b.x) / 2, (a.y + b.y) / 2) };
    }
  };
  const move = (event: PointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinch.current && !reduced) {
      const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const live = Math.hypot(a.x - b.x, a.y - b.y) / (pinch.current.distance || 1);
      setScale(Math.min(2, Math.max(.6, live)));
    }
  };
  const up = (event: PointerEvent) => {
    const started = pinch.current;
    pointers.current.delete(event.pointerId);
    if (started && pointers.current.size < 2) {
      pinch.current = null;
      const target = nearestLevel(pinchColumns(LEVELS[started.level]!, scale));
      setScale(1);
      if (target !== level) { keepAnchor(started.pivot); setLevel(target); announce(`${LEVELS[target]} sütun`); }
    }
  };

  const key = (event: KeyboardEvent, index: number) => {
    if (event.key === "+" || event.key === "=") { event.preventDefault(); change("in", index); return; }
    if (event.key === "-") { event.preventDefault(); change("out", index); return; }
    const next = gridFocus(event.key, index, columns, images.length);
    if (next === index && !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setFocus(next);
    cells.current[next]?.focus();
  };
  const toggleFavorite = (id: string) => {
    const now = !favorites.includes(id);
    setFavorites(current => now ? [...current, id] : current.filter(item => item !== id));
    onFavoriteChange?.(id, now);
    announce(now ? "Favoriye eklendi." : "Favoriden çıkarıldı.");
  };
  const origin = (index: number): Rect | null => { const rect = cells.current[index]?.getBoundingClientRect(); return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null; };

  return <section className={styles.root} aria-label={title} data-reduced={reduced || undefined}>
    <header className={styles.bar}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.meta}><span className={styles.num}><AnimatedCounter value={images.length} /></span> fotoğraf · <span className={styles.num}><AnimatedCounter value={columns} /></span> sütun</p>
      <div className={styles.zoom} role="group" aria-label="Yoğunluk">
        <Button size="sm" variant="secondary" aria-label="Uzaklaştır" disabled={level === 0} onClick={() => change("out")}>−</Button>
        <Button size="sm" variant="secondary" aria-label="Yakınlaştır" disabled={level === LEVELS.length - 1} onClick={() => change("in")}>+</Button>
      </div>
    </header>
    <p className={styles.hint}>{HINT}</p>
    {loading ? <div className={styles.grid} style={{ ["--columns" as string]: columns }} aria-busy="true" role="status" aria-label="Fotoğraflar yükleniyor">{Array.from({ length: columns * 2 }, (_, at) => <span key={at} className={styles.skeleton} />)}</div>
      : <div ref={grid} className={styles.gridWrap} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <motion.div className={styles.grid} style={{ ["--columns" as string]: columns, touchAction: "pan-y" }} animate={{ scale }} transition={reduced ? { duration: 0 } : { duration: 0.08 }}>
          {images.map((image, index) => {
            const favorite = favorites.includes(image.id);
            return <button key={image.id} ref={node => { cells.current[index] = node; }} type="button" className={styles.cell} tabIndex={index === focus ? 0 : -1} aria-label={cellLabel(image.title ?? image.alt, favorite)}
              onFocus={() => setFocus(index)} onKeyDown={event => key(event, index)} onClick={() => setOpen(index)}>
              {image.src ? <img src={image.src} alt="" width={image.width} height={image.height} loading="lazy" draggable={false} /> : <Placeholder tone={image.tone} label="" ratio="1 / 1" className={styles.photo} />}
              <AnimatePresence>{favorite && <motion.span key="heart" className={styles.heart} aria-hidden="true" initial={reduced ? false : { opacity: 0, scale: .5, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: .5 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy}>♥</motion.span>}</AnimatePresence>
            </button>;
          })}
        </motion.div>
      </div>}
    {live}
    <ImageViewer images={images} index={open} onIndexChange={setOpen} getOrigin={origin} label={title}
      onClose={last => { setOpen(null); setFocus(last); requestAnimationFrame(() => cells.current[last]?.focus()); }}
      renderExtra={image => <button type="button" className={styles.favorite} aria-pressed={favorites.includes(image.id)} aria-label={favoriteLabel(favorites.includes(image.id))} onClick={() => toggleFavorite(image.id)}>{favorites.includes(image.id) ? "♥" : "♡"}</button>} />
  </section>;
}

export default PhotoGrid;
