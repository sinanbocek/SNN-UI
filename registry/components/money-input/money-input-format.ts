// Para kutusunun yazım ve okuma işleri ABACUS `money` ile (giris-alanlari-standardi.md). Arc para birimi simgesini, adını
// ve ayraçları tarayıcının yerel biçimleyicisinden alıyordu; burada ayraçlar Türkçedir (binlik ".", ondalık ",") ve
// birimler sabit bir tablodadır. Değer dışarıya kuruş (alt birim) tam sayısı olarak verilir: ₺12,50 → 1250.
// Saf dosya: React yok, test edilir.
import { money, text } from "@snn/abacus-core";

/** Kutunun sunduğu birimler. Üçü de ABACUS'ta yerleşiktir ve iki ondalık hanelidir. */
export type MoneyCurrency = "TRY" | "USD" | "EUR";
export type CurrencyInfo = { code: MoneyCurrency; symbol: string; digits: number; name: string };

const TABLE: Record<MoneyCurrency, CurrencyInfo> = {
  TRY: { code: "TRY", symbol: "₺", digits: 2, name: "Türk lirası" },
  USD: { code: "USD", symbol: "$", digits: 2, name: "ABD doları" },
  EUR: { code: "EUR", symbol: "€", digits: 2, name: "Euro" },
};
export const MONEY_CURRENCIES = Object.keys(TABLE) as MoneyCurrency[];

/** Ayraçlar sabit Türkçedir: 1.234,56. */
export const SYMBOLS = { group: ".", decimal: "," } as const;

/** Birim bilgisi; tanınmayan kod TRY'ye düşer. */
export const currencyInfo = (code: string): CurrencyInfo => TABLE[code as MoneyCurrency] ?? TABLE.TRY;

/** Kuruşu simgeli ve kuruşlu yazar: 123450, "TRY" → "₺1.234,50"; sıfır da simgeli yazılır ("₺0,00"). */
export const formatAmount = (minor: number, code: string) => money.format(minor, { currency: currencyInfo(code).code, kurus: true, zero: "symbol" });

/** Ana birimdeki tam tutarı kuruşsuz yazar (hızlı ekle düğmesi): 100, "EUR" → "€100". */
export const formatWhole = (major: number, code: string) => money.formatMajor(major, { currency: currencyInfo(code).code, zero: "symbol" });

/** Ana birimdeki tutarı kuruşa çevirir: 100 → 10000. ABACUS çevirir; kayan nokta hatası olmaz. */
export const majorToMinor = (major: number, code: string) => money.toMinor(major, currencyInfo(code).code);

/**
 * Taslak, yazılan tutarın kanonik biçimidir: rakamlar ve isteğe bağlı tek "." ("1234.5"). Kutunun içinde gösterim için
 * Türkçe ayraçlara çevrilir; burada kuruşa okunur. "12." (ondalık yazılmak üzere) 1200 sayılır. Boş taslak `null`.
 */
export function draftToMinor(draft: string): number | null {
  if (!draft) return null;
  const [whole = "", fraction = ""] = draft.split(".");
  return money.parse(fraction ? `${whole || "0"},${fraction}` : whole || "0");
}

/** Kuruştan taslağa: 123450 → "1234.50". Gösterim ABACUS `formatMinorInput` ile yazılır, ayraçlar taslağa çevrilir. */
export function minorToDraft(minor: number | null | undefined, digits = 2): string {
  if (minor === null || minor === undefined || !Number.isFinite(minor)) return "";
  const shown = money.formatMinorInput(Math.abs(Math.round(minor)), digits);
  return shown === "—" ? "" : shown.split(SYMBOLS.group).join("").replace(SYMBOLS.decimal, ".");
}

/** Yapıştırılan metni taslağa çevirir; ABACUS'un okuduğu her Türkçe biçim kabul edilir ("₺1.234,56", "1234,5", "220,75 USD"). İngilizce biçim ("1,234.56") okunmaz: `null`. */
export function pastedToDraft(pasted: string): string | null {
  const minor = money.parse(pasted.trim());
  return minor === null ? null : minorToDraft(minor);
}

/** Menüde harfle arama: "e" → EUR, "tü" → TRY. Türkçe küçük harf ABACUS `text.lower` ile. */
export function matchesTypeahead(option: CurrencyInfo, buffer: string) {
  const typed = text.lower(buffer);
  return text.lower(option.code).startsWith(typed) || text.lower(option.name).startsWith(typed);
}

/** Aralık satırı: "₺10,00 – ₺500,00", "En çok ₺500,00", "En az ₺10,00". */
export function rangeText(code: string, min?: number, max?: number) {
  if (min !== undefined && max !== undefined) return `${formatAmount(min, code)} – ${formatAmount(max, code)}`;
  if (max !== undefined) return `En çok ${formatAmount(max, code)}`;
  if (min !== undefined) return `En az ${formatAmount(min, code)}`;
  return "";
}
