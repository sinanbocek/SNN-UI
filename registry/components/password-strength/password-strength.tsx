"use client";

import { forwardRef, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { InputHTMLAttributes } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { AnimationPlaybackControls, Transition, Variants } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { countCodePoints, createPasswordRules, defaultPasswordRules, defaultPasswordStrengthLevels, estimateStrength } from "./password-strength-format";
import type { EstimateStrengthOptions, PasswordRule, PasswordRuleLabels, PasswordRuleOptions, PasswordStrengthLevels, PasswordStrengthResult } from "./password-strength-format";
import { PasswordGenerator, defaultPasswordGeneratorMessages, type PasswordGeneratorMessages } from "./password-generator";
import styles from "./password-strength.module.css";

// Puanlama mantığı saf dosyada durur; tüketiciler her şeyi buradan almaya devam eder.
export { countCodePoints, createPasswordRules, defaultPasswordRules, estimateStrength };
export type { EstimateStrengthOptions, PasswordRule, PasswordRuleLabels, PasswordRuleOptions, PasswordStrengthLevels, PasswordStrengthResult };

/** PasswordStrength'in kullanıcıya görünen her metni. Hepsinin Türkçe varsayılanı vardır; yalnız değiştirdiklerinizi verin. */
export interface PasswordStrengthMessages {
  levels: PasswordStrengthLevels;
  /** Parolayı göster düğmesinin adı. Basılı/basılı değil (aria-pressed) düğmesidir; iki durumda da ad aynı kalır. */
  showPassword: string;
  /** Güç ölçerin erişilebilir adı. */
  meterLabel: string;
  /** Alan boşken ölçerin değer metni. */
  noPassword: string;
  /** Koşullar listesinin erişilebilir adı. */
  rulesLabel: string;
  /** Ekran okuyucular için kuralın etiketinden sonra okunur; baştaki noktalama dahildir. */
  ruleMet: string;
  ruleNotMet: string;
  /** Karşılanmayan kuralın yanındaki dönen sayının çevresindeki sözcükler, örneğin "4 karakter daha". */
  remainingPrefix: string;
  remainingSuffix: string;
  /** Her değişiklikten sonra okunan nazik canlı bölge özeti. */
  summary: (result: { label: string; met: number; total: number }) => string;
}

export const defaultPasswordStrengthMessages: PasswordStrengthMessages = {
  levels: defaultPasswordStrengthLevels,
  showPassword: "Parolayı göster",
  meterLabel: "Parola gücü",
  noPassword: "Henüz parola yok",
  rulesLabel: "Parola koşulları",
  ruleMet: ", sağlandı",
  ruleNotMet: ", sağlanmadı",
  remainingPrefix: "",
  remainingSuffix: "karakter daha",
  summary: ({ label, met, total }) => `Güç: ${label}. ${total} koşuldan ${met} tanesi sağlandı.`,
};

/** `messages` prop'u için kısmi iletiler ve kısmi güç sözcükleri. */
export type PasswordStrengthMessagesInput = Partial<Omit<PasswordStrengthMessages, "levels">> & { levels?: Partial<PasswordStrengthLevels> };

/**
 * Yeni parola alanı: parola yazılırken gücünü gösterir. Dört bölüm dolar ve ton değiştirir,
 * her kural çizilen bir onay işaretiyle işaretlenir, güç sözcüğü yerinde biçim değiştirir. Parola oluştururken ya da değiştirirken kullanın;
 * giriş için sade bir parola alanı kullanın. Puanlama cihazda yapılır, hiçbir yere bir şey gönderilmez.
 */
export interface PasswordStrengthProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "children"> {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, strength: PasswordStrengthResult) => void;
  /** Denetlenecek kurallar. Güç, karşılanan kural payıdır ve dört adıma yayılır. */
  rules?: PasswordRule[];
  /** Alana bağlı hata metni. Yeni bir hata her göründüğünde alan bir kez sallanır. */
  error?: string;
  revealed?: boolean;
  onRevealedChange?: (revealed: boolean) => void;
  /** Çevrilmiş ya da yeniden yazılmış metinler. Her metnin Türkçe varsayılanı vardır; bkz. PasswordStrengthMessages. */
  messages?: PasswordStrengthMessagesInput;
  /** Bu karakter sayısının altında ölçer ilk adımda kalır ve "Çok kısa" yazar. Varsayılan 8. */
  shortLength?: number;
  /** shortLength için karakterlerin nasıl sayıldığı. Varsayılan kod noktalarıdır, yani emoji bir sayılır; bir sunucu gibi UTF-16 birimi saymak için `password => password.length` verin. */
  countCharacters?: (password: string) => number;
  /** Alanın altında parola üretici: uzunluk, karakter türleri, yeniden üret ve kopyala. Üretilen parola alana yazılır ve görünür olur. Varsayılan kapalı. */
  generator?: boolean | { minLength?: number; maxLength?: number; defaultLength?: number; messages?: Partial<PasswordGeneratorMessages> };
}

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const subscribe = () => () => {};
/** Sunucuda ve hidrasyon sırasında false olur; azaltılmış hareket ilk istemci çıktısını hiç değiştirmez. */
const useHydrated = () => useSyncExternalStore(subscribe, () => true, () => false);

