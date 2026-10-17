"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, ReactElement, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion } from "motion/react";
import type { TargetAndTransition } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { Tooltip } from "../tooltip/tooltip";
import styles from "./floating-button-group.module.css";

export type FloatingButtonGroupVariant = "muted" | "floating";
export type FloatingButtonGroupSize = "sm" | "md";
export type FloatingButtonGroupOrientation = "horizontal" | "vertical";

export interface FloatingButtonGroupAction {
  type?: "action";
  /** Kararlı anahtar; onAction'a da bu verilir. */
  id: string;
  /** Görünen yazı; öğe yalnız simge gösterirken erişilebilir ad da budur. */
  label: string;
  icon?: ReactNode;
  /** Yalnız simgeyi gösterir. Yazı ipucu kutusuna ve erişilebilir ada taşınır. Grubun iconOnly değerini geçersiz kılar. */
  iconOnly?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  /** Bir kipi açan eylemi (ör. Sunum) işaretler. aria-pressed'i ayarlar, açıkken sakin bir ton tutar. */
  pressed?: boolean;
  /** İpucu kutusunda gösterilen kısayol notu, ör. "Ctrl+Z". Bileşen tuşu bağlamaz. */
  shortcut?: string;
  /** Bu öğenin geçebileceği başka yazılar, ör. Paylaş için ["Kopyalandı"]. Düğme en geniş yazının genişliğini korur; yazı değişince hiçbir şey kaymaz. */
  reserveLabels?: readonly string[];
}

export interface FloatingButtonGroupSeparator {
  type: "separator";
  id?: string;
}

export type FloatingButtonGroupItem = FloatingButtonGroupAction | FloatingButtonGroupSeparator;

export interface FloatingButtonGroupProps {
  items: readonly FloatingButtonGroupItem[];
  /** Araç çubuğunun erişilebilir adı, ör. "Pano işlemleri". */
  label: string;
  /** muted sayfada sakin durur; floating, seçim araç çubuğu gibi katman öğeleri için tepsiyi yüzen gölgeyle yükseltir. */
  variant?: FloatingButtonGroupVariant;
  size?: FloatingButtonGroupSize;
  orientation?: FloatingButtonGroupOrientation;
  /** Her öğeyi yalnız simge olarak gösterir, yazı ipucu kutusunda olur. Kendi iconOnly değeri olan öğe önceliklidir. */
  iconOnly?: boolean;
  /** Öğe ipucu kutularının yönü. Satırda varsayılan üst, sütunda sağdır. */
  tooltipSide?: "top" | "bottom" | "left" | "right";
  /** Öğenin kendi onSelect'inden sonra öğe kimliğiyle çağrılır. */
  onAction?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

const isAction = (item: FloatingButtonGroupItem): item is FloatingButtonGroupAction => item.type !== "separator";
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const enter = [...motionTokens.ease.enter] as [number, number, number, number];

const rest: TargetAndTransition = { opacity: 1, y: 0, filter: "blur(0px)" };
const textIn: TargetAndTransition = { opacity: 0, y: 4, filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: -3, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } };
const fadeIn: TargetAndTransition = { opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };

function Phase({ children, reduced }: { children: ReactNode; reduced: boolean }) {
  const present = useIsPresent();
  return <motion.span className={styles.phase} aria-hidden={present ? undefined : true} initial={reduced ? fadeIn : textIn} animate={rest} exit={reduced ? fadeOut : textOut} transition={{ duration: reduced ? motionTokens.duration.instant : motionTokens.duration.standard, ease: enter }}>{children}</motion.span>;
}

/**
 * Simge ve yazı. Öğenin gösterebileceği her yazı aynı ızgara hücresinde görünmez dizilir; düğme hep en geniş yazının
 * genişliğinde kalır. Yazı değişince yerinde çapraz geçiş olur, düğme, komşuları ve tepsi boyut değiştirmez.
 */
