"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { useElementWidth, useOnScreen } from "../lib/viz-utils";
import styles from "./data-flow.module.css";

export interface FlowNode {
  id: string;
  label: string;
  /** İkinci satır (ürün adı gibi); dar düzende gizlenir. */
  subtitle?: string;
  /** Fareyle üstüne gelince görünen tek satırlık ayrıntı. */
  detail?: string;
  /** Düğüm simgesi; çağıran verir. */
  icon?: ReactNode;
  /** Bu düğümün kayıtlarının rengi (CSS değeri). Yoksa vurgu rengi. */
  color?: string;
}
export interface FlowTarget extends FlowNode {
  /** 0–1: hedefin kayıtların yalnız bir kesrini aldığı durum (uyarılar gibi). Şema doğruyu söyler. */
  share?: number;
}
export interface FlowProcess { label: string; detail?: string; icon?: ReactNode; counterLabel?: string; initialCount?: number }

export interface DataFlowProps {
  sources: FlowNode[];
  process: FlowProcess;
  targets: FlowTarget[];
  /** Akış hızı çarpanı. Değişim yayla yumuşar. */
  speed?: number;
  /** true iken akış yavaşlayarak durur. */
  paused?: boolean;
  /** Şemanın altında görünür açıklama. */
  caption?: string;
  /** Şemayı sesli anlatan metin. Verilmezse düğüm adlarından üretilir. */
  label?: string;
  className?: string;
}

type Point = { x: number; y: number };
interface Layout { processWidth: number; width: number; height: number; vertical: boolean; nodeWidth: number; sources: Point[]; targets: Point[]; process: Point; inAt: Point[]; outAt: Point[]; processIn: Point[]; processOut: Point[] }

const CYCLE = 6; // saniye; kaynaklar bu süre içinde sırayla birer kayıt çıkarır.
const THRESHOLD = { arrive: 0.4, leave: 0.5, end: 0.95 };

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
// Çizim değerleri için yuvarlama (toFixed kullanılmaz).
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

function bezier(from: Point, to: Point, vertical: boolean, u: number): Point {
  const a = vertical ? { x: from.x, y: from.y + (to.y - from.y) * 0.5 } : { x: from.x + (to.x - from.x) * 0.5, y: from.y };
  const b = vertical ? { x: to.x, y: to.y - (to.y - from.y) * 0.5 } : { x: to.x - (to.x - from.x) * 0.5, y: to.y };
  const k = 1 - u;
  return {
    x: k * k * k * from.x + 3 * k * k * u * a.x + 3 * k * u * u * b.x + u * u * u * to.x,
    y: k * k * k * from.y + 3 * k * k * u * a.y + 3 * k * u * u * b.y + u * u * u * to.y,
  };
}
const curve = (from: Point, to: Point, vertical: boolean) => vertical
  ? `M${from.x} ${from.y}C${from.x} ${from.y + (to.y - from.y) * 0.5} ${to.x} ${to.y - (to.y - from.y) * 0.5} ${to.x} ${to.y}`
  : `M${from.x} ${from.y}C${from.x + (to.x - from.x) * 0.5} ${from.y} ${to.x - (to.x - from.x) * 0.5} ${to.y} ${to.x} ${to.y}`;

