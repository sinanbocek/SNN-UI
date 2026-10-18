"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, animate } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { motionTokens } from "../lib/motion-tokens";
import { Placeholder, srOnly } from "../lib/shop-parts";
import { exactText, priceText, toMajor, toMinor } from "../lib/shop-format";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { negativeText, payLabel, removeCodeLabel, summarize, taxLabel, totalSentence, type AutoDiscount, type PromoCode, type Summary } from "./checkout-summary-format";
import styles from "./checkout-summary.module.css";

export type { AutoDiscount, PromoCode, Summary };
export interface CheckoutItem { name: string; description?: string | undefined; /** Ana birimde TRY. */ price: number; /** Fiyatın yanındaki dönem notu ("yıllık"). */ periodNote?: string | undefined; photoAlt?: string | undefined; photoTone?: number | undefined }

/** Tek ürünlü bir siparişin ödemeden önceki son özeti için kullanın: ürün satırı, otomatik indirimler, kupon kodu (uygulanınca çipe döner), vergi, dönen toplam ve \"Öde\" düğmesi. Gerçek ödeme almaz; ödemeyi `onPay` ile uygulama bağlar. Kart numarası, son kullanma ve CVC alanı yoktur. Çok ürünlü sepet için `cart-drawer`. */
export interface CheckoutSummaryProps {
  item: CheckoutItem;
  discounts?: AutoDiscount[] | undefined;
  /** Vergi oranı (yüzde). Verilmezse "Vergi ödemede hesaplanır" yazılır. */
  taxRate?: number | null | undefined;
  /** Kuponu sunucuda doğrular; geçersizse null döner, ağ hatasında reddeder. */
  onApplyCoupon: (code: string) => Promise<PromoCode | null>;
  /** Ödemeyi başlatır (ya da barındırılan ödeme sayfasına yönlendirir); reddederse "Tekrar dene" yazılır. */
  onPay: (order: { coupon: PromoCode | null; summary: Summary }) => Promise<void>;
  /** true iken düğme görünür ama basılamaz (ödeme henüz açılmadı). */
  payDisabled?: boolean | undefined;
  footnote?: string | undefined;
}

