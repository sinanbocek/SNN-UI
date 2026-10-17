"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { animate, AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "../button/button";
import SegmentedControl from "../segmented-control/segmented-control";
import { Switch } from "../switch/switch";
import { motionTokens } from "../lib/motion-tokens";
import { currencyPrefix, formatAmount, maxSavingsPercent, planPrice, type BillingPeriod, type PlanId } from "./plan-comparison-format";
import styles from "./plan-comparison.module.css";

/** Plan görünen adları ve kısa tanımları. */
const PLAN_NAMES: Record<PlanId, string> = { team: "Takım", studio: "Stüdyo" };
const PLAN_TAGLINES: Record<PlanId, string> = { team: "Küçük ekipler için", studio: "Birden çok ekibin işi için" };

const INCLUDED = "Dahil";
const NOT_INCLUDED = "Dahil değil";
type Feature = { label: string; team: string; studio: string; shared?: boolean };

const features: Feature[] = [
  { label: "Etkin projeler", team: "Sınırsız", studio: "Sınırsız", shared: true },
  { label: "Ortak çalışma alanları", team: "1 alan", studio: "Sınırsız" },
  { label: "Konuk inceleyiciler", team: "Projede 5", studio: "Sınırsız" },
  { label: "Sürüm geçmişi", team: "30 gün", studio: "Sınırsız" },
  { label: "Onay akışları", team: NOT_INCLUDED, studio: INCLUDED },
  { label: "Özel roller", team: NOT_INCLUDED, studio: INCLUDED },
  { label: "Kaynak dışa aktarma", team: INCLUDED, studio: INCLUDED, shared: true },
  { label: "Destek", team: "E-posta", studio: "Öncelikli e-posta" },
];

function Value({ text }: { text: string }) {
  if (text === INCLUDED) return <span className={styles.included}><Check size={16} strokeWidth={1.75} aria-hidden="true" />{INCLUDED}</span>;
  return <span className={text === NOT_INCLUDED ? styles.unavailable : undefined}>{text}</span>;
}

/** Sayıya dönen metin. `format` verilirse gösterilen tam sayı onunla yazılır (ör. binlik ayraç). */
function AnimatedNumber({ value, format }: { value: number; format?: (value: number) => string }) {
  const reduce = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (reduce) {
      previousValue.current = value;
      return;
    }

    const controls = animate(previousValue.current, value, {
      duration: motionTokens.duration.standard,
      ease: [...motionTokens.ease.enter],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });

    previousValue.current = value;
    return () => controls.stop();
  }, [reduce, value]);

  const shown = reduce ? value : displayValue;
  return <>{format ? format(shown) : shown}</>;
}

export function PlanComparison() {
  const id = useId();
  const reduce = useReducedMotion();
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [selected, setSelected] = useState<PlanId | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState<"lg" | "md" | "sm" | "xs">("lg");
  useLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const measure = (width: number) => setSize(width <= 340 ? "xs" : width <= 540 ? "sm" : width <= 720 ? "md" : "lg");
    measure(node.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => { if (entry) measure(entry.contentRect.width); });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const visibleFeatures = differencesOnly ? features.filter((feature) => !feature.shared) : features;

  return (
    <section ref={rootRef} className={styles.comparison} data-size={size} aria-labelledby={`${id}-title`}>
      <div className={styles.intro}>
        <div><h2 id={`${id}-title`}>Çalışma biçiminize yer var</h2><p>Yalnızca planlar arasında değişen ayrıntılar. Ne ödeyeceğinizi görmek için faturalama dönemini değiştirin.</p></div>
        <div className={styles.billing}><SegmentedControl label="Faturalama dönemi" value={billing} onValueChange={(value) => setBilling(value as BillingPeriod)} options={[{ value: "monthly", label: "Aylık" }, { value: "yearly", label: "Yıllık" }]} /><small>{billing === "yearly" ? `Yıllık faturalanır, en çok %${maxSavingsPercent()} indirim` : "Ay ay faturalanır"}</small></div>
      </div>

      <div className={styles.filter}><div><h3>Planları karşılaştır</h3><span className={styles.featureCount}><AnimatedNumber value={visibleFeatures.length} /> / {features.length} özellik</span></div><Switch checked={differencesOnly} onCheckedChange={setDifferencesOnly} label="Yalnızca farkları göster" /></div>

      <div className={styles.matrix} role="table" aria-label="Takım ve Stüdyo planı karşılaştırması">
        <div className={styles.planHeader} role="row">
          <div className={styles.featureHeader} role="columnheader">Ne değişiyor</div>
          {(["team", "studio"] as const).map((plan) => (
            <div key={plan} className={`${styles.planCell} ${selected === plan ? styles.planSelected : ""}`} role="columnheader" aria-label={`${PLAN_NAMES[plan]} planı`}>
              <div className={styles.planTop}><h3>{PLAN_NAMES[plan]}</h3><span>{PLAN_TAGLINES[plan]}</span></div>
              <div className={styles.price}><span className={styles.priceValue} aria-live="polite" aria-atomic="true">{currencyPrefix()}<AnimatedNumber value={planPrice(plan, billing)} format={formatAmount} /></span><span className={styles.pricePeriod}>kullanıcı başına / ay</span></div>
              <Button type="button" variant={selected === plan ? "primary" : "secondary"} className={styles.selectButton} aria-pressed={selected === plan} onClick={() => setSelected(current => current === plan ? null : plan)}>{selected === plan ? "Seçildi" : `${PLAN_NAMES[plan]} planını seç`}</Button>
              {selected === plan && <motion.span className={styles.selectedRail} layoutId={`${id}-selected-rail`} transition={reduce ? { duration: 0 } : motionTokens.spring.responsive} aria-hidden="true" />}
            </div>
          ))}
        </div>

        <div className={styles.rows} role="rowgroup">
          <AnimatePresence initial={false}>
            {visibleFeatures.map((feature) => (
              <motion.div key={feature.label} className={styles.featureRow} role="row" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } } }} transition={reduce ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], delay: .04 } }}>
                <div className={styles.featureName} role="rowheader">{feature.label}</div>
                <div className={`${styles.featureValue} ${selected === "team" ? styles.valueSelected : ""}`} role="cell"><span className={styles.mobilePlan}>{PLAN_NAMES.team}</span><Value text={feature.team} /></div>
                <div className={`${styles.featureValue} ${selected === "studio" ? styles.valueSelected : ""}`} role="cell"><span className={styles.mobilePlan}>{PLAN_NAMES.studio}</span><Value text={feature.studio} /></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className={styles.footer}><span>Fiyatlar kullanıcı başına TRY cinsindendir. Yıllık planlar yıllık faturalanır.</span><p className={styles.srOnly} role="status" aria-live="polite">{selected ? `${PLAN_NAMES[selected]} planı seçildi` : ""}</p></div>
    </section>
  );
}

export default PlanComparison;
