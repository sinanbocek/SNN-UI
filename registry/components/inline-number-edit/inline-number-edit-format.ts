// Yerinde sayı/para düzenlemenin yazım ve okuma işleri ABACUS ile. Saf dosya: React yok, test edilir.
import { money } from "@snn/abacus-core";
import { formatNumber, parseDraft } from "../number-input/number-input-format";

export type InlineNumberKind = "number" | "money";

export interface InlineNumberFormat {
  kind: InlineNumberKind;
  /** "number" için en çok ondalık basamak. */
  maxFraction: number;
  /** "money" için birim kodu, ör. "TRY". */
  currency: string;
}

/** Gösterim: sayı "1.234,5"; para kuruştan "₺1.234,50". Boş değer boş metin. */
export function displayText(value: number | null, format: InlineNumberFormat): string {
  if (value === null || !Number.isFinite(value)) return "";
  // eslint-disable-next-line no-restricted-properties -- değer kuruş (alt birim); money.format bilerek kullanılır
  if (format.kind === "money") return money.format(value, { currency: format.currency, kurus: true, zero: "symbol" });
  return formatNumber(value, 0, format.maxFraction);
}

/** Düzenleme metni: simgesiz, binlik ayraçsız ("₺1.234,50" → "1234,50"; "1.234,5" → "1234,5"). */
export function editTextOf(shown: string, format: InlineNumberFormat): string {
  const value = parseText(shown, format);
  if (value === null) return "";
  if (format.kind === "money") return money.formatMinorInput(value, 2).split(".").join("");
  return formatNumber(value, 0, format.maxFraction, false);
}

/** Metni değere çevirir: para kuruş tam sayısı (ABACUS `money.parse`; ikiden çok ondalık okunmaz), sayı ondalıklı. Boş ya da okunamayan metin `null`. */
export function parseText(text: string, format: InlineNumberFormat): number | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (format.kind === "money") return money.parse(trimmed);
  return parseDraft(trimmed.replace(/[^\d.,-]/g, ""));
}
