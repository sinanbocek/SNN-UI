"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useReducedMotionSafe } from "./viz-utils";

/** Panel içindeki kapat düğmesine yayılacak özellikler: odak açılışta buraya gelir, `Esc` de kapatır. */
export type MorphCloseProps = { "data-morph-close": true; onClick: () => void };

export interface MorphGridProps<T extends { key: string }> {
  items: T[];
  /** Açık kartın anahtarı; yoksa null. Denetimlidir. */
  openKey: string | null;
  onOpenChange: (key: string | null) => void;
  /** Kart içeriği. Kartın etkileşimli öğesi bir `<button>` olmalıdır (odak kapanınca ona döner). */
  renderCard: (item: T, open: () => void) => ReactNode;
  /** Açık panel içeriği. */
  renderPanel: (item: T, closeProps: MorphCloseProps) => ReactNode;
  /** Açık panelin bölge adı. */
  panelLabel: (item: T) => string;
  className?: string;
  gridClassName?: string;
  cardClassName?: string;
  panelClassName?: string;
  /** Açılamayan (örneğin verisiz) kartlar. */
  isDisabled?: (item: T) => boolean;
}

/**
 * Kartların ızgarası; bir karta basınca kart, aynı yüzeyin büyümesiyle (paylaşılan düzen geçişi) panele dönüşür, kapatınca aynı karta geri katlanır.
 * Açıkken ızgara etkisizdir (`inert`: odaklanamaz, ekran okuyucudan gizlenir). Açılışta odak kapat düğmesine, kapanışta karta gider.
 */
export function MorphGrid<T extends { key: string }>({ items, openKey, onOpenChange, renderCard, renderPanel, panelLabel, className, gridClassName, cardClassName, panelClassName, isDisabled }: MorphGridProps<T>) {
  const reduced = useReducedMotionSafe();
  const shells = useRef(new Map<string, HTMLElement>());
  const panel = useRef<HTMLElement>(null);
  const lastOpen = useRef<string | null>(null);
  // Panel ızgaradan uzunsa kap onun boyuna uzar (panel kapta mutlak konumlanır, yoksa sayfanın geri kalanının üstüne taşardı).
  const [panelHeight, setPanelHeight] = useState(0);
  const transition = reduced ? { duration: .12 } : { type: "spring" as const, visualDuration: .42, bounce: .1 };

  useEffect(() => {
    if (openKey) {
      lastOpen.current = openKey;
      const frame = requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("[data-morph-close]")?.focus());
      return () => cancelAnimationFrame(frame);
    }
    const key = lastOpen.current;
    if (!key) return;
    lastOpen.current = null;
    const frame = requestAnimationFrame(() => shells.current.get(key)?.querySelector<HTMLElement>("button")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [openKey]);

  const open = items.find(item => item.key === openKey) ?? null;
  useEffect(() => {
    const node = panel.current;
    if (!open || !node) { setPanelHeight(0); return; }
    const read = () => setPanelHeight(node.scrollHeight);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, [open]);

  return <LayoutGroup>
    <div className={className} style={{ position: "relative", minHeight: open ? panelHeight : undefined }}>
      <div className={gridClassName} inert={open !== null}>
        {items.map(item => item.key === openKey
          ? <div key={item.key} className={cardClassName} style={{ visibility: "hidden" }} aria-hidden="true">{renderCard(item, () => undefined)}</div>
          : <motion.div key={item.key} layoutId={`morph-${item.key}`} className={cardClassName} transition={transition} ref={node => { if (node) shells.current.set(item.key, node); else shells.current.delete(item.key); }}>
              {renderCard(item, () => { if (!isDisabled?.(item)) onOpenChange(item.key); })}
            </motion.div>)}
      </div>
      <AnimatePresence>
        {open && <motion.section key={open.key} ref={panel} layoutId={`morph-${open.key}`} className={panelClassName} role="region" aria-label={panelLabel(open)} transition={transition}
          style={{ position: "absolute", top: 0, right: 0, left: 0, zIndex: 2, minHeight: "100%", overflow: "auto" }}
          onKeyDown={event => { if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); onOpenChange(null); } }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: reduced ? 0 : .14, duration: .2 } }} exit={{ opacity: 0, transition: { duration: .1 } }}>
            {renderPanel(open, { "data-morph-close": true, onClick: () => onOpenChange(null) })}
          </motion.div>
        </motion.section>}
      </AnimatePresence>
    </div>
  </LayoutGroup>;
}
