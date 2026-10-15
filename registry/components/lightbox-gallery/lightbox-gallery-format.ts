// Fotoğraf duvarının saf mantığı: sütun sayısı ve fotoğrafların sütunlara dağılımı. Sayılar ABACUS'tandır.
import { countText } from "../lib/shop-format";

/** Sütun sayısı kabın genişliğinden hesaplanır: sütun `minWidth` altına düşmez ama en az iki sütun olur. */
export function masonryColumns(width: number, minWidth = 180, gap = 12): number {
  if (!width) return 2;
  return Math.max(2, Math.floor((width + gap) / (minWidth + gap)));
}

/**
 * Fotoğrafları sütunlara dağıtır: her fotoğraf o ana kadar en kısa olan sütuna gider (eşitlikte soldaki), böylece sütun boyları dengeli kalır.
 * Dönen listeler fotoğraf sıralarıdır; sütun içinde sıra korunur.
 */
export function assignColumns(images: { width: number; height: number }[], columns: number): number[][] {
  const lanes: number[][] = Array.from({ length: Math.max(1, columns) }, () => []);
  const heights = lanes.map(() => 0);
  images.forEach((image, at) => {
    const lane = heights.indexOf(Math.min(...heights));
    lanes[lane]!.push(at);
    heights[lane]! += image.width ? image.height / image.width : 1;
  });
  return lanes;
}

export const galleryCountText = (count: number): string => `${countText(count)} fotoğraf`;
export const DEFAULT_LABEL = "Fotoğraf galerisi";
