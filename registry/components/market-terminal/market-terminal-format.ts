// İşlem ekranının saf mantığı: hareketli ortalama, görünüm penceresi, fiyat ekseni, emir doğrulama ve yazımlar.
// Sayılar ve tarihler ABACUS'tandır; kullanıcının yazdığı sayılar `money.parseNumber` ile (Türkçe ayraç) okunur.
import { date, math, money } from "@snn/abacus-core";
import { formatCompact, formatMoney } from "../lib/chart-format";

export interface Candle { /** Mum başlangıcı: epoch ms. */ t: number; open: number; high: number; low: number; close: number; volume: number }
export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "filled" | "pending" | "cancelled";
export interface MarketOrder { id: string; side: OrderSide; type: OrderType; symbol: string; quantity: number; /** Gerçekleşen ya da limit fiyat. */ price: number; status: OrderStatus; t: number }
export interface OrderRequest { side: OrderSide; type: OrderType; symbol: string; quantity: number; limit?: number | undefined }

const pad2 = (value: number) => String(value).padStart(2, "0");

/** Basit hareketli ortalama: ilk `n - 1` mumda null. */
export function sma(candles: Candle[], n: number): (number | null)[] {
  let sum = 0;
  return candles.map((candle, at) => {
    sum += candle.close;
    if (at >= n) sum -= candles[at - n]!.close;
    return at >= n - 1 ? sum / n : null;
  });
}

export interface View { /** Görünen ilk mumun (kesirli) sırası. */ from: number; /** Görünen mum sayısı. */ count: number }
export const MIN_VISIBLE = 10;

/** Görünümü geçmişin içinde tutar; sağ kenar canlı mumdan öteye geçemez, sol kenar başın öncesine çıkamaz. */
export function clampView(view: View, total: number): View {
  const count = Math.min(Math.max(view.count, Math.min(MIN_VISIBLE, total)), Math.max(total, 1));
  return { count, from: Math.min(Math.max(view.from, 0), Math.max(total - count, 0)) };
}

/** Yakınlaştırma: `anchor` (0–1, görünümde yatay konum) sabit kalır. `factor` < 1 yakınlaştırır. */
export function zoomView(view: View, factor: number, anchor: number, total: number): View {
  const count = view.count * factor;
  return clampView({ count, from: view.from + (view.count - count) * anchor }, total);
}

/** Son mumlar görünür olacak başlangıç görünümü. */
export const latestView = (total: number, count: number): View => clampView({ count, from: total - count }, total);

/** Görünen mumlar (kesirli başlangıçta komşu dahil). */
export function visibleCandles(candles: Candle[], view: View): { items: Candle[]; offset: number } {
  const start = Math.max(Math.floor(view.from), 0), end = Math.min(Math.ceil(view.from + view.count), candles.length);
  return { items: candles.slice(start, end), offset: start };
}

export interface PriceDomain { low: number; high: number }
/** Fiyat ekseni: görünen mumların ve ortalamaların aralığı, iki yanda %6 payla. */
export function priceDomain(items: Candle[], averages: (number | null)[][] = []): PriceDomain {
  const lows = items.map(candle => candle.low), highs = items.map(candle => candle.high);
  for (const line of averages) for (const value of line) if (value !== null) { lows.push(value); highs.push(value); }
  const low = lows.length ? Math.min(...lows) : 0, high = highs.length ? Math.max(...highs) : 1;
  const pad = (high - low || Math.abs(high) || 1) * .06;
  return { low: low - pad, high: high + pad };
}

/** Eksen çizgileri: en çok `count` adet, "güzel" adımlı (1, 2, 2,5, 5 × 10ⁿ). */
export function priceTicks(domain: PriceDomain, count = 5): number[] {
  const span = domain.high - domain.low;
  if (!(span > 0)) return [];
  const raw = span / count, magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(factor => factor * magnitude).find(candidate => candidate >= raw) ?? raw;
  const ticks: number[] = [];
  for (let value = Math.ceil(domain.low / step) * step; value <= domain.high; value += step) ticks.push(Math.round(value * 1e6) / 1e6);
  return ticks;
}

/** Günlük değişim: tutar ve yüzde (önceki kapanışa göre). */
export function dayChange(price: number, previousClose: number): { amount: number; percent: number | null } {
  return { amount: price - previousClose, percent: math.percentChange(price, previousClose) };
}

