"use client";

import { useMemo, useState } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { LineChart, type LineChartDatum } from "../line-chart/line-chart";
import { metricChange, metricCounter, metricShortText, metricValueText, type MetricKind } from "../lib/metric-format";
import { MorphGrid } from "../lib/morph-grid";
import { formatRatio, miniLinePath } from "../lib/chart-format";
import { useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import styles from "./kpi-drilldown.module.css";

export type { MetricKind };

export interface DrillPoint { key: string; label: string; axisLabel?: string | undefined; value: number; previous?: number | undefined }
export interface DrillRow { key: string; label: string; value: number; previous?: number | undefined }
export interface DrillBreakdown { key: string; /** Boyut adı, örneğin "Plana göre". */ label: string; rows: DrillRow[] }
export interface DrillMetric {
  key: string;
  label: string;
  kind: MetricKind;
  value: number;
  previous?: number | undefined;
  /** Düşüşün iyi olduğu gösterge (kayıp oranı gibi): azalış olumlu renkte yazılır. */
  lowerIsBetter?: boolean | undefined;
  /** Göstergenin ne ölçtüğünü söyleyen bir cümle. */
  description?: string | undefined;
  series: DrillPoint[];
  breakdowns?: DrillBreakdown[] | undefined;
}
export interface DrillPeriod { value: string; label: string }

/** Altı kadar göstergeyi küçük grafikli kartlar olarak göstermek, karta basınca büyük grafik ve kırılım tablosuna açmak için kullanın; tek gösterge için gösterge kartı, çok göstergeyi tek grafikte karşılaştırmak için gösterge gezgini daha doğrudur. */
export interface KpiDrilldownProps {
  metrics: DrillMetric[];
  periods: DrillPeriod[];
  period: string;
  onPeriodChange: (value: string) => void;
  title?: string | undefined;
  /** Açık göstergenin anahtarı (denetimli kullanım için); verilmezse bileşen kendisi tutar. */
  openKey?: string | null | undefined;
  onOpenKeyChange?: ((key: string | null) => void) | undefined;
  status?: "ready" | "loading" | "error" | undefined;
  onRetry?: (() => void) | undefined;
}

/** Karşılaştırma için bir göstergede önceki dönemden en az iki nokta gerekir. */
const canCompare = (metric: DrillMetric) => metric.series.filter(point => point.previous !== undefined).length >= 2;

function ChangeTag({ metric }: { metric: DrillMetric }) {
  const change = metricChange(metric.kind, metric.value, metric.previous);
  const good = metric.lowerIsBetter ? change.direction < 0 : change.direction > 0;
  return <span className={styles.change} data-tone={change.direction === 0 ? "flat" : good ? "good" : "calm"}>
    <span aria-hidden="true">{change.arrow} {change.text}</span><span className={styles.srOnly}>{change.spoken}</span>
  </span>;
}

export function KpiDrilldown({ metrics, periods, period, onPeriodChange, title = "Genel bakış", openKey, onOpenKeyChange, status = "ready", onRetry }: KpiDrilldownProps) {
  const reduced = useReducedMotionSafe();
  const [inner, setInner] = useState<string | null>(null);
  const open = openKey !== undefined ? openKey : inner;
  const setOpen = (key: string | null) => { if (openKey === undefined) setInner(key); onOpenKeyChange?.(key); };
  const [compare, setCompare] = useState(false);
  const [dimensions, setDimensions] = useState<Record<string, string>>({});
  const comparable = metrics.some(canCompare);

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.tools}>
        <Button size="sm" variant="secondary" aria-pressed={compare} disabled={!comparable} onClick={() => setCompare(value => !value)} title={comparable ? undefined : "Karşılaştırma için yeterli veri yok."}>
          <span aria-hidden="true">⇄</span><span className={styles.compareText}> Karşılaştır</span>
        </Button>
        <SegmentedControl label="Dönem" value={period} onValueChange={onPeriodChange} options={periods} />
      </div>
    </header>
    {!comparable && status === "ready" && metrics.length > 0 && <p className={styles.hint}>Karşılaştırma için yeterli veri yok.</p>}

    {status === "loading" && <div className={styles.grid}>{metrics.length ? metrics.map(metric => <div key={metric.key} className={styles.card}><Skeleton label="Gösterge yükleniyor" lines={3} /></div>) : [0, 1, 2].map(at => <div key={at} className={styles.card}><Skeleton label="Gösterge yükleniyor" lines={3} /></div>)}</div>}
    {status === "error" && <div className={styles.error} role="alert"><span>Yüklenemedi.</span>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</Button>}</div>}
    {status === "ready" && !metrics.length && <p className={styles.empty}>Bu dönem için veri yok.</p>}

    {status === "ready" && metrics.length > 0 && <MorphGrid items={metrics} openKey={open} onOpenChange={setOpen} className={styles.morph} gridClassName={styles.grid} cardClassName={styles.card} panelClassName={styles.panel}
      panelLabel={metric => `${metric.label}, ayrıntı`}
      renderCard={(metric, openCard) => {
        const counter = metricCounter(metric.kind, metric.value);
        const values = metric.series.map(point => point.value);
        const change = metricChange(metric.kind, metric.value, metric.previous);
        return <button type="button" className={styles.cardButton} onClick={openCard} aria-label={`${metric.label}: ${metricValueText(metric.kind, metric.value)}, ${change.spoken}. Ayrıntıyı aç`}>
          <span className={styles.cardLabel}>{metric.label}</span>
          <span className={styles.cardValue}><AnimatedCounter value={counter.value} decimals={counter.decimals} prefix={counter.prefix} suffix={counter.suffix} /></span>
          <ChangeTag metric={metric} />
          <svg className={styles.mini} viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><path className={styles.miniLine} d={miniLinePath(values)} /></svg>
        </button>;
      }}
      renderPanel={(metric, closeProps) => <Detail metric={metric} compare={compare && canCompare(metric)} dimension={dimensions[metric.key] ?? metric.breakdowns?.[0]?.key ?? ""} onDimension={key => setDimensions(current => ({ ...current, [metric.key]: key }))} closeProps={closeProps} />} />}
  </section>;
}

