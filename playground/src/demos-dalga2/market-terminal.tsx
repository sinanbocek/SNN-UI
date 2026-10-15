// market-terminal örneği. Hisse adları, fiyatlar ve mumlar uydurmadır; tarayıcıda üretilen örnek akış (sunucu yok) ve kâğıt üstü emir benzetimi.
import { useEffect, useRef, useState } from "react";
import { date } from "@snn/abacus-core";
import { MarketTerminal } from "../../../registry/components/market-terminal/market-terminal";
import type { Candle, MarketInstrument, MarketOrder, OrderRequest } from "../../../registry/components/market-terminal/market-terminal";

const PERIODS = [{ value: "1d", label: "1G", intraday: true }, { value: "5d", label: "5G", intraday: true }, { value: "1m", label: "1A" }, { value: "6m", label: "6A" }, { value: "1y", label: "1Y" }];
const STEPS: Record<string, { count: number; ms: number }> = { "1d": { count: 108, ms: 5 * 60000 }, "5d": { count: 120, ms: 60 * 60000 }, "1m": { count: 22, ms: 86400000 }, "6m": { count: 130, ms: 86400000 }, "1y": { count: 250, ms: 86400000 } };
const NOW = Date.UTC(2026, 9, 18, 11, 0);

/** Basit bir rastgele yürüyüş: tohumlu, her çalıştırmada aynı mumlar. */
function seeded(seed: number) { let state = seed; return () => { state = (state * 1664525 + 1013904223) % 4294967296; return state / 4294967296; }; }

function makeCandles(period: string, price: number, seed: number): Candle[] {
  const { count, ms } = STEPS[period]!;
  const random = seeded(seed + count);
  const volatility = period === "1d" ? .0016 : period === "5d" ? .004 : .012;
  let close = price * (1 - volatility * 8 * (random() - .4));
  return Array.from({ length: count }, (_, at) => {
    const open = close;
    close = Math.max(1, open * (1 + (random() - .48) * volatility * 2));
    const high = Math.max(open, close) * (1 + random() * volatility), low = Math.min(open, close) * (1 - random() * volatility);
    return { t: NOW - (count - 1 - at) * ms, open: Math.round(open * 100) / 100, high: Math.round(high * 100) / 100, low: Math.round(low * 100) / 100, close: Math.round(close * 100) / 100, volume: Math.round(20000 + random() * 90000) };
  });
}

const BASE: [string, string, string, number][] = [["ANKA", "Anka Holding", "BIST", 112.4], ["BOZA", "Boza Enerji", "BIST", 47.85], ["CELI", "Çelik Demir", "BIST", 233.1], ["DENI", "Deniz Lojistik", "BIST", 18.62], ["EGET", "Ege Tekstil", "BIST", 64.3]];

function buildInstruments(): MarketInstrument[] {
  return BASE.map(([symbol, name, exchange, price], index) => {
    const candles = Object.fromEntries(Object.keys(STEPS).map(period => [period, makeCandles(period, price, index * 97 + 13)]));
    const intraday = candles["1d"]!;
    return { key: symbol, symbol, name, exchange, price: intraday[intraday.length - 1]!.close, previousClose: Math.round(price * (1 + (index % 2 ? -.012 : .008)) * 100) / 100, intraday: intraday.map(candle => candle.close), candles };
  });
}