export function CheckoutSummary({ item, discounts = [], taxRate = null, onApplyCoupon, onPay, payDisabled = false, footnote }: CheckoutSummaryProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const input = useRef<HTMLInputElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<PromoCode | null>(null);
  const [couponState, setCouponState] = useState<"idle" | "checking" | "invalid" | "error">("idle");
  const [pay, setPay] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [refocus, setRefocus] = useState(false);
  const summary = useMemo(() => summarize(toMinor(item.price), discounts, coupon, taxRate), [item.price, discounts, coupon, taxRate]);
  const problem = couponState === "invalid" || couponState === "error";

  useEffect(() => { if (refocus && !coupon) { input.current?.focus(); setRefocus(false); } }, [refocus, coupon]);

  const apply = async (event: FormEvent) => {
    event.preventDefault();
    const value = code.trim();
    if (!value || couponState === "checking") return;
    setCouponState("checking");
    try {
      const found = await onApplyCoupon(value);
      if (!found) {
        setCouponState("invalid");
        if (!reduced && field.current) animate(field.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: .35 });
        return;
      }
      setCoupon(found); setCouponState("idle"); setCode("");
    } catch { setCouponState("error"); }
  };
  const submit = async () => {
    if (pay === "busy" || pay === "done" || payDisabled) return;
    setPay("busy");
    try { await onPay({ coupon, summary }); setPay("done"); }
    catch { setPay("error"); }
  };

  const rowMotion = reduced ? { initial: false as const, exit: { opacity: 0 }, transition: { duration: 0 } } : { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, transition: motionTokens.spring.smooth };
  const label = pay === "busy" ? "İşleniyor" : pay === "done" ? "Ödendi" : pay === "error" ? "Tekrar dene" : payLabel(summary.totalMinor);
  const swap = reduced ? { duration: 0 } : { duration: motionTokens.duration.fast };

  return <section className={styles.root} aria-labelledby={`${uid}-title`} data-reduced={reduced || undefined}>
    <h2 id={`${uid}-title`} className={styles.title}>Sipariş özeti</h2>
    <div className={styles.item}>
      <Placeholder tone={item.photoTone ?? 0} label={item.photoAlt ?? `${item.name} (yer tutucu)`} ratio="1 / 1" className={styles.photo} />
      <div className={styles.itemText}><p className={styles.itemName}>{item.name}</p>{item.description && <p className={styles.itemDesc}>{item.description}</p>}</div>
      <p className={styles.itemPrice}>{priceText(item.price)}{item.periodNote && <span>{item.periodNote}</span>}</p>
    </div>

    <form className={styles.promo} onSubmit={apply} noValidate>
      <AnimatePresence mode="wait" initial={false}>
        {coupon ? <motion.p key="chip" className={styles.chip} initial={reduced ? false : { opacity: 0, scale: .92, filter: "blur(3px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={swap}>
          <span>{coupon.code}</span>
          <button type="button" aria-label={removeCodeLabel(coupon.code)} onClick={() => { setCoupon(null); setRefocus(true); }}>✕</button>
        </motion.p>
          : <motion.div key="field" ref={field} initial={false} exit={{ opacity: 0 }} transition={swap}>
            <label htmlFor={`${uid}-code`} className={srOnly}>Kupon kodu</label>
            <div className={styles.promoRow}>
              <input ref={input} id={`${uid}-code`} placeholder="Kupon kodu" value={code} autoComplete="off" aria-invalid={problem || undefined} aria-describedby={problem ? `${uid}-error` : undefined}
                onChange={event => { setCode(event.target.value); if (couponState !== "checking") setCouponState("idle"); }} />
              <Button type="submit" size="sm" variant="secondary" loading={couponState === "checking"}>Uygula</Button>
            </div>
            {problem && <p id={`${uid}-error`} className={styles.error} role="alert">{couponState === "invalid" ? "Bu kupon geçerli değil." : "Kupon şu an doğrulanamadı."}</p>}
          </motion.div>}
      </AnimatePresence>
    </form>

    <dl className={styles.lines}>
      <div><dt>Ara toplam</dt><dd>{exactText(summary.subtotalMinor)}</dd></div>
      <AnimatePresence initial={false}>
        {summary.discounts.map(discount => <motion.div key={discount.id} className={styles.discount} {...rowMotion}><dt>{discount.label}</dt><dd>{negativeText(discount.minor)}</dd></motion.div>)}
        {coupon && summary.couponMinor > 0 && <motion.div key="coupon" className={styles.discount} {...rowMotion}><dt>Kupon · {coupon.code}</dt><dd>{negativeText(summary.couponMinor)}</dd></motion.div>}
      </AnimatePresence>
      <div><dt>{taxRate === null ? "Vergi" : taxLabel(taxRate)}</dt><dd>{summary.taxMinor === null ? <span className={styles.muted}>ödemede hesaplanır</span> : exactText(summary.taxMinor)}</dd></div>
    </dl>
    <p className={styles.total}><span>Toplam</span>
      <span className={srOnly}>{totalSentence(summary.totalMinor)}</span>
      <b aria-hidden="true"><AnimatedCounter value={toMajor(summary.totalMinor)} decimals={2} prefix="₺" /></b></p>

    <div aria-live="polite" className={styles.payWrap}>
      <Button variant="primary" className={styles.pay} disabled={payDisabled} loading={pay === "busy"} aria-busy={pay === "busy"} aria-disabled={payDisabled || pay === "done" || undefined} onClick={submit}>
        <AnimatePresence mode="wait" initial={false}><motion.span key={label} className={styles.payLabel} initial={reduced ? false : { opacity: 0, y: "0.4em", filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={swap}>{pay === "done" ? "✓ " : ""}{label}</motion.span></AnimatePresence>
      </Button>
      {pay === "error" && <p className={styles.error} role="alert">Ödeme tamamlanamadı. Tekrar deneyebilirsiniz.</p>}
    </div>
    <p className={styles.secure}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg> Şifreli ödeme</p>
    {footnote && <p className={styles.footnote}>{footnote}</p>}
  </section>;
}

export default CheckoutSummary;
