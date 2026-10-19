"use client";

import { forwardRef, useId, useState } from "react";
import type { ComponentPropsWithoutRef, Ref } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./select.module.css";

export interface SelectProps extends Omit<ComponentPropsWithoutRef<typeof SelectPrimitive.Root>, "children"> {
  label: string;
  description?: string | undefined;
  placeholder?: string | undefined;
  id?: string | undefined;
  className?: string | undefined;
  options: { value: string; label: string; disabled?: boolean | undefined }[];
  /** Etiket görünmez, ekran okuyucu yine okur. Tablo hücresindeki seçim için. */
  hideLabel?: boolean | undefined;
  /** "sm": tablo hücresine sığan alçak kutu. */
  size?: "sm" | "md" | undefined;
  /** Tarayıcının kendi <select> öğesi: klavye davranışı işletim sistemininkidir (kapalıyken oklar değeri değiştirir), açılır liste
   * tarayıcınındır. Çok satırlı tabloda hafiftir. Değer geçişi canlanmaz. */
  native?: boolean | undefined;
}

/** Gösterilen değer listenin yönünde döner: sonraki seçenek aşağıdan yükselir, önceki yukarıdan iner. */
const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.35}em`, filter: `blur(${motionTokens.blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.3}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }),
};
/** Azaltılmış hareket kısa bir çapraz geçişi korur; dinlenme durumu valueRoll ile eşleşir, böylece sunucu ve istemci işaretlemesi uyuşur. */
const valueFade: Variants = { enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, exit: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { label, description, placeholder = "Bir seçenek seçin", options, id, className, disabled, onValueChange, hideLabel = false, size = "md", native = false, ...rootProps },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const reduceMotion = useReducedMotion();
  const [uncontrolledValue, setUncontrolledValue] = useState(rootProps.defaultValue ?? "");
  const currentValue = rootProps.value ?? uncontrolledValue;
  const index = options.findIndex((option) => option.value === currentValue);
  const shown = currentValue ? options[index]?.label ?? "" : placeholder;
  const [previousIndex, setPreviousIndex] = useState(index);
  const [direction, setDirection] = useState(1);
  if (previousIndex !== index) { setPreviousIndex(index); setDirection(index > previousIndex ? 1 : -1); }

  const labelNode = <label htmlFor={controlId} className={hideLabel ? styles.srOnly : undefined}>{label}</label>;
  const hint = description && <span id={hintId} className={styles.hint}>{description}</span>;

  if (native) return (
    <div className={styles.field} data-size={size}>
      {labelNode}
      <div className={styles.nativeWrap}>
        <select
          ref={ref as unknown as Ref<HTMLSelectElement>}
          id={controlId}
          aria-describedby={hintId}
          className={[styles.trigger, styles.native, className].filter(Boolean).join(" ")}
          value={currentValue}
          name={rootProps.name}
          required={rootProps.required}
          disabled={disabled}
          data-disabled={disabled ? "" : undefined}
          data-placeholder={currentValue ? undefined : ""}
          onChange={(event) => { setUncontrolledValue(event.currentTarget.value); onValueChange?.(event.currentTarget.value); }}
        >
          {!currentValue && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
        </select>
        <ChevronDown className={styles.nativeChevron} size={16} strokeWidth={1.75} aria-hidden="true" />
      </div>
      {hint}
    </div>
  );

  return (
    <div className={styles.field} data-size={size}>
      {labelNode}
      <SelectPrimitive.Root {...rootProps} disabled={disabled} onValueChange={(next) => { setUncontrolledValue(next); onValueChange?.(next); }}>
        <SelectPrimitive.Trigger
          ref={ref}
          id={controlId}
          aria-describedby={hintId}
          className={[styles.trigger, className].filter(Boolean).join(" ")}
        >
          {/* Radix gerçek değeri yardımcı teknolojiler için tutar; aşağıdaki görünür kopya değerler arasında canlanır. */}
          <span className={styles.srOnly}><SelectPrimitive.Value placeholder={placeholder} /></span>
          <span className={styles.valueText} aria-hidden="true">
            <AnimatePresence initial={false} custom={direction}>
              <motion.span key={currentValue ? `value-${currentValue}` : "placeholder"} data-placeholder={currentValue ? undefined : ""} custom={direction} variants={reduceMotion ? valueFade : valueRoll} initial="enter" animate="center" exit="exit">{shown}</motion.span>
            </AnimatePresence>
          </span>
          <SelectPrimitive.Icon className={styles.chevron}>
            <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className={styles.content} position="popper" sideOffset={4} collisionPadding={12}>
            <SelectPrimitive.ScrollUpButton className={styles.scrollButton}>
              <ChevronUp size={16} strokeWidth={1.75} aria-hidden="true" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className={styles.viewport}>
              {options.map((option) => (
                <SelectPrimitive.Item key={option.value} value={option.value} disabled={option.disabled} className={styles.item}>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className={styles.indicator}>
                    <Check size={16} strokeWidth={1.75} aria-hidden="true" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className={styles.scrollButton}>
              <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {hint}
    </div>
  );
});
