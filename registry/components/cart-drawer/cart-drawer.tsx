"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { Drawer, DrawerContent } from "../drawer/drawer";
import { EmptyState } from "../empty-state/empty-state";
import { motionTokens } from "../lib/motion-tokens";
import { FramedPhoto, NumberStepper, srOnly, useAnnouncer } from "../lib/shop-parts";
import { exactText, toMajor } from "../lib/shop-format";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { addLine, addedText, cartButtonLabel, cartTotals, couponAppliedText, discountOf, lineTotalText, orderText, quantityOf, removedText, setQuantity, shippingText, unitPriceText, type CartLine, type CartPhoto, type CartProduct, type Coupon, type ShippingRule, type Totals } from "./cart-drawer-format";
import styles from "./cart-drawer.module.css";

export type { CartLine, CartPhoto, CartProduct, Coupon, ShippingRule, Totals };

/** Birden çok ürün ekleyen mağaza sayfaları için kullanın: ürün ızgarası, sepet düğmesine uçan fotoğraf, yandan açılan sepet çekmecesi (adet, kaydırarak silme, ücretsiz kargo çubuğu, kupon, toplam, sipariş düğmesi). Gerçek ödeme yapmaz: kupon doğrulamasını ve siparişi uygulama bağlar, kargo ve kupon kuralları uygulamadan gelir. Kart numarası, son kullanma, CVC bu blokta yoktur. */
export interface CartDrawerProps {
  products: CartProduct[];
  defaultLines?: CartLine[] | undefined;
  shipping: ShippingRule;
  /** Kuponu sunucuda doğrular; geçersizse null döner, ağ hatasında reddeder. */
  onApplyCoupon: (code: string) => Promise<Coupon | null>;
  /** Siparişi tamamlar; reddederse "Tekrar dene" yazılır. */
  onCheckout: (order: { lines: CartLine[]; coupon: Coupon | null; totals: Totals }) => Promise<void>;
  onChange?: ((lines: CartLine[]) => void) | undefined;
}

interface Flight { id: number; from: DOMRect; to: DOMRect; photo: CartPhoto }

function Picture({ photo, ratio = "1 / 1", className }: { photo: CartPhoto; ratio?: string | undefined; className?: string | undefined }) {
  return <FramedPhoto src={photo.src} alt={photo.alt} ratio={ratio} position={photo.position} tone={photo.tone} eager className={className} />;
}

function Row({ line, reduced, onQuantity, onRemove }: { line: CartLine; reduced: boolean; onQuantity: (quantity: number) => void; onRemove: () => void }) {
  return <motion.li layout={!reduced} className={styles.row} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0, marginBottom: 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}>
    <span className={styles.reveal} aria-hidden="true">Kaldır</span>
    <motion.div className={styles.rowInner} drag={reduced ? false : "x"} dragDirectionLock dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: .6, right: 0 }} dragSnapToOrigin
      onDragEnd={(_, info) => { if (info.offset.x < -96 || info.velocity.x < -600) onRemove(); }}>
      <Picture photo={line.photo} className={styles.thumb} />
      <div className={styles.rowText}>
        <p className={styles.rowName}>{line.name}</p>
        {line.description && <p className={styles.rowDesc}>{line.description}</p>}
        <p className={styles.rowPrice}>{unitPriceText(line.price)}</p>
      </div>
      <div className={styles.rowSide}>
        <span className={styles.lineTotal}>{lineTotalText(line)}</span>
        <NumberStepper label={`${line.name} adedi`} value={line.quantity} min={1} max={20} onChange={onQuantity} onRemove={onRemove} />
      </div>
    </motion.div>
  </motion.li>;
}

