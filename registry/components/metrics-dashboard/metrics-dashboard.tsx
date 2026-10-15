"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { LineChart, type LineChartDatum } from "../line-chart/line-chart";
import { metricChange, metricCounter, metricShortText, metricValueText, type MetricKind } from "../lib/metric-format";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { useReducedMotionSafe } from "../lib/viz-utils";
import styles from "./metrics-dashboard.module.css";

export type { MetricKind };

export interface DashboardPoint {
  /** Kalıcı kimlik, örneğin ISO tarihi. */
  key: string;
  /** Tam etiket, örneğin "15 Ekim Perşembe". */
  label: string;
  axisLabel?: string;
  value: number;
  /** Önceki dönemin aynı sıradaki değeri ("Karşılaştır" için). */
  previous?: number;
}

export interface DashboardMetric {
  key: string;
  label: string;
  kind: MetricKind;
  value: number;
  /** Önceki dönemin değeri; verilmezse değişim "—" yazılır. */
  previous?: number;
  /** Düşüşün iyi olduğu gösterge (iptal oranı gibi): azalış olumlu renkte yazılır. */
  lowerIsBetter?: boolean;
  series: DashboardPoint[];
}

export interface DashboardListItem { key: string; label: string; value: number }
export interface DashboardList { key: string; title: string; /** Değer sütununun adı, örneğin "Ziyaretçi". */ valueLabel: string; kind?: MetricKind; items: DashboardListItem[] }

export interface DashboardData { metrics: DashboardMetric[]; lists: DashboardList[] }
export interface DashboardPeriod { value: string; label: string }

/** Dört ana göstergeyi sekme gibi sıralayıp seçileni tek grafikte, altında da iki sıralı listeyi görmek için kullanın; çok gösterge ya da derine inme için gösterge gezgini daha doğrudur. */
export interface MetricsDashboardProps {
  title: string;
  /** Alt satır: kaynak ve seçili dönem, örneğin "Mağaza verisi · Son 30 gün". */
  subtitle?: string;
  periods: DashboardPeriod[];
  period: string;
  onPeriodChange: (value: string) => void;
  /** Seçili dönemin verisi. Yükleme ve hata durumlarını `status` söyler. */
  data: DashboardData | null;
  status?: "ready" | "loading" | "error";
  onRetry?: () => void;
  /** Verilirse "Dışa aktar" düğmesi çıkar; gerçek aktarımı proje yapar. */
  onExport?: () => void;
}

