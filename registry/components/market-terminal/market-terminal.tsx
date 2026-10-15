"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { miniLinePath, roundTo } from "../lib/chart-format";
import { clamp, useElementWidth, useOnScreen, useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { Switch } from "../switch/switch";
import {
  candleReading, clampView, dayChange, estimate, latestView, orderTime, parsePrice, parseQuantity, priceDomain, priceParts, priceText, priceTicks, quantityText, signedPercent, signedPrice, sideWord, sma, statusWord, typeWord, validateOrder, visibleCandles, volumeShort, zoomView,
  type Candle, type MarketOrder, type OrderRequest, type OrderSide, type OrderType, type View,
} from "./market-terminal-format";
import styles from "./market-terminal.module.css";

export type { Candle, MarketOrder, OrderRequest };

export interface MarketInstrument {
  key: string;
  symbol: string;
  name: string;
  exchange?: string;
  currency?: string;
  /** Güncel fiyat ve önceki kapanış (günlük değişim için). */
  price: number;
  previousClose: number;
  /** Gün içi küçük çizgi (izleme listesi). */
  intraday?: number[];
  /** Dönem anahtarına göre mumlar (eskiden yeniye). Gün içi dönemler dakikalık, diğerleri günlük. */
  candles: Record<string, Candle[]>;
}
export interface MarketPeriod { value: string; label: string; /** Gün içi (dakikalık) dönem mi. */ intraday?: boolean }

/** Bir menkul kıymetin fiyatını mum grafikle, izleme listesi ve emir fişiyle birlikte tam bir işlem ekranı olarak göstermek için kullanın. Bileşen hiçbir emir göndermez: emri uygulamanın verdiği işleve iletir. Yalnız sayı ve eğilim isteyen ekranlar için çizgi grafik ya da mini çizgi grafik daha doğrudur. */
export interface MarketTerminalProps {
  instruments: MarketInstrument[];
  periods: MarketPeriod[];
  /** Seçili sembol ve dönem (denetimli kullanım için); verilmezse bileşen tutar. */
  symbol?: string;
  onSymbolChange?: (key: string) => void;
  /** Canlı akış açık mı; kapatınca "Duraklatıldı" yazılır ve `updatedText` gösterilir. */
  live?: boolean;
  onLiveChange?: (live: boolean) => void;
  /** Son güncelleme saati metni (ABACUS ile), örneğin "14:03:27". */
  updatedText?: string;
  buyingPower: number;
  /** Sembol anahtarına göre eldeki adet. */
  positions: Record<string, number>;
  orders: MarketOrder[];
  /** Emri iletir; reddederse (Promise) emir verilmemiş sayılır ve `Error.message` düğmenin altında yazılır. */
  onSubmitOrder: (order: OrderRequest) => Promise<void>;
  onCancelOrder?: (id: string) => void;
  loading?: boolean;
  emptyText?: string;
}

const HEIGHT = 330, AXIS = 62, VOLUME = .22;
const AVERAGES = [{ n: 10, label: "10 mum", cls: "ma1" }, { n: 30, label: "30 mum", cls: "ma2" }] as const;

function WatchRow({ item, active, onPick, onKey, register }: { item: MarketInstrument; active: boolean; onPick: () => void; onKey: (event: KeyboardEvent<HTMLButtonElement>) => void; register: (node: HTMLButtonElement | null) => void }) {
  const change = dayChange(item.price, item.previousClose);
  const previous = useRef(item.price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (item.price === previous.current) return;
    setFlash(item.price > previous.current ? "up" : "down");
    previous.current = item.price;
    const timer = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(timer);
  }, [item.price]);
  const up = change.amount > 0, down = change.amount < 0;
  return <button type="button" ref={register} className={styles.watch} data-active={active || undefined} data-flash={flash ?? undefined} aria-current={active ? "true" : undefined} onClick={onPick} onKeyDown={onKey}
    aria-label={`${item.symbol}, ${item.name}, ${priceText(item.price, item.currency)}, bugün ${signedPercent(change.percent)}`}>
    <span className={styles.watchName}><b>{item.symbol}</b><small>{item.name}</small></span>
    <svg className={styles.watchLine} viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><path d={miniLinePath(item.intraday ?? [], 100, 32, 2)} data-dir={up ? "up" : down ? "down" : "flat"} /></svg>
    <span className={styles.watchPrice}><b>{priceText(item.price, item.currency)}</b><small data-dir={up ? "up" : down ? "down" : "flat"}>{up ? "▲" : down ? "▼" : "▬"} {signedPercent(change.percent)}</small></span>
  </button>;
}

