// Galerinin okuduğu katalog verisi ve ortak türler. Kaynak scripts/catalog.mjs; burada elle bileşen yazılmaz.
import { categories, components } from "../../../scripts/catalog.mjs";
import type { CartFont, CartTheme } from "./cart";

export type Entry = { name: string; title: string; description: string; use: string; note?: string; deps: string[] };
export type Category = { key: string; title: string; description: string; names: string[] };
export const entries = components as Entry[];
export const groups = categories as Category[];
export const entryOf = (name: string) => entries.find(entry => entry.name === name);
export const groupOf = (name: string) => groups.find(group => group.names.includes(name));

/** snn-foundation.css'teki hazır vurgular; amber ve turuncu bilerek yoktur. */
export const ACCENTS: [key: string, title: string][] = [["blue", "Mavi"], ["violet", "Menekşe"], ["green", "Yeşil"], ["coral", "Mercan"], ["rose", "Gül"], ["neutral", "Nötr"]];
export const accentTitles: Record<string, string> = Object.fromEntries(ACCENTS);

/** Yazı tipi takımları: anahtar `data-font` değeridir; "default" temel değişkenlerin kendisidir. Aile adları önizleme kartı içindir. */
export interface FontSet { key: string; title: string; display: string; body: string; mono: string; families: { display: string; body: string; mono: string }; use: string }
export const FONT_SETS: FontSet[] = [
  { key: "default", title: "Varsayılan", display: "Geist", body: "Inter", mono: "Geist Mono", families: { display: '"Geist Variable"', body: '"Inter Variable"', mono: '"Geist Mono Variable"' }, use: "Genel uygulamalar; bugünkü görünüm." },
  { key: "plex", title: "Kurumsal", display: "IBM Plex Sans", body: "IBM Plex Sans", mono: "IBM Plex Mono", families: { display: '"IBM Plex Sans Variable"', body: '"IBM Plex Sans Variable"', mono: '"IBM Plex Mono"' }, use: "Finans, portföy, tablolar; rakamlar çok net." },
  { key: "modern", title: "Modern", display: "Plus Jakarta Sans", body: "Inter", mono: "JetBrains Mono", families: { display: '"Plus Jakarta Sans Variable"', body: '"Inter Variable"', mono: '"JetBrains Mono Variable"' }, use: "Vitrin, karşılama ve ürün sayfaları." },
  { key: "document", title: "Belge", display: "Source Serif 4", body: "Source Sans 3", mono: "Source Code Pro", families: { display: '"Source Serif 4 Variable"', body: '"Source Sans 3 Variable"', mono: '"Source Code Pro Variable"' }, use: "Teklif, şartname, rapor; basılı belge görünümü." },
  { key: "soft", title: "Yumuşak", display: "Manrope", body: "DM Sans", mono: "Geist Mono", families: { display: '"Manrope Variable"', body: '"DM Sans Variable"', mono: '"Geist Mono Variable"' }, use: "Kişisel uygulamalar, oyun, topluluk." },
];
export const fontTitles: Record<string, string> = Object.fromEntries(FONT_SETS.filter(set => set.key !== "default").map(set => [set.key, set.title]));

/** Sayfaların paylaştığı sepet ve vurgu durumu. */
export interface Shop {
  cart: string[];
  toggle: (name: string) => void;
  inCart: (name: string) => boolean;
  accent: string;
  setAccent: (accent: string) => void;
  cartTheme: CartTheme | null;
  setCartTheme: (theme: CartTheme | null) => void;
  /** Galerinin şu anki yazı tipi takımı ("default" ya da snn-font-* anahtarı). */
  font: string;
  setFont: (font: string) => void;
  cartFont: CartFont | null;
  setCartFont: (font: CartFont | null) => void;
  notify: (message: string) => void;
}

/** Panoya kopyalar; izin yoksa false döner, çağıran kullanıcıya söyler. */
export async function copyText(value: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(value); return true; } catch { return false; }
}
