"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Breadcrumb, type BreadcrumbItem } from "../breadcrumb/breadcrumb";
import { Button } from "../button/button";
import { motionTokens } from "../lib/motion-tokens";
import { FramedPhoto, NumberStepper, SwatchGroup, SwipeTrack, useAnnouncer } from "../lib/shop-parts";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { addLabel, barRatios, barRowLabel, counterText, isSoldOut, keepSize, reviewAverage, reviewCountText, reviewTotal, sizeLabel, type DetailPhoto, type Distribution, type Finish, type Selection, type Size } from "./product-detail-format";
import styles from "./product-detail.module.css";

export type { DetailPhoto, Distribution, Finish, Selection, Size };
export interface DetailSection { title: string; content: ReactNode }
export interface DetailPromise { title: string; text: string }

/** Tek bir ürünün sayfası için kullanın: kaydırılabilir galeri, kaplama ve boy seçimi, adet, sepete ekle, teslimat vaatleri, yorum özeti ve açılır ayrıntılar. Çok seçenekli canlı fiyatlı yapılandırıcı ve ürün listesi kapsam dışıdır; sepete ekleme ve haber verme kaydını uygulama bağlar. */
export interface ProductDetailProps {
  name: string;
  trail: BreadcrumbItem[];
  summary?: string[] | undefined;
  finishes: Finish[];
  sizes: Size[];
  /** 5'ten 1'e yıldız başına yorum sayısı. */
  reviews: Distribution;
  promises?: DetailPromise[] | undefined;
  sections?: DetailSection[] | undefined;
  maxQuantity?: number | undefined;
  /** Sepete ekler; reddederse düğme "Tekrar dene" der. */
  onAddToCart: (selection: Selection) => Promise<void>;
  /** Tükenen seçim için "Gelince haber ver". */
  onNotify?: ((selection: Selection) => void) | undefined;
  onFavoriteChange?: ((favorite: boolean) => void) | undefined;
  loading?: boolean | undefined;
}

function Gallery({ photos, name, finishKey }: { photos: DetailPhoto[]; name: string; finishKey: string }) {
  const reduced = useReducedMotionSafe();
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [finishKey]);
  const safe = Math.min(index, Math.max(0, photos.length - 1));
  const slide = (at: number) => { const photo = photos[at]!; return <FramedPhoto src={photo.src} alt={photo.alt} ratio="1 / 1" position={photo.position} tone={photo.tone} eager={!at} className={styles.photo} />; };
  return <div className={styles.gallery}>
    <div className={styles.stage}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={finishKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : motionTokens.duration.standard }}>
          <SwipeTrack count={photos.length} index={safe} onIndexChange={setIndex} renderSlide={slide} label={`${name} fotoğrafları`} />
        </motion.div>
      </AnimatePresence>
      <span className={styles.counter} aria-live="polite">{counterText(safe, photos.length)}</span>
      {photos.length > 1 && <>
        <button type="button" className={styles.arrow} data-side="prev" aria-label="Önceki fotoğraf" disabled={safe === 0} onClick={() => setIndex(safe - 1)}>‹</button>
        <button type="button" className={styles.arrow} data-side="next" aria-label="Sonraki fotoğraf" disabled={safe === photos.length - 1} onClick={() => setIndex(safe + 1)}>›</button>
      </>}
    </div>
    <ul className={styles.thumbs}>{photos.map((photo, at) => <li key={at}><button type="button" className={styles.thumb} aria-label={`${at + 1}. fotoğrafı göster`} aria-current={at === safe || undefined} onClick={() => setIndex(at)}>
      <FramedPhoto src={photo.src} alt="" ratio="1 / 1" position={photo.position} tone={photo.tone} initial="" />
      {at === safe && <motion.span layoutId={`${finishKey}-ring`} className={styles.ring} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />}
    </button></li>)}</ul>
  </div>;
}

function Accordion({ sections }: { sections: DetailSection[] }) {
  const uid = useId();
  const reduced = useReducedMotionSafe();
  const [open, setOpen] = useState(0);
  return <div className={styles.accordion}>{sections.map((section, at) => {
    const on = open === at;
    return <div key={section.title} className={styles.section}>
      <h3><button type="button" className={styles.sectionButton} aria-expanded={on} aria-controls={`${uid}-p${at}`} id={`${uid}-h${at}`} onClick={() => setOpen(on ? -1 : at)}>{section.title}<span aria-hidden="true">{on ? "−" : "+"}</span></button></h3>
      <AnimatePresence initial={false}>{on && <motion.div key="panel" id={`${uid}-p${at}`} role="region" aria-labelledby={`${uid}-h${at}`} className={styles.sectionBody} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}><div className={styles.sectionInner}>{section.content}</div></motion.div>}</AnimatePresence>
    </div>;
  })}</div>;
}

