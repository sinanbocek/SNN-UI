"use client";

import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import { motion } from "motion/react";
import { miniLinePath } from "../lib/chart-format";
import { metricShortText, metricValueText, type MetricKind } from "../lib/metric-format";
import { clamp, useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { Switch } from "../switch/switch";
import { domainFor, growthAt, growthText, periodLabel, readingAnnouncement, sortSeries, totals, trendArrow, trendOf, trendWord, type MultiSeries, type ScaleMode, type SortMode } from "./small-multiples-format";
import styles from "./small-multiples.module.css";

export type { MultiSeries };
export interface MultiPeriod { /** Ay anahtarı: "2026-09". */ key: string; /** Verilmezse ABACUS `date.format` ile "Eylül 2026". */ label?: string }

/** Aynı ölçünün birkaç serisini (bölge, ürün, plan) küçük çizgi grafiklerde, ortak bir dikey imleçle yan yana karşılaştırmak için kullanın; iki üç seri tek çizimde karşılaştırılacaksa çizgi grafik daha doğrudur. */
export interface SmallMultiplesProps {
  periods: MultiPeriod[];
  series: MultiSeries[];
  title?: string;
  /** Alt satır: ölçü ve dönem aralığı, örneğin "Aylık ciro · Ekim 2025 – Eylül 2026". */
  subtitle?: string;
  kind?: MetricKind;
  /** Büyümenin kıyaslandığı geçmiş (ay sayısı); varsayılan 12 (geçen yıl). */
  lookback?: number;
  /** Bu yüzdenin altındaki büyüme "düz" sayılır. */
  flatBelow?: number;
  defaultSort?: SortMode;
  defaultScale?: ScaleMode;
  loading?: boolean;
  emptyText?: string;
}

const SORTS = [{ value: "last", label: "Son değer" }, { value: "growth", label: "Büyüme" }, { value: "name", label: "Ad" }];
const SCALES = [{ value: "independent", label: "Bağımsız" }, { value: "shared", label: "Ortak" }];

export function SmallMultiples({ periods, series, title = "Seri karşılaştırması", subtitle, kind = "money", lookback = 12, flatBelow = 2, defaultSort = "last", defaultScale = "independent", loading = false, emptyText = "Gösterilecek seri yok." }: SmallMultiplesProps) {
  const reduced = useReducedMotionSafe();
  const hintId = useId();
  const [sort, setSort] = useState<SortMode>(defaultSort);
  const [scale, setScale] = useState<ScaleMode>(defaultScale);
  const [dim, setDim] = useState(false);
  const [cursor, setCursor] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");
  const count = periods.length, last = count - 1;
  const at = cursor ?? last;
  const label = (index: number) => periods[index]?.label ?? periodLabel(periods[index]?.key ?? "");
  const sums = useMemo(() => totals(series, count), [series, count]);
  const ordered = useMemo(() => sortSeries(series, sort, last, lookback), [series, sort, last, lookback]);
  const sumDomain = useMemo((): [number, number] => { const min = Math.min(...sums), max = Math.max(...sums), pad = (max - min || 1) * .1; return [min - pad, max + pad]; }, [sums]);
  const sumPath = useMemo(() => miniLinePath(sums, 100, 40, 2, sumDomain[0], sumDomain[1]), [sums, sumDomain]);

  const announceAt = (index: number) => {
    const top = series.reduce<MultiSeries | null>((best, item) => !best || (item.values[index] ?? 0) > (best.values[index] ?? 0) ? item : best, null);
    setAnnounce(readingAnnouncement(label(index), metricValueText(kind, sums[index] ?? 0), top ? { label: top.label, value: metricValueText(kind, top.values[index] ?? 0) } : null));
  };
  const place = (index: number | null) => { setCursor(index); if (index !== null) announceAt(index); };
  const indexAt = (event: PointerEvent<HTMLElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return clamp(Math.round(((event.clientX - rect.left) / rect.width) * last), 0, last); };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = cursor ?? last;
    const next = ({ ArrowRight: from + 1, ArrowLeft: from - 1, PageUp: from + 12, PageDown: from - 12, Home: 0, End: last } as Record<string, number>)[event.key];
    if (next !== undefined) { event.preventDefault(); place(clamp(next, 0, last)); }
    else if (event.key === "Escape") { setCursor(null); setAnnounce(""); }
  };

  if (loading) return <section className={styles.root} aria-busy="true"><Skeleton label="Seriler yükleniyor" lines={6} /></section>;

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}><h3 className={styles.title}>{title}</h3>{subtitle && <p className={styles.subtitle}>{subtitle}</p>}</header>
    {!series.length || count < 2 ? <p className={styles.empty}>{emptyText}</p> : <>
      <div className={styles.controls}>
        <SegmentedControl label="Sıralama" value={sort} onValueChange={value => { setSort(value as SortMode); setAnnounce(`Sıralama: ${SORTS.find(item => item.value === value)?.label}`); }} options={SORTS} />
        <SegmentedControl label="Ölçek" value={scale} onValueChange={value => { setScale(value as ScaleMode); setAnnounce(`Ölçek: ${SCALES.find(item => item.value === value)?.label}`); }} options={SCALES} />
        <Switch label="Düz gidenleri sönük göster" checked={dim} onCheckedChange={value => { setDim(value); setAnnounce(value ? "Düz giden seriler sönük" : "Düz giden seriler normal"); }} />
      </div>

      <div className={styles.reading} aria-hidden="true">
        <span className={styles.readingMonth}>{cursor === null ? `Son: ${label(last)}` : label(cursor)}</span>
        <span className={styles.readingTotal}>Toplam {metricValueText(kind, sums[at] ?? 0)}</span>
        <span className={styles.key}><i className={styles.keyLine} />Seri</span><span className={styles.key}><i className={styles.keyTrace} />Toplamın izi</span>
      </div>

      <div className={styles.grid} role="group" aria-roledescription="küçük çoklu grafikler" aria-label={`${title}. Sol ve sağ ok imleci aylar arasında gezdirir, Home ve End uçlara atlar, Esc temizler.`} aria-describedby={hintId} tabIndex={0} onKeyDown={onKeyDown} onFocus={event => { if (event.currentTarget === event.target && event.currentTarget.matches(":focus-visible")) place(last); }} onBlur={event => { if (event.currentTarget === event.target) setCursor(null); }}>
        {ordered.map(item => {
          const growth = growthAt(item.values, at, lookback), trend = trendOf(growth, flatBelow);
          const [low, high] = domainFor(item, series, scale), span = high - low || 1;
          const percentX = count > 1 ? (at / last) * 100 : 0;
          const valueY = (1 - ((item.values[at] ?? low) - low) / span) * 100;
          return <motion.article key={item.key} layout={!reduced} transition={{ type: "spring", visualDuration: .38, bounce: 0 }} className={styles.panel} data-flat={(dim && trend === "flat") || undefined}>
            <div className={styles.panelHead}>
              <h4 className={styles.name} title={item.label}>{item.label}</h4>
              <span className={styles.value}>{metricShortText(kind, item.values[at] ?? 0)}</span>
              <span className={styles.growth} data-trend={trend} aria-hidden="true">{trend === "none" ? "Yeterli geçmiş yok" : <>{trendArrow(trend)} {growthText(growth)}{trend === "flat" && <em> Düz</em>}</>}</span>
            </div>
            <div className={styles.chart} onPointerMove={event => { if (event.pointerType === "mouse" || event.buttons) place(indexAt(event)); }} onPointerDown={event => place(indexAt(event))} onPointerLeave={event => { if (event.pointerType === "mouse") { setCursor(null); setAnnounce(""); } }}>
              <svg className={styles.svg} viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                <path className={styles.trace} d={sumPath} />
                <path className={styles.line} d={miniLinePath(item.values, 100, 40, 2, low, high)} />
              </svg>
              <span className={styles.axisTop} aria-hidden="true">{metricShortText(kind, high)}</span><span className={styles.axisBottom} aria-hidden="true">{metricShortText(kind, Math.max(low, 0))}</span>
              <span className={styles.cursor} style={{ left: `${percentX}%` }} aria-hidden="true" />
              <span className={styles.dot} style={{ left: `${percentX}%`, top: `${clamp(valueY, 2, 98)}%` }} aria-hidden="true" />
            </div>
          </motion.article>;
        })}
      </div>
      <p id={hintId} className={styles.hint}>İmleç tüm panellerde aynı ayı gösterir.</p>

      <div className={styles.srOnly}><table>
        <caption>{title}, {label(at)}</caption>
        <thead><tr><th scope="col">Seri</th><th scope="col">Değer</th><th scope="col">Büyüme</th><th scope="col">Trend</th></tr></thead>
        <tbody>{ordered.map(item => { const growth = growthAt(item.values, at, lookback); return <tr key={item.key}><th scope="row">{item.label}</th><td>{metricValueText(kind, item.values[at] ?? 0)}</td><td>{growthText(growth)}</td><td>{trendWord(trendOf(growth, flatBelow))}</td></tr>; })}</tbody>
      </table></div>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
    </>}
  </section>;
}

export default SmallMultiples;
