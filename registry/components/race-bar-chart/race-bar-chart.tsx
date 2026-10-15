"use client";

import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { clamp, seriesColor, useElementWidth, useOnScreen, useReducedMotionSafe } from "../lib/viz-utils";
import { axisTarget, axisTicks, fullText, periodAnnouncement, rankAnnouncement, rowsAt, shortText, type RaceItem, type RaceKind, type RacePeriod } from "./race-bar-chart-format";
import styles from "./race-bar-chart.module.css";

export type { RaceItem, RaceKind, RacePeriod };

/** Bir sıralamanın zaman içinde nasıl değiştiğini anlatmak için kullanın (yıl sonu özeti, lansman anlatısı); her gün bakılan panelde yeri yoktur, anlık karşılaştırma için çubuk grafik daha doğrudur. */
export interface RaceBarChartProps {
  periods: RacePeriod[];
  items: RaceItem[];
  /** Grafiğin adı, örneğin "Bölgeye göre aylık ciro". */
  label: string;
  description?: string;
  kind?: RaceKind;
  /** Aynı anda görünen çubuk sayısı. */
  topN?: number;
  /** Görününce kendiliğinden oynar ("hareketi azalt" açıkken oynamaz). */
  autoPlay?: boolean;
  /** Son dönemden sonra başa sarar. */
  loop?: boolean;
  /** Bir dönemin akış süresi (ms). */
  msPerPeriod?: number;
  emptyText?: string;
}

const ROW = 36;

