"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { collate, date, text } from "@snn/abacus-core";
import { File as FileIcon, FileText, SlidersHorizontal } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { Drawer, DrawerContent } from "../drawer/drawer";
import { EmptyState } from "../empty-state/empty-state";
import { Pagination } from "../pagination/pagination";
import { SearchField } from "../search-field/search-field";
import { Select } from "../select/select";
import { Skeleton } from "../skeleton/skeleton";
import styles from "./search-results.module.css";

export type SearchResultKind = "document" | "person" | "file";

export interface SearchResult {
  id: string;
  kind: SearchResultKind;
  title: string;
  /** Yol ya da ekip bilgisi ("Teklifler › 2026"), kişide görev. */
  subtitle?: string | undefined;
  /** Eşleşen cümle ya da kısa özet; aranan kelimeler vurgulanır. */
  summary?: string | undefined;
  team?: string | undefined;
  editedBy?: string | undefined;
  /** Son düzenleme günü, "YYYY-AA-GG". Tarih aralığı süzgeci ve sıralama buna bakar; kişilerde kullanılmaz. */
  editedAt?: string | undefined;
  /** Dosya boyutu, hazır metin ("2,4 MB"; proje ABACUS ile üretir). */
  sizeLabel?: string | undefined;
  src?: string | undefined;
}

export interface SearchResultsProps {
  results: SearchResult[];
  /** "Bugün", "YYYY-AA-GG". Verilirse tarihler "2 gün önce" gibi göreli yazılır; verilmezse "15.10.2026" gibi. */
  today?: string | undefined;
  /** Çalışma alanı adı; kutuda "{ad} içinde ara" yazar. */
  workspaceName?: string | undefined;
  /** Öneri menüsündeki "Önerilen aramalar". */
  suggestions?: string[] | undefined;
  defaultQuery?: string | undefined;
  /** Sonuç açma eylemi ("Belgeyi aç", "Profili gör", "İndir" düğmeleri). */
  onOpen?: ((result: SearchResult) => void) | undefined;
  loading?: boolean | undefined;
  error?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  /** Sayfa başına sonuç. */
  pageSize?: number | undefined;
  /** Bu genişliklerin (px) altında önizleme panelleri sayfaya, süzgeçler alttan açılan sayfaya taşınır. Ölçü bloğun kendi genişliğine bakar. */
  mediumBreakpoint?: number | undefined;
  narrowBreakpoint?: number | undefined;
  className?: string | undefined;
}

type Size = "wide" | "medium" | "narrow";
type Sort = "relevance" | "newest" | "alpha";

const kindLabel: Record<SearchResultKind, string> = { document: "Belgeler", person: "Kişiler", file: "Dosyalar" };
const kindAction: Record<SearchResultKind, string> = { document: "Belgeyi aç", person: "Profili gör", file: "İndir" };
const kinds: SearchResultKind[] = ["document", "person", "file"];

/** "YYYY-AA-GG" → ay sırası (yıl * 12 + ay). Tarih dizgesi dışarıdan hazır gelir; burada yalnız dilimlenir. */
const monthIndex = (iso: string) => Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7)) - 1;
const monthLabel = (index: number) => date.format(`${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`, "monthYear");

/** Aranan her kelime, Türkçe harf farkı gözetmeden (İ/I, ş/s) metinde bulunmalı. */
function matches(result: SearchResult, key: string): boolean {
  if (!key) return true;
  const haystack = text.searchKey([result.title, result.subtitle, result.summary, result.team].filter(Boolean).join(" "));
  return key.split(" ").every(token => haystack.includes(token));
}

/** Eşleşen kelimeleri `<mark>` ile sarar. Harf katlaması karakter karakter yapılır; böylece vurgu özgün metnin doğru yerine düşer.
 *  Vurgu yalnız renk değildir: kalın ve alt çizgilidir. */
