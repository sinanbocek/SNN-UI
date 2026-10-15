"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type Variants } from "motion/react";
import { formatNumber, roundTo } from "../lib/chart-format";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./sparkline.module.css";

export interface SparklineProps {
  data: number[];
  label: string;
  value?: string;
  change?: string;
  tone?: "accent" | "success" | "warning" | "danger";
  width?: number;
  height?: number;
  /** Her nokta için bir etiket (örneğin tarih). Nokta gezilirken değişimin yerine geçer. */
  labels?: string[];
  /** Gezilen noktayı başlık için biçimler. Varsayılan: binlik ayraçlı sayı ("1.234,5"). */
  formatValue?: (value: number, index: number) => string;
  /** Çizginin altında sakin, nötr bir dolgu. */
  area?: boolean;
  /** Fare, dokunma ve klavyeyle noktalar arasında gezinme. */
  interactive?: boolean;
}

/** Sayı taşıyan metin hareket ettiği yönden girer: büyüyen değer alttan yükselir, küçülen üstten düşer. */
const rise: Variants = { hidden: (direction: number) => ({ opacity: 0, y: `${.3 * direction}em`, filter: `blur(${motionTokens.blur.soft}px)` }), shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } }, gone: (direction: number) => ({ opacity: 0, y: `${-.3 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }) };
const fade: Variants = { hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } } };
/** Metindeki ilk sayıyı okur. Türkçe yazım: nokta binliktir, virgül ondalıktır ("1.234,5"). */
const amountIn = (text: string) => Number((text.replace(/−/g, "-").match(/-?\d[\d.]*(?:,\d+)?/)?.[0] ?? "").replace(/\./g, "").replace(",", ".") || NaN);
/** İlk çizim: kalem gibi iki ucunda yavaşlayan tek akıcı çizgi. */
const draw = { duration: motionTokens.duration.considered * 1.75, ease: [...motionTokens.ease.inOut] } as const;
const quick = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } as const;

type Chunk = { slot: string; key: string; text: string };
/** Sayıda değişmeyen rakamlar yerinde durur (sağdan basamağa göre anahtarlanır). Sözcükler kendilerine kadar olan her şeyle anahtarlanır; yalnız ilk değişen sözcük ve sonrası döner. */
function chunksOf(text: string, whole: boolean): Chunk[] {
  if (!text) return [];
  if (whole) return [{ slot: "all", key: text, text }];
  if (!/\p{L}/u.test(text)) return [...text].map((char, index, all) => ({ slot: `n${all.length - index}`, key: char, text: char }));
  const words = text.split(/(?<=\s)/);
  return words.map((word, index) => ({ slot: `w${index}`, key: words.slice(0, index + 1).join(""), text: word }));
}

/** Değişen metin yerinde döner; `morph` kabı yeni genişliğe yaylandırır, yanındaki hiçbir şey sıçramaz. */
function Roll({ text, direction, whole = false, morph = false, tone }: { text: string; direction?: number; whole?: boolean; morph?: boolean; tone?: string }) {
  const reduceMotion = !!useReducedMotion();
  const sizer = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  const [shown, setShown] = useState({ text, direction: 1 });
  if (shown.text !== text) setShown({ text, direction: direction ?? (amountIn(text) < amountIn(shown.text) ? -1 : 1) });
  useEffect(() => {
    const node = sizer.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured: string | null = null;
    // Dönüştürülmüş kutu değil yerleşim boyutu ölçülür; ölçekleyen üst öğe metni kırpmaz. Yalnız yeni metin yaylanır, yazı tipi yüklenince boyut atlar.
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth;
      if (measured !== null && measured !== node.textContent && !reduceMotion) animate(width, next, motionTokens.spring.morph);
      else width.jump(next);
      measured = node.textContent;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [morph, reduceMotion, width]);
  const numeric = !whole && !/\p{L}/u.test(text);
  const variants = reduceMotion ? fade : rise;
  const anchor = numeric ? "right" : "left";
  return <motion.span className={styles.roll} data-end={numeric || undefined} data-whole={whole || undefined} style={morph ? { width } : undefined}>
    {morph && <span ref={sizer} className={styles.sizer} aria-hidden="true">{text}</span>}
    {/* Parçaları tek bir esnek öğe tutar; metin satır içinde kalır, tek dize gibi okunur ve kopyalanır. */}
    <span className={styles.track}><AnimatePresence mode="popLayout" initial={false} custom={shown.direction} anchorX={anchor}>
      {chunksOf(text, whole).map(chunk => <motion.span key={chunk.slot} className={styles.slot} custom={shown.direction} variants={variants} initial="hidden" animate="shown" exit="gone">
        <AnimatePresence mode="popLayout" initial={false} custom={shown.direction} anchorX={anchor}>
          <motion.span key={`${tone ?? ""}${chunk.key}`} className={tone ? `${styles.glyph} ${tone}` : styles.glyph} custom={shown.direction} variants={variants} initial="hidden" animate="shown" exit="gone">{chunk.text}</motion.span>
        </AnimatePresence>
      </motion.span>)}
    </AnimatePresence></span>
  </motion.span>;
}

type Point = [number, number];
/** En yüksek noktanın üstünde ve en düşüğün altında bırakılan boşluk, bir de çizgi kalınlığının yarısı. */
const inset = 5, cap = 1.25;
const grid = Array.from({ length: 161 }, (_, index) => index / 160);

/** Her noktadan geçen yumuşak çizgi; birim uzayda sık örneklenir (x ve y 0 ile 1 arası, y yukarı). Tekdüze kübik teğetler çizginin veriyi aşmasını önler. */
function curveFor(data: number[]): Point[] {
  const min = Math.min(...data), span = Math.max(...data) - min;
  const ys = data.map(value => span ? (value - min) / span : .5);
  const last = ys.length - 1, step = 1 / last;
  const slopes = ys.slice(1).map((y, index) => (y - ys[index]!) / step);
  const tangents = ys.map((_, index) => index === 0 || index === last ? slopes[0]! : (Math.sign(slopes[index - 1]!) + Math.sign(slopes[index]!)) * Math.min(Math.abs(slopes[index - 1]!), Math.abs(slopes[index]!), Math.abs(slopes[index - 1]! + slopes[index]!) / 4) || 0);
  if (last > 1) { tangents[0] = (3 * slopes[0]! - tangents[1]!) / 2; tangents[last] = (3 * slopes[last - 1]! - tangents[last - 1]!) / 2; }
  const samples = Math.max(1, Math.min(16, Math.round(128 / last)));
  const points: Point[] = [];
  for (let index = 0; index < last; index++) for (let sample = 0; sample < samples; sample++) {
    const t = sample / samples, t2 = t * t, t3 = t2 * t;
    const y = (2 * t3 - 3 * t2 + 1) * ys[index]! + (t3 - 2 * t2 + t) * step * tangents[index]! + (3 * t2 - 2 * t3) * ys[index + 1]! + (t3 - t2) * step * tangents[index + 1]!;
    points.push([(index + t) * step, Math.min(1, Math.max(0, y))]);
  }
  points.push([1, ys[last]!]);
  return points;
}

/** Örneklenen çizginin x noktasındaki yüksekliği; örnekler arası düz. */
function heightAt(shape: Point[], x: number) {
  let low = 0, high = shape.length - 1;
  if (x <= shape[low]![0]) return shape[low]![1];
  if (x >= shape[high]![0]) return shape[high]![1];
  while (high - low > 1) { const middle = (low + high) >> 1; if (shape[middle]![0] < x) low = middle; else high = middle; }
  const [x0, y0] = shape[low]!, [x1, y1] = shape[high]!;
  return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/** Bir kare için çizilen tüm dizeler; grafiğin kendi pikselinde, böylece çizgi ve noktalar her genişlikte yuvarlak kalır. */
function geometryOf(shape: Point[], w: number, h: number, at: number) {
  const toY = (y: number) => inset + (1 - y) * (h - inset * 2);
  const points = shape.map(([x, y]): Point => [x * w, toY(y)]);
  const pairs = points.map(([x, y]) => `${roundTo(x, 2)},${roundTo(y, 2)}`);
  const cx = at * w, cy = toY(heightAt(shape, at));
  return { points, line: pairs.join(" "), trail: `M${pairs.join("L")}`, fill: `M${pairs.join("L")}L${w},${h}L0,${h}Z`, dot: `${cx},${cy} ${cx},${cy}`, cx };
}

/** Uzunluğunun `progress` kadarı çizildiğinde kalemin çizgi üzerindeki yeri; dolgu ucu izler. */
function tipAt(points: Point[], progress: number) {
  const steps = points.slice(1).map(([x, y], index) => Math.hypot(x - points[index]![0], y - points[index]![1]));
  let left = progress * steps.reduce((sum, step) => sum + step, 0);
  for (let index = 0; index < steps.length; index++) {
    const step = steps[index]!, from = points[index]![0];
    if (left <= step) return from + (points[index + 1]![0] - from) * (step ? left / step : 1);
    left -= step;
  }
  return points[points.length - 1]![0];
}

export function Sparkline({ data, label, value, change, tone = "accent", width = 160, height = 52, labels, formatValue, area = true, interactive = true }: SparklineProps) {
  const safeData = data.length > 1 ? data : [data[0] ?? 0, data[0] ?? 0];
  const last = safeData.length - 1;
  const key = safeData.join(",");
  const target = useMemo(() => curveFor(key.split(",").map(Number)), [key]);
  const description = `${label}: ${value ?? safeData[last]}. ${change ?? ""}`.trim();
  const uid = `sparkline${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ref = useRef<HTMLElement>(null);
  const plot = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: .5 });
  const reduceMotion = !!useReducedMotion();
  const [box, setBox] = useState({ w: width, h: height });
  const [active, setActive] = useState<number | null>(null);
  const [landed, setLanded] = useState(false);
  const index = active === null ? null : Math.min(active, last);
  const [moved, setMoved] = useState({ index, direction: 1 });
  if (moved.index !== index) setMoved({ index, direction: index === null || moved.index === null ? 1 : Math.sign(index - moved.index) || 1 });

  const [first] = useState(() => geometryOf(target, width, height, 1));
  const shape = useRef(target);
  const size = useRef(box);
  const drawn = useMotionValue(0), cursor = useMotionValue(1);
  const line = useMotionValue(first.line), trail = useMotionValue(first.trail), fill = useMotionValue(first.fill), dot = useMotionValue(first.dot);
  const cursorX = useMotionValue(first.cx), lit = useMotionValue(first.cx + cap + 16), dim = useMotionValue(first.cx + cap), reveal = useMotionValue(0);
  const lineOpacity = useTransform(drawn, progress => progress > .001 ? 1 : 0);

  // Çizilen her öznitelik için tek yazıcı: biçim değişimi, imleç, kalem ve ölçülen boyut buradan yeniden boyanır.
  const paint = useCallback(() => {
    const { w, h } = size.current, progress = drawn.get();
    const next = geometryOf(shape.current, w, h, cursor.get());
    line.set(next.line); trail.set(next.trail); fill.set(next.fill); dot.set(next.dot);
    cursorX.set(next.cx); lit.set(next.cx + cap + 16); dim.set(next.cx + cap);
    reveal.set(progress >= 1 ? w + 32 : tipAt(next.points, progress) + 16);
  }, [cursor, cursorX, dim, dot, drawn, fill, line, lit, reveal, trail]);
  useMotionValueEvent(cursor, "change", paint);
  useMotionValueEvent(drawn, "change", paint);

  // Grafik kendi pikselinde çizilir: genişlik ölçülür, yükseklik orantılı tutulur.
  useLayoutEffect(() => {
    const node = plot.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => { const w = node.clientWidth; if (w) setBox(current => Math.abs(current.w - w) < .5 ? current : { w, h: (w * height) / width }); });
    observer.observe(node);
    return () => observer.disconnect();
  }, [height, width]);
  useLayoutEffect(() => { size.current = box; paint(); }, [box, paint]);

  // Çizgi görününce soldan sağa çizilir, dolgu kalemi izler, sonra uç nokta yerine oturur.
  useEffect(() => {
    // Azaltılmış harekette bitmiş çizgi hemen görünür; nokta bir kare sonra, sunucu çıktısıyla eşleştikten sonra oturur.
    if (reduceMotion) { drawn.jump(1); const frame = requestAnimationFrame(() => setLanded(true)); return () => cancelAnimationFrame(frame); }
    if (!inView) return;
    const controls = animate(drawn, 1, { ...draw, onComplete: () => setLanded(true) });
    return () => controls.stop();
  }, [drawn, inView, reduceMotion]);

  // Yeni veri çizgiyi ekrandaki biçimden dönüştürür; ortak x konumlarında örneklenir, nokta kazanan ya da kaybeden seri de akar.
  useEffect(() => {
    const from = shape.current;
    if (from === target) return;
    if (reduceMotion) { shape.current = target; paint(); return; }
    const xs = [...new Set([...grid, ...target.map(([x]) => x)])].sort((a, b) => a - b);
    const start = xs.map(x => heightAt(from, x)), goal = xs.map(x => heightAt(target, x));
    const controls = animate(0, 1, { ...motionTokens.spring.smooth, onUpdate: progress => { shape.current = xs.map((x, at): Point => [x, start[at]! + (goal[at]! - start[at]!) * progress]); paint(); }, onComplete: () => { shape.current = target; paint(); } });
    return () => controls.stop();
  }, [paint, reduceMotion, target]);

  // İmleç gezilen noktaya yaylanır ve noktalar arasında çizgiyi izler; çıkınca son değere döner.
  useEffect(() => {
    const to = index === null ? 1 : index / last;
    if (reduceMotion) { cursor.jump(to); return; }
    const controls = animate(cursor, to, motionTokens.spring.snappy);
    return () => controls.stop();
  }, [cursor, index, last, reduceMotion]);

  const scrubbing = index !== null;
  const format = (at: number) => formatValue ? formatValue(safeData[at]!, at) : formatNumber(safeData[at]!, 2);
  const point = format(index ?? last), when = labels?.[index ?? last];
  const headline = value === undefined ? undefined : scrubbing ? point : value;
  const aside = index === null ? change ?? "" : value === undefined ? [point, when].filter(Boolean).join(" · ") : when ?? `${index + 1} / ${last + 1}`;
  const pointAt = (clientX: number) => { const rect = plot.current?.getBoundingClientRect(); return rect?.width ? Math.max(0, Math.min(last, Math.round(((clientX - rect.left) / rect.width) * last))) : last; };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && scrubbing) { event.preventDefault(); setActive(null); return; }
    const from = index ?? last, page = Math.max(1, Math.round((last + 1) / 6));
    const next = ({ ArrowLeft: from - 1, ArrowDown: from - 1, ArrowRight: from + 1, ArrowUp: from + 1, PageDown: from - page, PageUp: from + page, Home: 0, End: last } as Record<string, number>)[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(Math.max(0, Math.min(last, next)));
  };
  const scrub = interactive ? {
    role: "slider", tabIndex: 0, "aria-label": `${label}, değerleri gez`, "aria-valuemin": 1, "aria-valuemax": last + 1, "aria-valuenow": (index ?? last) + 1, "aria-valuetext": `${when ?? (index === null ? "Son" : `Nokta ${index + 1} / ${last + 1}`)}: ${point}`,
    onPointerDown: (event: PointerEvent<HTMLDivElement>) => setActive(pointAt(event.clientX)),
    onPointerMove: (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "mouse" || event.buttons) setActive(pointAt(event.clientX)); },
    onPointerUp: (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType !== "mouse") setActive(null); },
    onPointerLeave: () => setActive(null), onPointerCancel: () => setActive(null), onBlur: () => setActive(null), onKeyDown,
  } : {};
  return <figure ref={ref} className={styles.figure} aria-label={description}>
    <figcaption className={styles.caption}>
      <span className={styles.label}><Roll text={label} whole /></span>
      {headline !== undefined && <strong><Roll text={headline} morph /></strong>}
      <small className={styles[tone]}><Roll text={aside} direction={scrubbing ? moved.direction : undefined} tone={scrubbing ? styles.point : undefined} morph /></small>
    </figcaption>
    <div ref={plot} className={styles.plot} data-interactive={interactive || undefined} {...scrub}>
      <svg className={styles.chart} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={`${uid}-lit`} clipPathUnits="userSpaceOnUse"><motion.rect x={-16} y={-16} width={lit} height={box.h + 32} /></clipPath>
          <clipPath id={`${uid}-dim`} clipPathUnits="userSpaceOnUse"><motion.rect x={dim} y={-16} width={box.w + 32} height={box.h + 32} /></clipPath>
          <clipPath id={`${uid}-fill`} clipPathUnits="userSpaceOnUse"><motion.rect x={-16} y={-16} width={reveal} height={box.h + 32} /></clipPath>
        </defs>
        {area && <motion.path className={`${styles.area} ${styles[tone]}`} d={fill} clipPath={`url(#${uid}-fill)`} />}
        <line className={styles.baseline} x1="0" y1={box.h - .5} x2={box.w} y2={box.h - .5} />
        {/* Gezerken imleçten sonraki kısım solar; sanki sonraki noktalar henüz olmamış gibi. */}
        <motion.path className={styles.trail} d={trail} clipPath={`url(#${uid}-dim)`} initial={false} animate={{ opacity: scrubbing && landed ? 1 : 0 }} transition={reduceMotion ? { duration: 0 } : quick} />
        <motion.polyline className={[styles.line, styles[tone]].join(" ")} points={line} clipPath={`url(#${uid}-lit)`} style={{ pathLength: drawn, opacity: lineOpacity }} />
        <motion.line className={styles.cursor} x1={cursorX} x2={cursorX} y1={0} y2={box.h} initial={false} animate={{ opacity: scrubbing ? 1 : 0 }} transition={reduceMotion ? { duration: 0 } : quick} />
        {/* Sıfır uzunlukta yuvarlak uçlu çizgi gerçek bir daire olur ve çizginin rengini alır. Son noktada durur ve gezme tutamağına dönüşür. */}
        <motion.polyline className={[styles.end, styles[tone]].join(" ")} points={dot} initial={false} animate={{ opacity: landed ? 1 : 0, strokeWidth: landed ? scrubbing ? 10 : 7 : 0 }} transition={reduceMotion ? { duration: 0 } : { opacity: quick, strokeWidth: motionTokens.spring.snappy }} fill="none" strokeLinecap="round" />
      </svg>
    </div>
  </figure>;
}

export default Sparkline;
