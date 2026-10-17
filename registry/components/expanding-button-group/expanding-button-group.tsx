"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Transition, Variants } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./expanding-button-group.module.css";

export type ExpandingButtonGroupSize = "sm" | "md";
export type ExpandingButtonGroupTone = "neutral" | "danger";

export interface ExpandingButtonGroupItem {
  /** Eylemin kararlı anahtarı. onAction'a verilen değer de budur. */
  id: string;
  /** Düğme açılınca görünen yazı; erişilebilir ad her zaman budur. Kısa bir fiil kullan, ör. "Arşivle". */
  label: string;
  /** Kapalıyken görünen simge. 16 px lucide simgesi uyar; boyutu grup ayarlar. */
  icon: ReactNode;
  /** Eylemi çalıştırır. Onayı atlamak için false döndür ya da reddet. Söz (promise) sonuçlanana kadar düğme meşgul kalır. */
  onSelect?: () => void | boolean | Promise<void | boolean>;
  /** Eylemden sonra yerinde görünen geçmiş zaman sözcüğü, ör. "Arşivlendi". Simge confirmDuration boyunca onay işaretine dönüşür. Bir şey açan eylemlerde verme. */
  doneLabel?: string;
  /** "danger", açık durumu tehlike rengiyle boyar; Sil gibi yıkıcı eylemler içindir. */
  tone?: ExpandingButtonGroupTone;
  /** Soluk ve etkisiz. Odaklanılabilir kalır, yazısını yine gösterir; böylece ne yapacağı öğrenilebilir. */
  disabled?: boolean;
}

export interface ExpandingButtonGroupProps {
  items: readonly ExpandingButtonGroupItem[];
  /** Araç çubuğunun erişilebilir adı, ör. "İleti işlemleri". */
  label: string;
  size?: ExpandingButtonGroupSize;
  /** Dinlenirken yazısı görünen eylemin kimliği, genellikle ana eylem. Varsayılan ilk etkin eylemdir: bir eylem her zaman
   *  açıktır. Başka birini göstermek ya da odaklamak açıklığı oraya taşır; imleç ve odak çekilince buraya döner. */
  defaultExpanded?: string | null;
  /** Bir eylem çalışırken, kendi onSelect'inden önce öğe kimliğiyle çağrılır. */
  onAction?: (id: string) => void;
  /** Onayın ne kadar kalacağı, milisaniye. */
  confirmDuration?: number;
  className?: string;
  style?: CSSProperties;
}

/** Boyuta göre ölçüler. Simge kapalıyken de açıkken de aynı sol boşluğu korur; yazı açılırken yerinden oynamaz. */
const metrics = {
  sm: { height: 28, icon: 14, start: 7, gap: 5, end: 11 },
  md: { height: 36, icon: 16, start: 10, gap: 7, end: 14 },
} as const;

/** Açıklığın komşu eyleme geçmesi için imlecin o eylemin içine girmesi gereken piksel. */
const hysteresis = 4;

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];

/** Genişlik açılırken yazı simgenin arkasından kayarak çıkar, gelişinden biraz daha hızlı geri çekilir. */
const labelVariants: Variants = {
  shown: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: enter, delay: .04 } },
  hidden: { opacity: 0, x: -6, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant, ease: standard } },
};
const reducedLabelVariants: Variants = {
  shown: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } },
  hidden: { opacity: 0, x: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } },
};
const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
const textIn: TargetAndTransition = { opacity: 0, y: "0.5em", filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: "-0.4em", filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } };
const iconIn: TargetAndTransition = { opacity: 0, scale: .55, filter: `blur(${motionTokens.blur.subtle}px)` };
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: motionTokens.duration.fast, ease: standard } };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };
const textEnter: Transition = { duration: motionTokens.duration.standard, ease: enter };
/** Ölçek yayla gider; saydamlık ve bulanıklık ara değerle gider, böylece bulanıklık sıfırın altına taşmaz. */
const iconEnter: Transition = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter }, filter: { duration: motionTokens.duration.fast, ease: enter } };
const instant: Transition = { duration: motionTokens.duration.instant };

