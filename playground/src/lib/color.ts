// Renk laboratuvarının saf hesapları: renk kodunu okur, OKLCH'ye çevirir, basamak ve alternatif üretir, vurgu değişkenlerini yazar.
// React ve CSS içermez; test/galeri.test.mjs doğrudan bunu okur. Amber sınırı amber testiyle aynı dosyadan gelir.
import { math, money } from "@snn/abacus-core";
import { AMBER_HUE_MAX, AMBER_HUE_MIN, NEUTRAL_CHROMA, rgbToOklch } from "../../../scripts/color-hue.mjs";

export interface Rgb { r: number; g: number; b: number }
export interface Oklch { l: number; c: number; h: number }

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const byte = (channel: number) => Math.round(clamp01(channel) * 255);

/** "#EEE", "#EEEEEE", "EEEEEE", "rgb(238, 238, 238)", "238,238,238" ya da "238 238 238" okur. Okunamazsa null. */
export function parseColor(input: string): Rgb | null {
  const value = input.trim();
  const hex = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits = hex[1]!.length === 3 ? [...hex[1]!].map(digit => digit + digit).join("") : hex[1]!;
    return { r: parseInt(digits.slice(0, 2), 16), g: parseInt(digits.slice(2, 4), 16), b: parseInt(digits.slice(4, 6), 16) };
  }
  const rgb = value.match(/^(?:rgba?\(\s*)?(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/]\s*[\d.]+%?\s*)?\)?$/i);
  if (!rgb) return null;
  const channels = [rgb[1], rgb[2], rgb[3]].map(Number);
  if (channels.some(channel => channel > 255)) return null;
  return { r: channels[0]!, g: channels[1]!, b: channels[2]! };
}

export const toHex = ({ r, g, b }: Rgb) => `#${[r, g, b].map(channel => channel.toString(16).padStart(2, "0")).join("").toUpperCase()}`;

export function toOklch({ r, g, b }: Rgb): Oklch {
  const { lightness, chroma, hue } = rgbToOklch(r / 255, g / 255, b / 255);
  return { l: lightness, c: chroma, h: hue };
}

const linearToSrgb = (channel: number) => channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;

/** OKLCH → sRGB kanalları (0–1, gamut dışında 0–1 aralığını aşabilir). */
function oklchToSrgb({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180), b = c * Math.sin((h * Math.PI) / 180);
  const l1 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m1 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s1 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    linearToSrgb(4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1),
    linearToSrgb(-1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1),
    linearToSrgb(-0.0041960863 * l1 - 0.7034186147 * m1 + 1.707614701 * s1),
  ];
}

const inGamut = (channels: number[]) => channels.every(channel => channel >= -1e-4 && channel <= 1 + 1e-4);

/** OKLCH rengini ekrana sığdırır: açıklık ve ton korunur, doygunluk sığana kadar azaltılır. */
export function fromOklch(color: Oklch): Rgb {
  const l = clamp01(color.l);
  let low = 0, high = Math.max(0, color.c), channels = oklchToSrgb({ l, c: high, h: color.h });
  if (!inGamut(channels)) {
    for (let step = 0; step < 24; step++) {
      const middle = (low + high) / 2, trial = oklchToSrgb({ l, c: middle, h: color.h });
      if (inGamut(trial)) { low = middle; channels = trial; } else high = middle;
    }
    if (!inGamut(channels)) channels = oklchToSrgb({ l, c: low, h: color.h });
  }
  return { r: byte(channels[0]), g: byte(channels[1]), b: byte(channels[2]) };
}

export const oklchHex = (color: Oklch) => toHex(fromOklch(color));

/** CSS'te yazılacak OKLCH metni: "oklch(62% 0.19 255)". */
export const oklchCss = ({ l, c, h }: Oklch) => `oklch(${math.round(l * 100, 1)}% ${math.round(c, 3)} ${math.round(c < NEUTRAL_CHROMA ? 0 : h, 1)})`;