export function MarketTerminal({ instruments, periods, symbol, onSymbolChange, live = true, onLiveChange, updatedText, buyingPower, positions, orders, onSubmitOrder, onCancelOrder, loading = false, emptyText = "Fiyat verisi yok." }: MarketTerminalProps) {
  const reduced = useReducedMotionSafe();
  const baseId = useId();
  const [chartRef, chartWidth] = useElementWidth<HTMLDivElement>();
  const [visibleRef] = useOnScreen<HTMLElement>();
  const [innerSymbol, setInnerSymbol] = useState(instruments[0]?.key ?? "");
  const activeKey = symbol ?? innerSymbol;
  const instrument = instruments.find(item => item.key === activeKey) ?? instruments[0];
  const [period, setPeriod] = useState(periods[0]?.value ?? "");
  const periodInfo = periods.find(item => item.value === period) ?? periods[0];
  const intraday = !!periodInfo?.intraday;
  const candles = instrument?.candles[period] ?? [];
  const total = candles.length;
  const [view, setView] = useState<View>(() => latestView(total, 80));
  const [cursor, setCursor] = useState<number | null>(null);
  const [averages, setAverages] = useState<number[]>([10]);
  const [announce, setAnnounce] = useState("");
  const viewRef = useRef(view);
  viewRef.current = view;
  const drag = useRef<{ id: number; x: number; from: number; last: number; time: number; velocity: number } | null>(null);
  const pointers = useRef(new Map<number, number>());
  const pinch = useRef<{ distance: number; count: number } | null>(null);
  const inertia = useRef(0);
  const following = useRef(true);
  const watchButtons = useRef(new Map<string, HTMLButtonElement>());

  const pick = (key: string) => { if (symbol === undefined) setInnerSymbol(key); onSymbolChange?.(key); };
  // Sembol ya da dönem değişince görünüm sona alınır.
  useEffect(() => { setView(latestView(total, 80)); setCursor(null); following.current = true; }, [activeKey, period]); // eslint-disable-line react-hooks/exhaustive-deps
  // Canlı akışta yeni mum gelirse son mumu izleyen görünüm kayar.
  const lastTotal = useRef(total);
  useEffect(() => {
    if (total !== lastTotal.current && following.current) setView(current => clampView({ count: current.count, from: total - current.count }, total));
    lastTotal.current = total;
  }, [total]);
  useEffect(() => () => cancelAnimationFrame(inertia.current), []);

  const lines = useMemo(() => AVERAGES.map(item => ({ ...item, values: sma(candles, item.n) })), [candles]);
  const shownLines = lines.filter(item => averages.includes(item.n));
  const { items, offset } = visibleCandles(candles, view);
  const domain = priceDomain(items, shownLines.map(item => item.values.slice(offset, offset + items.length)));
  const ticks = priceTicks(domain);
  const plotWidth = Math.max(chartWidth - AXIS, 1), priceHeight = HEIGHT * (1 - VOLUME) - 8, volumeTop = HEIGHT * (1 - VOLUME);
  const maxVolume = Math.max(...items.map(candle => candle.volume), 1);
  const slot = plotWidth / view.count;
  const xOf = (index: number) => (index - view.from + .5) * slot;
  const yOf = (price: number) => 8 + (1 - (price - domain.low) / (domain.high - domain.low || 1)) * (priceHeight - 8);
  const lastCandle = candles[total - 1];
  const reading = cursor !== null ? candles[cursor] : lastCandle;
  const currency = instrument?.currency ?? "TRY";

  const apply = (next: View) => {
    const bounded = clampView(next, total);
    following.current = bounded.from + bounded.count >= total - 0.5;
    viewRef.current = bounded;
    setView(bounded);
  };
  const indexAt = (clientX: number) => { const rect = chartRef.current?.getBoundingClientRect(); return rect ? clamp(Math.floor(view.from + ((clientX - rect.left) / plotWidth) * view.count), 0, total - 1) : 0; };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    apply(zoomView(viewRef.current, event.deltaY > 0 ? 1.12 : 1 / 1.12, clamp((event.clientX - rect.left) / plotWidth, 0, 1), total));
  };
  const spread = () => { const [a, b] = [...pointers.current.values()]; return a !== undefined && b !== undefined ? Math.abs(a - b) : 0; };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(inertia.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, event.clientX);
    if (pointers.current.size === 2) { pinch.current = { distance: spread() || 1, count: viewRef.current.count }; drag.current = null; return; }
    drag.current = { id: event.pointerId, x: event.clientX, from: viewRef.current.from, last: event.clientX, time: performance.now(), velocity: 0 };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, event.clientX);
    if (pinch.current && pointers.current.size === 2) { const ratio = pinch.current.distance / (spread() || 1); apply({ ...viewRef.current, count: pinch.current.count * ratio }); return; }
    const current = drag.current;
    if (current && current.id === event.pointerId && (event.buttons || event.pointerType !== "mouse")) {
      const now = performance.now(), dx = event.clientX - current.x;
      current.velocity = ((current.last - event.clientX) / plotWidth) * viewRef.current.count / Math.max(now - current.time, 1);
      current.last = event.clientX; current.time = now;
      apply({ count: viewRef.current.count, from: current.from - (dx / plotWidth) * viewRef.current.count });
      return;
    }
    if (event.pointerType === "mouse") setCursor(indexAt(event.clientX));
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null;
    if (Math.abs(event.clientX - current.x) < 4) { if (event.pointerType !== "mouse") setCursor(value => value === null ? indexAt(event.clientX) : null); return; }
    // Savurma: bırakma hızıyla azalarak sürer.
    if (reduced) return;
    let velocity = current.velocity, previous = performance.now();
    const glide = (now: number) => {
      const dt = Math.min(48, now - previous); previous = now;
      velocity *= Math.exp(-dt / 220);
      if (Math.abs(velocity) < .002) return;
      apply({ count: viewRef.current.count, from: viewRef.current.from + velocity * dt });
      inertia.current = requestAnimationFrame(glide);
    };
    inertia.current = requestAnimationFrame(glide);
  };

  const readCandle = (index: number | null) => {
    setCursor(index);
    const candle = index === null ? undefined : candles[index];
    if (candle) setAnnounce(candleReading(candle, intraday, currency));
  };
  const onChartKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = cursor ?? total - 1;
    const step = event.shiftKey ? 10 : 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = clamp(cursor === null ? total - 1 : from + (event.key === "ArrowRight" ? step : -step), 0, total - 1);
      readCandle(next);
      if (next < viewRef.current.from || next > viewRef.current.from + viewRef.current.count - 1) apply({ ...viewRef.current, from: next - viewRef.current.count / 2 });
    } else if (event.key === "Home") { event.preventDefault(); readCandle(0); apply({ ...viewRef.current, from: 0 }); }
    else if (event.key === "End") { event.preventDefault(); readCandle(total - 1); apply(latestView(total, viewRef.current.count)); }
    else if (event.key === "+" || event.key === "=") { event.preventDefault(); apply(zoomView(viewRef.current, 1 / 1.25, cursor === null ? 1 : (cursor - viewRef.current.from) / viewRef.current.count, total)); }
    else if (event.key === "-") { event.preventDefault(); apply(zoomView(viewRef.current, 1.25, cursor === null ? 1 : (cursor - viewRef.current.from) / viewRef.current.count, total)); }
    else if (event.key === "0") { event.preventDefault(); apply(latestView(total, 80)); }
    else if (event.key === "Escape") { setCursor(null); setAnnounce(""); }
  };
  const onWatchKey = (key: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys = instruments.map(item => item.key), at = keys.indexOf(key);
    const next = event.key === "ArrowDown" ? at + 1 : event.key === "ArrowUp" ? at - 1 : event.key === "Home" ? 0 : event.key === "End" ? keys.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    watchButtons.current.get(keys[clamp(next, 0, keys.length - 1)] ?? "")?.focus();
  };

  // Emir fişi
  const [side, setSide] = useState<OrderSide>("buy");
  const [type, setType] = useState<OrderType>("market");
  const [quantityInput, setQuantityInput] = useState("10");
  const [limitInput, setLimitInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ticketMessage, setTicketMessage] = useState("");
  const position = positions[instrument?.key ?? ""] ?? 0;
  const problem = instrument ? validateOrder({ side, type, quantityText: quantityInput, limitText: limitInput, price: instrument.price, buyingPower, position }) : "Sembol seçin";
  const quantity = parseQuantity(quantityInput), limit = type === "limit" ? parsePrice(limitInput) : null;
  const cost = instrument ? estimate(quantity, limit, instrument.price) : null;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!instrument || problem || quantity === null || busy) return;
    setBusy(true); setTicketMessage("");
    try {
      await onSubmitOrder({ side, type, symbol: instrument.key, quantity, limit: limit ?? undefined });
      setTicketMessage(`${sideWord(side)} emri iletildi: ${instrument.symbol}, ${quantityText(quantity)} adet`);
    } catch (error) {
      setTicketMessage(error instanceof Error && error.message ? error.message : "Emir iletilemedi");
    } finally { setBusy(false); }
  };

  if (loading) return <section className={styles.root} aria-busy="true"><Skeleton label="Fiyat verisi yükleniyor" lines={8} /></section>;
  if (!instrument || !instruments.length) return <section className={styles.root}><p className={styles.empty}>{emptyText}</p></section>;

  const change = dayChange(instrument.price, instrument.previousClose);
  const dir = change.amount > 0 ? "up" : change.amount < 0 ? "down" : "flat";
  const counter = priceParts(instrument.price, currency);
  const day = candles.length ? { open: candles[0]!.open, high: Math.max(...candles.map(candle => candle.high)), low: Math.min(...candles.map(candle => candle.low)), volume: candles.reduce((sum, candle) => sum + candle.volume, 0) } : null;
  const chartLabel = `${instrument.symbol}, ${periodInfo?.label ?? ""}, ${intraday ? "dakikalık" : "günlük"} mumlar. Sol ve sağ ok mumlar arasında gezer, artı ve eksi yakınlaştırır, sıfır sıfırlar, Escape temizler.`;

  return <section ref={visibleRef} className={styles.root} data-reduced={reduced || undefined} aria-label={`${instrument.symbol} işlem ekranı`}>
    <div className={styles.main}>
      <header className={styles.header}>
        <div className={styles.symbol}><h3>{instrument.symbol}</h3><span>{instrument.name}{instrument.exchange ? ` · ${instrument.exchange}` : ""}</span></div>
        <button type="button" className={styles.live} data-live={live || undefined} aria-pressed={live} onClick={() => onLiveChange?.(!live)} disabled={!onLiveChange}>
          <i aria-hidden="true" />{live ? "Canlı" : "Duraklatıldı"}{!live && updatedText ? ` · ${updatedText}` : ""}
        </button>
      </header>

      <div className={styles.priceRow}>
        <span className={styles.price} aria-label={priceText(instrument.price, currency)}><AnimatedCounter value={counter.value} decimals={counter.decimals} prefix={counter.prefix} suffix={counter.suffix} /></span>
        <span className={styles.change} data-dir={dir}><span aria-hidden="true">{dir === "up" ? "▲" : dir === "down" ? "▼" : "▬"}</span> {signedPrice(change.amount, currency)} ({signedPercent(change.percent)}) <small>bugün</small></span>
      </div>
      {day && <dl className={styles.summary}>
        <div><dt>Açılış</dt><dd>{priceText(day.open, currency)}</dd></div><div><dt>En yüksek</dt><dd>{priceText(day.high, currency)}</dd></div>
        <div><dt>En düşük</dt><dd>{priceText(day.low, currency)}</dd></div><div><dt>Hacim</dt><dd>{volumeShort(day.volume)}</dd></div>
      </dl>}

      <div className={styles.toolbar}>
        <SegmentedControl label="Dönem" value={period} onValueChange={setPeriod} options={periods.map(item => ({ value: item.value, label: item.label }))} />
        <div className={styles.averages} role="group" aria-label="Hareketli ortalamalar">
          {AVERAGES.map(item => <Switch key={item.n} label={`Ortalama ${item.label}`} checked={averages.includes(item.n)} onCheckedChange={on => setAverages(current => on ? [...current, item.n] : current.filter(n => n !== item.n))} />)}
        </div>
        <div className={styles.zoom}>
          <Button size="sm" variant="secondary" aria-label="Yakınlaştır" onClick={() => apply(zoomView(viewRef.current, 1 / 1.25, 1, total))}>+</Button>
          <Button size="sm" variant="secondary" aria-label="Uzaklaştır" onClick={() => apply(zoomView(viewRef.current, 1.25, 1, total))}>−</Button>
          <Button size="sm" variant="secondary" aria-label="Görünümü sıfırla" onClick={() => apply(latestView(total, 80))}>0</Button>
        </div>
      </div>

      {candles.length < 2 ? <p className={styles.empty}>{emptyText}</p> : <>
        <p className={styles.reading} aria-hidden="true">{reading ? candleReading(reading, intraday, currency) : ""}{reading && <span> · {AVERAGES.map(item => { const value = lines.find(line => line.n === item.n)?.values[cursor ?? total - 1]; return value === null || value === undefined ? null : `O${item.n} ${priceText(value, currency)}`; }).filter(Boolean).join(" · ")}</span>}</p>
        <div ref={chartRef} className={styles.chart} role="group" aria-roledescription="mum grafiği" aria-label={chartLabel} tabIndex={0} onKeyDown={onChartKey} onBlur={() => setCursor(null)} onWheel={onWheel}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={event => { if (event.pointerType === "mouse") setCursor(null); }}>
          <svg className={styles.svg} width={Math.max(chartWidth, 1)} height={HEIGHT} aria-hidden="true">
            <defs><clipPath id={`${baseId}-clip`}><rect x={0} y={0} width={plotWidth} height={HEIGHT} /></clipPath></defs>
            {ticks.map(tick => <g key={tick}><line className={styles.grid} x1={0} x2={plotWidth} y1={yOf(tick)} y2={yOf(tick)} /><text className={styles.axis} x={plotWidth + 6} y={yOf(tick) + 3}>{priceText(tick, currency)}</text></g>)}
            <g clipPath={`url(#${baseId}-clip)`}>
              {items.map((candle, at) => {
                const index = offset + at, up = candle.close >= candle.open, x = xOf(index), body = Math.max(1, Math.abs(yOf(candle.open) - yOf(candle.close))), width = Math.max(1, slot * .66);
                return <g key={candle.t} className={styles.candle} data-up={up || undefined} data-cursor={cursor === index || undefined}>
                  <line x1={roundTo(x, 1)} x2={roundTo(x, 1)} y1={yOf(candle.high)} y2={yOf(candle.low)} />
                  <rect x={roundTo(x - width / 2, 1)} y={yOf(Math.max(candle.open, candle.close))} width={roundTo(width, 1)} height={roundTo(body, 1)} />
                  <rect className={styles.volume} x={roundTo(x - width / 2, 1)} y={volumeTop + (1 - candle.volume / maxVolume) * (HEIGHT - volumeTop - 2)} width={roundTo(width, 1)} height={Math.max(1, (candle.volume / maxVolume) * (HEIGHT - volumeTop - 2))} />
                </g>;
              })}
              {shownLines.map(item => { const points = item.values.flatMap((value, index) => value === null || index < offset - 1 || index > offset + items.length ? [] : [`${roundTo(xOf(index), 1)} ${roundTo(yOf(value), 1)}`]); return points.length > 1 ? <path key={item.n} className={styles[item.cls]} d={`M${points.join("L")}`} /> : null; })}
              {cursor !== null && <line className={styles.crosshair} x1={xOf(cursor)} x2={xOf(cursor)} y1={0} y2={HEIGHT} />}
              {lastCandle && <line className={styles.lastLine} x1={0} x2={plotWidth} y1={yOf(instrument.price)} y2={yOf(instrument.price)} data-dir={dir} />}
            </g>
            <g><rect className={styles.lastTag} data-dir={dir} x={plotWidth + 2} y={yOf(instrument.price) - 9} width={AXIS - 4} height={18} rx={3} /><text className={styles.lastText} x={plotWidth + AXIS / 2} y={yOf(instrument.price) + 4} textAnchor="middle">{priceText(instrument.price, currency)}</text></g>
          </svg>
        </div>
      </>}
    </div>

    <aside className={styles.side}>
      <section aria-label="İzleme listesi" className={styles.watchlist}>
        <h4>İzleme listesi</h4>
        {instruments.map(item => <WatchRow key={item.key} item={item} active={item.key === instrument.key} onPick={() => pick(item.key)} onKey={onWatchKey(item.key)} register={node => { if (node) watchButtons.current.set(item.key, node); else watchButtons.current.delete(item.key); }} />)}
      </section>

      <form className={styles.ticket} onSubmit={submit} aria-label="Emir fişi" noValidate>
        <h4>Emir fişi</h4>
        <SegmentedControl label="Yön" value={side} onValueChange={value => setSide(value as OrderSide)} options={[{ value: "buy", label: "Alış" }, { value: "sell", label: "Satış" }]} />
        <SegmentedControl label="Emir türü" value={type} onValueChange={value => setType(value as OrderType)} options={[{ value: "market", label: "Piyasa" }, { value: "limit", label: "Limit" }]} />
        <label className={styles.field}><span>Adet</span><input inputMode="numeric" autoComplete="off" value={quantityInput} onChange={event => setQuantityInput(event.target.value)} aria-invalid={quantity === null || undefined} /></label>
        {type === "limit" && <label className={styles.field}><span>Limit fiyat</span><input inputMode="decimal" autoComplete="off" placeholder={priceText(instrument.price, currency).replace(/^\D+/, "")} value={limitInput} onChange={event => setLimitInput(event.target.value)} aria-invalid={limit === null || undefined} /></label>}
        <dl className={styles.facts}>
          <div><dt>Tahmini tutar</dt><dd>{cost === null ? "—" : priceText(cost, currency)}</dd></div>
          <div><dt>Eldeki pozisyon</dt><dd>{quantityText(position)} adet</dd></div>
          <div><dt>Alım gücü</dt><dd>{priceText(buyingPower, currency)}</dd></div>
        </dl>
        <Button type="submit" variant="primary" disabled={!!problem || busy} loading={busy}>{sideWord(side)} emri gönder</Button>
        <p className={styles.status} role="status" aria-live="polite">{problem && quantityInput ? problem : ticketMessage}</p>
      </form>

      <section aria-label="Emirler" className={styles.orders}>
        <h4>Emirler</h4>
        {orders.length === 0 ? <p className={styles.noOrders}>Henüz emir yok.</p> : <ul>{orders.map(order => <li key={order.id} className={styles.order} data-status={order.status}>
          <span><b>{sideWord(order.side)}</b> {order.symbol} · {typeWord(order.type)}</span>
          <span className={styles.orderNums}>{quantityText(order.quantity)} × {priceText(order.price, currency)}</span>
          <span className={styles.orderMeta}>{statusWord(order.status)} · {orderTime(order.t)}</span>
          {order.status === "pending" && onCancelOrder && <button type="button" className={styles.cancel} onClick={() => onCancelOrder(order.id)} aria-label={`${order.symbol} ${sideWord(order.side)} emrini iptal et`}>İptal</button>}
        </li>)}</ul>}
      </section>
    </aside>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
  </section>;
}

export default MarketTerminal;
