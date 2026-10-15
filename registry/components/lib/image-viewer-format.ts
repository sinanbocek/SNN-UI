// Tam ekran fotoğraf görüntüleyicisinin saf mantığı: sığdırma, yakınlaştırma, kaydırma sınırı ve karar eşikleri. Sayılar ABACUS'tandır.
import { countText } from "./shop-format";

export interface Rect { left: number; top: number; width: number; height: number }
export interface ViewerImage {
  id: string;
  /** Anlamlı açıklama (zorunlu). */
  alt: string;
  /** Verilmezse kendi yer tutucusu çizilir. */
  src?: string;
  /** Yer tutucunun renk tonu (0–5). */
  tone?: number;
  /** Gerçek genişlik ve yükseklik: duvar oranı, uçuş ve yakınlaştırma bunlardan hesaplanır. */
  width: number;
  height: number;
  title?: string;
  caption?: string;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;
export const ZOOM_STEP = 1.5;
/** Aşağı çekince kapanma eşiği (piksel) ve hızlı atış hızı (piksel/sn). */
export const PULL_CLOSE = 120;
export const PULL_VELOCITY = 700;
/** Yana kaydırınca komşu fotoğrafa geçme eşiği (piksel) ve hızı. */
export const SWIPE_DISTANCE = 80;
export const SWIPE_VELOCITY = 500;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Fotoğrafı kutuya oranını koruyarak sığdırır (kenarlardan `margin` boşluk); kutunun içinde ortalı konum döner. */
export function fitRect(imageWidth: number, imageHeight: number, boxWidth: number, boxHeight: number, margin = 0): Rect {
  const availableWidth = Math.max(1, boxWidth - margin * 2), availableHeight = Math.max(1, boxHeight - margin * 2);
  const ratio = Math.min(availableWidth / Math.max(1, imageWidth), availableHeight / Math.max(1, imageHeight));
  const width = Math.round(imageWidth * ratio), height = Math.round(imageHeight * ratio);
  return { left: Math.round((boxWidth - width) / 2), top: Math.round((boxHeight - height) / 2), width, height };
}

export const clampZoom = (zoom: number): number => clamp(zoom, MIN_ZOOM, MAX_ZOOM);
export const zoomIn = (zoom: number): number => clampZoom(zoom * ZOOM_STEP);
export const zoomOut = (zoom: number): number => clampZoom(zoom / ZOOM_STEP);

/** Yakın planda kaydırmanın sınırı: büyütülmüş fotoğraf kutudan taşan kadar her yöne gezilebilir. */
export function panLimit(rect: Rect, zoom: number): { x: number; y: number } {
  return { x: Math.max(0, (rect.width * zoom - rect.width) / 2), y: Math.max(0, (rect.height * zoom - rect.height) / 2) };
}

/** İmleç noktasında yakınlaştırırken kayma: nokta (fotoğraf merkezine göre) ekranda yerinde kalır. */
export function zoomAround(point: { x: number; y: number }, pan: { x: number; y: number }, fromZoom: number, toZoom: number): { x: number; y: number } {
  const ratio = toZoom / fromZoom;
  return { x: point.x - (point.x - pan.x) * ratio, y: point.y - (point.y - pan.y) * ratio };
}

export function clampPan(pan: { x: number; y: number }, rect: Rect, zoom: number): { x: number; y: number } {
  const limit = panLimit(rect, zoom);
  return { x: clamp(pan.x, -limit.x, limit.x), y: clamp(pan.y, -limit.y, limit.y) };
}

/** Yana kaydırma sonucu: indekse eklenecek adım (1 sonraki, -1 önceki, 0 yerinde kal). Sola sürükleyince sonraki, sağa sürükleyince önceki fotoğraf gelir. */
export function swipeStep(offsetX: number, velocityX: number, index: number, count: number): -1 | 0 | 1 {
  const go = Math.abs(offsetX) > SWIPE_DISTANCE || Math.abs(velocityX) > SWIPE_VELOCITY;
  if (!go) return 0;
  if (offsetX < 0 && index < count - 1) return 1;
  if (offsetX > 0 && index > 0) return -1;
  return 0;
}

/** Aşağı çekme kapatır mı? */
export const pullCloses = (offsetY: number, velocityY: number): boolean => offsetY > PULL_CLOSE || velocityY > PULL_VELOCITY;

/** İki işaretçi arası uzaklık oranından yeni yakınlaştırma. */
export const pinchZoom = (startZoom: number, startDistance: number, distance: number): number => startDistance ? clampZoom(startZoom * (distance / startDistance)) : startZoom;

export const counterText = (index: number, count: number): string => `${countText(index + 1)} / ${countText(count)}`;
export const openText = (image: Pick<ViewerImage, "alt" | "title">, index: number, count: number): string => `${image.title ?? image.alt} aç, ${counterText(index, count)} fotoğraf`;
export const zoomPercent = (zoom: number): string => `${countText(Math.round(zoom * 100))}`;