/** Güç artınca sözcük yükselir, düşünce iner; yön ölçere bakmadan okunur. */
const rise: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${.3 * direction}em`, filter: `blur(${motionTokens.blur.soft}px)` }),
  center: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: enter } },
  exit: (direction: number) => ({ opacity: 0, y: `${-.3 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } }),
};
const fade: Variants = { enter: { opacity: 0 }, center: { opacity: 1, transition: { duration: motionTokens.duration.fast } }, exit: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };
/** Rakamlar sayaç gibi döner: azalan sayı yukarıdan düşer, artan sayı aşağıdan yükselir. */
const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${.45 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
  center: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { y: motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } } },
  exit: (direction: number) => ({ opacity: 0, y: `${-.45 * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } }),
};

function RollingNumber({ value, reduced }: { value: number; reduced: boolean }) {
  const [track, setTrack] = useState({ value, direction: 1 });
  if (track.value !== value) setTrack({ value, direction: value > track.value ? 1 : -1 });
  const digits = String(value).split("");
  // Sütunlar basamak değerine göre anahtarlanır; 10 → 9 olunca onlar sütunu daralıp kaybolurken birler sütunu döner.
  return <span className={styles.number}>
    <AnimatePresence initial={false} custom={track.direction}>
      {digits.map((digit, index) => <motion.span key={digits.length - 1 - index} className={styles.place} initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : { width: motionTokens.spring.morph, opacity: { duration: motionTokens.duration.fast } }}>
        <AnimatePresence mode="popLayout" initial={false} custom={track.direction}>
          <motion.span key={digit} className={styles.digit} custom={track.direction} variants={reduced ? fade : roll} initial="enter" animate="center" exit="exit">{digit}</motion.span>
        </AnimatePresence>
      </motion.span>)}
    </AnimatePresence>
  </span>;
}

/** İki simgeyi değiştirmek yerine, üstüne bir çizgi çekilen ve altındaki dış çizgiyi kesen tek bir göz. */
function EyeMorph({ slashed, reduced }: { slashed: boolean; reduced: boolean }) {
  const maskId = `eye-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const slash = { pathLength: slashed ? 1 : 0, opacity: slashed ? 1 : 0 };
  const transition: Transition = reduced ? { duration: 0 } : { pathLength: { duration: motionTokens.duration.standard, ease: standard }, opacity: { duration: motionTokens.duration.instant } };
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="white" stroke="none" /><motion.path d="M3 3l18 18" stroke="black" strokeWidth={5} initial={false} animate={slash} transition={transition} /></mask>
    <g mask={`url(#${maskId})`}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></g>
    <motion.path d="M3 3l18 18" initial={false} animate={slash} transition={transition} />
  </svg>;
}

/** İşaret kısa çizgisinden çizilirken altındaki ton büyür; işaret kaldırılınca çizilmesinden daha hızlı geri çekilir. */
function RuleMark({ met, delay, reduced }: { met: boolean; delay: number; reduced: boolean }) {
  return <span className={styles.mark} aria-hidden="true">
    <motion.span className={styles.markFill} initial={false} animate={{ scale: met ? 1 : .5, opacity: met ? 1 : 0 }} transition={reduced ? { duration: 0 } : { scale: { ...motionTokens.spring.snappy, delay }, opacity: { duration: met ? motionTokens.duration.fast : motionTokens.duration.instant, delay } }} />
    <svg className={styles.tick} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <motion.path d="M4.75 8.25 7 10.5l4.25-4.75" initial={false} animate={{ pathLength: met ? 1 : 0, opacity: met ? 1 : 0 }} transition={reduced ? { duration: 0 } : met ? { pathLength: { duration: motionTokens.duration.standard, ease: enter, delay: delay + .06 }, opacity: { duration: .05, delay: delay + .06 } } : { pathLength: { duration: motionTokens.duration.fast, ease: standard }, opacity: { duration: motionTokens.duration.fast, delay: .06 } }} />
    </svg>
  </span>;
}

/** Hata metni satırını yayla açar, sonra sözcükler yerleşir. Satır ölçülen metni izler; satır sarması hiç sıçramaz. */
function ErrorRow({ id, text, reduced }: { id: string; text: string; reduced: boolean }) {
  const copy = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useEffect(() => {
    const node = copy.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setHeight(entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight); });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <motion.span className={styles.errorSlot} initial={{ height: 0, opacity: 0 }} animate={{ height, opacity: 1 }} exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant } } }} transition={reduced ? { duration: 0 } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
    <span ref={copy} id={id} className={styles.error}>
      <AnimatePresence mode="popLayout" initial={false} custom={1}>
        <motion.span key={text} className={styles.errorText} custom={1} variants={reduced ? fade : rise} initial="enter" animate="center" exit="exit">{text}</motion.span>
      </AnimatePresence>
    </span>
  </motion.span>;
}

