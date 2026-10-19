"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";
import { Avatar } from "../avatar/avatar";
import { motionTokens } from "../lib/motion-tokens";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { LoginForm, type LoginProvider, type LoginValues } from "./login-form";
import { LOGIN_TEXT } from "./login-form-format";
import styles from "./login-split.module.css";

export type { LoginProvider, LoginValues };

export interface LoginSplitProps {
  /** Giriş denemesini yapar; reddederse form üstünde "E-posta ya da parola hatalı." çıkar. Gerçek kimlik doğrulamayı uygulama bağlar. */
  onSubmit: (values: LoginValues) => Promise<unknown>;
  /** "Parolamı unuttum"a basınca girilmiş e-postayla çağrılır; sayfa değişmez. */
  onForgot?: ((email: string) => void) | undefined;
  /** Sağlayıcı düğmesine basınca sağlayıcının kimliğiyle çağrılır. */
  onProvider?: ((id: string) => void) | undefined;
  /** "Kayıt ol" bağlantısına basınca çağrılır. */
  onSignUp?: (() => void) | undefined;
  /** Form üstündeki marka işareti ve adı. `mark` küçük bir simge ya da logo olabilir. */
  brand?: { name: string; mark?: React.ReactNode | undefined } | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  /** Görsel bölmenin fotoğrafı; verilmezse ya da yüklenemezse vurgu renginden türetilmiş yüzey çizilir. */
  media?: { src: string; alt?: string | undefined } | undefined;
  /** Görsel bölmedeki alıntı ve sahibi. Dar kapta gizlenir. */
  quote?: { text: string; name: string; role?: string | undefined; avatar?: string | undefined } | undefined;
  /** Görsel bölmenin üstündeki küçük rozet. */
  badge?: string | undefined;
  mediaSide?: "left" | "right" | undefined;
  providers?: LoginProvider[] | undefined;
  showRemember?: boolean | undefined;
  /** Bölümün en az yüksekliği; varsayılan ekran yüksekliğidir. */
  minHeight?: string | undefined;
  /** Form alanlarının başlangıç değerleri (`LoginForm` ile aynı). */
  defaultValues?: Partial<LoginValues> | undefined;
  /** Hata kutusunun metni (`LoginForm` ile aynı). */
  error?: string | undefined;
  /** Formun kendisine yazılır; uçtan uca testlerde formu bulmak için. */
  "data-testid"?: string | undefined;
}

/** Ürün girişi için iki bölmeli ekran kullanın: bir yanda sade form, öbür yanda güven veren fotoğraf ve alıntı. Dar kapta (768 px altı) fotoğraf ince bir şeride iner. Ortada tek kart için `login-centered`, tam ekran fotoğraf üstünde kart için `login-immersive`. Bileşen yalnız görünüm ve olay çağrılarıdır; kimlik doğrulamayı uygulama yapar. */
export function LoginSplit({ onSubmit, onForgot, onProvider, onSignUp, brand, title = "Tekrar hoş geldiniz", subtitle = "Hesabınıza giriş yapın", media, quote, badge, mediaSide = "right", providers, showRemember = true, minHeight = "100svh", defaultValues, error, "data-testid": testId }: LoginSplitProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [failedSrc, setFailedSrc] = useState<string>();
  const showPhoto = media?.src && failedSrc !== media.src;

  const fade = (delay: number) => reduced ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: motionTokens.duration.considered, ease: [...motionTokens.ease.enter] as [number, number, number, number], delay } };

  return <section className={styles.root} style={{ minHeight }} data-media-side={mediaSide} data-reduced={reduced || undefined} aria-labelledby={`${uid}-title`}>
    <div className={styles.formPane}>
      <div className={styles.formBox}>
        {brand && <motion.div className={styles.brand} {...fade(0)}>{brand.mark && <span className={styles.mark} aria-hidden="true">{brand.mark}</span>}<span>{brand.name}</span></motion.div>}
        <motion.div className={styles.heading} {...fade(.04)}>
          <h1 id={`${uid}-title`} className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </motion.div>
        <LoginForm onSubmit={onSubmit} defaultValues={defaultValues} error={error} data-testid={testId} onForgot={onForgot} onProvider={onProvider} providers={providers} showRemember={showRemember} introDelay={.1} labelledBy={`${uid}-title`} />
        <motion.p className={styles.signup} {...fade(.5)}>{LOGIN_TEXT.noAccount} <button type="button" className={styles.link} onClick={() => onSignUp?.()}>{LOGIN_TEXT.signUp}</button></motion.p>
      </div>
    </div>
    <div className={styles.mediaPane}>
      <motion.div className={styles.surface} initial={reduced ? false : { scale: 1.04 }} animate={{ scale: 1 }} transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.considered * 2, ease: [...motionTokens.ease.enter] as [number, number, number, number] }} aria-hidden="true">
        {showPhoto && <img className={styles.photo} src={media.src} alt="" onError={() => setFailedSrc(media.src)} />}
      </motion.div>
      {badge && <span className={styles.badge}>{badge}</span>}
      {quote && <motion.figure className={styles.quote} {...fade(.35)}>
        <blockquote className={styles.quoteText}>{"“"}{quote.text}{"”"}</blockquote>
        <figcaption className={styles.person}>
          <Avatar name={quote.name} src={quote.avatar} size="md" />
          <span className={styles.personText}><b>{quote.name}</b>{quote.role && <span>{quote.role}</span>}</span>
        </figcaption>
      </motion.figure>}
    </div>
  </section>;
}

export default LoginSplit;
