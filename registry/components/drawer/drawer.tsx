"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { PanInfo, Transition } from "motion/react";
import { X } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./drawer.module.css";

/**
 * Çekmecenin en son gösterdiği öğe. Seçili öğeyi (hiçbiri açık değilse null) ver ve çekmece içeriğini
 * dönen değerden çiz; içerik, panel kapanır kapanmaz kaybolmak yerine panel dışarı kayarken ekranda kalır.
 */
export function useDrawerItem<T>(item: T | null | undefined): T | null | undefined {
  const [last, setLast] = useState(item);
  if (item != null && item !== last) setLast(item);
  return item ?? last;
}

/** Açık durumunu yansıtır; panel dışarı kayarken bağlı kalabilsin, yarı yolda yön değiştirebilsin ve sürüklemeden sonra kendini kapatabilsin diye. */
const DrawerContext = createContext<{ open: boolean; flung: boolean; setOpen: (open: boolean) => void; fling: () => void; openedAt: RefObject<number> } | null>(null);

export function Drawer({ open: openProp, defaultOpen = false, onOpenChange, ...props }: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  // Paneli kapatan bir sürükleme hızını çıkış yayına devreder; diğer her kapanış daha kısa geçişi kullanır.
  const [flung, setFlung] = useState(false);
  // Çekmecenin en son ne zaman açıldığı; kapanırken onu yeniden açan tıklama, çıkan panelin dışına tıklama sayılmasın diye.
  const openedAt = useRef(0);
  const open = openProp ?? uncontrolled;
  const setOpen = useCallback((next: boolean) => {
    setFlung(false);
    if (next) openedAt.current = performance.now();
    if (openProp === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  }, [openProp, onOpenChange]);
  const fling = useCallback(() => { setOpen(false); setFlung(true); }, [setOpen]);
  const value = useMemo(() => ({ open, flung, setOpen, fling, openedAt }), [open, flung, setOpen, fling]);
  return <DrawerContext.Provider value={value}><DialogPrimitive.Root {...props} open={open} onOpenChange={setOpen} /></DrawerContext.Provider>;
}

export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export interface DrawerContentProps
  extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  title: string;
  description?: string | undefined;
  children: ReactNode;
  side?: "left" | "right" | "top" | "bottom" | undefined;
  /** Çekmeceyi sayfa gövdesi yerine bu öğenin içinde, kenarlarına tutturarak çizer. Öğenin position: relative ve overflow: hidden olması gerekir. */
  container?: HTMLElement | null | undefined;
}

const fade: Transition = { duration: motionTokens.duration.instant };
/* Tıklama ya da Escape paneli hızla geri götürür; fırlatma hızını aynı uzunluktaki bir yayda korur. Gölge son kısımda solar; böylece panelle birlikte çıkar, kaldırılırken aniden yok olmaz. */
const shadowOut: Transition = { duration: motionTokens.duration.standard, times: [0, .65, 1], ease: "linear" };
const leave: Transition = { default: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.standard] }, opacity: shadowOut };
const flingOut: Transition = { default: { ...motionTokens.spring.smooth, visualDuration: motionTokens.duration.standard }, opacity: shadowOut };

/** Açıkken başlık ya da açıklama değişirse yeni metin aşağıdan yükselir, eski metin yukarı çıkar. */
function SwapText({ text }: { text: string }) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={text}
        className={styles.swap}
        initial={reduced ? false : { opacity: 0, y: "0.3em", filter: `blur(${motionTokens.blur.soft}px)` }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }}
        transition={{ duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  );
}

