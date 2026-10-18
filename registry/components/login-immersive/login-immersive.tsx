"use client";

import { useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { LoginForm, type LoginProvider, type LoginValues } from "../login-split/login-form";
import { LOGIN_TEXT } from "../login-split/login-form-format";
import styles from "./login-immersive.module.css";

export type { LoginProvider, LoginValues };

/** Arka plan fotoğrafı sahne kayması en çok bu kadar piksel oynar. */
const MAX_SHIFT = 8;

export interface LoginImmersiveProps {
  /** Giriş denemesini yapar; reddederse kart içinde "E-posta ya da parola hatalı." çıkar. Gerçek kimlik doğrulamayı uygulama bağlar. */
  onSubmit: (values: LoginValues) => Promise<unknown>;
  onForgot?: ((email: string) => void) | undefined;
  onProvider?: ((id: string) => void) | undefined;
  onSignUp?: (() => void) | undefined;
  /** Sağ üstteki "Yardım" bağlantısına basınca çağrılır; verilmezse bağlantı çizilmez. */
  onHelp?: (() => void) | undefined;
  /** Sol üstteki marka işareti ve adı (arka plan üstünde açık renk). */
  brand?: { name: string; mark?: ReactNode | undefined } | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  /** Arka plan fotoğrafı; `position` odak noktasıdır (CSS object-position), `credit` künyedir. Verilmezse ya da yüklenemezse yavaş kayan renk lekeleri çizilir. */
  media?: { src: string; alt?: string | undefined; position?: string | undefined; credit?: string | undefined } | undefined;
  /** Kartın yeri: ortada, ya da geniş kapta sağa yakın. */
  cardAlign?: "center" | "end" | undefined;
  providers?: LoginProvider[] | undefined;
  /** Sağ alttaki küçük yasal bağlantılar. */
  legalLinks?: { label: string; href: string }[] | undefined;
  /** Bölümün en az yüksekliği; varsayılan ekran yüksekliğidir. */
  minHeight?: string | undefined;
}

/** Tanıtım ağırlıklı ya da davetle girilen alanlarda, bütün kabı kaplayan fotoğraf üstünde buzlu cam kartla giriş için kullanın. Fare fotoğrafı çok az kaydırır; kart sabit kalır. İş ekranlarında sade giriş için `login-centered`, fotoğraf yanında form için `login-split`. Bileşen yalnız görünüm ve olay çağrılarıdır; kimlik doğrulamayı uygulama yapar. */
export function LoginImmersive({ onSubmit, onForgot, onProvider, onSignUp, onHelp, brand, title = "Giriş yap", subtitle = "Devam etmek için hesabınıza girin", media, cardAlign = "center", providers, legalLinks = [], minHeight = "100svh" }: LoginImmersiveProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const root = useRef<HTMLElement>(null);
  const [failedSrc, setFailedSrc] = useState<string>();
  const showPhoto = media?.src && failedSrc !== media.src;
  const shiftX = useSpring(useMotionValue(0), motionTokens.spring.gentle);
  const shiftY = useSpring(useMotionValue(0), motionTokens.spring.gentle);

  // Yalnız fare: dokunma ve kalem kaydırmayı tetiklemez. Hareket azaltıldığında hiç çalışmaz.
  const move = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== "mouse" || !root.current) return;
    const box = root.current.getBoundingClientRect();
    shiftX.set(-((event.clientX - box.left) / box.width - .5) * 2 * MAX_SHIFT);
    shiftY.set(-((event.clientY - box.top) / box.height - .5) * 2 * MAX_SHIFT);
  };
  const leave = () => { shiftX.set(0); shiftY.set(0); };

  const enter = reduced ? {} : { initial: { opacity: 0, y: 16, filter: `blur(${motionTokens.blur.text}px)` }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { duration: motionTokens.duration.considered, ease: [...motionTokens.ease.enter] as [number, number, number, number], delay: .1 } };

  return <section ref={root} className={styles.root} style={{ minHeight }} data-align={cardAlign} data-reduced={reduced || undefined} onPointerMove={move} onPointerLeave={leave}>
    <motion.div className={styles.backdrop} aria-hidden="true" initial={reduced ? false : { scale: 1.06 }} animate={{ scale: 1 }} transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.considered * 2, ease: [...motionTokens.ease.enter] as [number, number, number, number] }}>
      <div className={styles.blobs}><i /><i /></div>
      {showPhoto && <motion.img className={styles.photo} src={media.src} alt="" style={{ x: shiftX, y: shiftY, objectPosition: media.position }} onError={() => setFailedSrc(media.src)} />}
      <div className={styles.shade} />
    </motion.div>

    <header className={styles.top}>
      {brand ? <span className={styles.brand}>{brand.mark && <span className={styles.mark} aria-hidden="true">{brand.mark}</span>}{brand.name}</span> : <span />}
      {onHelp && <button type="button" className={styles.topLink} onClick={onHelp}>Yardım</button>}
    </header>

    <div className={styles.stage}>
      <motion.div className={styles.card} {...enter}>
        <div className={styles.heading}>
          <h1 id={`${uid}-title`} className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <LoginForm onSubmit={onSubmit} onForgot={onForgot} onProvider={onProvider} providers={providers} introDelay={.3} labelledBy={`${uid}-title`} />
        <p className={styles.signup}>{LOGIN_TEXT.noAccount} <button type="button" className={styles.link} onClick={() => onSignUp?.()}>{LOGIN_TEXT.signUp}</button></p>
      </motion.div>
    </div>

    {(media?.credit || legalLinks.length > 0) && <footer className={styles.bottom}>
      <span>{media?.credit ? `Fotoğraf: ${media.credit}` : ""}</span>
      {legalLinks.length > 0 && <nav className={styles.legal} aria-label="Yasal bağlantılar">{legalLinks.map(link => <a key={link.label} href={link.href}>{link.label}</a>)}</nav>}
    </footer>}
  </section>;
}

export default LoginImmersive;
