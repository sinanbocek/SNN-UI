// Ekip tanıtımının saf mantığı: sayaç, iletişim satırları, kopyalama ve ekranda maskeli telefon. Sayılar ABACUS'tandır.
import { mask, text } from "@snn/abacus-core";
import { countText } from "../lib/shop-format";

/** Sıra sayacı: "2 / 5". */
const counterText = (index: number, count: number): string => `${countText(index + 1)} / ${countText(count)}`;

export type ShowcaseLayout = "gallery" | "filmstrip" | "directory" | "spotlight";
export const LAYOUTS: { value: ShowcaseLayout; label: string }[] = [
  { value: "gallery", label: "Galeri" },
  { value: "filmstrip", label: "Film şeridi" },
  { value: "directory", label: "Dizin" },
  { value: "spotlight", label: "Ön plan" },
];

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  city?: string | undefined;
  country?: string | undefined;
  bio?: string | undefined;
  /** İletişim bilgisi kişi başına isteğe bağlıdır; herkese açık sayfada bilgi kasıtlı verilir. */
  email?: string | undefined;
  phone?: string | undefined;
  /** Verilirse gerçek portre; yoksa baş harfli yer tutucu. */
  portrait?: string | undefined;
  /** Portrenin odak noktası (CSS object-position), örneğin "50% 30%". */
  portraitPosition?: string | undefined;
  tone?: number | undefined;
}

export interface ContactRow { kind: "email" | "phone"; value: string; shown: string; label: string }

/** Profilde gösterilecek iletişim satırları: olmayan gizlenir. `maskPhone` ile ekranda telefon maskelenir, kopyalanan değer gerçeğidir. */
export function contactRows(member: TeamMember, maskPhone = false): ContactRow[] {
  const rows: ContactRow[] = [];
  if (member.email) rows.push({ kind: "email", value: member.email, shown: member.email, label: `${member.name} e-postasını kopyala` });
  if (member.phone) rows.push({ kind: "phone", value: member.phone, shown: maskPhone ? mask.phone(member.phone) : member.phone, label: `${member.name} telefonunu kopyala` });
  return rows;
}

export const placeText = (member: Pick<TeamMember, "city" | "country">): string => [member.city, member.country].filter(Boolean).join(", ");
export const counterLine = (index: number, count: number, name: string): string => `${counterText(index, count)} · ${name}`;
export const profileLive = (member: TeamMember): string => `${member.name}, ${member.title} profili gösteriliyor.`;
export const COPIED = "Kopyalandı";
export const COPY_FAILED = "Kopyalanamadı";

/** Panoya yazar; tarayıcı izin vermezse false döner. */
export async function copyText(value: string): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) return false;
    await navigator.clipboard.writeText(value);
    return true;
  } catch { return false; }
}

/** Portre yer tutucusu için baş harfler (en çok iki), Türkçe büyük harf kurallı. */
export const initials = (name: string): string => name.trim().split(/\s+/).slice(0, 2).map(part => text.upper(part[0] ?? "")).join("");
