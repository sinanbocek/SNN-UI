// Karşılama bölümünün e-posta mantığı: yazarken süzme, sakin doğrulama ve yazım düzeltme önerisi. Sayılar ABACUS'tandır.
// Kural: giris-alanlari-standardi.md (yazarken boşluk kırp ve küçük harfe çevir; kaydederken doğrulama motorunu çağır).
import { text, validate } from "@snn/abacus-core";
import { countText } from "../lib/shop-format";

/** E-posta yazarken süzme: boşluklar atılır, ASCII küçük harfe çevrilir (Türkçe büyük I küçük ı olmaz). */
export function cleanEmail(raw: string): string {
  return text.toAsciiLower(raw.replace(/\s+/g, ""));
}

/** Kaydetmeden önce doğrulama: belirli bir ileti ya da geçerliyse null. İlk yazılırken çağrılmaz (alandan çıkınca ya da gönderince). */
export function emailProblem(email: string): string | null {
  if (!email) return "E-posta adresinizi yazın.";
  if (!email.includes("@")) return "Adreste @ işareti eksik.";
  const [name, domain = ""] = email.split("@") as [string, string?];
  if (!name) return "@ işaretinden önce bir ad yazın.";
  if (!domain || !domain.includes(".") || domain.startsWith(".") || domain.endsWith(".")) return "Alan adı tamamlanmamış (örneğin ad@site.com).";
  return validate.email(email) ? null : "Geçerli bir e-posta adresi girin.";
}

/** Sık yapılan alan adı yazım hataları ve doğruları. */
const TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gamil.com": "gmail.com", "gnail.com": "gmail.com", "gmail.con": "gmail.com", "gmail.co": "gmail.com", "gmai.com": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "hotmail.con": "hotmail.com", "hotnail.com": "hotmail.com",
  "outlok.com": "outlook.com", "outloook.com": "outlook.com", "outlook.con": "outlook.com",
  "yahooo.com": "yahoo.com", "yaho.com": "yahoo.com", "yahoo.con": "yahoo.com",
  "icloud.con": "icloud.com", "iclod.com": "icloud.com",
};

/** Bilinen bir yazım hatası varsa düzeltilmiş adresi döndürür, yoksa null. */
export function suggestEmail(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const fixed = TYPOS[email.slice(at + 1)];
  return fixed ? `${email.slice(0, at)}@${fixed}` : null;
}

export const suggestionText = (suggestion: string): string => `Şunu mu demek istediniz: ${suggestion}?`;
export const peopleText = (count: number): string => `${countText(count)} kişi listede`;
export const rankSentence = (position: number): string => `Listede ${countText(position)}. sıradasınız`;
export const SUBMIT_LABELS = { full: "Listeye katıl", short: "Katıl", busy: "Gönderiliyor", retry: "Tekrar dene" } as const;
