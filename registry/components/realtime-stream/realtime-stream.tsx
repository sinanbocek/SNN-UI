"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { clamp, useElementWidth, useOnScreen, useReducedMotionSafe } from "../lib/viz-utils";
import { anomalyAnnouncement, clockText, domainFor, nearestIndex, readingText, smoothPath, tickText, timeTicks, valueText, windowReadings, type StreamKind, type StreamReading } from "./realtime-stream-format";
import styles from "./realtime-stream.module.css";

export type { StreamKind, StreamReading };

/** Saniyeler içinde değişen bir ölçümü (yanıt süresi, anlık fiyat, kuyruk uzunluğu) canlı izlemek için kullanın; geçmişe bakış için fırça grafiği, küçük eğilim için mini çizgi daha doğrudur. */
export interface RealtimeStreamProps {
  /** Zamana göre artan okumalar. Dizi sınırsız büyütülmez: son birkaç pencereyi tutmak uygulamanın işidir. */
  readings: StreamReading[];
  /** Ölçümün adı, örneğin "Yanıt süresi". */
  label: string;
  description?: string | undefined;
  kind?: StreamKind | undefined;
  /** Birim, örneğin "ms". Para için gerekmez. */
  unit?: string | undefined;
  /** Büyük değerin ve ipucunun ondalık basamağı (para her zaman 2). */
  decimals?: number | undefined;
  /** Görünen zaman penceresi (ms). */
  windowMs?: number | undefined;
  /** Verilirse değer ekseni bu sınırlara oturur; verilmezse veriyi izler. */
  min?: number | undefined;
  max?: number | undefined;
  status?: "live" | "disconnected" | undefined;
  onRetry?: (() => void) | undefined;
  height?: number | undefined;
}

type View = { end: number; low: number; high: number };

