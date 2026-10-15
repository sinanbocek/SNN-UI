// Fotoğraf ızgarasının saf mantığı: yoğunluk seviyeleri, sıkıştırma ve ok tuşlarıyla gezme. Sayılar ABACUS'tandır.
import { countText } from "../lib/shop-format";

/** Yakınlaştırma seviyeleri: sütun sayıları, yoğundan genişe. */
export const LEVELS = [5, 3, 2] as const;
export const DEFAULT_LEVEL = 0;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Sütun sayısına en yakın seviye sırası. */
export function nearestLevel(columns: number): number {
  let best = 0;
  LEVELS.forEach((level, at) => { if (Math.abs(level - columns) < Math.abs(LEVELS[best]! - columns)) best = at; });
  return best;
}

/** Bir seviye yakınlaş (`in`) ya da uzaklaş (`out`): sütun sayısı azalırsa yakınlaşır. Uçlarda yerinde kalır. */
export const stepLevel = (level: number, way: "in" | "out"): number => clamp(level + (way === "in" ? 1 : -1), 0, LEVELS.length - 1);

/**
 * İki parmakla sıkıştırma sırasındaki canlı sütun sayısı (ondalık): parmaklar açılınca (`scale` > 1) hücreler büyür, sütun azalır.
 * Bırakınca `nearestLevel` ile en yakın seviyeye oturur.
 */
export function pinchColumns(startColumns: number, scale: number): number {
  return clamp(startColumns / Math.max(.1, scale), LEVELS[LEVELS.length - 1]!, LEVELS[0]!);
}

/** Izgarada ok tuşuyla odak: sol/sağ bir hücre, yukarı/aşağı bir satır, PageUp/PageDown üç satır, Home/End ilk-son. Sınırda yerinde kalır. */
export function gridFocus(key: string, current: number, columns: number, count: number): number {
  const last = count - 1;
  switch (key) {
    case "ArrowLeft": return clamp(current - 1, 0, last);
    case "ArrowRight": return clamp(current + 1, 0, last);
    case "ArrowUp": return clamp(current - columns, 0, last);
    case "ArrowDown": return clamp(current + columns, 0, last);
    case "PageUp": return clamp(current - columns * 3, 0, last);
    case "PageDown": return clamp(current + columns * 3, 0, last);
    case "Home": return 0;
    case "End": return last;
    default: return current;
  }
}

export const photoCountText = (count: number): string => `${countText(count)} fotoğraf`;
export const cellLabel = (alt: string, favorite: boolean): string => favorite ? `${alt}, favori` : alt;
export const favoriteLabel = (favorite: boolean): string => favorite ? "Favoriden çıkar" : "Favoriye ekle";
export const columnsText = (columns: number): string => `${countText(columns)} sütun`;
export const HINT = "Yakınlaştırmak için iki parmakla sıkıştırın ya da Ctrl basılıyken kaydırın.";
