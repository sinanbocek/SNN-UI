// Renk seçicinin saf renk okuma/yazma ve karşıtlık mantığı. Arayüzden bağımsızdır; test/color-picker.test.mjs bunu sınar.
// Harf büyütme/küçültme ABACUS `text.upper` / `text.lower` ile yapılır (Türkçe İ/ı doğru); oran ABACUS ile "4,56" yazılır.
import { math, money, text } from "@snn/abacus-core";

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";
/** Ton 0-360, doygunluk/parlaklık/saydamlık 0-1. */
export type Hsva = { h: number; s: number; v: number; a: number };
/** sRGB kanalları 0 ile 1 arası. */
export type Rgba = { r: number; g: number; b: number; a: number };

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const round = (value: number, digits = 0) => { const f = 10 ** digits; return Math.round(value * f) / f; };

/* Renk matematiği. sRGB kanalları 0 ile 1 arası. */
export function hsvToRgb({ h, s, v, a }: Hsva): Rgba {
  const f = (n: number) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return { r: f(5), g: f(3), b: f(1), a };
}
export function rgbToHsv({ r, g, b, a }: Rgba, hue = 0): Hsva {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = hue;
  if (d > 1e-6) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max, a };
}
function hslToRgb(h: number, s: number, l: number, a: number): Rgba {
  const k = (n: number) => (n + h / 30) % 12, c = s * Math.min(l, 1 - l);
  const f = (n: number) => l - c * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return { r: f(0), g: f(8), b: f(4), a };
}
function rgbToHsl({ r, g, b }: Rgba, hue: number) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const s = d < 1e-6 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: d < 1e-6 ? hue : rgbToHsv({ r, g, b, a: 1 }).h, s, l };
}
export const toLinear = (c: number) => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
const fromLinear = (c: number) => c <= .0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - .055;
function rgbToOklch({ r, g, b }: Rgba, hue: number) {
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
  const l = Math.cbrt(.4122214708 * lr + .5363325363 * lg + .0514459929 * lb);
  const m = Math.cbrt(.2119034982 * lr + .6806995451 * lg + .1073969566 * lb);
  const s = Math.cbrt(.0883024619 * lr + .2817188376 * lg + .6299787005 * lb);
  const L = .2104542553 * l + .793617785 * m - .0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s;
  const B = .0259040371 * l + .7827717662 * m - .808675766 * s;
  const C = Math.hypot(A, B);
  let H = Math.atan2(B, A) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: C < .0005 ? hue : H };
}
function oklchToRgb(L: number, C: number, H: number, a: number): Rgba {
  const A = C * Math.cos(H * Math.PI / 180), B = C * Math.sin(H * Math.PI / 180);
  const l = (L + .3963377774 * A + .2158037573 * B) ** 3;
  const m = (L - .1055613458 * A - .0638541728 * B) ** 3;
  const s = (L - .0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: clamp(fromLinear(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s)),
    g: clamp(fromLinear(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s)),
    b: clamp(fromLinear(-.0041960863 * l - .7034186147 * m + 1.707614701 * s)),
    a,
  };
}
export const byte = (c: number) => Math.round(clamp(c) * 255);
// `toString(16)` yalnız 0-9 ve a-f üretir; büyütme yine de ABACUS ile yapılır.
const hex2 = (c: number) => text.upper(byte(c).toString(16).padStart(2, "0"));

export function toHex(hsva: Hsva) {
  const { r, g, b, a } = hsvToRgb(hsva);
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${a < .999 ? hex2(a) : ""}`;
}
/** Rengi seçilen biçimde yazar: hex, rgb(), hsl() ya da oklch(). */
export function formatColor(hsva: Hsva, kind: ColorFormat) {
  const rgb = hsvToRgb(hsva);
  const alpha = hsva.a < .999 ? ` / ${Math.round(hsva.a * 100)}%` : "";
  if (kind === "hex") return toHex(hsva);
  if (kind === "rgb") return `rgb(${byte(rgb.r)} ${byte(rgb.g)} ${byte(rgb.b)}${alpha})`;
  if (kind === "hsl") { const { h, s, l } = rgbToHsl(rgb, hsva.h); return `hsl(${Math.round(h) % 360} ${Math.round(s * 100)}% ${Math.round(l * 100)}%${alpha})`; }
  const { l, c, h } = rgbToOklch(rgb, hsva.h);
  return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(h, 1) % 360}${alpha})`;
}
const readAlpha = (value?: string) => value === undefined ? 1 : value.endsWith("%") ? clamp(parseFloat(value) / 100) : clamp(parseFloat(value));