function ItemBody({ label, icon, iconOnly, reserve, reduced }: { label: string; icon?: ReactNode; iconOnly: boolean; reserve: readonly string[]; reduced: boolean }) {
  const ghosts = iconOnly ? [] : Array.from(new Set([label, ...reserve]));
  return <span className={styles.slot}>
    {ghosts.map(text => <span key={text} className={styles.ghost} aria-hidden="true">
      {icon ? <span className={styles.iconSpace} /> : null}
      <span className={styles.text}>{text}</span>
    </span>)}
    <AnimatePresence initial={false}>
      <Phase key={label} reduced={reduced}>
        {icon ? <span className={styles.icon} aria-hidden="true">{icon}</span> : null}
        {iconOnly ? null : <span className={styles.text}>{label}</span>}
      </Phase>
    </AnimatePresence>
  </span>;
}

function TipContent({ label, shortcut }: { label: string; shortcut?: string }) {
  return <span className={styles.tip}>{label}{shortcut ? <kbd className={styles.kbd}>{shortcut}</kbd> : null}</span>;
}

/** Sütun için yan ipucu kutuları. Kütüphanedeki Tooltip üstte ya da altta açılır ve komşu düğmeyi örterdi. */
function SideTip({ side, content, children }: { side: "left" | "right"; content: ReactNode; children: ReactElement }) {
  return <TooltipPrimitive.Root>
    <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content className={styles.sideTip} side={side} sideOffset={10} collisionPadding={12}>{content}</TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  </TooltipPrimitive.Root>;
}

/**
 * Sakin bir tepsi içinde ayrı yumuşak düğmeler. Ortak tek bir vurgu, imlecin ya da klavye odağının bulunduğu düğmeye
 * konum ve boyut olarak akar, imleç tepsiden çıkınca silinir, düğmeye basılırken yerinde koyulaşır.
 * Araç çubuğunun tek üzerine gelme ve odak göstergesidir. Ok tuşları odağı taşır, Home ve End uçlara atlar, Enter ve Boşluk eylemi çalıştırır.
 */
