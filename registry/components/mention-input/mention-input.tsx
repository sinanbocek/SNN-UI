"use client";

import { forwardRef, useCallback, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode, UIEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { Hash } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { avatarInitials } from "../avatar/avatar-initials";
import { matchRange, rank, searchKey } from "./mention-input-format";
import styles from "./mention-input.module.css";

export type MentionKind = "person" | "channel";

export interface MentionPerson {
  id: string;
  name: string;
  /** Adın altında kısa bir satır, örneğin unvan. */
  role?: string | undefined;
  /** Portre adresi. Yoksa baş harfler görünür. */
  avatar?: string | undefined;
}

export interface MentionChannel {
  id: string;
  name: string;
  description?: string | undefined;
  members?: number | undefined;
}

/** `text` içindeki bir anma. `start` ve `end` karakter konumudur; aradaki metin `@label` ya da `#label` olur. */
export interface Mention {
  kind: MentionKind;
  id: string;
  label: string;
  start: number;
  end: number;
}

export interface MentionValue {
  text: string;
  mentions: Mention[];
}

export interface MentionInputHandle {
  focus: () => void;
  /** Metni imlecin olduğu yere, yazılmış gibi ekler. */
  insert: (text: string) => void;
  /** İmlece tetikleyici karakteri yazar ve öneriler açılır; gerekirse önce boşluk ekler. */
  openSuggestions: (kind: MentionKind) => void;
  clear: () => void;
  textarea: HTMLTextAreaElement | null;
}

export interface MentionInputProps {
  value?: MentionValue | undefined;
  defaultValue?: MentionValue | undefined;
  onChange?: ((value: MentionValue) => void) | undefined;
  /** `@` sonrası önerilen kişiler. Vermezsen kişi anması kapalı olur. */
  people?: MentionPerson[] | undefined;
  /** `#` sonrası önerilen kanallar. Vermezsen kanal anması kapalı olur. */
  channels?: MentionChannel[] | undefined;
  /** Bir öneri anmaya dönüşünce çağrılır. */
  onMentionAdd?: ((mention: Mention) => void) | undefined;
  /** `submitOnEnter` açıkken Enter gönderir, Shift+Enter yeni satır ekler. */
  onSubmit?: ((value: MentionValue) => void) | undefined;
  submitOnEnter?: boolean | undefined;
  placeholder?: string | undefined;
  minRows?: number | undefined;
  /** Alan bu satır sayısına kadar büyür, sonra kaydırılır. */
  maxRows?: number | undefined;
  /** Önerilerin açıldığı yer. `auto` altta yer yoksa üste çevirir. */
  placement?: "auto" | "top" | "bottom" | undefined;
  maxSuggestions?: number | undefined;
  disabled?: boolean | undefined;
  name?: string | undefined;
  id?: string | undefined;
  "aria-label"?: string | undefined;
  "aria-describedby"?: string | undefined;
  className?: string | undefined;
}

type Suggestion = { kind: "person"; item: MentionPerson } | { kind: "channel"; item: MentionChannel };
type Trigger = { kind: MentionKind; start: number; query: string };

const EMPTY: MentionValue = { text: "", mentions: [] };
const SYMBOL: Record<MentionKind, string> = { person: "@", channel: "#" };
const POPOVER_WIDTH = 272;
const { spring, duration, ease } = motionTokens;
const enter = [...ease.enter] as [number, number, number, number];
const standard = [...ease.standard] as [number, number, number, number];
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const GLIDE = physical(.3, .1), GROW = physical(spring.smooth.visualDuration, 0);
/** İlk yerleşimler. Öğeyi bağlayan commit içinde yapılan atlama DOM'a ulaşmaz; anlık animasyon ilk karede yerine oturur. */
const INSTANT: Transition = { duration: 0 };

export const mentionText = (kind: MentionKind, label: string) => `${SYMBOL[kind]}${label}`;

/** Değeri saklamaya uygun metne çevirir; varsayılan olarak kişiler `<@id>`, kanallar `<#id>` olur. */
export function serializeMentions(value: MentionValue, format: (mention: Mention) => string = mention => `<${SYMBOL[mention.kind]}${mention.id}>`) {
  let out = "", at = 0;
  for (const mention of [...value.mentions].sort((a, b) => a.start - b.start)) {
    out += value.text.slice(at, mention.start) + format(mention);
    at = mention.end;
  }
  return out + value.text.slice(at);
}

/** Anmaları düzenlemeyle birlikte kaydırır, düzenlemenin dokunduklarını atar. `hint` düzenleme öncesi imleçtir; yinelenen karakterlerde yeri belirler. */
function reconcile(previous: MentionValue, text: string, hint: number): Mention[] {
  const a = previous.text;
  let prefix = 0;
  const maxPrefix = Math.min(a.length, text.length, Math.max(0, hint));
  while (prefix < maxPrefix && a[prefix] === text[prefix]) prefix++;
  let suffix = 0;
  while (suffix < a.length - prefix && suffix < text.length - prefix && a[a.length - 1 - suffix] === text[text.length - 1 - suffix]) suffix++;
  const oldEnd = a.length - suffix, delta = text.length - a.length;
  return previous.mentions.flatMap(mention => {
    if (mention.end <= prefix) return [mention];
    if (mention.start >= oldEnd) return [{ ...mention, start: mention.start + delta, end: mention.end + delta }];
    return [];
  }).filter(mention => text.slice(mention.start, mention.end) === mentionText(mention.kind, mention.label));
}

function findTrigger(text: string, caret: number, mentions: Mention[], kinds: Record<MentionKind, boolean>): Trigger | null {
  for (let index = caret - 1; index >= 0 && index >= caret - 48; index--) {
    const char = text[index];
    if (char === "\n") return null;
    if (char !== "@" && char !== "#") continue;
    const kind: MentionKind = char === "@" ? "person" : "channel";
    if (!kinds[kind]) return null;
    if (index > 0 && !/[\s([{"']/.test(text[index - 1]!)) return null;
    if (mentions.some(mention => index >= mention.start && index < mention.end)) return null;
    const query = text.slice(index + 1, caret);
    const shape = kind === "person" ? /^[^\s@#]*( [^\s@#]*)?$/ : /^[^\s@#]*$/;
    return shape.test(query) ? { kind, start: index, query } : null;
  }
  return null;
}

/** Etiketin eşleşen kısmı tam karşıtlıkla okunur; gerisi sönük kalır. Eşleştirme Türkçe harfe duyarsızdır. */
function Highlight({ text, query }: { text: string; query: string }) {
  const range = matchRange(text, query);
  if (!range) return <>{text}</>;
  const [from, to] = range;
  return <>{text.slice(0, from)}<mark className={styles.match}>{text.slice(from, to)}</mark>{text.slice(to)}</>;
}

/**
 * `@` ile kişi, `#` ile kanal anmalı çok satırlı alan. Anmalar bölünmez: imleç üzerlerinden atlar, tek Backspace bütün anmayı siler.
 * Değer düz metni ve konumlu bir `mentions` dizisini taşır; saklamaya ya da bildirim göndermeye hazırdır.
 */
export const MentionInput = forwardRef<MentionInputHandle, MentionInputProps>(function MentionInput({
  value: valueProp, defaultValue, onChange, people, channels, onMentionAdd, onSubmit, submitOnEnter = false,
  placeholder, minRows = 1, maxRows = 8, placement = "auto", maxSuggestions = 6, disabled, name, id,
  "aria-label": ariaLabel, "aria-describedby": describedBy, className,
}, ref) {
  const reduced = !!useReducedMotion();
  const uid = useId();
  const listId = `${uid}-list`;
  const [inner, setInner] = useState<MentionValue>(defaultValue ?? EMPTY);
  const value = valueProp ?? inner;
  const live = useRef(value);
  useLayoutEffect(() => { live.current = value; });

  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const lastCaret = useRef(0);
  const pending = useRef<Mention | null>(null);

  const [caret, setCaret] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState<number | null>(null);
  const [active, setActive] = useState(0);

  const commit = useCallback((next: MentionValue) => {
    if (valueProp === undefined) setInner(next);
    onChange?.(next);
  }, [onChange, valueProp]);

  const kinds = useMemo(() => ({ person: !!people?.length, channel: !!channels?.length }), [channels, people]);
  const trigger = useMemo(() => caret === null ? null : findTrigger(value.text, caret, value.mentions, kinds), [caret, kinds, value.mentions, value.text]);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!trigger) return [];
    const query = searchKey(trigger.query);
    const scored: { entry: Suggestion; score: number }[] = trigger.kind === "person"
      ? (people ?? []).map(item => ({ entry: { kind: "person" as const, item }, score: rank(item.name, item.role ?? "", query) }))
      : (channels ?? []).map(item => ({ entry: { kind: "channel" as const, item }, score: rank(item.name, item.description ?? "", query) }));
    return scored.filter(entry => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, maxSuggestions).map(entry => entry.entry);
  }, [channels, maxSuggestions, people, trigger]);

  // Eşleşmeyen adın ardından cümle devam ederse liste, boş durum göstermek yerine kapanır.
  const open = focused && !disabled && !!trigger && trigger.start !== dismissed && (suggestions.length > 0 || !trigger.query.includes(" "));
  const activeIndex = Math.min(active, Math.max(0, suggestions.length - 1));
  const queryKey = trigger ? `${trigger.start}:${trigger.query}` : "";
  const [lastQueryKey, setLastQueryKey] = useState(queryKey);
  if (lastQueryKey !== queryKey) { setLastQueryKey(queryKey); setActive(0); }
  if (dismissed !== null && trigger?.start !== dismissed) setDismissed(null);

  /* Seçim: imleç hiçbir zaman anmanın içinde durmaz. Ok tuşları üzerinden atlar; tıklama en yakın kenara oturur. */
  const onSelect = () => {
    const area = areaRef.current;
    if (!area) return;
    let start = area.selectionStart, end = area.selectionEnd;
    const collapsed = start === end;
    for (const mention of live.current.mentions) {
      if (collapsed && start > mention.start && start < mention.end) {
        const stepped = Math.abs(start - lastCaret.current) === 1;
        const forward = start > lastCaret.current;
        start = end = stepped ? (forward ? mention.end : mention.start) : (start - mention.start < mention.end - start ? mention.start : mention.end);
      } else if (!collapsed) {
        if (start > mention.start && start < mention.end) start = mention.start;
        if (end > mention.start && end < mention.end) end = mention.end;
      }
    }
    if (start !== area.selectionStart || end !== area.selectionEnd) area.setSelectionRange(start, end, area.selectionDirection);
    lastCaret.current = area.selectionStart;
    setCaret(collapsed ? start : null);
  };

  const onInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    const mentions = reconcile(live.current, text, lastCaret.current);
    const added = pending.current;
    pending.current = null;
    if (added && text.slice(added.start, added.end) === mentionText(added.kind, added.label)) {
      mentions.push(added);
      mentions.sort((a, b) => a.start - b.start);
    }
    const next = { text, mentions };
    live.current = next;
    commit(next);
    if (added) onMentionAdd?.(added);
    lastCaret.current = event.target.selectionStart;
    setCaret(event.target.selectionStart === event.target.selectionEnd ? event.target.selectionStart : null);
  };

  /** Tarayıcı üzerinden yazar; değişiklik yerel geri alma yığınına girer. Olmazsa doğrudan düzenler. */
  const typeText = useCallback((text: string, from?: number, to?: number) => {
    const area = areaRef.current;
    if (!area) return;
    area.focus({ preventScroll: true });
    if (from !== undefined) area.setSelectionRange(from, to ?? from);
    lastCaret.current = area.selectionStart;
    const typed = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
    if (typed) return;
    const start = area.selectionStart, end = area.selectionEnd, current = live.current;
    const nextText = current.text.slice(0, start) + text + current.text.slice(end);
    const mentions = reconcile(current, nextText, start);
    const added = pending.current;
    pending.current = null;
    if (added) mentions.push(added);
    mentions.sort((a, b) => a.start - b.start);
    const next = { text: nextText, mentions };
    live.current = next;
    commit(next);
    if (added) onMentionAdd?.(added);
    requestAnimationFrame(() => { area.setSelectionRange(start + text.length, start + text.length); setCaret(start + text.length); });
  }, [commit, onMentionAdd]);

  const choose = (suggestion: Suggestion | undefined) => {
    if (!suggestion || !trigger || caret === null) return;
    const label = suggestion.item.name;
    const token = mentionText(suggestion.kind, label);
    pending.current = { kind: suggestion.kind, id: suggestion.item.id, label, start: trigger.start, end: trigger.start + token.length };
    const after = value.text[caret];
    typeText(after === undefined || !/\s/.test(after) ? `${token} ` : token, trigger.start, caret);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const area = event.currentTarget;
    lastCaret.current = area.selectionStart;
    if (open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (suggestions.length) setActive((activeIndex + (event.key === "ArrowDown" ? 1 : -1) + suggestions.length) % suggestions.length);
        return;
      }
      if ((event.key === "Enter" || event.key === "Tab") && suggestions.length && !event.shiftKey) {
        event.preventDefault();
        choose(suggestions[activeIndex]);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setDismissed(trigger?.start ?? null);
        return;
      }
    }
    const start = area.selectionStart, end = area.selectionEnd;
    if (start === end && !event.metaKey && (event.key === "Backspace" || event.key === "Delete")) {
      // Bütün anmayı seç ve yerel silmeyi çalıştır; tek tuş vuruşu siler, geri alma getirir.
      const hit = live.current.mentions.find(mention => event.key === "Backspace" ? start > mention.start && start <= mention.end : start >= mention.start && start < mention.end);
      if (hit) area.setSelectionRange(hit.start, hit.end);
      return;
    }
    if (event.key === "Enter" && submitOnEnter && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (live.current.text.trim()) onSubmit?.(live.current);
    }
  };

  useImperativeHandle(ref, () => ({
    focus: () => areaRef.current?.focus(),
    insert: text => typeText(text),
    openSuggestions: kind => {
      const area = areaRef.current;
      if (!area) return;
      const at = document.activeElement === area ? area.selectionStart : live.current.text.length;
      const before = live.current.text[at - 1];
      setDismissed(null);
      typeText(`${before && !/\s/.test(before) ? " " : ""}${SYMBOL[kind]}`, at, document.activeElement === area ? area.selectionEnd : at);
    },
    clear: () => {
      commit(EMPTY);
      live.current = EMPTY;
      setCaret(0);
    },
    get textarea() { return areaRef.current; },
  }), [commit, typeText]);

  /* Otomatik boyut: arka katman metni yansıtır, yüksekliği içerik yüksekliğidir. Alan, satır sınırları içinde yay hareketiyle ona ulaşır. */
  const height = useMotionValue<number | "auto">("auto");
  const [limits, setLimits] = useState({ min: 0, max: Infinity });
  const measured = useRef(false);
  useLayoutEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;
    const style = getComputedStyle(backdrop);
    const line = parseFloat(style.lineHeight) || 24;
    const pad = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const next = { min: line * minRows + pad, max: line * Math.max(minRows, maxRows) + pad };
    setLimits(current => current.min === next.min && current.max === next.max ? current : next);
  }, [maxRows, minRows]);
  useLayoutEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop || !limits.min) return;
    const fit = () => {
      const target = Math.min(limits.max, Math.max(limits.min, backdrop.offsetHeight));
      const current = height.get();
      if (!measured.current || reduced || typeof current !== "number") { animate(height, target, INSTANT); measured.current = true; return; }
      if (Math.abs(current - target) > .5) animate(height, target, GROW);
    };
    fit();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(fit);
    observer.observe(backdrop);
    return () => observer.disconnect();
  }, [height, limits, reduced]);

  /* Açılır panel tetikleyici karakterden sarkar; yansıtılan metindeki bir işaretçiden ölçülür. */
  const [anchor, setAnchor] = useState<{ x: number; y: number; line: number; above: boolean } | null>(null);
  const measureAnchor = useCallback(() => {
    const marker = backdropRef.current?.querySelector<HTMLElement>("[data-anchor]");
    const root = rootRef.current, field = fieldRef.current, area = areaRef.current;
    if (!marker || !root || !field || !area) { setAnchor(null); return; }
    const line = parseFloat(getComputedStyle(marker.parentElement ?? marker).lineHeight) || 24;
    const x = Math.max(0, Math.min(field.offsetLeft + marker.offsetLeft - 10, root.offsetWidth - POPOVER_WIDTH));
    const top = field.offsetTop + marker.offsetTop - area.scrollTop;
    const box = root.getBoundingClientRect();
    const roomBelow = window.innerHeight - (box.top + top + line);
    const above = placement === "top" || (placement === "auto" && roomBelow < 300 && box.top + top > roomBelow);
    const y = above ? top - 6 : top + line + 6;
    setAnchor(current => current && current.x === x && current.y === y && current.above === above && current.line === line ? current : { x, y, line, above });
  }, [placement]);
  useLayoutEffect(() => { if (open) measureAnchor(); }, [measureAnchor, open, trigger?.start, value.text]);
  // Panel, `open` olduktan bir commit sonra, çapa ölçülünce bağlanır; aşağıdaki etkiler onu bekler.
  const shown = open && !!anchor;

  const onScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    const backdrop = backdropRef.current;
    if (backdrop) backdrop.style.transform = `translateY(${-event.currentTarget.scrollTop}px)`;
    measureAnchor();
  };

  /* Listenin vurgusu satırlar arasında kayar; eşleşmeler gelip gittikçe panel yüksekliğini yayla ayarlar. */
  const listRef = useRef<HTMLUListElement>(null);
  const hy = useMotionValue(0), hh = useMotionValue(0);
  const placed = useRef(false);
  const panelHeight = useMotionValue<number | "auto">("auto");
  useLayoutEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    if (!row) return;
    if (reduced || !placed.current) { animate(hy, row.offsetTop, INSTANT); animate(hh, row.offsetHeight, INSTANT); placed.current = true; return; }
    animate(hy, row.offsetTop, GLIDE);
    animate(hh, row.offsetHeight, GLIDE);
  }, [activeIndex, hh, hy, reduced, shown, suggestions]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelSized = useRef(false);
  useLayoutEffect(() => {
    // Çıkan liste sönerken vurgusunu korur; sonraki açılış vurguyu yeniden yerleştirir.
    if (!shown) { panelSized.current = false; placed.current = false; return; }
    const body = bodyRef.current;
    if (!body) return;
    const fit = () => {
      const target = body.offsetHeight;
      if (!panelSized.current || reduced) { animate(panelHeight, target, INSTANT); panelSized.current = true; return; }
      animate(panelHeight, target, GROW);
    };
    fit();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(fit);
    observer.observe(body);
    return () => observer.disconnect();
  }, [panelHeight, reduced, shown, trigger?.start]);

  /* Yansıma: metin alanıyla aynı metin; anmalar yerinde çizilir, açık tetikleyicide işaretçi bulunur. */
  const mirror = useMemo(() => {
    const parts: ReactNode[] = [];
    const markAt = open && trigger ? trigger.start : -1;
    let at = 0;
    const pushText = (from: number, to: number) => {
      if (markAt >= from && markAt < to) {
        parts.push(value.text.slice(from, markAt), <span key="anchor" data-anchor="" />, value.text.slice(markAt, to));
      } else parts.push(value.text.slice(from, to));
    };
    for (const mention of value.mentions) {
      pushText(at, mention.start);
      parts.push(<span key={`${mention.start}-${mention.id}`} className={styles.token} data-kind={mention.kind}>{value.text.slice(mention.start, mention.end)}</span>);
      at = mention.end;
    }
    pushText(at, value.text.length);
    return parts;
  }, [open, trigger, value.mentions, value.text]);

  const optionId = (index: number) => `${uid}-option-${index}`;
  const popIn = reduced ? { opacity: 0 } : { opacity: 0, scale: .96, y: anchor?.above ? 4 : -4 };
  const countLabel = open ? (suggestions.length ? `${suggestions.length} ${trigger?.kind === "person" ? "kişi" : "kanal"}` : "Eşleşme yok") : "";

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-disabled={disabled || undefined}>
    <motion.div ref={fieldRef} className={styles.field} style={{ height }} data-focused={focused || undefined}>
      <div ref={backdropRef} className={styles.backdrop} aria-hidden="true">{mirror}{"\u200b"}</div>
      <textarea
        ref={areaRef}
        id={id}
        name={name}
        className={styles.textarea}
        value={value.text}
        placeholder={placeholder}
        disabled={disabled}
        rows={minRows}
        spellCheck
        role="combobox"
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && suggestions.length ? optionId(activeIndex) : undefined}
        onChange={onInput}
        onSelect={onSelect}
        onKeyDown={onKeyDown}
        onScroll={onScroll}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setCaret(null); }}
      />
    </motion.div>
    <span className={styles.srOnly} aria-live="polite">{countLabel}</span>
    <AnimatePresence>
      {open && anchor && <motion.div
        key={trigger?.start}
        className={styles.popover}
        data-above={anchor.above || undefined}
        style={{ left: anchor.x, top: anchor.y, height: panelHeight, transformOrigin: anchor.above ? "14px 100%" : "14px 0" }}
        initial={popIn}
        animate={{ opacity: 1, scale: 1, y: 0, transition: reduced ? { duration: duration.fast } : { ...spring.snappy, opacity: { duration: duration.fast, ease: enter } } }}
        exit={{ ...popIn, transition: { duration: duration.exit * .7, ease: standard } }}
        onMouseDown={event => event.preventDefault()}
      >
        <div ref={bodyRef} className={styles.popoverBody}>
          {suggestions.length ? <ul ref={listRef} id={listId} role="listbox" aria-label={trigger?.kind === "person" ? "Kişiler" : "Kanallar"} className={styles.list}>
            <motion.li aria-hidden="true" className={styles.highlight} style={{ y: hy, height: hh }} />
            {suggestions.map((suggestion, index) => <li
              key={`${suggestion.kind}-${suggestion.item.id}`}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              data-index={index}
              className={styles.option}
              onPointerMove={() => { if (index !== activeIndex) setActive(index); }}
              onClick={() => choose(suggestion)}
            >
              {suggestion.kind === "person"
                ? <span className={styles.avatar} aria-hidden="true">{suggestion.item.avatar
                  // Bilerek düz <img>: kayıt bileşenleri çerçeveden bağımsız kalır
                  ? <img src={suggestion.item.avatar} alt="" width={28} height={28} loading="lazy" />
                  : avatarInitials(suggestion.item.name)}</span>
                : <span className={styles.glyph} aria-hidden="true"><Hash size={16} strokeWidth={1.75} /></span>}
              <span className={styles.optionText}>
                <span className={styles.optionLabel}><Highlight text={suggestion.item.name} query={trigger?.query.trim() ?? ""} /></span>
                {suggestion.kind === "person"
                  ? suggestion.item.role && <span className={styles.optionMeta}>{suggestion.item.role}</span>
                  : suggestion.item.description && <span className={styles.optionMeta}>{suggestion.item.description}</span>}
              </span>
              {suggestion.kind === "channel" && suggestion.item.members !== undefined && <span className={styles.count}>{suggestion.item.members}</span>}
            </li>)}
          </ul> : <p className={styles.empty}>{`“${trigger?.query ?? ""}” ile eşleşen ${trigger?.kind === "person" ? "kişi" : "kanal"} yok`}</p>}
        </div>
      </motion.div>}
    </AnimatePresence>
  </div>;
});

export default MentionInput;