function computeLayout(width: number, sourceCount: number, targetCount: number): Layout {
  const vertical = width < 700;
  if (vertical) {
    const height = 380;
    const nodeWidth = Math.max(64, Math.min(120, width / Math.max(sourceCount, targetCount) - 10));
    const row = (count: number, y: number) => Array.from({ length: count }, (_, index) => ({ x: (width * (index + 0.5)) / count, y }));
    const sources = row(sourceCount, 36);
    const targets = row(targetCount, height - 36);
    const process = { x: width / 2, y: height / 2 };
    return { processWidth: 132, width, height, vertical, nodeWidth, sources, targets, process, inAt: sources.map(p => ({ x: p.x, y: p.y + 28 })), processIn: sources.map(() => ({ x: process.x, y: process.y - 30 })), processOut: targets.map(() => ({ x: process.x, y: process.y + 30 })), outAt: targets.map(p => ({ x: p.x, y: p.y - 28 })) };
  }
  const rows = Math.max(sourceCount, targetCount);
  const height = Math.max(240, rows * 84 + 24);
  const nodeWidth = Math.min(168, width * 0.22);
  const column = (count: number, x: number) => Array.from({ length: count }, (_, index) => ({ x, y: (height * (index + 0.5)) / count }));
  const sources = column(sourceCount, nodeWidth / 2 + 8);
  const targets = column(targetCount, width - nodeWidth / 2 - 8);
  const process = { x: width / 2, y: height / 2 };
  const pw = Math.min(150, width * 0.2) / 2;
  return { processWidth: pw * 2, width, height, vertical, nodeWidth, sources, targets, process, inAt: sources.map(p => ({ x: p.x + nodeWidth / 2, y: p.y })), processIn: sources.map(() => ({ x: process.x - pw, y: process.y })), processOut: targets.map(() => ({ x: process.x + pw, y: process.y })), outAt: targets.map(p => ({ x: p.x - nodeWidth / 2, y: p.y })) };
}

/** Bir kaynak kaydı bu turda hedefe gidiyor mu? Pay verilen hedef kayıtların yalnız o kesrini alır; karar zamanın saf bir fonksiyonudur. */
const accepts = (cycle: number, target: number, share: number | undefined) => share === undefined || share >= 1 || (((cycle * 0.618 + target * 0.31) % 1) + 1) % 1 < share;