function luminance({ r, g, b }: Rgb) {
  const [lr, lg, lb] = [r, g, b].map(channel => { const value = channel / 255; return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * lr! + 0.7152 * lg! + 0.0722 * lb!;
}

/** WCAG kontrast oranı (1–21). */
export function contrastRatio(first: Rgb, second: Rgb): number {
  const [light, dark] = [luminance(first), luminance(second)].sort((x, y) => y - x);
  return (light! + 0.05) / (dark! + 0.05);
}

/** Kontrast oranının Türkçe yazımı ve WCAG düzeyi: "4,6:1 · AA". */
export function contrastLabel(ratio: number): { text: string; level: "AAA" | "AA" | "Büyük yazı" | "Yetersiz" } {
  const level = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "Büyük yazı" : "Yetersiz";
  return { text: `${money.fmtDecimalGrouped(math.round(ratio, 1), 1)}:1`, level };
}

export const isNeutral = (color: Oklch) => color.c < NEUTRAL_CHROMA;
/** SNN kuralı: OKLCH tonu 50–95 arası doygun renk amber/turuncudur, kullanılmaz. */
export const isAmber = (color: Oklch) => !isNeutral(color) && color.h >= AMBER_HUE_MIN && color.h <= AMBER_HUE_MAX;

/** Amber tonu en yakın izinli kenara iter (45° kırmızı tarafı ya da 100° sarı-yeşil tarafı); diğer tonlara dokunmaz. */
export function allowedHue(hue: number): number {
  const h = ((hue % 360) + 360) % 360;
  if (h < AMBER_HUE_MIN || h > AMBER_HUE_MAX) return h;
  return h - AMBER_HUE_MIN < AMBER_HUE_MAX - h ? AMBER_HUE_MIN - 5 : AMBER_HUE_MAX + 5;
}

export interface Swatch { label: string; hex: string; oklch: Oklch }
const swatch = (label: string, color: Oklch): Swatch => { const hex = oklchHex(color); return { label, hex, oklch: toOklch(parseColor(hex)!) }; };

const STEPS: [label: string, lightness: number][] = [["50", .97], ["100", .93], ["200", .87], ["300", .79], ["400", .7], ["500", .62], ["600", .54], ["700", .46], ["800", .38], ["900", .3], ["950", .22]];

/** Açıktan koyuya 11 basamak. Uçlarda doygunluk azalır ki açık basamaklar kirli, koyular boğuk görünmesin. */
export function shades(base: Oklch): Swatch[] {
  const hue = allowedHue(base.h);
  return STEPS.map(([label, lightness]) => swatch(label, { l: lightness, c: base.c * (1 - Math.abs(lightness - .58) * .9), h: hue }));
}

/** Seçilen renge en yakın basamağın adı ("500"). */
export const nearestShade = (base: Oklch) => STEPS.reduce((best, step) => Math.abs(step[1] - base.l) < Math.abs(best[1] - base.l) ? step : best)[0];

/** Alternatifler: tamamlayıcı, komşu ve üçlü tonlar, sakin ve koyu sürüm. Hiçbiri amber aralığına düşmez. Gri renkte ton anlamsızdır; açık, koyu ve mavi-gri önerilir. */
export function alternatives(base: Oklch): Swatch[] {
  const at = (label: string, change: Partial<Oklch>) => {
    const merged = { ...base, ...change }, target = { ...merged, h: ((merged.h % 360) + 360) % 360 };
    // Amber aralığına düşen öneri izinli kenara itilir; etiket bunu söyler ki renk açıklamasız tuhaf görünmesin.
    return swatch(isAmber(target) ? `${label} (amber dışı)` : label, { ...target, h: allowedHue(target.h) });
  };
  if (isNeutral(base)) return [
    at("Daha açık", { l: Math.min(.98, base.l + .1) }),
    at("Daha koyu", { l: Math.max(.15, base.l - .15) }),
    at("Mavi-gri", { c: .04, h: 255 }),
    at("Menekşe-gri", { c: .04, h: 295 }),
  ];
  return [
    at("Tamamlayıcı", { h: base.h + 180 }),
    at("Komşu −30°", { h: base.h - 30 }),
    at("Komşu +30°", { h: base.h + 30 }),
    at("Üçlü +120°", { h: base.h + 120 }),
    at("Sakin", { c: base.c * .45 }),
    at("Koyu", { l: Math.max(.2, base.l - .14) }),
  ];
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const INK: Rgb = { r: 17, g: 17, b: 17 };
const rgbAlpha = ({ r, g, b }: Rgb, alpha: number) => `rgb(${r} ${g} ${b} / ${alpha})`;
/** Vurgu üstündeki yazı: beyaz ya da koyu, hangisi daha okunursa. */
const foregroundOn = (color: Rgb) => contrastRatio(color, WHITE) >= contrastRatio(color, INK) ? "#FFFFFF" : toHex(INK);

export type AccentTokens = Record<"--accent" | "--accent-strong" | "--accent-subtle" | "--accent-foreground" | "--control-on" | "--control-thumb-on" | "--control-glyph", string> & { "--control-fill"?: string };

/** Bir renkten açık ve koyu tema vurgu değişkenlerini üretir; snn-foundation.css'teki hazır vurgularla aynı adlar. Amber ton izinli kenara itilir. */
export function accentTokens(rgb: Rgb): { light: AccentTokens; dark: AccentTokens } {
  const base = toOklch(rgb), h = allowedHue(base.h), c = base.c;
  const light = fromOklch({ l: base.l, c, h });
  const lightStrong = fromOklch({ l: Math.max(.18, base.l - .12), c, h });
  const dark = fromOklch({ l: Math.max(.74, base.l), c: c * .85, h });
  const darkStrong = fromOklch({ l: Math.min(.93, Math.max(.74, base.l) + .1), c: c * .6, h });
  const darkControl = fromOklch({ l: Math.min(.66, Math.max(.56, base.l)), c, h });
  return {
    light: { "--accent": toHex(light), "--accent-strong": toHex(lightStrong), "--accent-subtle": rgbAlpha(light, .13), "--accent-foreground": foregroundOn(light), "--control-on": toHex(light), "--control-thumb-on": "#FFFFFF", "--control-glyph": foregroundOn(light) },
    dark: { "--accent": toHex(dark), "--accent-strong": toHex(darkStrong), "--accent-subtle": rgbAlpha(light, .22), "--accent-foreground": foregroundOn(dark), "--control-on": toHex(darkControl), "--control-thumb-on": "#FFFFFF", "--control-glyph": foregroundOn(darkControl), "--control-fill": toHex(darkControl) },
  };
}

/** Projeye yapıştırılacak CSS: `<html data-accent="custom">` ile çalışır, snn-foundation.css'ten sonra yüklenir. */
export function accentCss(rgb: Rgb): string {
  const { light, dark } = accentTokens(rgb);
  const block = (tokens: AccentTokens) => Object.entries(tokens).map(([name, value]) => `  ${name}: ${value};`).join("\n");
  return `:root[data-accent="custom"] {\n${block(light)}\n}\n:root[data-theme="dark"][data-accent="custom"] {\n${block(dark)}\n}`;
}
