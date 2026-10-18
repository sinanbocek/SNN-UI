"use client";

import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import type { MotionValue } from "motion/react";
import { Search, X } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { groupBy, matchRange, rank } from "./expanding-search-format";
import type { SearchGroup } from "./expanding-search-format";
import styles from "./expanding-search.module.css";

export interface ExpandingSearchItem {
  id: string;
  title: string;
  /** Başlığın altında kısa bir satır: tür, sahip ya da son düzenleme gibi. */
  meta?: string | undefined;
  /** Sonuçlar bu başlık altında toplanır; gruplar `items` içinde ilk göründükleri sırayla dizilir. */
  group?: string | undefined;
  icon?: ReactNode | undefined;
  /** Bu öğeyi bulması gereken ek sözcükler. */
  keywords?: string[] | undefined;
}

/**
 * İhtiyaç olana kadar simge düğmesi olarak bekleyen arama. Tam bir alanın yerleşimi sıkıştıracağı üst bilgi ve araç çubuklarında kullanın.
 * Düğme alana dönüşür, sonuçlar altında açılır; Escape, bir sonucu seçmek ya da alanı boş bırakmak onu yeniden simgeye katlar.
 * Alanın büyüyebileceği boşluğa yerleştirin; o boşluğun genişliğini doldurur ve düğmeyi `anchor` kenarında tutar.
 */
export interface ExpandingSearchProps {
  /** Düğmeyi, alanı ve sonuçları adlandırır; örneğin "Projelerde ve belgelerde ara". */
  label: string;
  items: ExpandingSearchItem[];
  /** Henüz bir şey yazılmadan gösterilir; örneğin son aramalar. */
  suggestions?: ExpandingSearchItem[] | undefined;
  suggestionsLabel?: string | undefined;
  placeholder?: string | undefined;
  onSelect?: ((item: ExpandingSearchItem) => void) | undefined;
  onExpandedChange?: ((expanded: boolean) => void) | undefined;
  /** Alanın büyüyeceği en geniş değer. Kabının ötesine hiç geçmez. */
  expandedWidth?: number | undefined;
  maxResults?: number | undefined;
  /** Düğmenin durduğu kenar; alan ondan uzağa doğru büyür. */
  anchor?: "start" | "end" | undefined;
  /** Boş durumun altında kısa bir ipucu. */
  emptyHint?: string | undefined;
  className?: string | undefined;
}

type Group = SearchGroup<ExpandingSearchItem>;
type Mode = "suggestions" | "results" | "empty";

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const FALLBACK_SIZE = 44;

function Match({ text, query }: { text: string; query: string }) {
  const range = matchRange(text, query);
  if (!range) return text;
  return <>{text.slice(0, range[0])}<mark className={styles.mark}>{text.slice(range[0], range[1])}</mark>{text.slice(range[1])}</>;
}

/** Panel alanın genişlik değerini paylaşır; ilk açılışta alandan dışarı açılır, sonra yalnız yüksekliği içeriği izler. */
function Panel({ width, reduced, children }: { width: MotionValue<number>; reduced: boolean; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const height = useMotionValue(0);
  useLayoutEffect(() => {
    const panel = panelRef.current, body = bodyRef.current;
    if (!panel || !body || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = body.offsetHeight + panel.offsetHeight - panel.clientHeight;
      if (reduced) height.jump(next);
      else animate(height, next, motionTokens.spring.smooth);
    });
    observer.observe(body);
    return () => observer.disconnect();
  }, [height, reduced]);
  // Azaltılmış hareket açılmayı atlar: panel ilk kareden itibaren içeriğinin yüksekliğindedir ve yalnız solar.
  return <motion.div ref={panelRef} className={styles.panel} style={{ width, height: reduced ? "auto" : height }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1, transition: { duration: reduced ? .15 : motionTokens.duration.fast, ease: enter } }}
    exit={{ opacity: 0, transition: { duration: reduced ? .1 : motionTokens.duration.instant, ease: standard } }}>
    <div ref={bodyRef} className={styles.body}>{children}</div>
  </motion.div>;
}

