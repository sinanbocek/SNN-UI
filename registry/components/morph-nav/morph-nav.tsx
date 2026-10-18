"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode, type Ref } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { money, text } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { useElementWidth } from "../lib/viz-utils";
import styles from "./morph-nav.module.css";

export interface MorphNavLink { id: string; label: string; href: string; description?: string | undefined; icon?: ReactNode | undefined }
export interface MorphNavItem {
  id: string;
  label: string;
  /** Panelsiz öğe doğrudan bağlantıdır. */
  href?: string | undefined;
  /** Panelli öğenin bağlantıları. */
  links?: MorphNavLink[] | undefined;
  /** Panelde öne çıkan alan (çağıranın içeriği). */
  featured?: ReactNode | undefined;
  /** Geçerli sayfanın bölümü. */
  current?: boolean | undefined;
}
export interface MorphNavSearchEntry { id: string; label: string; href: string; group?: string | undefined }

export interface MorphNavProps {
  items: MorphNavItem[];
  brand: { label: string; href?: string | undefined; mark?: ReactNode | undefined };
  /** Çubuğun ucundaki tek ana eylem (çağıranın düğmesi). */
  action?: ReactNode | undefined;
  /** Verilirse çubukta arama düğmesi çıkar. Dizin büyükse önceden süzülür. */
  searchEntries?: MorphNavSearchEntry[] | undefined;
  /** Verilirse bağlantılar sayfayı yenilemez; adres bu işleve gider. */
  onNavigate?: ((href: string) => void) | undefined;
  /** Sayfa kayınca çağıran verir: çubuk küçülür. */
  tight?: boolean | undefined;
  /** Bu genişliğin (kabın, ekranın değil) altında bölümler tek menüye katlanır. */
  collapseBelow?: number | undefined;
  label?: string | undefined;
  searchLabel?: string | undefined;
  suggestedLabel?: string | undefined;
  noResultsLabel?: string | undefined;
  menuLabel?: string | undefined;
  closeLabel?: string | undefined;
  className?: string | undefined;
}

type Mode = { kind: "none" } | { kind: "panel"; id: string } | { kind: "search" } | { kind: "menu" };

