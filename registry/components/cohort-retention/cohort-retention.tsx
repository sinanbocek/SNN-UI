"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { clamp, useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { cellAnnouncement, cellText, cohortLabel, pointsText, sizeText, tintShare, tipPercent, totalSignups, trendPoints, weightedAverage, type Cohort } from "./cohort-retention-format";
import styles from "./cohort-retention.module.css";

export type { Cohort };
export interface CohortSegment { value: string; label: string }

/** Aynı ayda katılan grupların aylar geçtikçe ne kadarının aktif kaldığını görmek için kullanın; gün gün etkinlik için etkinlik takvimi daha doğrudur. */
export interface CohortRetentionProps {
  /** Seçili segmentin kohortları, eskiden yeniye. */
  cohorts: Cohort[];
  segments: CohortSegment[];
  segment: string;
  onSegmentChange: (value: string) => void;
  title?: string | undefined;
  /** Alt satır: ölçüm tarihi, örneğin "Ölçüm: 18 Ekim 2026" (ABACUS `date.format`). */
  measuredAt?: string | undefined;
  status?: "ready" | "loading" | "error" | undefined;
  onRetry?: (() => void) | undefined;
}

const WIDTH = 640, HEIGHT = 220, PAD_L = 34, PAD_B = 22;

export function CohortRetention({ cohorts, segments, segment, onSegmentChange, title = "Kohort elde tutma", measuredAt, status = "ready", onRetry }: CohortRetentionProps) {
  const reduced = useReducedMotionSafe();
  const [view, setView] = useState<"heat" | "curves">("heat");
  const [cursor, setCursor] = useState<{ row: number; col: number } | null>(null);
  const [announce, setAnnounce] = useState("");
  const months = Math.max(0, ...cohorts.map(cohort => cohort.retention.length));
  const averages = useMemo(() => Array.from({ length: months }, (_, month) => weightedAverage(cohorts, month)), [cohorts, months]);
  const first = averages[0] ?? null, sixth = averages[5] ?? null;

  const read = (row: number, col: number) => {
    const cohort = cohorts[row];
    if (cohort) setAnnounce(cellAnnouncement(cohort, col));
  };
  const move = (row: number, col: number) => {
    const next = { row: clamp(row, 0, cohorts.length - 1), col: clamp(col, 0, months - 1) };
    setCursor(next);
    read(next.row, next.col);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = cursor ?? { row: 0, col: 0 };
    const step = ({ ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] } as Record<string, [number, number]>)[event.key];
    if (step) { event.preventDefault(); move(cursor ? at.row + step[0] : 0, cursor ? at.col + step[1] : 0); }
    else if (event.key === "Home") { event.preventDefault(); move(at.row, 0); }
    else if (event.key === "End") { event.preventDefault(); const row = cohorts[at.row]; move(at.row, Math.max(0, (row?.retention.length ?? months) - 1)); }
    else if (event.key === "Escape") { setCursor(null); setAnnounce(""); }
  };

  if (status === "loading") return <section className={styles.root} aria-busy="true"><Skeleton label="Kohort tablosu yükleniyor" lines={6} /></section>;
  if (status === "error") return <section className={styles.root}><div className={styles.error} role="alert"><span>Yüklenemedi.</span>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</Button>}</div></section>;

  const trendFirst = trendPoints(cohorts, 0), trendSixth = trendPoints(cohorts, 5);
  const selected = cursor ? cohorts[cursor.row] : undefined;
  const selectedValue = selected && cursor ? selected.retention[cursor.col] : undefined;

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}>
      <div><h3 className={styles.title}>{title}</h3>{measuredAt && <p className={styles.subtitle}>{measuredAt}</p>}</div>
      <SegmentedControl label="Segment" value={segment} onValueChange={onSegmentChange} options={segments} />
    </header>

    {!cohorts.length ? <p className={styles.empty}>Kohort verisi yok.</p> : <>
      <dl className={styles.stats}>
        <div><dt>1. ay elde tutma</dt><dd>{first === null ? "—" : <AnimatedCounter value={Math.round(first * 10) / 10} decimals={1} prefix="%" />}{trendFirst !== null && <span className={styles.trend} data-up={trendFirst > 0 || undefined}>{trendFirst > 0 ? "▲" : trendFirst < 0 ? "▼" : "▬"} {pointsText(trendFirst)}</span>}</dd></div>
        <div><dt>6. ay elde tutma</dt><dd>{sixth === null ? "—" : <AnimatedCounter value={Math.round(sixth * 10) / 10} decimals={1} prefix="%" />}{trendSixth !== null && <span className={styles.trend} data-up={trendSixth > 0 || undefined}>{trendSixth > 0 ? "▲" : trendSixth < 0 ? "▼" : "▬"} {pointsText(trendSixth)}</span>}</dd></div>
        <div><dt>Yeni kayıt</dt><dd><AnimatedCounter value={totalSignups(cohorts)} /></dd></div>
      </dl>

      <div className={styles.toolbar}>
        <span className={styles.scale} aria-label="Renk ölçeği: koyu yüksek elde tutma, açık düşük"><span>% elde tutma</span><span className={styles.ramp} aria-hidden="true" /><span aria-hidden="true">0</span><span aria-hidden="true">100</span></span>
        <div className={styles.views} role="group" aria-label="Görünüm">
          <button type="button" aria-pressed={view === "heat"} onClick={() => setView("heat")}>Isı haritası</button>
          <button type="button" aria-pressed={view === "curves"} onClick={() => setView("curves")}>Eğriler</button>
        </div>
      </div>

      <div className={styles.focus} role="group" aria-roledescription="kohort tablosu" aria-label={`${title}. Kohort ve ay arasında oklarla gezin, Home ve End kohort içinde uca atlar, Esc temizler.`} tabIndex={0} onKeyDown={onKeyDown} onBlur={() => setCursor(null)}>
        {view === "heat" ? <div className={styles.heatScroll}><div className={styles.heat} style={{ gridTemplateColumns: `minmax(7.5rem, auto) repeat(${months}, minmax(2.5rem, 1fr))` }} aria-hidden="true">
          <span />{Array.from({ length: months }, (_, col) => <span key={col} className={styles.colHead}>{col + 1}</span>)}
          {cohorts.map((cohort, row) => <FragmentRow key={cohort.key} cohort={cohort} row={row} months={months} cursor={cursor} onPoint={(r, c) => { setCursor({ row: r, col: c }); read(r, c); }} />)}
          <span className={styles.rowHead}><strong>Ortalama</strong></span>
          {Array.from({ length: months }, (_, col) => { const average = averages[col] ?? null; return <span key={col} className={styles.cell} data-empty={average === null || undefined} data-strong={average !== null && tintShare(average) > 45 || undefined} data-mean="" style={average === null ? undefined : { ["--tint" as string]: `${tintShare(average)}%` }}>{average === null ? "" : cellText(average)}</span>; })}
        </div></div> : <svg className={styles.curves} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
          {[0, 25, 50, 75, 100].map(tick => { const y = HEIGHT - PAD_B - (tick / 100) * (HEIGHT - PAD_B - 8); return <g key={tick}><line className={styles.grid} x1={PAD_L} x2={WIDTH} y1={y} y2={y} /><text className={styles.axis} x={PAD_L - 6} y={y + 4} textAnchor="end">{tick}</text></g>; })}
          {Array.from({ length: months }, (_, col) => <text key={col} className={styles.axis} x={PAD_L + (months > 1 ? (col / (months - 1)) * (WIDTH - PAD_L - 8) : 0)} y={HEIGHT - 6} textAnchor="middle">{col + 1}</text>)}
          {cohorts.map((cohort, row) => {
            const points = cohort.retention.map((value, col) => value === null ? null : `${PAD_L + (months > 1 ? (col / (months - 1)) * (WIDTH - PAD_L - 8) : 0)},${HEIGHT - PAD_B - (value / 100) * (HEIGHT - PAD_B - 8)}`).filter((point): point is string => point !== null);
            const recent = cohorts.length > 1 ? row / (cohorts.length - 1) : 1;
            return <g key={cohort.key} data-active={cursor?.row === row || undefined} data-dim={(cursor && cursor.row !== row) || undefined} onPointerEnter={() => { setCursor({ row, col: Math.max(0, cohort.retention.length - 1) }); read(row, Math.max(0, cohort.retention.length - 1)); }}>
              <polyline className={styles.curve} points={points.join(" ")} style={{ opacity: .25 + recent * .65 }} />
            </g>;
          })}
          {cursor && selected && selectedValue !== null && selectedValue !== undefined && <circle className={styles.pick} cx={PAD_L + (months > 1 ? (cursor.col / (months - 1)) * (WIDTH - PAD_L - 8) : 0)} cy={HEIGHT - PAD_B - (selectedValue / 100) * (HEIGHT - PAD_B - 8)} r={4} />}
          <text className={styles.axisTitle} x={WIDTH} y={HEIGHT - 6} textAnchor="end">katılımdan sonraki ay</text>
        </svg>}
      </div>

      <p className={styles.reading} aria-hidden="true">{selected && cursor ? `${cohortLabel(selected.key)} · ${cursor.col + 1}. ay · ${selectedValue === null || selectedValue === undefined ? "henüz ölçülmedi" : tipPercent(selectedValue)} · ${sizeText(selected.size)} kişi` : "Bir hücreyi seçin ya da ok tuşlarını kullanın."}</p>

      <div className={styles.srOnly}><table>
        <caption>{title}</caption>
        <thead><tr><th scope="col">Kohort</th><th scope="col">Büyüklük</th>{Array.from({ length: months }, (_, col) => <th key={col} scope="col">{col + 1}. ay</th>)}</tr></thead>
        <tbody>{cohorts.map(cohort => <tr key={cohort.key}><th scope="row">{cohortLabel(cohort.key)}</th><td>{sizeText(cohort.size)}</td>{Array.from({ length: months }, (_, col) => { const value = cohort.retention[col]; return <td key={col}>{value === null || value === undefined ? "Henüz ölçülmedi" : tipPercent(value)}</td>; })}</tr>)}</tbody>
      </table></div>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
    </>}
  </section>;
}

function FragmentRow({ cohort, row, months, cursor, onPoint }: { cohort: Cohort; row: number; months: number; cursor: { row: number; col: number } | null; onPoint: (row: number, col: number) => void }) {
  return <>
    <span className={styles.rowHead}><strong>{cohortLabel(cohort.key)}</strong><small>{sizeText(cohort.size)}</small></span>
    {Array.from({ length: months }, (_, col) => {
      const value = cohort.retention[col];
      const empty = value === null || value === undefined;
      return <span key={col} className={styles.cell} data-empty={empty || undefined} data-strong={(!empty && tintShare(value) > 45) || undefined} data-current={(cursor?.row === row && cursor.col === col) || undefined}
        style={empty ? undefined : { ["--tint" as string]: `${tintShare(value)}%`, transitionDelay: `${(row + col) * 14}ms` }} onPointerEnter={() => { if (!empty) onPoint(row, col); }}>{empty ? "" : cellText(value)}</span>;
    })}
  </>;
}

export default CohortRetention;
