// Derinlikli rayın saf mantığı: kart dönüşü, momentumla oturma, çentikler ve yazımlar. Sayılar ABACUS'tandır.
import { countText } from "../lib/shop-format";

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export interface CoverTransform { x: number; scale: number; rotate: number; z: number; shade: number; hidden: boolean }

/**
 * Bir kartın ray konumundan dönüşümü. `offset` kartın öndekine uzaklığıdır (kart birimiyle, ondalık olabilir; 0 öndeki).
 * `x` kart genişliğine oranla yana kayma, `rotate` merkeze doğru derece, `shade` karartma (0–1); uzaktaki kartlar gizlenir.
 */
export function coverTransform(offset: number, reach = 3): CoverTransform {
  const distance = Math.abs(offset), sign = Math.sign(offset);
  const hidden = distance > reach;
  const spread = distance <= 1 ? distance * .62 : .62 + (distance - 1) * .28;
  return {
    x: sign * spread,
    scale: clamp(1 - distance * .12, .55, 1),
    rotate: -sign * clamp(distance, 0, 1) * 38,
    z: Math.round((reach + 1 - distance) * 10),
    shade: clamp(distance * .22, 0, .7),
    hidden,
  };
}

/** Bırakma hızı ve konumundan oturulacak kart: hızlı fırlatma en az bir kart ilerletir; uçlarda sınırlanır. */
export function settleIndex(position: number, velocity: number, count: number): number {
  const target = Math.abs(velocity) > .5 ? position + Math.sign(velocity) * Math.max(1, Math.round(Math.abs(velocity) * .6)) : position;
  return clamp(Math.round(target), 0, count - 1);
}

/** Sürükleme pikselini kart birimine çevirir: sola sürükleme (eksi) sonraki karta (artı) götürür. */
export const dragToPosition = (start: number, deltaPx: number, cardWidth: number): number => start - deltaPx / Math.max(1, cardWidth * .62);

/** Azaltılmış harekette: 40 pikseli aşan sürükleme ya da bir kaydırma bir kart ilerletir. */
export function reducedStep(deltaPx: number): -1 | 0 | 1 {
  return deltaPx < -40 ? 1 : deltaPx > 40 ? -1 : 0;
}

/** Ray tuşları: sol/sağ bir kart, Home/End ilk-son. */
export function railKey(key: string, index: number, count: number): number {
  if (key === "ArrowRight") return Math.min(count - 1, index + 1);
  if (key === "ArrowLeft") return Math.max(0, index - 1);
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return index;
}

export const slideLabel = (index: number, count: number, title: string): string => `${countText(index + 1)} / ${countText(count)}: ${title}`;
export const tickLabel = (title: string): string => `${title} göster`;
export const liveText = (index: number, count: number, title: string): string => slideLabel(index, count, title);
