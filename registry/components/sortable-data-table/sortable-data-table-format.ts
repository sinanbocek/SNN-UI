// Tablonun sıralama ve hücre yazımı ABACUS ile (giris-alanlari-standardi.md). Arc metinleri İngilizce sıralayıcıyla
// karşılaştırıyor ve sayıyı, tarihi düz String ile yazıyordu ("1234.5", "Fri Oct 16 2026"). Burada sıra Türkçe alfabedir
// (ABACUS `collate`: ç c'den, ı i'den önce), para kuruş tam sayısından yazılır, sayı ve tarih Türkçe biçimdedir.
// Saf dosya: React yok, test edilir.
import { collate, date as abacusDate, money } from "@snn/abacus-core";

/** Hücre biçimi. Verilmezse değerin türüne bakılır: sayı → "number", Date → "date", diğerleri metin. */
export type CellFormat = "text" | "number" | "money" | "date";
export type CellCurrency = "TRY" | "USD" | "EUR";
export type CellSpec = { format?: CellFormat | undefined; currency?: CellCurrency | undefined; digits?: number | undefined };

const isEmpty = (value: unknown) => value == null || value === "";
const decimalsOf = (value: number) => (String(value).split(".")[1] ?? "").length;
const isoOf = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

/** İki metni Türkçe alfabeye göre karşılaştırır (ABACUS `collate.compare`): "Çorum" "Denizli"den, "Iğdır" "İzmir"den önce gelir. */
export const compareText = (left: string, right: string) => collate.compare(left, right);

/** Sayıyı binlik ayraçlı yazar; `digits` verilmezse değerin kendi ondalığı (en çok 4) korunur. 1234.5 → "1.234,5", -0.5 → "-0,5". */
export function formatNumberCell(value: number, digits?: number) {
  const places = digits ?? Math.min(4, decimalsOf(value));
  const text = money.fmtDecimalGrouped(Math.abs(value), places);
  return value < 0 && text !== "—" ? `-${text}` : text;
}

/** Hücre değerini yazar. Para kuruştur: 123450 → "₺1.234,50". Tarih Date ya da ISO gündür: "16.10.2026". Boş değer "–". */
export function formatCell(value: unknown, spec: CellSpec = {}): string {
  if (isEmpty(value)) return "–";
  const format = spec.format ?? (typeof value === "number" ? "number" : value instanceof Date ? "date" : "text");
  // eslint-disable-next-line no-restricted-properties -- değer kuruş (alt birim); money.format bilerek kullanılır
  if (format === "money" && typeof value === "number") return money.format(value, { currency: spec.currency ?? "TRY", kurus: true, zero: "symbol" });
  if (format === "number" && typeof value === "number") return formatNumberCell(value, spec.digits);
  if (format === "date") return abacusDate.format(value instanceof Date ? isoOf(value) : String(value), "short");
  return String(value);
}

/** Sayfa sayısı: 48 kayıt, 10'ar → 5. Sayfa boyu yoksa ya da geçersizse 1. */
export const pageCountOf = (total: number, pageSize?: number) => (pageSize && pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1);

/** Sayfanın kapsadığı kayıtlar: "11–20". Sayılar ABACUS ile gruplanır ("1.001–1.010"). */
export function pageSpan(page: number, pageSize: number, total: number) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(total, page * pageSize);
  return `${money.fmtDecimalGrouped(start)}–${money.fmtDecimalGrouped(end)}`;
}

/** Sayfa satırı: "11–20 / 48 kayıt". Seçim satırı toplamı zaten söylüyorsa yalnız `pageSpan` yazılır. */
export const rangeLabel = (page: number, pageSize: number, total: number, noun: string) => `${pageSpan(page, pageSize, total)} / ${money.fmtDecimalGrouped(total)} ${noun}`;

/** Sıralama duyurusu: "Tutar sütununa göre azalan sıralandı". */
export const sortAnnouncement = (label: string, direction: "asc" | "desc") => `${label} sütununa göre ${direction === "asc" ? "artan" : "azalan"} sıralandı`;