/** Verinin bir üründe nasıl aktığını anlatan hareketli şema: solda kaynaklar, ortada işleme, sağda hedefler. Gerçek hacim göstermez (hacim için `sankey-flow`). */
export function DataFlow({ sources, process, targets, speed = 1, paused = false, caption, label, className }: DataFlowProps) {
  const reduced = useReducedMotion();
  const [visibleRef, onScreen] = useOnScreen<HTMLDivElement>();
  const [widthRef, measured] = useElementWidth<HTMLDivElement>();
  const width = measured || 720;
  const layout = useMemo(() => computeLayout(width, sources.length, targets.length), [width, sources.length, targets.length]);
  const [hover, setHover] = useState<string | null>(null);
  const [processed, setProcessed] = useState(process.initialCount ?? 0);

  const rawRefs = useRef<(SVGCircleElement | null)[]>([]);
  const doneRefs = useRef<(SVGRectElement | null)[][]>([]);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const live = useRef({ speed, paused, hover: false });
  live.current = { speed, paused, hover: hover !== null };

  const sourceCount = sources.length;
  const targetCount = targets.length;
  const colors = useMemo(() => ({ sources: sources.map(item => item.color), targets: targets.map(item => item.color) }), [sources, targets]);

  // Çizim döngüsü yalnız değişen değerleri yazar; React kare başına yeniden çizilmez.
  useEffect(() => {
    const raws = rawRefs.current;
    const dones = doneRefs.current;
    const base = process.initialCount ?? 0;
    const place = (node: SVGElement | null, point: Point, opacity: number, scale = 1) => {
      if (!node) return;
      node.setAttribute("transform", `translate(${r1(point.x)} ${r1(point.y)}) scale(${r2(scale)})`);
      node.setAttribute("opacity", String(r2(opacity)));
    };
    const glow = (id: string, value: number) => nodeRefs.current[id]?.style.setProperty("--glow", String(r2(value)));

    const frame = (t: number) => {
      let count = 0;
      for (let i = 0; i < sourceCount; i += 1) {
        const offset = (i * CYCLE) / sourceCount;
        const local = t - offset;
        const cycle = Math.floor(local / CYCLE);
        const p = ((local / CYCLE) % 1 + 1) % 1;
        if (local >= 0) count += cycle + (p >= THRESHOLD.arrive ? 1 : 0);
        // İşlenmemiş kayıt: kaynaktan işleme noktasına.
        const rawOn = local >= 0 && p < THRESHOLD.arrive;
        const u = ease(p / THRESHOLD.arrive);
        place(raws[i] ?? null, bezier(layout.inAt[i]!, layout.processIn[i]!, layout.vertical, u), rawOn ? Math.min(1, p * 12, (THRESHOLD.arrive - p) * 12 + 0.2) : 0, rawOn ? 1 : 0.4);
        glow(sources[i]!.id, local >= 0 ? clamp01(1 - (p * CYCLE) / 0.7) : 0);
        // İşlenmiş kayıt: işleme noktasından kabul eden hedeflere (gerçekleşen tur için).
        for (let j = 0; j < targetCount; j += 1) {
          const turn = p >= THRESHOLD.leave ? cycle : cycle;
          const take = local >= 0 && accepts(turn, j, targets[j]!.share);
          const on = take && p >= THRESHOLD.leave && p < THRESHOLD.end;
          const v = ease((p - THRESHOLD.leave) / (THRESHOLD.end - THRESHOLD.leave));
          place(dones[i]?.[j] ?? null, bezier(layout.processOut[j]!, layout.outAt[j]!, layout.vertical, v), on ? Math.min(1, (p - THRESHOLD.leave) * 14, (THRESHOLD.end - p) * 14 + 0.2) : 0, on ? 1 : 0.4);
        }
      }
      // Düğüm kenarları kayıt çıktığında ve vardığında kısa süre vurgulanır.
      let processGlow = 0;
      const targetGlow = new Array<number>(targetCount).fill(0);
      for (let i = 0; i < sourceCount; i += 1) {
        const local = t - (i * CYCLE) / sourceCount;
        if (local < 0) continue;
        const cycle = Math.floor(local / CYCLE);
        const p = ((local / CYCLE) % 1 + 1) % 1;
        const sinceArrive = (p - THRESHOLD.arrive) * CYCLE;
        if (sinceArrive >= 0 && sinceArrive < 0.8) processGlow = Math.max(processGlow, 1 - sinceArrive / 0.8);
        for (let j = 0; j < targetCount; j += 1) {
          const sinceEnd = ((p - THRESHOLD.end + 1) % 1) * CYCLE;
          const turn = p >= THRESHOLD.end ? cycle : cycle - 1;
          if (sinceEnd < 0.8 && turn >= 0 && accepts(turn, j, targets[j]!.share)) targetGlow[j] = Math.max(targetGlow[j]!, 1 - sinceEnd / 0.8);
        }
      }
      glow("__process", processGlow);
      targets.forEach((item, j) => glow(item.id, targetGlow[j]!));
      return base + count;
    };

    // Hareketi azalt: tek durağan kare. Her giriş yolunda bir işlenmemiş, her çıkış yolunda bir işlenmiş kayıt.
    if (reduced) {
      for (let i = 0; i < sourceCount; i += 1) {
        place(raws[i] ?? null, bezier(layout.inAt[i]!, layout.processIn[i]!, layout.vertical, 0.5), 1);
        for (let j = 0; j < targetCount; j += 1) place(dones[i]?.[j] ?? null, bezier(layout.processOut[j]!, layout.outAt[j]!, layout.vertical, 0.5), i === 0 ? 1 : 0);
      }
      return;
    }
    if (!onScreen) return;

    let raf = 0;
    let last = performance.now();
    let clock = CYCLE * 0.12;
    let rate = 0;
    let shownCount = -1;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // Hız, duraklatma ve üstüne gelme yavaşlaması sönümlü yayla: durma anında olmaz, hız sıfır akışı tutar.
      const want = live.current.paused ? 0 : live.current.speed * (live.current.hover ? 0.35 : 1);
      rate += (want - rate) * (1 - Math.exp(-dt * 5));
      clock += dt * rate;
      const total = frame(clock);
      if (total !== shownCount) { shownCount = total; setProcessed(total); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // Kaynak ve hedef listesi çağıranın nesnesidir; döngü yerleşim ya da sayı değişince kurulur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, reduced, onScreen, sourceCount, targetCount, process.initialCount]);

  const spoken = label ?? `Veri akışı: ${sources.map(item => item.label).join(", ")} kaynaklarından kayıtlar ${process.label} adımında işlenir ve ${targets.map(item => item.label).join(", ")} hedeflerine dağılır.`;
  const place = (point: Point): CSSProperties => ({ left: point.x, top: point.y, width: layout.nodeWidth });
  const touches = (kind: "source" | "target", index: number) => hover === "__process" || (kind === "source" ? hover === sources[index]?.id : hover === targets[index]?.id);
  const hovered = (id: string) => (event: { pointerType?: string }) => { if (!event.pointerType || event.pointerType === "mouse") setHover(id); };

  const nodeBox = (node: FlowNode, point: Point, role: "source" | "target", index: number) => (
    <div
      key={node.id}
      ref={element => { nodeRefs.current[node.id] = element; }}
      className={styles.node}
      data-role={role}
      data-hover={hover === node.id || undefined}
      style={{ ...place(point), "--node-color": node.color ?? "var(--accent)" } as CSSProperties}
      onPointerEnter={hovered(node.id)}
      onPointerLeave={() => setHover(null)}
    >
      {node.icon && <span className={styles.icon} aria-hidden="true">{node.icon}</span>}
      <span className={styles.text}>
        <span className={styles.name}>{node.label}</span>
        {node.subtitle && <span className={styles.subtitle}>{node.subtitle}</span>}
      </span>
      {role === "target" && (targets[index]?.share ?? 1) < 1 && <span className={styles.share} aria-hidden="true" />}
      {hover === node.id && node.detail && <span className={styles.tag} aria-hidden="true">{node.detail}</span>}
    </div>
  );

  return (
    <figure className={`${styles.root} ${className ?? ""}`}>
      <div ref={visibleRef}>
        <div ref={widthRef} className={styles.stage} role="img" aria-label={spoken} style={{ height: layout.height }} data-vertical={layout.vertical || undefined}>
          <svg className={styles.paths} width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
            {sources.map((item, index) => <path key={`in-${item.id}`} className={styles.path} data-active={touches("source", index) || undefined} d={curve(layout.inAt[index]!, layout.processIn[index]!, layout.vertical)} />)}
            {targets.map((item, index) => <path key={`out-${item.id}`} className={styles.path} data-active={touches("target", index) || undefined} d={curve(layout.processOut[index]!, layout.outAt[index]!, layout.vertical)} />)}
            {sources.map((item, index) => <circle key={`raw-${item.id}`} ref={element => { rawRefs.current[index] = element; }} className={styles.raw} r={5} opacity={0} style={{ "--record-color": colors.sources[index] ?? "var(--text-muted)" } as CSSProperties} />)}
            {sources.map((item, index) => targets.map((target, j) => (
              <rect key={`done-${item.id}-${target.id}`} ref={element => { (doneRefs.current[index] ??= [])[j] = element; }} className={styles.done} x={-4.5} y={-4.5} width={9} height={9} rx={2.5} opacity={0} style={{ "--record-color": colors.targets[j] ?? "var(--accent)" } as CSSProperties} />
            )))}
          </svg>
          {sources.map((item, index) => nodeBox(item, layout.sources[index]!, "source", index))}
          <div
            ref={element => { nodeRefs.current.__process = element; }}
            className={styles.process}
            data-hover={hover === "__process" || undefined}
            style={{ left: layout.process.x, top: layout.process.y, width: layout.processWidth }}
            onPointerEnter={hovered("__process")}
            onPointerLeave={() => setHover(null)}
          >
            {process.icon && <span className={styles.icon} aria-hidden="true">{process.icon}</span>}
            <span className={styles.name}>{process.label}</span>
            <span className={styles.counter}><AnimatedCounter value={processed} />{process.counterLabel !== "" && <span className={styles.counterLabel}> {process.counterLabel ?? "işlendi"}</span>}</span>
            {hover === "__process" && process.detail && <span className={styles.tag} aria-hidden="true">{process.detail}</span>}
          </div>
          {targets.map((item, index) => nodeBox(item, layout.targets[index]!, "target", index))}
        </div>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}

export default DataFlow;
