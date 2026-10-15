"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { Button } from "../button/button";
import styles from "./multi-step-form.module.css";

export interface FormStep {
  id: string;
  title: string;
  /** Adım başlığının altındaki yönlendirme cümlesi. */
  description?: string;
  /** Adımın alanları. Değerleri üst bileşen tutar; yalnız etkin adım çizilir. `required`, `pattern` gibi yerel kısıtlar geçişi engeller. */
  content: ReactNode;
  /** Yerel kısıtlardan sonra çalışan özel denetim. Hata metni döndürürse geçiş olmaz ve metin adımın altında yazılır. */
  validate?: () => string | undefined;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  /** Son adımda "Bitir". Reddedilirse son adımda hata ve "Yeniden dene" çıkar; girdiler korunur. */
  onComplete: () => void | Promise<void>;
  /** Adım değişti (0 tabanlı sıra). */
  onStepChange?: (index: number) => void;
  completeLabel?: string;
  successTitle?: string;
  successMessage?: string;
  /** Başarıdan sonra çıkan ikinci eylem ("Panoya git"). */
  successAction?: { label: string; onClick: () => void };
  className?: string;
}

/** Sayı değişirken kısa bir yükselişle yer değiştirir; "hareketi azalt" açıkken anında değişir. */
function Rolling({ value }: { value: string }) {
  const reduced = useReducedMotion();
  return (
    <span className={styles.rolling}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value} className={styles.rollingItem}
          initial={reduced ? false : { opacity: 0, y: "0.5em" }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.5em" }}
          transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] }}
        >{value}</motion.span>
      </AnimatePresence>
    </span>
  );
}

function errorFor(element: HTMLInputElement): string {
  return element.validity.valueMissing ? "Bu alan zorunlu." : "Geçerli bir değer girin.";
}

