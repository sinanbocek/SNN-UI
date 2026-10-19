// Kullanıcı menüsünün yazarak atlama (typeahead) eşleştirmesi. Saf mantık: React ve CSS içermez; test doğrudan bunu okur.
import { text } from "@snn/abacus-core";

/**
 * Menü öğesinin etiketi yazılan harflerle başlıyor mu? Türkçe harfe duyarsızdır:
 * "i" yazınca "İzinler", "c" yazınca "Çıkış" eşleşir. Boş yazı hiçbir şeyle eşleşmez.
 */
export function matchesTypeahead(label: string | undefined, typed: string): boolean {
  const key = text.searchKey(typed);
  return key !== "" && text.searchKey(label).startsWith(key);
}

/**
 * Tema anahtarında gösterilecek seçenekler. `wanted` sırası korunur; tekrar eden ve bilinmeyen değer atılır.
 * `wanted` verilmezse ya da elde hiç geçerli değer kalmazsa bütün seçenekler döner: anahtar hiç boş çizilmez.
 */
export function pickThemeOptions<T extends { value: string }>(all: readonly T[], wanted?: readonly string[]): T[] {
  const picked = [...new Set(wanted ?? [])].map(value => all.find(option => option.value === value)).filter((option): option is T => option !== undefined);
  return picked.length ? picked : [...all];
}
