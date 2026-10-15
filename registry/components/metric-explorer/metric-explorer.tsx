"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { LineChart, type LineChartDatum } from "../line-chart/line-chart";
import { metricChange, metricCounter, metricShortText, metricValueText, type MetricKind } from "../lib/metric-format";
import { MorphGrid } from "../lib/morph-grid";
import { miniLinePath } from "../lib/chart-format";
import { useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import styles from "./metric-explorer.module.css";

export type { MetricKind };

export interface ExplorerPoint { key: string; /** Tam etiket, örneğin "12 Eylül Cuma". */ label: string; axisLabel?: string; value: number }
export interface ExplorerMetric {
  key: string;
  label: string;
  kind: MetricKind;
  /** Dönem sonundaki değer ve bir önceki dönemin değeri (değişim için). */
  value: number;
  previous?: number;
  /** Düşmesi iyi gösterge (maliyet, kayıp): azalış olumlu renkte yazılır. */
  lowerIsBetter?: boolean;
  series: ExplorerPoint[];
}
export interface ExplorerPeriod { value: string; label: string }

/** Sayfa başında dört gösterge kartı ve karta basınca açılan sekmeli grafik paneli için kullanın; tek gösterge için gösterge kartı, kırılım isteyen genel bakış için gösterge ayrıntı paneli daha doğrudur. */
export interface MetricExplorerProps {
  metrics: ExplorerMetric[];
  periods: ExplorerPeriod[];
  period: string;
  onPeriodChange: (value: string) => void;
  title?: string;
  /** Başlık satırının sağı: "Güncelleme: 18.10.2026 09:40" gibi hazır metin (ABACUS `date.format`). */
  updatedText?: string;
  /** Kaynak adı, örneğin "Satış veritabanı". */
  sourceText?: string;
  status?: "ready" | "loading" | "error";
  onRetry?: () => void;
}

function ChangeTag({ metric, change }: { metric: ExplorerMetric; change: ReturnType<typeof metricChange> }) {
  const good = metric.lowerIsBetter ? change.direction < 0 : change.direction > 0;
  return <span className={styles.change} data-tone={change.direction === 0 ? "flat" : good ? "good" : "calm"}>
    <span aria-hidden="true">{change.arrow} {change.text}</span><span className={styles.srOnly}>{change.spoken}</span>
  </span>;
}

export function MetricExplorer({ metrics, periods, period, onPeriodChange, title = "Göstergeler", updatedText, sourceText, status = "ready", onRetry }: MetricExplorerProps) {
  const reduced = useReducedMotionSafe();
  const [open, setOpen] = useState<string | null>(null);
  const periodLabel = periods.find(item => item.value === period)?.label ?? "";

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}>
      <h3 className={styles.title}>{title}</h3>
      {(updatedText || sourceText) && <p className={styles.meta}>{[updatedText, sourceText].filter(Boolean).join(" · ")}</p>}
    </header>
    {status === "loading" && <div className={styles.grid}>{[0, 1, 2, 3].map(at => <div key={at} className={styles.card}><Skeleton label="Gösterge yükleniyor" lines={3} /></div>)}</div>}
    {status === "error" && <div className={styles.error} role="alert"><span>Yüklenemedi.</span>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</Button>}</div>}
    {status === "ready" && !metrics.length && <p className={styles.empty}>Veri yok.</p>}
    {status === "ready" && metrics.length > 0 && <MorphGrid items={metrics} openKey={open} onOpenChange={setOpen} className={styles.morph} gridClassName={styles.grid} cardClassName={styles.card} panelClassName={styles.panel}
      isDisabled={metric => metric.series.length < 2} panelLabel={() => `${title}, grafik paneli`}
      renderCard={(metric, openCard) => {
        const enough = metric.series.length >= 2;
        const counter = metricCounter(metric.kind, metric.value);
        const change = metricChange(metric.kind, metric.value, metric.previous);
        return <button type="button" className={styles.cardButton} onClick={openCard} aria-disabled={!enough || undefined}
          aria-label={enough ? `${metric.label}: ${metricValueText(metric.kind, metric.value)}, ${change.spoken}, ${periodLabel}. Grafiği aç` : `${metric.label}: veri yok`}>
          <span className={styles.cardLabel}>{metric.label}</span>
          {enough ? <>
            <span className={styles.cardValue}><AnimatedCounter value={counter.value} decimals={counter.decimals} prefix={counter.prefix} suffix={counter.suffix} /></span>
            <span className={styles.cardMeta}><ChangeTag metric={metric} change={change} /><span className={styles.periodName}>{periodLabel}</span></span>
            <svg className={styles.mini} viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><path className={styles.miniLine} d={miniLinePath(metric.series.map(point => point.value))} /></svg>
          </> : <span className={styles.cardNone}>Veri yok</span>}
        </button>;
      }}
      renderPanel={(metric, closeProps) => <Panel key={metric.key} initialKey={metric.key} metrics={metrics} periods={periods} period={period} onPeriodChange={onPeriodChange} closeProps={closeProps} />} />}
  </section>;
}

