// Galerinin okuduğu katalog verisi ve ortak türler. Kaynak scripts/catalog.mjs; burada elle bileşen yazılmaz.
import { categories, components } from "../../../scripts/catalog.mjs";
import type { CartTheme } from "./cart";

export type Entry = { name: string; title: string; description: string; use: string; note?: string; deps: string[] };
export type Category = { key: string; title: string; description: string; names: string[] };
export const entries = components as Entry[];
export const groups = categories as Category[];
export const entryOf = (name: string) => entries.find(entry => entry.name === name);
export const groupOf = (name: string) => groups.find(group => group.names.includes(name));

/** snn-foundation.css'teki hazır vurgular; amber ve turuncu bilerek yoktur. */
export const ACCENTS: [key: string, title: string][] = [["blue", "Mavi"], ["violet", "Menekşe"], ["green", "Yeşil"], ["coral", "Mercan"], ["rose", "Gül"], ["neutral", "Nötr"]];
export const accentTitles: Record<string, string> = Object.fromEntries(ACCENTS);

/** Sayfaların paylaştığı sepet ve vurgu durumu. */
export interface Shop {
  cart: string[];
  toggle: (name: string) => void;
  inCart: (name: string) => boolean;
  accent: string;
  setAccent: (accent: string) => void;
  cartTheme: CartTheme | null;
  setCartTheme: (theme: CartTheme | null) => void;
  notify: (message: string) => void;
}

/** Panoya kopyalar; izin yoksa false döner, çağıran kullanıcıya söyler. */
export async function copyText(value: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(value); return true; } catch { return false; }
}
