// Amber testi: katalogdaki hiçbir CSS dosyasında amber/turuncu ton kalmaz.
// Vaka: Arc foundation.css --warning'i amber verir (oklch(58% .18 75)); aile kuralı amber'i yasaklar
// (standartlar/arayuz-standardi.md §1 — GHS-Panel 2026-09-16, SNN-Siparis 2026-09-25).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findAmber, rgbToOklch } from "../scripts/color-hue.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function cssFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(full);
    return entry.name.endsWith(".css") ? [full] : [];
  });
}

test("dönüştürücü bilinen renkleri doğru tonda okur", () => {
  // Arc'ın amber vurgusu ve Tailwind amber-500
  assert.ok(Math.abs(rgbToOklch(0xf3 / 255, 0xad / 255, 0x20 / 255).hue - 76) < 3);
  assert.ok(Math.abs(rgbToOklch(0xf5 / 255, 0x9e / 255, 0x0b / 255).hue - 70) < 3);
  // Mavi amber aralığında değildir
  assert.ok(rgbToOklch(0x05 / 255, 0x62 / 255, 0xef / 255).hue > 200);
});

test("dedektör Arc'ın amber değerlerini yakalar", () => {
  assert.equal(findAmber(":root { --warning: oklch(58% .18 75); }").length, 1);
  assert.equal(findAmber(':root[data-accent="amber"] { --accent: #f3ad20; }').length, 2);
  assert.equal(findAmber(":root { --x: rgb(243 173 32 / .16); }").length, 1);
  assert.equal(findAmber(":root { --series-3: oklch(from var(--accent) l c calc(h + 184)); }").length, 1);
  assert.equal(findAmber(":root { --gray: oklch(80% 0 0); --blue: oklch(50% .08 260); }").length, 0);
  // Yorumdaki ad ya da renk ekrana çıkmaz; sayılmaz
  assert.equal(findAmber('/* data-accent="amber" kaldırıldı, eski: #f3ad20 */\n:root { --x: #0562ef; }').length, 0);
});

test("registry altındaki hiçbir CSS dosyasında amber yok", () => {
  const files = cssFiles(path.join(root, "registry"));
  assert.ok(files.some(f => f.endsWith("snn-foundation.css")), "snn-foundation.css bulunamadı");
  const problems = files.flatMap(file =>
    findAmber(readFileSync(file, "utf8")).map(p => `${path.relative(root, file)}:${p.line} ${p.text} — ${p.reason}`));
  assert.deepEqual(problems, []);
});