function Panel({ initialKey, metrics, periods, period, onPeriodChange, closeProps }: { initialKey: string; metrics: ExplorerMetric[]; periods: ExplorerPeriod[]; period: string; onPeriodChange: (value: string) => void; closeProps: { "data-morph-close": true; onClick: () => void } }) {
  const [tab, setTab] = useState(initialKey);
  const [cursor, setCursor] = useState<number | null>(null);
  const metric = metrics.find(item => item.key === tab) ?? metrics[0]!;
  const data: LineChartDatum[] = useMemo(() => metric.series.map(point => ({ key: point.key, label: point.label, axisLabel: point.axisLabel, values: { now: point.value } })), [metric]);
  const shownAt = cursor ?? metric.series.length - 1;
  const point = metric.series[shownAt];
  const before = metric.series[shownAt - 1];
  const dayChange = metricChange(metric.kind, point?.value ?? 0, before?.value);

  const onTabKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = metrics.map(item => item.key), at = keys.indexOf(metric.key);
    const next = event.key === "ArrowRight" ? at + 1 : event.key === "ArrowLeft" ? at - 1 : event.key === "Home" ? 0 : event.key === "End" ? keys.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const key = keys[(next + keys.length) % keys.length];
    if (key) { setTab(key); setCursor(null); requestAnimationFrame(() => document.getElementById(`explorer-tab-${key}`)?.focus()); }
  };

  return <div className={styles.detail}>
    <div className={styles.detailTop}>
      <div className={styles.tabs} role="tablist" aria-label="Göstergeler" onKeyDown={onTabKeys}>
        {metrics.map(item => <button key={item.key} id={`explorer-tab-${item.key}`} type="button" role="tab" className={styles.tab} aria-selected={item.key === metric.key} tabIndex={item.key === metric.key ? 0 : -1} onClick={() => { setTab(item.key); setCursor(null); }}>
          <span className={styles.tabLabel}>{item.label}</span>
          <span className={styles.tabValue}>{metricShortText(item.kind, item.value)}</span>
        </button>)}
      </div>
      <div className={styles.detailTools}>
        <SegmentedControl label="Dönem" value={period} onValueChange={onPeriodChange} options={periods} />
        <Button size="sm" variant="secondary" title="Kapatmak için Esc" {...closeProps}>Kapat</Button>
      </div>
    </div>
    <LineChart key={`${metric.key}-${period}`} label={metric.label} data={data} height={240} legend={false} series={[{ key: "now", label: metric.label }]}
      formatValue={value => metricValueText(metric.kind, value)} formatTick={value => metricShortText(metric.kind, value)}
      onActiveChange={index => setCursor(index)} />
    <div className={styles.reading} role="status" aria-live="polite">
      <span className={styles.readingDate}>{point?.label ?? ""}</span>
      <span className={styles.readingValue}>{point ? metricValueText(metric.kind, point.value) : ""}</span>
      {before && <span className={styles.change} data-tone={dayChange.direction === 0 ? "flat" : (metric.lowerIsBetter ? dayChange.direction < 0 : dayChange.direction > 0) ? "good" : "calm"}><span aria-hidden="true">{dayChange.arrow} {dayChange.text}</span><span className={styles.srOnly}>önceki noktaya göre {dayChange.spoken}</span></span>}
    </div>
  </div>;
}

export default MetricExplorer;
