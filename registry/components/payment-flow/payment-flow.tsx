"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { toMajor, toMinor } from "../lib/shop-format";
import { useElementWidth, useOnScreen, useReducedMotionSafe } from "../lib/viz-utils";
import { DEFAULT_STOPS, STATIC_FRAME, backPath, balanceAfter, balanceText, chipText, cycleFrame, describeFlow, layoutFor, lineFills, mainPath, netOf, positionOf, secondsText, settleSplit, statusText, type Economics, type Frame, type StopInfo } from "./payment-flow-format";
import styles from "./payment-flow.module.css";

export type { Economics, StopInfo };

/** Kartlı bir ödemenin ödeme noktasından işlemciye, kart ağına, bankaya ve geri onayla satıcı bakiyesine nasıl gittiğini hareketli bir şemayla anlatmak için kullanın. Bu bir anlatım çizimidir: gerçek ödeme almaz, giriş alanı yoktur; tutar ve komisyonu uygulamanın gerçek fiyatlandırmasıyla eşleştirin. */
export interface PaymentFlowProps {
  /** Ödeme tutarı (ana birimde TRY). */
  amount: number;
  /** İşlemci komisyonu (ana birimde TRY); net tutar = tutar − komisyon. */
  commission: number;
  /** Satıcı bakiyesinin başlangıç değeri. */
  balance?: number;
  /** Durak adları ve açıklamaları (5 öğe: ödeme noktası, işlemci, kart ağı, banka, bakiye). */
  stops?: StopInfo[];
  /** Takas zamanı ("ertesi iş günü"). */
  settlement?: string;
  /** Yetkilendirme süresi (saniye); adım satırında sayarak gösterilir. */
  authSeconds?: number;
  /** Oynatma hızı çarpanı; 0 donukluk demektir. Değişim yayla yumuşar. */
  speed?: number;
  paused?: boolean;
  /** Bir döngünün süresi (saniye, hız 1 iken). */
  cycleSeconds?: number;
  /** Görünür alt yazı; şemanın açıklamasıdır. */
  caption?: string;
  /** Şemanın sesli anlatımı; verilmezse duraklardan ve tutarlardan üretilir. */
  label?: string;
}

const ICONS: string[] = [
  "M5 8h14v9H5z M5 11h14 M8 14.5h3",
  "M4 7h16v10H4z M9 12h6 M12 9v6",
  "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M4 12h16 M12 4c3 3 3 13 0 16 M12 4c-3 3-3 13 0 16",
  "M3 10l9-5 9 5 M5 10v7 M9 10v7 M15 10v7 M19 10v7 M3 19h18",
  "M4 8h16v10H4z M4 8l2-3h12l2 3 M15 13h3",
];

