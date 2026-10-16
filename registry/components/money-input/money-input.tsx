"use client";

import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import type { ClipboardEvent as ReactClipboardEvent, FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { MONEY_CURRENCIES, SYMBOLS, currencyInfo, draftToMinor, formatAmount, formatWhole, majorToMinor, matchesTypeahead, minorToDraft, pastedToDraft, rangeText } from "./money-input-format";
import type { CurrencyInfo, MoneyCurrency } from "./money-input-format";
import styles from "./money-input.module.css";

export type { MoneyCurrency };

export interface MoneyInputDetails {
  currency: MoneyCurrency;
  /** Ana birimdeki tutar, ₺12,50 için 12.5. Yalnız bilgi içindir; hesap kuruşla yapılır. */
  major: number | null;
  /** Tutarın tam yazımı, "₺12,50". */
  formatted: string;
}

export interface MoneyInputProps {
  label: string;
  hideLabel?: boolean;
  /** Kuruş (alt birim) tam sayısı: ₺12,50 → 1250. `null` boştur. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null, details: MoneyInputDetails) => void;
  /** Birim kodu: "TRY", "USD" ya da "EUR". */
  currency?: MoneyCurrency;
  defaultCurrency?: MoneyCurrency;
  onCurrencyChange?: (currency: MoneyCurrency) => void;
  /** Menüde sunulan birimler. Tek kod verilirse menü gizlenir. */
  currencies?: MoneyCurrency[];
  /** Kuruş cinsinden en düşük tutar. Alan odağı bırakınca denetlenir. */
  min?: number;
  /** Kuruş cinsinden en yüksek tutar. Onu aşan yazım bir itmeyle geri çevrilir. */
  max?: number;
  /** Ana birimde hızlı ekle düğmeleri. Boş dizi düğmeleri gizler. */
  quickAdd?: number[];
  /** Ok tuşlarının kuruş cinsinden adımı. Varsayılan bir ana birim; Shift on katını alır. */
  step?: number;
  description?: string;
  /** Yerleşik aralık iletisinin yerine geçer. */
  error?: string;
  disabled?: boolean;
  /** Kuruş tutarını taşıyan gizli bir girdi ekler. */
  name?: string;
  id?: string;
  className?: string;
  onBlur?: (event: ReactFocusEvent<HTMLInputElement>) => void;
}

type Source = "type" | "chip" | "key" | "external";
type Part = { key: string; char: string; ghost: boolean };

type Bezier = [number, number, number, number];
const enterEase = [...motionTokens.ease.enter] as Bezier;
const standardEase = [...motionTokens.ease.standard] as Bezier;
const { spring, blur, duration } = motionTokens;
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const GLIDE = physical(.28, .08);
/** Sınır değişikliği geri çevirince yana bir tekme: tutar basılan yöne gerilir ve yayla yerine döner. */
const KICK = physical(.42, .3);
const MAX_INTEGER_DIGITS = 12;

const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/* Taslak, yazılan tutarın kanonik biçimidir: rakamlar ve isteğe bağlı tek ".", örneğin "1234.5". Kuruşa okuma ve geri yazma ABACUS'tadır (money-input-format.ts). */
const pow10 = (digits: number) => 10 ** digits;
/** Taslağı geri okunacağı biçimde oturtur: kuruş haneleri tamamlanır, baştaki sıfırlar gider. */
function settle(draft: string, digits: number) { return draft ? minorToDraft(draftToMinor(draft), digits) : ""; }
/** Tutarı farklı alt birim haneli birimler arasında ana tutarı koruyarak taşır. */
function convertDraft(draft: string, digits: number) {
  if (!draft) return "";
  const [whole = "", fraction] = draft.split(".");
  if (!digits) return whole || "0";
  return fraction === undefined ? whole : `${whole}.${fraction.slice(0, digits)}`;
}

function groupInteger(whole: string, group: string) { return whole.replace(/\B(?=(\d{3})+(?!\d))/g, group); }
function displayOf(draft: string, symbols: { group: string; decimal: string }) {
  if (!draft) return "";
  const [whole = "", fraction] = draft.split(".");
  return groupInteger(whole, symbols.group) + (fraction !== undefined ? symbols.decimal + fraction : "");
}

/** Sütunlar basamak değerine göre anahtarlanır; 9 → 10 olunca birler sütunu birler sütunu kalır. Eksik kuruş haneleri genişliğini tutan soluk hayaletlerdir. */
function partsOf(draft: string, digits: number, symbols: { group: string; decimal: string }): Part[] {
  const [whole = "", fraction] = draft ? draft.split(".") : [];
  const parts: Part[] = [];
  const intDigits = whole || "0";
  const ghostInt = !whole;
  [...intDigits].forEach((char, index) => {
    const place = intDigits.length - 1 - index;
    parts.push({ key: `i${place}`, char, ghost: ghostInt });
    if (place > 0 && place % 3 === 0) parts.push({ key: `g${place}`, char: symbols.group, ghost: ghostInt });
  });
  if (digits) {
    parts.push({ key: "d", char: symbols.decimal, ghost: fraction === undefined });
    for (let index = 0; index < digits; index++) parts.push({ key: `f${index}`, char: fraction?.[index] ?? "0", ghost: fraction === undefined || index >= fraction.length });
  }
  return parts;
}

/* Sütunlar genişliğini açarken rakam değişim yönünde yükselir. Yazarken sonuca doğrudan geçilir; imleç hiç geride kalmaz. */
const column: Variants = {
  enter: { width: 0, opacity: 0 },
  center: { width: "auto", opacity: 1, transition: { width: spring.morph, opacity: { duration: duration.fast } } },
  exit: { width: 0, opacity: 0, transition: { width: spring.smooth, opacity: { duration: duration.instant } } },
};
const columnCut: Variants = { enter: { width: "auto", opacity: 1 }, center: { width: "auto", opacity: 1, transition: { duration: 0 } }, exit: { width: 0, opacity: 0, transition: { duration: 0 } } };
const glyph: Variants = {
  enter: (dir: number) => ({ y: `${dir * .55}em`, opacity: 0, filter: `blur(${blur.soft}px)` }),
  center: { y: 0, opacity: 1, filter: "blur(0px)", transitionEnd: { filter: "none" }, transition: { y: spring.snappy, opacity: { duration: duration.fast, ease: enterEase }, filter: { duration: duration.exit, ease: enterEase } } },
  exit: (dir: number) => ({ y: `${dir * -.55}em`, opacity: 0, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: standardEase } }),
};
const glyphCut: Variants = { enter: { y: 0, opacity: 1, filter: "none" }, center: { y: 0, opacity: 1, filter: "none", transition: { duration: 0 } }, exit: { opacity: 0, transition: { duration: 0 } } };
const glyphFade: Variants = { enter: { y: 0, opacity: 0, filter: "none" }, center: { y: 0, opacity: 1, filter: "none", transition: { duration: duration.instant } }, exit: { opacity: 0, transition: { duration: 0 } } };

