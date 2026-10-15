// Sepetin saf mantığı: satır adetleri, kargo eşiği, kupon indirimi ve toplam. Para TRY'dir; hesap kuruş tamsayısıyla yapılır.
// Ekrandaki toplam yalnızca gösterimdir: gerçek siparişte kargo, kupon ve toplam sunucuda yeniden hesaplanır.
import { math } from "@snn/abacus-core";
import { countText, exactText, lineMinor, priceText, toMinor } from "../lib/shop-format";

export interface CartPhoto { alt: string; src?: string; /** Fotoğrafın odak noktası (CSS object-position). */ position?: string; tone?: number }
export interface CartProduct { id: string; name: string; description?: string; price: number; photo: CartPhoto }
export interface CartLine extends CartProduct { quantity: number }
/** Sunucunun kabul ettiği kupon: yüzde ya da tutar indirimi (ana birimde TRY). */
export interface Coupon { code: string; percent?: number; amount?: number }
export interface ShippingRule { /** Kargo ücreti (ana birimde TRY). */ fee: number; /** Bu ara toplamdan itibaren kargo ücretsizdir. */ freeFrom: number }

export interface Totals {
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  totalMinor: number;
  /** Ücretsiz kargoya kalan tutar (kuruş); kazanıldıysa 0. */
  remainingMinor: number;
  /** Kargo çubuğu doluluğu, 0–1. */
  progress: number;
  freeShipping: boolean;
}

export const quantityOf = (lines: Pick<CartLine, "quantity">[]): number => lines.reduce((sum, line) => sum + line.quantity, 0);

/** Sepeti ekler: aynı ürün varsa adedi artar, yoksa sona eklenir. */
export function addLine(lines: CartLine[], product: CartProduct): CartLine[] {
  return lines.some(line => line.id === product.id)
    ? lines.map(line => line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line)
    : [...lines, { ...product, quantity: 1 }];
}

export function setQuantity(lines: CartLine[], id: string, quantity: number): CartLine[] {
  return quantity <= 0 ? lines.filter(line => line.id !== id) : lines.map(line => line.id === id ? { ...line, quantity } : line);
}

/** Kupon indirimi (kuruş): yüzde ya da tutar; ara toplamı aşamaz. */
export function discountOf(subtotalMinor: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  const raw = coupon.percent !== undefined ? math.round(math.mul(subtotalMinor, coupon.percent / 100), 0) : toMinor(coupon.amount ?? 0);
  return Math.min(Math.max(raw, 0), subtotalMinor);
}

export function cartTotals(lines: CartLine[], shipping: ShippingRule, coupon: Coupon | null): Totals {
  const subtotalMinor = lines.reduce((sum, line) => math.add(sum, lineMinor(toMinor(line.price), line.quantity)), 0);
  const freeFromMinor = toMinor(shipping.freeFrom);
  const freeShipping = subtotalMinor > 0 && subtotalMinor >= freeFromMinor;
  const shippingMinor = subtotalMinor === 0 || freeShipping ? 0 : toMinor(shipping.fee);
  const discountMinor = discountOf(subtotalMinor, coupon);
  return {
    subtotalMinor, discountMinor, shippingMinor, freeShipping,
    totalMinor: Math.max(0, subtotalMinor - discountMinor + shippingMinor),
    remainingMinor: Math.max(0, freeFromMinor - subtotalMinor),
    progress: freeFromMinor > 0 ? Math.min(1, subtotalMinor / freeFromMinor) : 1,
  };
}

export const shippingText = (totals: Totals): string => totals.freeShipping ? "Ücretsiz kargo kazandınız" : `Ücretsiz kargo için ${exactText(totals.remainingMinor)} kaldı`;
export const lineTotalText = (line: CartLine): string => exactText(lineMinor(toMinor(line.price), line.quantity));
export const unitPriceText = (price: number): string => priceText(price);
export const cartButtonLabel = (quantity: number): string => `Sepet, ${countText(quantity)} ürün`;
export const addedText = (name: string): string => `${name} sepete eklendi.`;
export const removedText = (name: string): string => `${name} sepetten çıkarıldı.`;
export const couponAppliedText = (code: string, discountMinor: number): string => `${code} kuponu uygulandı, ${exactText(discountMinor)} indirim.`;
export const orderText = (totalMinor: number): string => `Siparişiniz alındı. Toplam ${exactText(totalMinor)}.`;
