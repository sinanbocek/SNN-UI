"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { motionTokens } from "../lib/motion-tokens";
import { srOnly, useAnnouncer } from "../lib/shop-parts";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { HINT, balanceText, cardLabel, counterText, dragStep, expiryText, maskedNumber, placeOf, stepFront, transactionText, visibleCards, type CardMaterial, type CardTransaction, type WalletCard } from "./wallet-stack-format";
import styles from "./wallet-stack.module.css";

export type { CardMaterial, CardTransaction, WalletCard };

/** Birkaç ödeme ya da üyelik kartını üst üste duran bir deste olarak göstermek için kullanın: üstüne gelince deste açılır, sürükleyerek ya da oklarla dönülür, karta basınca kart öne çıkıp bakiyesini ve son hareketlerini gösterir. **Yalnız bir görünümdür: gerçek kart numarası tutmaz ve göstermez (yalnız son dört hane), gerçek ödeme yapmaz.** Kart ekleme/silme, çok sayıda hesap listesi ve kart girişi kapsam dışıdır (`wallet-card` hesap özeti içindir). En çok altı kart çizilir. */
export interface WalletStackProps {
  title?: string;
  cards: WalletCard[];
  /** Öne gelen ya da açılan kart değişince çağrılır. */
  onFrontChange?: (card: WalletCard, index: number) => void;
}

function Face({ card }: { card: WalletCard }) {
  return <span className={styles.face} data-material={card.material ?? "flat"} aria-hidden="true">
    <span className={styles.shine} />
    <span className={styles.top}><b>{card.issuer}</b><i>{card.network ?? ""}</i></span>
    <span className={styles.product}>{card.product}</span>
    <span className={styles.number}>{maskedNumber(card.last4)}</span>
    <span className={styles.bottom}><span>{card.holder}</span><span>Son kullanma <b>{expiryText(card.expiry)}</b></span></span>
  </span>;
}