function Glyphs({ parts, direction, instant, reduced }: { parts: Part[]; direction: number; instant: boolean; reduced: boolean }) {
  const columnVariants = instant || reduced ? columnCut : column;
  const glyphVariants = instant ? glyphCut : reduced ? glyphFade : glyph;
  return <AnimatePresence initial={false} custom={direction}>
    {parts.map(part => <motion.span key={part.key} className={styles.column} data-ghost={part.ghost || undefined} custom={direction} variants={columnVariants} initial="enter" animate="center" exit="exit">
      <span className={styles.sizer}>{part.char}</span>
      <AnimatePresence initial={false} custom={direction}>
        <motion.span key={part.char} className={styles.glyph} custom={direction} variants={glyphVariants} initial="enter" animate="center" exit="exit">{part.char}</motion.span>
      </AnimatePresence>
    </motion.span>)}
  </AnimatePresence>;
}

/** Birim simgesi kısa bir dönüşle değişir, yuvası yeni genişliğe yaylanır. */
function SymbolSlot({ symbol, reduced }: { symbol: string; reduced: boolean }) {
  const sizerRef = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  const measured = useRef(false);
  useLayoutEffect(() => {
    const node = sizerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (!measured.current || reduced) width.jump(node.offsetWidth); else animate(width, node.offsetWidth, spring.morph);
      measured.current = true;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, width]);
  return <motion.span className={styles.symbol} style={{ width }} aria-hidden="true">
    <span ref={sizerRef} className={styles.symbolSizer}>{symbol}</span>
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span key={symbol} className={styles.symbolGlyph} initial={reduced ? { opacity: 0 } : { opacity: 0, y: ".4em", filter: `blur(${blur.soft}px)` }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: reduced ? 0 : "-.3em", transition: { duration: duration.instant } }}
        transition={reduced ? { duration: duration.instant } : { y: spring.snappy, opacity: { duration: duration.fast }, filter: { duration: duration.exit } }}>{symbol}</motion.span>
    </AnimatePresence>
  </motion.span>;
}

