"use client";

import { Fragment, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Avatar } from "../avatar/avatar";
import { Button } from "../button/button";
import { motionTokens } from "../lib/motion-tokens";
import { useElementWidth, useOnScreen, useReducedMotionSafe } from "../lib/viz-utils";
import { SUBMIT_LABELS, cleanEmail, emailProblem, peopleText, rankSentence, suggestEmail, suggestionText } from "./hero-signup-format";
import styles from "./hero-signup.module.css";

export type SignupStatus = "idle" | "sending" | "error" | "done";

/** Açılış sayfasında tek e-posta alanıyla bekleme listesi ya da erken erişim toplamak için kullanın: akan renk geçişli arka plan, kelime kelime gelen başlık, sakin doğrulama (alandan çıkınca), yazım düzeltme önerisi ve gönderince "listedeki sıran" onayına dönüşen düğme. Parolalı kayıt, SSO ve bülten kutusu için değil; kaydı saklayan servisi `onSubmit` ile uygulama bağlar. */
export interface HeroSignupProps {
  headline: string;
  subline?: string;
  /** Alt not satırındaki sakin güvence cümlesi. */
  note?: string;
  /** Listeye eklemeyi yapar ve sırayı döndürür; reddederse "Yerinizi kaydedemedik." yazılır. */
  onSubmit: (email: string) => Promise<{ position: number }>;
  /** Listedeki kişi sayısı; katılınca bir artar. */
  count?: number;
  /** Sosyal kanıt portreleri için adlar (en çok beş). */
  people?: string[];
  onStatusChange?: (status: SignupStatus) => void;
  /** Bölümün en az yüksekliği; varsayılan ekran yüksekliğidir. */
  minHeight?: string;
}

export function HeroSignup({ headline, subline, note = "Davetiniz hazır olunca tek e-posta alırsınız.", onSubmit, count, people = [], onStatusChange, minHeight = "100svh" }: HeroSignupProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [box, width] = useElementWidth<HTMLElement>();
  const [screen, onScreen] = useOnScreen<HTMLDivElement>();
  const input = useRef<HTMLInputElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatusState] = useState<SignupStatus>("idle");
  const [position, setPosition] = useState(0);
  const [failed, setFailed] = useState(false);
  const setStatus = (next: SignupStatus) => { setStatusState(next); onStatusChange?.(next); };

  const problem = touched ? emailProblem(email) : null;
  const suggestion = suggestEmail(email);
  const compact = width > 0 && width < 420;
  const words = headline.split(" ");
  const liveText = status === "sending" ? "Gönderiliyor" : status === "done" ? rankSentence(position) : status === "error" ? "Yerinizi kaydedemedik. Tekrar deneyebilirsiniz." : "";

  useEffect(() => { if (status === "done") done.current?.focus(); }, [status]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;
    setTouched(true);
    const found = emailProblem(email);
    if (found) { input.current?.focus(); if (!reduced && field.current) animate(field.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: .35 }); return; }
    setStatus("sending"); setFailed(false);
    try { const result = await onSubmit(email); setPosition(result.position); setStatus("done"); }
    catch { setFailed(true); setStatus("error"); if (!reduced && field.current) animate(field.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: .35 }); }
  };
  const change = () => { setStatus("idle"); setTouched(false); requestAnimationFrame(() => input.current?.focus()); };

  const rise = (delay: number) => reduced ? {} : { initial: { opacity: 0, y: 14, filter: "blur(4px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, transition: { duration: motionTokens.duration.considered, ease: [...motionTokens.ease.enter] as [number, number, number, number], delay } };
  const total = (count ?? 0) + (status === "done" ? 1 : 0);

  return <section ref={box} className={styles.root} style={{ minHeight }} aria-labelledby={`${uid}-title`} data-reduced={reduced || undefined}>
    <div ref={screen} className={styles.mesh} data-paused={!onScreen || undefined} aria-hidden="true" />
    <div className={styles.content}>
      <h1 id={`${uid}-title`} className={styles.title}>{words.map((word, at) => <Fragment key={at}><span className={styles.wordMask}><motion.span className={styles.word} {...rise(at * motionTokens.stagger.word)}>{word}</motion.span></span>{at < words.length - 1 ? " " : ""}</Fragment>)}</h1>
      {subline && <motion.p className={styles.subline} {...rise(words.length * motionTokens.stagger.word + .1)}>{subline}</motion.p>}
      <motion.div className={styles.formWrap} {...rise(words.length * motionTokens.stagger.word + .2)}>
        <AnimatePresence mode="wait" initial={false}>
          {status === "done" ? <motion.div key="done" ref={done} tabIndex={-1} className={styles.done} initial={reduced ? false : { opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.morph}>
            <p className={styles.rank}><span>Listede</span> <b><AnimatedCounter value={position} /></b><span>. sıradasınız</span></p>
            <button type="button" className={styles.link} onClick={change}>E-postayı değiştir</button>
          </motion.div>
            : <motion.form key="form" className={styles.form} onSubmit={submit} noValidate initial={false} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : motionTokens.duration.fast }}>
              <div ref={field} className={styles.field}>
                <label htmlFor={`${uid}-email`} className={styles.label}>E-posta adresi</label>
                <input ref={input} id={`${uid}-email`} name="email" type="email" inputMode="email" autoComplete="email" enterKeyHint="send" placeholder="E-posta adresi" value={email}
                  aria-invalid={!!problem || undefined} aria-describedby={`${uid}-note`} onChange={event => { setEmail(cleanEmail(event.target.value)); if (status === "error") setStatus("idle"); }} onBlur={() => { if (email) setTouched(true); }} />
                <Button type="submit" variant="primary" size="lg" className={styles.submit} loading={status === "sending"} aria-busy={status === "sending"}>{status === "sending" ? SUBMIT_LABELS.busy : compact ? SUBMIT_LABELS.short : SUBMIT_LABELS.full}</Button>
              </div>
              <p id={`${uid}-note`} className={styles.note} data-tone={problem || failed ? "error" : undefined}>
                {problem ?? (failed ? <>Yerinizi kaydedemedik. <button type="submit" className={styles.link}>{SUBMIT_LABELS.retry}</button></> : suggestion ? <>{suggestionText(suggestion)} <button type="button" className={styles.link} onClick={() => { setEmail(suggestion); input.current?.focus(); }}>Düzelt</button></> : note)}
              </p>
            </motion.form>}
        </AnimatePresence>
      </motion.div>
      {(people.length > 0 || count !== undefined) && <motion.div className={styles.proof} {...rise(words.length * motionTokens.stagger.word + .3)}>
        {people.length > 0 && <span className={styles.faces} aria-hidden="true">{people.slice(0, 5).map(name => <Avatar key={name} name={name} size="sm" />)}</span>}
        {count !== undefined && <span className={styles.count}><span className={styles.srOnly}>{peopleText(total)}</span><span aria-hidden="true"><AnimatedCounter value={total} /> kişi listede</span></span>}
      </motion.div>}
    </div>
    <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{liveText}</div>
  </section>;
}

export default HeroSignup;
