// CSS metnindeki renkleri bulur ve OKLCH ton açısına çevirir.
// Amber testi (test/amber.test.mjs) bu dosyayı kullanır; saf mantıktır, dosya okumaz.

/** Amber/turuncu sayılan OKLCH ton aralığı (derece). Aile kuralı: standartlar/arayuz-standardi.md §1. */
export const AMBER_HUE_MIN = 50;
export const AMBER_HUE_MAX = 95;
/** Bu doygunluğun altındaki renk gri sayılır; tonu anlamsızdır. */
export const NEUTRAL_CHROMA = 0.03;

function srgbToLinear(channel) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** 0–1 aralığındaki sRGB kanallarını OKLCH'ye çevirir (Björn Ottosson, OKLab). */
export function rgbToOklch(r, g, b) {
  const [lr, lg, lb] = [r, g, b].map(srgbToLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(okA, okB);
  let hue = (Math.atan2(okB, okA) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return { lightness: okL, chroma, hue };
}

function parseHex(hex) {
  let digits = hex.slice(1);
  if (digits.length === 3 || digits.length === 4) digits = [...digits].map(d => d + d).join("");
  return [0, 2, 4].map(i => parseInt(digits.slice(i, i + 2), 16) / 255);
}

/**
 * CSS metnindeki her rengi döndürür: { text, line, chroma, hue }.
 * Tanınan biçimler: #rgb, #rrggbb(aa), rgb()/rgba() ve oklch() içinde sayısal L C H.
 * `oklch(from var(...) ...)` gibi göreli renkler sabit tonu olmadığı için `relative: true` ile ayrıca bildirilir.
 */
export function findColors(css) {
  const found = [];
  const lines = css.split(/\r?\n/);
  lines.forEach((lineText, index) => {
    const line = index + 1;
    for (const match of lineText.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      if (![4, 5, 7, 9].includes(match[0].length)) continue;
      const { chroma, hue } = rgbToOklch(...parseHex(match[0]));
      found.push({ text: match[0], line, chroma, hue });
    }
    for (const match of lineText.matchAll(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/g)) {
      const { chroma, hue } = rgbToOklch(...[match[1], match[2], match[3]].map(v => Number(v) / 255));
      found.push({ text: match[0], line, chroma, hue });
    }
    for (const match of lineText.matchAll(/oklch\(\s*(from\b)?([^)]*)\)/g)) {
      if (match[1]) { found.push({ text: match[0], line, relative: true }); continue; }
      const parts = match[2].split("/")[0].trim().split(/\s+/);
      if (parts.length < 3) continue;
      const chroma = Number(parts[1]);
      const hue = Number(parts[2]);
      if (Number.isNaN(chroma) || Number.isNaN(hue)) { found.push({ text: match[0], line, relative: true }); continue; }
      found.push({ text: match[0], line, chroma, hue });
    }
  });
  return found;
}

/** CSS yorumlarını boşlukla değiştirir; satır numaraları korunur. Yorumdaki renk ekrana çıkmaz, sayılmaz. */
export function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\r\n]/g, " "));
}

/** Amber ya da turuncu tonundaki renkleri ve yasak vurgu seçeneklerini döndürür. Boş dizi = temiz. */
export function findAmber(rawCss) {
  const css = stripComments(rawCss);
  const problems = [];
  for (const color of findColors(css)) {
    if (color.relative) {
      problems.push({ line: color.line, text: color.text, reason: "göreli renk: tonu sabit değil, amber olmadığı kanıtlanamaz" });
      continue;
    }
    if (color.chroma < NEUTRAL_CHROMA) continue;
    if (color.hue >= AMBER_HUE_MIN && color.hue <= AMBER_HUE_MAX) {
      problems.push({ line: color.line, text: color.text, reason: `amber/turuncu ton (açı ${color.hue.toFixed(1)})` });
    }
  }
  css.split(/\r?\n/).forEach((lineText, index) => {
    for (const match of lineText.matchAll(/data-accent\s*=\s*["']?(amber|orange|yellow)\b/g)) {
      problems.push({ line: index + 1, text: match[0], reason: "yasak vurgu seçeneği" });
    }
  });
  return problems;
}
