"use client";

import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent, type Ref } from "react";
import { animate, motion, type MotionStyle, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { formatNumber, formatPercent } from "../lib/chart-format";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./waffle-chart.module.css";

export interface WaffleCategory {
  /** Kalıcı kimlik. Veri değişince hücreler kategorilerini izlemeyi sürdürür; yeni veri kümesi yeniden boyanmaz, akar. */
  key: string;
  /** Gösterge, ipucu ve veri tablosundaki ad. */
  label: string;
  /** Ham miktar. Paylar toplamdan hesaplanır; eksi değerler sıfır sayılır. */
  value: number;
  /** Herhangi bir CSS rengi. Varsayılan: accentKey için ilk seri, sonraki üçü için destek serileri, sonra nötr basamaklar. */
  color?: string | undefined;
}

/** Birim grafiği: her hücre bütünün bir payıdır; toplamın parçaları sayılabilir kareler olarak okunur. */
export interface WaffleChartProps {
  /** Kategoriler dolum sırasıyla. İlki sol alt köşeden, sütun sütun dolar. */
  data: WaffleCategory[];
  /** Bütünün ne olduğu, örneğin "Elektrik üretimi, 2023". Grafiği yardımcı teknolojiye adlandırır. */
  label: string;
  /** İpucundaki ve tablodaki her ham değerin ardından gelen birim, örneğin "TWh". */
  unit?: string | undefined;
  /** Ham değeri biçimler. Varsayılan: ABACUS biçimi ("1.234,5"). */
  formatValue?: ((value: number, category: WaffleCategory) => string) | undefined;
  /** Izgara satırları. satır × sütun hücre bütünü oluşturur; 10 × 10, yüzde başına bir hücre demektir. */
  rows?: number | undefined;
  columns?: number | undefined;
  /** Vurgu renginde boyanan kategori. Her kategoriyi nötr tutmak için null verin. Varsayılan: ilk kategori. */
  accentKey?: string | null | undefined;
  /** Denetimli odaktaki kategori. Biri odaktayken diğerleri solar. */
  activeKey?: string | null | undefined;
  defaultActiveKey?: string | null | undefined;
  onActiveChange?: ((key: string | null) => void) | undefined;
  /** Payları yeni değerine dönen kategori listesi. */
  legend?: boolean | undefined;
  /** Payların ondalık basamak sayısı. */
  decimals?: number | undefined;
  emptyLabel?: string | undefined;
  ref?: Ref<HTMLElement> | undefined;
  className?: string | undefined;
}

type Cell = { id: number; key: string | null; slot: number };
type Pointer = { key: string; slot: number } | null;

const { spring } = motionTokens;
const GAP = 3;
/** accentKey ilk seriyi, sonraki üç kategori destek serilerini alır. Ötesi, açıklığı dönüşümlü nötr basamaklara düşer. */
const SHADES = [40, 20, 30, 14];
/** İkinci, renksiz kanal: nötr kategoriler kare, yuvarlak ve çerçeveli hücreler arasında döner; komşular açıklıkta olduğu kadar biçimde de ayrışır. */
const SHAPES = ["square", "round", "framed"] as const;
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

const subscribeNothing = () => () => {};
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** Kategori başına tam hücre sayısı (en büyük kalan yöntemi); toplamlar her zaman ızgarayı verir. */
function allocate(data: WaffleCategory[], total: number, cells: number): number[] {
  if (total <= 0) return data.map(() => 0);
  const exact = data.map(item => Math.max(0, item.value) / total * cells);
  const counts = exact.map(Math.floor);
  let left = cells - counts.reduce((sum, count) => sum + count, 0);
  const order = exact.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest);
  for (let k = 0; left > 0 && k < order.length; k++, left--) counts[order[k]!.index]!++;
  return counts;
}

/**
 * Hücreleri kategorilere en az taşıyarak dağıtır: her kategori sahip olduğu hücreleri korur,
 * artan hücreler büyüyen kategorilere katılır ve her blok hücrelerini önceki sırayla alır; yollar hiç kesişmez.
 */
function reassign(previous: Cell[], data: WaffleCategory[], counts: number[]): Cell[] {
  const bySlot = [...previous].sort((a, b) => a.slot - b.slot);
  const kept = new Map<string, Cell[]>();
  const pool: Cell[] = [];
  const want = new Map(data.map((item, index) => [item.key, counts[index]]));
  for (const cell of bySlot) {
    const list = cell.key !== null ? kept.get(cell.key) ?? [] : [];
    if (cell.key !== null && list.length < (want.get(cell.key) ?? 0)) { list.push(cell); kept.set(cell.key, list); } else pool.push(cell);
  }
  const next: Cell[] = [];
  let slot = 0;
  data.forEach((item, index) => {
    const own = kept.get(item.key) ?? [];
    while (own.length < counts[index]! && pool.length) own.push(pool.shift()!);
    own.sort((a, b) => a.slot - b.slot).forEach(cell => next.push({ id: cell.id, key: item.key, slot: slot++ }));
  });
  pool.forEach(cell => next.push({ id: cell.id, key: null, slot: slot++ }));
  return next.sort((a, b) => a.id - b.id);
}

