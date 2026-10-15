"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { motionTokens } from "./motion-tokens";
import { Placeholder, srOnly } from "./shop-parts";
import { useReducedMotionSafe } from "./viz-utils";
import { MIN_ZOOM, clampPan, clampZoom, counterText, fitRect, panLimit, pinchZoom, pullCloses, swipeStep, zoomAround, zoomIn, zoomOut, type Rect, type ViewerImage } from "./image-viewer-format";
import styles from "./image-viewer.module.css";

export type { Rect, ViewerImage };

export interface ImageViewerProps {
  images: ViewerImage[];
  /** Açık fotoğrafın sırası; null ise görüntüleyici kapalıdır. */
  index: number | null;
  onIndexChange: (index: number) => void;
  /** Kapanınca çağrılır; `last` son gösterilen fotoğrafın sırasıdır (odağı onun yuvasına geri verin). */
  onClose: (last: number) => void;
  /** Bir fotoğrafın ekrandaki yuvası; açılış ve kapanış uçuşu buradan başlar ve buraya döner. Bilinmiyorsa null. */
  getOrigin: (index: number) => Rect | null;
  label: string;
  /** Alt tarafta küçük resim şeridi. */
  filmstrip?: boolean;
  /** Her fotoğraf için ek denetim (örneğin favori kalbi). */
  renderExtra?: (image: ViewerImage, index: number) => ReactNode;
}

const NARROW = 640;
const MARGIN = 12;
const TOP = 64;

function useBox() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const read = () => setSize(previous => previous.width === node.clientWidth && previous.height === node.clientHeight ? previous : { width: node.clientWidth, height: node.clientHeight });
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  });
  return [ref, size] as const;
}

function Photo({ image }: { image: ViewerImage }) {
  return image.src ? <img className={styles.photo} src={image.src} alt={image.alt} draggable={false} /> : <Placeholder tone={image.tone} label={image.alt} ratio={`${image.width} / ${image.height}`} className={styles.photo} />;
}

const slide = { out: (dir: number) => ({ opacity: 0, x: -40 * dir }) };