export const PasswordStrength = forwardRef<HTMLInputElement, PasswordStrengthProps>(function PasswordStrength({ label, value: valueProp, defaultValue = "", onValueChange, onChange, rules = defaultPasswordRules, error, revealed: revealedProp, onRevealedChange, messages: messagesProp, shortLength, countCharacters, generator, id, className, ...props }, ref) {
  const messages: PasswordStrengthMessages = { ...defaultPasswordStrengthMessages, ...messagesProp, levels: { ...defaultPasswordStrengthMessages.levels, ...messagesProp?.levels } };
  const options: EstimateStrengthOptions = { shortLength, levels: messages.levels, countCharacters };
  const generated = useId();
  const controlId = id ?? generated;
  const rulesId = `${controlId}-rules`, errorId = `${controlId}-error`;
  const hydrated = useHydrated();
  const prefersReduced = useReducedMotion();
  const reduced = hydrated && !!prefersReduced;
  const [internal, setInternal] = useState(defaultValue);
  const value = valueProp ?? internal;
  const [revealedInternal, setRevealedInternal] = useState(false);
  const revealed = revealedProp ?? revealedInternal;
  const strength = estimateStrength(value, rules, options);
  const met = new Set(strength.met);

  // Önceki seviye ve kural durumları sözcüğün hangi yöne gideceğini, hangi bölüm ve işaretlerin kademeli dalgaya katılacağını söyler.
  const rank = strength.short ? .5 : strength.level;
  const metKey = strength.met.join(" ");
  const [track, setTrack] = useState({ rank, level: strength.level, previousLevel: strength.level, direction: 1, metKey, previousMet: metKey });
  if (track.rank !== rank || track.metKey !== metKey) setTrack({ rank, level: strength.level, previousLevel: track.rank !== rank ? track.level : track.previousLevel, direction: track.rank === rank ? track.direction : rank > track.rank ? 1 : -1, metKey, previousMet: track.metKey !== metKey ? track.metKey : track.previousMet });
  const previousMet = new Set(track.previousMet.split(" ").filter(Boolean));
  const changed = rules.filter(rule => met.has(rule.id) !== previousMet.has(rule.id)).map(rule => rule.id);

  // Metni yalnız bağlandıktan sonraki bir değişiklik çözer; alan ilk boyamada bulanıklaşarak gelmez.
  const [reveal, setReveal] = useState({ revealed, changed: false });
  if (reveal.revealed !== revealed) setReveal({ revealed, changed: true });

  const shake = useMotionValue(0);
  const shaking = useRef<AnimationPlaybackControls | null>(null);
  const lastError = useRef(error);
  useEffect(() => {
    const previous = lastError.current;
    lastError.current = error;
    if (!error || error === previous || reduced) return;
    // Yana hızla bırakılan bir yay kendiliğinden salınıp durur; telefonda reddedilen alanın sallanması gibi.
    shaking.current?.stop();
    shaking.current = animate(shake, 0, { type: "spring", velocity: -240, stiffness: 900, damping: 15, restDelta: .1 });
  }, [error, reduced, shake]);

  // Üretilen parola alana yazılır ve görünür olur; kullanıcı neyi kaydedeceğini görür.
  function applyGenerated(next: string) {
    if (valueProp === undefined) setInternal(next);
    onValueChange?.(next, estimateStrength(next, rules, options));
    if (revealedProp === undefined) setRevealedInternal(true);
    if (!revealed) onRevealedChange?.(true);
  }
  const generatorOptions = typeof generator === "object" ? generator : {};

  function toggleReveal() {
    if (revealedProp === undefined) setRevealedInternal(!revealed);
    onRevealedChange?.(!revealed);
  }

  const summary = strength.level ? messages.summary({ label: strength.label, met: strength.met.length, total: rules.length }) : "";
  const describedBy = [props["aria-describedby"], error ? errorId : undefined, rulesId].filter(Boolean).join(" ");

  return <div className={styles.field} data-level={strength.level}>
    <label className={styles.label} htmlFor={controlId}>{label}</label>
    <motion.div className={styles.shell} style={{ x: shake }}>
      <input autoComplete="new-password" autoCapitalize="off" autoCorrect="off" spellCheck={false} {...props} ref={ref} id={controlId} type={revealed ? "text" : "password"} value={value}
        onChange={event => { const next = event.target.value; if (valueProp === undefined) setInternal(next); onChange?.(event); onValueChange?.(next, estimateStrength(next, rules, options)); }}
        aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={describedBy} data-reveal={reveal.changed ? (revealed ? "shown" : "hidden") : undefined} className={[styles.input, className].filter(Boolean).join(" ")} />
      <button type="button" className={styles.reveal} onClick={toggleReveal} aria-label={messages.showPassword} aria-pressed={revealed} aria-controls={controlId}><EyeMorph slashed={revealed} reduced={reduced} /></button>
    </motion.div>
    <AnimatePresence initial={false}>{error ? <ErrorRow key="error" id={errorId} text={error} reduced={reduced} /> : null}</AnimatePresence>
    <div className={styles.meterRow}>
      <div className={styles.meter} role="meter" aria-label={messages.meterLabel} aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength.level} aria-valuetext={strength.level ? strength.label : messages.noPassword}>
        {[0, 1, 2, 3].map(index => {
          const on = index < strength.level;
          // Yapıştırılan parola soldan sağa doldurur; silmek sağdan sola boşaltır.
          const wave = on ? index - track.previousLevel : track.previousLevel - 1 - index;
          return <span key={index} className={styles.segment}><motion.span className={styles.fill} initial={false} animate={{ x: on ? "0%" : "-101%" }} transition={reduced ? { duration: 0 } : { ...motionTokens.spring.smooth, delay: Math.max(0, wave) * (on ? .05 : .03) }} /></span>;
        })}
      </div>
      <span className={styles.word} aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false} custom={track.direction}>
          {strength.level ? <motion.span key={strength.label} className={styles.wordText} custom={track.direction} variants={reduced ? fade : rise} initial="enter" animate="center" exit="exit">{strength.label}</motion.span> : null}
        </AnimatePresence>
      </span>
    </div>
    <ul id={rulesId} className={styles.rules} aria-label={messages.rulesLabel}>
      {rules.map(rule => {
        const ok = met.has(rule.id);
        const remaining = value && !ok ? rule.remaining?.(value) ?? 0 : 0;
        const order = changed.indexOf(rule.id);
        return <li key={rule.id} className={styles.rule} data-met={ok || undefined}>
          <RuleMark met={ok} delay={order > 0 ? order * .05 : 0} reduced={reduced} />
          <span className={styles.ruleLabel}>{rule.label}<span className={styles.srOnly}>{ok ? messages.ruleMet : messages.ruleNotMet}</span></span>
          <span className={styles.remaining} aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false} custom={1}>
              {remaining > 0 ? <motion.span key="remaining" className={styles.remainingText} custom={1} variants={reduced ? fade : rise} initial="enter" animate="center" exit="exit">{messages.remainingPrefix ? `${messages.remainingPrefix} ` : null}<RollingNumber value={remaining} reduced={reduced} />{messages.remainingSuffix ? ` ${messages.remainingSuffix}` : null}</motion.span> : null}
            </AnimatePresence>
          </span>
        </li>;
      })}
    </ul>
    {generator ? <PasswordGenerator onGenerate={applyGenerated} value={value} reduced={reduced} minLength={generatorOptions.minLength} maxLength={generatorOptions.maxLength} defaultLength={generatorOptions.defaultLength} messages={{ ...defaultPasswordGeneratorMessages, ...generatorOptions.messages, sets: { ...defaultPasswordGeneratorMessages.sets, ...generatorOptions.messages?.sets } }} /> : null}
    <span className={styles.srOnly} role="status">{summary}</span>
  </div>;
});

PasswordStrength.displayName = "PasswordStrength";

export default PasswordStrength;
