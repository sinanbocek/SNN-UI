// Ürün galerisinin saf mantığı: tükenen beden, ok tuşuyla beden gezme, büyüteç konumu ve yazımlar. Sayılar ABACUS'tandır.
import { counterText, type ViewerImage } from "../lib/image-viewer-format";

export interface GalleryColor { value: string; label: string; /** Örnek rengi (CSS rengi). */ color: string; photos: ViewerImage[] }
export interface GallerySize { value: string; label: string; /** Bu bedenin tükendiği renkler (`GalleryColor.value`). */ soldOutIn?: string[] | undefined }

export const isSoldOut = (size: GallerySize, color: string): boolean => !!size.soldOutIn?.includes(color);

/** Renk değişince seçili beden o renkte tükenmişse seçim kalkar (boş metin). */
export function keepSize(sizes: GallerySize[], size: string, color: string): string {
  const found = sizes.find(item => item.value === size);
  return found && !isSoldOut(found, color) ? size : "";
}

/** Ok tuşuyla bir sonraki seçilebilir beden: tükenenler atlanır, uçlarda başa/sona sarılmaz (aynı beden döner). */
export function stepSize(sizes: GallerySize[], color: string, from: string, step: 1 | -1): string {
  const start = sizes.findIndex(item => item.value === from);
  for (let at = start + step; at >= 0 && at < sizes.length; at += step) if (!isSoldOut(sizes[at]!, color)) return sizes[at]!.value;
  return from;
}

/** Home / End: ilk ya da son seçilebilir beden; hiçbiri yoksa boş metin. */
export function edgeSize(sizes: GallerySize[], color: string, end: "first" | "last"): string {
  const list = end === "first" ? sizes : [...sizes].reverse();
  return list.find(item => !isSoldOut(item, color))?.value ?? "";
}

export const soldOutText = (color: string, size: string): string => `${color} için ${size} tükendi`;

/** Büyüteç mercek yarıçapı ve imleç noktasından iç görüntünün kayması (merceğin sol üst köşesine göre, piksel). */
export function lensShift(point: { x: number; y: number }, zoom: number, radius: number): { x: number; y: number } {
  return { x: radius - point.x * zoom, y: radius - point.y * zoom };
}

/** İmleci fotoğraf kutusunun içine sıkıştırır. */
export function clampPoint(rect: { left: number; top: number; width: number; height: number }, clientX: number, clientY: number): { x: number; y: number } {
  return { x: Math.min(Math.max(clientX - rect.left, 0), rect.width), y: Math.min(Math.max(clientY - rect.top, 0), rect.height) };
}

export const mainLabel = (image: ViewerImage, index: number, count: number): string => `${image.alt}, ${counterText(index, count)}`;
export const OPEN_FULLSCREEN = "Tam ekran aç";
export const PICK_SIZE = "Beden seçin";
