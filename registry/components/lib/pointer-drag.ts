"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

/** Sürüklenen öğenin anlık durumu. Konumlar pencereye göredir (viewport). */
export interface PointerDragState<T> {
  item: T;
  /** İşaretçinin şu anki konumu. */
  x: number;
  y: number;
  /** İşaretçinin, tutulan öğenin sol üst köşesine uzaklığı: öğe tutulduğu noktadan imleci izler. */
  grabX: number;
  grabY: number;
  /** Tutulan öğenin boyutu. */
  width: number;
  height: number;
  /** Yatay hız, px/sn (yumuşatılmış): kartı hıza göre yatırmak için. */
  velocityX: number;
}

export interface PointerDragOptions<T> {
  /** Sürükleme sayılması için gereken hareket, px. Varsayılan 5. */
  threshold?: number | undefined;
  /** Dokunmatikte basılı tutma süresi, ms. Süre dolmadan parmak kayarsa sürükleme başlamaz ve sayfa kayar. Varsayılan 220. */
  touchDelay?: number | undefined;
  /** Sürükleme başladı. */
  onStart?: ((state: PointerDragState<T>) => void) | undefined;
  /** İşaretçi her kıpırdadığında. Bırakma hedefini bulmak için `findDropTarget` kullanılır. */
  onMove?: ((state: PointerDragState<T>) => void) | undefined;
  /** Bırakıldı. `cancelled` true ise iptal edilmiştir (Esc, pencere kaybı). */
  onEnd?: ((state: PointerDragState<T>, cancelled: boolean) => void) | undefined;
  /** Kenara yaklaşınca kaydırılacak kaplar (ör. pano ve sütunlar). */
  scrollContainers?: (() => (HTMLElement | null)[]) | undefined;
  /** Kenara kaç px kala kaydırma başlar. Varsayılan 48. */
  edge?: number | undefined;
}

/** (x, y) noktasının altındaki, `selector`a uyan en yakın öğeyi bulur. */
export function findDropTarget(x: number, y: number, selector: string): HTMLElement | null {
  for (const element of document.elementsFromPoint(x, y)) {
    const match = (element as HTMLElement).closest?.(selector);
    if (match) return match as HTMLElement;
  }
  return null;
}

/**
 * İşaretçi olaylarıyla (fare, dokunma, kalem) sürükleme motoru; kütüphane kullanmaz.
 * Dönen `bind(item)` sürüklenecek öğeye yayılır; `drag` sürüklenen öğenin durumudur (yoksa null).
 * Klavyeyle taşıma bu motorun işi değildir: kullanan blok ayrıca sunar.
 */
export function usePointerDrag<T>(options: PointerDragOptions<T> = {}) {
  const opts = useRef(options);
  opts.current = options;
  const [drag, setDrag] = useState<PointerDragState<T> | null>(null);
  const live = useRef<PointerDragState<T> | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const justDragged = useRef(false);

  const finish = useCallback((cancelled: boolean) => {
    const state = live.current;
    cleanup.current?.();
    cleanup.current = null;
    live.current = null;
    if (state) {
      setDrag(null);
      justDragged.current = true;
      setTimeout(() => { justDragged.current = false; }, 0);
      opts.current.onEnd?.(state, cancelled);
    }
  }, []);

  // Bileşen kalkarsa dinleyiciler temizlenir.
  useEffect(() => () => { cleanup.current?.(); }, []);

  const start = useCallback((item: T, event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0 || live.current || cleanup.current) return;
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const touch = event.pointerType === "touch";
    const origin = { x: event.clientX, y: event.clientY };
    const pointerId = event.pointerId;
    let pointer = { ...origin };
    let began = false;
    let armed = !touch;
    let lastX = origin.x;
    let lastTime = performance.now();
    let velocity = 0;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const threshold = opts.current.threshold ?? 5;

    const snapshot = (): PointerDragState<T> => ({ item, x: pointer.x, y: pointer.y, grabX: origin.x - rect.left, grabY: origin.y - rect.top, width: rect.width, height: rect.height, velocityX: velocity });

    const scrollLoop = () => {
      frame = requestAnimationFrame(scrollLoop);
      const edge = opts.current.edge ?? 48;
      for (const container of opts.current.scrollContainers?.() ?? []) {
        if (!container) continue;
        const box = container.getBoundingClientRect();
        if (pointer.x < box.left || pointer.x > box.right || pointer.y < box.top || pointer.y > box.bottom) continue;
        const near = (distance: number) => Math.min(1, Math.max(0, (edge - distance) / edge)) * 14;
        container.scrollLeft += near(box.right - pointer.x) - near(pointer.x - box.left);
        container.scrollTop += near(box.bottom - pointer.y) - near(pointer.y - box.top);
      }
    };

    const begin = () => {
      began = true;
      live.current = snapshot();
      setDrag(live.current);
      opts.current.onStart?.(live.current);
      frame = requestAnimationFrame(scrollLoop);
    };

    const onMove = (move: PointerEvent) => {
      if (move.pointerId !== pointerId) return;
      pointer = { x: move.clientX, y: move.clientY };
      if (!began) {
        if (Math.hypot(pointer.x - origin.x, pointer.y - origin.y) < threshold) return;
        // Dokunmatikte süre dolmadan kayma: sayfa kaydırması olarak bırakılır.
        if (!armed) { abort(); return; }
        begin();
      }
      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      velocity = velocity * 0.7 + ((pointer.x - lastX) / dt) * 1000 * 0.3;
      lastX = pointer.x;
      lastTime = now;
      live.current = snapshot();
      setDrag(live.current);
      opts.current.onMove?.(live.current);
    };
    const onUp = (up: PointerEvent) => { if (up.pointerId === pointerId) { if (began) finish(false); else abort(); } };
    const onCancel = (cancel: PointerEvent) => { if (cancel.pointerId === pointerId) { if (began) finish(true); else abort(); } };
    const onKey = (key: KeyboardEvent) => { if (key.key === "Escape" && began) { key.preventDefault(); finish(true); } };
    const onTouchMove = (touchEvent: TouchEvent) => { if (began) touchEvent.preventDefault(); };
    const onSelect = (selectEvent: Event) => { if (began) selectEvent.preventDefault(); };

    function abort() {
      cleanup.current?.();
      cleanup.current = null;
    }

    cleanup.current = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("selectstart", onSelect);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("selectstart", onSelect);
    if (touch) timer = setTimeout(() => { armed = true; begin(); }, opts.current.touchDelay ?? 220);
  }, [finish]);

  /** Sürüklenecek öğeye yayılır: `<div {...bind(item)}>`. Sürükleme sonrası gelen tıklamayı yutar. */
  const bind = useCallback((item: T) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => start(item, event),
    onClickCapture: (event: ReactMouseEvent<HTMLElement>) => { if (justDragged.current) { event.stopPropagation(); event.preventDefault(); } },
  }), [start]);

  return { drag, bind, cancel: () => finish(true) };
}
