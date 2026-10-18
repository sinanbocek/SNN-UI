"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type PanInfo } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import styles from "./liquid-tab-bar.module.css";

export interface LiquidTab {
  id: string;
  label: string;
  /** Sekme simgesi; çağıran verir. */
  icon: ReactNode;
  /** Seçili hâl için isteğe bağlı dolu simge. Yoksa aynı simge dolgulu çizilir. */
  activeIcon?: ReactNode | undefined;
  /** Yeni öğe sayısı; 0 ya da yoksa rozet görünmez. */
  badge?: number | undefined;
}

export type LiquidLabelMode = "active" | "all" | "none";

export interface LiquidTabBarProps {
  tabs: LiquidTab[];
  /** Seçili sekme. Bileşen kontrollüdür; değeri uygulama tutar. */
  value: string;
  onValueChange: (id: string) => void;
  /** Etiket modu: yalnız seçili sekmenin etiketi / hepsinin etiketi / hiçbiri (yalnız simge). */
  labelMode?: LiquidLabelMode | undefined;
  /** Liste adı. */
  label?: string | undefined;
  /** Rozetin okunacak metni: varsayılan "{n} yeni". */
  formatBadge?: ((count: number) => string) | undefined;
  /** Sekme ve panel kimlikleri için taban; `liquidTabId` / `liquidPanelId` ile aynı olmalıdır. */
  idBase?: string | undefined;
  className?: string | undefined;
}

/** Sekmenin kimliği (panelin `aria-labelledby` değeri için). */
export const liquidTabId = (base: string, id: string) => `${base}-tab-${id}`;
/** Panelin kimliği (sekmenin `aria-controls` değeri için). */
export const liquidPanelId = (base: string, id: string) => `${base}-panel-${id}`;

const defaultBadge = (count: number) => `${count} yeni`;

