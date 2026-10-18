"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { ImageViewer, type Rect } from "../lib/image-viewer";
import { counterText, type ViewerImage } from "../lib/image-viewer-format";
import { motionTokens } from "../lib/motion-tokens";
import { FramedPhoto, SwatchGroup, SwipeTrack, useAnnouncer } from "../lib/shop-parts";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { OPEN_FULLSCREEN, PICK_SIZE, clampPoint, edgeSize, isSoldOut, keepSize, lensShift, mainLabel, soldOutText, stepSize, type GalleryColor, type GallerySize } from "./product-gallery-format";
import styles from "./product-gallery.module.css";

export type { GalleryColor, GallerySize, ViewerImage };

/** Ürün sayfası için fotoğraf galerisi: büyük fotoğrafta fareyle büyüteç, küçük resim şeridi, dokunmatikte kaydırma, tam ekran görüntüleyici, renk ve beden seçici. Renk değişince fotoğraflar o rengin fotoğraflarına geçer; beden bir renkte tükenmişse üstü çizili görünür. Fiyat, sepete ekleme ve yorumlar bu bloğun dışındadır (`header` ve `footer` ile uygulama koyar). Seçeneksiz albüm için `lightbox-gallery`. */
export interface ProductGalleryProps {
  colors: GalleryColor[];
  sizes: GallerySize[];
  /** Fotoğraflarda en/boy oranı (varsayılan dikey). */
  ratio?: string | undefined;
  /** Büyüteç katı (varsayılan 2,5). */
  magnification?: number | undefined;
  header?: ReactNode | undefined;
  footer?: ReactNode | undefined;
  /** Renk ya da beden değişince çağrılır; beden tükendiği için kalktıysa `size` boştur ve `cleared` true olur. */
  onSelectionChange?: ((selection: { color: string; size: string; cleared: boolean }) => void) | undefined;
}

const LENS = 72;

function Slide({ image, ratio }: { image: ViewerImage; ratio: string }) {
  return <FramedPhoto src={image.src} alt={image.alt} ratio={ratio} position={image.position} tone={image.tone} initial="" className={styles.photo} />;
}

