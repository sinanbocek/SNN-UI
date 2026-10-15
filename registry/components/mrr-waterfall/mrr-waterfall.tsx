"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { clamp, useElementWidth, useReducedMotionSafe } from "../lib/viz-utils";
import { formatMoneyCompact, formatRatio } from "../lib/chart-format";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { buildSteps, countText, indicators, niceTop, periodChangeText, ratioText, retentionText, signedText, stepAnnouncement, stepValueText, type WaterfallAccount, type WaterfallMovement, type WaterfallUnit } from "./mrr-waterfall-format";
import styles from "./mrr-waterfall.module.css";

export type { WaterfallAccount, WaterfallMovement, WaterfallUnit };
export interface WaterfallPeriod { value: string; label: string }

/** Düzenli gelirin dönem başından sonuna nasıl değiştiğini köprü grafiğiyle (başlangıç, artışlar, azalışlar, bitiş) anlatmak için kullanın; aylar boyunca seyir için gelir gezgini daha doğrudur. */
export interface MrrWaterfallProps {
  /** Dönem başındaki toplam gelir (TRY). */
  start: number;
  movements: WaterfallMovement[];
  title?: string;
  /** Alt satır: kapsam ve tarih aralığı, örneğin "Tüm planlar · 1 Temmuz – 30 Eylül 2026". */
  subtitle?: string;
  /** Büyük bitiş değerinin altındaki metin, örneğin "30 Eylül itibarıyla". */
  asOf?: string;
  periods?: WaterfallPeriod[];
  period?: string;
  onPeriodChange?: (value: string) => void;
  status?: "ready" | "loading" | "error";
  onRetry?: () => void;
  /** Panelde gösterilen en çok hesap sayısı; kalanlar "Diğer hesaplar" satırında toplanır. */
  maxAccounts?: number;
}

const HEIGHT = 280, TOP = 22, BOTTOM = 34;
const toneOf = (kind: "total" | "up" | "down") => kind === "total" ? "var(--accent)" : kind === "up" ? "var(--series-3)" : "var(--series-2)";