export function RealtimeStream({ readings, label, description, kind = "number", unit = "", decimals = 0, windowMs = 30000, min, max, status = "live", onRetry, height = 180 }: RealtimeStreamProps) {
  const reduced = useReducedMotionSafe();
  const titleId = useId();
  const [plotRef, width] = useElementWidth<HTMLDivElement>();
  const [visibleRef, onScreen] = useOnScreen<HTMLElement>();
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");
  const latest = readings[readings.length - 1];
  const frozen = paused || hold || selected !== null;

  const targetEnd = latest?.t ?? 0;
  const targetOf = (end: number): [number, number] => domainFor(windowReadings(readings, end, windowMs), min, max);
  const [view, setView] = useState<View>(() => { const [low, high] = targetOf(targetEnd); return { end: targetEnd, low, high }; });
  const viewRef = useRef(view);
  viewRef.current = view;
  const heldEnd = useRef<number | null>(null);

  // Dondurunca görünüm o anki konumda kalır; bırakınca canlıya yumuşakça döner.
  if (frozen && heldEnd.current === null) heldEnd.current = view.end;
  if (!frozen && heldEnd.current !== null) heldEnd.current = null;
  const goalEnd = heldEnd.current ?? targetEnd;

  // Çizim döngüsü: pencere sonu ve eksen aralığı hedefe üstel yaklaşır. Yerleşince durur; yeni okuma gelince yeniden başlar.
  useEffect(() => {
    if (!onScreen || !latest) return;
    const [lowGoal, highGoal] = targetOf(goalEnd);
    // İlk okuma ya da uzun bir kesintiden sonraki okuma: pencere uzaktan süzülmez, doğrudan oturur.
    const far = Math.abs(viewRef.current.end - goalEnd) > windowMs * 1.5;
    if (reduced || far) { const snapped = { end: goalEnd, low: lowGoal, high: highGoal }; viewRef.current = snapped; setView(snapped); if (reduced) return; }
    let raf = 0, previous = performance.now();
    const step = (now: number) => {
      const dt = Math.min(64, now - previous);
      previous = now;
      const k = 1 - Math.exp(-dt / 160), current = viewRef.current;
      const [low, high] = targetOf(clamp(current.end, goalEnd - windowMs, goalEnd + windowMs));
      const next = { end: current.end + (goalEnd - current.end) * k, low: current.low + (low - current.low) * k, high: current.high + (high - current.high) * k };
      const done = Math.abs(goalEnd - next.end) < 2 && Math.abs(low - next.low) < (highGoal - lowGoal) * .002 && Math.abs(high - next.high) < (highGoal - lowGoal) * .002;
      if (done) { next.end = goalEnd; next.low = low; next.high = high; }
      viewRef.current = next;
      setView(next);
      if (!done) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalEnd, latest?.t, onScreen, reduced, windowMs, min, max, readings.length]);

  // Anomali gelince bir kez duyurulur.
  const announcedNote = useRef<number>(0);
  useEffect(() => {
    if (latest?.note && latest.t > announcedNote.current) { announcedNote.current = latest.t; setAnnounce(anomalyAnnouncement(kind, latest, unit, decimals)); }
  }, [decimals, kind, latest, unit]);

  const visible = useMemo(() => windowReadings(readings, view.end, windowMs), [readings, view.end, windowMs]);
  const inWindow = visible.filter(reading => reading.t >= view.end - windowMs && reading.t <= view.end);
  const innerHeight = height;
  const xOf = (t: number) => ((t - (view.end - windowMs)) / windowMs) * width;
  const yOf = (value: number) => innerHeight - ((value - view.low) / (view.high - view.low)) * (innerHeight - 8) - 4;
  const points = visible.map(reading => ({ x: xOf(reading.t), y: yOf(reading.value) }));
  const line = smoothPath(points);
  const area = points.length > 1 ? `${line}L${points[points.length - 1]!.x} ${innerHeight}L${points[0]!.x} ${innerHeight}Z` : "";
  const picked = selected === null ? null : readings[selected];
  const tickCount = width < 360 ? 2 : 3;
  const yTicks = [view.low + (view.high - view.low) * .1, (view.low + view.high) / 2, view.high - (view.high - view.low) * .1];

  const select = (index: number | null) => {
    if (index === null) { setSelected(null); return; }
    const bounded = clamp(index, 0, readings.length - 1);
    setSelected(bounded);
    const reading = readings[bounded];
    if (reading) setAnnounce(readingText(kind, reading, unit, decimals));
  };
  const indexAt = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const t = view.end - windowMs + ((event.clientX - rect.left) / rect.width) * windowMs;
    return nearestIndex(readings, t);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = selected ?? readings.length - 1;
    const oldest = readings.findIndex(reading => reading.t >= view.end - windowMs);
    if (event.key === " ") { event.preventDefault(); setPaused(value => !value); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); select(selected === null ? index : index - 1); }
    else if (event.key === "ArrowRight") { event.preventDefault(); select(selected === null ? index : index + 1); }
    else if (event.key === "PageUp") { event.preventDefault(); select(index + 10); }
    else if (event.key === "PageDown") { event.preventDefault(); select(index - 10); }
    else if (event.key === "Home") { event.preventDefault(); select(Math.max(oldest, 0)); }
    else if (event.key === "End") { event.preventDefault(); select(readings.length - 1); }
    else if (event.key === "Escape") { select(null); setHold(false); }
  };

  const bigDecimals = kind === "money" ? 2 : decimals;
  const stale = status === "disconnected";

  return <figure ref={visibleRef} className={styles.figure} data-reduced={reduced || undefined} data-stale={stale || undefined} aria-labelledby={titleId}>
    <div className={styles.head}>
      <div className={styles.titles}>
        <figcaption id={titleId} className={styles.title}>{label}</figcaption>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <button type="button" className={styles.status} aria-pressed={paused} disabled={stale} onClick={() => setPaused(value => !value)} aria-label="Akışı duraklat">
        <span className={styles.statusMark} aria-hidden="true">{stale ? "✕" : paused ? "❚❚" : "●"}</span>
        <span>{stale ? "Kesildi" : paused ? "Duraklatıldı" : "Canlı"}</span>
      </button>
    </div>
    {latest ? <>
      <div className={styles.big}>
        <AnimatedCounter value={latest.value} decimals={bigDecimals} prefix={kind === "money" ? "₺" : ""} suffix={unit && kind !== "money" ? ` ${unit}` : ""} />
      </div>
      <div className={styles.chart}>
        <div ref={plotRef} className={styles.plot} style={{ height: innerHeight }} role="group" aria-roledescription="canlı akış grafiği" aria-label={`${label}; sol ve sağ ok okumalar arasında gezer, boşluk akışı duraklatır`} tabIndex={0}
          onKeyDown={onKeyDown} onFocus={event => { if (event.currentTarget.matches(":focus-visible")) { setHold(true); select(readings.length - 1); } }} onBlur={() => { setHold(false); setSelected(null); }}
          onPointerEnter={event => { if (event.pointerType === "mouse") setHold(true); }} onPointerMove={event => { if (event.pointerType === "mouse" || event.buttons) setSelected(indexAt(event)); }}
          onPointerDown={event => { setHold(true); setSelected(indexAt(event)); }} onPointerUp={event => { if (event.pointerType !== "mouse") { setHold(false); setSelected(null); } }}
          onPointerLeave={event => { if (event.pointerType === "mouse") { setHold(false); setSelected(null); } }}>
          <svg className={styles.svg} width={width} height={innerHeight} aria-hidden="true">
            {yTicks.map((tick, at) => <line key={at} className={styles.grid} x1={0} x2={width} y1={yOf(tick)} y2={yOf(tick)} />)}
            {area && <path className={styles.area} d={area} />}
            {line && <path className={styles.line} d={line} />}
            {inWindow.filter(reading => reading.note).map(reading => <g key={reading.t} className={styles.flag}>
              <circle cx={xOf(reading.t)} cy={yOf(reading.value)} r={4.5} />
              <text x={clamp(xOf(reading.t), 24, Math.max(24, width - 24))} y={yOf(reading.value) - 10} textAnchor="middle">{reading.note}</text>
            </g>)}
            {latest.t <= view.end + 1 && <circle className={styles.head2} cx={xOf(latest.t)} cy={yOf(latest.value)} r={3.5} />}
            {picked && picked.t >= view.end - windowMs && picked.t <= view.end && <g>
              <line className={styles.cursor} x1={xOf(picked.t)} x2={xOf(picked.t)} y1={0} y2={innerHeight} />
              <circle className={styles.pick} cx={xOf(picked.t)} cy={yOf(picked.value)} r={4} />
            </g>}
          </svg>
          {picked && <div className={styles.tip} style={{ left: clamp(xOf(picked.t), 70, Math.max(70, width - 70)), top: Math.max(0, yOf(picked.value) - 44) }} role="presentation">{readingText(kind, picked, unit, decimals)}</div>}
          {stale && <div className={styles.lost}><span>Bağlantı kesildi.</span>{onRetry && <button type="button" className={styles.retry} onClick={onRetry}>Yeniden dene</button>}</div>}
        </div>
        <div className={styles.gutter} aria-hidden="true">{yTicks.map((tick, at) => <span key={at} className={styles.yTick} style={{ top: yOf(tick) }}>{tickText(kind, tick)}</span>)}</div>
        <div className={styles.axis} aria-hidden="true">{timeTicks(view.end, windowMs, tickCount).map((tick, at) => <span key={at} className={styles.xTick} data-first={at === 0 || undefined} data-last={at === tickCount || undefined} style={{ left: `${(at / tickCount) * 100}%` }}>{clockText(tick)}</span>)}</div>
      </div>
    </> : <p className={styles.empty}>{stale ? "Bağlantı kesildi." : "Veri bekleniyor."}{stale && onRetry && <button type="button" className={styles.retry} onClick={onRetry}>Yeniden dene</button>}</p>}
    <div className={styles.srOnly}><table>
      <caption>{label}, son okumalar</caption>
      <thead><tr><th scope="col">Zaman</th><th scope="col">Değer</th><th scope="col">Not</th></tr></thead>
      <tbody>{readings.slice(-20).map(reading => <tr key={reading.t}><th scope="row">{clockText(reading.t)}</th><td>{valueText(kind, reading.value, decimals)}{unit && kind !== "money" ? ` ${unit}` : ""}</td><td>{reading.note ?? ""}</td></tr>)}</tbody>
    </table></div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
  </figure>;
}

export default RealtimeStream;
