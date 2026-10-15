"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { roundTo } from "../lib/chart-format";
import { clamp, useElementWidth, useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { budgetOutlook, budgetSpoken, budgetStep, dayText, forecastSentence, forecastUsage, moneyText, overageCost, percentOf, thresholdStates, usageShort, usageText } from "./usage-forecast-format";
import styles from "./usage-forecast.module.css";

export interface UsageMeasure { value: string; label: string }

/** Bir fatura döneminde bir ölçünün (istek, depolama, koltuk) kullanımını çizip dönem sonuna kadar gidişini tahmin etmek, bütçe çizgisini sürükleyerek aşma gününü görmek için kullanın; sabit bir hakkın dolulğu için kullanım göstergesi daha doğrudur. */
export interface UsageForecastProps {
  /** Her gün sonundaki kümülatif kullanım (gerçekleşen günler kadar). */
  used: number[];
  /** Fatura döneminin gün sayısı. */
  days: number;
  /** Dönemin ilk günü: ISO "2026-09-01". Tarihleri ABACUS üretir. */
  startDate: string;
  budget: number;
  onBudgetChange?: (budget: number) => void;
  minBudget?: number;
  maxBudget?: number;
  /** Birim adı, örneğin "istek". */
  unit?: string;
  /** Bütçe üstü maliyet: her `per` birim için `price` TRY. */
  overage?: { per: number; price: number };
  title?: string;
  /** Alt satır: müşteri ya da plan ve yenileme tarihi (hazır metin). */
  subtitle?: string;
  measures?: UsageMeasure[];
  measure?: string;
  onMeasureChange?: (value: string) => void;
  /** Uyarı eşikleri (bütçenin yüzdesi). */
  thresholds?: number[];
  status?: "ready" | "loading" | "error";
  onRetry?: () => void;
}

const HEIGHT = 280, PAD_TOP = 14, PAD_BOTTOM = 26, GUTTER = 8;

export function UsageForecast({ used, days, startDate, budget, onBudgetChange, minBudget, maxBudget, unit = "", overage, title = "Kullanım tahmini", subtitle, measures, measure, onMeasureChange, thresholds = [50, 80, 100], status = "ready", onRetry }: UsageForecastProps) {
  const reduced = useReducedMotionSafe();
  const [box, width] = useElementWidth<HTMLDivElement>();
  const [inner, setInner] = useState(budget);
  const value = onBudgetChange ? budget : inner;
  const lowest = minBudget ?? Math.max(1, Math.round(value / 4)), highest = maxBudget ?? Math.round(value * 3);
  const setBudget = (next: number) => { const bounded = clamp(Math.round(next), lowest, highest); setInner(bounded); onBudgetChange?.(bounded); };
  const [rules, setRules] = useState<number[]>(thresholds);
  const [cursor, setCursor] = useState<number | null>(null);
  const [announce, setAnnounce] = useState("");
  const dragging = useRef(false);

  const forecast = useMemo(() => forecastUsage(used, days), [used, days]);
  const outlook = budgetOutlook(forecast, value);
  const states = useMemo(() => thresholdStates(forecast, value, thresholds), [forecast, value, thresholds]);
  const today = forecast.elapsed - 1;
  const todayValue = used[today] ?? 0;
  const exceededBy = Math.max(0, todayValue - value);
  const cost = overage ? overageCost(outlook.endMid, value, overage.per, overage.price) : null;

  const peak = Math.max(value * 1.15, (outlook.endHigh ?? 0) * 1.05, todayValue * 1.05, 1);
  const plotWidth = Math.max(width - GUTTER * 2, 1), plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const xOf = (day: number) => GUTTER + (days > 1 ? (day / (days - 1)) * plotWidth : 0);
  const yOf = (amount: number) => PAD_TOP + (1 - amount / peak) * plotHeight;
  const path = (series: (number | null)[], from = 0, to = series.length - 1) => series.slice(from, to + 1).flatMap((point, at) => point === null ? [] : [`${at === 0 || series[from + at - 1] === null ? "M" : "L"}${roundTo(xOf(from + at), 1)} ${roundTo(yOf(point), 1)}`]).join("");
  const cone = (() => {
    const upper: string[] = [], lower: string[] = [];
    forecast.mid.forEach((point, day) => { if (point === null) return; upper.push(`${roundTo(xOf(day), 1)} ${roundTo(yOf(forecast.high[day] ?? point), 1)}`); lower.unshift(`${roundTo(xOf(day), 1)} ${roundTo(yOf(forecast.low[day] ?? point), 1)}`); });
    return upper.length ? `M${upper.join("L")}L${lower.join("L")}Z` : "";
  })();
  const overDay = outlook.day;

  const budgetFromY = (clientY: number) => { const rect = box.current?.getBoundingClientRect(); if (!rect) return value; return peak * (1 - (clientY - rect.top - PAD_TOP) / plotHeight); };
  const onHandleDown = (event: PointerEvent<HTMLDivElement>) => { event.preventDefault(); dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); };
  const onHandleMove = (event: PointerEvent<HTMLDivElement>) => { if (dragging.current) setBudget(budgetFromY(event.clientY)); };
  const onHandleUp = () => { dragging.current = false; setAnnounce(`${forecastSentence(startDate, days, forecast.elapsed, value, outlook, forecast.enough, exceededBy)}`); };
  const onHandleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = budgetStep(lowest, highest);
    const next = ({ ArrowUp: value + step, ArrowRight: value + step, ArrowDown: value - step, ArrowLeft: value - step, PageUp: value + step * 5, PageDown: value - step * 5, Home: lowest, End: highest } as Record<string, number>)[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setBudget(next);
  };

  const dayAt = (event: PointerEvent<HTMLElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return clamp(Math.round(((event.clientX - rect.left - GUTTER) / plotWidth) * (days - 1)), 0, days - 1); };
  const readDay = (day: number) => { setCursor(day); const actualValue = forecast.actual[day], mid = forecast.mid[day]; setAnnounce(`${dayText(startDate, day)}: ${actualValue !== null && actualValue !== undefined ? `${usageText(actualValue)} ${unit} ölçüldü` : mid !== null && mid !== undefined ? `${usageText(mid)} ${unit} tahmin, ${usageText(forecast.low[day] ?? mid)} ile ${usageText(forecast.high[day] ?? mid)} arası` : ""}`); };
  const onChartKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = cursor ?? today;
    const next = ({ ArrowRight: at + 1, ArrowLeft: at - 1, PageUp: at + 7, PageDown: at - 7, Home: 0, End: days - 1 } as Record<string, number>)[event.key];
    if (next !== undefined) { event.preventDefault(); readDay(clamp(next, 0, days - 1)); }
    else if (event.key === "Escape") { setCursor(null); setAnnounce(""); }
  };

  if (status === "loading") return <section className={styles.root} aria-busy="true"><Skeleton label="Kullanım tahmini yükleniyor" lines={6} /></section>;
  if (status === "error") return <section className={styles.root}><div className={styles.error} role="alert"><span>Yüklenemedi.</span>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</Button>}</div></section>;
  if (!used.length) return <section className={styles.root}><p className={styles.empty}>Bu dönem için kullanım verisi yok.</p></section>;

  const sentence = forecastSentence(startDate, days, forecast.elapsed, value, outlook, forecast.enough, exceededBy);
  const reading = cursor === null ? null : { day: cursor, actual: forecast.actual[cursor] ?? null, mid: forecast.mid[cursor] ?? null, low: forecast.low[cursor] ?? null, high: forecast.high[cursor] ?? null };
  const toggleRule = (percent: number) => setRules(current => current.includes(percent) ? current.filter(item => item !== percent) : [...current, percent]);
  const suffix = unit ? ` ${unit}` : "";

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}>
      <div><h3 className={styles.title}>{title}</h3>{subtitle && <p className={styles.subtitle}>{subtitle}</p>}</div>
      {measures && measure !== undefined && onMeasureChange && <SegmentedControl label="Ölçü" value={measure} onValueChange={onMeasureChange} options={measures} />}
    </header>

    <p className={styles.sentence} data-over={outlook.exceeded || undefined} role="status" aria-live="polite">{sentence}</p>

    <div className={styles.summary}>
      <div><span className={styles.statLabel}>Şimdiye kadar</span><span className={styles.statValue}><AnimatedCounter value={Math.round(todayValue)} /></span><span className={styles.statNote}>Bütçenin payı {percentOf(todayValue, value)}</span></div>
      <div><span className={styles.statLabel}>Dönem sonu tahmini</span><span className={styles.statValue}>{forecast.enough && outlook.endMid !== null ? <AnimatedCounter value={Math.round(outlook.endMid)} /> : "—"}</span><span className={styles.statNote}>{forecast.enough && outlook.endLow !== null && outlook.endHigh !== null ? `${usageText(outlook.endLow)} – ${usageText(outlook.endHigh)} arası` : "Tahmin için yeterli veri yok"}</span></div>
      {overage && <div><span className={styles.statLabel}>Bütçe üstü maliyet</span><span className={styles.statValue}>{cost === null ? "₺0" : moneyText(cost)}</span><span className={styles.statNote}>{cost === null ? "Aşım beklenmiyor" : `${usageText(overage.per)} ${unit || "birim"} başına ${moneyText(overage.price)}`}</span></div>}
    </div>

    <div ref={box} className={styles.chart}>
      <div className={styles.plot} role="group" aria-roledescription="kullanım grafiği" aria-label={`${title}. ${sentence} Gün gün okumak için sol ve sağ ok tuşlarını kullanın.`} tabIndex={0} onKeyDown={onChartKey} onBlur={() => setCursor(null)}
        onPointerMove={event => { if (event.pointerType === "mouse" || event.buttons) readDay(dayAt(event)); }} onPointerDown={event => readDay(dayAt(event))} onPointerLeave={event => { if (event.pointerType === "mouse") setCursor(null); }}>
        <svg className={styles.svg} width={Math.max(width, 1)} height={HEIGHT} aria-hidden="true">
          {[0, .25, .5, .75, 1].map(share => <g key={share}><line className={styles.grid} x1={GUTTER} x2={GUTTER + plotWidth} y1={yOf(peak * share)} y2={yOf(peak * share)} /><text className={styles.axis} x={GUTTER + 2} y={yOf(peak * share) - 3}>{usageShort(peak * share)}</text></g>)}
          {rules.filter(percent => percent !== 100).map(percent => <g key={percent}><line className={styles.rule} x1={GUTTER} x2={GUTTER + plotWidth} y1={yOf((value * percent) / 100)} y2={yOf((value * percent) / 100)} /><text className={styles.ruleText} x={GUTTER + plotWidth - 2} y={yOf((value * percent) / 100) - 3} textAnchor="end">%{percent}</text></g>)}
          {cone && <path className={styles.cone} d={cone} />}
          <path className={styles.forecastLine} d={path(forecast.mid, Math.max(today, 0))} />
          <path className={styles.actualLine} d={path(forecast.actual, 0, today)} />
          {outlook.exceeded && overDay !== null && <path className={styles.overLine} d={path(forecast.actual, Math.floor(overDay), today)} />}
          <line className={styles.todayLine} x1={xOf(today)} x2={xOf(today)} y1={PAD_TOP} y2={PAD_TOP + plotHeight} />
          <text className={styles.axis} x={xOf(today)} y={HEIGHT - 8} textAnchor="middle">bugün</text>
          <line className={styles.budgetLine} data-over={value < todayValue || undefined} x1={GUTTER} x2={GUTTER + plotWidth} y1={yOf(value)} y2={yOf(value)} />
          {overDay !== null && <g className={styles.mark}><circle cx={xOf(overDay)} cy={yOf(value)} r={5} /><text x={clamp(xOf(overDay), 40, width - 40)} y={yOf(value) - 10} textAnchor="middle">{dayText(startDate, overDay)}</text></g>}
          {reading && <line className={styles.cursor} x1={xOf(reading.day)} x2={xOf(reading.day)} y1={PAD_TOP} y2={PAD_TOP + plotHeight} />}
        </svg>
        {reading && <div className={styles.tip} style={{ left: clamp(xOf(reading.day), 90, Math.max(90, width - 90)) }} role="presentation">
          <strong>{dayText(startDate, reading.day)}</strong>
          <span>{reading.actual !== null ? `${usageText(reading.actual)}${suffix} · ölçüldü` : reading.mid !== null ? `${usageText(reading.mid)}${suffix} · tahmin` : ""}</span>
          {reading.actual === null && reading.low !== null && reading.high !== null && <span>Aralık {usageText(reading.low)} – {usageText(reading.high)}</span>}
        </div>}
      </div>
      <div className={styles.handle} style={{ top: yOf(value) }} role="slider" tabIndex={0} aria-label="Bütçe" aria-orientation="vertical" aria-valuemin={lowest} aria-valuemax={highest} aria-valuenow={value} aria-valuetext={budgetSpoken(startDate, value, outlook)}
        onPointerDown={onHandleDown} onPointerMove={onHandleMove} onPointerUp={onHandleUp} onPointerCancel={onHandleUp} onKeyDown={onHandleKey} onKeyUp={event => { if (event.key.startsWith("Arrow") || event.key.startsWith("Page") || event.key === "Home" || event.key === "End") onHandleUp(); }}>
        <span className={styles.handleLabel}>Bütçe {usageShort(value)}</span>
      </div>
    </div>

    <ul className={styles.legend} aria-hidden="true">
      <li><span className={styles.keyActual} />Gerçekleşen</li><li><span className={styles.keyForecast} />Tahmin</li><li><span className={styles.keyCone} />Olası aralık</li><li><span className={styles.keyBudget} />Bütçe</li>
    </ul>

    <div className={styles.rules}>
      <span className={styles.rulesLabel}>Uyarı:</span>
      {states.map(item => <button key={item.percent} type="button" className={styles.rule2} aria-pressed={rules.includes(item.percent)} onClick={() => toggleRule(item.percent)}
        aria-label={`%${item.percent}, ${rules.includes(item.percent) ? "açık" : "kapalı"}, ${item.state === "reached" && item.day !== null ? `${dayText(startDate, item.day)} günü ulaşıldı` : item.state === "expected" && item.day !== null ? `${dayText(startDate, item.day)} günü bekleniyor` : "dönem içinde beklenmiyor"}`}>
        <strong>%{item.percent}</strong><span>{item.state === "reached" && item.day !== null ? `ulaşıldı ${dayText(startDate, item.day)}` : item.state === "expected" && item.day !== null ? `beklenen ${dayText(startDate, item.day)}` : "beklenmiyor"}</span>
      </button>)}
    </div>

    <div className={styles.srOnly}><table>
      <caption>{title}</caption>
      <thead><tr><th scope="col">Gün</th><th scope="col">Değer</th><th scope="col">Olası aralık</th><th scope="col">Durum</th></tr></thead>
      <tbody>{Array.from({ length: days }, (_, day) => { const actual = forecast.actual[day], mid = forecast.mid[day]; return <tr key={day}><th scope="row">{dayText(startDate, day)}</th><td>{actual !== null && actual !== undefined ? usageText(actual) : mid !== null && mid !== undefined ? usageText(mid) : "—"}</td><td>{actual === null && forecast.low[day] !== null && forecast.low[day] !== undefined ? `${usageText(forecast.low[day] ?? 0)} – ${usageText(forecast.high[day] ?? 0)}` : "—"}</td><td>{actual !== null && actual !== undefined ? "ölçüldü" : "tahmin"}</td></tr>; })}</tbody>
    </table></div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
  </section>;
}

export default UsageForecast;