/** Onay işareti kısa çizgisinden başlayarak kendini çizer. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <motion.path d="M4 12.5l5 5L20 6.5" initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: motionTokens.duration.standard, ease: enter, delay: .06 }, opacity: { duration: .05, delay: .06 } }} />
  </svg>;
}

interface ItemProps {
  item: ExpandingButtonGroupItem;
  size: ExpandingButtonGroupSize;
  expanded: boolean;
  done: boolean;
  busy: boolean;
  tabStop: boolean;
  reduced: boolean;
  onPointerDown: (item: ExpandingButtonGroupItem, event: PointerEvent<HTMLButtonElement>) => void;
  onClick: (item: ExpandingButtonGroupItem) => void;
  onFocus: (item: ExpandingButtonGroupItem, event: FocusEvent<HTMLButtonElement>) => void;
}

function Item({ item, size, expanded, done, busy, tabStop, reduced, onPointerDown, onClick, onFocus }: ItemProps) {
  const m = metrics[size];
  const labelRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(0);

  // İki sözcüğün gizli kopyaları yazının ızgara hücresini paylaşır; yuva hep uzun olanın genişliğindedir. Onay
  // geçişi genişliği değiştirmez, sunucu çıktısı da ölçümden önce doğru genişliğe sahiptir.
  // Yarım pikselden küçük değişiklikler yok sayılır; yeniden ölçüm satırı titretmez.
  useLayoutEffect(() => {
    const measure = () => {
      const next = Math.max(labelRef.current?.getBoundingClientRect().width ?? 0, doneRef.current?.getBoundingClientRect().width ?? 0);
      setText(current => Math.abs(current - next) < .5 ? current : next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    if (labelRef.current) observer.observe(labelRef.current);
    if (doneRef.current) observer.observe(doneRef.current);
    return () => observer.disconnect();
  }, [item.label, item.doneLabel, size]);

  const showDone = done && !!item.doneLabel;
  const measured = text > 0;
  const target = expanded && measured ? m.start + m.icon + m.gap + text + m.end : m.height;
  const width = useMotionValue<number>(target);
  const settled = useRef(false);

  // Genişlik morph yayıyla gider; komşular kayar, grubun kendi genişliği sıçramadan takip eder. İlk ölçülen
  // genişlik (ve azaltılmış harekette her genişlik) hemen yerleştirilir.
  useLayoutEffect(() => {
    if (!settled.current || reduced) {
      width.jump(target);
      if (measured) settled.current = true;
      return;
    }
    animate(width, target, motionTokens.spring.morph);
  }, [target, measured, reduced, width]);

  const word = showDone ? item.doneLabel! : item.label;
  return <motion.button
    type="button"
    className={styles.item}
    style={{ width }}
    data-ebg-item=""
    data-id={item.id}
    data-tone={item.tone ?? "neutral"}
    data-state={showDone ? "done" : "idle"}
    data-expanded={expanded || undefined}
    data-unmeasured={measured ? undefined : ""}
    aria-label={item.label}
    aria-disabled={item.disabled || undefined}
    aria-busy={busy || undefined}
    tabIndex={tabStop ? 0 : -1}
    onPointerDown={event => onPointerDown(item, event)}
    onClick={() => onClick(item)}
    onFocus={event => onFocus(item, event)}
  >
    <span className={styles.icon} aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.span key={showDone ? "done" : "icon"} className={styles.glyph} initial={reduced ? fadeIn : iconIn} animate={rest} exit={reduced ? fadeOut : iconOut} transition={reduced ? instant : iconEnter}>
          {showDone ? <DrawnCheck reduced={reduced} /> : item.icon}
        </motion.span>
      </AnimatePresence>
    </span>
    <motion.span className={styles.label} aria-hidden="true" variants={reduced ? reducedLabelVariants : labelVariants} initial={false} animate={expanded ? "shown" : "hidden"}>
      <AnimatePresence initial={false}>
        <motion.span key={word} className={styles.word} initial={reduced ? fadeIn : textIn} animate={rest} exit={reduced ? fadeOut : textOut} transition={reduced ? instant : textEnter}>{word}</motion.span>
      </AnimatePresence>
      <span ref={labelRef} className={styles.sizer}>{item.label}</span>
      {item.doneLabel ? <span ref={doneRef} className={styles.sizer}>{item.doneLabel}</span> : null}
    </motion.span>
  </motion.button>;
}

/**
 * Eylemler için simge düğmelerinden oluşan kompakt bir hap. Bir eylem hep yazısını gösterir; üzerine geldiğin ya da odakladığın
 * yazıyı devralır, komşuları kenara kayar. Eylem yerinde onaylanabilir: simge onay işareti çizer, yazı geçmiş zaman sözcüğüne döner.
 * Dokunmatikte ilk dokunuş yazıyı açar, ikinci dokunuş eylemi çalıştırır.
 */
