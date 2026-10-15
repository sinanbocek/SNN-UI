// Tek ürünlü sipariş özetinin saf mantığı: indirimler, kupon, vergi ve toplam. Para TRY'dir; hesap kuruş tamsayısıyla yapılır.
// Ekrandaki toplam yalnızca gösterimdir: kupon, indirim ve vergi gerçek siparişte sunucuda yeniden hesaplanır.
import { math } from "@snn/abacus-core";
import { exactText, percentText, toMinor } from "../lib/shop-format";

/** Sunucunun kabul ettiği kupon: yüzde ya da tutar indirimi (ana birimde TRY). */
export interface PromoCode { code: string; percent?: number; amount?: number }
/** Otomatik indirim satırı (örneğin yıllık ödeme indirimi); `amount` pozitif yazılır, ekranda eksi gösterilir. */
export interface AutoDiscount { id: string; label: string; amount: number }

export interface Summary {
  subtotalMinor: number;
  discounts: { id: string; label: string; minor: number }[];
  couponMinor: number;
  /** İndirimlerden sonraki ara toplam, sıfırın altına inmez. */
  netMinor: number;
  /** Oran verilmediyse null. */
  taxMinor: number | null;
  totalMinor: number;
}

export function summarize(priceMinor: number, autoDiscounts: AutoDiscount[], coupon: PromoCode | null, taxRate: number | null): Summary {
  const discounts = autoDiscounts.map(item => ({ id: item.id, label: item.label, minor: Math.min(Math.max(toMinor(item.amount), 0), priceMinor) }));
  const afterAuto = Math.max(0, discounts.reduce((sum, item) => sum - item.minor, priceMinor));
  const rawCoupon = !coupon ? 0 : coupon.percent !== undefined ? math.round(math.mul(afterAuto, coupon.percent / 100), 0) : toMinor(coupon.amount ?? 0);
  const couponMinor = Math.min(Math.max(rawCoupon, 0), afterAuto);
  const netMinor = afterAuto - couponMinor;
  const taxMinor = taxRate === null ? null : math.round(math.mul(netMinor, taxRate / 100), 0);
  return { subtotalMinor: priceMinor, discounts, couponMinor, netMinor, taxMinor, totalMinor: netMinor + (taxMinor ?? 0) };
}

export const payLabel = (totalMinor: number): string => `${exactText(totalMinor)} öde`;
export const taxLabel = (rate: number): string => `Vergi · ${percentText(rate, 0)}`;
export const negativeText = (minor: number): string => exactText(-minor);
export const removeCodeLabel = (code: string): string => `Kodu kaldır: ${code}`;
export const totalSentence = (totalMinor: number): string => `Ödenecek toplam ${exactText(totalMinor)}`;
