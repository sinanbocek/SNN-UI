"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { Button } from "../button/button";
import styles from "./theme-switch.module.css";

export type ThemeSwitchVariant = "reveal" | "eclipse" | "split" | "rise";
export type Theme = "light" | "dark";

export interface ThemeSwitchProps {
  theme: Theme;
  variant?: ThemeSwitchVariant | undefined;
  onThemeChange: (next: Theme, variant: ThemeSwitchVariant, trigger: HTMLElement) => void;
  label?: string | undefined;
  iconOnly?: boolean | undefined;
}

/** Dönme ve ölçek yayla gider; saydamlık ve bulanıklık ara değerle gider, böylece bulanıklık sıfırın altına taşmaz. */
const iconSpring = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }, filter: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } as const;
const iconExit = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } as const;
const blur = `blur(${motionTokens.blur.subtle}px)`;

/** Kayıtlı tercih genellikle tema prop'una hidrasyondan hemen sonra ulaşır. Bu düzeltme simgeyi yerinde değiştirir;
 *  yalnız ilk çizilen karelerden sonraki değişiklikler hareketlenir, böylece koyu açılan sayfada anahtarlar dönmez. */
function useSettled() {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setSettled(true)); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, []);
  return settled;
}

/** İki simge de aynı yöne döner (koyuya girerken ve çıkarken saat yönünde), geçiş iki solma değil tek dönüş gibi okunur. */
function ThemeIcon({ theme, reduced, settled }: { theme: Theme; reduced: boolean; settled: boolean }) {
  const Icon = theme === "light" ? Sun : Moon;
  const angle = theme === "light" ? 30 : -30;
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={theme}
        className={styles.icon}
        initial={!settled ? false : reduced ? { opacity: 0 } : { opacity: 0, scale: .7, rotate: angle, filter: blur }}
        animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
        exit={!settled ? { opacity: 0, transition: { duration: 0 } } : reduced ? { opacity: 0, transition: { duration: motionTokens.duration.instant } } : { opacity: 0, scale: .7, rotate: angle, filter: blur, transition: iconExit }}
        transition={reduced ? { duration: motionTokens.duration.instant } : iconSpring}
        aria-hidden="true"
      >
        <Icon size={16} strokeWidth={1.75} />
      </motion.span>
    </AnimatePresence>
  );
}

export function ThemeSwitch({ theme, variant = "reveal", onThemeChange, label, iconOnly = false }: ThemeSwitchProps) {
  const reduced = useReducedMotion() ?? false;
  const settled = useSettled();
  const next = theme === "light" ? "dark" : "light";
  const classes = [styles.themeSwitch, styles[variant], iconOnly ? styles.iconOnly : "", settled ? styles.settled : ""].join(" ");

  return (
    <Button
      type="button"
      size="sm"
      variant="secondary"
      className={classes}
      data-theme={theme}
      aria-label={label ?? (next === "dark" ? "Koyu temaya geç" : "Açık temaya geç")}
      aria-pressed={theme === "dark"}
      onClick={event => onThemeChange(next, variant, event.currentTarget)}
    >
      <span className={styles.iconWrap}><ThemeIcon theme={theme} reduced={reduced} settled={settled} /></span>
      {!iconOnly && <span className={styles.label}>Temayı değiştir</span>}
    </Button>
  );
}

export default ThemeSwitch;
