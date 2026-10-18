"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { limitMessage, majorOf, minorMoney, paymentNote, percentText, periodSeatMinor, periodWord, recommendedKey, savingsMinor, sellable, seatsText, totalMinor, visibleFeatures, volumeDiscountMinor, type BillingPeriod, type PlanFeature, type PriceTier, type PricingPlan } from "./pricing-calculator-format";
import styles from "./pricing-calculator.module.css";

export type { BillingPeriod, PlanFeature, PriceTier, PricingPlan };
export interface TrialSelection { plan: string; seats: number; period: BillingPeriod }

/** Koltuk (kullanıcı) başına fiyatlanan bir ürün için ekip büyüklüğünü kaydırıcıyla seçtirmek, aylık / yıllık fiyatları, hacim indirimini ve önerilen planı canlı göstermek için kullanın; ölçüme göre fiyatlanan ürün için kullanıma göre fiyat hesaplayıcı daha doğrudur. */
export interface PricingCalculatorProps {
  /** Planlar, küçükten büyüğe (en çok üç). Fiyat tablosunu uygulama verir. */
  plans: PricingPlan[];
  /** Kaydırıcının sabit koltuk durakları, artan: [1, 5, 10, 20, 50, 100]. */
  stops: number[];
  defaultSeats?: number | undefined;
  /** Yıllık ödeme indirimi (yüzde), örneğin 20. */
  yearlyDiscount?: number | undefined;
  title?: string | undefined;
  description?: string | undefined;
  /** "Denemeyi başlat": reddederse (Promise) satır içi "Başlatılamadı" yazılır ve yeniden denenir. */
  onStartTrial: (selection: TrialSelection) => Promise<void>;
  loading?: boolean | undefined;
}