export function DrawerContent({
  title,
  description,
  children,
  side = "right",
  container,
  className,
  onInteractOutside,
  ...props
}: DrawerContentProps) {
  const drawer = useContext(DrawerContext);
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const offset = useMotionValue<number | string>(0);
  const pan = useRef<number | null>(null);
  const axis = side === "left" || side === "right" ? "x" : "y";
  const sign = side === "right" || side === "bottom" ? 1 : -1;
  const offscreen = { [axis]: `${sign * 100}%` };
  const classes = [styles.content, className].filter(Boolean).join(" ");
  const draggable = drawer !== null && !reduced;

  const panelSize = () => (axis === "x" ? panelRef.current?.offsetWidth : panelRef.current?.offsetHeight) ?? 480;

  // Üst bölüm tutamaçtır. İmleci kenara doğru izler, ters yönde lastik gibi gerilir.
  function panStart(event: PointerEvent) {
    const target = event.target instanceof Element ? event.target : null;
    if (!draggable || target?.closest("button, a, input, select, textarea, [role='button']")) return;
    // Giriş, panelin yüzdesiyle canlandırılır; yarı yolda tutulursa piksele çevrilir.
    const value = offset.get();
    pan.current = typeof value === "number" ? value : parseFloat(value) / 100 * panelSize();
    offset.stop();
  }
  function panMove(_: PointerEvent, info: PanInfo) {
    if (pan.current === null) return;
    const toward = (pan.current + info.offset[axis]) * sign;
    offset.set(sign * (toward >= 0 ? toward : -Math.sqrt(-toward)));
  }
  // Panelin üçte birini aşınca ya da kenara doğru hızlı fırlatılınca çekmece kapanır ve hızını korur; yoksa geri yaylanır.
  function panEnd(_: PointerEvent, info: PanInfo) {
    if (pan.current === null) return;
    pan.current = null;
    const toward = Number(offset.get()) * sign;
    if (toward > panelSize() / 3 || (toward > 0 && info.velocity[axis] * sign > 500)) drawer?.fling();
    else animate(offset, 0, motionTokens.spring.snappy);
  }

  const inner = <>
    <motion.div className={[styles.header, draggable ? styles.handle : ""].filter(Boolean).join(" ")} onPanStart={panStart} onPan={panMove} onPanEnd={panEnd}>
      <div>
        <DialogPrimitive.Title className={styles.title}><SwapText text={title} /></DialogPrimitive.Title>
        {description ? (
          <DialogPrimitive.Description className={styles.description}>
            <SwapText text={description} />
          </DialogPrimitive.Description>
        ) : null}
      </div>
      <DialogPrimitive.Close className={styles.close} aria-label="Çekmeceyi kapat">
        <X size={16} strokeWidth={1.75} aria-hidden="true" />
      </DialogPrimitive.Close>
    </motion.div>
    <div className={styles.body}>{children}</div>
  </>;

  // Yalın bir Radix kökü altında açık durumu burada bilinmez; katmanları bunun yerine data-state'e bağlı CSS anahtar kareleri canlandırır.
  if (drawer === null) {
    return (
      <DialogPrimitive.Portal container={container}>
        <DialogPrimitive.Overlay className={`${styles.overlay} ${styles.keyframes}`} data-contained={container ? "" : undefined} />
        <DialogPrimitive.Content {...props} onInteractOutside={onInteractOutside} data-side={side} data-contained={container ? "" : undefined} className={`${classes} ${styles.keyframes}`}>{inner}</DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }

  // Panel kendi kenarından tam opak olarak yaylanır ve bulunduğu yerden, gelişinden daha hızlı o kenara döner.
  return (
    <AnimatePresence custom={drawer.flung}>
      {drawer.open && (
        <DialogPrimitive.Portal key="drawer" forceMount container={container}>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div
              className={styles.overlay}
              data-contained={container ? "" : undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: reduced ? fade : { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }}
              transition={reduced ? fade : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content
            {...props}
            asChild
            forceMount
            // Radix dışarı tıklamayı tıklama anında okur; kapanan çekmeceyi yeniden açan basış onu tekrar kapatırdı.
            onInteractOutside={event => {
              onInteractOutside?.(event);
              if (event.detail.originalEvent.timeStamp < drawer.openedAt.current) event.preventDefault();
            }}
          >
            <motion.div
              ref={panelRef}
              className={classes}
              data-side={side}
              data-contained={container ? "" : undefined}
              style={{ [axis]: offset }}
              variants={{ exit: (flung: boolean) => reduced ? { opacity: 0, transition: fade } : { ...offscreen, opacity: [1, 1, 0], transition: flung ? flingOut : leave } }}
              initial={reduced ? { opacity: 0 } : { ...offscreen, opacity: 1 }}
              animate={reduced ? { opacity: 1 } : { [axis]: 0, opacity: 1 }}
              exit="exit"
              transition={reduced ? fade : motionTokens.spring.smooth}
            >
              {inner}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export default Drawer;
