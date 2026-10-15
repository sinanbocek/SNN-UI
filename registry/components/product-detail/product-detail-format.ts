// Ürün sayfasının saf mantığı: tükenme, tutar (kuruş tamsayısıyla), yorum dağılımı ve yazımlar. Para TRY'dir.
import { exactText, averageText, countText, lineMinor, priceText, toMinor } from "../lib/shop-format";

export interface DetailPhoto { alt: string; src?: string; /** Fotoğrafın odak noktası (CSS object-position). */ position?: string; tone?: number }
export interface Finish { value: string; label: string; /** Örnek rengi (CSS rengi). */ color: string; photos: DetailPhoto[] }
export interface Size {
  value: string;
  label: string;
  /** Ana birimde TRY. */
  price: number;
  /** Bu boyun tükendiği kaplamalar (`Finish.value`). */
  soldOutIn?: string[];
}
export interface Selection { finish: string; size: string; quantity: number }

export const isSoldOut = (size: Size, finish: string): boolean => !!size.soldOutIn?.includes(finish);

/** Kaplama değişince seçili boy o kaplamada tükenmişse seçim kalkar (boş metin). */
export function keepSize(sizes: Size[], size: string, finish: string): string {
  const found = sizes.find(item => item.value === size);
  return found && !isSoldOut(found, finish) ? size : "";
}

/** Satır tutarı kuruş tamsayısı: fiyat × adet. */
export const totalMinor = (price: number, quantity: number): number => lineMinor(toMinor(price), quantity);

/** Düğme etiketi: "Sepete ekle · ₺2.400,00". */
export const addLabel = (price: number, quantity: number): string => `Sepete ekle · ${exactText(totalMinor(price, quantity))}`;

/** `distribution[0]` 5 yıldızlı, `distribution[4]` 1 yıldızlı yorum sayısıdır. */
export type Distribution = [number, number, number, number, number];

export function reviewTotal(distribution: Distribution): number {
  return distribution.reduce((sum, count) => sum + count, 0);
}

/** Yıldız ortalaması; yorum yoksa null. */
export function reviewAverage(distribution: Distribution): number | null {
  const total = reviewTotal(distribution);
  if (!total) return null;
  return distribution.reduce((sum, count, at) => sum + count * (5 - at), 0) / total;
}

/** Çubuk oranı: en kalabalık satıra göre (0–1). */
export function barRatios(distribution: Distribution): number[] {
  const peak = Math.max(...distribution, 0);
  return distribution.map(count => peak ? count / peak : 0);
}

export const averageLabel = (distribution: Distribution): string => {
  const average = reviewAverage(distribution);
  return average === null ? "Henüz yorum yok" : `${averageText(average)} / 5`;
};
export const reviewCountText = (total: number): string => `${countText(total)} yorum`;
export const barRowLabel = (stars: number, count: number): string => `${stars} yıldız, ${reviewCountText(count)}`;
export const sizeLabel = (size: Size, soldOut: boolean): string => soldOut ? `${size.label} · ${priceText(size.price)} · Tükendi` : `${size.label} · ${priceText(size.price)}`;
export const counterText = (index: number, count: number): string => `${countText(index + 1)} / ${countText(count)}`;