/** Uzun bir formu kısa adımlara böler: adım listesi, yönlü geçiş, adım başına yerel doğrulama ve başarı ekranı. */
export function MultiStepForm({ steps, onComplete, onStepChange, completeLabel = "Bitir", successTitle = "Tamamlandı.", successMessage = "Bilgileriniz kaydedildi.", successAction, className }: MultiStepFormProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const bodyRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [furthest, setFurthest] = useState(0);
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [height, setHeight] = useState<number | "auto">("auto");

  const total = steps.length;
  const step = steps[Math.min(index, Math.max(total - 1, 0))];
  const last = index >= total - 1;

  // Adım içeriğinin yüksekliğini ölçer; form kutusu yeni adımın yüksekliğine yaylanır.
  useLayoutEffect(() => {
    const element = bodyRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);
    setHeight(element.offsetHeight);
    return () => observer.disconnect();
  }, [index, done]);

  // Adım değişince odak yeni adım başlığına (ya da başarı başlığına) gider.
  useEffect(() => {
    if (!moved.current) return;
    document.getElementById(done ? `${uid}-success` : `${uid}-${step.id}-heading`)?.focus();
  }, [index, done]); // eslint-disable-line react-hooks/exhaustive-deps

  function go(next: number, dir: number) {
    moved.current = true;
    setDirection(dir);
    setError("");
    setServerError(false);
    setIndex(next);
    setFurthest(current => Math.max(current, next));
    onStepChange?.(next);
  }

  function checkStep(form: HTMLFormElement): boolean {
    {
      const invalid = ([...form.elements] as HTMLInputElement[]).find(element => element.willValidate && !element.checkValidity());
      if (invalid) {
        invalid.setAttribute("aria-invalid", "true");
        invalid.setAttribute("aria-describedby", `${uid}-error`);
        setError(errorFor(invalid));
        invalid.focus();
        return false;
      }
    }
    const message = step.validate?.();
    if (message) { setError(message); form.querySelector<HTMLElement>("input, select, textarea, button")?.focus(); return false; }
    return true;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !step) return;
    if (!checkStep(event.currentTarget as HTMLFormElement)) return;
    if (!last) { go(index + 1, 1); return; }
    setSubmitting(true);
    setServerError(false);
    try {
      await onComplete();
      moved.current = true;
      setDone(true);
    } catch {
      setServerError(true);
    } finally { setSubmitting(false); }
  }

  // Alan değişince önceki hata temizlenir.
  function onInput(event: FormEvent<HTMLFormElement>) {
    if (!error) return;
    const target = event.target as HTMLElement;
    target.removeAttribute("aria-invalid");
    setError("");
  }

  const slide: Transition = reduced ? { duration: 0 } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const shift = reduced ? 0 : 24;
  const stepLabel = `Adım ${index + 1} / ${total}`;

  if (total === 0) return null;

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-label="Adım adım form">
      <div className={styles.srOnly} role="status" aria-live="polite">{done ? successTitle : `${stepLabel}: ${step.title}`}</div>

      <nav aria-label="Adımlar" className={styles.nav}>
        <ol className={styles.steps}>
          {steps.map((item, itemIndex) => {
            const complete = done || itemIndex < index;
            const current = !done && itemIndex === index;
            const reachable = !done && !submitting && itemIndex < index && itemIndex <= furthest;
            const inner = (
              <>
                <span className={styles.badge} data-state={complete ? "complete" : current ? "current" : "upcoming"} aria-hidden="true">
                  {complete ? (
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" focusable="false">
                      <motion.path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />
                    </svg>
                  ) : itemIndex + 1}
                </span>
                <span className={styles.stepTitle}>{item.title}</span>
                {complete && <span className={styles.srOnly}>, tamamlandı</span>}
              </>
            );
            return (
              <li key={item.id} className={styles.stepItem}>
                {reachable
                  ? <button type="button" className={styles.stepButton} onClick={() => go(itemIndex, -1)}>{inner}</button>
                  : <span className={styles.stepButton} data-static="true" aria-current={current ? "step" : undefined}>{inner}</span>}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className={styles.card}>
        {done ? (
          <div ref={bodyRef} className={styles.success}>
            <h2 id={`${uid}-success`} tabIndex={-1} className={styles.successTitle}>{successTitle}</h2>
            <p className={styles.successText} role="status">{successMessage}</p>
            {successAction && <Button variant="secondary" onClick={successAction.onClick}>{successAction.label}</Button>}
          </div>
        ) : (
          <>
            <div className={styles.meta}>
              <span className={styles.counter}>Adım <Rolling value={String(index + 1)} /> / {total}</span>
            </div>
            <motion.div className={styles.viewport} animate={{ height }} initial={false} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}>
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.form
                  key={step.id} noValidate className={styles.form} onSubmit={event => void submit(event)} onInput={onInput}
                  initial={{ opacity: 0, x: direction * shift }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction * -shift }} transition={slide}
                >
                  <div ref={bodyRef} className={styles.body}>
                    <h2 id={`${uid}-${step.id}-heading`} tabIndex={-1} className={styles.heading}>{step.title}</h2>
                    {step.description && <p className={styles.lead}>{step.description}</p>}
                    <fieldset className={styles.fields} disabled={submitting} aria-labelledby={`${uid}-${step.id}-heading`}>{step.content}</fieldset>
                    <p id={`${uid}-error`} className={styles.error} role="alert">{error}</p>
                    {serverError && <p className={styles.error} role="alert">Gönderilemedi, lütfen tekrar deneyin.</p>}
                    <div className={styles.actions}>
                      <Button type="button" variant="ghost" disabled={index === 0 || submitting} onClick={() => go(index - 1, -1)}>Geri</Button>
                      <Button type="submit" loading={submitting}>{submitting ? "Gönderiliyor…" : serverError ? "Yeniden dene" : last ? completeLabel : "Devam"}</Button>
                    </div>
                  </div>
                </motion.form>
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

export default MultiStepForm;
