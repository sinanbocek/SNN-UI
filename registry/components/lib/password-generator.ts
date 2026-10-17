// Parola üretiminin saf mantığı: karakter kümeleri, tarafsız rastgele sayı, üretim. React içermez; test bunu okur.
// password-strength ve password-field kullanır (snn-password-generator).
/** Parola üreticisinin karakter kümeleri. Yalnız ASCII: Türkçe harfler (ğ, ş, ı) her klavyede ve her sistemde yazılamaz. */
export const PASSWORD_CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/~",
} as const;

export type PasswordCharset = keyof typeof PASSWORD_CHARSETS;

export interface PasswordGeneratorOptions {
  /** Karakter sayısı; 4 ile 128 arasına sıkıştırılır. */
  length: number;
  /** Kullanılacak kümeler. Seçilen her kümeden en az bir karakter bulunur. */
  sets: PasswordCharset[];
}

export const PASSWORD_LENGTH_MIN = 4;
export const PASSWORD_LENGTH_MAX = 128;

/** 0 ile max-1 arasında tarafsız rastgele tam sayı: Web Crypto ve reddetme örneklemesi (mod sapması yok). */
export function secureRandomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    if (buffer[0]! < limit) return buffer[0]! % max;
  }
}

/**
 * Cihazda rastgele parola üretir; hiçbir yere gönderilmez. Seçilen her kümeden bir karakter konur, kalan uzunluk
 * kümelerin birleşiminden doldurulur ve sonuç karıştırılır. Küme seçilmemişse boş döner. `random` test içindir.
 */
export function generatePassword({ length, sets }: PasswordGeneratorOptions, random: (max: number) => number = secureRandomInt): string {
  const chosen = [...new Set(sets)].filter(set => set in PASSWORD_CHARSETS);
  if (!chosen.length) return "";
  const size = Math.min(PASSWORD_LENGTH_MAX, Math.max(PASSWORD_LENGTH_MIN, Math.round(length)));
  const pool = chosen.map(set => PASSWORD_CHARSETS[set]).join("");
  const pick = (from: string) => from[random(from.length)]!;
  const chars = chosen.map(set => pick(PASSWORD_CHARSETS[set]));
  while (chars.length < size) chars.push(pick(pool));
  // Fisher-Yates karıştırması: zorunlu karakterler hep başta durmasın.
  for (let index = chars.length - 1; index > 0; index--) {
    const other = random(index + 1);
    [chars[index], chars[other]] = [chars[other]!, chars[index]!];
  }
  return chars.join("");
}
