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
