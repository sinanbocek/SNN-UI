// Özellik ızgarasının saf mantığı: kap genişliğine göre sütun sayısı, kart kaplaması ve ışık konumu. Sayılar ABACUS'tandır.
import { countText } from "../lib/shop-format";

/** Sütun sayısı kap genişliğine bakar: 520 px altında tek, 820 px altında iki, üstünde üç. */
export function columnsFor(width: number): 1 | 2 | 3 {
  if (width > 0 && width < 520) return 1;
  if (width > 0 && width < 820) return 2;
  return 3;
}

/** Geniş kart iki sütun kaplar; tek sütunlu ızgarada kaplamaz. */
export const spanFor = (wide: boolean | undefined, columns: number): 1 | 2 => wide && columns > 1 ? 2 : 1;

/** Işığın kart içindeki konumu: imleç kartın dışına taşsa da kenarlara sıkıştırılır. */
export function glowAt(rect: { left: number; top: number; width: number; height: number }, clientX: number, clientY: number): { x: number; y: number } {
  return {
    x: Math.min(Math.max(clientX - rect.left, 0), rect.width),
    y: Math.min(Math.max(clientY - rect.top, 0), rect.height),
  };
}

export const closeLabel = (title: string): string => `${title}: ayrıntıyı kapat`;
export const cardCountText = (count: number): string => `${countText(count)} özellik`;
export const CLOSE = "Kapat";