/** hex, rgb(), hsl() ve oklch() değerlerini yeni ya da virgüllü sözdiziminde okur; çıplak "238, 238, 238" da rgb sayılır. Başka her şey için null döner. */
export function parseColor(input: string, hue = 0): Hsva | null {
  const value = text.lower(input.trim());
  let match = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(value);
  if (match) {
    let digits = match[1]!;
    if (digits.length <= 4) digits = digits.split("").map(d => d + d).join("");
    const n = (i: number) => parseInt(digits.slice(i, i + 2), 16) / 255;
    return rgbToHsv({ r: n(0), g: n(2), b: n(4), a: digits.length === 8 ? n(6) : 1 }, hue);
  }
  match = /^(?:rgba?\(\s*)?([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)?$/.exec(value);
  // Parantezler eşleşmeli: ya ikisi de var ya da ikisi de yok.
  if (match && value.includes("(") === value.includes(")")) return rgbToHsv({ r: clamp(+match[1]! / 255), g: clamp(+match[2]! / 255), b: clamp(+match[3]! / 255), a: readAlpha(match[4]) }, hue);
  match = /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/.exec(value);
  if (match) {
    const h = +match[1]! % 360;
    const next = rgbToHsv(hslToRgb(h, clamp(+match[2]! / 100), clamp(+match[3]! / 100), readAlpha(match[4])), h);
    return { ...next, h };
  }
  match = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(value);
  if (match) {
    const L = match[2] ? +match[1]! / 100 : +match[1]!;
    return rgbToHsv(oklchToRgb(clamp(L), +match[3]!, +match[4]!, readAlpha(match[5])), hue);
  }
  return null;
}

/** Rengin, arka plan üzerine bindirilmiş hâlinin o arka plana göre WCAG karşıtlık oranı. */
export function contrast(hsva: Hsva, background: Rgba) {
  const fg = hsvToRgb(hsva);
  const mix = (c: number, bg: number) => c * fg.a + bg * (1 - fg.a);
  const lum = (r: number, g: number, b: number) => .2126 * toLinear(r) + .7152 * toLinear(g) + .0722 * toLinear(b);
  const a = lum(mix(fg.r, background.r), mix(fg.g, background.g), mix(fg.b, background.b)), b = lum(background.r, background.g, background.b);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
/**
 * Rengin üstündeki yazı için koyu ya da açık seçer: hangisi daha yüksek WCAG karşıtlığı veriyorsa. Saydam renk `background` üstüne bindirilir.
 * Vurgu rengi çok açıksa (ör. açık mavi) koyu yazı döner. Okunamayan renkte açık yazı döner.
 */
export function readableForeground(color: string, background: Rgba = { r: 1, g: 1, b: 1, a: 1 }, dark = "#111111", light = "#FFFFFF"): string {
  const parsed = parseColor(color);
  if (!parsed) return light;
  const fg = hsvToRgb(parsed);
  const mix = (c: number, bg: number) => c * fg.a + bg * (1 - fg.a);
  const surface = { r: mix(fg.r, background.r), g: mix(fg.g, background.g), b: mix(fg.b, background.b), a: 1 };
  const against = (text: string) => contrast(parseColor(text)!, surface);
  return against(dark) >= against(light) ? dark : light;
}
/** WCAG düzeyi: "AAA", "AA", "AA büyük" (yalnız büyük yazı) ya da "Geçmedi". */
export const level = (ratio: number) => ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA büyük" : "Geçmedi";
/** Karşıtlık oranını Türkçe ondalıkla yazar: 4.5632 → "4,56". */
export const formatRatio = (ratio: number) => money.fmtDecimalGrouped(math.round(ratio, 2), 2);
