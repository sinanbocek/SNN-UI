// Kaydırmayla ilerleyen anlatının saf mantığı: kaydırma konumundan adım konumu, sekme dolgusu ve yazımlar. Sayılar ABACUS'tandır.
import { countText } from "../lib/shop-format";

/** Görüş alanında "okuma çizgisi": adım geçişi görüş alanının bu oranında olur (üstten). */
export const READ_LINE = .4;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/**
 * Adım konumu (ondalık): 0 ilk adımın başı, 1 ikinci adımın başı... `tops` adım metinlerinin kaydırma alanındaki üst kenarlarıdır.
 * Okuma çizgisi iki adımın arasındaysa aradaki oranı verir; son adımdan sonrası son adımda kalır.
 */
export function stepPosition(tops: number[], scrollTop: number, viewport: number): number {
  if (!tops.length) return 0;
  const line = scrollTop + viewport * READ_LINE;
  if (line <= tops[0]!) return 0;
  for (let at = 0; at < tops.length - 1; at++) {
    if (line < tops[at + 1]!) return at + (line - tops[at]!) / (tops[at + 1]! - tops[at]! || 1);
  }
  return tops.length - 1;
}

/** Etkin adım: konuma en yakın tam adım. */
export const activeStep = (position: number, count: number): number => clamp(Math.round(position), 0, Math.max(0, count - 1));

/** Sekme dolgusu (0–1): sekme, konum bir önceki adımdan bu adıma ilerledikçe dolar. İlk sekme başlangıçta doludur. */
export const tabFill = (position: number, index: number): number => clamp(position - index + 1, 0, 1);

/** Bir adımın başına kaydırma hedefi: adım metni okuma çizgisinin biraz üstüne gelir. */
export const scrollTargetFor = (tops: number[], index: number): number => Math.max(0, (tops[index] ?? 0));

export const stepLabel = (index: number, total: number): string => `Adım ${countText(index + 1)}/${countText(total)}`;
export const COPIED_TEXT = "Bağlantı kopyalandı";
export const SENT_TEXT = "Gönderildi";
export const FAILED_TEXT = (what: string): string => `${what} yapılamadı`;