export function ExpandingButtonGroup({ items, label, size = "md", defaultExpanded = null, onAction, confirmDuration = 1400, className, style }: ExpandingButtonGroupProps) {
  const reduced = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; seq: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  // Ref'ler imlecin ve klavyenin şu an ne yaptığını yansıtır; çıkış ve odak kaybı işleyicileri doğru duruma dönebilsin diye.
  const pointerOver = useRef<string | null>(null);
  const pointerAt = useRef<{ x: number; y: number } | null>(null);
  const keyFocus = useRef<string | null>(null);
  const touchOpen = useRef<string | null>(null);
  const press = useRef<{ id: string; kind: string; wasExpanded: boolean } | null>(null);
  const doneRef = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const seq = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); };
  }, []);

  const has = (id: string | null) => !!id && items.some(item => item.id === id);
  // Bir eylem her zaman açıktır: dinlenen eylem defaultExpanded, yoksa ilk etkin eylemdir.
  const firstEnabled = items.find(item => !item.disabled)?.id ?? items[0]?.id ?? null;
  const restId = has(defaultExpanded) ? defaultExpanded : firstEnabled;
  const expandedId = has(intent) ? intent : restId;
  const tabStop = has(focused) ? focused : restId;

  // Dışarıya dokunmak, ilk dokunuşla açılan yazıyı kapatır.
  useEffect(() => {
    if (!intent || touchOpen.current !== intent) return;
    const onDown = (event: globalThis.PointerEvent) => {
      if (root.current?.contains(event.target as Node)) return;
      touchOpen.current = null;
      setIntent(doneRef.current ?? keyFocus.current);
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [intent]);

  const confirm = useCallback((item: ExpandingButtonGroupItem) => {
    if (timer.current) clearTimeout(timer.current);
    seq.current += 1;
    doneRef.current = item.id;
    setDone({ id: item.id, seq: seq.current });
    // Sıfır genişlikli boşluk dönüşümlü eklenir; aynı sözcük tekrar eylemde yeniden duyurulsun diye.
    setAnnouncement(`${item.doneLabel}${seq.current % 2 ? "" : "​"}`);
    timer.current = setTimeout(() => {
      doneRef.current = null;
      setDone(null);
      // İmleç ya da klavye hâlâ üzerindeyse kapanmaz.
      if (pointerOver.current !== item.id && keyFocus.current !== item.id) {
        if (touchOpen.current === item.id) touchOpen.current = null;
        setIntent(current => current === item.id ? pointerOver.current ?? keyFocus.current : current);
      }
    }, confirmDuration);
  }, [confirmDuration]);

  const activate = useCallback(async (item: ExpandingButtonGroupItem) => {
    if (item.disabled || busy === item.id || doneRef.current === item.id) return;
    setIntent(item.id);
    onAction?.(item.id);
    let result: void | boolean;
    try {
      const pending = item.onSelect?.();
      if (pending instanceof Promise) {
        setBusy(item.id);
        result = await pending;
      } else result = pending;
    } catch {
      result = false;
    } finally {
      if (mounted.current) setBusy(current => current === item.id ? null : current);
    }
    if (!mounted.current || result === false || !item.doneLabel) return;
    confirm(item);
  }, [busy, confirm, onAction]);

  const onItemPointerDown = (item: ExpandingButtonGroupItem, event: PointerEvent<HTMLButtonElement>) => {
    press.current = { id: item.id, kind: event.pointerType, wasExpanded: expandedId === item.id };
  };

  const onItemClick = (item: ExpandingButtonGroupItem) => {
    const last = press.current;
    press.current = null;
    // Dokunmatikte üzerine gelme yoktur: ilk dokunuş yazıyı açar, ikincisi çalıştırır. Yazısı zaten görünen öğe hemen çalışır.
    if (last && last.id === item.id && last.kind === "touch" && !last.wasExpanded) {
      touchOpen.current = item.id;
      setIntent(item.id);
      return;
    }
    if (last?.kind === "touch") touchOpen.current = item.id;
    void activate(item);
  };

  const onItemFocus = (item: ExpandingButtonGroupItem, event: FocusEvent<HTMLButtonElement>) => {
    setFocused(item.id);
    // Yalnız klavye odağı açar; fare tıklaması ve dokunuşun kendi yolu vardır, yoksa yazı açık kalırdı.
    let visible = true;
    try { visible = event.currentTarget.matches(":focus-visible"); } catch { /* eski motorlarda her odak açar */ }
    if (!visible) return;
    keyFocus.current = item.id;
    setIntent(item.id);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (root.current?.contains(event.relatedTarget as Node | null)) return;
    keyFocus.current = null;
    touchOpen.current = null;
    setIntent(pointerOver.current ?? doneRef.current);
  };

  // Üzerine gelme yalnız gerçek imleç hareketini izler. Açılma düğmeleri oynatır; duran imlecin altına kayan düğme
  // devralmamalı, yoksa iki komşu durmadan yer değiştirirdi.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const at = pointerAt.current;
    if (at && Math.abs(at.x - event.clientX) < 1 && Math.abs(at.y - event.clientY) < 1) return;
    pointerAt.current = { x: event.clientX, y: event.clientY };
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-ebg-item]");
    const id = button?.dataset.id;
    if (!button || !id || id === pointerOver.current) return;
    // Histerezis: bir eylemden diğerine geçmek için imleç yenisinin birkaç piksel içine girmeli; sınırda durmak
    // ikisi arasında gidip gelmeye yol açmaz.
    if (pointerOver.current) {
      const box = button.getBoundingClientRect();
      if (event.clientX < box.left + hysteresis || event.clientX > box.right - hysteresis) return;
    }
    pointerOver.current = id;
    setIntent(id);
  };

  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    pointerAt.current = null;
    pointerOver.current = null;
    setIntent(doneRef.current ?? keyFocus.current);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("[data-ebg-item]") ?? []);
    const index = list.findIndex(button => button === document.activeElement);
    if (index < 0) return;
    const last = list.length - 1;
    const target = event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
        : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (target < 0) return;
    event.preventDefault();
    list[target]!.focus();
  };

  const m = metrics[size];
  const vars = { "--ebg-h": `${m.height}px`, "--ebg-icon": `${m.icon}px`, "--ebg-start": `${m.start}px`, "--ebg-gap": `${m.gap}px`, "--ebg-end": `${m.end}px`, ...style } as CSSProperties;

  return <div
    ref={root}
    role="toolbar"
    aria-label={label}
    aria-orientation="horizontal"
    className={[styles.group, styles[size], className].filter(Boolean).join(" ")}
    style={vars}
    onKeyDown={onKeyDown}
    onBlur={onBlur}
    onPointerMove={onPointerMove}
    onPointerLeave={onPointerLeave}
  >
    {items.map(item => <Item
      key={item.id}
      item={item}
      size={size}
      expanded={expandedId === item.id}
      done={done?.id === item.id}
      busy={busy === item.id}
      tabStop={tabStop === item.id}
      reduced={reduced}
      onPointerDown={onItemPointerDown}
      onClick={onItemClick}
      onFocus={onItemFocus}
    />)}
    <span className={styles.srOnly} role="status" aria-live="polite">{announcement}</span>
  </div>;
}

export default ExpandingButtonGroup;
