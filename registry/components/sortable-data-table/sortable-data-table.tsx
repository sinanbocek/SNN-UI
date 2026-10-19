"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode, RefObject } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Transition, type Variants } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { Pagination } from "../pagination/pagination";
import { compareText, formatCell, opensRow, pageCountOf, pageSpan, rangeLabel, sortAnnouncement, type CellCurrency, type CellFormat } from "./sortable-data-table-format";
import styles from "./sortable-data-table.module.css";

export type SortDirection = "asc" | "desc";
export type SortState = { key: string; direction: SortDirection };
export type { CellCurrency, CellFormat };

export type DataColumn<T> = {
  key: string;
  label: string;
  sortable?: boolean | undefined;
  render?: ((value: unknown, row: T) => ReactNode) | undefined;
  /** Sütunu sağa yaslar, eş genişlikli rakam kullanır. Her değer sayıysa kendiliğinden anlaşılır. */
  numeric?: boolean | undefined;
  /** Yazım (ABACUS): "money" kuruş tam sayısını "₺1.234,50" yazar ve sağa yaslar; "number" "1.234,5"; "date" "16.10.2026"; "text" olduğu gibi. Verilmezse türe bakılır. */
  format?: CellFormat | undefined;
  /** "money" sütununun birimi. Varsayılan TRY. */
  currency?: CellCurrency | undefined;
  /** "number" sütununun sabit ondalık basamağı. */
  digits?: number | undefined;
  /** Sabit genişlik, 120 ya da "20%". Diğer sütunlar bir kez ölçülüp tutulur; sıralama onları yeniden dizmez. */
  width?: number | string | undefined;
};

export type SortableDataTableProps<T extends Record<string, unknown>> = {
  rows: T[];
  columns: DataColumn<T>[];
  rowKey: keyof T | ((row: T) => string);
  caption?: string | undefined;
  emptyMessage?: string | undefined;
  /** İlk çizimde uygulanan sıralama. */
  defaultSort?: SortState | undefined;
  onSortChange?: ((sort: SortState) => void) | undefined;
  /** Onay kutusu sütunu, satıra tıklayarak seçim ve temizleme düğmeli sayı satırı ekler. */
  selectable?: boolean | undefined;
  selectedKeys?: string[] | undefined;
  defaultSelectedKeys?: string[] | undefined;
  onSelectionChange?: ((keys: string[]) => void) | undefined;
  /** Sayı satırındaki ad, "6 proje" gibi. Türkçede sayıdan sonra tekil kalır; iki biçim Arc ile uyum için durur. */
  itemName?: { one: string; other: string } | undefined;
  /** Sayfa boyu. Verilirse tablo sayfalanır ve altta sayfalama çıkar (katalogdaki `pagination`). */
  pageSize?: number | undefined;
  /** Denetimli sayfa (1'den başlar). Verilmezse tablo kendi tutar; sıralama değişince 1. sayfaya döner. */
  page?: number | undefined;
  defaultPage?: number | undefined;
  onPageChange?: ((page: number) => void) | undefined;
  /** Satıra tıklayınca (ya da satır odaktayken Enter'a basınca) çağrılır; ayrıntı açmak için. Verilince satırlar Tab ile odaklanır.
   * Satırdaki bağlantı, düğme ve onay kutusu kendi işini yapar, bunu çağırmaz. `selectable` ile birlikte verilirse satıra tıklamak seçmez, bunu çağırır; seçim onay kutusundan yapılır. */
  onRowClick?: ((row: T) => void) | undefined;
  /** Satıra eklenen sınıf, örneğin pasif kaydı soluk göstermek için. */
  rowClassName?: ((row: T) => string | undefined) | undefined;
};

