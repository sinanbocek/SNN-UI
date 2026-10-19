// Sayı kutusunun yazım ve okuma işleri ABACUS `money` ile (giris-alanlari-standardi.md): binlik ".", ondalık ",".
// Saf dosya: React yok, test edilir.
import { math, money } from "@snn/abacus-core";

/**
 * Odak dışındaki gösterim: en az `minFraction`, en çok `maxFraction` ondalık; aradaki sondaki sıfırlar atılır.
 * 1234.5 (0, 2) → "1.234,5"; 3 (2, 2) → "3,00". `grouping: false` binlik ayracını kaldırır; odaktaki ham metin böyle yazılır.
 * İşaret burada yönetilir: ABACUS `fmtDecimalGrouped` -1 ile 0 arasındaki değerde eksiyi düşürüyor (number-field-format.ts ile aynı not).
 */
export function formatNumber(value: number | null, minFraction = 0, maxFraction = minFraction, grouping = true): string {
  if (value === null || !Number.isFinite(value)) return "";
  const rounded = math.round(value, maxFraction);
  let text = money.fmtDecimalGrouped(math.abs(rounded), maxFraction);
  if (maxFraction > minFraction && text.includes(",")) {
    const [whole = "", fraction = ""] = text.split(",");
    const kept = fraction.replace(/0+$/, "").padEnd(minFraction, "0");
    text = kept ? `${whole},${kept}` : whole;
  }
  if (!grouping) text = text.split(".").join("");
  return rounded < 0 ? `-${text}` : text;
}

/** Yazılırken yalnız rakam, nokta, tek virgül ve (izinliyse) baştaki eksi kalır. Ondalık izni yoksa virgül de düşer. */
export function sanitizeDraft(raw: string, allowFraction: boolean, allowNegative: boolean): string {
  const negative = allowNegative && raw.trim().startsWith("-");
  let comma = false;
  const body = [...raw].filter(char => {
    if (/\d|\./.test(char)) return true;
    if (char === "," && allowFraction && !comma) return (comma = true);
    return false;
  }).join("");
  return negative ? `-${body}` : body;
}

/**
 * Ham metni sayıya çevirir; boş metin `null`dur. Önce Türkçe yazım (ABACUS `parseNumber`: "1.234,5"). Tutmazsa: virgülsüz tek nokta
 * ondalık sayılır ("12.5" → 12,5; klavyenin nokta tuşu), aksi hâlde noktalar binlik sayılıp atılır ("1.23.4" → 1234).
 */
export function parseDraft(draft: string): number | null {
  const text = draft.trim();
  if (!/\d/.test(text)) return null;
  const turkish = money.parseNumber(text);
  if (turkish !== null) return turkish;
  const dots = text.split(".").length - 1;
  if (dots === 1 && !text.includes(",")) return money.parseNumber(text.replace(".", ","));
  return money.parseNumber(text.split(".").join(""));
}

/** İşlenecek değer: sınırlara sıkıştırılır, ondalık sınırına yuvarlanır. */
export function settleValue(value: number | null, min: number, max: number, maxFraction: number): number | null {
  if (value === null) return null;
  return math.round(Math.min(max, Math.max(min, value)), maxFraction) || 0;
}
