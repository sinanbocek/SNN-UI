"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { SlotText } from "../slot-text/slot-text";
import { breakdown, majorOf, minorMoney, newFeatures, overageText, percentText, pricePerMillion, recommendPlan, recommendationAnnouncement, scalePosition, seatsText, usageFull, usageShort, type BillingPeriod, type UsagePlan } from "./usage-pricing-format";
import styles from "./usage-pricing.module.css";

export type { BillingPeriod, UsagePlan };
export interface UsageSelection { plan: string; seats: number; usage: number; period: BillingPeriod }

/** Fiyatı koltuk sayısı ve ölçülen kullanıma (aylık istek gibi) bağlı bir ürün için "faturanız ne kadar olur" tahminini vermek ve en uygun planı önermek için kullanın; yalnız koltuğa göre fiyat için fiyat hesaplayıcı, mevcut müşterinin dönem içi tahmini için kullanım tahmini daha doğrudur. */
export interface UsagePricingProps {
  /** Planlar, küçükten büyüğe. Fiyat tablosunu uygulama verir. */
  plans: UsagePlan[];
  /** Koltuk kaydırıcısının durakları (artan). */
  seatStops: number[];
  /** Kullanım kaydırıcısının durakları (artan), örneğin [100000, 1000000, 5000000, 15000000]. */
  usageStops: number[];
  /** Kullanımın adı: "Aylık istek". Değer metninde "istek" sonekiyle okunur. */
  usageLabel?: string;
  /** Değer metinlerindeki birim: "istek". */
  usageUnit?: string;
  defaultSeats?: number;
  defaultUsage?: number;
  yearlyDiscount?: number;
  title?: string;
  description?: string;
  /** En üst plan aşılınca gösterilen yönlendirme. */
  contactText?: string;
  /** "Denemeyi başlat": reddederse satır içi "Başlatılamadı" yazılır ve yeniden denenir. */
  onStartTrial: (selection: UsageSelection) => Promise<void>;
  loading?: boolean;
}

function nearest(stops: number[], value: number | undefined, fallback: number) {
  const at = value === undefined ? -1 : stops.indexOf(value);
  return at >= 0 ? at : Math.min(fallback, Math.max(stops.length - 1, 0));
}

