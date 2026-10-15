"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { LineChart, type LineChartDatum, type LineChartSeries } from "../line-chart/line-chart";
import { miniLinePath } from "../lib/chart-format";
import { useElementWidth, useReducedMotionSafe } from "../lib/viz-utils";
import { Skeleton } from "../skeleton/skeleton";
import { Switch } from "../switch/switch";
import { axisMonth, growthText, indexAt, monthLabel, moneyShort, moneyText, moveRange, netChangeText, netNew, pointsText, previousRange, rangeFor, rateText, summarize, type MonthRange, type RevenueMonth } from "./revenue-explorer-format";
import styles from "./revenue-explorer.module.css";

export type { RevenueMonth };

/** Aylık yinelenen gelirin üç hareketini (yeni, genişleme, kayıp) aylara göre görmek ve fırça şeridiyle dönem seçmek için kullanın; iki an arasındaki köprü için gelir şelalesi daha doğrudur. */
export interface RevenueExplorerProps {
  /** Aylık veri, eskiden yeniye. Aylara toplulaştırmayı proje yapar. */
  months: RevenueMonth[];
  title?: string;
  /** Başlangıçtaki pencere uzunluğu (ay); 0 = tümü. */
  initialLength?: number;
  status?: "ready" | "loading" | "error";
  onRetry?: () => void;
}

type SeriesKey = "newMrr" | "expansion" | "churn";
const SERIES: { key: SeriesKey; label: string; color: string }[] = [
  { key: "newMrr", label: "Yeni", color: "var(--series-1)" },
  { key: "expansion", label: "Genişleme", color: "var(--series-3)" },
  { key: "churn", label: "Kayıp", color: "var(--series-2)" },
];
const LENGTHS = [{ value: 3, label: "3A" }, { value: 6, label: "6A" }, { value: 12, label: "12A" }, { value: 0, label: "Tümü" }];

function Delta({ children, calm }: { children: string; calm?: boolean }) {
  return <span className={styles.delta} data-calm={calm || undefined}>{children}</span>;
}

