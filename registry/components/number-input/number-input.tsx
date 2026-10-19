"use client";

import { forwardRef, useId, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { formatNumber, parseDraft, sanitizeDraft, settleValue } from "./number-input-format";
import styles from "./number-input.module.css";

export interface NumberInputProps {
  label: string;
  /** Etiket görünmez, ekran okuyucu yine okur. Tablo hücresindeki alan için. */
  hideLabel?: boolean | undefined;
  /** `null` boştur. */
  value?: number | null | undefined;
  defaultValue?: number | null | undefined;
  /** Odak çıkınca, Enter'da ya da adım düğmesiyle çağrılır; yazarken çağrılmaz. */
  onValueChange?: ((value: number | null) => void) | undefined;
  min?: number | undefined;
  max?: number | undefined;
  /** Ok tuşları ve adım düğmelerinin adımı. Shift ile on katı. */
  step?: number | undefined;
  /** Ondalık basamak sınırı ve binlik gruplama. Ondalık varsayılan olarak `step`in hassasiyetini izler. Yazım ABACUS ile. */
  formatOptions?: { minimumFractionDigits?: number | undefined; maximumFractionDigits?: number | undefined; useGrouping?: boolean | undefined } | undefined;
  /** Eksi/artı düğmeleri. `false` gizler; ok tuşları yine çalışır. */
  steppers?: boolean | undefined;
  /** "sm": tablo hücresine sığan alçak alan. */
  size?: "sm" | "md" | undefined;
  /** Metnin yaslandığı yan. Sayı sütunu için varsayılan sağ. */
  align?: "start" | "end" | undefined;
  placeholder?: string | undefined;
  description?: string | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
  /** Değeri ham sayı olarak taşıyan gizli bir girdi ekler (boşsa boş metin). */
  name?: string | undefined;
  id?: string | undefined;
  className?: string | undefined;
  onBlur?: ((event: FocusEvent<HTMLInputElement>) => void) | undefined;
  onKeyDown?: ((event: KeyboardEvent<HTMLInputElement>) => void) | undefined;
}

const decimalsOf = (value: number) => (String(value).split(".")[1] ?? "").length;

/**
 * Boş değer taşıyabilen yalın sayı kutusu. Odaktayken ham metin yazılır ("1234,5"), odak çıkınca biçimli gösterilir ("1.234,5").
 * Değer yazarken değil, odak çıkınca ya da Enter'da işlenir; Escape taslağı geri alır. Sınır dışı değer sınıra sıkıştırılır.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { label, hideLabel = false, value, defaultValue = null, onValueChange, min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, step: stepProp = 1, formatOptions,
    steppers = true, size = "md", align = "end", placeholder, description, error, disabled, name, id, className, onBlur, onKeyDown },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const step = stepProp > 0 ? stepProp : 1;
  const decimals = decimalsOf(step);
  const minFraction = formatOptions?.minimumFractionDigits ?? decimals;
  const maxFraction = Math.max(minFraction, formatOptions?.maximumFractionDigits ?? decimals);
  const grouping = formatOptions?.useGrouping ?? true;

  const [internal, setInternal] = useState<number | null>(defaultValue);
  const current = value === undefined ? internal : value;
  /** Odaktayken yazılan ham metin; odak dışında `null`. */
  const [draft, setDraft] = useState<string | null>(null);

  const settle = (next: number | null) => settleValue(next, min, max, maxFraction);
  function commit(next: number | null) {
    const settled = settle(next);
    if (value === undefined) setInternal(settled);
    if (settled !== current) onValueChange?.(settled);
    return settled;
  }
  const rawOf = (next: number | null) => formatNumber(next, 0, maxFraction, false);
  /** Taslak açıksa önce o işlenir; boş değerden adım, en az sınırdan (yoksa sıfırdan) başlar. */
  function nudge(toward: 1 | -1, amount: number) {
    const from = draft === null ? current : settle(parseDraft(draft));
    const start = from ?? (Number.isFinite(min) && min > 0 ? min - toward * amount : 0);
    const next = commit(start + toward * amount);
    if (draft !== null) setDraft(rawOf(next));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); nudge(event.key === "ArrowUp" ? 1 : -1, event.shiftKey ? step * 10 : step); return; }
    if (event.key === "Enter" && draft !== null) setDraft(rawOf(commit(parseDraft(draft))));
    if (event.key === "Escape" && draft !== null && draft !== rawOf(current)) { event.preventDefault(); setDraft(rawOf(current)); }
  }

  const invalid = Boolean(error);
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const stepButton = (toward: 1 | -1) => {
    const atLimit = current !== null && (toward > 0 ? current >= max : current <= min);
    const Icon = toward > 0 ? Plus : Minus;
    // Fare basması odağı kutuda tutar; açık taslak adımla birlikte işlenir.
    return <button type="button" tabIndex={-1} className={styles.step} disabled={disabled || atLimit} aria-controls={inputId} aria-label={`${label} değerini ${toward > 0 ? "artır" : "azalt"}`}
      onMouseDown={event => event.preventDefault()} onClick={() => nudge(toward, step)}>
      <Icon size={size === "sm" ? 14 : 16} strokeWidth={1.75} aria-hidden="true" />
    </button>;
  };

  return <div className={[styles.field, className].filter(Boolean).join(" ")} data-size={size}>
    <label htmlFor={inputId} className={hideLabel ? styles.srOnly : styles.label}>{label}</label>
    <div className={styles.control} data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
      <input ref={ref} id={inputId} className={styles.input} type="text" inputMode={min < 0 ? "text" : maxFraction > 0 ? "decimal" : "numeric"} autoComplete="off" spellCheck={false}
        role="spinbutton" aria-valuenow={current ?? undefined} aria-valuetext={current === null ? "Boş" : formatNumber(current, minFraction, maxFraction, grouping)}
        aria-valuemin={Number.isFinite(min) ? min : undefined} aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-invalid={invalid || undefined} aria-describedby={describedBy} data-align={align}
        value={draft ?? formatNumber(current, minFraction, maxFraction, grouping)} placeholder={placeholder} disabled={disabled}
        onFocus={event => { setDraft(rawOf(current)); event.currentTarget.select(); }}
        onChange={event => setDraft(sanitizeDraft(event.currentTarget.value, maxFraction > 0, min < 0))}
        onKeyDown={handleKeyDown}
        onBlur={event => { if (draft !== null) commit(parseDraft(draft)); setDraft(null); onBlur?.(event); }} />
      {steppers && <span className={styles.steps}>{stepButton(-1)}{stepButton(1)}</span>}
    </div>
    {name && <input type="hidden" name={name} value={current === null ? "" : String(current)} />}
    {description && <span id={hintId} className={styles.hint}>{description}</span>}
    {error && <span id={errorId} className={styles.error} role="alert">{error}</span>}
  </div>;
});

NumberInput.displayName = "NumberInput";
