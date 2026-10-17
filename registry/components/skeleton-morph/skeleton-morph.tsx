"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type Transition } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./skeleton-morph.module.css";

interface MorphContext {
  loading: boolean;
  /** Bloklar arası çözülme gecikmesi, saniye. */
  stagger: number;
  root: RefObject<HTMLDivElement | null>;
}
const Context = createContext<MorphContext | null>(null);

export interface SkeletonMorphProps {
  /** true iken bloklar iskelet olarak durur; false olunca okuma sırasıyla çözülür. */
  loading: boolean;
  /** Görünmez durum metinleri (ekran okuyucu için). */
  label?: string;
  loadedLabel?: string;
  /** Bloklar arası çözülme gecikmesi, ms. */
  stagger?: number;
  className?: string;
  children: ReactNode;
}

/** Kabuk: yükleniyor durumunu taşır, kendi çerçevesi vardır; içerik gelince yüksekliği yumuşakça değişir. Hata gösterimi bu bileşenin işi değildir (`empty-state`). */
export function SkeletonMorph({ loading, label = "Yükleniyor", loadedLabel = "Yüklendi", stagger = 70, className, children }: SkeletonMorphProps) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  // Yükleme bitince ilk boyanıştan önce yükseklik sabitlenir; içerik ölçüsüne yaylanma ResizeObserver ile izlenir.
  useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let last: number | undefined;
    let controls: AnimationPlaybackControls | undefined;
    const settle = () => { height.jump("auto"); if (root.current) root.current.style.overflow = ""; };
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      const from = last;
      last = next;
      if (from === undefined || from === next || reduced) return;
      controls?.stop();
      if (root.current) root.current.style.overflow = "hidden";
      controls = animate(height, [from, next], { ...motionTokens.spring.smooth, onComplete: settle });
    });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); };
  }, [height, reduced]);
  return (
    <Context.Provider value={{ loading, stagger: reduced ? 0 : stagger / 1000, root }}>
      <motion.div ref={root} className={`${styles.root} ${className ?? ""}`} aria-busy={loading} style={{ height }}>
        <div className={styles.srOnly} role="status" aria-live="polite">{loading ? label : loadedLabel}</div>
        <div ref={content} className={styles.content}>{children}</div>
      </motion.div>
    </Context.Provider>
  );
}

export type MorphBlockShape = "rect" | "circle" | "text";

export interface MorphBlockProps {
  /** İskelet türü: dikdörtgen, daire (avatar yeri) ya da metin satırları. */
  shape?: MorphBlockShape;
  /** İskelet ölçüsü; gerçek içerikle aynı boyda seçilir. Sayı piksel, metin CSS değeridir ("60%"). */
  width?: number | string;
  height?: number | string;
  /** Yalnız `text`: satır sayısı. Son satır daha kısadır. */
  lines?: number;
  /** Yalnız `rect`: köşe yuvarlaklığı, piksel. */
  radius?: number;
  className?: string;
  /** Yüklenince görünecek içerik. Yüklenirken hiç çizilmez. */
  children: ReactNode;
}

/** Düzenin her görünen parçasını sarar: yüklenirken ölçüsü eşleşmiş iskelet, bitince içeriğin kendisi. */
export function MorphBlock({ shape = "rect", width, height, lines = 3, radius, className, children }: MorphBlockProps) {
  const context = useContext(Context);
  const reduced = useReducedMotion();
  const loading = context?.loading ?? false;
  const stagger = context?.stagger ?? 0;
  const element = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(!loading);
  const [ghost, setGhost] = useState<{ width: number; height: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const previous = useRef(loading);

  // Yükleniyora dönüş anında olur; bitişte belge sırasına göre kademeli açılır.
  useLayoutEffect(() => {
    // Durum değişmediyse (ilk çizim, Strict Mode yeniden çalıştırması) dokunulmaz.
    if (previous.current === loading) return;
    previous.current = loading;
    clearTimeout(timer.current);
    if (loading) { setShown(false); setGhost(null); return; }
    const node = element.current;
    const blocks = Array.from(context?.root.current?.querySelectorAll("[data-morph-block]") ?? []);
    const order = node ? Math.max(0, blocks.indexOf(node)) : 0;
    const box = node?.getBoundingClientRect();
    timer.current = setTimeout(() => {
      setGhost(box ? { width: box.width, height: box.height } : null);
      setShown(true);
    }, order * stagger * 1000);
    return () => clearTimeout(timer.current);
  }, [loading, stagger, context?.root]);

  const size: CSSProperties = { width, height };
  const skeleton = shape === "text"
    ? <span className={styles.lines} style={{ width }} aria-hidden="true">{Array.from({ length: Math.max(1, lines) }, (_, index) => <span key={index} className={styles.line} data-last={index === lines - 1 && lines > 1 ? "" : undefined} style={{ "--index": index } as CSSProperties} />)}</span>
    : <span className={styles.shape} data-shape={shape} style={{ ...size, borderRadius: shape === "rect" ? radius : undefined }} aria-hidden="true" />;

  if (!shown) return <div ref={element} className={`${styles.block} ${className ?? ""}`} data-morph-block="">{skeleton}</div>;
  const fade: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  return (
    <div ref={element} className={`${styles.block} ${className ?? ""}`} data-morph-block="" data-shown="">
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${motionTokens.blur.soft}px)` }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
        transition={reduced ? { duration: motionTokens.duration.fast } : fade}
      >{children}</motion.div>
      {/* İskelet kutusu eski ölçüsünden içeriğin ölçüsüne uzanıp solar. */}
      {(ghost || reduced) && <motion.span
        className={styles.ghost}
        data-shape={shape}
        aria-hidden="true"
        initial={reduced || !ghost ? { opacity: 1 } : { opacity: 1, width: ghost.width, height: ghost.height }}
        animate={reduced ? { opacity: 0 } : { opacity: 0, width: "100%", height: "100%" }}
        transition={reduced ? { duration: motionTokens.duration.fast } : { ...motionTokens.spring.morph, opacity: { duration: motionTokens.duration.considered, ease: [...motionTokens.ease.standard] } }}
      />}
    </div>
  );
}

export default SkeletonMorph;
