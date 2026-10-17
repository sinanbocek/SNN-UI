"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { Input } from "../input/input";
import { PasswordField } from "../password-field/password-field";
import { motionTokens } from "../lib/motion-tokens";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { LOGIN_TEXT, cleanLoginEmail, firstInvalidField, loginEmailProblem, loginPasswordProblem } from "./login-form-format";
import styles from "./login-form.module.css";

export interface LoginValues { email: string; password: string; remember?: boolean }
export interface LoginProvider { id: string; label: string; icon?: ReactNode }
export const DEFAULT_PROVIDERS: LoginProvider[] = [{ id: "google", label: "Google ile devam et" }];

type Status = "idle" | "sending" | "error" | "done";

export interface LoginFormProps {
  /** Giriş denemesini yapar; sözü reddederse form üstünde hata kutusu açılır. */
  onSubmit: (values: LoginValues) => Promise<unknown>;
  onForgot?: (email: string) => void;
  onProvider?: (id: string) => void;
  providers?: LoginProvider[];
  /** "Beni hatırla" kutusunu gösterir; `onSubmit` değerine `remember` olarak girer. */
  showRemember?: boolean;
  /** Açılış kademesinin başlangıç gecikmesi (sn). */
  introDelay?: number;
  /** Formu adlandıran başlığın kimliği (`aria-labelledby`). */
  labelledBy?: string;
}

/** İki giriş bloğunun ortak gövdesi: alanlar, gönderim durumları, hata kutusu ve sağlayıcı düğmeleri. Başlık ve kayıt satırı kabın işidir. */
export function LoginForm({ onSubmit, onForgot, onProvider, providers = DEFAULT_PROVIDERS, showRemember = false, introDelay = 0, labelledBy }: LoginFormProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [status, setStatus] = useState<Status>("idle");

  const emailError = touched.email ? loginEmailProblem(email) : null;
  const passwordError = touched.password ? loginPasswordProblem(password) : null;
  const sending = status === "sending";

  // Hata gelince alanlar yeniden açılır; odak ve sallanma bundan sonra parola alanına verilir.
  useEffect(() => {
    if (status !== "error") return;
    passwordRef.current?.focus();
    if (!reduced && shakeRef.current) animate(shakeRef.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: .35 });
  }, [status, reduced]);

  const edit = () => { if (status === "error" || status === "done") setStatus("idle"); };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setTouched({ email: true, password: true });
    const invalid = firstInvalidField(email, password);
    if (invalid) { (invalid === "email" ? emailRef : passwordRef).current?.focus(); return; }
    setStatus("sending");
    submitRef.current?.focus();
    try {
      await onSubmit(showRemember ? { email, password, remember } : { email, password });
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const rise = (order: number) => reduced ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: motionTokens.duration.considered, ease: [...motionTokens.ease.enter] as [number, number, number, number], delay: introDelay + order * motionTokens.stagger.item * 2 } };
  const label = status === "sending" ? LOGIN_TEXT.submitting : status === "done" ? LOGIN_TEXT.done : LOGIN_TEXT.submit;

  return <form className={styles.form} onSubmit={submit} noValidate aria-labelledby={labelledBy} aria-busy={sending || undefined}>
    <AnimatePresence initial={false}>
      {status === "error" && <motion.div key="alert" className={styles.alertSlot} role="alert" initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}>
        <p className={styles.alert}>{LOGIN_TEXT.failed}</p>
      </motion.div>}
    </AnimatePresence>
    <motion.div {...rise(0)}>
      <Input ref={emailRef} label={LOGIN_TEXT.email} name="email" type="email" inputMode="email" autoComplete="email" placeholder="ad@ornek.com.tr" value={email} error={emailError ?? undefined} disabled={sending}
        onChange={event => { setEmail(cleanLoginEmail(event.target.value)); edit(); }} onBlur={() => { if (email) setTouched(current => ({ ...current, email: true })); }} />
    </motion.div>
    <motion.div {...rise(1)}>
      <div ref={shakeRef} className={styles.passwordWrap}>
        <PasswordField ref={passwordRef} label={LOGIN_TEXT.password} name="password" autoComplete="current-password" value={password} disabled={sending}
          aria-invalid={passwordError ? true : undefined} aria-describedby={passwordError ? `${uid}-password-error` : undefined}
          onChange={event => { setPassword(event.target.value); edit(); }} onBlur={() => { if (password) setTouched(current => ({ ...current, password: true })); }} />
        <AnimatePresence initial={false}>
          {passwordError && <motion.p key="error" id={`${uid}-password-error`} role="alert" className={styles.fieldError} initial={reduced ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: reduced ? 0 : motionTokens.duration.instant } }} transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{passwordError}</motion.p>}
        </AnimatePresence>
      </div>
    </motion.div>
    <motion.div className={styles.options} data-remember={showRemember || undefined} {...rise(2)}>
      {showRemember && <Checkbox label={LOGIN_TEXT.remember} checked={remember} onCheckedChange={next => setRemember(next === true)} disabled={sending} />}
      <button type="button" className={styles.link} disabled={sending} onClick={() => onForgot?.(email)}>{LOGIN_TEXT.forgot}</button>
    </motion.div>
    <motion.div {...rise(3)}>
      <Button ref={submitRef} type="submit" variant="primary" size="lg" className={styles.submit} loading={sending} disabled={status === "done"}>{label}</Button>
    </motion.div>
    {providers.length > 0 && <motion.div className={styles.providers} {...rise(4)}>
      <div className={styles.divider} role="separator"><span>{LOGIN_TEXT.or}</span></div>
      {providers.map(provider => <Button key={provider.id} type="button" variant="secondary" size="lg" className={styles.provider} disabled={sending} onClick={() => onProvider?.(provider.id)}>{provider.icon}{provider.label}</Button>)}
    </motion.div>}
    <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{sending ? LOGIN_TEXT.submitting : status === "done" ? LOGIN_TEXT.done : ""}</div>
  </form>;
}
