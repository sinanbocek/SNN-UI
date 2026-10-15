// Yasak çağrı testi: katalogdaki hiçbir .ts/.tsx dosyasında Intl, toLocaleString, toFixed, toUpperCase, toLowerCase yok.
// Vaka: Arc'ın 55 bileşeni bu çağrıları kullanıyor (SNN-Standartlar docs/arc-siniflandirma.md, 2026-10-14);
// SNN-UI PR #9'da inbox-triage ve week-calendar'a toLowerCase sızdı, elle düzeltildi (2026-10-15).
// Sayı, para, yüzde ve tarih ABACUS'tan; harf büyütme/küçültme text.upper / text.lower'dan; kısayol tuşu event.code'dan okunur.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Yasak çağrılar. `Intl` ad olarak, diğerleri nokta ve parantezle yakalanır (toLocaleDateString gibi kardeşleri de). */
export const FORBIDDEN = [
  { name: "Intl", pattern: /\bIntl\b/ },
  { name: "toLocaleString", pattern: /\.toLocale\w*\s*\(/ },
  { name: "toFixed", pattern: /\.toFixed\s*\(/ },
  { name: "toUpperCase", pattern: /\.toUpperCase\s*\(/ },
  { name: "toLowerCase", pattern: /\.toLowerCase\s*\(/ },
];

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

/** Dosya metnindeki yasak çağrıları "yol:satır adı" olarak döner. Saf mantık: dosya okumaz. */
export function findForbidden(text) {
  return text.split("\n").flatMap((line, index) =>
    FORBIDDEN.filter(({ pattern }) => pattern.test(line)).map(({ name }) => ({ line: index + 1, name })));
}

test("dedektör beş yasak çağrıyı yakalar, ABACUS çağrılarını yakalamaz", () => {
  assert.equal(findForbidden("new Intl.NumberFormat('en-US')").length, 1);
  assert.equal(findForbidden("n.toLocaleString('tr-TR')").length, 1);
  assert.equal(findForbidden("n.toLocaleDateString()").length, 1);
  assert.equal(findForbidden("n.toFixed(2)").length, 1);
  assert.equal(findForbidden("s.toUpperCase()").length, 1);
  assert.equal(findForbidden("s.toLowerCase ()").length, 1);
  assert.equal(findForbidden("money.fmtDecimalGrouped(n, 1); text.upper(s); text.lower(s); Math.round(x)").length, 0);
});

test("registry altındaki hiçbir .ts/.tsx dosyasında yasak çağrı yok", () => {
  const found = sourceFiles(path.join(root, "registry")).flatMap(file =>
    findForbidden(readFileSync(file, "utf8")).map(hit => `${path.relative(root, file)}:${hit.line} ${hit.name}`));
  assert.deepEqual(found, [], `Yasak çağrı var (ABACUS kullan):\n${found.join("\n")}`);
});
