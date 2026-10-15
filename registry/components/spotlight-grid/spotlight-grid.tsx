"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { Button } from "../button/button";
import { motionTokens } from "../lib/motion-tokens";
import { useAnnouncer } from "../lib/shop-parts";
import { useElementWidth, useReducedMotionSafe } from "../lib/viz-utils";
import { CLOSE, closeLabel, columnsFor, glowAt, spanFor } from "./spotlight-grid-format";
import styles from "./spotlight-grid.module.css";

/** Önizleme çizilirken verilen durum: `active` kart üzerine gelinmiş, odaklanmış ya da ızgara ilk kez görünmüşse true; `reduced` "hareketi azalt" açıkken true (önizleme son halini gösterir). */
export interface PreviewContext { active: boolean; reduced: boolean }
/** Ayrıntı çizilirken verilen bağlam: `close` ayrıntıyı kapatır, `announce` sonucu kibar canlı bölgede duyurur. */
export interface DetailContext { close: () => void; announce: (message: string) => void }

export interface SpotlightFeature {
  id: string;
  title: string;
  description: string;
  /** İki sütun kaplar (yeterince geniş kapta). */
  wide?: boolean;
  preview: (context: PreviewContext) => ReactNode;
  detail: (context: DetailContext) => ReactNode;
}

/** Dört kadar özelliği kart ızgarasında anlatan tanıtım bölümü için kullanın: imleci izleyen kenar ışığı, karta gelince oynayan küçük önizleme ve karta basınca yerinde büyüyerek çalışan ayrıntıya dönüşen kart. Müşteri hikâyesi galerisi ve tek açılır kart için değil. Önizleme ve ayrıntıyı siz çizersiniz; dağıtım, anahtar ve onay gerçek sistemlere bağlanmaz, benzetimdir. */
export interface SpotlightGridProps {
  title: string;
  subtitle?: string;
  features: SpotlightFeature[];
}

function Card({ feature, columns, intro, open, onOpen, reduced, controls }: { feature: SpotlightFeature; columns: number; intro: boolean; open: boolean; onOpen: () => void; reduced: boolean; controls: string }) {
  const surface = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28 }), sy = useSpring(y, { stiffness: 260, damping: 28 });
  const gx = useTransform(sx, value => `${value}px`), gy = useTransform(sy, value => `${value}px`);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [mouse, setMouse] = useState(false);
  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || reduced) return;
    const rect = surface.current?.getBoundingClientRect();
    if (!rect) return;
    const point = glowAt(rect, event.clientX, event.clientY);
    if (!mouse) { x.jump(point.x); y.jump(point.y); setMouse(true); }
    x.set(point.x); y.set(point.y);
  };
  const active = (hover && mouse) || focus || intro;
  return <motion.div layoutId={open ? undefined : `${controls}-${feature.id}`} ref={surface} className={styles.card} data-span={spanFor(feature.wide, columns)} data-hidden={open || undefined}
    transition={reduced ? { duration: 0 } : { ...motionTokens.spring.morph }} onPointerMove={move} onPointerEnter={event => { if (event.pointerType === "mouse") setHover(true); }} onPointerLeave={() => { setHover(false); setMouse(false); }}>
    <motion.span className={styles.glow} aria-hidden="true" style={{ "--gx": gx, "--gy": gy, opacity: hover && mouse && !reduced ? 1 : 0 } as never} />
    <div className={styles.preview} aria-hidden="true">{feature.preview({ active, reduced })}</div>
    <h3 className={styles.cardTitle}><button type="button" data-feature={feature.id} className={styles.cardButton} aria-expanded={open} aria-controls={`${controls}-panel`} onClick={onOpen} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}>{feature.title}</button></h3>
    <p className={styles.cardText}>{feature.description}</p>
  </motion.div>;
}

export function SpotlightGrid({ title, subtitle, features }: SpotlightGridProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [box, width] = useElementWidth<HTMLElement>();
  const gridRef = useRef<HTMLDivElement>(null);
  const seen = useInView(gridRef, { once: true, amount: .4 });
  const [intro, setIntro] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [live, announce] = useAnnouncer();
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<string | null>(null);
  const columns = columnsFor(width);
  const feature = features.find(item => item.id === openId) ?? null;

  useEffect(() => { if (!seen || reduced) return; setIntro(true); const timer = window.setTimeout(() => setIntro(false), 2600); return () => window.clearTimeout(timer); }, [seen, reduced]);
  useEffect(() => { if (openId) closeButton.current?.focus(); }, [openId]);
  const close = () => {
    const id = openId;
    setOpenId(null);
    if (id) requestAnimationFrame(() => (box.current?.querySelector(`[data-feature="${id}"]`) as HTMLElement | null)?.focus());
  };

  return <section ref={box} className={styles.root} aria-labelledby={`${uid}-title`} data-reduced={reduced || undefined} onKeyDown={event => { if (event.key === "Escape" && openId) { event.stopPropagation(); close(); } }}>
    <header className={styles.head}><h2 id={`${uid}-title`} className={styles.title}>{title}</h2>{subtitle && <p className={styles.subtitle}>{subtitle}</p>}</header>
    <div className={styles.stage}>
      <div ref={gridRef} className={styles.grid} data-columns={columns} inert={openId ? true : undefined}>
        {features.map(item => <div key={item.id} className={styles.slot} data-span={spanFor(item.wide, columns)}>
          <Card feature={item} columns={columns} intro={intro} open={openId === item.id} reduced={reduced} controls={uid} onOpen={() => { opener.current = item.id; setOpenId(item.id); }} />
        </div>)}
      </div>
      <AnimatePresence>
        {feature && <motion.div key={feature.id} id={`${uid}-panel`} layoutId={`${uid}-${feature.id}`} className={styles.panel} role="region" aria-label={feature.title}
          transition={reduced ? { duration: 0 } : { ...motionTokens.spring.smooth }} initial={reduced ? { opacity: 0 } : undefined} animate={{ opacity: 1 }} exit={reduced ? { opacity: 0 } : undefined}>
          <div className={styles.panelHead}><h3>{feature.title}</h3><Button ref={closeButton} variant="ghost" size="sm" onClick={close} aria-label={closeLabel(feature.title)}>{CLOSE}</Button></div>
          <div className={styles.panelBody}>{feature.detail({ close, announce })}</div>
        </motion.div>}
      </AnimatePresence>
    </div>
    {live}
  </section>;
}

export default SpotlightGrid;
