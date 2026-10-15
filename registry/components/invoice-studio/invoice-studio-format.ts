// Fatura ve teklif taslağının saf mantığı: kuruş tamsayısıyla hesap, giriş yazımı, doğrulama ve yazımlar.
// Para hesabı kayan noktayla değil ABACUS'un `math` ve `money.toMinor` araçlarıyla (alt birim tamsayısı) yapılır.
// Ekrandaki toplam yalnızca gösterimdir: gerçek belgede toplam sunucuda yeniden hesaplanır.
import { math, money } from "@snn/abacus-core";
import { formatMoney, formatNumber, formatPercent } from "../lib/chart-format";

export interface InvoiceItem {
  id: string;
  description: string;
  /** Ondalık olabilir (örneğin 2,5). */
  quantity: number;
  /** Birim fiyat, ana birimde TRY (örneğin 1250.5). */
  unitPrice: number;
}

export interface Totals {
  /** Satır tutarları (kuruş tamsayısı), kalem sırasıyla. */
  lines: number[];
  subtotalMinor: number;
  vatMinor: number;
  totalMinor: number;
}

/** Satır tutarı: adet × birim fiyat, kuruşa yuvarlanmış tamsayı. Geçersizse 0. */
export function lineMinor(item: Pick<InvoiceItem, "quantity" | "unitPrice">): number {
  const amount = math.mul(Math.max(item.quantity, 0), Math.max(item.unitPrice, 0));
  return money.toMinor(amount) ?? 0;
}

/** Toplamlar: her satır kuruşa yuvarlanır, KDV ara toplam üzerinden bir kez hesaplanıp kuruşa yuvarlanır. */
export function computeTotals(items: Pick<InvoiceItem, "quantity" | "unitPrice">[], vatRate: number): Totals {
  const lines = items.map(lineMinor);
  const subtotalMinor = lines.reduce((sum, minor) => math.add(sum, minor), 0);
  const vatMinor = math.round(math.mul(subtotalMinor, vatRate / 100), 0);
  return { lines, subtotalMinor, vatMinor, totalMinor: math.add(subtotalMinor, vatMinor) };
}

/** Kuruş tamsayısı → ana birim ("123450" → 1234.5), yalnız gösterim için. */
export const majorOf = (minor: number) => math.div(minor, 100) ?? 0;
/** Kuruş tamsayısını TRY olarak yazar: "₺1.234,50". */
export const minorText = (minor: number) => formatMoney(majorOf(minor), 2);

/** Alanda yazılan metni Türkçe ayraçla biçimler: "1250,5" → "1.250,5" (en çok `digits` ondalık). */
export const groupedInput = (raw: string, digits = 2) => money.formatGroupedInput(raw, { maxDigits: digits });
/** Alandaki metni sayıya çevirir; boş ya da geçersizse null. */
export function parseField(text: string): number | null {
  const trimmed = text.trim();
  return trimmed ? money.parseNumber(trimmed) : null;
}
/** Sayıyı alan metnine çevirir (1250.5 → "1.250,5"); sondaki sıfırlar atılır. */
export function fieldText(value: number, digits = 2): string {
  const text = money.fmtDecimalGrouped(value, digits);
  return text.includes(",") ? text.replace(/0+$/, "").replace(/,$/, "") : text;
}

export const quantityText = (quantity: number) => money.decimal(quantity, 3);
export const vatLabel = (rate: number) => `KDV · ${formatPercent(rate, 0)}`;
export const countText = (count: number) => formatNumber(count, 0);

export interface ItemProblem { id: string; message: string }
/** Kayıt öncesi doğrulama: açıklaması boş kalem. */
export function validateItems(items: Pick<InvoiceItem, "id" | "description">[]): ItemProblem[] {
  return items.filter(item => !item.description.trim()).map(item => ({ id: item.id, message: "Her kalem için açıklama girin" }));
}