export const priceText = (value: number, currency = "TRY") => formatMoney(value, 2, currency);
/** Büyük fiyatın sayaç parçaları: önek ("₺"), sayı, ondalık, ek. */
export function priceParts(value: number, currency = "TRY"): { prefix: string; value: number; decimals: number; suffix: string } {
  const text = priceText(value, currency);
  const match = text.match(/^(-?[^\d]*)(\d[\d.,]*)(.*)$/);
  const parsed = match ? money.parseNumber(match[2] ?? "") : null;
  if (!match || parsed === null) return { prefix: "", value, decimals: 2, suffix: "" };
  return { prefix: match[1] ?? "", value: parsed, decimals: (match[2] ?? "").split(",")[1]?.length ?? 0, suffix: match[3] ?? "" };
}
/** İşaretli tutar: "+₺1,25", eksi ABACUS'tan. */
export const signedPrice = (amount: number, currency = "TRY") => amount > 0 ? `+${priceText(amount, currency)}` : priceText(amount, currency);
/** İşaretli yüzde: "+%1,23". */
export const signedPercent = (percent: number | null) => percent === null ? "—" : money.percent(percent, 2, { sign: "always" });
export const volumeFull = (volume: number) => money.fmtDecimalGrouped(Math.round(volume), 0);
export const volumeShort = (volume: number) => formatCompact(Math.round(volume));
export const quantityText = (quantity: number) => money.fmtDecimalGrouped(quantity, 0);

/** Mum zamanı: gün içi mumda "18.10.2026 09:40", günlükte "18.10.2026". Saat Türkiye saatiyle. */
export function candleTime(t: number, intraday: boolean): string {
  const iso = new Date(t).toISOString();
  return date.format(iso, intraday ? "dateTime" : "short");
}
/** Saat:dakika:saniye (emir saati). Saniye damgadan eklenir (ABACUS'a aday). */
export const orderTime = (t: number) => `${date.format(new Date(t).toISOString(), "time")}:${pad2(new Date(t).getUTCSeconds())}`;

/** Okuma satırı: "18.10.2026 09:40 · A 12,10 · Y 12,45 · D 12,02 · K 12,30 · +%1,2 · Hacim 1,2Mn". */
export function candleReading(candle: Candle, intraday: boolean, currency = "TRY"): string {
  const change = math.percentChange(candle.close, candle.open);
  return `${candleTime(candle.t, intraday)} · A ${priceText(candle.open, currency)} · Y ${priceText(candle.high, currency)} · D ${priceText(candle.low, currency)} · K ${priceText(candle.close, currency)} · ${signedPercent(change)} · Hacim ${volumeShort(candle.volume)}`;
}

/** Yazılan adedi okur ("1.250" → 1250); tam sayı değilse ya da boşsa null. */
export function parseQuantity(text: string): number | null {
  const value = money.parseNumber(text.trim());
  return value !== null && Number.isInteger(value) && value > 0 ? value : null;
}
/** Yazılan fiyatı okur ("12,35" → 12.35); sıfır ve altı null. */
export function parsePrice(text: string): number | null {
  const value = money.parseNumber(text.trim());
  return value !== null && value > 0 ? value : null;
}

export interface TicketInput { side: OrderSide; type: OrderType; quantityText: string; limitText: string; price: number; buyingPower: number; position: number }
/** Emir doğrulama: sorun varsa Türkçe sebep, yoksa null. */
export function validateOrder(input: TicketInput): string | null {
  const quantity = parseQuantity(input.quantityText);
  if (quantity === null) return "Adet sıfırdan büyük bir tam sayı olmalı";
  const limit = input.type === "limit" ? parsePrice(input.limitText) : null;
  if (input.type === "limit" && limit === null) return "Geçerli bir limit fiyat girin";
  const unit = limit ?? input.price;
  if (input.side === "buy" && quantity * unit > input.buyingPower) return "Alım gücü yetersiz";
  if (input.side === "sell" && quantity > input.position) return "Satılacak yeterli hisse yok";
  return null;
}
/** Tahmini tutar: adet × (limit ya da piyasa fiyatı). */
export const estimate = (quantity: number | null, limit: number | null, price: number) => quantity === null ? null : quantity * (limit ?? price);

export const statusWord = (status: OrderStatus) => status === "filled" ? "gerçekleşti" : status === "pending" ? "bekliyor" : "iptal";
export const sideWord = (side: OrderSide) => side === "buy" ? "Alış" : "Satış";
export const typeWord = (type: OrderType) => type === "market" ? "Piyasa" : "Limit";