export function MrrWaterfall({ start, movements, title = "Gelir köprüsü", subtitle, asOf, periods, period, onPeriodChange, status = "ready", onRetry, maxAccounts = 5 }: MrrWaterfallProps) {
  const reduced = useReducedMotionSafe();
  const [box, width] = useElementWidth<HTMLDivElement>();
  const [unit, setUnit] = useState<WaterfallUnit>("amount");
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const steps = useMemo(() => buildSteps(start, movements), [start, movements]);
  const end = steps[steps.length - 1]?.amount ?? 0;
  const marks = useMemo(() => indicators(start, movements), [start, movements]);
  const chosen = steps.find(step => step.key === selected) ?? null;

  const plotWidth = Math.max(width, 1), column = plotWidth / steps.length, barWidth = Math.min(56, column * .6);
  const top = unit === "percent" ? niceTop(Math.max(...steps.map(step => step.high)) / (start || 1)) * (start || 1) : niceTop(Math.max(...steps.map(step => step.high), 1));
  const plotHeight = HEIGHT - TOP - BOTTOM;
  const yOf = (value: number) => TOP + (1 - value / top) * plotHeight;
  const ticks = [0, .25, .5, .75, 1].map(share => top * share);

  const pick = (key: string | null) => {
    setSelected(key);
    const step = steps.find(item => item.key === key);
    if (step) setAnnounce(stepAnnouncement(unit, step, start));
  };
  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    const at = steps.findIndex(step => step.key === selected);
    const move = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (move) { event.preventDefault(); pick(steps[(clamp(at, -1, steps.length) + move + steps.length) % steps.length]?.key ?? null); }
    else if (event.key === "Home") { event.preventDefault(); pick(steps[0]?.key ?? null); }
    else if (event.key === "End") { event.preventDefault(); pick(steps[steps.length - 1]?.key ?? null); }
    else if (event.key === "Escape") pick(null);
  };

  if (status === "loading") return <section className={styles.root} aria-busy="true"><Skeleton label="Gelir köprüsü yükleniyor" lines={6} /></section>;
  if (status === "error") return <section className={styles.root}><div className={styles.error} role="alert"><span>Yüklenemedi.</span>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</Button>}</div></section>;

  const list = chosen?.accounts ?? [];
  const shown = list.slice(0, maxAccounts);
  const rest = list.slice(maxAccounts);
  const restSum = rest.reduce((sum, account) => sum + account.amount, 0);
  const restCount = Math.max((chosen?.accountCount ?? 0) - shown.length, 0);
  const peak = Math.max(...list.map(account => account.amount), restSum, 1);
  const showAmount = (value: number) => stepValueText("amount", value, start);

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}>
      <div className={styles.titles}><h3 className={styles.title}>{title}</h3>{subtitle && <p className={styles.subtitle}>{subtitle}</p>}</div>
      <div className={styles.tools}>
        {periods && period !== undefined && onPeriodChange && <SegmentedControl label="Dönem" value={period} onValueChange={onPeriodChange} options={periods} />}
        <SegmentedControl label="Birim" value={unit} onValueChange={value => setUnit(value as WaterfallUnit)} options={[{ value: "amount", label: "Tutar" }, { value: "percent", label: "Başlangıca göre %" }]} />
      </div>
    </header>

    <div className={styles.summary}>
      <div className={styles.endBlock}>
        <span className={styles.statValue} aria-label={showAmount(end)}><AnimatedCounter value={Math.round(end)} prefix="₺" /></span>
        {asOf && <span className={styles.asOf}>{asOf}</span>}
        <span className={styles.change}>{periodChangeText(start, end)}</span>
      </div>
      <dl className={styles.marks}>
        <div><dt>Net elde tutma</dt><dd>{marks.netRetention === null ? "—" : retentionText(marks.netRetention)}</dd></div>
        <div><dt>Hızlı oran</dt><dd>{marks.quickRatio === null ? "—" : ratioText(marks.quickRatio)}</dd></div>
        <div><dt>Müşteri kaybı</dt><dd>{marks.churn === null ? "—" : retentionText(marks.churn)}</dd></div>
      </dl>
    </div>

    <div className={styles.body}>
      <div ref={box} className={styles.chart}>
        <svg className={styles.svg} width={plotWidth} height={HEIGHT} role="img" aria-label={`${title}: ${steps.map(step => `${step.label} ${signedText(unit, step, start, false)}`).join(", ")}`}>
          {ticks.map(tick => <g key={tick}><line className={styles.grid} x1={0} x2={plotWidth} y1={yOf(tick)} y2={yOf(tick)} /><text className={styles.axisText} x={0} y={yOf(tick) - 4}>{unit === "percent" ? formatRatio(tick / (start || 1), 0) : formatMoneyCompact(tick)}</text></g>)}
          <g role="radiogroup" aria-label="Basamaklar" onKeyDown={onKeyDown}>
            {steps.map((step, at) => {
              const x = column * at + (column - barWidth) / 2;
              const y = yOf(step.high), h = Math.max(2, yOf(step.low) - yOf(step.high));
              const isSelected = selected === step.key;
              return <g key={step.key} role="radio" aria-checked={isSelected} aria-label={stepAnnouncement(unit, step, start)} tabIndex={isSelected || (selected === null && at === 0) ? 0 : -1} className={styles.step}
                data-selected={isSelected || undefined} data-dim={(hover && hover !== step.key && !isSelected) || undefined}
                onClick={() => pick(step.key)} onPointerEnter={event => { if (event.pointerType === "mouse") setHover(step.key); }} onPointerLeave={() => setHover(null)} onFocus={() => { if (selected !== step.key) setSelected(step.key); }}>
                <rect className={styles.hit} x={column * at} y={0} width={column} height={HEIGHT} />
                <motion.rect className={styles.bar} rx={4} x={x} width={barWidth} style={{ fill: toneOf(step.kind) }} initial={false} animate={{ y, height: h }} transition={reduced ? { duration: 0 } : { type: "spring", visualDuration: .4, bounce: .05 }} />
                <text className={styles.valueText} x={column * at + column / 2} y={Math.max(12, y - 6)} textAnchor="middle">{signedText(unit, step, start)}</text>
                <text className={styles.labelText} x={column * at + column / 2} y={HEIGHT - 12} textAnchor="middle">{step.label}</text>
              </g>;
            })}
          </g>
        </svg>
      </div>

      <aside className={styles.panel} aria-label="Hesaplar">
        {!chosen && <p className={styles.hint}>Bir çubuğu seçin ya da ok tuşlarını kullanın.</p>}
        {chosen && <>
          <h4 className={styles.panelTitle}>{chosen.label}</h4>
          <p className={styles.panelSum}>{signedText("amount", chosen, start, false)}{chosen.kind !== "total" && <span> · {countText(chosen.accountCount)} hesap</span>}</p>
          {chosen.kind === "total" || !chosen.accountCount ? <p className={styles.hint}>{chosen.kind === "total" ? "Bu çubuk için hesap listesi yok." : "Hesap yok."}</p> : <ul className={styles.accounts}>
            {shown.map(account => <motion.li key={account.key} layout={!reduced} className={styles.account} transition={{ duration: .25 }}>
              <span className={styles.accountFill} style={{ width: `${(account.amount / peak) * 100}%` }} aria-hidden="true" />
              <span className={styles.accountName}>{account.name}{account.detail && <small>{account.detail}</small>}</span>
              <span className={styles.accountAmount}>{showAmount(account.amount)}</span>
            </motion.li>)}
            {restCount > 0 && <li className={styles.account}><span className={styles.accountName}>Diğer hesaplar ({countText(restCount)} hesap)</span><span className={styles.accountAmount}>{showAmount(restSum || Math.max(chosen.amount - shown.reduce((sum, account) => sum + account.amount, 0), 0))}</span></li>}
          </ul>}
        </>}
      </aside>
    </div>

    <div className={styles.srOnly}><table>
      <caption>{title}</caption>
      <thead><tr><th scope="col">Basamak</th><th scope="col">Tutar</th><th scope="col">Başlangıca göre pay</th><th scope="col">Hesap sayısı</th></tr></thead>
      <tbody>{steps.map(step => <tr key={step.key}><th scope="row">{step.label}</th><td>{signedText("amount", step, start, false)}</td><td>{stepValueText("percent", step.amount, start)}</td><td>{step.kind === "total" ? "—" : countText(step.accountCount)}</td></tr>)}</tbody>
    </table></div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
  </section>;
}

export default MrrWaterfall;