export function CartDrawer({ products, defaultLines = [], shipping, onApplyCoupon, onCheckout, onChange }: CartDrawerProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [lines, setLines] = useState<CartLine[]>(defaultLines);
  const [open, setOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [code, setCode] = useState("");
  const [couponState, setCouponState] = useState<"idle" | "checking" | "invalid" | "error">("idle");
  const [pay, setPay] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [receipt, setReceipt] = useState<{ lines: CartLine[]; totals: Totals } | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bump, setBump] = useState(0);
  const cartButton = useRef<HTMLButtonElement>(null);
  const flightId = useRef(0);
  const [liveOut, announceOut] = useAnnouncer();
  const [liveIn, announceIn] = useAnnouncer();
  const announce = (message: string) => (open ? announceIn : announceOut)(message);

  const totals = useMemo(() => cartTotals(lines, shipping, coupon), [lines, shipping, coupon]);
  const shown = quantityOf(lines) - flights.length;
  const update = (next: CartLine[]) => { setLines(next); onChange?.(next); };

  const add = (product: CartProduct, source: HTMLElement | null) => {
    update(addLine(lines, product));
    announce(addedText(product.name));
    const target = cartButton.current;
    if (reduced || !source || !target) { setBump(value => value + 1); return; }
    flightId.current += 1;
    setFlights(current => [...current, { id: flightId.current, from: source.getBoundingClientRect(), to: target.getBoundingClientRect(), photo: product.photo }]);
  };
  const land = (id: number) => { setFlights(current => current.filter(flight => flight.id !== id)); setBump(value => value + 1); };
  useEffect(() => { if (bump && cartButton.current && !reduced) animate(cartButton.current, { scale: [1, 1.12, 1] }, { duration: .3 }); }, [bump, reduced]);

  const remove = (line: CartLine) => { update(setQuantity(lines, line.id, 0)); announce(removedText(line.name)); };
  const applyCoupon = async (event: FormEvent) => {
    event.preventDefault();
    const value = code.trim();
    if (!value || couponState === "checking") return;
    setCouponState("checking");
    try {
      const found = await onApplyCoupon(value);
      if (!found) { setCouponState("invalid"); announce("Bu kupon geçerli değil."); return; }
      setCoupon(found); setCouponState("idle"); setCode("");
      announce(couponAppliedText(found.code, discountOf(totals.subtotalMinor, found)));
    } catch { setCouponState("error"); announce("Kupon şu an doğrulanamadı."); }
  };
  const checkout = async () => {
    if (pay === "busy" || !lines.length) return;
    setPay("busy");
    try { await onCheckout({ lines, coupon, totals }); setReceipt({ lines, totals }); setPay("done"); announce(orderText(totals.totalMinor)); }
    catch { setPay("error"); announce("Sipariş tamamlanamadı. Tekrar deneyebilirsiniz."); }
  };
  const finish = () => { setOpen(false); update([]); setCoupon(null); setReceipt(null); setPay("idle"); };
  const busy = pay === "busy";
  const invalid = couponState === "invalid";

  return <div className={styles.root} data-reduced={reduced || undefined}>
    <header className={styles.top}>
      <h2 className={styles.title}>Mağaza</h2>
      <button ref={cartButton} type="button" className={styles.cartButton} aria-haspopup="dialog" aria-expanded={open} aria-label={cartButtonLabel(quantityOf(lines))} onClick={() => setOpen(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11H6.2z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
        <span className={styles.cartLabel} aria-hidden="true">Sepet</span>
        <span className={styles.badge} aria-hidden="true"><AnimatedCounter value={Math.max(0, shown)} /></span>
      </button>
    </header>
    <ul className={styles.grid}>{products.map(product => <li key={product.id} className={styles.card}>
      <div data-photo><Picture photo={product.photo} className={styles.cardPhoto} ratio="4 / 3" /></div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{product.name}</h3>
        {product.description && <p className={styles.cardDesc}>{product.description}</p>}
        <p className={styles.cardPrice}>{unitPriceText(product.price)}</p>
        <Button size="sm" variant="secondary" onClick={event => add(product, event.currentTarget.closest("li")?.querySelector<HTMLElement>("[data-photo]") ?? null)} aria-label={`Sepete ekle: ${product.name}`}>Sepete ekle</Button>
      </div>
    </li>)}</ul>
    {liveOut}
    {typeof document !== "undefined" && createPortal(<>{flights.map(flight => {
      const dx = flight.to.left + flight.to.width / 2 - (flight.from.left + flight.from.width / 2), dy = flight.to.top + flight.to.height / 2 - (flight.from.top + flight.from.height / 2);
      return <motion.div key={flight.id} className={styles.flight} aria-hidden="true" style={{ left: flight.from.left, top: flight.from.top, width: flight.from.width, height: flight.from.height }}
        initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }} animate={{ x: [0, dx * .55, dx], y: [0, Math.min(0, dy) * .3 - 70, dy], scale: [1, .5, .12], rotate: [0, -8, 14] }} transition={{ duration: .7, ease: "easeInOut", times: [0, .5, 1] }} onAnimationComplete={() => land(flight.id)}>
        <Picture photo={flight.photo} ratio={`${flight.from.width} / ${flight.from.height}`} />
      </motion.div>;
    })}</>, document.body)}

    <Drawer open={open} onOpenChange={next => { if (!next && busy) return; setOpen(next); }}>
      <DrawerContent side="right" title="Sepet" description={lines.length ? `${cartButtonLabel(quantityOf(lines))}` : "Sepetiniz boş"} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} className={styles.sheet}>
        <div className={styles.sheetBody}>
          {pay === "done" && receipt ? <div className={styles.done} role="group" aria-label="Sipariş özeti">
            <motion.div layoutId={`${uid}-pay`} className={styles.check}><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : .4, delay: .15 }} /></svg></motion.div>
            <h3>Siparişiniz alındı</h3>
            <ul className={styles.receipt}>{receipt.lines.map(line => <li key={line.id}><span>{line.name} × {line.quantity}</span><span>{lineTotalText(line)}</span></li>)}<li className={styles.receiptTotal}><span>Toplam</span><b>{exactText(receipt.totals.totalMinor)}</b></li></ul>
            <Button variant="secondary" onClick={finish}>Kapat</Button>
          </div> : lines.length === 0 ? <EmptyState title="Sepetiniz boş" description="Beğendiğiniz ürünleri sepete ekleyin." action={<Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Alışverişe dön</Button>} />
            : <>
              <div className={styles.lines} inert={busy || undefined}>
                <div className={styles.shipping}>
                  <p>{shippingText(totals)}</p>
                  <div className={styles.meter} role="progressbar" aria-label="Ücretsiz kargo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(totals.progress * 100)} aria-valuetext={shippingText(totals)}><motion.i animate={{ scaleX: totals.progress }} initial={false} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth} /></div>
                </div>
                <ul className={styles.list}><AnimatePresence initial={false}>{lines.map(line => <Row key={line.id} line={line} reduced={reduced} onQuantity={quantity => update(setQuantity(lines, line.id, quantity))} onRemove={() => remove(line)} />)}</AnimatePresence></ul>
                <form className={styles.coupon} onSubmit={applyCoupon} noValidate>
                  {coupon ? <p className={styles.chip}><span>{coupon.code}</span><button type="button" aria-label={`Kuponu kaldır: ${coupon.code}`} onClick={() => setCoupon(null)}>✕</button></p>
                    : <><label className={styles.couponLabel} htmlFor={`${uid}-code`}>Kupon kodu</label>
                      <div className={styles.couponRow}>
                        <input id={`${uid}-code`} value={code} autoComplete="off" aria-invalid={invalid || undefined} aria-describedby={invalid || couponState === "error" ? `${uid}-note` : undefined} onChange={event => { setCode(event.target.value); if (couponState !== "checking") setCouponState("idle"); }} />
                        <Button type="submit" size="sm" variant="secondary" loading={couponState === "checking"}>Uygula</Button>
                      </div>
                      <p id={`${uid}-note`} className={styles.note} data-error={invalid || couponState === "error" || undefined} role={invalid || couponState === "error" ? "alert" : undefined}>{invalid ? "Bu kupon geçerli değil." : couponState === "error" ? "Kupon şu an doğrulanamadı." : ""}</p></>}
                </form>
                <dl className={styles.totals}>
                  <div><dt>Ara toplam</dt><dd>{exactText(totals.subtotalMinor)}</dd></div>
                  <div><dt>Kargo</dt><dd>{totals.shippingMinor ? exactText(totals.shippingMinor) : "Ücretsiz"}</dd></div>
                  {totals.discountMinor > 0 && <div><dt>Kupon indirimi</dt><dd>-{exactText(totals.discountMinor)}</dd></div>}
                  <div className={styles.grand}><dt>Toplam</dt><dd><span className={srOnly}>{exactText(totals.totalMinor)}</span><span aria-hidden="true"><AnimatedCounter value={toMajor(totals.totalMinor)} decimals={2} prefix="₺" /></span></dd></div>
                </dl>
              </div>
              <div className={styles.payRow}>
                <motion.div layoutId={`${uid}-pay`} className={styles.payWrap}>
                  <Button variant="primary" className={styles.pay} loading={busy} aria-busy={busy} onClick={checkout}>{busy ? "İşleniyor" : pay === "error" ? "Tekrar dene" : "Siparişi tamamla"}</Button>
                </motion.div>
                {pay === "error" && <p className={styles.note} data-error="" role="alert">Sipariş tamamlanamadı.</p>}
              </div>
            </>}
        </div>
        {liveIn}
      </DrawerContent>
    </Drawer>
  </div>;
}

export default CartDrawer;