/** Ofsetler dönüşümleri yok sayar; satırların listedeki yerini anlatır, süzülen bir satırın yoldaki anlık yerini değil. */
function offsetWithin(node: HTMLElement, container: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = node;
  while (current && current !== container) { top += current.offsetTop; current = current.offsetParent as HTMLElement | null; }
  return top;
}

interface ListboxProps { id: string; label: string; groups: Group[]; query: string; activeIndex: number; optionId: (item: ExpandingSearchItem) => string; reduced: boolean; keyboard: RefObject<boolean>; onHover: (index: number) => void; onChoose: (item: ExpandingSearchItem) => void }

function Listbox({ id, label, groups, query, activeIndex, optionId, reduced, keyboard, onHover, onChoose }: ListboxProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const flat = groups.flatMap(group => group.items);
  const layoutKey = flat.map(item => item.id).join("|");
  const activeItem = flat[activeIndex];
  const activeId = activeItem ? optionId(activeItem) : "";
  /** Vurgu etkin satırın içinde yaşar; satır nereye süzülürse onunla gider. Başka satıra geçince eskisinin olduğu yerden başlar ve yayla evine döner. */
  const travel = useMotionValue(0);
  const fade = useMotionValue(1);
  const last = useRef<{ id: string; set: string; top: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const row = activeId ? document.getElementById(activeId) : null;
    if (!list || !row) { last.current = null; return; }
    const top = offsetWithin(row, list);
    const previous = last.current;
    last.current = { id: activeId, set: layoutKey, top };
    // Aynı satır: vurgusu zaten yerinde, sürmekte olan yolculuk ona göre göreli kalır.
    if (previous?.id === activeId) return;
    if (previous && previous.set === layoutKey && !reduced) {
      const velocity = travel.getVelocity();
      travel.jump(previous.top + travel.get() - top);
      animate(travel, 0, { ...motionTokens.spring.snappy, velocity });
    } else {
      // Hiçbir şey vurgulu değildi ya da yeni sonuçlar geldi: vurgu satırında yolculuksuz belirir.
      travel.jump(0);
      if (reduced) fade.jump(1); else { fade.jump(0); animate(fade, 1, { duration: motionTokens.duration.instant, ease: enter }); }
    }
    if (keyboard.current) row.scrollIntoView({ block: "nearest" });
  }, [activeId, layoutKey, reduced, travel, fade, keyboard]);

  return <div ref={listRef} id={id} role="listbox" aria-label={label} className={styles.listbox}>
    <AnimatePresence mode="popLayout" initial={false}>
      {groups.map(group => {
        const headingId = `${id}-${group.name || "results"}`.replace(/\s+/g, "-");
        return <motion.div key={group.name} role="group" aria-labelledby={group.name ? headingId : undefined} className={styles.group}
          layout={reduced ? false : "position"} layoutDependency={layoutKey}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .08 } }}
          transition={{ opacity: { duration: motionTokens.duration.fast, ease: enter }, layout: motionTokens.spring.smooth }}>
          {group.name && <div id={headingId} className={styles.groupLabel} role="presentation">{group.name}</div>}
          <AnimatePresence mode="popLayout" initial={false}>
            {group.items.map(item => {
              const position = flat.indexOf(item);
              const active = position === activeIndex;
              return <motion.div key={item.id} id={optionId(item)} role="option" aria-selected={active} data-active={active || undefined} className={styles.option}
                layout={reduced ? false : "position"} layoutDependency={layoutKey}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .08 } }}
                transition={{ opacity: { duration: motionTokens.duration.fast, ease: enter }, layout: motionTokens.spring.smooth }}
                onPointerMove={() => { if (!active) { keyboard.current = false; onHover(position); } }}
                onMouseDown={event => event.preventDefault()}
                onClick={() => onChoose(item)}>
                {active && <motion.span className={styles.highlight} style={{ y: travel, opacity: fade }} aria-hidden="true" />}
                {item.icon && <span className={styles.optionIcon} aria-hidden="true">{item.icon}</span>}
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}><Match text={item.title} query={query} /></span>
                  {item.meta && <span className={styles.optionMeta}>{item.meta}</span>}
                </span>
              </motion.div>;
            })}
          </AnimatePresence>
        </motion.div>;
      })}
    </AnimatePresence>
  </div>;
}