/** Her bölme boyutunu yalnız güncel iken bildirir. */
function Pane({ pane, onHeight, children }: { pane: string; onHeight: (height: number) => void; children: ReactNode }) {
  const node = useRef<HTMLDivElement>(null);
  const report = useRef(onHeight);
  report.current = onHeight;
  useLayoutEffect(() => {
    const element = node.current;
    if (!element) return;
    const measure = () => report.current(element.offsetHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [pane]);
  return <div ref={node} className={styles.paneInner}>{children}</div>;
}

const MAX_RESULTS = 6;

/** Üst gezinme: bölümler çubukta sıralanır; panelli bölüm açılınca çubuğun kendisi bağlantı paneline büyür. Arama aynı yüzeyden açılır. Uygulama içi bölüm geçişi için `liquid-tab-bar` kullanılır. */
export function MorphNav({
  items, brand, action, searchEntries, onNavigate, tight = false, collapseBelow = 720, label = "Ana gezinme", searchLabel = "Ara",
  suggestedLabel = "Önerilenler", noResultsLabel = "Sonuç bulunamadı", menuLabel = "Menü", closeLabel = "Kapat", className,
}: MorphNavProps) {
  const reduced = useReducedMotion();
  const ids = useId();
  const [rootRef, width] = useElementWidth<HTMLDivElement>();
  const collapsed = width > 0 && width < collapseBelow;
  const [mode, setMode] = useState<Mode>({ kind: "none" });
  const [direction, setDirection] = useState(1);
  const [paneHeight, setPaneHeight] = useState(0);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement | null>(null);
  const triggers = useRef<Record<string, HTMLElement | null>>({});
  const searchButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const returnTo = useRef<HTMLElement | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const setRoot = (node: HTMLDivElement | null) => { root.current = node; (rootRef as { current: HTMLDivElement | null }).current = node; };
  const order = (id: string) => items.findIndex(item => item.id === id);

  const show = useCallback((next: Mode) => {
    setMode(current => {
      const from = current.kind === "panel" ? order(current.id) : -1;
      const to = next.kind === "panel" ? order(next.id) : 99;
      setDirection(to >= from ? 1 : -1);
      return next;
    });
  // `order` her çizimde aynı kalır; öğe sırası değişirse zaten yeniden çizilir.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);
  const close = useCallback((restore = true) => {
    clearTimeout(hoverTimer.current);
    setMode({ kind: "none" });
    setQuery("");
    if (restore) returnTo.current?.focus();
  }, []);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  // Odak nav dışına çıkınca ya da dışarı basılınca kapanır.
  useEffect(() => {
    if (mode.kind === "none") return;
    const outside = (event: globalThis.PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [mode.kind, close]);
  useEffect(() => { if (mode.kind === "search") searchInput.current?.focus(); }, [mode.kind]);

  // Arama: Türkçe harf farkı gözetmez; yalnız en iyi birkaç sonuç gösterilir.
  const results = useMemo(() => {
    const needle = text.searchKey(query.trim());
    const entries = searchEntries ?? [];
    if (!needle) return entries.slice(0, MAX_RESULTS);
    const out: MorphNavSearchEntry[] = [];
    for (const entry of entries) {
      if (text.searchKey(entry.label).includes(needle) || (entry.group && text.searchKey(entry.group).includes(needle))) out.push(entry);
      if (out.length === MAX_RESULTS) break;
    }
    return out;
  }, [query, searchEntries]);
  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    if (mode.kind !== "search") return;
    setAnnouncement(results.length ? `${money.fmtDecimalGrouped(results.length, 0)} sonuç` : noResultsLabel);
  }, [results.length, mode.kind, noResultsLabel]);

  const follow = (href: string, event?: MouseEvent) => {
    if (onNavigate) { event?.preventDefault(); onNavigate(href); }
    close(false);
  };

  const openPanel = (id: string, focusFirst = false) => {
    clearTimeout(hoverTimer.current);
    returnTo.current = triggers.current[id] ?? null;
    show({ kind: "panel", id });
    if (focusFirst) requestAnimationFrame(() => root.current?.querySelector<HTMLElement>(`[data-pane="${id}"] a`)?.focus());
  };
  const hoverOpen = (id: string, event: { pointerType?: string | undefined }) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => openPanel(id), mode.kind === "panel" ? 0 : 90);
  };
  const hoverLeave = () => {
    clearTimeout(hoverTimer.current);
    if (mode.kind === "panel") hoverTimer.current = setTimeout(() => close(false), 160);
  };

  const topKey = (event: KeyboardEvent<HTMLElement>, id: string) => {
    const list = items.map(item => item.id);
    const at = list.indexOf(id);
    const move = (to: number) => {
      event.preventDefault();
      const next = list[(to + list.length) % list.length]!;
      triggers.current[next]?.focus();
      if (mode.kind === "panel" && items.find(item => item.id === next)?.links?.length) openPanel(next);
      else if (mode.kind === "panel") close(false);
    };
    if (event.key === "ArrowRight") move(at + 1);
    else if (event.key === "ArrowLeft") move(at - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(list.length - 1);
    else if (event.key === "ArrowDown" && items[at]?.links?.length) { event.preventDefault(); openPanel(id, true); }
  };

  const paneKey = (event: KeyboardEvent<HTMLElement>, id: string) => {
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a"));
    const at = links.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown") { event.preventDefault(); links[Math.min(links.length - 1, at + 1)]?.focus(); }
    else if (event.key === "ArrowUp") { event.preventDefault(); if (at <= 0) triggers.current[id]?.focus(); else links[at - 1]?.focus(); }
  };

  const onRootKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && mode.kind !== "none") { event.preventDefault(); close(true); }
  };
  const onBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    if (mode.kind !== "none" && event.relatedTarget && !root.current?.contains(event.relatedTarget as Node)) close(false);
  };

  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive(current => Math.min(results.length - 1, current + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(current => Math.max(0, current - 1)); }
    else if (event.key === "Enter") {
      const entry = results[active];
      if (entry) { event.preventDefault(); follow(entry.href); }
    }
  };

  const paneId = mode.kind === "panel" ? `panel-${mode.id}` : mode.kind;
  const barHeight = tight ? 48 : 64;
  const expanded = mode.kind !== "none";
  const slide = (dir: number) => reduced ? { opacity: 0 } : { opacity: 0, x: dir * 24 };
  const fade = { duration: reduced ? motionTokens.duration.instant : motionTokens.duration.fast };

  const linkRow = (link: MorphNavLink) => (
    <a key={link.id} className={styles.link} href={link.href} onClick={event => follow(link.href, event)}>
      {link.icon && <span className={styles.linkIcon} aria-hidden="true">{link.icon}</span>}
      <span className={styles.linkText}>
        <span className={styles.linkLabel}>{link.label}</span>
        {link.description && <span className={styles.linkHint}>{link.description}</span>}
      </span>
    </a>
  );

  const grouped = useMemo(() => {
    const groups: { name: string; entries: { entry: MorphNavSearchEntry; index: number }[] }[] = [];
    results.forEach((entry, index) => {
      const name = entry.group ?? "";
      const group = groups.find(item => item.name === name);
      if (group) group.entries.push({ entry, index }); else groups.push({ name, entries: [{ entry, index }] });
    });
    return groups;
  }, [results]);

  return (
    <div ref={setRoot} className={`${styles.root} ${className ?? ""}`} style={{ height: barHeight }} data-tight={tight || undefined} onKeyDown={onRootKey} onBlur={onBlurCapture} onMouseLeave={hoverLeave}>
      <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
      <motion.nav
        className={styles.surface}
        aria-label={label}
        data-open={expanded || undefined}
        initial={false}
        // Kapalı hâlde yarıçap çubuk yüksekliğinin yarısıdır: tam hap görünür. 999 kullanılsaydı açılıp kapanırken yarıçap
        // yüzlerce pikselden geçer, kutu elipse döner ve kenardaki logo ile eylem düğmesi köşe kırpmasının altında kalırdı.
        animate={{ borderRadius: expanded ? 24 : barHeight / 2 }}
        transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}
      >
        <div className={styles.bar} style={{ height: barHeight - 2 }}>
          {mode.kind === "search" ? (
            <div className={styles.searchRow}>
              <svg className={styles.searchGlyph} viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
              <input
                ref={searchInput}
                className={styles.searchInput}
                type="text"
                role="combobox"
                aria-label={searchLabel}
                aria-expanded="true"
                aria-controls={`${ids}-results`}
                aria-activedescendant={results[active] ? `${ids}-result-${results[active]!.id}` : undefined}
                aria-autocomplete="list"
                placeholder={`${searchLabel}…`}
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={onSearchKey}
              />
              <button type="button" className={styles.iconButton} aria-label={closeLabel} onClick={() => close(true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" /></svg>
              </button>
            </div>
          ) : (
            <>
              <a className={styles.brand} href={brand.href ?? "/"} onClick={event => follow(brand.href ?? "/", event)}>
                {brand.mark && <span className={styles.brandMark} aria-hidden="true">{brand.mark}</span>}
                <span className={brand.mark ? styles.brandLabel : undefined}>{brand.label}</span>
              </a>
              {!collapsed && (
                <LayoutGroup id={`${ids}-bar`}>
                  <ul className={styles.list}>
                    {items.map(item => {
                      const hasPanel = !!item.links?.length;
                      const isOpen = mode.kind === "panel" && mode.id === item.id;
                      const common = {
                        ref: (node: HTMLElement | null) => { triggers.current[item.id] = node; },
                        className: styles.top,
                        "aria-current": item.current ? ("page" as const) : undefined,
                        "data-open": isOpen || undefined,
                        onKeyDown: (event: KeyboardEvent<HTMLElement>) => topKey(event, item.id),
                        onPointerEnter: hasPanel ? (event: PointerEvent) => hoverOpen(item.id, event) : () => { clearTimeout(hoverTimer.current); if (mode.kind === "panel") hoverTimer.current = setTimeout(() => close(false), 160); },
                      };
                      return (
                        <li key={item.id} className={styles.topItem}>
                          {isOpen && <motion.span className={styles.indicator} layoutId="indicator" transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} aria-hidden="true" />}
                          {hasPanel
                            ? <button {...common} ref={common.ref as Ref<HTMLButtonElement>} type="button" aria-expanded={isOpen} aria-controls={`${ids}-${item.id}`} onClick={() => (isOpen ? close(false) : openPanel(item.id))}>{item.label}<svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg></button>
                            : <a {...common} ref={common.ref as Ref<HTMLAnchorElement>} href={item.href} onClick={event => item.href && follow(item.href, event)}>{item.label}</a>}
                        </li>
                      );
                    })}
                  </ul>
                </LayoutGroup>
              )}
              <div className={styles.end}>
                {searchEntries && (
                  <button ref={searchButton} type="button" className={styles.iconButton} aria-label={searchLabel} onClick={() => { returnTo.current = searchButton.current; show({ kind: "search" }); }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg>
                  </button>
                )}
                {collapsed && (
                  <button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={mode.kind === "menu"} aria-controls={`${ids}-menu`} onClick={() => { if (mode.kind === "menu") close(false); else { returnTo.current = menuButton.current; show({ kind: "menu" }); } }}>{menuLabel}</button>
                )}
                {action}
              </div>
            </>
          )}
        </div>
        <motion.div className={styles.panel} initial={false} animate={{ height: expanded ? paneHeight : 0, opacity: expanded ? 1 : 0 }} transition={reduced ? { duration: 0 } : { ...motionTokens.spring.smooth, opacity: fade }} aria-hidden={!expanded || undefined}>
          <AnimatePresence initial={false} custom={direction}>
            {mode.kind === "panel" && (() => {
              const item = items.find(entry => entry.id === mode.id);
              if (!item?.links) return null;
              return (
                <motion.div key={paneId} id={`${ids}-${item.id}`} data-pane={item.id} className={styles.pane} initial={slide(direction)} animate={{ opacity: 1, x: 0 }} exit={{ ...slide(-direction), transition: fade }} transition={reduced ? fade : motionTokens.spring.smooth} onKeyDown={event => paneKey(event, item.id)}>
                  <Pane pane={paneId} onHeight={setPaneHeight}>
                    <div className={styles.links} data-columns={item.links.length > 4 ? 2 : 1}>{item.links.map(linkRow)}</div>
                    {item.featured && <div className={styles.featured}>{item.featured}</div>}
                  </Pane>
                </motion.div>
              );
            })()}
            {mode.kind === "search" && (
              <motion.div key="search" className={styles.pane} initial={slide(1)} animate={{ opacity: 1, x: 0 }} exit={{ ...slide(-1), transition: fade }} transition={reduced ? fade : motionTokens.spring.smooth}>
                <Pane pane="search" onHeight={setPaneHeight}>
                  <ul id={`${ids}-results`} className={styles.results} role="listbox" aria-label={searchLabel}>
                    {results.length === 0 ? <li className={styles.empty} role="presentation">{noResultsLabel}</li> : grouped.map(group => (
                      <li key={group.name} role="presentation">
                        <div className={styles.groupName} aria-hidden="true">{query.trim() ? group.name : suggestedLabel}</div>
                        <ul role="presentation" className={styles.groupList}>
                          {group.entries.map(({ entry, index }) => (
                            <li key={entry.id} id={`${ids}-result-${entry.id}`} role="option" aria-selected={index === active} className={styles.result} data-active={index === active || undefined} onMouseEnter={() => setActive(index)}>
                              <a href={entry.href} tabIndex={-1} onClick={event => follow(entry.href, event)}>{entry.label}</a>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </Pane>
              </motion.div>
            )}
            {mode.kind === "menu" && (
              <motion.div key="menu" id={`${ids}-menu`} className={styles.pane} initial={slide(1)} animate={{ opacity: 1, x: 0 }} exit={{ ...slide(-1), transition: fade }} transition={reduced ? fade : motionTokens.spring.smooth}>
                <Pane pane="menu" onHeight={setPaneHeight}>
                  <ul className={styles.menuList}>
                    {items.map(item => (
                      <li key={item.id}>
                        {item.links?.length
                          ? <><div className={styles.groupName}>{item.label}</div>{item.links.map(linkRow)}</>
                          : <a className={styles.link} href={item.href} aria-current={item.current ? "page" : undefined} onClick={event => item.href && follow(item.href, event)}><span className={styles.linkLabel}>{item.label}</span></a>}
                      </li>
                    ))}
                  </ul>
                </Pane>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.nav>
    </div>
  );
}

export default MorphNav;
