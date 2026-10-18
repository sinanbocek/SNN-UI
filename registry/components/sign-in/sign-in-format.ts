// Giriş bloğunun saf mantığı: e-posta denetimi, alan adı düzeltme önerisi, adres ve addan hesap kurma.
// React ve CSS içermez; test doğrudan bunu okur.
import { text } from "@snn/abacus-core";

export interface SignInAccount { name: string; email: string; photo?: string | undefined }

/** Sık yapılan alan adı yazım hataları ve doğruları. */
const domainFixes: Record<string, string> = { "gmial.com": "gmail.com", "gamil.com": "gmail.com", "gmai.com": "gmail.com", "gnail.com": "gmail.com", "gmail.co": "gmail.com", "hotmial.com": "hotmail.com", "outlok.com": "outlook.com", "outlook.co": "outlook.com", "iclod.com": "icloud.com", "icoud.com": "icloud.com", "yaho.com": "yahoo.com" };

/**
 * E-posta adresini küçültür. ABACUS `text.toAsciiLower`: adresler ASCII olduğundan I harfi ı değil i olur;
 * Türkçe kuralı ("I" → "ı") "EMAIL@..." adresini bozardı.
 */
export const emailKey = (value: string) => text.toAsciiLower(value.trim());

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Alan adında yazım hatası varsa düzeltilmiş adresi döndürür, yoksa boş metin. */
export function suggestionFor(value: string): string {
  const [local, domain, extra] = emailKey(value).split("@");
  return local && domain && extra === undefined && domainFixes[domain] ? `${local}@${domainFixes[domain]}` : "";
}

/** Adresin yerel kısmından ad kurar: "ismail.yilmaz@..." → "İsmail Yilmaz" (ilk iki parça, Türkçe baş harf). */
export function nameFromEmail(email: string, fallback = "SNN üyesi"): string {
  const parts = text.lower(email.trim()).split("@")[0]!.split(/[._+-]+/).filter(Boolean);
  return parts.slice(0, 2).map(part => text.title(part)).join(" ") || fallback;
}

/** Tanıdık kişinin fotoğrafını korur; diğerleri adresten kurulan adla ve baş harf simgesiyle gelir. */
export function accountFor(value: string, people: SignInAccount[], fallback = "SNN üyesi"): SignInAccount {
  const email = emailKey(value);
  const first = text.searchKey(email.split("@")[0]!.split(/[._+-]+/).filter(Boolean)[0]);
  const known = first ? people.find(person => text.searchKey(person.name).split(" ")[0] === first) : undefined;
  if (known) return { ...known, email };
  return { name: nameFromEmail(email, fallback), email };
}
