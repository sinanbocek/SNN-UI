// Sepetin saf mantığı: AI'a verilecek metni, kurulum komutunu ve paylaşım bağlantısını üretir.
// React içermez; test/galeri.test.mjs doğrudan bunu okur.
import { accentCss, parseColor, toHex } from "./color";

export const SITE_URL = "https://snn-ui.web.app";

/** Sepetteki tema: hazır vurgu (data-accent) ya da renk kodundan üretilen özel vurgu. */
export type CartTheme = { kind: "preset"; key: string; title: string } | { kind: "custom"; hex: string };
export interface CartItem { name: string; title: string }
/** Sepetteki yazı tipi takımı (snn-font-*); varsayılan takım sepete girmez, temel değişkenlerle zaten gelir. */
export interface CartFont { key: string; title: string }

export const installCommand = (names: string[]) => names.length ? `npx shadcn@latest add ${names.map(name => `@snn-ui/${name}`).join(" ")}` : "";

function themeLines(theme: CartTheme | null): string[] {
  if (!theme) return [];
  if (theme.kind === "preset") return ["", `Tema: <html data-accent="${theme.key}"> (${theme.title}). Koyu tema için data-theme="dark".`];
  const rgb = parseColor(theme.hex);
  if (!rgb) return [];
  return ["", `Tema: özel vurgu ${toHex(rgb)}. <html data-accent="custom"> yaz ve snn-foundation.css'ten SONRA şu CSS'i yükle:`, "", "```css", accentCss(rgb), "```"];
}

/** AI'a yapıştırılacak tam metin: ne kurulacak, nasıl kurulacak, hangi tema. */
export function buildPrompt(items: CartItem[], theme: CartTheme | null, registryUrl: string, font: CartFont | null = null): string {
  if (!items.length && !theme && !font) return "";
  const lines = [`SNN-UI kataloğundan (${SITE_URL}) bu projeye şunları kur:`];
  for (const item of items) lines.push(`- ${item.title} (@snn-ui/${item.name})`);
  if (font) lines.push(`- Yazı tipi takımı: ${font.title} (@snn-ui/snn-font-${font.key})`);
  const names = [...items.map(item => item.name), ...(font ? [`snn-font-${font.key}`] : [])];
  if (names.length) {
    lines.push("", "Kurulum:", "", "```bash", installCommand(names), "```",
      "", `components.json içinde "@snn-ui" kaydı yoksa önce ekle: { "registries": { "@snn-ui": "${registryUrl}" } }`,
      `Temel değişkenleri uygulama girişinde bir kez içe aktar: import "@/components/snn/snn-foundation.css";`);
  }
  lines.push(...themeLines(theme));
  if (font) lines.push("", `Yazı tipi: temel değişkenlerden sonra import "@/components/snn/snn-font-${font.key}.css"; ekle ve <html data-font="${font.key}"> yaz (${font.title}: başlık, gövde ve kod yazı tipi birlikte değişir).`);
  lines.push("", "Kullanım örnekleri ve notlar SNN-UI deposundaki AI/katalog.md dosyasındadır. Bileşenin kopyasını yazma; katalogdakini kur.");
  return lines.join("\n");
}

/** Paylaşım bağlantısının kare işaretinden sonraki kısmı: "#/sepet?b=line-chart,avatar&renk=blue&yazi=plex" ya da "renk=%232F6FEB". */
export function shareHash(names: string[], theme: CartTheme | null, font: CartFont | null = null): string {
  const params = new URLSearchParams();
  if (names.length) params.set("b", names.join(","));
  if (theme) params.set("renk", theme.kind === "preset" ? theme.key : theme.hex);
  if (font) params.set("yazi", font.key);
  return `#/sepet?${params.toString().replace(/%2C/g, ",")}`;
}

/** Paylaşım bağlantısını okur. Bilinmeyen bileşen adları ve geçersiz renk atılır. */
export function parseShare(hash: string, known: Set<string>, presets: Record<string, string>, fonts: Record<string, string> = {}): { names: string[]; theme: CartTheme | null; font: CartFont | null } | null {
  const match = hash.match(/^#\/sepet\?(.*)$/);
  if (!match) return null;
  const params = new URLSearchParams(match[1]);
  const names = [...new Set((params.get("b") ?? "").split(",").map(name => name.trim()).filter(name => known.has(name)))];
  const color = params.get("renk");
  let theme: CartTheme | null = null;
  if (color && presets[color]) theme = { kind: "preset", key: color, title: presets[color]! };
  else if (color) { const rgb = parseColor(color); if (rgb) theme = { kind: "custom", hex: toHex(rgb) }; }
  const fontKey = params.get("yazi");
  const font = fontKey && fonts[fontKey] ? { key: fontKey, title: fonts[fontKey]! } : null;
  return { names, theme, font };
}