export function MarketTerminalDemo() {
  const [instruments, setInstruments] = useState(buildInstruments);
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [buyingPower, setBuyingPower] = useState(250000);
  const [positions, setPositions] = useState<Record<string, number>>({ ANKA: 120, CELI: 40 });
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [rejectNext, setRejectNext] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(Date.now());
  const nextId = useRef(1);
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  // Örnek canlı akış: her saniye son mumları ve fiyatı oynatır; bekleyen limit emirler fiyat gelince gerçekleşir.
  useEffect(() => {
    if (!live) return;
    const timer = window.setInterval(() => {
      setUpdatedAt(Date.now());
      setInstruments(current => current.map(item => {
        const price = Math.max(1, Math.round(item.price * (1 + (Math.random() - .5) * .0016) * 100) / 100);
        const candles = Object.fromEntries(Object.entries(item.candles).map(([period, list]) => {
          const last = list[list.length - 1]!;
          return [period, [...list.slice(0, -1), { ...last, close: price, high: Math.max(last.high, price), low: Math.min(last.low, price), volume: last.volume + Math.round(Math.random() * 900) }]];
        }));
        return { ...item, price, candles, intraday: [...(item.intraday ?? []).slice(-107), price] };
      }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [live]);

  useEffect(() => {
    for (const order of ordersRef.current) {
      if (order.status !== "pending") continue;
      const item = instruments.find(entry => entry.key === order.symbol);
      if (!item) continue;
      const hit = order.side === "buy" ? item.price <= order.price : item.price >= order.price;
      if (!hit) continue;
      setOrders(current => current.map(entry => entry.id === order.id ? { ...entry, status: "filled", t: Date.now() } : entry));
      setBuyingPower(power => power + (order.side === "sell" ? order.quantity * order.price : 0));
      setPositions(held => ({ ...held, [order.symbol]: (held[order.symbol] ?? 0) + (order.side === "buy" ? order.quantity : -order.quantity) }));
    }
  }, [instruments]);

  const submit = async (request: OrderRequest) => {
    await new Promise(resolve => window.setTimeout(resolve, 700));
    if (rejectNext) { setRejectNext(false); throw new Error("Emir reddedildi: piyasa geçici olarak kapalı (örnek hata)"); }
    const item = instruments.find(entry => entry.key === request.symbol)!;
    const price = request.type === "limit" && request.limit !== undefined ? request.limit : item.price;
    const marketable = request.type === "market" || (request.side === "buy" ? price >= item.price : price <= item.price);
    const fillPrice = marketable ? (request.type === "market" ? item.price : request.side === "buy" ? Math.min(price, item.price) : Math.max(price, item.price)) : price;
    const status = marketable ? "filled" : "pending";
    setOrders(current => [{ id: String(nextId.current++), side: request.side, type: request.type, symbol: request.symbol, quantity: request.quantity, price: fillPrice, status, t: Date.now() }, ...current]);
    if (request.side === "buy") setBuyingPower(power => power - request.quantity * fillPrice);
    if (status === "filled") {
      setPositions(held => ({ ...held, [request.symbol]: (held[request.symbol] ?? 0) + (request.side === "buy" ? request.quantity : -request.quantity) }));
      if (request.side === "sell") setBuyingPower(power => power + request.quantity * fillPrice);
    } else if (request.side === "sell") {
      setPositions(held => ({ ...held, [request.symbol]: (held[request.symbol] ?? 0) - request.quantity }));
    }
  };
  const cancel = (id: string) => {
    const order = orders.find(entry => entry.id === id);
    if (!order || order.status !== "pending") return;
    setOrders(current => current.map(entry => entry.id === id ? { ...entry, status: "cancelled" } : entry));
    if (order.side === "buy") setBuyingPower(power => power + order.quantity * order.price);
    else setPositions(held => ({ ...held, [order.symbol]: (held[order.symbol] ?? 0) + order.quantity }));
  };

  return (
    <div className="col">
      <span className="etiket">Örnek akışta fiyatlar her saniye değişir. Tekerlekle yakınlaştırın, sürükleyerek kaydırın (bırakınca savrulur), iki parmakla ya da + / − ile yakınlaştırın; grafiğe odaklanıp ok tuşlarıyla mumları gezin, 0 sıfırlar. Emir fişi kâğıt üstü çalışır: piyasa emri hemen, limit emri fiyat gelince gerçekleşir; bileşen kendisi hiçbir gerçek emir göndermez.</span>
      <div className="row">
        <label><input type="checkbox" checked={rejectNext} onChange={event => setRejectNext(event.target.checked)} /> Sonraki emir reddedilsin</label>
        <label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
      </div>
      <MarketTerminal instruments={instruments} periods={PERIODS} live={live} onLiveChange={setLive} updatedText={`${date.format(new Date(updatedAt).toISOString(), "time")}`} buyingPower={Math.round(buyingPower * 100) / 100} positions={positions} orders={orders} onSubmitOrder={submit} onCancelOrder={cancel} loading={loading} />
    </div>
  );
}