function Highlight({ value, query }: { value: string; query: string }): ReactNode {
  const tokens = text.searchKey(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return value;
  let folded = "";
  const origin: number[] = [];
  Array.from(value).forEach((char, index) => {
    const piece = /\s/.test(char) ? " " : text.searchKey(char);
    for (const unit of piece) { folded += unit; origin.push(index); }
  });
  const chars = Array.from(value);
  const marked = new Set<number>();
  for (const token of tokens) {
    let from = folded.indexOf(token);
    while (from >= 0) {
      for (let at = from; at < from + token.length; at += 1) { const source = origin[at]; if (source !== undefined) marked.add(source); }
      from = folded.indexOf(token, from + 1);
    }
  }
  const parts: ReactNode[] = [];
  let run = "";
  let runMarked = false;
  const flush = () => { if (run) parts.push(runMarked ? <mark key={parts.length} className={styles.mark}>{run}</mark> : run); run = ""; };
  chars.forEach((char, index) => { const on = marked.has(index); if (on !== runMarked) { flush(); runMarked = on; } run += char; });
  flush();
  return <>{parts}</>;
}

/** İki tutamaçlı ay aralığı: iki yerel aralık girişi üst üste durur, dolgu aradaki bölümü gösterir. */
function RangeSlider({ min, max, low, high, onChange }: { min: number; max: number; low: number; high: number; onChange: (low: number, high: number) => void }) {
  const span = Math.max(1, max - min);
  return (
    <div className={styles.range}>
      <div className={styles.rangeTrack} aria-hidden="true"><span className={styles.rangeFill} style={{ left: `${((low - min) / span) * 100}%`, right: `${((max - high) / span) * 100}%` }} /></div>
      <input type="range" className={styles.thumb} min={min} max={max} step={1} value={low} aria-label="Başlangıç ayı" aria-valuetext={monthLabel(low)} onChange={event => onChange(Math.min(Number(event.target.value), high), high)} />
      <input type="range" className={styles.thumb} min={min} max={max} step={1} value={high} aria-label="Bitiş ayı" aria-valuetext={monthLabel(high)} onChange={event => onChange(low, Math.max(Number(event.target.value), low))} />
      <div className={styles.rangeLabels}><span>{monthLabel(low)}</span><span>{monthLabel(high)}</span></div>
    </div>
  );
}

/** Çalışma alanının tamamında arama sayfası: birleşik arama kutusu (son/önerilen aramalar), sayılı süzgeçler, etkin süzgeç çipleri, sıralama,
 *  kayan imleç dolgulu sonuç listesi, önizleme paneli. Orta ve dar kolonda önizleme ve süzgeçler alttan açılan sayfalara taşınır. */
export function SearchResults({
  results, today, workspaceName = "Çalışma alanı", suggestions = [], defaultQuery = "", onOpen, loading = false, error = false, onRetry,
  pageSize = 8, mediumBreakpoint = 1000, narrowBreakpoint = 680, className,
}: SearchResultsProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const searchWrap = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [size, setSize] = useState<Size>("wide");
  const [query, setQuery] = useState(defaultQuery);
  const [draft, setDraft] = useState(defaultQuery);
  const [recent, setRecent] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuIndex, setMenuIndex] = useState(-1);
  const [kindFilter, setKindFilter] = useState<SearchResultKind[]>([]);
  const [teamFilter, setTeamFilter] = useState<string[]>([]);
  const dated = useMemo(() => results.filter(result => result.kind !== "person" && result.editedAt).map(result => monthIndex(result.editedAt!)), [results]);
  const minMonth = dated.length ? Math.min(...dated) : 0;
  const maxMonth = dated.length ? Math.max(...dated) : 0;
  const [range, setRange] = useState<[number, number] | null>(null);
  const low = Math.max(minMonth, range?.[0] ?? minMonth);
  const high = Math.min(maxMonth, range?.[1] ?? maxMonth);
  const rangeActive = dated.length > 0 && (low > minMonth || high < maxMonth);
  const [sort, setSort] = useState<Sort>("relevance");
  const [page, setPage] = useState(1);
  const [cursorId, setCursorId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [filterSheet, setFilterSheet] = useState(false);
  const [previewSheet, setPreviewSheet] = useState(false);
  const [note, setNote] = useState("");

  // Bloğun kendi genişliğini ölçer; hem gözlemciyle hem her çizimde (gözlemci gelene kadar yanlış kipte yanıp sönmesin).
  const measure = (node: HTMLElement) => {
    const width = node.clientWidth;
    setSize(width < narrowBreakpoint ? "narrow" : width < mediumBreakpoint ? "medium" : "wide");
  };
  useEffect(() => {
    if (!root) return;
    const observer = new ResizeObserver(() => measure(root));
    observer.observe(root);
    return () => observer.disconnect();
  }, [root, narrowBreakpoint, mediumBreakpoint]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => { if (root) measure(root); });
  useEffect(() => { if (size === "wide") { setFilterSheet(false); setPreviewSheet(false); } if (size !== "narrow") setFilterSheet(false); }, [size]);

  const key = text.searchKey(query.trim());
  const teams = useMemo(() => collate.sortBy(Array.from(new Set(results.map(result => result.team).filter((team): team is string => !!team))), team => team), [results]);

  const passes = (result: SearchResult, skip?: "kind" | "team") => {
    if (!matches(result, key)) return false;
    if (skip !== "kind" && kindFilter.length && !kindFilter.includes(result.kind)) return false;
    if (skip !== "team" && teamFilter.length && (!result.team || !teamFilter.includes(result.team))) return false;
    // Tarih aralığı yalnız belge ve dosyalara uygulanır; kişilerde etkisizdir.
    if (rangeActive && result.kind !== "person") { if (!result.editedAt) return false; const month = monthIndex(result.editedAt); if (month < low || month > high) return false; }
    return true;
  };

  const filtered = useMemo(() => {
    const list = results.filter(result => passes(result));
    if (sort === "newest") return [...list].sort((a, b) => { const x = a.editedAt ?? ""; const y = b.editedAt ?? ""; return x < y ? 1 : x > y ? -1 : 0; });
    if (sort === "alpha") return collate.sortBy(list, result => result.title);
    if (!key) return list;
    // Başlıkta tüm kelimeler geçen sonuç önce gelir.
    const score = (result: SearchResult) => { const title = text.searchKey(result.title); return key.split(" ").every(token => title.includes(token)) ? 1 : 0; };
    return [...list].sort((a, b) => score(b) - score(a));
  }, [results, key, kindFilter, teamFilter, low, high, rangeActive, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selectedId = (pinnedId && rows.some(row => row.id === pinnedId) ? pinnedId : null) ?? (cursorId && rows.some(row => row.id === cursorId) ? cursorId : null) ?? rows[0]?.id ?? null;
  const cursor = cursorId && rows.some(row => row.id === cursorId) ? cursorId : rows[0]?.id ?? null;
  const preview = rows.find(row => row.id === selectedId) ?? null;
  const activeCount = kindFilter.length + teamFilter.length + (rangeActive ? 1 : 0);

  // Sonuç sayısı ve yükleme durumu nazikçe duyurulur.
  useEffect(() => { setNote(loading ? "Sonuçlar yükleniyor" : error ? "Arama şu an yapılamıyor." : key || activeCount ? `${filtered.length} sonuç bulundu` : ""); }, [loading, error, filtered.length, key, activeCount]);

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter(item => item !== value) : [...list, value]);
  const clearFilters = () => { setKindFilter([]); setTeamFilter([]); setRange(null); setPage(1); };

  function run(next: string) {
    const value = next.trim();
    setDraft(next); setQuery(value); setPage(1); setCursorId(null); setPinnedId(null); setMenuOpen(false); setMenuIndex(-1);
    if (value) setRecent(current => [value, ...current.filter(item => text.searchKey(item) !== text.searchKey(value))].slice(0, 5));
  }

  const menuOptions = [...recent.map(value => ({ value, group: "Son aramalar" })), ...suggestions.filter(item => !recent.includes(item)).map(value => ({ value, group: "Önerilen aramalar" }))];

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!menuOpen) { setMenuOpen(true); return; }
      if (menuOptions.length) setMenuIndex(index => (index + (event.key === "ArrowDown" ? 1 : -1) + menuOptions.length) % menuOptions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = menuOpen ? menuOptions[menuIndex] : undefined;
      run(option ? option.value : draft);
    } else if (event.key === "Escape") {
      // Önce menü kapanır, ikinci Esc metni siler.
      if (menuOpen) { event.preventDefault(); setMenuOpen(false); setMenuIndex(-1); } else if (draft) { event.preventDefault(); run(""); }
    }
  }

  // "/" başka alanda odak yoksa arama kutusuna götürür.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openRow(result: SearchResult) {
    setPinnedId(result.id); setCursorId(result.id);
    if (size !== "wide") setPreviewSheet(true);
  }

  // Sonuç listesi tek seçenek listesidir: ok, J/K, Home/End gezer; ilk satırda yukarı ok kutuya döner.
  function onListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const index = rows.findIndex(row => row.id === cursor);
    let next = index;
    if (event.key === "ArrowDown" || event.key === "j") next = Math.min(rows.length - 1, index + 1);
    else if (event.key === "ArrowUp" || event.key === "k") { if (index <= 0) { event.preventDefault(); inputRef.current?.focus(); return; } next = index - 1; }
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = rows.length - 1;
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); const row = rows[index]; if (row) openRow(row); return; }
    else return;
    event.preventDefault();
    const row = rows[next];
    if (row) { setCursorId(row.id); setPinnedId(null); }
  }

  const when = (result: SearchResult) => !result.editedAt ? "" : today ? date.relative(result.editedAt, today) : date.format(result.editedAt);
  const meta = (result: SearchResult) => [result.editedBy && `${result.editedBy} değiştirdi`, when(result), result.sizeLabel].filter(Boolean).join(" · ");

  const filterContent = (
    <div className={styles.filters}>
      <fieldset className={styles.group}>
        <legend>Tür</legend>
        {kinds.map(kind => {
          const count = results.filter(result => result.kind === kind && passes(result, "kind")).length;
          return <Checkbox key={kind} label={`${kindLabel[kind]} (${count})`} checked={kindFilter.includes(kind)} disabled={count === 0 && !kindFilter.includes(kind)} onCheckedChange={() => { setKindFilter(current => toggle(current, kind)); setPage(1); }} />;
        })}
      </fieldset>
      {teams.length > 0 && (
        <fieldset className={styles.group}>
          <legend>Ekip</legend>
          {teams.map(team => {
            const count = results.filter(result => result.team === team && passes(result, "team")).length;
            return <Checkbox key={team} label={`${team} (${count})`} checked={teamFilter.includes(team)} disabled={count === 0 && !teamFilter.includes(team)} onCheckedChange={() => { setTeamFilter(current => toggle(current, team)); setPage(1); }} />;
          })}
        </fieldset>
      )}
      {maxMonth > minMonth && (
        <fieldset className={styles.group}>
          <legend>Son düzenleme</legend>
          <RangeSlider min={minMonth} max={maxMonth} low={low} high={high} onChange={(nextLow, nextHigh) => { setRange([nextLow, nextHigh]); setPage(1); }} />
          <p className={styles.note}>Belge ve dosyalar için geçerli.</p>
        </fieldset>
      )}
    </div>
  );

  const previewContent = preview ? (
    <motion.div key={preview.id} className={styles.previewBody} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? motionTokens.duration.instant : motionTokens.duration.standard }}>
      <div className={styles.previewHead}>
        {preview.kind === "person" ? <Avatar name={preview.title} src={preview.src} size="lg" /> : <span className={styles.kindIcon} aria-hidden="true">{preview.kind === "file" ? <FileIcon size={22} /> : <FileText size={22} />}</span>}
        <div className={styles.previewTitle}><h3>{preview.title}</h3>{preview.subtitle && <p>{preview.subtitle}</p>}</div>
      </div>
      {preview.summary && <p className={styles.previewSummary}><Highlight value={preview.summary} query={query} /></p>}
      {meta(preview) && <p className={styles.note}>{meta(preview)}</p>}
      <Button onClick={() => onOpen?.(preview)}>{kindAction[preview.kind]}</Button>
    </motion.div>
  ) : null;

  const chips: { id: string; label: string; remove: () => void }[] = [
    ...kindFilter.map(kind => ({ id: `k-${kind}`, label: kindLabel[kind], remove: () => setKindFilter(current => current.filter(item => item !== kind)) })),
    ...teamFilter.map(team => ({ id: `t-${team}`, label: team, remove: () => setTeamFilter(current => current.filter(item => item !== team)) })),
    ...(rangeActive ? [{ id: "range", label: `${monthLabel(low)} – ${monthLabel(high)}`, remove: () => setRange(null) }] : []),
  ];

  const showHome = !key && activeCount === 0 && !loading && !error;
  const optionId = (index: number) => `${uid}-opt-${index}`;
  const listId = `${uid}-results`;

  return (
    <section ref={setRoot} className={[styles.root, className].filter(Boolean).join(" ")} data-size={size} aria-label="Arama sonuçları" aria-busy={loading || undefined}>
      <div className={styles.status} role="status" aria-live="polite">{note}</div>

      <div className={styles.searchBar} ref={searchWrap} onBlur={event => { if (!searchWrap.current?.contains(event.relatedTarget as Node | null)) { setMenuOpen(false); setMenuIndex(-1); } }}>
        <div className={styles.searchField}>
          <SearchField
            ref={inputRef} label={`${workspaceName} içinde ara`} placeholder={`${workspaceName} içinde ara`} value={draft} onValueChange={value => { setDraft(value); setMenuOpen(true); setMenuIndex(-1); }}
            onFocus={() => setMenuOpen(true)} onKeyDown={onInputKeyDown} autoComplete="off" aria-keyshortcuts="/"
            role="combobox" aria-expanded={menuOpen && menuOptions.length > 0} aria-controls={`${uid}-menu`} aria-autocomplete="list" aria-activedescendant={menuOpen && menuIndex >= 0 ? optionId(menuIndex) : undefined}
          />
          {menuOpen && menuOptions.length > 0 && (
            <div id={`${uid}-menu`} role="listbox" aria-label="Arama önerileri" className={styles.menu}>
              {["Son aramalar", "Önerilen aramalar"].map(group => {
                const items = menuOptions.map((option, index) => ({ option, index })).filter(entry => entry.option.group === group);
                if (!items.length) return null;
                return (
                  <div key={group} role="group" aria-label={group}>
                    <div className={styles.menuGroup}>{group}</div>
                    {items.map(({ option, index }) => (
                      <div key={option.value} id={optionId(index)} role="option" aria-selected={index === menuIndex} className={styles.menuOption} data-active={index === menuIndex ? "true" : undefined} onMouseDown={event => event.preventDefault()} onClick={() => run(option.value)}>{option.value}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {size === "narrow" && <Button variant="secondary" onClick={() => setFilterSheet(true)}><SlidersHorizontal size={16} aria-hidden="true" />{`Süzgeçler (${activeCount})`}</Button>}
      </div>

      <div className={styles.body}>
        {size !== "narrow" && <aside className={styles.side} aria-label="Süzgeçler">{filterContent}</aside>}
        <div className={styles.main}>
          {chips.length > 0 && (
            <div className={styles.chips}>
              {chips.map(chip => <span key={chip.id} className={styles.chip}>{chip.label}<button type="button" aria-label={`${chip.label} süzgecini kaldır`} onClick={() => { chip.remove(); setPage(1); }}>×</button></span>)}
              <Button variant="ghost" size="sm" onClick={clearFilters}>Tümünü temizle</Button>
            </div>
          )}

          {showHome ? (
            <div className={styles.home}>
              {recent.length > 0 && <div><h3 className={styles.homeTitle}>Son aramalar</h3><div className={styles.suggest}>{recent.map(value => <Button key={value} variant="secondary" size="sm" onClick={() => run(value)}>{value}</Button>)}</div></div>}
              {suggestions.length > 0 && <div><h3 className={styles.homeTitle}>Önerilen aramalar</h3><div className={styles.suggest}>{suggestions.map(value => <Button key={value} variant="secondary" size="sm" onClick={() => run(value)}>{value}</Button>)}</div></div>}
              {recent.length === 0 && suggestions.length === 0 && <EmptyState title="Aramaya başlayın" description="Bir kelime yazıp Enter'a basın." />}
            </div>
          ) : (
            <>
              <div className={styles.head}>
                <span className={styles.count}>{loading ? "Aranıyor…" : `${filtered.length} sonuç`}</span>
                <div className={styles.sort}>
                  <Select label="Sırala" value={sort} onValueChange={value => { setSort(value as Sort); setPage(1); setCursorId(null); }} options={[{ value: "relevance", label: "En uygun" }, { value: "newest", label: "En yeni" }, { value: "alpha", label: "A–Z" }]} />
                </div>
              </div>

              {error && (
                <div className={styles.error} role="alert"><span>Arama şu an yapılamıyor.</span>{onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Yeniden dene</Button>}</div>
              )}

              {loading ? (
                <div className={styles.skeletons}>{[0, 1, 2, 3].map(index => <Skeleton key={index} lines={3} label="Sonuçlar yükleniyor" />)}</div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  title={`'${query}' için sonuç bulunamadı`} description="Yazımı kontrol edin ya da önerilen aramalardan birini deneyin."
                  action={<div className={styles.suggest}>{suggestions.map(value => <Button key={value} variant="secondary" size="sm" onClick={() => run(value)}>{value}</Button>)}{activeCount > 0 && <Button variant="ghost" size="sm" onClick={clearFilters}>Süzgeçleri temizle</Button>}</div>}
                />
              ) : (
                <div id={listId} className={styles.list} role="listbox" aria-label="Sonuçlar" tabIndex={0} aria-activedescendant={cursor ? `${uid}-row-${cursor}` : undefined} data-stale={error ? "true" : undefined} onKeyDown={onListKeyDown}>
                  {rows.map(row => {
                    const here = row.id === cursor;
                    return (
                      <div
                        key={row.id} id={`${uid}-row-${row.id}`} role="option" aria-selected={row.id === pinnedId} className={styles.row} data-kind={row.kind}
                        aria-label={[row.title, row.subtitle, meta(row), row.summary].filter(Boolean).join(". ")} onPointerMove={() => { if (cursor !== row.id) setCursorId(row.id); }} onClick={() => openRow(row)}
                      >
                        {here && <motion.span layoutId={`${uid}-cursor`} className={styles.cursor} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth} aria-hidden="true" />}
                        <span className={styles.lead} aria-hidden="true">{row.kind === "person" ? <Avatar name={row.title} src={row.src} size="sm" /> : row.kind === "file" ? <FileIcon size={18} /> : <FileText size={18} />}</span>
                        <span className={styles.copy}>
                          <span className={styles.titleLine}><span className={styles.title}><Highlight value={row.title} query={query} /></span><Badge size="sm">{kindLabel[row.kind]}</Badge></span>
                          {row.subtitle && <span className={styles.subtitle}>{row.subtitle}</span>}
                          {row.summary && <span className={styles.summary}><Highlight value={row.summary} query={query} /></span>}
                          {meta(row) && <span className={styles.meta}>{meta(row)}</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {!loading && filtered.length > pageSize && <div className={styles.pager}><Pagination page={safePage} pageCount={pageCount} onPageChange={value => { setPage(value); setCursorId(null); }} /></div>}
            </>
          )}
        </div>
        {size === "wide" && <aside className={styles.preview} aria-label="Önizleme">{previewContent ?? <p className={styles.note}>Önizlemek için bir sonuç seçin.</p>}</aside>}
      </div>

      <Drawer open={filterSheet} onOpenChange={setFilterSheet}>
        <DrawerContent title="Süzgeçler" side="bottom" container={root}>
          {filterContent}
          <div className={styles.sheetBar}><Button variant="ghost" onClick={clearFilters}>Tümünü temizle</Button><Button onClick={() => setFilterSheet(false)}>Sonuçları göster</Button></div>
        </DrawerContent>
      </Drawer>
      <Drawer open={previewSheet && size !== "wide"} onOpenChange={setPreviewSheet}>
        <DrawerContent title="Önizleme" side="bottom" container={root}>{previewContent}</DrawerContent>
      </Drawer>
    </section>
  );
}

export default SearchResults;