export function PaymentFlow({ amount, commission, balance = 0, stops = DEFAULT_STOPS, settlement = "ertesi iş günü", authSeconds = 1.84, speed = 1, paused = false, cycleSeconds = 14, caption, label }: PaymentFlowProps) {
  const reduced = useReducedMotionSafe();
  const [box, width] = useElementWidth<HTMLElement>();
  const [screen, onScreen] = useOnScreen<HTMLElement>();
  const layout = useMemo(() => layoutFor(width), [width]);
  const split = useMemo(() => settleSplit(layout), [layout]);
  const economics: Economics = useMemo(() => ({ amount, commission }), [amount, commission]);
  const [paidCycles, setPaidCycles] = useState(0);
  const names = stops.length >= 5 ? stops : DEFAULT_STOPS;

  const chip = useRef<HTMLDivElement>(null);
  const statusRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stopRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<Record<string, SVGPathElement | null>>({});
  const authText = useRef<HTMLSpanElement>(null);
  const authBar = useRef<HTMLElement>(null);
  const clearBar = useRef<HTMLElement>(null);
  const clock = useRef({ t: 0, rate: 0, hover: false, paid: 0, shown: "" });

  const apply = (frame: Frame, p: number) => {
    const where = positionOf(frame, layout);
    const node = chip.current;
    if (node) {
      node.style.left = `${(where.x / layout.width) * 100}%`;
      node.style.top = `${(where.y / layout.height) * 100}%`;
      const text = frame.chip ? chipText(frame.chip, economics) : "";
      if (text !== clock.current.shown) { node.textContent = text; clock.current.shown = text; }
      node.dataset.mode = frame.chip ?? "none";
      node.style.opacity = frame.chip ? "1" : "0";
    }
    frame.statuses.forEach((key, at) => {
      const element = statusRefs.current[at];
      const next = key ? statusText(key, economics) : names[at]!.rest;
      if (element && element.textContent !== next) element.textContent = next;
      const holder = stopRefs.current[at];
      if (holder) { if (key) holder.dataset.active = ""; else delete holder.dataset.active; }
    });
    const fills = lineFills(frame, p, split);
    const set = (key: string, value: number) => { const path = lineRefs.current[key]; if (path) path.style.strokeDashoffset = String(1 - value); };
    set("main", fills.main); set("back", fills.back); set("settle", fills.settle);
    if (authText.current) authText.current.textContent = secondsText(authSeconds * frame.authFill);
    if (authBar.current) authBar.current.style.transform = `scaleX(${frame.authFill})`;
    if (clearBar.current) clearBar.current.style.transform = `scaleX(${frame.clearingFill})`;
  };

  useEffect(() => {
    if (reduced) { apply(STATIC_FRAME, .915); return; }
    const state = clock.current;
    const target = () => paused || !onScreen ? 0 : speed * (state.hover ? .4 : 1);
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      state.rate += (target() - state.rate) * (1 - Math.exp(-dt * 6));
      state.t += dt * state.rate;
      const progress = state.t / cycleSeconds, cycles = Math.floor(progress), p = progress - cycles;
      apply(cycleFrame(p), p);
      const paid = cycles + (p >= .96 ? 1 : 0);
      if (paid !== state.paid) { state.paid = paid; setPaidCycles(paid); }
      if (target() === 0 && state.rate < .002) { state.rate = 0; return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, paused, onScreen, speed, cycleSeconds, layout, economics, authSeconds, names]);

  const sentence = label ?? describeFlow(economics, names, settlement);
  const dashed = (points: { x: number; y: number }[]) => points.map((point, at) => `${at ? "L" : "M"}${point.x} ${point.y}`).join(" ");
  const shownBalance = reduced ? balance : toMajor(toMinor(balanceAfter(balance, paidCycles, economics)));
  const placed = [...layout.stops, layout.balance];

  return <figure ref={node => { screen.current = node; box.current = node; }} className={styles.root} data-reduced={reduced || undefined} data-vertical={layout.vertical || undefined}>
    <div role="img" aria-label={sentence} className={styles.stage} style={{ aspectRatio: `${layout.width} / ${layout.height}` }}>
      <svg className={styles.svg} viewBox={`0 0 ${layout.width} ${layout.height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
        <path className={styles.track} d={dashed(mainPath(layout))} />
        <path className={styles.track} d={dashed(layout.settle)} data-settle="" />
        <path ref={node => { lineRefs.current.main = node; }} className={styles.lit} d={dashed(mainPath(layout))} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
        <path ref={node => { lineRefs.current.back = node; }} className={styles.litDone} d={dashed(backPath(layout))} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1, transform: layout.vertical ? "translateX(8px)" : "translateY(-8px)" }} />
        <path ref={node => { lineRefs.current.settle = node; }} className={styles.lit} d={dashed(layout.settle)} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
        <circle className={styles.commissionDot} cx={layout.commission.x} cy={layout.commission.y} r={5} />
      </svg>
      <div className={styles.stops} aria-hidden="true">
        {placed.map((point, at) => <div key={at} ref={node => { stopRefs.current[at] = node; }} className={styles.stop} style={{ left: `${(point.x / layout.width) * 100}%`, top: `${(point.y / layout.height) * 100}%` }}
          onPointerEnter={() => { clock.current.hover = true; }} onPointerLeave={() => { clock.current.hover = false; }}>
          <span className={styles.icon}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[at]} /></svg></span>
          <b className={styles.name}>{names[at]!.name}</b>
          <span ref={node => { statusRefs.current[at] = node; }} className={styles.status}>{names[at]!.rest}</span>
          {at === 4 && <span className={styles.balance}><AnimatedCounter value={shownBalance} decimals={2} prefix="₺" /></span>}
          <span className={styles.detail}>{names[at]!.detail}</span>
        </div>)}
        <div className={styles.commissionLabel} style={{ left: `${(layout.commission.x / layout.width) * 100}%`, top: `${(layout.commission.y / layout.height) * 100}%` }}>Komisyon</div>
        <div ref={chip} className={styles.chip} data-mode="none" style={{ left: "0%", top: "0%" }} />
      </div>
    </div>
    <div className={styles.steps} aria-hidden="true">
      <div><span>Yetkilendirme</span><span ref={authText} className={styles.num}>{secondsText(0)}</span><i className={styles.bar}><i ref={authBar} /></i></div>
      <div><span>Takas</span><span className={styles.num}>{settlement}</span><i className={styles.bar}><i ref={clearBar} /></i></div>
      <div><span>Net tutar</span><span className={styles.num}>{balanceText(netOf(economics))}</span></div>
    </div>
    {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
  </figure>;
}

export default PaymentFlow;