export function MetricsDashboard({ title, subtitle, periods, period, onPeriodChange, data, status = "ready", onRetry, onExport }: MetricsDashboardProps) {
  const reduced = useReducedMotionSafe();
  const headId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState("");
  const noticeTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  const metrics = data?.metrics ?? [];
  const current = metrics.find(metric => metric.key === selected) ?? metrics[0];
  const hasPrevious = !!current?.series.some(point => point.previous !== undefined);

  const chartData: LineChartDatum[] = useMemo(() => (current?.series ?? []).map(point => ({ key: point.key, label: point.label, axisLabel: point.axisLabel, values: { now: point.value, before: point.previous } })), [current]);
  const kind = current?.kind ?? "count";

  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = metrics.map(metric => metric.key);
    const at = keys.indexOf(current?.key ?? "");
    const next = event.key === "ArrowRight" ? at + 1 : event.key === "ArrowLeft" ? at - 1 : event.key === "Home" ? 0 : event.key === "End" ? keys.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    const key = keys[(next + keys.length) % keys.length];
    if (!key) return;
    setSelected(key);
    requestAnimationFrame(() => document.getElementById(`${headId}-${key}`)?.focus());
  };

  const exportNow = () => {
    onExport?.();
    setNotice("Dışa aktarma hazırlanıyor");
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 3000);
  };

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}>
      <div className={styles.titles}>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.tools}>
        <SegmentedControl label="Dönem" value={period} onValueChange={onPeriodChange} options={periods} />
        {onExport && <Button size="sm" variant="secondary" onClick={exportNow}>Dışa aktar</Button>}
      </div>
    </header>
    {notice && <p className={styles.notice} role="status">{notice}</p>}

    {status === "loading" && <div className={styles.loading}><Skeleton label="Gösterge paneli yükleniyor" lines={6} /></div>}
    {status === "error" && <div className={styles.error} role="alert"><span>Yüklenemedi.</span>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</Button>}</div>}
    {status === "ready" && !metrics.length && <p className={styles.empty}>Bu dönem için veri yok.</p>}

    {status === "ready" && current && <>
      <div className={styles.tabs} role="tablist" aria-label="Göstergeler" onKeyDown={onTabKeyDown}>
        {metrics.map(metric => {
          const change = metricChange(metric.kind, metric.value, metric.previous);
          const good = metric.lowerIsBetter ? change.direction < 0 : change.direction > 0;
          const counter = metricCounter(metric.kind, metric.value);
          const isCurrent = metric.key === current.key;
          return <button key={metric.key} id={`${headId}-${metric.key}`} type="button" role="tab" className={styles.tab} aria-selected={isCurrent} aria-controls={`${headId}-panel`} tabIndex={isCurrent ? 0 : -1} onClick={() => setSelected(metric.key)}>
            <span className={styles.tabLabel}>{metric.label}</span>
            <span className={styles.tabValue} aria-label={metricValueText(metric.kind, metric.value)}><AnimatedCounter value={counter.value} decimals={counter.decimals} prefix={counter.prefix} suffix={counter.suffix} /></span>
            <span className={styles.change} data-tone={change.direction === 0 ? "flat" : good ? "good" : "calm"}>
              <span aria-hidden="true">{change.arrow} {change.text}</span>
              <span className={styles.srOnly}>{change.spoken}</span>
            </span>
          </button>;
        })}
        <span className={styles.underline} style={{ ["--tab-index" as string]: Math.max(0, metrics.findIndex(metric => metric.key === current.key)), ["--tab-count" as string]: metrics.length }} aria-hidden="true" />
      </div>

      <div id={`${headId}-panel`} role="tabpanel" aria-labelledby={`${headId}-${current.key}`} className={styles.panel}>
        <div className={styles.chartHead}>
          <span className={styles.chartTitle}>{current.label}</span>
          {hasPrevious && <label className={styles.compare}><input type="checkbox" checked={compare} onChange={event => setCompare(event.target.checked)} /> Karşılaştır</label>}
        </div>
        <LineChart key={current.key} label={current.label} data={chartData} height={200}
          series={[{ key: "now", label: current.label }, ...(compare && hasPrevious ? [{ key: "before", label: "Önceki dönem", dashed: true, area: false }] : [])]}
          formatValue={value => metricValueText(kind, value)} formatTick={value => metricShortText(kind, value)} legend={false}
          onActiveChange={(index, datum) => setActive(index === null || !datum ? "" : `${datum.label}: ${metricValueText(kind, datum.values.now ?? 0)}`)} />
        <p className={styles.srOnly} role="status" aria-live="polite">{active}</p>
      </div>

      <div className={styles.lists}>
        {(data?.lists ?? []).map(list => {
          const peak = Math.max(...list.items.map(item => item.value), 1);
          const listKind = list.kind ?? "count";
          return <section key={list.key} className={styles.list} aria-label={list.title}>
            <header className={styles.listHead}><h4>{list.title}</h4><span>{list.valueLabel}</span></header>
            <ol>{list.items.map(item => <li key={item.key} className={styles.row}>
              <span className={styles.fill} style={{ width: `${(item.value / peak) * 100}%` }} aria-hidden="true" />
              <span className={styles.rowLabel}>{item.label}</span>
              <span className={styles.rowValue}>{metricValueText(listKind, item.value)}</span>
            </li>)}</ol>
          </section>;
        })}
      </div>
    </>}
  </section>;
}

export default MetricsDashboard;