function Detail({ metric, compare, dimension, onDimension, closeProps }: { metric: DrillMetric; compare: boolean; dimension: string; onDimension: (key: string) => void; closeProps: { "data-morph-close": true; onClick: () => void } }) {
  const [active, setActive] = useState("");
  const counter = metricCounter(metric.kind, metric.value);
  const data: LineChartDatum[] = useMemo(() => metric.series.map(point => ({ key: point.key, label: point.label, axisLabel: point.axisLabel, values: { now: point.value, before: point.previous } })), [metric]);
  const breakdown = metric.breakdowns?.find(item => item.key === dimension) ?? metric.breakdowns?.[0];
  const total = breakdown?.rows.reduce((sum, row) => sum + row.value, 0) ?? 0;
  const showShare = metric.kind !== "percent";

  return <div className={styles.detail}>
    <div className={styles.detailHead}>
      <div>
        <span className={styles.cardLabel}>{metric.label}</span>
        <span className={styles.detailValue} aria-label={metricValueText(metric.kind, metric.value)}><AnimatedCounter value={counter.value} decimals={counter.decimals} prefix={counter.prefix} suffix={counter.suffix} /></span>
        <ChangeTag metric={metric} />
        {metric.description && <p className={styles.description}>{metric.description}</p>}
      </div>
      <Button size="sm" variant="secondary" title="Kapatmak için Esc" {...closeProps}>Kapat</Button>
    </div>
    <LineChart label={metric.label} data={data} height={220} legend={false}
      series={[{ key: "now", label: metric.label }, ...(compare ? [{ key: "before", label: "Önceki dönem", dashed: true, area: false }] : [])]}
      formatValue={value => metricValueText(metric.kind, value)} formatTick={value => metricShortText(metric.kind, value)}
      onActiveChange={(index, datum) => setActive(index === null || !datum ? "" : `${datum.label}: ${metricValueText(metric.kind, datum.values.now ?? 0)}`)} />
    <p className={styles.srOnly} role="status" aria-live="polite">{active}</p>
    {breakdown && <div className={styles.breakdown}>
      <div className={styles.breakdownHead}>
        <h4>Kırılım</h4>
        {(metric.breakdowns?.length ?? 0) > 1 && <SegmentedControl label="Boyut" value={breakdown.key} onValueChange={onDimension} options={(metric.breakdowns ?? []).map(item => ({ value: item.key, label: item.label }))} />}
      </div>
      <table className={styles.table}>
        <caption className={styles.srOnly}>{metric.label}, {breakdown.label}</caption>
        <thead><tr><th scope="col">Ad</th><th scope="col">Değer</th><th scope="col">Değişim</th>{showShare && <th scope="col" className={styles.shareCol}>Pay</th>}</tr></thead>
        <tbody>{breakdown.rows.map((row, at) => {
          const change = metricChange(metric.kind, row.value, row.previous);
          const good = metric.lowerIsBetter ? change.direction < 0 : change.direction > 0;
          const share = total > 0 ? row.value / total : 0;
          return <tr key={row.key}>
            <th scope="row">{row.label}</th>
            <td>{metricValueText(metric.kind, row.value)}</td>
            <td className={styles.change} data-tone={change.direction === 0 ? "flat" : good ? "good" : "calm"}><span aria-hidden="true">{change.arrow} {change.text}</span><span className={styles.srOnly}>{change.spoken}</span></td>
            {showShare && <td className={styles.shareCol}><span className={styles.shareText}>{formatRatio(share, 1)}</span><span className={styles.shareTrack} aria-hidden="true"><span className={styles.shareFill} style={{ width: `${share * 100}%`, transitionDelay: `${at * 40}ms` }} /></span></td>}
          </tr>;
        })}</tbody>
      </table>
    </div>}
  </div>;
}

export default KpiDrilldown;