/** Tam ekran fotoğraf görüntüleyicisi: yuvasından büyür, kaydırılır, yakınlaştırılır (`+` `-` `0`, çift tıklama, iki parmak, Ctrl+tekerlek), aşağı çekilerek kapatılır. Kipli iletişim kutusudur: odak tuzağı, sayfa kaydırma kilidi, Escape önce uzaklaştırır sonra kapatır. */
export function ImageViewer({ images, index, onIndexChange, onClose, getOrigin, label, filmstrip = true, renderExtra }: ImageViewerProps) {
  const reduced = useReducedMotionSafe();
  const open = index !== null;
  const [area, box] = useBox();
  const [zoom, setZoomState] = useState(1);
  const [closing, setClosing] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const direction = useRef(1);
  const first = useRef(true);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const panX = useMotionValue(0), panY = useMotionValue(0), scale = useMotionValue(1), pull = useMotionValue(0);
  const fade = useTransform(pull, [0, 240], [1, .3]);
  const current = index !== null ? images[index] : undefined;
  const narrow = box.width > 0 && box.width < NARROW;

  const bottom = (filmstrip && images.length > 1 ? 88 : 12) + (current?.title || current?.caption ? 44 : 0);
  const fit = current && box.width ? (() => { const rect = fitRect(current.width, current.height, box.width, Math.max(1, box.height - TOP - bottom), MARGIN); return { ...rect, top: rect.top + TOP }; })() : null;
  const origin = index !== null ? getOrigin(index) : null;

  const setZoom = useCallback((next: number, around?: { x: number; y: number }) => {
    const target = clampZoom(next);
    setZoomState(target);
    const spring = reduced ? { duration: 0 } : motionTokens.spring.smooth;
    animate(scale, target, spring);
    if (fit) {
      const moved = around ? zoomAround(around, { x: panX.get(), y: panY.get() }, zoom, target) : { x: panX.get(), y: panY.get() };
      const limited = target === MIN_ZOOM ? { x: 0, y: 0 } : clampPan(moved, fit, target);
      animate(panX, limited.x, spring); animate(panY, limited.y, spring);
    }
  }, [fit, panX, panY, reduced, scale, zoom]);

  const go = useCallback((next: number) => {
    if (index === null) return;
    const target = Math.min(images.length - 1, Math.max(0, next));
    if (target === index) return;
    direction.current = target > index ? 1 : -1;
    first.current = false;
    onIndexChange(target);
  }, [images.length, index, onIndexChange]);

  const close = useCallback(() => {
    if (index === null || closing) return;
    if (reduced || !origin) { onClose(index); return; }
    setClosing(true);
  }, [closing, index, onClose, origin, reduced]);

  useEffect(() => { setZoomState(1); scale.set(1); panX.set(0); panY.set(0); pull.set(0); }, [index, scale, panX, panY, pull]);
  useEffect(() => { if (!open) { first.current = true; setClosing(false); } }, [open]);
  // Kapanış uçuşu bir nedenle bitmezse (sekme arka planda, hedef görünmüyor) görüntüleyici yine de kapanır.
  useEffect(() => {
    if (!closing || index === null) return;
    const timer = window.setTimeout(() => onClose(index), 900);
    return () => window.clearTimeout(timer);
  }, [closing, index, onClose]);

  // Ctrl+tekerlek yakınlaştırır; tarayıcının sayfa yakınlaştırmasını engellemek için pasif olmayan dinleyici gerekir.
  useEffect(() => {
    const node = area.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const rect = node.getBoundingClientRect();
      setZoom(zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15), { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 });
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  });

  const keys = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); go((index ?? 0) - 1); }
    else if (event.key === "ArrowRight") { event.preventDefault(); go((index ?? 0) + 1); }
    else if (event.key === "Home") { event.preventDefault(); go(0); }
    else if (event.key === "End") { event.preventDefault(); go(images.length - 1); }
    else if (event.key === "+" || event.key === "=") { event.preventDefault(); setZoom(zoomIn(zoom)); }
    else if (event.key === "-") { event.preventDefault(); setZoom(zoomOut(zoom)); }
    else if (event.key === "0") { event.preventDefault(); setZoom(1); }
  };

  const down = (event: ReactPointerEvent) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  };
  const move = (event: ReactPointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const next = pinchZoom(pinch.current.zoom, pinch.current.distance, Math.hypot(a.x - b.x, a.y - b.y));
      setZoomState(next); scale.set(next);
      if (fit) { const limited = next === MIN_ZOOM ? { x: 0, y: 0 } : clampPan({ x: panX.get(), y: panY.get() }, fit, next); panX.set(limited.x); panY.set(limited.y); }
    }
  };
  const up = (event: ReactPointerEvent) => { pointers.current.delete(event.pointerId); if (pointers.current.size < 2) pinch.current = null; };

  const placed = fit ? { left: fit.left, top: fit.top, width: fit.width, height: fit.height } : null;
  const target = closing && origin ? { left: origin.left, top: origin.top, width: origin.width, height: origin.height, opacity: 1, x: 0 } : placed ? { ...placed, opacity: 1, x: 0 } : undefined;
  const startFrom = first.current && !reduced && origin ? { left: origin.left, top: origin.top, width: origin.width, height: origin.height, opacity: 1, x: 0 } : { opacity: 0, x: reduced ? 0 : 40 * direction.current };
  const frameTransition = reduced ? { duration: 0 } : first.current || closing ? motionTokens.spring.morph : { duration: motionTokens.duration.standard };

  return <DialogPrimitive.Root open={open} onOpenChange={next => { if (!next) close(); }}>
    <AnimatePresence>
      {open && current && <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay asChild forceMount><motion.div className={styles.overlay} style={{ opacity: fade }} initial={{ opacity: 0 }} animate={{ opacity: closing ? 0 : 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : motionTokens.duration.standard }} /></DialogPrimitive.Overlay>
        <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}
          onOpenAutoFocus={event => { event.preventDefault(); closeButton.current?.focus(); }} onCloseAutoFocus={event => event.preventDefault()}
          onEscapeKeyDown={event => { if (zoom > 1) { event.preventDefault(); setZoom(1); } }}>
          <motion.div className={styles.viewer} onKeyDown={keys} data-narrow={narrow || undefined} initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}>
            <DialogPrimitive.Title className={srOnly}>{label}</DialogPrimitive.Title>
            <div ref={area} className={styles.area} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
              onDoubleClick={event => { const rect = event.currentTarget.getBoundingClientRect(); setZoom(zoom > 1 ? 1 : 2.5, { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 }); }}>
              <AnimatePresence mode="popLayout" initial={false} custom={direction.current}>
                {target && <motion.div key={current.id} className={styles.frame} role="group" aria-roledescription="slayt" aria-label={`${current.title ?? current.alt}, ${counterText(index!, images.length)}`}
                  style={{ y: pull, touchAction: "none" }} variants={slide} custom={direction.current}
                  initial={startFrom} animate={target} exit="out" transition={frameTransition}
                  onAnimationComplete={() => { if (closing) { onClose(index!); } else { first.current = false; } }}
                  onPan={(_, info) => { if (zoom > 1 || pointers.current.size > 1) return; if (Math.abs(info.offset.y) > Math.abs(info.offset.x) * 1.2 && info.offset.y > 0) pull.set(info.offset.y * .6); }}
                  onPanEnd={(_, info) => {
                    if (zoom > 1 || pointers.current.size > 1) return;
                    if (pull.get() > 0 && pullCloses(info.offset.y, info.velocity.y)) { animate(pull, 0, { duration: 0 }); close(); return; }
                    animate(pull, 0, reduced ? { duration: 0 } : motionTokens.spring.smooth);
                    const step = Math.abs(info.offset.x) > Math.abs(info.offset.y) ? swipeStep(info.offset.x, info.velocity.x, index!, images.length) : 0;
                    if (step) go(index! + step);
                  }}>
                  <motion.div className={styles.zoomer} drag={zoom > 1 && !reduced} dragMomentum={false} dragElastic={.08}
                    dragConstraints={(() => { const limit = fit ? panLimit(fit, zoom) : { x: 0, y: 0 }; return { left: -limit.x, right: limit.x, top: -limit.y, bottom: limit.y }; })()}
                    style={{ x: panX, y: panY, scale, cursor: zoom > 1 ? "grab" : "zoom-in" }}>
                    <Photo image={current} />
                  </motion.div>
                </motion.div>}
              </AnimatePresence>
            </div>
            <header className={styles.bar}>
              <span className={styles.counter} role="status" aria-live="polite">{counterText(index!, images.length)}</span>
              <div className={styles.tools}>
                {index !== null && renderExtra?.(current, index)}
                <button type="button" className={styles.tool} aria-pressed={zoom > 1} aria-label="Yakınlaştır" onClick={() => setZoom(zoom > 1 ? 1 : 2.5)}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.2-4.2M11 8v6M8 11h6" /></svg>
                </button>
                <button ref={closeButton} type="button" className={styles.tool} aria-label="Kapat" onClick={close}>✕</button>
              </div>
            </header>
            {!narrow && images.length > 1 && <>
              <button type="button" className={styles.arrow} data-side="prev" aria-label="Önceki" disabled={index === 0} onClick={() => go((index ?? 0) - 1)}>‹</button>
              <button type="button" className={styles.arrow} data-side="next" aria-label="Sonraki" disabled={index === images.length - 1} onClick={() => go((index ?? 0) + 1)}>›</button>
            </>}
            {(current.title || current.caption) && <footer className={styles.caption} style={{ bottom: filmstrip && images.length > 1 ? 88 : 12 }}>{current.title && <b>{current.title}</b>}{current.caption && <span>{current.caption}</span>}</footer>}
            {filmstrip && images.length > 1 && <ul className={styles.film} aria-label="Küçük resimler">{images.map((image, at) => <li key={image.id}>
              <button type="button" className={styles.thumb} aria-current={at === index || undefined} aria-label={`${at + 1}. fotoğraf: ${image.title ?? image.alt}`} onClick={() => go(at)} ref={node => { if (node && at === index) node.scrollIntoView?.({ inline: "center", block: "nearest" }); }}>
                {image.src ? <img src={image.src} alt="" loading="lazy" /> : <Placeholder tone={image.tone} label="" ratio="1 / 1" />}
              </button>
            </li>)}</ul>}
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>}
    </AnimatePresence>
  </DialogPrimitive.Root>;
}
