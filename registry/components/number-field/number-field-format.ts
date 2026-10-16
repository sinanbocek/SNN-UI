// Sayı alanının yazım ve okuma işleri ABACUS `money` ile (giris-alanlari-standardi.md). Arc tarayıcının yerel biçimleyicisini,
// onun parçalara ayırma işlevini ve toFixed'i kullanıyordu; burada ayraçlar Türkçedir (binlik ".", ondalık ",").
// Saf dosya: React yok, test edilir.
import { math, money } from "@snn/abacus-core";

/** Sayının bir sütunu: rakam (çark olarak döner) ya da ayraç ve eksi işareti. */
export type Part = { key: string; digit: number } | { key: string; text: string };

/**
 * Sayıyı yazar: en az `minFraction`, en çok `maxFraction` ondalık; aradaki sondaki sıfırlar atılır.
 * 1234.5 (1, 2) → "1.234,5"; 3 (2, 2) → "3,00"; -0.5 (1, 1) → "-0,5". `grouping: false` binlik ayracını kaldırır.
 * İşaret burada yönetilir: ABACUS `fmtDecimalGrouped` -1 ile 0 arasındaki değerde eksiyi düşürüyor (chart-format.ts ile aynı not).
 */
export function formatValue(value: number, minFraction = 0, maxFraction = minFraction, grouping = true): string {
  if (!Number.isFinite(value)) return "—";
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

/** Yazılı sayıyı basamak değerine göre anahtarlı sütunlara böler; 9 → 10 olunca birler sütunu birler sütunu kalır. */
export function partsOf(text: string): Part[] {
  const comma = text.indexOf(",");
  const intEnd = comma === -1 ? text.length : comma;
  let place = [...text.slice(0, intEnd)].filter(char => /\d/.test(char)).length;
  let fraction = 0;
  return [...text].map((char, index): Part => {
    if (/\d/.test(char)) return index < intEnd ? { key: `i${--place}`, digit: Number(char) } : { key: `f${fraction++}`, digit: Number(char) };
    return { key: char === "." ? `g${place}` : char === "," ? "d" : char === "-" ? "m" : `s${index}`, text: char };
  });
}

/** Taslağı sayıya okur (ABACUS `parseNumber`): "1.234,5" → 1234.5, "-12" → -12. Yazılırken sondaki virgül ("12,") 12 sayılır. Okunamazsa `null`. */
export function parseDraft(draft: string): number | null {
  const trimmed = draft.trim().replace(/,$/, "");
  if (!/\d/.test(trimmed)) return null;
  return money.parseNumber(trimmed);
}

/**
 * Yazılan metni canlı biçimler (ABACUS `formatGroupedInput`): rakamlar gruplanır, ondalık en çok `maxFraction` hane kalır.
 * Ondalık izinliyse nokta tuşu da ondalık ayracı sayılır; `previous` kutunun önceki metnidir, onun binlik noktaları ondalık sanılmaz.
 * Eksi yalnız `allowNegative` iken ve başta tutulur.
 */
export function formatDraft(raw: string, maxFraction: number, allowNegative: boolean, previous?: string, grouping = true): string {
  const negative = allowNegative && raw.trim().startsWith("-");
  const strip = (text: string) => text.replace(/-/g, "");
  const body = money.formatGroupedInput(strip(raw), { maxDigits: maxFraction, ...(maxFraction > 0 ? { dotAsDecimal: true, previous: previous === undefined ? undefined : strip(previous) } : {}) });
  const shown = grouping ? body : body.split(".").join("");
  return negative ? `-${shown}` : shown;
}

/** İmleç konumu için anlamlı karakterler: rakam, ondalık virgülü ve eksi. Binlik noktası sayılmaz, çünkü gruplama onu taşır. */
export const significantBefore = (text: string, caret: number) => [...text.slice(0, caret)].filter(char => /[\d,-]/.test(char)).length;

/** `count` anlamlı karakterden sonraki imleç konumu. */
export function caretAfter(text: string, count: number) {
  if (count <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index++) if (/[\d,-]/.test(text[index]!) && ++seen === count) return index + 1;
  return text.length;
}

/** Açıklama metnindeki bir sözcüğün sayısı ("₺1.234,5" → 1234.5); sözcük sayı değilse `null`. Sözcük yönü buna göre seçilir. */
export const numberInWord = (word?: string) => (word ? parseDraft(word.replace(/[^\d.,-]/g, "")) : null);
