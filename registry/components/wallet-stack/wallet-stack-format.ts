// Kart destesinin saf mantığı: son dört hane güvenliği, deste konumu, ok tuşuyla dönme ve yazımlar.
// Bu bir görünümdür: gerçek kart numarası hiçbir yerde tutulmaz ya da gösterilmez, yalnız son dört hane. Para TRY'dir; hesap kuruş tamsayısıyla yapılır.
import { exactText, signedMinorText, toMinor, countText } from "../lib/shop-format";

export type CardMaterial = "metal" | "black" | "glass" | "flat";

export interface CardTransaction { id: string; merchant: string; detail?: string; /** Ana birimde TRY; çıkan eksi. */ amount: number }
export interface WalletCard {
  id: string;
  issuer: string;
  product: string;
  /** Yalnız son dört hane. Daha uzun bir metin verilirse yine son dört hane alınır, kalanı atılır. */
  last4: string;
  holder: string;
  /** "AA/YY" biçimli son kullanma; geçersizse "—" yazılır. */
  expiry: string;
  /** Kurgusal ağ adı; gerçek marka işareti konmaz. */
  network?: string;
  material?: CardMaterial;
  /** Kullanılabilir bakiye (ana birimde TRY). */
  balance: number;
  transactions: CardTransaction[];
}

/** Güvenlik: verilen metinden yalnız rakamlar alınır ve yalnız son dört hane döner. Dört haneden az varsa eksik haneler nokta olur. */
export function safeLast4(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 4 ? digits.slice(-4) : digits.padStart(4, "•");
}

/** Görsel numara: "•••• •••• •••• 0417". */
export const maskedNumber = (raw: string): string => `•••• •••• •••• ${safeLast4(raw)}`;

/** Son kullanma "AA/YY" biçiminde ve ay 01–12 ise olduğu gibi, değilse "—". */
export function expiryText(raw: string): string {
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(raw.trim()) ? raw.trim() : "—";
}

export const MAX_CARDS = 6;
/** Deste en çok `MAX_CARDS` kart çizer (her kart çizildiğinden sınırlıdır). */
export const visibleCards = <T,>(cards: T[]): T[] => cards.slice(0, MAX_CARDS);

export interface Place { y: number; scale: number; opacity: number; hidden: boolean }

/**
 * Bir kartın deste konumu: `pos` kartın öndekine göre sırası (0 ön, 1 bir arkada...), `open` 0–1 arası açıklık (üstüne gelince deste açılır).
 * Önde olanı geçmiş kartlar (`pos` < 0) aşağı kayıp saydamlaşır; ilk üç arka kart görünür. `y` karta oranla, yukarı eksi.
 */
export function placeOf(pos: number, open: number, peek = .12): Place {
  if (pos < 0) return { y: 1.15, scale: 1, opacity: 0, hidden: true };
  const spread = 1 + open * .9;
  const hidden = pos > 3;
  return { y: -pos * peek * spread, scale: Math.max(.8, 1 - pos * .04), opacity: hidden ? 0 : 1 - Math.max(0, pos - 2) * .6, hidden };
}

/** Ok tuşları: aşağı/sağ ileri, yukarı/sol geri, Home/End ilk-son; uçlarda yerinde kalır. */
export function stepFront(key: string, front: number, count: number): number {
  const last = count - 1;
  if (key === "ArrowDown" || key === "ArrowRight") return Math.min(last, front + 1);
  if (key === "ArrowUp" || key === "ArrowLeft") return Math.max(0, front - 1);
  if (key === "Home") return 0;
  if (key === "End") return last;
  return front;
}

/** Sürükleme sonucu: aşağı çekmek ileri (1), yukarı çekmek geri (-1). */
export function dragStep(offsetY: number, velocityY: number): -1 | 0 | 1 {
  if (offsetY > 60 || velocityY > 500) return 1;
  if (offsetY < -60 || velocityY < -500) return -1;
  return 0;
}

export const cardLabel = (card: WalletCard, index: number, count: number): string =>
  `${card.issuer}, ${card.product}, son dört hane ${safeLast4(card.last4).split("").join(" ")}, ${countText(index + 1)}/${countText(count)}, bakiye ${exactText(toMinor(card.balance))}`;
export const counterText = (index: number, count: number): string => `${countText(index + 1)} / ${countText(count)}`;
export const balanceText = (card: Pick<WalletCard, "balance">): string => exactText(toMinor(card.balance));
export const transactionText = (amount: number): string => signedMinorText(toMinor(amount));
export const HINT = "Oklarla kart değiştirin. Enter kartı açar, Escape geri koyar.";