/** Simgeli, birkaç eş bölümlük sekme çubuğu: seçim yüzeyi yeni sekmeye geçerken yer değiştirir, sürüklenip bırakılarak da değişir. Metin ağırlıklı panel sekmeleri için `tabs` kullanılır. */
export function LiquidTabBar({ tabs, value, onValueChange, labelMode = "active", label = "Bölümler", formatBadge = defaultBadge, idBase = "liquid", className }: LiquidTabBarProps) {
  const reduced = useReducedMotion();
  const list = useRef<HTMLDivElement>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const x = useMotionValue(0);
  const span = useMotionValue(0);
  const lean = useMotionValue(0);
  const [bounds, setBounds] = useState<{ left: number; width: number }[]>([]);
  const [shownId, setShownId] = useState<string | null>(labelMode === "active" ? value : null);
  const dragging = useRef(false);
  const index = Math.max(0, tabs.findIndex(tab => tab.id === value));

  // Her sekmenin yerini ve boyunu ölçer; etiket açılıp kapanırken de izler.
  const measure = useCallback(() => {
    setBounds(tabs.map(tab => { const node = refs.current[tab.id]; return { left: node?.offsetLeft ?? 0, width: node?.offsetWidth ?? 0 }; }));
  }, [tabs]);
  useLayoutEffect(() => {
    measure();
    const node = list.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    Object.values(refs.current).forEach(item => item && observer.observe(item));
    return () => observer.disconnect();
  }, [measure, shownId, labelMode]);

  // Seçim yüzeyi seçili sekmeye tek şekil olarak yerleşir (esneme ya da ezilme yok).
  useEffect(() => {
    const target = bounds[index];
    if (!target || target.width === 0 || dragging.current) return;
    if (reduced || span.get() === 0) { x.set(target.left); span.set(target.width); return; }
    const a = animate(x, target.left, motionTokens.spring.smooth);
    const b = animate(span, target.width, motionTokens.spring.smooth);
    return () => { a.stop(); b.stop(); };
  }, [bounds, index, reduced, x, span]);

  // Eski etiket hemen söner, yenisi seçim yerine ulaşınca belirir.
  useEffect(() => {
    if (labelMode !== "active") { setShownId(null); return; }
    if (reduced) { setShownId(value); return; }
    // Etiket zaten doğru sekmedeyse (ilk çizim) gizleyip yeniden göstermeye gerek yok.
    if (shownId === value) return;
    setShownId(null);
    const timer = setTimeout(() => setShownId(value), 170);
    return () => clearTimeout(timer);
  }, [value, labelMode, reduced, shownId]);

  const select = (id: string, focus = false) => {
    if (id !== value) onValueChange(id);
    if (focus) refs.current[id]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const to = (at: number) => { event.preventDefault(); select(tabs[(at + tabs.length) % tabs.length]!.id, true); };
    if (event.key === "ArrowRight") to(index + 1);
    else if (event.key === "ArrowLeft") to(index - 1);
    else if (event.key === "Home") to(0);
    else if (event.key === "End") to(tabs.length - 1);
  };

  // Bırakılan yerdeki en yakın sekme seçilir; hızlı fırlatma en az bir sekme ilerletir.
  const onDragEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    dragging.current = false;
    const center = x.get() + span.get() / 2;
    let nearest = bounds.reduce((best, item, at) => Math.abs(item.left + item.width / 2 - center) < Math.abs((bounds[best]?.left ?? 0) + (bounds[best]?.width ?? 0) / 2 - center) ? at : best, 0);
    if (Math.abs(info.velocity.x) > 500 && nearest === index) nearest = Math.min(tabs.length - 1, Math.max(0, index + (info.velocity.x > 0 ? 1 : -1)));
    const target = bounds[nearest];
    if (target) { animate(x, target.left, motionTokens.spring.smooth); animate(span, target.width, motionTokens.spring.smooth); }
    select(tabs[nearest]!.id);
  };

  const first = bounds[0]?.left ?? 0;
  const last = bounds.length ? bounds[bounds.length - 1]!.left + bounds[bounds.length - 1]!.width - span.get() : 0;

  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      <div ref={list} className={styles.list} role="tablist" aria-label={label} data-label-mode={labelMode} onPointerLeave={() => lean.set(0)}>
        {bounds.length > 0 && (
          <motion.span
            className={styles.surface}
            style={{ x, width: span }}
            drag={tabs.length > 1 ? "x" : false}
            dragConstraints={{ left: first, right: Math.max(first, last) }}
            dragElastic={0.12}
            dragMomentum={false}
            onDragStart={() => { dragging.current = true; }}
            onDragEnd={onDragEnd}
            aria-hidden="true"
          >
            <motion.span className={styles.surfaceFill} style={{ x: lean }} />
          </motion.span>
        )}
        {tabs.map((tab, at) => {
          const selected = tab.id === value;
          const showLabel = labelMode === "all" || (labelMode === "active" && shownId === tab.id);
          const count = tab.badge && tab.badge > 0 ? tab.badge : 0;
          return (
            <button
              key={tab.id}
              ref={node => { refs.current[tab.id] = node; }}
              id={liquidTabId(idBase, tab.id)}
              type="button"
              role="tab"
              className={styles.tab}
              data-selected={selected || undefined}
              data-filled={!tab.activeIcon || undefined}
              aria-selected={selected}
              aria-controls={liquidPanelId(idBase, tab.id)}
              aria-label={count ? `${tab.label}, ${formatBadge(count)}` : tab.label}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(tab.id)}
              onKeyDown={onKeyDown}
              // Fareyle başka sekmenin üstüne gelince seçim yüzeyi o yöne hafifçe meyleder.
              onPointerEnter={event => { if (!reduced && event.pointerType === "mouse") lean.set(at === index ? 0 : at > index ? 5 : -5); }}
            >
              <span className={styles.icon} aria-hidden="true">
                {selected && tab.activeIcon ? tab.activeIcon : tab.icon}
                {count > 0 && <span className={styles.badge}><AnimatedCounter value={count} /></span>}
              </span>
              <AnimatePresence initial={false}>
                {showLabel && (
                  <motion.span
                    key="label"
                    className={styles.label}
                    aria-hidden="true"
                    initial={{ opacity: 0, width: reduced ? "auto" : 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: reduced ? "auto" : 0, transition: { duration: motionTokens.duration.instant } }}
                    transition={reduced ? { duration: motionTokens.duration.instant } : { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}
                  >{tab.label}</motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default LiquidTabBar;