const isEmpty = (value: unknown) => value == null || value === "";
/** Satıra tıklama bunların içinden geldiyse satır işi yapılmaz; öğe kendi işini yapar. */
const interactive = "a, button, input, label, select, textarea, [role='button'], [contenteditable='true']";
const comparable = (value: unknown) => value instanceof Date ? value.getTime() : value;
const blur = (px: number) => `blur(${px}px)`;
const enter: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
const leave: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const instant: Transition = { duration: motionTokens.duration.instant };
/** Değişen metin gittiği yandan yükselir, öbür yandan kalkar. */
const rise: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${.3 * direction}em`, filter: blur(motionTokens.blur.soft) }),
  shown: { opacity: 1, y: "0em", filter: blur(0), transition: enter },
  gone: (direction: number) => ({ opacity: 0, y: `${-.3 * direction}em`, filter: blur(motionTokens.blur.subtle), transition: leave }),
};
/** Azaltılmış hareket rise ile aynı özellikleri tutar (kayma ve bulanıklık yok); sunucu ve istemci aynı stili çizer. */
const fade: Variants = { enter: { opacity: 0, y: "0em", filter: blur(0) }, shown: { opacity: 1, y: "0em", filter: blur(0), transition: instant }, gone: { opacity: 0, y: "0em", filter: blur(0), transition: instant } };
/** Tik ve tire aynı üç noktayı paylaşır; başlık kutusu "hepsi" ile "bazısı" arasında biçim değiştirir. */
const checkPath = "M4.25 9.25 L7.25 12.25 L13.75 5.75";
const dashPath = "M4.75 9 L9 9 L13.25 9";

/** Yerinde değişen metin. Yuva yeni genişliğe kayar; yanındaki sözcükler zıplamaz. */
function Swap({ value, direction, reduced, className }: { value: string; direction: number; reduced: boolean; className?: string | undefined }) {
  const inner = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | string>("auto");
  useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    let settled = false;
    const measure = () => {
      const next = node.getBoundingClientRect().width;
      if (settled && !reduced) animate(width, next, motionTokens.spring.morph); else width.jump(next);
      settled = true;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, width]);
  return <motion.span className={[styles.swap, className].filter(Boolean).join(" ")} style={{ width }}>
    <span ref={inner} className={styles.swapInner}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.span key={value} className={styles.swapText} custom={direction} variants={reduced ? fade : rise} initial="enter" animate="shown" exit="gone">{value}</motion.span>
      </AnimatePresence>
    </span>
  </motion.span>;
}

/** Ok, sütun sıralanınca belirir ve yön değişince yayla döner. */
function SortGlyph({ active, descending, reduced }: { active: boolean; descending: boolean; reduced: boolean }) {
  const rotate = useMotionValue(descending ? 180 : 0);
  const seen = useRef({ active, hiddenAt: -Infinity });
  useLayoutEffect(() => {
    const state = seen.current;
    if (active) {
      // Yalnız ok görünürken döner; yeni beliren ok doğru yönü göstererek başlar.
      const visible = state.active || performance.now() - state.hiddenAt < 160;
      if (visible && !reduced) animate(rotate, descending ? 180 : 0, motionTokens.spring.snappy);
      else rotate.jump(descending ? 180 : 0);
    } else if (state.active) state.hiddenAt = performance.now();
    state.active = active;
  }, [active, descending, reduced, rotate]);
  const transition: Transition = reduced ? instant : active ? { opacity: enter, filter: enter, scale: motionTokens.spring.snappy } : { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] };
  return <span className={styles.sortIcon} aria-hidden="true">
    <ArrowUp className={styles.sortHint} size={16} strokeWidth={1.75} />
    <motion.span className={styles.sortArrow} style={{ rotate }} initial={false} animate={active ? { opacity: 1, scale: 1, filter: blur(0) } : { opacity: 0, scale: .6, filter: blur(motionTokens.blur.subtle) }} transition={transition}><ArrowUp size={16} strokeWidth={1.75} /></motion.span>
  </span>;
}

function SelectBox({ checked, mixed = false, label, nav, reduced, onToggle, inputRef }: { checked: boolean; mixed?: boolean | undefined; label: string; nav: "head" | "row"; reduced: boolean; onToggle: (extend: boolean) => void; inputRef?: RefObject<HTMLInputElement | null> | undefined }) {
  const local = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? local;
  const on = checked || mixed;
  useLayoutEffect(() => { if (ref.current) ref.current.indeterminate = mixed; }, [mixed, ref]);
  const opacity: Transition = { duration: on ? motionTokens.duration.instant : motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
  return <label className={styles.selectHit}>
    <input ref={ref} type="checkbox" className={styles.selectInput} checked={checked} aria-label={label} data-nav={nav} onChange={event => onToggle((event.nativeEvent as MouseEvent).shiftKey === true)} />
    <span className={styles.selectBox} data-on={on || undefined} aria-hidden="true">
      <motion.span className={styles.selectFill} initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : .6 }} transition={reduced ? { duration: 0 } : { scale: motionTokens.spring.snappy, opacity }} />
      <svg className={styles.selectMark} viewBox="0 0 18 18" fill="none" focusable="false">
        <motion.path initial={false} animate={{ d: mixed ? dashPath : checkPath, pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={reduced ? { duration: 0 } : { d: motionTokens.spring.morph, pathLength: motionTokens.spring.snappy, opacity }} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  </label>;
}

export function SortableDataTable<T extends Record<string, unknown>>({ rows, columns, rowKey, caption = "Veri tablosu", emptyMessage = "Gösterilecek kayıt yok", defaultSort, onSortChange, selectable = false, selectedKeys, defaultSelectedKeys, onSelectionChange, itemName = { one: "kayıt", other: "kayıt" }, pageSize, page: pageProp, defaultPage = 1, onPageChange, onRowClick, rowClassName }: SortableDataTableProps<T>) {
  const reduced = useReducedMotion() ?? false;
  const tableRef = useRef<HTMLTableElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const anchor = useRef<string | null>(null);
  const [sort, setSort] = useState<SortState | null>(defaultSort ?? null);
  const [announcement, setAnnouncement] = useState("");
  const [internalSelection, setInternalSelection] = useState<string[]>(defaultSelectedKeys ?? []);
  const selection = useMemo(() => new Set(selectedKeys ?? internalSelection), [internalSelection, selectedKeys]);
  const [internalPage, setInternalPage] = useState(defaultPage);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    return rows.map((row, index) => ({ row, index })).sort((a, b) => {
      const left = comparable(a.row[sort.key]);
      const right = comparable(b.row[sort.key]);
      // Boş değerler iki yönde de en altta kalır.
      if (isEmpty(left) || isEmpty(right)) return isEmpty(left) === isEmpty(right) ? a.index - b.index : isEmpty(left) ? 1 : -1;
      const result = typeof left === "number" && typeof right === "number" ? left - right : compareText(String(left), String(right));
      return (sort.direction === "asc" ? result : -result) || a.index - b.index;
    }).map(entry => entry.row);
  }, [rows, sort]);

  const numeric = useMemo(() => new Set(columns.filter(column => column.numeric ?? (column.format === "money" || (column.format !== "date" && column.format !== "text" && rows.some(row => typeof row[column.key] === "number") && rows.every(row => typeof row[column.key] === "number" || isEmpty(row[column.key]))))).map(column => column.key)), [columns, rows]);
  // Dar ekran kartında başlık satırının sağına çıkan sayı: ilk sütun dışındaki ilk sayı sütunu.
  const leadKey = columns.find((column, index) => index > 0 && numeric.has(column.key))?.key;
  const getRowKey = (row: T) => String(typeof rowKey === "function" ? rowKey(row) : row[rowKey]);
  const allKeys = sortedRows.map(getRowKey);

  // Sayfalama (SNN ekledi): seçim bütün satırlarda tutulur; "hepsini seç", ok tuşları ve Shift aralığı görünen sayfada çalışır.
  const pageCount = pageCountOf(allKeys.length, pageSize);
  const paged = Boolean(pageSize) && pageCount > 1;
  const page = Math.min(Math.max(1, pageProp ?? internalPage), pageCount);
  const pageRows = pageSize ? sortedRows.slice((page - 1) * pageSize, page * pageSize) : sortedRows;
  const keys = pageSize ? allKeys.slice((page - 1) * pageSize, page * pageSize) : allKeys;
  const order = keys.join("\u0000");
  const selectedCount = allKeys.filter(key => selection.has(key)).length;
  const pageSelected = keys.filter(key => selection.has(key)).length;
  const allSelected = keys.length > 0 && pageSelected === keys.length;
  function goToPage(next: number) {
    if (pageProp === undefined) setInternalPage(next);
    onPageChange?.(next);
  }

  // Doğal sütun genişlikleri bir kez ölçülür, sonra sabit düzenle tutulur; satırlar yer değiştirirken hiçbir şey yeniden dizilmez.
  const signature = [selectable ? "select" : "", ...columns.map(column => column.key)].join("\u0000");
  const [locked, setLocked] = useState<{ signature: string; widths: Record<string, number> } | null>(null);
  const widths = locked?.signature === signature ? locked.widths : null;
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table || widths) return;
    const measure = () => {
      const total = table.getBoundingClientRect().width;
      if (!total || getComputedStyle(table).display !== "table") return false;
      const next: Record<string, number> = {};
      table.querySelectorAll<HTMLElement>("thead th[data-key]").forEach(cell => { next[cell.dataset.key ?? ""] = cell.getBoundingClientRect().width / total * 100; });
      setLocked({ signature, widths: next });
      return true;
    };
    if (measure()) return;
    const observer = new ResizeObserver(() => { if (measure()) observer.disconnect(); });
    observer.observe(table);
    return () => observer.disconnect();
  }, [signature, widths]);

  // Sıralanan sütunun altındaki sabit renk bandı, satırlar birbirini geçerken açılan boşlukları doldurur.
  const [band, setBand] = useState<{ left: number; width: number } | null>(null);
  const seenSort = useRef(false);
  useLayoutEffect(() => {
    const table = tableRef.current;
    const key = sort?.key;
    const update = () => {
      const cell = key ? table?.querySelector<HTMLElement>(`thead th[data-key="${CSS.escape(key)}"]`) : null;
      setBand(current => !cell ? null : current?.left === cell.offsetLeft && current.width === cell.offsetWidth ? current : { left: cell.offsetLeft, width: cell.offsetWidth });
    };
    update();
    if (!table || !key) return;
    // Telefonda başlık kayan bir sıralama düğmeleri şerididir; etkin olan görünür tutulur.
    const cell = table.querySelector<HTMLElement>(`thead th[data-key="${CSS.escape(key)}"]`);
    const strip = cell?.parentElement;
    if (cell && strip && strip.scrollWidth > strip.clientWidth && getComputedStyle(table).display !== "table") {
      const bounds = strip.getBoundingClientRect(), target = cell.getBoundingClientRect(), inset = 8;
      const start = Math.max(bounds.left, strip.querySelector("th:not([data-key])")?.getBoundingClientRect().right ?? bounds.left) + inset;
      const shift = target.right > bounds.right - inset ? target.right - bounds.right + inset : target.left < start ? target.left - start : 0;
      if (shift) strip.scrollTo({ left: strip.scrollLeft + shift, behavior: reduced || !seenSort.current ? "auto" : "smooth" });
    }
    seenSort.current = true;
    const observer = new ResizeObserver(update);
    observer.observe(table);
    return () => observer.disconnect();
  }, [reduced, sort?.key, widths]);

  const shownCount = selectedCount || allKeys.length;
  const noun = selectedCount ? "seçili" : allKeys.length === 1 ? itemName.one : itemName.other;
  const [lastCount, setLastCount] = useState(shownCount);
  const [countDirection, setCountDirection] = useState(1);
  if (shownCount !== lastCount) { setLastCount(shownCount); setCountDirection(shownCount > lastCount ? 1 : -1); }

  function sortBy(column: DataColumn<T>) {
    const next: SortState = { key: column.key, direction: sort?.key === column.key && sort.direction === "asc" ? "desc" : "asc" };
    setSort(next);
    onSortChange?.(next);
    if (pageSize && page !== 1) goToPage(1);
    setAnnouncement(sortAnnouncement(column.label, next.direction));
  }

  function commit(next: Set<string>) {
    const list = allKeys.filter(key => next.has(key));
    if (selectedKeys === undefined) setInternalSelection(list);
    onSelectionChange?.(list);
    setAnnouncement(list.length ? `${list.length} / ${allKeys.length} seçildi` : "Seçim temizlendi");
  }

  function toggleRow(key: string, extend: boolean) {
    const next = new Set(selection);
    const checked = !selection.has(key);
    const from = extend && anchor.current ? keys.indexOf(anchor.current) : -1;
    const to = keys.indexOf(key);
    (from < 0 ? [key] : keys.slice(Math.min(from, to), Math.max(from, to) + 1)).forEach(item => checked ? next.add(item) : next.delete(item));
    anchor.current = key;
    commit(next);
  }

  function togglePage() {
    const next = new Set(selection);
    keys.forEach(key => allSelected ? next.delete(key) : next.add(key));
    commit(next);
  }

  function clearSelection() {
    commit(new Set());
    selectAllRef.current?.focus();
  }

  function handleRowClick(event: ReactMouseEvent<HTMLTableRowElement>, key: string, row: T) {
    if ((event.target as HTMLElement).closest(interactive) || window.getSelection()?.toString()) return;
    if (onRowClick) { onRowClick(row); return; }
    if (!selectable) return;
    toggleRow(key, event.shiftKey);
    // Klavye yolu işaretçinin bıraktığı yerden sürer; oklar bu satırdan devam eder.
    event.currentTarget.querySelector<HTMLInputElement>("input[type='checkbox']")?.focus({ preventScroll: true });
  }

  /** Oklar başlık denetimlerinde ve satır kutularında gezer; Escape seçimi temizler. */
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (event.key === "Escape" && selectedCount) {
      event.preventDefault();
      event.stopPropagation();
      if (target.dataset.clear !== undefined) clearSelection(); else commit(new Set());
      return;
    }
    const nav = target.dataset.nav;
    if (!nav) return;
    const list = (name: string) => [...event.currentTarget.querySelectorAll<HTMLElement>(`[data-nav="${name}"]`)];
    const items = list(nav);
    const index = items.indexOf(target);
    const steps: Record<string, [HTMLElement[], number]> = nav === "head"
      ? { ArrowRight: [items, index + 1], ArrowLeft: [items, index - 1], Home: [items, 0], End: [items, items.length - 1], ...(target === selectAllRef.current ? { ArrowDown: [list("row"), 0] } : {}) }
      : { ArrowDown: [items, index + 1], ArrowUp: index === 0 && selectAllRef.current ? [[selectAllRef.current], 0] : [items, index - 1], Home: [items, 0], End: [items, items.length - 1] };
    const step = steps[event.key];
    const next = step?.[0][step[1]];
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  return <div className={styles.wrapper} onKeyDown={onKeyDown}>
    <div className={styles.scroller}>
      {band ? <span className={styles.band} style={{ left: band.left, width: band.width }} aria-hidden="true" /> : null}
      <table ref={tableRef} role="table" className={styles.table} data-fixed={widths ? "" : undefined} data-selectable={selectable || undefined}>
        <caption>{caption}</caption>
        <colgroup>
          {selectable ? <col className={styles.selectCol} /> : null}
          {columns.map((column, index) => <col key={column.key} style={{ width: column.width !== undefined ? (typeof column.width === "number" ? `${column.width}px` : column.width) : widths && index > 0 ? `${widths[column.key]}%` : undefined }} />)}
        </colgroup>
        <thead role="rowgroup"><tr role="row">
          {selectable ? <th scope="col" role="columnheader" className={styles.selectCell}><SelectBox inputRef={selectAllRef} checked={allSelected} mixed={pageSelected > 0 && !allSelected} label={pageSize ? "Bu sayfadaki tüm satırları seç" : "Tüm satırları seç"} nav="head" reduced={reduced} onToggle={togglePage} /></th> : null}
          {columns.map((column, index) => {
            const active = sort?.key === column.key;
            const sortable = column.sortable !== false;
            return <th key={column.key} scope="col" role="columnheader" data-key={column.key} data-primary={index === 0 || undefined} data-sorted={active || undefined} data-numeric={numeric.has(column.key) || undefined} data-sortable={sortable || undefined} aria-sort={!sortable ? undefined : active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
              {sortable ? <button className={styles.sortButton} type="button" data-nav="head" onClick={() => sortBy(column)} aria-label={`${column.label} sütununa göre sırala${active ? `, şu an ${sort.direction === "asc" ? "artan" : "azalan"}` : ""}`}>
                <span className={styles.sortInner}><span>{column.label}</span><SortGlyph active={active} descending={active && sort.direction === "desc"} reduced={reduced} /></span>
              </button> : column.label}
            </th>;
          })}
        </tr></thead>
        <tbody role="rowgroup">{pageRows.length ? pageRows.map((row, index) => {
          const key = keys[index]!;
          const selected = selectable && selection.has(key);
          // Tıklanabilir satır Tab ile odaklanır; seçim yoksa oklar satırlar arasında gezer (seçimde oklar onay kutularındadır).
          return <motion.tr key={key} role="row" layout={reduced ? false : "position"} layoutDependency={order} transition={motionTokens.spring.smooth} className={rowClassName?.(row) || undefined} data-selected={selected || undefined} data-clickable={onRowClick ? "" : undefined}
            tabIndex={onRowClick ? 0 : undefined} data-nav={onRowClick && !selectable ? "row" : undefined}
            onClick={event => handleRowClick(event, key, row)}
            onKeyDown={onRowClick ? event => { if (opensRow(event.key, event.repeat, event.target === event.currentTarget)) { event.preventDefault(); onRowClick(row); } } : undefined}
            onMouseDown={event => { if (selectable && event.shiftKey) event.preventDefault(); }}>
            {selectable ? <td role="cell" className={styles.selectCell}><SelectBox checked={selected} label={`${String(row[columns[0]?.key as string] ?? key)} seç`} nav="row" reduced={reduced} onToggle={extend => toggleRow(key, extend)} /></td> : null}
            {columns.map((column, columnIndex) => <td key={column.key} role="cell" data-label={column.label} data-primary={columnIndex === 0 || undefined} data-lead={column.key === leadKey || undefined} data-sorted={sort?.key === column.key || undefined} data-numeric={numeric.has(column.key) || undefined}>{column.render ? column.render(row[column.key], row) : formatCell(row[column.key], column)}</td>)}
          </motion.tr>;
        }) : <tr role="row"><td role="cell" className={styles.empty} colSpan={columns.length + (selectable ? 1 : 0)}>{emptyMessage}</td></tr>}</tbody>
      </table>
    </div>
    {selectable || paged ? <div className={styles.footer} data-paged={paged || undefined}>
      {selectable ? <span className={styles.selection}>
        <span className={styles.srOnly}>{shownCount} {noun}</span>
        <span className={styles.count} data-active={selectedCount > 0 || undefined} aria-hidden="true">
          <Swap className={styles.number} value={String(shownCount)} direction={countDirection} reduced={reduced} />
          <Swap value={noun} direction={selectedCount ? 1 : -1} reduced={reduced} />
        </span>
        <AnimatePresence initial={false}>{selectedCount ? <motion.button key="clear" type="button" className={styles.clear} data-clear="" onClick={clearSelection} initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .96, filter: blur(motionTokens.blur.soft) }} animate={{ opacity: 1, scale: 1, filter: blur(0) }} exit={reduced ? { opacity: 0, transition: instant } : { opacity: 0, scale: .98, filter: blur(motionTokens.blur.subtle), transition: leave }} transition={reduced ? instant : enter} {...(reduced ? {} : { whileTap: { scale: .97, transition: { duration: motionTokens.duration.instant } } })}>Seçimi temizle</motion.button> : null}</AnimatePresence>
      </span> : null}
      {/* Sayfalama (SNN ekledi): seçim satırıyla aynı satırda; dar alanda alta iner. */}
      {paged ? <span className={styles.pager}>
        <span className={styles.range}>{selectable ? pageSpan(page, pageSize ?? 0, allKeys.length) : rangeLabel(page, pageSize ?? 0, allKeys.length, itemName.other)}</span>
        <Pagination page={page} pageCount={pageCount} onPageChange={goToPage} label={`${caption} sayfaları`} />
      </span> : null}
    </div> : null}
    <p className={styles.srOnly} role="status">{announcement}</p>
  </div>;
}

export default SortableDataTable;