export function ProductGallery({ colors, sizes, ratio = "4 / 5", magnification = 2.5, header, footer, onSelectionChange }: ProductGalleryProps) {
  const reduced = useReducedMotionSafe();
  const [colorValue, setColor] = useState(colors[0]?.value ?? "");
  const [sizeValue, setSize] = useState("");
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [lensOn, setLensOn] = useState(true);
  const [hover, setHover] = useState(false);
  const [live, announce] = useAnnouncer();
  const color = colors.find(item => item.value === colorValue) ?? colors[0]!;
  const photos = color.photos;
  const safe = Math.min(index, photos.length - 1);
  const stage = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const sizeButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  const down = useRef<{ x: number; y: number } | null>(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const lx = useSpring(x, { stiffness: 380, damping: 32 }), ly = useSpring(y, { stiffness: 380, damping: 32 });
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [box, setBox] = useState({ width: 1, height: 1 });
  const soldOutPicked = sizes.find(item => item.value === sizeValue && isSoldOut(item, colorValue));

  const chooseColor = (value: string) => {
    const kept = keepSize(sizes, sizeValue, value);
    const cleared = !!sizeValue && !kept;
    setColor(value); setSize(kept); setIndex(0);
    onSelectionChange?.({ color: value, size: kept, cleared });
    const label = colors.find(item => item.value === value)?.label ?? value;
    announce(cleared ? `${label} rengi seçildi. ${soldOutText(label, sizes.find(item => item.value === sizeValue)?.label ?? "")}; beden seçimi kaldırıldı.` : `${label} rengi seçildi.`);
  };
  const chooseSize = (value: string) => { setSize(value); onSelectionChange?.({ color: colorValue, size: value, cleared: false }); };
  const sizeKey = (event: KeyboardEvent, current: string) => {
    const next = event.key === "ArrowRight" || event.key === "ArrowDown" ? stepSize(sizes, colorValue, current, 1) : event.key === "ArrowLeft" || event.key === "ArrowUp" ? stepSize(sizes, colorValue, current, -1) : event.key === "Home" ? edgeSize(sizes, colorValue, "first") : event.key === "End" ? edgeSize(sizes, colorValue, "last") : null;
    if (next === null || !next) return;
    event.preventDefault(); chooseSize(next); sizeButtons.current[next]?.focus();
  };
  const tabKey = (event: KeyboardEvent, at: number) => {
    const next = event.key === "ArrowRight" ? Math.min(photos.length - 1, at + 1) : event.key === "ArrowLeft" ? Math.max(0, at - 1) : event.key === "Home" ? 0 : event.key === "End" ? photos.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault(); setIndex(next); tabs.current[next]?.focus();
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !lensOn || reduced) return;
    const rect = stage.current?.getBoundingClientRect();
    if (!rect) return;
    const p = clampPoint(rect, event.clientX, event.clientY);
    if (!hover) { x.jump(p.x); y.jump(p.y); }
    x.set(p.x); y.set(p.y);
    setPoint(p); setBox({ width: rect.width, height: rect.height }); setHover(true);
  };
  const originOf = (at: number): Rect | null => {
    void at;
    const rect = stage.current?.getBoundingClientRect();
    return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null;
  };
  const shift = lensShift(point, magnification, LENS);
  const keyOpen = (event: KeyboardEvent) => { if (event.key === "Enter" && event.target === event.currentTarget) { event.preventDefault(); setViewer(safe); } };

  return <section className={styles.root} aria-label="Ürün galerisi" data-reduced={reduced || undefined}>
    <div className={styles.layout}>
    <div className={styles.media}>
      {header && <div className={styles.header}>{header}</div>}
      <div ref={stage} className={styles.stage} onPointerMove={move} onPointerLeave={() => setHover(false)}
        onPointerDown={event => { down.current = { x: event.clientX, y: event.clientY }; }}
        onPointerUp={event => { const start = down.current; down.current = null; if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6 && !(event.target as HTMLElement).closest("button")) setViewer(safe); }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={color.value} initial={reduced ? false : { opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : motionTokens.duration.standard }}>
            <SwipeTrack count={photos.length} index={safe} onIndexChange={setIndex} label={`${color.label} fotoğrafları`} renderSlide={at => <Slide image={photos[at]!} ratio={ratio} />} />
          </motion.div>
        </AnimatePresence>
        {!reduced && lensOn && hover && <motion.div className={styles.lens} aria-hidden="true" style={{ x: lx, y: ly, width: LENS * 2, height: LENS * 2, marginLeft: -LENS, marginTop: -LENS }}>
          <div className={styles.lensInner} style={{ width: box.width * magnification, height: box.height * magnification, left: shift.x, top: shift.y }}><Slide image={photos[safe]!} ratio={`${box.width} / ${box.height}`} /></div>
        </motion.div>}
        <button ref={opener} type="button" className={styles.open} aria-label={`${OPEN_FULLSCREEN}: ${mainLabel(photos[safe]!, safe, photos.length)}`} onClick={() => setViewer(safe)} onKeyDown={keyOpen}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.2-4.2M11 8v6M8 11h6" /></svg>
        </button>
        <span className={styles.counter} aria-hidden="true">{counterText(safe, photos.length)}</span>
        <button type="button" className={styles.lensToggle} aria-pressed={lensOn} onClick={() => setLensOn(!lensOn)}>Büyüteç</button>
      </div>
      <div className={styles.dots} aria-hidden="true">{photos.map((_, at) => <i key={at} data-on={at === safe || undefined} />)}</div>
      <div className={styles.strip} role="tablist" aria-label="Küçük resimler">{photos.map((photo, at) => <button key={photo.id} ref={node => { tabs.current[at] = node; }} type="button" role="tab" aria-selected={at === safe} aria-label={`${at + 1}. fotoğraf: ${photo.alt}`} tabIndex={at === safe ? 0 : -1} className={styles.tab} onClick={() => setIndex(at)} onKeyDown={event => tabKey(event, at)}>
        <FramedPhoto src={photo.src} alt="" ratio="1 / 1" position={photo.position} tone={photo.tone} initial="" />
        {at === safe && <motion.span layoutId="product-gallery-ring" className={styles.ring} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />}
      </button>)}</div>
    </div>
    <div className={styles.options}>
      <div className={styles.group}><p className={styles.groupLabel}>Renk: <b>{color.label}</b></p>
        <SwatchGroup label="Renk" mode="single" options={colors.map(item => ({ value: item.value, label: item.label, color: item.color }))} value={[colorValue]} onToggle={chooseColor} /></div>
      <div className={styles.group}><p className={styles.groupLabel}>Beden</p>
        <div className={styles.sizes} role="radiogroup" aria-label="Beden">{sizes.map(item => {
          const out = isSoldOut(item, colorValue);
          const tab = sizeValue ? item.value === sizeValue : item.value === edgeSize(sizes, colorValue, "first");
          return <button key={item.value} ref={node => { sizeButtons.current[item.value] = node; }} type="button" role="radio" aria-checked={item.value === sizeValue} aria-disabled={out || undefined} tabIndex={tab ? 0 : -1} className={styles.size} data-out={out || undefined}
            aria-label={out ? `${item.label}, ${soldOutText(color.label, item.label)}` : item.label} onClick={() => { if (!out) chooseSize(item.value); }} onKeyDown={event => sizeKey(event, item.value)}>{item.label}</button>;
        })}</div>
        <p className={styles.hint} role="status">{soldOutPicked ? soldOutText(color.label, soldOutPicked.label) : !sizeValue ? PICK_SIZE : ""}</p>
        {sizes.some(item => isSoldOut(item, colorValue)) && <p className={styles.hint}>{sizes.filter(item => isSoldOut(item, colorValue)).map(item => soldOutText(color.label, item.label)).join(" · ")}</p>}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
    </div>
    <ImageViewer images={photos} index={viewer} onIndexChange={at => { setViewer(at); setIndex(at); }} onClose={last => { setViewer(null); setIndex(last); requestAnimationFrame(() => opener.current?.focus()); }} getOrigin={originOf} label="Ürün fotoğrafları" />
    {live}
  </section>;
}

export default ProductGallery;
