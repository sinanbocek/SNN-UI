// Sayacın saf biçim mantığı: biçimli sayıyı basamak sütunlarına böler. React ve CSS içermez; test doğrudan bunu okur.
import { money } from "@snn/abacus-core";

export type CounterPart = { key: string; digit: number; order: number } | { key: string; text: string };

/** Sayıyı ABACUS ile yazar: binlik ayracı nokta, ondalık ayracı virgül ("1.234,5"). Geçersiz sayıda "—". */
export function counterText(value: number, decimals: number): string {
  return money.fmtDecimalGrouped(value, decimals);
}

/**
 * Biçimli sayıyı basamak değerine göre sütunlara böler; 999 → 1.000 olunca birler sütunu birler sütunu kalır.
 * Rakamlar çark olur, ayraçlar ve eksi işareti düz metin kalır.
 */
export function counterParts(value: number, decimals: number): CounterPart[] {
  const formatted = counterText(value, decimals);
  if (formatted === "—") return [{ key: "empty", text: formatted }];
  const comma = formatted.indexOf(",");
  let place = (comma === -1 ? formatted : formatted.slice(0, comma)).replace(/\D/g, "").length;
  let fraction = 0;
  let order = 0;
  let afterComma = false;
  return [...formatted].map((char, index): CounterPart => {
    if (char === ",") { afterComma = true; return { key: "d", text: char }; }
    if (char === ".") return { key: `g${place}`, text: char };
    if (char === "-") return { key: `s${index}`, text: char };
    return afterComma ? { key: `f${fraction++}`, digit: Number(char), order: order++ } : { key: `i${--place}`, digit: Number(char), order: order++ };
  });
}
