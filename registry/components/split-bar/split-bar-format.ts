// Bölünmüş çubuğun saf mantığı ve yazımı. Sayılar ABACUS'tandır (chart-format): pay "%41,6", tutar "₺1.250.000".
import { formatMoney, formatMoneyCompact, formatRatio } from "../lib/chart-format";

export interface SplitSlice { key: string; label: string; value: number }

/** Çubukta yer alan dilimler: değeri pozitif ve kapatılmamış olanlar. */
export function visibleSlices(data: SplitSlice[], hidden: ReadonlySet<string>): SplitSlice[] {
  return data.filter(slice => slice.value > 0 && !hidden.has(slice.key));
}

/** Değeri pozitif olan dilimler (kapalılar dahil): açıklama satırında yer alır. */
export const positiveSlices = (data: SplitSlice[]) => data.filter(slice => slice.value > 0);

export const totalOf = (slices: SplitSlice[]) => slices.reduce((sum, slice) => sum + slice.value, 0);

/** Pay yazımı: 0,416 → "%41,6". Hesap yuvarlanmamış değerle yapılır, yalnız gösterim yuvarlanır. */
export const shareText = (value: number, total: number) => formatRatio(total > 0 ? value / total : 0, 1);

/** Tam tutar ("₺1.250.000") ve kısa tutar ("₺1,25Mn"). */
export const fullValueText = (value: number) => formatMoney(value, 0);
export const shortValueText = (value: number) => formatMoneyCompact(value);

/** Üzerine gelinen dilim kadar genişler: çubuğun yaklaşık yüzde 4,5'i eklenir. */
export function sliceWeights(slices: SplitSlice[], activeKey: string | null): number[] {
  const total = totalOf(slices);
  return slices.map(slice => slice.value + (slice.key === activeKey ? total * .045 : 0));
}

/** Dilim sığıyor mu: piksel genişliği, yazının yaklaşık genişliği ve iç boşluk. */
export const fitsInside = (widthPx: number, textPx: number) => widthPx >= textPx + 16;

/** Ekran okuyucu özeti: "bölünmüş çubuk, Personel %41,6, Kira %20,0; ok tuşlarıyla gezin". */
export function barSummary(slices: SplitSlice[]): string {
  const total = totalOf(slices);
  return `bölünmüş çubuk, ${slices.map(slice => `${slice.label} ${shareText(slice.value, total)}`).join(", ")}; ok tuşlarıyla gezin`;
}