const isSignificant = (char: string, decimal: string) => /\d/.test(char) || char === decimal;
function positionAfter(text: string, count: number, decimal: string) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index++) if (isSignificant(text[index]!, decimal) && ++seen === count) return index + 1;
  return text.length;
}

/**
 * Para tutarı kutusu. Rakamlar yazılırken imleç kaymadan gruplanır, eksik kuruşlar soluk hayalet olarak bekler (tutar
 * oturunca genişlik değişmez), uzun tutar kaymak yerine sığacak kadar küçülür; hızlı ekle düğmeleri ve ok tuşları rakamları
 * döndürür. Değer kuruş olarak çıkar: ₺12,50 → 1250.
 */
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput({
  label, hideLabel = false, value, defaultValue = null, onValueChange, currency: currencyProp, defaultCurrency = "TRY", onCurrencyChange,
  currencies = MONEY_CURRENCIES, min, max, quickAdd = [100, 500, 1000], step: stepProp,
  description, error, disabled = false, name, id, className, onBlur,
}, forwardedRef) {
  const reduced = useReducedFlag();
  const uid = useId();
  const inputId = id ?? `${uid}-amount`;
  const hintId = `${inputId}-hint`, errorId = `${inputId}-error`, rangeId = `${inputId}-range`;

  const [innerCurrency, setInnerCurrency] = useState<MoneyCurrency>(defaultCurrency);
  const code = currencyProp ?? innerCurrency;
  const info = useMemo(() => currencyInfo(code), [code]);
  const symbols = SYMBOLS;
  const step = stepProp && stepProp > 0 ? stepProp : pow10(info.digits);

  const [draft, setDraft] = useState(() => minorToDraft(value !== undefined ? value : defaultValue, info.digits));
  const minor = draftToMinor(draft);

  const [seenValue, setSeenValue] = useState(value);
  const [source, setSource] = useState<Source>("external");
  const [direction, setDirection] = useState(1);
  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== undefined && value !== minor) {
      setDraft(minorToDraft(value, info.digits));
      setSource("external");
      setDirection((value ?? 0) >= (minor ?? 0) ? 1 : -1);
    }
  }

  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [limitFlash, setLimitFlash] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [, rerender] = useReducer((count: number) => count + 1, 0);

  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);
  const pendingCaret = useRef<number | null>(null);
  const latest = useRef({ minor, draft });
  useLayoutEffect(() => { latest.current = { minor, draft }; });

  const money = useCallback((amount: number | null) => amount === null ? "" : formatAmount(amount, info.code), [info]);
  const display = displayOf(draft, symbols);
  const parts = useMemo(() => partsOf(draft, info.digits, symbols), [draft, info.digits, symbols]);

  /* ---------------------------------------------- Sınırlar ve geri bildirim ---------------------------------------------- */

  const bumpX = useMotionValue(0);
  const flashTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(flashTimer.current), []);
  function refuse(toward: 1 | -1, limit: number) {
    if (!reduced) animate(bumpX, 0, { ...KICK, velocity: toward * 160 });
    setLimitFlash(count => count + 1);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setLimitFlash(0), 1400);
    setAnnouncement(`${toward > 0 ? "En çok" : "En az"} ${money(limit)}`);
  }

  function emit(nextMinor: number | null, nextInfo: CurrencyInfo = info) {
    onValueChange?.(nextMinor, { currency: nextInfo.code, major: nextMinor === null ? null : nextMinor / pow10(nextInfo.digits), formatted: nextMinor === null ? "" : formatAmount(nextMinor, nextInfo.code) });
  }

  function setAmount(nextDraft: string, nextSource: Source) {
    const nextMinor = draftToMinor(nextDraft);
    setDirection((nextMinor ?? 0) >= (latest.current.minor ?? 0) ? 1 : -1);
    setSource(nextSource);
    setDraft(nextDraft);
    latest.current = { minor: nextMinor, draft: nextDraft };
    if (nextMinor !== minor) emit(nextMinor);
    if (nextSource !== "type") setAnnouncement(money(nextMinor));
  }

  /* ---------------------------------------------- Yazma ---------------------------------------------- */

  /** Kutudaki metni taslağa okur ve imleçten önceki rakam ve ondalık ayracını sayar; imleç aynı yere dönebilsin. */
  function sanitize(raw: string, caret: number) {
    let out = "", before = 0, dot = false;
    for (let index = 0; index < raw.length; index++) {
      const char = raw[index]!;
      let kept = "";
      if (/\d/.test(char)) kept = char;
      else if ((char === symbols.decimal || (char === "." && symbols.group !== ".")) && info.digits > 0 && !dot) { kept = "."; dot = true; }
      if (!kept) continue;
      out += kept;
      if (index < caret) before++;
    }
    const pieces = out.split(".");
    let whole = pieces[0]!;
    const fraction = pieces[1];
    const stripped = whole.length - (whole.replace(/^0+/, "").length);
    whole = whole.replace(/^0+/, "");
    let shift = -Math.min(stripped, before);
    if (fraction !== undefined && !whole) { whole = "0"; shift += 1; }
    if (fraction === undefined && !whole && stripped) { whole = "0"; shift += 1; }
    if (fraction !== undefined && fraction.length > info.digits) return null;
    if (whole.length > MAX_INTEGER_DIGITS) return null;
    return { draft: fraction !== undefined ? `${whole}.${fraction}` : whole, before: Math.max(0, before + shift) };
  }

  function applyRaw(raw: string, caret: number) {
    const result = sanitize(raw, caret);
    // Geri çevrilen tuşta imleç yerinde kalır: tarayıcının bıraktığı yerden bir anlamlı karakter önce.
    if (!result) { pendingCaret.current = Math.max(0, [...raw.slice(0, caret)].filter(char => isSignificant(char, symbols.decimal) || char === ".").length - 1); rerender(); return; }
    const nextMinor = draftToMinor(result.draft);
    if (max !== undefined && nextMinor !== null && nextMinor > max) {
      pendingCaret.current = Math.max(0, result.before - 1);
      refuse(1, max);
      rerender();
      return;
    }
    pendingCaret.current = result.before;
    setAmount(result.draft, "type");
  }

  useLayoutEffect(() => {
    const input = inputRef.current, count = pendingCaret.current;
    pendingCaret.current = null;
    if (!input || count === null || document.activeElement !== input) return;
    const position = positionAfter(input.value, count, symbols.decimal);
    input.setSelectionRange(position, position);
  });

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const moves: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key in moves) {
      event.preventDefault();
      const amount = moves[event.key]! * step * (event.shiftKey && Math.abs(moves[event.key]!) === 1 ? 10 : 1);
      nudge(amount, "key");
      return;
    }
    if (event.key === "Enter") { setDraft(settle(draft, info.digits)); pendingCaret.current = Number.MAX_SAFE_INTEGER; return; }
    const start = input.selectionStart ?? 0, end = input.selectionEnd ?? 0;
    if (start !== end || event.metaKey || event.ctrlKey || event.altKey) return;
    // Binlik ayracını silmek boşa gitmez, ondan önceki rakamı siler.
    if (event.key === "Backspace" && start > 1 && input.value[start - 1] === symbols.group) { event.preventDefault(); applyRaw(input.value.slice(0, start - 2) + input.value.slice(start - 1), start - 2); }
    if (event.key === "Delete" && input.value[start] === symbols.group) { event.preventDefault(); applyRaw(input.value.slice(0, start + 1) + input.value.slice(start + 2), start); }
  }

  function onPaste(event: ReactClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text").trim();
    if (!text) return;
    event.preventDefault();
    // "₺1.234,56", "1234,5", "220,75 USD": ABACUS'un okuduğu Türkçe biçimler. Okunamayan metin (İngilizce biçim dahil) yapıştırılmaz.
    const pasted = pastedToDraft(text);
    if (pasted === null) { setAnnouncement("Tutar okunamadı"); return; }
    const input = event.currentTarget;
    const start = input.selectionStart ?? 0, end = input.selectionEnd ?? 0;
    const inserted = displayOf(pasted, symbols);
    const replaceAll = start === 0 && end === input.value.length || !input.value;
    const raw = replaceAll ? inserted : input.value.slice(0, start) + inserted + input.value.slice(end);
    applyRaw(raw, replaceAll ? raw.length : start + inserted.length);
  }

  /* ---------------------------------------------- Adımlar ve hızlı ekle ---------------------------------------------- */

  function nudge(amount: number, nextSource: Source) {
    const from = latest.current.minor ?? 0;
    const floor = min ?? 0, ceiling = max ?? Number.MAX_SAFE_INTEGER;
    let next = from + amount;
    if (next > ceiling) { if (from >= ceiling) { refuse(1, ceiling); return; } next = ceiling; refuse(1, ceiling); }
    if (next < floor) { if (from <= floor && latest.current.minor !== null) { refuse(-1, floor); return; } next = floor; }
    pendingCaret.current = Number.MAX_SAFE_INTEGER;
    setAmount(minorToDraft(next, info.digits), nextSource);
  }

  /* ---------------------------------------------- Genişliğe sığdırma ---------------------------------------------- */

  const wrapRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const scale = useMotionValue(1);
  useLayoutEffect(() => {
    const wrap = wrapRef.current, group = groupRef.current;
    if (!wrap || !group || typeof ResizeObserver === "undefined") return;
    let first = true;
    const fit = () => {
      const natural = group.offsetWidth, room = wrap.clientWidth;
      const next = natural > 0 && room > 0 ? Math.min(1, room / natural) : 1;
      if (first || reduced) scale.jump(next); else animate(scale, next, spring.smooth);
      first = false;
    };
    const observer = new ResizeObserver(fit);
    observer.observe(wrap); observer.observe(group);
    return () => observer.disconnect();
  }, [reduced, scale]);

  /* ---------------------------------------------- Birim menüsü ---------------------------------------------- */

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCode, setActiveCode] = useState<MoneyCurrency>(code);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef(new Map<string, HTMLElement>());
  const options = useMemo(() => currencies.map(entry => currencyInfo(entry)), [currencies]);
  const canSwitch = options.length > 1;

  const openMenu = () => { if (disabled) return; setActiveCode(code); setMenuOpen(true); };
  const closeMenu = useCallback((focusButton: boolean) => { setMenuOpen(false); if (focusButton) menuButtonRef.current?.focus({ preventScroll: true }); }, []);
  useLayoutEffect(() => { if (menuOpen) listRef.current?.focus({ preventScroll: true }); }, [menuOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const down = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node)) closeMenu(false); };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [closeMenu, menuOpen]);

  const hy = useMotionValue(0), hh = useMotionValue(0), ho = useMotionValue(0);
  useLayoutEffect(() => {
    const node = menuOpen ? optionRefs.current.get(activeCode) : undefined;
    if (!node) { ho.jump(0); return; }
    if (ho.get() < .05 || reduced) { hy.jump(node.offsetTop); hh.jump(node.offsetHeight); } else { animate(hy, node.offsetTop, GLIDE); animate(hh, node.offsetHeight, GLIDE); }
    ho.jump(1);
    node.scrollIntoView?.({ block: "nearest" });
  }, [activeCode, hh, ho, hy, menuOpen, reduced]);

  function chooseCurrency(next: CurrencyInfo) {
    closeMenu(true);
    if (next.code === code) return;
    const nextDraft = focused ? convertDraft(draft, next.digits) : settle(convertDraft(draft, next.digits), next.digits);
    const nextMinor = draftToMinor(nextDraft);
    if (currencyProp === undefined) setInnerCurrency(next.code);
    onCurrencyChange?.(next.code);
    setSource("external");
    setDraft(nextDraft);
    latest.current = { minor: nextMinor, draft: nextDraft };
    emit(nextMinor, next);
    setAnnouncement(`${next.name}${nextMinor === null ? "" : `, ${formatAmount(nextMinor, next.code)}`}`);
  }

  const typeahead = useRef({ buffer: "", at: 0 });
  function onMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const at = options.findIndex(option => option.code === activeCode);
    const go = (index: number) => { event.preventDefault(); setActiveCode(options[Math.max(0, Math.min(options.length - 1, index))]!.code); };
    switch (event.key) {
      case "ArrowDown": go(at + 1); return;
      case "ArrowUp": go(at - 1); return;
      case "Home": go(0); return;
      case "End": go(options.length - 1); return;
      case "Enter": case " ": event.preventDefault(); if (options[at]) chooseCurrency(options[at]); return;
      case "Escape": event.preventDefault(); event.stopPropagation(); closeMenu(true); return;
      case "Tab": closeMenu(false); return;
    }
    if (event.key.length === 1 && /[\p{L}\p{N}]/u.test(event.key)) {
      const now = performance.now(), state = typeahead.current;
      state.buffer = now - state.at > 600 ? event.key : state.buffer + event.key;
      state.at = now;
      const hit = options.find(option => matchesTypeahead(option, state.buffer));
      if (hit) { event.preventDefault(); setActiveCode(hit.code); }
    }
  }

  /* ---------------------------------------------- İletiler ---------------------------------------------- */

  const range = rangeText(info.code, min, max);
  const outOfRange = minor !== null && ((min !== undefined && minor < min) || (max !== undefined && minor > max));
  const belowMin = minor !== null && min !== undefined && minor < min;
  const builtIn = touched && !focused && outOfRange ? belowMin ? `En az ${money(min ?? 0)} olmalı` : `En çok ${money(max ?? 0)} olabilir` : undefined;
  const message = error ?? builtIn;
  const invalid = !!message;
  const describedBy = [range ? rangeId : null, description ? hintId : null, message ? errorId : null].filter(Boolean).join(" ") || undefined;
  const instant = source === "type";
  const chips = quickAdd.filter(amount => amount > 0);

  return <div className={[styles.field, className].filter(Boolean).join(" ")} data-disabled={disabled || undefined}>
    <label htmlFor={inputId} className={hideLabel ? styles.srOnly : styles.label}>{label}</label>

    <div className={styles.control} data-invalid={invalid || undefined} data-focused={focused || undefined}>
      <div ref={wrapRef} className={styles.amountWrap} onMouseDown={event => { if (event.target !== inputRef.current) event.preventDefault(); }}
        onClick={event => { if (!disabled && event.target !== inputRef.current) { const input = inputRef.current; input?.focus(); input?.setSelectionRange(input.value.length, input.value.length); } }}>
        <motion.div ref={groupRef} className={styles.group} style={{ scale, x: bumpX }}>
          <SymbolSlot symbol={info.symbol} reduced={reduced} />
          <span className={styles.number}>
            <span className={styles.mirror} aria-hidden="true" data-empty={!draft || undefined}><Glyphs parts={parts} direction={direction} instant={instant} reduced={reduced} /></span>
            <input ref={inputRef} id={inputId} className={styles.input} type="text" role="spinbutton" inputMode={info.digits ? "decimal" : "numeric"} autoComplete="off" spellCheck={false}
              value={display} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={describedBy} aria-label={hideLabel ? label : undefined}
              aria-valuenow={minor === null ? undefined : minor / pow10(info.digits)} aria-valuetext={minor === null ? "Boş" : money(minor)}
              aria-valuemin={min === undefined ? undefined : min / pow10(info.digits)} aria-valuemax={max === undefined ? undefined : max / pow10(info.digits)}
              onChange={event => applyRaw(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)}
              onKeyDown={onKeyDown} onPaste={onPaste} onFocus={() => setFocused(true)}
              onBlur={event => { setFocused(false); setTouched(true); if (draft) setDraft(settle(draft, info.digits)); onBlur?.(event); }} />
          </span>
        </motion.div>
      </div>

      {canSwitch ? <div ref={menuRef} className={styles.menuAnchor}>
        <button ref={menuButtonRef} type="button" className={styles.currencyButton} disabled={disabled} aria-haspopup="listbox" aria-expanded={menuOpen} aria-controls={`${uid}-currencies`}
          aria-label={`Para birimi, ${info.name}`} data-open={menuOpen || undefined} onClick={() => (menuOpen ? closeMenu(true) : openMenu())}
          onKeyDown={event => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); openMenu(); } }}>
          <span className={styles.code}>{code}</span>
          <motion.span className={styles.chevron} aria-hidden="true" initial={false} animate={{ rotate: menuOpen ? 180 : 0 }} transition={reduced ? { duration: 0 } : GLIDE}><ChevronDown size={16} strokeWidth={1.75} /></motion.span>
        </button>
        <AnimatePresence>
          {menuOpen && <motion.div key="menu" className={styles.menu}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .96, y: -4, filter: `blur(${blur.subtle}px)` }} animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0, transition: { duration: duration.instant } } : { opacity: 0, scale: .97, y: -2, filter: `blur(${blur.subtle}px)`, transition: { duration: duration.instant, ease: standardEase } }}
            transition={reduced ? { duration: duration.instant } : { ...spring.snappy, opacity: { duration: duration.fast, ease: enterEase }, filter: { duration: duration.fast, ease: enterEase } }}>
            <div ref={listRef} id={`${uid}-currencies`} className={styles.list} role="listbox" tabIndex={-1} aria-label="Para birimi" aria-activedescendant={`${uid}-cur-${activeCode}`} onKeyDown={onMenuKeyDown}>
              <motion.span className={styles.highlight} style={{ y: hy, height: hh, opacity: ho }} aria-hidden="true" />
              {options.map(option => <div key={option.code} id={`${uid}-cur-${option.code}`} role="option" aria-selected={option.code === code} className={styles.option}
                data-active={option.code === activeCode || undefined} ref={node => { if (node) optionRefs.current.set(option.code, node); else optionRefs.current.delete(option.code); }}
                onPointerMove={event => { if (event.pointerType === "mouse" && option.code !== activeCode) setActiveCode(option.code); }}
                onPointerDown={event => event.preventDefault()} onClick={() => chooseCurrency(option)}>
                <span className={styles.optionSymbol} aria-hidden="true">{option.symbol}</span>
                <span className={styles.optionCode}>{option.code}</span>
                <span className={styles.optionName}>{option.name}</span>
                <span className={styles.check} data-on={option.code === code || undefined} aria-hidden="true"><Check size={16} strokeWidth={1.75} /></span>
              </div>)}
            </div>
          </motion.div>}
        </AnimatePresence>
      </div> : <span className={styles.codeStatic}>{code}</span>}
    </div>

    {(chips.length > 0 || range) && <div className={styles.toolbar}>
      {chips.length > 0 && <div className={styles.chips} role="group" aria-label="Hızlı ekle">
        {chips.map(amount => {
          const add = majorToMinor(amount, info.code) ?? 0;
          const atMax = max !== undefined && (minor ?? 0) >= max;
          return <button key={amount} type="button" className={styles.chip} disabled={disabled} aria-disabled={atMax || undefined} aria-controls={inputId}
            aria-label={`${formatWhole(amount, info.code)} ekle`} onClick={() => nudge(add, "chip")}>+{formatWhole(amount, info.code)}</button>;
        })}
      </div>}
      {range && <span id={rangeId} className={styles.range} data-flash={limitFlash > 0 || undefined}>{range}</span>}
    </div>}

    <AnimatePresence initial={false}>
      {(message || description) && <motion.span key="message" className={styles.messageSlot} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0 } : { height: spring.smooth, opacity: { duration: duration.instant } } }}
        transition={reduced ? { duration: 0 } : { height: spring.smooth, opacity: { duration: duration.fast } }}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={message ?? description} id={message ? errorId : hintId} className={message ? styles.error : styles.hint} role={message ? "alert" : undefined}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, transition: { duration: duration.instant } }} transition={{ duration: reduced ? duration.instant : duration.standard, ease: enterEase }}>{message ?? description}</motion.span>
        </AnimatePresence>
      </motion.span>}
    </AnimatePresence>

    {name && <input type="hidden" name={name} value={minor ?? ""} />}
    <span className={styles.srOnly} role="status" aria-live="polite">{announcement}</span>
  </div>;
});

MoneyInput.displayName = "MoneyInput";

export default MoneyInput;