/** Yeni değerine yayla dönen pay; tablo rakamlarıyla genişliğini korur. */
function Rolling({ value, decimals, reduced }: { value: number; decimals: number; reduced: boolean }) {
  const shown = useMotionValue(value);
  const text = useTransform(shown, current => formatPercent(current, decimals, true));
  useEffect(() => {
    if (reduced) { shown.jump(value); return; }
    const controls = animate(shown, value, spring.smooth);
    return () => controls.stop();
  }, [reduced, shown, value]);
  return <motion.span>{text}</motion.span>;
}

export function WaffleChart({ data, label, unit = "", formatValue, rows = 10, columns = 10, accentKey, activeKey, defaultActiveKey = null, onActiveChange, legend = true, decimals = 0, emptyLabel = "Veri yok", ref, className }: WaffleChartProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => figure.current as HTMLElement);
  const inView = useInView(figure, { once: true, amount: .35 });
  const count = Math.max(1, rows * columns);
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  const empty = !data.length || total <= 0;
  const accent = accentKey === undefined ? data[0]?.key ?? null : accentKey;

  // Hücreler kalıcı nesnelerdir; her veri değişikliği onları yeniden atar, yeniden boyanmak yerine yolculuk ederler.
  const signature = `${count}|${data.map(item => `${item.key}:${item.value}`).join(",")}`;
  const counts = useMemo(() => allocate(data, total, count), [signature]); // eslint-disable-line react-hooks/exhaustive-deps
  const [layout, setLayout] = useState(() => ({ cells: reassign(Array.from({ length: count }, (_, id) => ({ id, key: null, slot: id })), data, counts), moved: new Set<number>(), version: 0 }));
  const [seen, setSeen] = useState(signature);
  if (seen !== signature) {
    setSeen(signature);
    const base = Array.from({ length: count }, (_, id) => layout.cells[id] ?? { id, key: null, slot: id });
    const next = reassign(base, data, counts);
    setLayout({ cells: next, moved: new Set(next.filter(cell => base[cell.id]!.slot !== cell.slot || base[cell.id]!.key !== cell.key).map(cell => cell.id)), version: layout.version + 1 });
  }
  const { cells, moved, version } = layout;

  const [ownActive, setOwnActive] = useState<string | null>(defaultActiveKey);
  const pinned = activeKey !== undefined ? activeKey : ownActive;
  const setPinned = (key: string | null) => { if (activeKey === undefined) setOwnActive(key); onActiveChange?.(key); };
  const [pointer, setPointer] = useState<Pointer>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const focusKey = pointer?.key ?? preview ?? pinned;
  const active = focusKey && data.some(item => item.key === focusKey) ? focusKey : null;

  const [side, setSide] = useState(0);
  useLayoutEffect(() => {
    const node = grid.current;
    if (!node) return;
    const read = () => setSide(node.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const size = side ? (side - GAP * (columns - 1)) / columns : 0;
  const height = size ? size * rows + GAP * (rows - 1) : 0;
  // Sol alt köşeden sütun sütun, dolan bir bardak gibi.
  const place = (slot: number) => ({ x: Math.floor(slot / rows) * (size + GAP), y: (rows - 1 - (slot % rows)) * (size + GAP) });

  const colorOf = (key: string | null) => {
    if (key === null) return "transparent";
    const index = data.findIndex(item => item.key === key), item = data[index];
    if (!item) return "transparent";
    if (item.color) return item.color;
    if (key === accent) return "var(--series-1)";
    const rank = data.filter(entry => entry.key !== accent).findIndex(entry => entry.key === key);
    return rank < 3 ? `var(--series-${rank + 2})` : `color-mix(in oklab, var(--foreground) ${SHADES[(rank - 3) % SHADES.length]}%, var(--surface))`;
  };

  const shapeOf = (key: string | null) => {
    if (key === null || key === accent) return "square";
    const rank = data.filter(entry => entry.key !== accent).findIndex(entry => entry.key === key);
    return rank < 0 ? "square" : SHAPES[rank % SHAPES.length];
  };

  // İpucu hücreler arasında kendi yayıyla süzülür ve şeklin içinde kalır.
  const tipX = useMotionValue(0), tipY = useMotionValue(0);
  const follow = { stiffness: 520, damping: 44, restDelta: .01 };
  const glideX = useSpring(tipX, follow), glideY = useSpring(tipY, follow);
  const wasShown = useRef(false);
  useLayoutEffect(() => {
    const bubble = tip.current, host = figure.current, board = grid.current;
    if (!pointer || !bubble || !host || !board || !size) { wasShown.current = false; return; }
    const hostBox = host.getBoundingClientRect(), boardBox = board.getBoundingClientRect();
    const { x, y } = place(pointer.slot);
    const cx = boardBox.left - hostBox.left + x + size / 2, cy = boardBox.top - hostBox.top + y;
    const tw = bubble.offsetWidth, th = bubble.offsetHeight;
    let top = cy - th - 10;
    if (top < 0) top = cy + size + 10;
    const left = clamp(cx - tw / 2, 0, Math.max(0, hostBox.width - tw));
    tipX.set(left); tipY.set(clamp(top, 0, Math.max(0, hostBox.height - th)));
    if (!wasShown.current || reduced) { glideX.jump(tipX.get()); glideY.jump(tipY.get()); }
    wasShown.current = true;
  });

  const slotAt = (clientX: number, clientY: number) => {
    const box = grid.current?.getBoundingClientRect();
    if (!box || !size) return null;
    const col = clamp(Math.floor((clientX - box.left) / (size + GAP)), 0, columns - 1);
    const row = clamp(Math.floor((clientY - box.top) / (size + GAP)), 0, rows - 1);
    return col * rows + (rows - 1 - row);
  };
  const pointAt = (slot: number | null): Pointer => {
    if (slot === null) return null;
    const cell = cells.find(item => item.slot === slot);
    return cell?.key ? { key: cell.key, slot } : null;
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "mouse" || event.buttons) setPointer(pointAt(slotAt(event.clientX, event.clientY))); };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture?.(event.pointerId); setPointer(pointAt(slotAt(event.clientX, event.clientY))); };

  // Oklar ızgarayı hücre hücre gezer; Page tuşları kategoriler arasında atlar.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) return;
    if (event.key === "Escape" && pointer) { event.preventDefault(); setPointer(null); return; }
    const filled = cells.filter(cell => cell.key !== null).length;
    const at = pointer?.slot ?? 0;
    const col = Math.floor(at / rows), row = at % rows;
    const blocks = counts.map((size, index) => ({ start: counts.slice(0, index).reduce((sum, value) => sum + value, 0), size })).filter(block => block.size > 0);
    const block = Math.max(0, blocks.findIndex(item => at >= item.start && at < item.start + item.size));
    const moves: Record<string, () => number> = {
      ArrowUp: () => col * rows + Math.min(rows - 1, row + 1),
      ArrowDown: () => col * rows + Math.max(0, row - 1),
      ArrowRight: () => Math.min(columns - 1, col + 1) * rows + row,
      ArrowLeft: () => Math.max(0, col - 1) * rows + row,
      PageDown: () => blocks[Math.min(blocks.length - 1, block + 1)]!.start,
      PageUp: () => at > blocks[block]!.start ? blocks[block]!.start : blocks[Math.max(0, block - 1)]!.start,
      Home: () => 0,
      End: () => filled - 1,
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setPointer(pointAt(clamp(pointer ? move() : 0, 0, Math.max(0, filled - 1))));
  };

  const format = (value: number, item: WaffleCategory) => `${formatValue ? formatValue(value, item) : formatNumber(value, 1)}${unit ? ` ${unit}` : ""}`;
  const share = (item: WaffleCategory) => total > 0 ? Math.max(0, item.value) / total * 100 : 0;
  const reading = pointer ? data.find(item => item.key === pointer.key) ?? null : null;
  const announce = reading ? `${reading.label}, ${formatPercent(share(reading), decimals, true)}, ${format(reading.value, reading)}` : "";
  const summary = empty ? `${label}. ${emptyLabel}.` : `${label}. ${data.map(item => `${item.label} ${formatPercent(share(item), decimals, true)}`).join(", ")}.`;
  const shownX = reduced ? tipX : glideX, shownY = reduced ? tipY : glideY;
  const settle = reduced ? { duration: 0 } : spring.morph;

  return <figure ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} aria-label={label} data-legend={legend || undefined}>
    <div className={styles.body}>
    <div className={styles.board}>
      <div ref={grid} className={styles.grid} style={{ height: height || undefined, aspectRatio: height ? undefined : `${columns} / ${rows}` }} data-active={active ? true : undefined}
        role="group" tabIndex={empty ? -1 : 0} aria-roledescription="kare ızgara grafiği" aria-label={`${label}. ${count} hücre. Hücreler arasında gezinmek için ok tuşlarını, kategoriler arasında atlamak için Page Up ve Page Down tuşlarını kullanın.`}
        onPointerMove={onPointerMove} onPointerDown={onPointerDown} onPointerUp={event => { if (event.pointerType !== "mouse") setPointer(null); }} onPointerCancel={() => setPointer(null)} onPointerLeave={event => { if (event.pointerType === "mouse") setPointer(null); }}
        onKeyDown={onKeyDown} onBlur={() => setPointer(null)} onFocus={event => { if (event.currentTarget.matches(":focus-visible") && !empty) setPointer(current => current ?? pointAt(0)); }}>
        {size > 0 && cells.map(cell => {
          const { x, y } = place(cell.slot);
          const travel = moved.has(cell.id) && !reduced;
          const delay = reduced ? 0 : (cell.slot / count) * .32;
          const on = cell.key !== null && cell.key === active;
          const shown = inView || reduced;
          // Yolculuk eden hücre uçarken küçülür; akış, hücrelerin bir bloktan kalkıp ötekine inmesi gibi okunur.
          const dip = travel ? [1, .62 + (version % 2) * .001, 1] : 1;
          return <motion.span key={cell.id} className={styles.cell} aria-hidden="true"
            data-on={on || undefined} data-cursor={pointer?.slot === cell.slot || undefined} data-empty={cell.key === null || undefined} data-shape={shapeOf(cell.key)}
            style={{ width: size, height: size, "--cell": colorOf(cell.key), "--delay": `${delay}s` } as MotionStyle}
            initial={reduced ? false : { x, y, scale: .4, opacity: 0 }}
            animate={shown ? { x, y, scale: dip, opacity: cell.key === null ? 0 : 1 } : { x, y, scale: .4, opacity: 0 }}
            transition={reduced ? { duration: 0 } : {
              x: { ...settle, delay }, y: { ...settle, delay },
              scale: travel ? { duration: .62, times: [0, .42, 1], ease: motionTokens.ease.inOut, delay } : { ...spring.snappy, delay: delay * .6 },
              opacity: { duration: motionTokens.duration.standard, ease: motionTokens.ease.standard, delay: delay * .6 },
            }} />;
        })}
      </div>
      {!empty && <motion.div ref={tip} className={styles.tooltip} data-shown={pointer ? true : undefined} style={{ x: shownX, y: shownY }} aria-hidden="true">
        <p className={styles.tipRow}>
          <span className={styles.tipSwatch} data-shape={shapeOf(reading?.key ?? null)} style={{ "--cell": colorOf(reading?.key ?? null) } as CSSProperties} />
          <span className={styles.tipName}>{reading?.label ?? ""}</span>
          <span className={styles.tipValue}>{reading ? formatPercent(share(reading), decimals, true) : ""}</span>
        </p>
        <p className={styles.tipMeta}>{reading ? format(reading.value, reading) : ""}</p>
      </motion.div>}
      {empty && <p className={styles.message}>{emptyLabel}</p>}
    </div>
    {legend && !empty && <ul className={styles.legend} aria-label={`${label} kategorileri`} onPointerLeave={() => setPreview(null)}>
      {data.map(item => <li key={item.key}>
        <button type="button" className={styles.item} aria-pressed={pinned === item.key} data-on={active === item.key || undefined} data-dim={(active !== null && active !== item.key) || undefined}
          onClick={() => setPinned(pinned === item.key ? null : item.key)}
          onPointerEnter={event => { if (event.pointerType === "mouse") setPreview(item.key); }} onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setPreview(item.key); }} onBlur={() => setPreview(null)}>
          <span className={styles.swatch} data-shape={shapeOf(item.key)} style={{ "--cell": colorOf(item.key) } as CSSProperties} aria-hidden="true" />
          <span className={styles.itemLabel}>{item.label}</span>
          <span className={styles.itemShare}><Rolling value={share(item)} decimals={decimals} reduced={reduced} /></span>
        </button>
      </li>)}
    </ul>}
    </div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
    <p className={styles.srOnly}>{summary}</p>
    {!empty && <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Kategori</th><th scope="col">Değer</th><th scope="col">Pay</th><th scope="col">Hücre</th></tr></thead>
      <tbody>{data.map((item, index) => <tr key={item.key}><th scope="row">{item.label}</th><td>{format(item.value, item)}</td><td>{formatPercent(share(item), decimals, true)}</td><td>{counts[index]}</td></tr>)}</tbody>
    </table></div>}
  </figure>;
}

export default WaffleChart;
