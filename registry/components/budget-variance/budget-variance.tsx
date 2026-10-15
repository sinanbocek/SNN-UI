"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Avatar } from "../avatar/avatar";
import { Button } from "../button/button";
import { useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { kindWord, moneyFull, moneyShort, ratioOf, resolveDepartment, scaleMax, scalePercent, signedMoney, variance, variancePercentText, varianceSentence, type VarianceDepartment, type VarianceItem } from "./budget-variance-format";
import styles from "./budget-variance.module.css";

export type { VarianceDepartment, VarianceItem };
export interface VariancePeriod { value: string; label: string }

/** Planlanan ile gerçekleşen harcamayı bölüm bazında hizalı çubuklarla karşılaştırmak için kullanın; burada tüm kalemler gider sayılır (altında kalmak olumlu, aşmak olumsuzdur). Çok sayıda birim için sıralanabilir tablo daha doğrudur. */
export interface BudgetVarianceProps {
  departments: VarianceDepartment[];
  periods: VariancePeriod[];
  period: string;
  onPeriodChange: (value: string) => void;
  title?: string;
  /** Alt satır: dönem açıklaması, örneğin "Eylül 2026" (ABACUS `date.monthName`). */
  subtitle?: string;
  /** "Toplam" satırının adı. */
  totalLabel?: string;
  /** "Plana uygun" bandı: bütçeye oranla (varsayılan 0,02). */
  tolerance?: number;
  /** Ortak ölçek tavanı (bütçeye oran); verilmezse veriden, en az 1,2. Dönemler arasında sabit kalması için dışarıdan verilebilir. */
  scale?: number;
  /** Bir bölüm açılınca çağrılır (kalemleri tembel yüklemek için). */
  onOpen?: (key: string) => void;
  status?: "ready" | "loading" | "error";
  onRetry?: () => void;
}

interface RowProps { name: string; owner?: string; budget: number; actual: number; scale: number; tolerance: number; toggle?: { open: boolean; controls: string; onClick: () => void; onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void; register: (node: HTMLButtonElement | null) => void }; strong?: boolean; nested?: boolean }

function Row({ name, owner, budget, actual, scale, tolerance, toggle, strong, nested }: RowProps) {
  const ratio = ratioOf(budget, actual);
  const { amount, kind } = variance(budget, actual, tolerance);
  const cut = 1 / scale, fill = Math.min(ratio, 1) / scale, over = Math.max(ratio - 1, 0) / scale;
  const body = <>
    <span className={styles.name}>{owner && <Avatar name={owner} size="sm" aria-hidden="true" />}<span className={styles.nameText}>{name}</span></span>
    <span className={styles.bar} aria-hidden="true">
      <span className={styles.fill} data-kind={kind} style={{ width: `${fill * 100}%` }} />
      {over > 0 && <span className={styles.over} style={{ left: `${cut * 100}%`, width: `${over * 100}%` }} />}
      <span className={styles.marker} style={{ left: `${cut * 100}%` }} />
    </span>
    <span className={styles.amounts} aria-hidden="true"><b><AnimatedCounter value={Math.round(actual)} prefix="₺" /></b><span>/ {moneyShort(budget)}</span></span>
    <span className={styles.variance} data-kind={kind} aria-hidden="true"><span>{signedMoney(amount)}</span><small>{variancePercentText(budget, actual, tolerance)}</small></span>
    {toggle && <span className={styles.chevron} data-open={toggle.open || undefined} aria-hidden="true">▾</span>}
  </>;
  const className = [styles.row, strong ? styles.total : "", nested ? styles.nested : ""].join(" ");
  if (toggle) return <button type="button" ref={toggle.register} className={className} aria-expanded={toggle.open} aria-controls={toggle.controls} aria-label={varianceSentence(name, budget, actual, tolerance)} onClick={toggle.onClick} onKeyDown={toggle.onKeyDown}>{body}</button>;
  return <div className={className} role="group" aria-label={varianceSentence(name, budget, actual, tolerance)}>{body}</div>;
}

export function BudgetVariance({ departments, periods, period, onPeriodChange, title = "Bütçe sapması", subtitle, totalLabel = "Toplam işletme gideri", tolerance = .02, scale, onOpen, status = "ready", onRetry }: BudgetVarianceProps) {
  const reduced = useReducedMotionSafe();
  const baseId = useId();
  const [open, setOpen] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const resolved = useMemo(() => departments.map(resolveDepartment), [departments]);
  const totalBudget = resolved.reduce((sum, row) => sum + row.budget, 0), totalActual = resolved.reduce((sum, row) => sum + row.actual, 0);
  const maxRatio = useMemo(() => scale ?? scaleMax([...resolved, ...resolved.flatMap(row => row.items), { budget: totalBudget, actual: totalActual }]), [scale, resolved, totalBudget, totalActual]);
  const ticks = [0, .5, 1].filter(tick => tick <= maxRatio);

  // Dönem değişince yeni dönem ve toplam kibar canlı bölgede duyurulur.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (status === "ready" && resolved.length) setAnnounce(`${periods.find(item => item.value === period)?.label ?? ""}: ${varianceSentence(totalLabel, totalBudget, totalActual, tolerance)}`);
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const keys = resolved.map(row => row.key);
  const onKeyDown = (key: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const at = keys.indexOf(key);
    const next = event.key === "ArrowDown" ? at + 1 : event.key === "ArrowUp" ? at - 1 : event.key === "Home" ? 0 : event.key === "End" ? keys.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    buttons.current.get(keys[Math.min(Math.max(next, 0), keys.length - 1)] ?? "")?.focus();
  };
  const toggle = (key: string) => { const next = open === key ? null : key; setOpen(next); if (next) onOpen?.(next); };

  const periodSwitch = <SegmentedControl label="Dönem" value={period} onValueChange={onPeriodChange} options={periods} />;

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}>
      <div><h3 className={styles.title}>{title}</h3>{subtitle && <p className={styles.subtitle}>{subtitle}</p>}</div>
      <div className={styles.periods}>{periodSwitch}</div>
    </header>

    {status === "loading" && <Skeleton label="Bütçe verisi yükleniyor" lines={6} />}
    {status === "error" && <div className={styles.error} role="alert"><span>Yüklenemedi.</span>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</Button>}</div>}
    {status === "ready" && !resolved.length && <p className={styles.empty}>Bütçe verisi yok.</p>}

    {status === "ready" && resolved.length > 0 && <>
      <div className={styles.scaleStrip} aria-hidden="true"><span className={styles.scaleTrack}>{ticks.map(tick => <span key={tick} className={styles.tick} data-budget={tick === 1 || undefined} style={{ left: `${(tick / maxRatio) * 100}%` }}>{scalePercent(tick)}</span>)}</span></div>
      <Row name={totalLabel} budget={totalBudget} actual={totalActual} scale={maxRatio} tolerance={tolerance} strong />
      <ul className={styles.list}>
        {resolved.map(row => {
          const isOpen = open === row.key, panelId = `${baseId}-${row.key}`;
          return <li key={row.key}>
            <Row name={row.name} owner={row.owner} budget={row.budget} actual={row.actual} scale={maxRatio} tolerance={tolerance}
              toggle={row.items.length ? { open: isOpen, controls: panelId, onClick: () => toggle(row.key), onKeyDown: onKeyDown(row.key), register: node => { if (node) buttons.current.set(row.key, node); else buttons.current.delete(row.key); } } : undefined} />
            <AnimatePresence initial={false}>
              {isOpen && <motion.ul key="items" id={panelId} className={styles.items} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0, transition: { duration: .14 } }} transition={{ duration: reduced ? 0 : .26, ease: [.22, 1, .36, 1] }} style={{ overflow: "hidden" }}>
                {row.items.map(item => <li key={item.key}><Row name={item.name} budget={item.budget} actual={item.actual} scale={maxRatio} tolerance={tolerance} nested /></li>)}
              </motion.ul>}
            </AnimatePresence>
          </li>;
        })}
      </ul>
      <ul className={styles.legend} aria-hidden="true">
        <li><span className={styles.keyFill} />Gerçekleşen</li><li><span className={styles.keyMarker} />Bütçe</li><li><span className={styles.keyOver} />Bütçe aşımı ({kindWord("over")})</li>
        <li><span className={styles.keyBand} />Plana uygun: bütçe bandı ±{scalePercent(tolerance)}</li>
      </ul>
    </>}
    <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announce}</p>
  </section>;
}

export default BudgetVariance;