export function PricingCalculator({ plans, stops, defaultSeats, yearlyDiscount = 20, title = "Kullandığınız koltuk kadar ödeyin", description, onStartTrial, loading = false }: PricingCalculatorProps) {
  const reduced = useReducedMotionSafe();
  const baseId = useId();
  const [index, setIndex] = useState(() => Math.max(0, stops.indexOf(defaultSeats ?? stops[Math.min(2, stops.length - 1)] ?? 1)));
  const [period, setPeriod] = useState<BillingPeriod>("month");
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [announce, setAnnounce] = useState("");
  const seats = stops[index] ?? 1;
  const recommended = recommendedKey(plans, seats);
  const chosenKey = picked && plans.some(plan => plan.key === picked && sellable(plan, seats)) ? picked : recommended;
  const chosen = plans.find(plan => plan.key === chosenKey);
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, visualDuration: .4, bounce: .08 };

  const setSeatsAt = (next: number) => { const bounded = Math.min(Math.max(next, 0), stops.length - 1); setIndex(bounded); setMessage(null); setAnnounce(seatsText(stops[bounded] ?? 1)); };
  const changePeriod = (value: string) => { setPeriod(value as BillingPeriod); setAnnounce(value === "year" ? "Yıllık ödeme" : "Aylık ödeme"); };
  const choose = (key: string) => { setPicked(key); setAnnounce(`${plans.find(plan => plan.key === key)?.name} planı seçildi`); };
  const start = async () => {
    if (!chosen) return;
    setBusy(true); setMessage(null);
    try { await onStartTrial({ plan: chosen.key, seats, period }); setMessage({ tone: "ok", text: "Deneme başlatıldı" }); setAnnounce("Deneme başlatıldı"); }
    catch { setMessage({ tone: "error", text: "Başlatılamadı" }); }
    finally { setBusy(false); }
  };

  // Plan sınırları: kaydırıcı altında her planın başladığı durak.
  const marks = useMemo(() => plans.map(plan => ({ key: plan.key, name: plan.name, at: Math.max(0, stops.findIndex(stop => stop >= plan.fitsSeats[0])) })), [plans, stops]);

  if (loading || !plans.length) return <section className={styles.root} aria-busy={loading || undefined}>{loading ? <Skeleton label="Planlar yükleniyor" lines={6} /> : <p className={styles.empty}>Plan verisi yok.</p>}</section>;

  const total = chosen ? totalMinor(chosen, seats, period, yearlyDiscount) : 0;
  const seatPrice = chosen ? periodSeatMinor(chosen, seats, period, yearlyDiscount) : 0;
  const saved = chosen && period === "year" ? savingsMinor(chosen, seats, yearlyDiscount) : 0;

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}><h3 className={styles.title}>{title}</h3>{description && <p className={styles.description}>{description}</p>}</header>

    <div className={styles.controls}>
      <div className={styles.seatBox}>
        <label htmlFor={`${baseId}-seats`} className={styles.seatLabel}>Ekip büyüklüğü</label>
        <div className={styles.seatRow}>
          <button type="button" className={styles.step} onClick={() => setSeatsAt(index - 1)} disabled={index === 0} aria-label="Koltuk sayısını azalt">−</button>
          <span className={styles.seatCount} aria-hidden="true"><AnimatedCounter value={seats} /><small>koltuk</small></span>
          <button type="button" className={styles.step} onClick={() => setSeatsAt(index + 1)} disabled={index === stops.length - 1} aria-label="Koltuk sayısını artır">+</button>
        </div>
        <input id={`${baseId}-seats`} className={styles.slider} type="range" min={0} max={stops.length - 1} step={1} value={index} aria-valuetext={seatsText(seats)} onChange={event => setSeatsAt(Number(event.target.value))} />
        <div className={styles.marks} aria-hidden="true">{marks.map(mark => <span key={mark.key} style={{ left: `${stops.length > 1 ? (mark.at / (stops.length - 1)) * 100 : 0}%` }}>{mark.name}</span>)}</div>
      </div>
      <SegmentedControl label="Ödeme dönemi" value={period} onValueChange={changePeriod} options={[{ value: "month", label: "Aylık" }, { value: "year", label: `Yıllık · ${percentText(yearlyDiscount)} tasarruf` }]} />
    </div>

    <LayoutGroup id={baseId}>
      <div className={styles.cards}>
        {plans.map(plan => {
          const ok = sellable(plan, seats), isRec = plan.key === recommended, isChosen = plan.key === chosenKey;
          const perSeat = periodSeatMinor(plan, seats, period, yearlyDiscount), discount = volumeDiscountMinor(plan, seats);
          return <article key={plan.key} className={styles.card} data-chosen={isChosen || undefined} aria-label={plan.name}>
            {isChosen && <motion.span layoutId="frame" className={styles.frame} transition={spring} aria-hidden="true" />}
            <div className={styles.cardTop}><h4>{plan.name}</h4>{isRec && ok && <motion.span layoutId="badge" className={styles.badge} transition={spring}>Önerilen</motion.span>}</div>
            {plan.description && <p className={styles.planNote}>{plan.description}</p>}
            {ok ? <>
              <p className={styles.price}><span aria-label={`koltuk başına ${minorMoney(perSeat)}`}><AnimatedCounter value={majorOf(perSeat)} decimals={2} prefix="₺" /></span><small>koltuk / ay</small></p>
              <p className={styles.totalLine}><b>{minorMoney(totalMinor(plan, seats, period, yearlyDiscount))}</b> <span>{paymentNote(period, seats)}</span></p>
              {discount > 0 && <p className={styles.discount}>Hacim indirimi: koltuk başı {minorMoney(discount)} daha az</p>}
              <Button size="sm" variant={isChosen ? "primary" : "secondary"} aria-pressed={isChosen} onClick={() => choose(plan.key)}>{isChosen ? "Seçildi" : "Bu planı seç"}</Button>
            </> : <div className={styles.limit}>
              <p>{limitMessage(plan.maxSeats ?? 0, seats)}</p>
              <Button size="sm" variant="secondary" onClick={() => { const fit = [...stops].reverse().find(stop => stop <= (plan.maxSeats ?? 0)); if (fit !== undefined) setSeatsAt(stops.indexOf(fit)); }}>{plan.maxSeats} koltuğa dön</Button>
            </div>}
            <ul className={styles.features} aria-label={`${plan.name} özellikleri`}>
              <AnimatePresence initial={false}>
                {visibleFeatures(plan, seats).map(feature => <motion.li key={feature.label} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduced ? 0 : .22 }} style={{ overflow: "hidden" }}>✓ {feature.label}</motion.li>)}
              </AnimatePresence>
            </ul>
          </article>;
        })}
      </div>
    </LayoutGroup>

    {chosen && <div className={styles.summary} role="group" aria-label="Seçim özeti">
      <div>
        <p className={styles.summaryTitle}>{chosen.name}, {seatsText(seats)}</p>
        <p className={styles.summaryNote}>{minorMoney(seatPrice)}{" koltuk başına "}{periodWord(period)} {period === "year" ? "(aylık karşılığı)" : ""}</p>
        {saved > 0 && <p className={styles.savings}>Tasarruf ettiğiniz: <b>{minorMoney(saved)}</b> / yıl</p>}
      </div>
      <div className={styles.summaryTotal}><AnimatedCounter value={majorOf(total)} decimals={2} prefix="₺" /><small>/ {period === "year" ? "yıl" : "ay"}</small></div>
      <div className={styles.startBox}>
        <Button variant="primary" onClick={start} disabled={busy} loading={busy}>Denemeyi başlat</Button>
        <p className={styles.status} data-tone={message?.tone} role="status">{message?.text ?? ""}</p>
      </div>
    </div>}
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
  </section>;
}

export default PricingCalculator;
