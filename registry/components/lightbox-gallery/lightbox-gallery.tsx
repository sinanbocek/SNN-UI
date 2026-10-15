"use client";

import { useMemo, useRef, useState } from "react";
import { ImageViewer, type Rect } from "../lib/image-viewer";
import { openText, type ViewerImage } from "../lib/image-viewer-format";
import { FramedPhoto } from "../lib/shop-parts";
import { useElementWidth, useReducedMotionSafe } from "../lib/viz-utils";
import { DEFAULT_LABEL, assignColumns, galleryCountText, masonryColumns } from "./lightbox-gallery-format";
import styles from "./lightbox-gallery.module.css";

export type { ViewerImage };

/** Geziler, portfolyolar ve ilan fotoğrafları gibi yakından bakılan koleksiyonlar için oranları korunan sütunlu fotoğraf duvarı. Bir fotoğrafa basınca fotoğraf kendi yerinden büyüyerek tam ekran görüntüleyiciye açılır (kaydırma, yakınlaştırma, aşağı çekip kapatma); kapanınca o an gösterilen fotoğrafın yuvasına döner. Aynı boyda kare ızgara için `photo-grid`, seçenekli ürün fotoğrafları için `product-gallery`. Çok büyük koleksiyonlar sayfalanır (duvar sanallaştırılmaz). */
export interface LightboxGalleryProps {
  images: ViewerImage[];
  label?: string;
  /** Bir sütunun en az genişliği (piksel); varsayılan 180. */
  minColumnWidth?: number;
  gap?: number;
  loading?: boolean;
}

export function LightboxGallery({ images, label = DEFAULT_LABEL, minColumnWidth = 180, gap = 12, loading = false }: LightboxGalleryProps) {
  const reduced = useReducedMotionSafe();
  const [box, width] = useElementWidth<HTMLElement>();
  const [open, setOpen] = useState<number | null>(null);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const columns = masonryColumns(width, minColumnWidth, gap);
  const lanes = useMemo(() => assignColumns(images, columns), [images, columns]);
  const origin = (index: number): Rect | null => {
    const rect = cells.current[index]?.getBoundingClientRect();
    return rect ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null;
  };

  return <section ref={box} className={styles.root} aria-label={`${label}, ${galleryCountText(images.length)}`} data-reduced={reduced || undefined}>
    {loading ? <div className={styles.wall} style={{ gap }} aria-busy="true" role="status" aria-label="Fotoğraflar yükleniyor">{Array.from({ length: columns }, (_, lane) => <div key={lane} className={styles.lane} style={{ gap }}>{[1.3, .8, 1.1].map((ratio, at) => <span key={at} className={styles.skeleton} style={{ aspectRatio: `1 / ${ratio + (lane % 2) * .2}` }} />)}</div>)}</div>
      : <div className={styles.wall} style={{ gap }}>{lanes.map((lane, at) => <div key={at} className={styles.lane} style={{ gap }}>{lane.map(index => {
        const image = images[index]!;
        return <button key={image.id} ref={node => { cells.current[index] = node; }} type="button" className={styles.cell} aria-label={openText(image, index, images.length)} onClick={() => setOpen(index)}>
          <FramedPhoto src={image.src} alt={image.alt} ratio={`${image.width} / ${image.height}`} position={image.position} tone={image.tone} initial="" className={styles.photo} />
        </button>;
      })}</div>)}</div>}
    <ImageViewer images={images} index={open} onIndexChange={setOpen} getOrigin={origin} label={label}
      onClose={last => { setOpen(null); requestAnimationFrame(() => cells.current[last]?.focus()); }} />
  </section>;
}

export default LightboxGallery;