export function RevenueExplorer({ months, title = "Gelir hareketi", initialLength = 12, status = "ready", onRetry }: RevenueExplorerProps) {
  const reduced = useReducedMotionSafe();
  const count = months.length;
  const [range, setRange] = useState<MonthRange>(() => rangeFor(initialLength, count - 1, count));
  const [hidden, setHidden] = useState<SeriesKey[]>([]);
  const [compare, setCompare] = useState(false);
  const [track, trackWidth] = useElementWidth<HTMLDivElement>();
  const drag = useRef<{ part: "start" | "end" | "window"; origin: number; from: MonthRange } | null>(null);

  const safe = range.end < count ? range : rangeFor(0, count - 1, count);
  const previous = previousRange(safe);
  const summary = useMemo(() => summarize(months, safe), [months, safe]);
  const before = previous ? summarize(months, previous) : null;
  const length = safe.end - safe.start + 1;

  const chartData: LineChartDatum[] = useMemo(() => months.slice(safe.start, safe.end + 1).map((month, at) => {
    const prior = previous ? months[previous.start + at] : undefined;
    return { key: month.key, label: monthLabel(month.key), axisLabel: axisMonth(month.key), values: { newMrr: month.newMrr, expansion: month.expansion, churn: -month.churn, prevNet: prior ? netNew(prior) : undefined } };
  }), [months, safe, previous]);
  const series: LineChartSeries[] = [
    ...SERIES.map(item => ({ key: item.key, label: item.label, color: item.color, area: false })),
    ...(compare && previous ? [{ key: "prevNet", label: "Önceki dönem, net yeni", color: "var(--text-muted)", dashed: true, area: false }] : []),
  ];
  const overview = useMemo(() => miniLinePath(months.map(month => month.total), 100, 40, 3), [months]);

  const slot = (index: number) => (count > 1 ? (index / (count - 1)) * 100 : 0);
  const rangeText = `${monthLabel(months[safe.start]?.key ?? "")} – ${monthLabel(months[safe.end]?.key ?? "")}`;

  const startDrag = (part: "start" | "end" | "window") => (event: PointerEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { part, origin: indexAt(event.clientX - (track.current?.getBoundingClientRect().left ?? 0), trackWidth, count), from: safe };
  };
  const moveDrag = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || !track.current) return;
    const at = indexAt(event.clientX - track.current.getBoundingClientRect().left, trackWidth, count);
    setRange(moveRange(current.from, current.part, at - current.origin, count));
  };
  const endDrag = () => { drag.current = null; };
  const onTrackDown = (event: PointerEvent<HTMLDivElement>) => {
    const at = indexAt(event.clientX - event.currentTarget.getBoundingClientRect().left, trackWidth, count);
    const half = Math.floor((safe.end - safe.start) / 2);
    setRange(moveRange(safe, "window", at - half - safe.start, count));
  };
  const keys = (part: "start" | "end" | "window") => (event: KeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? 3 : 1;
    const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? step : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -step : event.key === "Home" ? -count : event.key === "End" ? count : 0;
    if (!delta) return;
    event.preventDefault();
    setRange(moveRange(safe, part, delta, count));
  };

  const toggleSeries = (key: SeriesKey) => setHidden(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key]);
  const activeLength = LENGTHS.find(item => (item.value === 0 ? length === count : item.value === length))?.value;

  if (status === "loading") return <section className={styles.root} aria-busy="true"><Skeleton label="Gelir hareketi yükleniyor" lines={6} /></section>;
  if (status === "error") return <section className={styles.root}><div className={styles.error} role="alert"><span>Yüklenemedi.</span>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</Button>}</div></section>;
  if (count < 2) return <section className={styles.root}><p className={styles.empty}>Bu gösterim için en az iki aylık veri gerekir.</p></section>;

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}>
      <div><h3 className={styles.title}>{title}</h3><p className={styles.range}>{rangeText}</p></div>
      <div className={styles.lengths} role="group" aria-label="Dönem">
        {LENGTHS.map(item => <button key={item.label} type="button" className={styles.length} aria-pressed={activeLength === item.value} disabled={item.value > count} onClick={() => setRange(rangeFor(item.value, safe.end, count))}>{item.label}</button>)}
      </div>
    </header>

    <div className={styles.summary}>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Ana gelir</span>
        <span className={styles.statValue} aria-label={moneyText(summary.total)}><AnimatedCounter value={Math.round(summary.total)} prefix="₺" /></span>
        <Delta>{growthText(summary)}</Delta>
        {compare && before && <span className={styles.compareLine}>Önceki dönem sonu {moneyShort(before.total)}</span>}
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Aylık net yeni gelir</span>
        <span className={styles.statValue} aria-label={moneyText(summary.netNewAverage)}><AnimatedCounter value={Math.round(summary.netNewAverage)} prefix="₺" /></span>
        {before ? <Delta>{netChangeText(summary.netNewAverage, before.netNewAverage)}</Delta> : <Delta calm>—</Delta>}
        {compare && before && <span className={styles.compareLine}>Önceki dönem {moneyShort(before.netNewAverage)}</span>}
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Aylık kayıp oranı</span>
        <span className={styles.statValue} aria-label={rateText(summary.churnRate)}><AnimatedCounter value={Math.round(summary.churnRate * 100) / 100} decimals={2} prefix="%" /></span>
        {before ? <Delta calm>{pointsText(summary.churnRate, before.churnRate)}</Delta> : <Delta calm>—</Delta>}
        {compare && before && <span className={styles.compareLine}>Önceki dönem {rateText(before.churnRate)}</span>}
      </div>
    </div>

    <div className={styles.controls}>
      <div className={styles.seriesButtons} role="group" aria-label="Seriler">
        {SERIES.map(item => <button key={item.key} type="button" className={styles.seriesButton} aria-pressed={!hidden.includes(item.key)} onClick={() => toggleSeries(item.key)}>
          <span className={styles.swatch} style={{ background: hidden.includes(item.key) ? "transparent" : item.color, borderColor: item.color }} aria-hidden="true" />{item.label}
        </button>)}
      </div>
      <Switch label={previous ? "Önceki dönemle karşılaştır" : "Önceki dönem yok"} checked={compare && !!previous} disabled={!previous} onCheckedChange={setCompare} />
    </div>

    <LineChart label={`${title}, ${rangeText}`} data={chartData} series={series} height={240} legend={false} hiddenSeries={hidden}
      formatValue={value => moneyText(value)} formatTick={value => moneyShort(value)} />

    <div className={styles.brush}>
      <div ref={track} className={styles.track} onPointerDown={onTrackDown}>
        <svg className={styles.overview} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path className={styles.overviewLine} d={overview} /></svg>
        <div className={styles.window} style={{ left: `${slot(safe.start)}%`, width: `${slot(safe.end) - slot(safe.start)}%` }}
          role="slider" tabIndex={0} aria-label="Dönem penceresi" aria-valuemin={0} aria-valuemax={count - 1} aria-valuenow={safe.start} aria-valuetext={rangeText}
          onPointerDown={startDrag("window")} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={keys("window")}>
          <span className={styles.handle} data-side="start" role="slider" tabIndex={0} aria-label="Başlangıç ayı" aria-valuemin={0} aria-valuemax={safe.end - 1} aria-valuenow={safe.start} aria-valuetext={monthLabel(months[safe.start]?.key ?? "")}
            onPointerDown={startDrag("start")} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={event => { event.stopPropagation(); keys("start")(event); }} />
          <span className={styles.handle} data-side="end" role="slider" tabIndex={0} aria-label="Bitiş ayı" aria-valuemin={safe.start + 1} aria-valuemax={count - 1} aria-valuenow={safe.end} aria-valuetext={monthLabel(months[safe.end]?.key ?? "")}
            onPointerDown={startDrag("end")} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={event => { event.stopPropagation(); keys("end")(event); }} />
        </div>
      </div>
      <div className={styles.years} aria-hidden="true">{months.map((month, at) => month.key.endsWith("-01") || at === 0 ? <span key={month.key} style={{ left: `${slot(at)}%` }}>{month.key.slice(0, 4)}</span> : null)}</div>
    </div>

    <div className={styles.srOnly}><table>
      <caption>{title}</caption>
      <thead><tr><th scope="col">Ay</th><th scope="col">Yeni</th><th scope="col">Genişleme</th><th scope="col">Kayıp</th><th scope="col">Net yeni</th><th scope="col">Ay sonu toplam</th></tr></thead>
      <tbody>{months.map(month => <tr key={month.key}><th scope="row">{monthLabel(month.key)}</th><td>{moneyText(month.newMrr)}</td><td>{moneyText(month.expansion)}</td><td>{moneyText(-month.churn)}</td><td>{moneyText(netNew(month))}</td><td>{moneyText(month.total)}</td></tr>)}</tbody>
    </table></div>
  </section>;
}

export default RevenueExplorer;