export function RaceBarChart({ periods, items, label, description, kind = "money", topN = 8, autoPlay = true, loop = false, msPerPeriod = 1100, emptyText = "Veri yok." }: RaceBarChartProps) {
  const reduced = useReducedMotionSafe();
  const titleId = useId();
  const [box, width] = useElementWidth<HTMLDivElement>();
  const [visibleRef, onScreen] = useOnScreen<HTMLElement>();
  const lastIndex = Math.max(periods.length - 1, 0);
  const shown = Math.min(topN, items.length);
  const [clock, setClock] = useState(() => ({ t: 0, axis: axisTarget(items, 0, shown) }));
  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [cursor, setCursor] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");
  const clockRef = useRef(clock);
  clockRef.current = clock;
  const started = useRef(false);

  // Görününce bir kez kendiliğinden başlar.
  useEffect(() => {
    if (started.current || !autoPlay || reduced || !onScreen || periods.length < 2) return;
    started.current = true;
    setPlaying(true);
  }, [autoPlay, onScreen, periods.length, reduced]);

  // Zaman ve eksen döngüsü: oynarken zamanı ilerletir, eksen üst sınırı hedefe yumuşakça yaklaşır. Duruncaya kadar kare çağırır.
  useEffect(() => {
    if (reduced || periods.length < 2) return;
    let raf = 0, previous = performance.now();
    const step = (now: number) => {
      const dt = Math.min(64, now - previous);
      previous = now;
      const current = clockRef.current;
      let t = current.t, stop = false;
      if (playing && onScreen) {
        t += dt / msPerPeriod;
        if (t >= lastIndex) {
          if (loop) t = 0; else { t = lastIndex; stop = true; }
        }
      }
      const target = axisTarget(items, t, shown);
      let axis = current.axis + (target - current.axis) * (1 - Math.exp(-dt / 220));
      const settled = Math.abs(axis - target) < target * .002;
      if (settled) axis = target;
      if (t !== current.t || axis !== current.axis) { clockRef.current = { t, axis }; setClock({ t, axis }); }
      if (stop) setPlaying(false);
      if (!stop && ((playing && onScreen) || !settled)) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items, loop, lastIndex, msPerPeriod, onScreen, periods.length, playing, reduced, seek, shown]);

  const jump = (t: number) => {
    const next = clamp(reduced ? Math.round(t) : t, 0, lastIndex);
    const axis = reduced ? axisTarget(items, next, shown) : clockRef.current.axis;
    clockRef.current = { t: next, axis };
    setClock({ t: next, axis });
    setSeek(count => count + 1);
  };
  const settledAnnounce = (t: number) => {
    const index = Math.round(t), leader = rowsAt(items, index)[0];
    if (leader && periods[index]) setAnnounce(periodAnnouncement(periods[index]!.label, leader.label));
  };
  const toggle = () => {
    if (playing) { setPlaying(false); settledAnnounce(clock.t); return; }
    if (clock.t >= lastIndex) jump(0);
    setPlaying(true);
  };

  const groups = useMemo(() => [...new Set(items.map(item => item.group).filter((group): group is string => !!group))].slice(0, 4), [items]);
  const colorOf = (group: string | undefined) => seriesColor(group ? Math.max(0, groups.indexOf(group)) : 0);
  const rows = rowsAt(items, clock.t);
  const periodLabel = periods[Math.round(clock.t)]?.label ?? "";
  const narrow = width > 0 && width < 400;
  const ticks = axisTicks(clock.axis);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const whole = Math.round(clock.t);
    if (event.key === " " || event.key === "Enter") { event.preventDefault(); toggle(); }
    else if (event.key === "ArrowRight") { event.preventDefault(); setPlaying(false); jump(whole + 1); settledAnnounce(whole + 1); }
    else if (event.key === "ArrowLeft") { event.preventDefault(); setPlaying(false); jump(whole - 1); settledAnnounce(whole - 1); }
    else if (event.key === "Home") { event.preventDefault(); setPlaying(false); jump(0); settledAnnounce(0); }
    else if (event.key === "End") { event.preventDefault(); setPlaying(false); jump(lastIndex); settledAnnounce(lastIndex); }
    else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = clamp((cursor ?? (event.key === "ArrowDown" ? -1 : shown)) + (event.key === "ArrowDown" ? 1 : -1), 0, shown - 1);
      setCursor(next);
      const row = rows[next];
      if (row) setAnnounce(rankAnnouncement(kind, row.label, row.rank, row.value));
    } else if (event.key === "Escape") { setCursor(null); setAnnounce(""); }
  };
  const onSlide = (event: ChangeEvent<HTMLInputElement>) => { setPlaying(false); jump(Number(event.target.value)); };

  if (!periods.length || !items.length) return <figure className={styles.figure}><figcaption className={styles.title}>{label}</figcaption><p className={styles.empty}>{emptyText}</p></figure>;

  return <figure ref={visibleRef} className={styles.figure} data-reduced={reduced || undefined} data-narrow={narrow || undefined} aria-labelledby={titleId}>
    <div className={styles.head}>
      <figcaption id={titleId} className={styles.title}>{label}</figcaption>
      {description && <p className={styles.description}>{description}</p>}
    </div>
    <div className={styles.focus} role="group" aria-roledescription="sıralama yarışı" aria-label={`${label}; boşluk oynatır ve duraklatır, sol ve sağ ok dönemi değiştirir, yukarı ve aşağı ok sırada gezinir`} tabIndex={0} onKeyDown={onKeyDown} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setCursor(null); }}>
      <div ref={box} className={styles.field} style={{ height: shown * ROW + 8 }} aria-hidden="true">
        <div className={styles.axis}>{ticks.map(tick => <span key={tick} className={styles.tick} style={{ left: `${(tick / clock.axis) * 100}%` }}><span className={styles.tickText}>{shortText(kind, tick)}</span></span>)}</div>
        {rows.map(row => {
          const visible = row.rank < shown;
          const percent = clamp((row.value / clock.axis) * 100, 0, 100);
          return <div key={row.key} className={styles.row} data-hidden={!visible || undefined} data-cursor={cursor === row.rank || undefined} data-lead={row.rank === 0 || undefined} style={{ transform: `translateY(${(visible ? row.rank : shown) * ROW}px)`, height: ROW }}>
            <span className={styles.name}>{row.label}</span>
            <span className={styles.track}>
              <span className={styles.bar} style={{ width: `${percent}%`, background: colorOf(row.group) }} />
              <span className={styles.value} style={{ left: `${percent}%` }}>{shortText(kind, row.value)}</span>
            </span>
          </div>;
        })}
        <span key={periodLabel} className={styles.period}>{periodLabel}</span>
      </div>
      {groups.length > 0 && <ul className={styles.legend} aria-hidden="true">{groups.map(group => <li key={group}><span className={styles.swatch} style={{ background: colorOf(group) }} />{group}</li>)}</ul>}
      <div className={styles.timeline}>
        <button type="button" className={styles.play} onClick={toggle} aria-label={playing ? "Duraklat" : clock.t >= lastIndex ? "Baştan oynat" : "Oynat"} aria-pressed={playing}>
          <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span><span>{playing ? "Duraklat" : clock.t >= lastIndex ? "Baştan oynat" : "Oynat"}</span>
        </button>
        <span className={styles.edge}>{periods[0]?.label}</span>
        <input className={styles.slider} type="range" min={0} max={lastIndex} step="any" value={clock.t} onChange={onSlide} aria-label="Dönem" aria-valuetext={periodLabel} />
        <span className={styles.edge}>{periods[lastIndex]?.label}</span>
      </div>
    </div>
    <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Öğe</th>{periods.map(period => <th key={period.key} scope="col">{period.label}</th>)}</tr></thead>
      <tbody>{items.map(item => <tr key={item.key}><th scope="row">{item.label}</th>{periods.map((period, index) => <td key={period.key}>{fullText(kind, item.values[index] ?? 0)}</td>)}</tr>)}</tbody>
    </table></div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
  </figure>;
}

export default RaceBarChart;