function Reviews({ distribution }: { distribution: Distribution }) {
  const reduced = useReducedMotionSafe();
  const total = reviewTotal(distribution), average = reviewAverage(distribution), ratios = barRatios(distribution);
  return <section className={styles.reviews} aria-label="Yorum özeti">
    <p className={styles.average}><b>{average === null ? "—" : <AnimatedCounter value={average} decimals={1} />}</b><span>{reviewCountText(total)}</span></p>
    <ul className={styles.bars}>{distribution.map((count, at) => <li key={at} aria-label={barRowLabel(5 - at, count)}>
      <span aria-hidden="true">{5 - at}★</span>
      <span className={styles.bar} aria-hidden="true"><motion.i initial={{ scaleX: reduced ? ratios[at]! : 0 }} whileInView={{ scaleX: ratios[at]! }} viewport={{ once: true }} transition={reduced ? { duration: 0 } : { ...motionTokens.spring.smooth, delay: at * .04 }} /></span>
      <span aria-hidden="true">{count}</span>
    </li>)}</ul>
  </section>;
}

export function ProductDetail({ name, trail, summary = [], finishes, sizes, reviews, promises = [], sections = [], maxQuantity = 10, onAddToCart, onNotify, onFavoriteChange, loading = false }: ProductDetailProps) {
  const reduced = useReducedMotionSafe();
  const [finish, setFinish] = useState(finishes[0]?.value ?? "");
  const [size, setSize] = useState(() => sizes.find(item => !isSoldOut(item, finishes[0]?.value ?? ""))?.value ?? "");
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [favorite, setFavorite] = useState(false);
  const [live, announce] = useAnnouncer();
  const current = finishes.find(item => item.value === finish) ?? finishes[0];
  const picked = sizes.find(item => item.value === size);
  const soldOut = !!picked && isSoldOut(picked, finish);
  const selection: Selection = { finish, size, quantity };

  const chooseFinish = (value: string) => { setFinish(value); setSize(keepSize(sizes, size, value)); setState("idle"); };
  const add = async () => {
    if (state === "busy" || !picked) return;
    setState("busy");
    try { await onAddToCart(selection); setState("done"); announce(`${name} sepete eklendi.`); window.setTimeout(() => setState("idle"), 2200); }
    catch { setState("error"); announce("Sepete eklenemedi. Tekrar deneyebilirsiniz."); }
  };

  if (loading || !current) return <div className={styles.root} aria-busy="true" role="status" aria-label="Ürün yükleniyor"><div className={styles.layout}><span className={styles.skeletonBlock} /><div className={styles.skeletonCol}><span /><span /><span /></div></div></div>;

  const label = state === "busy" ? "Ekleniyor" : state === "done" ? "Sepete eklendi" : state === "error" ? "Tekrar dene" : picked ? addLabel(picked.price, quantity) : "Boy seçin";
  return <div className={styles.root} data-reduced={reduced || undefined}>
    <Breadcrumb items={trail} />
    <div className={styles.layout}>
      <Gallery photos={current.photos} name={name} finishKey={current.value} />
      <div className={styles.info}>
        <div className={styles.head}>
          <h1 className={styles.name}>{name}</h1>
          <button type="button" className={styles.heart} aria-pressed={favorite} aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"} onClick={() => { setFavorite(!favorite); onFavoriteChange?.(!favorite); }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
          </button>
        </div>
        <p className={styles.price} aria-live="polite">{picked ? <AnimatedCounter value={picked.price} decimals={picked.price % 1 ? 2 : 0} prefix="₺" /> : <span className={styles.muted}>Boy seçin</span>}</p>
        <p className={styles.ratingLine}>★ {reviewAverage(reviews) === null ? "—" : <AnimatedCounter value={reviewAverage(reviews)!} decimals={1} />} <span>({reviewCountText(reviewTotal(reviews))})</span></p>
        {summary.length > 0 && <ul className={styles.summary}>{summary.map(line => <li key={line}>{line}</li>)}</ul>}
        <div className={styles.group}><p className={styles.groupLabel}>Kaplama: <b>{current.label}</b></p>
          <SwatchGroup label="Kaplama" mode="single" options={finishes.map(item => ({ value: item.value, label: item.label, color: item.color }))} value={[finish]} onToggle={chooseFinish} /></div>
        <div className={styles.group} role="radiogroup" aria-label="Boy"><p className={styles.groupLabel}>Boy</p>
          <div className={styles.sizes}>{sizes.map(item => { const out = isSoldOut(item, finish); return <button key={item.value} type="button" role="radio" aria-checked={item.value === size} className={styles.sizeOption} data-out={out || undefined} onClick={() => { setSize(item.value); setState("idle"); }}>{sizeLabel(item, out)}</button>; })}</div></div>
        <div className={styles.buy}>
          <NumberStepper label="Adet" value={quantity} min={1} max={maxQuantity} onChange={setQuantity} />
          {soldOut ? <Button variant="secondary" onClick={() => { onNotify?.(selection); announce("Gelince haber vereceğiz."); }}>Gelince haber ver</Button>
            : <Button variant="primary" className={styles.add} loading={state === "busy"} disabled={!picked} aria-busy={state === "busy"} onClick={add}>{label}</Button>}
        </div>
        {promises.length > 0 && <ul className={styles.promises}>{promises.map(item => <li key={item.title}><b>{item.title}</b><span>{item.text}</span></li>)}</ul>}
        <Reviews distribution={reviews} />
        {sections.length > 0 && <Accordion sections={sections} />}
      </div>
    </div>
    {live}
  </div>;
}

export default ProductDetail;