export function UsagePricing({ plans, seatStops, usageStops, usageLabel = "Aylık istek", usageUnit = "istek", defaultSeats, defaultUsage, yearlyDiscount = 20, title = "Faturanızı tahmin edin", description, contactText = "Özel teklif için bize ulaşın", onStartTrial, loading = false }: UsagePricingProps) {
  const reduced = useReducedMotionSafe();
  const baseId = useId();
  const [seatAt, setSeatAt] = useState(() => nearest(seatStops, defaultSeats, 2));
  const [usageAt, setUsageAt] = useState(() => nearest(usageStops, defaultUsage, 2));
  const [period, setPeriod] = useState<BillingPeriod>("month");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [announce, setAnnounce] = useState("");
  const seats = seatStops[seatAt] ?? 1, usage = usageStops[usageAt] ?? 0;
  const plan = recommendPlan(plans, seats, usage);
  const detail = plan ? breakdown(plan, seats, usage, period, yearlyDiscount) : null;
  const monthDetail = plan ? breakdown(plan, seats, usage, "year", yearlyDiscount) : null;

  // Önerilen plan değişince duyurulur.
  const lastPlan = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const key = plan?.key ?? null;
    if (lastPlan.current !== undefined && lastPlan.current !== key) setAnnounce(recommendationAnnouncement(plan, seats, usage, usageUnit));
    lastPlan.current = key;
  }, [plan, seats, usage, usageUnit]);

  // Plan geçiş işaretleri: kaydırıcı izinde önerilen planın değiştiği duraklar.
  const seatMarks = useMemo(() => marksFor(seatStops, stop => recommendPlan(plans, stop, usage)), [plans, seatStops, usage]);
  const usageMarks = useMemo(() => marksFor(usageStops, stop => recommendPlan(plans, seats, stop)), [plans, usageStops, seats]);

  const start = async () => {
    if (!plan) return;
    setBusy(true); setMessage(null);
    try { await onStartTrial({ plan: plan.key, seats, usage, period }); setMessage({ tone: "ok", text: "Deneme başlatıldı" }); setAnnounce("Deneme başlatıldı"); }
    catch { setMessage({ tone: "error", text: "Başlatılamadı" }); }
    finally { setBusy(false); }
  };
  const fresh = plan ? newFeatures(plans, plan) : new Set<string>();

  if (loading || !plans.length) return <section className={styles.root} aria-busy={loading || undefined}>{loading ? <Skeleton label="Plan tablosu yükleniyor" lines={6} /> : <p className={styles.empty}>Plan tablosu yok.</p>}</section>;

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}><h3 className={styles.title}>{title}</h3>{description && <p className={styles.description}>{description}</p>}</header>
    <div className={styles.layout}>
      <div className={styles.controls}>
        <div className={styles.slider}>
          <div className={styles.sliderHead}><label htmlFor={`${baseId}-seats`}>Ekip büyüklüğü</label><b>{seatsText(seats)}</b></div>
          <input id={`${baseId}-seats`} type="range" min={0} max={seatStops.length - 1} step={1} value={seatAt} aria-valuetext={seatsText(seats)} onChange={event => { setSeatAt(Number(event.target.value)); setMessage(null); }} />
          <div className={styles.marks} aria-hidden="true">{seatMarks.map(mark => <span key={mark.at} style={{ left: `${seatStops.length > 1 ? (mark.at / (seatStops.length - 1)) * 100 : 0}%` }}>{mark.name}</span>)}</div>
        </div>
        <div className={styles.slider}>
          <div className={styles.sliderHead}><label htmlFor={`${baseId}-usage`}>{usageLabel}</label><b>{usageShort(usage)}</b></div>
          <input id={`${baseId}-usage`} type="range" min={0} max={usageStops.length - 1} step={1} value={usageAt} aria-valuetext={`${usageFull(usage)} ${usageUnit}`} onChange={event => { setUsageAt(Number(event.target.value)); setMessage(null); }} />
          <div className={styles.marks} aria-hidden="true">{usageMarks.map(mark => <span key={mark.at} style={{ left: `${usageStops.length > 1 ? (mark.at / (usageStops.length - 1)) * 100 : 0}%` }}>{mark.name}</span>)}</div>
        </div>
        <div className={styles.periodRow}>
          <SegmentedControl label="Ödeme dönemi" value={period} onValueChange={value => { setPeriod(value as BillingPeriod); setAnnounce(value === "year" ? "Yıllık ödeme" : "Aylık ödeme"); }} options={[{ value: "month", label: "Aylık" }, { value: "year", label: `Yıllık · ${percentText(yearlyDiscount)} tasarruf` }]} />
          {period === "year" && monthDetail && <span className={styles.savings}>Yıllık tasarruf: <b>{minorMoney(monthDetail.savingsMinor)}</b></span>}
        </div>
      </div>

      <motion.div layout={!reduced} className={styles.card} aria-label="Önerilen plan" role="region" transition={{ duration: reduced ? 0 : .3 }}>
        {!plan || !detail ? <div className={styles.contact}><b>{contactText}</b><p>Seçtiğiniz koltuk sayısı hiçbir planın sınırına sığmıyor.</p></div> : <>
          <p className={styles.planLabel}>Önerilen plan</p>
          <h4 className={styles.planName}><SlotText value={plan.name} /></h4>
          <p className={styles.reason}>{seatsText(seats)} ve {usageShort(usage)} {usageUnit} için en düşük toplam bu planda.</p>
          <p className={styles.amount}><AnimatedCounter value={majorOf(detail.monthlyMinor)} decimals={2} prefix="₺" /><small>/ ay</small></p>
          <p className={styles.note}>{period === "year" ? `Yıllık olarak ödenir: ${minorMoney(detail.periodMinor)}` : "Aylık ödenir, kullanım dahil"}</p>
          <ul className={styles.features}><AnimatePresence initial={false}>
            {plan.features.map(feature => <motion.li key={feature} layout={!reduced} initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : .22 }} style={{ overflow: "hidden" }}>✓ {feature}{fresh.has(feature) && <em> yeni</em>}</motion.li>)}
          </AnimatePresence></ul>
          <Button variant="primary" onClick={start} disabled={busy} loading={busy}>Denemeyi başlat</Button>
          <p className={styles.status} data-tone={message?.tone} role="status">{message?.text ?? ""}</p>
        </>}
      </motion.div>
    </div>

    {plan && detail && <section className={styles.breakdown} aria-label="Döküm">
      <h4>Döküm</h4>
      <dl>
        <div><dt>Koltuk</dt><dd>{seatsText(seats)} × {minorMoney(Math.round(plan.seatPrice * 100))} = <b>{minorMoney(detail.seatLineMinor)}</b></dd></div>
        <div><dt>Kullanım</dt><dd>{detail.overage > 0 ? <>{overageText(detail.overage)} aşım × {pricePerMillion(plan)} = <b>{minorMoney(detail.overageLineMinor)}</b></> : <>Dahil ({usageShort(plan.includedUsage)} {usageUnit}) = <b>{minorMoney(0)}</b></>}</dd></div>
        <div className={styles.totalRow}><dt>Tahmini toplam, vergi öncesi{period === "year" ? " (yıllık)" : " (aylık)"}</dt><dd><b>{minorMoney(detail.periodMinor)}</b></dd></div>
      </dl>
      <div className={styles.scale} aria-hidden="true"><span style={{ width: `${(scalePosition(plans, plan) * 100) || 6}%` }} /></div>
    </section>}
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
  </section>;
}

function marksFor(stops: number[], pick: (stop: number) => UsagePlan | null) {
  const marks: { at: number; name: string }[] = [];
  let previous: string | null | undefined;
  stops.forEach((stop, at) => { const plan = pick(stop); const key = plan?.key ?? null; if (key !== previous) { marks.push({ at, name: plan?.name ?? "Özel" }); previous = key; } });
  return marks;
}

export default UsagePricing;