export function WalletStack({ title = "Kartlarım", cards: all, onFrontChange }: WalletStackProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const cards = visibleCards(all);
  const [front, setFront] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const [fan, setFan] = useState(false);
  const [live, announce] = useAnnouncer();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const tiltX = useMotionValue(0), tiltY = useMotionValue(0);
  const rotateX = useTransform(tiltY, [-1, 1], [6, -6]), rotateY = useTransform(tiltX, [-1, 1], [-8, 8]);
  const open = cards.find(card => card.id === openId) ?? null;
  const spring = reduced ? { duration: 0 } : motionTokens.spring.smooth;

  const goto = (next: number, focus = true) => {
    const target = Math.min(cards.length - 1, Math.max(0, next));
    if (target === front) return;
    setFront(target);
    onFrontChange?.(cards[target]!, target);
    announce(`${counterText(target, cards.length)}: ${cards[target]!.issuer}, ${cards[target]!.product}`);
    if (focus) requestAnimationFrame(() => refs.current[target]?.focus());
  };
  const openCard = (index: number) => {
    setOpenId(cards[index]!.id); setFront(index);
    announce(`${cards[index]!.issuer}, ${cards[index]!.product} açıldı. Bakiye ${balanceText(cards[index]!)}.`);
  };
  const close = () => {
    const index = front;
    setOpenId(null);
    announce("Tüm kartlar gösteriliyor.");
    requestAnimationFrame(() => refs.current[index]?.focus());
  };
  const key = (event: KeyboardEvent, index: number) => {
    if (event.key === "Escape" && open) { event.preventDefault(); close(); return; }
    const next = stepFront(event.key, index, cards.length);
    if (next !== index || ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (open) { setOpenId(cards[next]!.id); setFront(next); onFrontChange?.(cards[next]!, next); announce(`${cards[next]!.issuer}, ${cards[next]!.product} açıldı.`); requestAnimationFrame(() => refs.current[next]?.focus()); }
      else goto(next);
    }
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    tiltX.set(((event.clientX - rect.left) / rect.width) * 2 - 1); tiltY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };
  useEffect(() => { if (cards.length && front > cards.length - 1) setFront(cards.length - 1); }, [cards.length, front]);

  if (!cards.length) return null;
  return <section className={styles.root} aria-label={title} data-open={open ? "" : undefined} data-reduced={reduced || undefined}>
    <header className={styles.head}>
      <h2 className={styles.title}>{title}</h2>
      {open ? <Button size="sm" variant="secondary" onClick={close}>Tüm kartlar</Button> : <span className={styles.counter} aria-hidden="true">{counterText(front, cards.length)}</span>}
    </header>
    <p id={`${uid}-hint`} className={srOnly}>{HINT}</p>
    <div className={styles.deck} data-fan={(fan && !open && !reduced) || undefined} role="group" aria-label={`${title}: ${cards.length} kart`} aria-describedby={`${uid}-hint`}
      style={{ ["--peek-count" as string]: open ? 0 : Math.min(3, cards.length - 1 - front) }}
      onPointerEnter={event => { if (event.pointerType === "mouse") setFan(true); }} onPointerLeave={() => { setFan(false); tiltX.set(0); tiltY.set(0); }}>
      {cards.map((card, index) => {
        const pos = index - front;
        const place = open ? (pos === 0 ? { y: 0, scale: 1, opacity: 1, hidden: false } : { y: pos < 0 ? 1.15 : -.04, scale: .94, opacity: 0, hidden: true }) : placeOf(pos, fan && !reduced ? 1 : 0);
        const isFront = pos === 0;
        return <motion.button key={card.id} ref={node => { refs.current[index] = node; }} type="button" className={styles.card} style={{ zIndex: cards.length - index, rotateX: isFront && !open ? rotateX : 0, rotateY: isFront && !open ? rotateY : 0, touchAction: "pan-x" }}
          tabIndex={isFront ? 0 : -1} aria-hidden={place.hidden || !isFront || undefined} aria-expanded={isFront ? !!open : undefined} aria-label={cardLabel(card, index, cards.length)}
          animate={{ y: `${place.y * 100}%`, scale: place.scale, opacity: place.opacity }} transition={spring}
          drag={isFront && !reduced ? "y" : false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={.35}
          onDragEnd={(_, info) => { if (open) { if (info.offset.y > 80) close(); return; } const step = dragStep(info.offset.y, info.velocity.y); if (step) goto(front + step); }}
          onClick={() => { if (!isFront) return; if (open) close(); else openCard(index); }} onKeyDown={event => key(event, index)} onPointerMove={isFront ? move : undefined}>
          <Face card={card} />
        </motion.button>;
      })}
    </div>
    <AnimatePresence initial={false}>
      {open && <motion.section key={open.id} className={styles.detail} aria-label={`${open.issuer} ${open.product} ayrıntısı`} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.standard }}>
        <p className={styles.balanceLabel}>Kullanılabilir</p>
        <p className={styles.balance} aria-label={`Kullanılabilir bakiye ${balanceText(open)}`}><AnimatedCounter value={open.balance} decimals={2} prefix="₺" /></p>
        <h3 className={styles.recent}>Son hareketler</h3>
        {open.transactions.length === 0 ? <p className={styles.empty}>Henüz hareket yok</p>
          : <ul className={styles.list}>{open.transactions.slice(0, 3).map((item, at) => <motion.li key={item.id} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : { delay: .12 + at * motionTokens.stagger.line, duration: motionTokens.duration.standard }}>
            <span className={styles.merchant}><b>{item.merchant}</b>{item.detail && <span>{item.detail}</span>}</span><span className={styles.amount}>{transactionText(item.amount)}</span>
          </motion.li>)}</ul>}
      </motion.section>}
    </AnimatePresence>
    {live}
  </section>;
}

export default WalletStack;