export function ExpandingSearch({ label, items, suggestions = [], suggestionsLabel = "Son aramalar", placeholder, onSelect, onExpandedChange, expandedWidth = 360, maxResults = 6, anchor = "end", emptyHint = "Daha kısa bir sözcük deneyin ya da yazımı denetleyin.", className }: ExpandingSearchProps) {
  const id = useId();
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const open = useRef(false);
  const size = useRef({ collapsed: FALLBACK_SIZE, expanded: expandedWidth });
  const width = useMotionValue(FALLBACK_SIZE);
  /** Son vurgu hareketi klavyeden geldiyse true olur; listeyi yalnız klavye hareketleri kaydırır. */
  const keyboard = useRef(false);

  // Köşe yarıçapı genişliği izler: kapalıyken daire, açılınca denetim yarıçapı. Aynı yayla gider; ikisi hiç ayrışmaz.
  const syncShape = useCallback((value: number) => {
    const { collapsed, expanded: full } = size.current;
    shellRef.current?.style.setProperty("--es-open", String(Math.min(1, Math.max(0, (value - collapsed) / Math.max(1, full - collapsed)))));
  }, []);
  useMotionValueEvent(width, "change", syncShape);

  // Alan kendi sınırına ya da kabına kadar, hangisi küçükse, büyür. Kap yeniden boyutlanınca hemen izlenir; bu kişinin eylemi değildir.
  useLayoutEffect(() => {
    const root = rootRef.current, shell = shellRef.current;
    if (!root || !shell) return;
    const measure = () => {
      const collapsed = shell.offsetHeight || FALLBACK_SIZE;
      const full = Math.max(collapsed, Math.min(expandedWidth, root.clientWidth));
      size.current = { collapsed, expanded: full };
      root.style.setProperty("--es-width", `${full}px`);
      const goal = open.current ? full : collapsed;
      if (width.isAnimating()) animate(width, goal, motionTokens.spring.morph);
      else width.jump(goal);
      syncShape(width.get());
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [expandedWidth, width, syncShape]);

  // Açılış biçim yayında hafif aşarak büyür; geri katlanış aşmadan oturur, daire kendi boyutunun altına hiç inmez.
  const morphTo = (goal: number) => { if (reduced) width.jump(goal); else animate(width, goal, goal >= width.get() ? motionTokens.spring.morph : motionTokens.spring.smooth); };

  // Odak aynı tıklama içinde taşınır, dokunmatik klavyeler açılır; bu boşaltma alanı odaklanabilir yapana kadar alan etkisizdir.
  function expand() {
    if (open.current) return;
    open.current = true;
    flushSync(() => { setExpanded(true); setFocused(true); });
    inputRef.current?.focus({ preventScroll: true });
    morphTo(size.current.expanded);
    onExpandedChange?.(true);
  }

  function collapse(returnFocus: boolean) {
    if (!open.current) return;
    open.current = false;
    flushSync(() => { setExpanded(false); setFocused(false); setQuery(""); setActive(-1); });
    if (returnFocus) buttonRef.current?.focus({ preventScroll: true });
    morphTo(size.current.collapsed);
    onExpandedChange?.(false);
  }

  const trimmed = query.trim();
  const results = useMemo(() => trimmed ? rank(items, trimmed, maxResults) : [], [items, trimmed, maxResults]);
  const mode: Mode | null = !trimmed ? (suggestions.length ? "suggestions" : null) : results.length ? "results" : "empty";
  const groups = useMemo<Group[]>(() => mode === "suggestions" ? [{ name: suggestionsLabel, items: suggestions }] : mode === "results" ? groupBy(results, items) : [], [mode, suggestions, suggestionsLabel, results, items]);
  const flat = groups.flatMap(group => group.items);
  const activeIndex = Math.min(active, flat.length - 1);
  const activeItem = flat[activeIndex];
  const optionId = (item: ExpandingSearchItem) => `${id}-${mode}-${item.id}`;
  const listboxId = `${id}-${mode}-listbox`;
  const panelOpen = expanded && focused && mode !== null;
  const announcement = !panelOpen ? "" : mode === "empty" ? `${trimmed} için sonuç yok` : mode === "results" ? `${flat.length} sonuç` : `${suggestionsLabel}: ${flat.length} öğe`;

  function choose(item: ExpandingSearchItem) {
    collapse(true);
    onSelect?.(item);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { event.preventDefault(); collapse(true); return; }
    if (!panelOpen || !flat.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      keyboard.current = true;
      setActive(activeIndex < 0 ? (step > 0 ? 0 : flat.length - 1) : (activeIndex + step + flat.length) % flat.length);
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      choose(activeItem);
    }
  }

  const clearHidden = reduced ? { opacity: 0 } : { opacity: 0, scale: .6, filter: `blur(${motionTokens.blur.subtle}px)` };

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-anchor={anchor}>
    <motion.div ref={shellRef} className={styles.shell} data-expanded={expanded || undefined} style={{ width }}>
      <button ref={buttonRef} type="button" className={styles.trigger} aria-label={label} hidden={expanded} onClick={expand} />
      <Search className={styles.icon} width={18} height={18} strokeWidth={1.75} aria-hidden="true" />
      {/* Yer tutucu şeklin hareketlenmesini bekler, sonra belirir; kapanırken önce o gider. */}
      <motion.input ref={inputRef} className={styles.input} type="text" role="combobox" inert={!expanded} value={query} placeholder={placeholder ?? label}
        aria-label={label} aria-expanded={panelOpen} aria-controls={panelOpen && mode !== "empty" ? listboxId : undefined} aria-autocomplete="list"
        aria-activedescendant={panelOpen && activeItem ? optionId(activeItem) : undefined}
        autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="search"
        initial={false} animate={{ opacity: expanded ? 1 : 0 }}
        transition={expanded ? { duration: reduced ? .15 : .2, ease: enter, delay: reduced ? 0 : .08 } : { duration: reduced ? .1 : .08, ease: standard }}
        onChange={event => { const next = event.target.value; setQuery(next); setActive(next.trim() ? 0 : -1); keyboard.current = false; }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Pencere değiştirmek aramayı olduğu gibi korur; dönüşte alan yeniden odaklanır.
          if (typeof document !== "undefined" && !document.hasFocus()) return;
          setFocused(false);
          if (open.current && !inputRef.current?.value.trim()) collapse(false);
        }}
        onKeyDown={handleKeyDown} />
      <AnimatePresence initial={false}>
        {expanded && query && <motion.button key="clear" type="button" tabIndex={-1} className={styles.clear} aria-label="Aramayı temizle"
          onMouseDown={event => event.preventDefault()}
          onClick={() => { setQuery(""); setActive(-1); inputRef.current?.focus({ preventScroll: true }); }}
          initial={clearHidden} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ ...clearHidden, transition: { duration: reduced ? .1 : motionTokens.duration.instant, ease: standard } }}
          transition={reduced ? { duration: .15 } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } }}>
          <X width={16} height={16} strokeWidth={1.75} aria-hidden="true" />
        </motion.button>}
      </AnimatePresence>
    </motion.div>
    <AnimatePresence>
      {panelOpen && <Panel key="panel" width={width} reduced={reduced}>
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={mode} className={styles.view}
              initial={reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${motionTokens.blur.subtle}px)` }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: .1, ease: standard } }}
              transition={{ duration: reduced ? .15 : motionTokens.duration.fast, ease: enter }}>
              {mode === "empty"
                ? <div className={styles.empty}><p className={styles.emptyTitle}>“{trimmed}” için sonuç yok</p><p className={styles.emptyHint}>{emptyHint}</p></div>
                : <Listbox id={listboxId} label={mode === "suggestions" ? suggestionsLabel : `${trimmed} için sonuçlar`} groups={groups} query={mode === "results" ? trimmed : ""} activeIndex={activeIndex} optionId={optionId} reduced={reduced} keyboard={keyboard} onHover={setActive} onChoose={choose} />}
            </motion.div>
        </AnimatePresence>
      </Panel>}
    </AnimatePresence>
    <span className={styles.srOnly} role="status" aria-live="polite">{announcement}</span>
  </div>;
}

export default ExpandingSearch;