export function FloatingButtonGroup({ items, label, variant = "muted", size = "md", orientation = "horizontal", iconOnly: groupIconOnly = false, tooltipSide, onAction, className, style }: FloatingButtonGroupProps) {
  const reduced = useReducedMotion() ?? false;
  const tray = useRef<HTMLDivElement>(null);
  const nodes = useRef(new Map<string, HTMLButtonElement>());
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [pressing, setPressing] = useState(false);
  const [tabStop, setTabStop] = useState<string | null>(null);

  const actions = items.filter(isAction);
  const byId = new Map(actions.map(action => [action.id, action]));
  const enabled = (id: string | null) => !!id && !!byId.get(id) && !byId.get(id)?.disabled;
  // İmleç tepsideyken klavye odağından önceliklidir; imlecin altındaki devre dışı öğe vurguyu odağa geri verir.
  const activeId = enabled(hoverId) ? hoverId : focusId && byId.has(focusId) ? focusId : null;
  const stop = enabled(tabStop) ? tabStop : actions.find(action => !action.disabled)?.id ?? null;
  const vertical = orientation === "vertical";
  const side = tooltipSide ?? (vertical ? "right" : "top");
  const idsKey = actions.map(action => action.id).join("\u0000");

  // Vurgu motion değerlerinde yaşar; taşınırken düğmeler yeniden çizilmez.
  const x = useMotionValue(0), y = useMotionValue(0), width = useMotionValue(0), height = useMotionValue(0);
  const opacity = useMotionValue(0), scale = useMotionValue(1);
  const traveling = useRef(false);
  const activeRef = useRef(activeId);
  const pressingRef = useRef(pressing);

  /** Düğmenin tepsi koordinatlarındaki kutusu; cihaz pikseline tam (offsetLeft tam piksele yuvarlar) ve üst öğelerin dönüşümlerinden bağımsız. */
  const measure = useCallback((node: HTMLElement) => {
    const root = tray.current;
    if (!root) return null;
    const outer = root.getBoundingClientRect(), box = node.getBoundingClientRect();
    const unscale = outer.width ? root.offsetWidth / outer.width : 1;
    const dpr = window.devicePixelRatio || 1;
    const snap = (value: number) => Math.round(value * unscale * dpr) / dpr;
    return { x: snap(box.left - outer.left) - root.clientLeft, y: snap(box.top - outer.top) - root.clientTop, width: snap(box.width), height: snap(box.height) };
  }, []);

  const place = useCallback((id: string | null, mode: "move" | "follow") => {
    const node = id ? nodes.current.get(id) : undefined;
    if (!node) {
      animate(opacity, 0, { duration: reduced ? motionTokens.duration.instant : motionTokens.duration.standard, ease: standard });
      return;
    }
    const rect = measure(node);
    if (!rect) return;
    const visible = opacity.get() > .15;
    // Düğmeler arasında morph yayıyla gider. Yoktan belirme ve azaltılmış harekette her taşıma yerine atlar.
    const travel = !reduced && visible && (mode === "move" || traveling.current);
    if (travel) {
      traveling.current = true;
      animate(x, rect.x, motionTokens.spring.morph);
      animate(y, rect.y, motionTokens.spring.morph);
      animate(width, rect.width, motionTokens.spring.morph);
      animate(height, rect.height, { ...motionTokens.spring.morph, onComplete: () => { traveling.current = false; } });
    } else {
      traveling.current = false;
      x.jump(rect.x); y.jump(rect.y); width.jump(rect.width); height.jump(rect.height);
      if (!visible && !reduced) {
        scale.jump(.94);
        animate(scale, pressingRef.current ? .965 : 1, motionTokens.spring.snappy);
      }
    }
    if (opacity.get() !== 1) animate(opacity, 1, { duration: reduced ? motionTokens.duration.instant : motionTokens.duration.fast, ease: standard });
  }, [height, measure, opacity, reduced, scale, width, x, y]);

  useLayoutEffect(() => {
    activeRef.current = activeId;
    place(activeId, "move");
  }, [activeId, place]);

  useEffect(() => {
    pressingRef.current = pressing;
    animate(scale, pressing && activeId ? .965 : 1, reduced ? { duration: 0 } : motionTokens.spring.snappy);
  }, [activeId, pressing, reduced, scale]);

  // Yüklenen bir yazı tipi ya da yeniden akan bir kap düğmeleri oynatır; vurgu yolculuk yapmadan peşinden gider.
  useEffect(() => {
    const root = tray.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => { if (activeRef.current) place(activeRef.current, "follow"); });
    observer.observe(root);
    nodes.current.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [idsKey, place]);

  // Yerel dinleyici: React imleç olaylarını portallardan geçirir. Düğmeden ipucu kutusuna geçmek
  // tepsiden çıkmak sayılmaz ve vurgu geride kalırdı.
  useEffect(() => {
    const root = tray.current;
    if (!root) return;
    const leave = () => { setHoverId(null); setPressing(false); };
    root.addEventListener("pointerleave", leave);
    return () => root.removeEventListener("pointerleave", leave);
  }, []);

  const buttons = () => Array.from(tray.current?.querySelectorAll<HTMLButtonElement>("[data-fbg-item]") ?? []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const all = buttons();
    const index = all.findIndex(node => node === document.activeElement);
    if (index < 0) return;
    const next = vertical ? "ArrowDown" : "ArrowRight";
    const previous = vertical ? "ArrowUp" : "ArrowLeft";
    const usable = (node: HTMLButtonElement) => node.getAttribute("aria-disabled") !== "true";
    let target: HTMLButtonElement | undefined;
    if (event.key === "Home") target = all.find(usable);
    else if (event.key === "End") target = [...all].reverse().find(usable);
    else if (event.key === next || event.key === previous) {
      const step = event.key === next ? 1 : -1;
      for (let offset = 1; offset <= all.length; offset += 1) {
        const candidate = all[(index + step * offset + all.length * offset) % all.length]!;
        if (usable(candidate)) { target = candidate; break; }
      }
    } else return;
    event.preventDefault();
    if (!target) return;
    // İmleç yeniden hareket edene kadar vurguyu klavye geri alır.
    setHoverId(null);
    target.focus();
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (tray.current?.contains(event.relatedTarget as Node | null)) return;
    setFocusId(null);
    setPressing(false);
  };

  const classes = [styles.group, styles[variant], styles[size], vertical ? styles.vertical : "", className].filter(Boolean).join(" ");

  const group = <div
    ref={tray}
    className={classes}
    style={style}
    role="toolbar"
    aria-label={label}
    aria-orientation={orientation}
    data-variant={variant}
    onKeyDown={onKeyDown}
    onBlur={onBlur}
  >
    <motion.span className={styles.highlight} data-pressing={pressing && activeId ? "" : undefined} style={{ x, y, width, height, opacity, scale }} aria-hidden="true" />
    {items.map((item, position) => {
      if (!isAction(item)) return <span key={item.id ?? `separator-${position}`} className={styles.separator} role="separator" aria-orientation={vertical ? "horizontal" : "vertical"} />;
      const { id, label: itemLabel, icon, onSelect, disabled = false, pressed, shortcut, reserveLabels = [] } = item;
      const iconOnly = !!icon && (item.iconOnly ?? groupIconOnly);
      const button = <button
        ref={node => { if (node) nodes.current.set(id, node); else nodes.current.delete(id); }}
        type="button"
        className={styles.item}
        data-fbg-item=""
        data-active={activeId === id ? "" : undefined}
        data-icon={icon ? "" : undefined}
        data-icon-only={iconOnly ? "" : undefined}
        aria-label={itemLabel}
        aria-pressed={pressed === undefined ? undefined : pressed}
        aria-disabled={disabled || undefined}
        tabIndex={stop === id ? 0 : -1}
        onPointerMove={event => { if (event.pointerType === "mouse" || event.pointerType === "pen") setHoverId(id); }}
        onPointerDown={event => { if (disabled || event.button !== 0) return; setHoverId(id); setPressing(true); }}
        onPointerUp={() => setPressing(false)}
        onPointerCancel={() => setPressing(false)}
        onPointerLeave={() => setPressing(false)}
        onKeyDown={event => { if ((event.key === "Enter" || event.key === " ") && !event.repeat && !disabled) setPressing(true); }}
        onKeyUp={event => { if (event.key === "Enter" || event.key === " ") setPressing(false); }}
        onFocus={event => {
          setTabStop(id);
          let keyboard = false;
          try { keyboard = event.currentTarget.matches(":focus-visible"); } catch { keyboard = false; }
          setFocusId(keyboard ? id : null);
        }}
        onClick={() => {
          if (disabled) return;
          onSelect?.();
          onAction?.(id);
        }}
      >
        <ItemBody label={itemLabel} icon={icon} iconOnly={iconOnly} reserve={reserveLabels} reduced={reduced} />
      </button>;
      // İpucu kutuları sarmalayıcı öğe çizmez; her düğme tepsinin doğrudan çocuğu kalır ve ona göre ölçülür.
      if (!iconOnly && !shortcut) return <Fragment key={id}>{button}</Fragment>;
      const tip = <TipContent label={itemLabel} shortcut={shortcut} />;
      return side === "top" || side === "bottom"
        ? <Tooltip key={id} side={side} content={tip}>{button}</Tooltip>
        : <SideTip key={id} side={side} content={tip}>{button}</SideTip>;
    })}
  </div>;

  return side === "left" || side === "right" ? <TooltipPrimitive.Provider delayDuration={250} skipDelayDuration={300} disableHoverableContent>{group}</TooltipPrimitive.Provider> : group;
}

export default FloatingButtonGroup;
