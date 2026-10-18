// Lint yorumu testi: katalog dosyaları, kuran projenin ESLint ayarında hata doğuran iki kalıbı taşımaz (TB-002).
// Vaka: nakit 2026-10-18'de 54 parçayı kurdu, 8 lint hatası aldı. İkisi `@next/next/no-img-element` atfıydı
// (Next.js olmayan projede "kural bulunamadı"), üçü geçiş yorumsuz `money.format` (aile kuralı no-restricted-properties).
// Katalogda ESLint kurulu değil; bu iki kalıp burada metin olarak denetlenir.
// Kullanılmayan içe aktarmayı sıkı tip denetimi yakalar (playground/tsconfig.strict.json, noUnusedLocals).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Yorumda adı geçebilecek eklenti kuralları. Çekirdek ESLint kuralları (adında "/" yok) her projede vardır.
 * react-hooks'tan yalnız 5.x ve 7.x sürümlerinin ikisinde de bulunanlar: aile projelerinin üçü 5.x, beşi 7.x (2026-10-18).
 */
export const PLUGIN_RULES = new Set(["react-hooks/exhaustive-deps", "react-hooks/rules-of-hooks"]);

const DIRECTIVE = /eslint-disable(?:-next-line|-line)?\s+([^*\n]*?)(?:\s+--.*)?(?:\*\/)?\s*$/;
const MONEY_FORMAT = /\bmoney\.format\s*\(/;
const MONEY_PASS = /eslint-disable-next-line\s+no-restricted-properties\b/;

/** Metindeki sorunları "satır: neden" olarak döner. Saf mantık: dosya okumaz. */
export function findLintHazards(text) {
  const lines = text.split("\n");
  return lines.flatMap((line, index) => {
    const found = [];
    const directive = line.match(DIRECTIVE);
    if (directive) {
      for (const rule of directive[1].split(",").map(item => item.trim()).filter(Boolean)) {
        if (rule.includes("/") && !PLUGIN_RULES.has(rule)) found.push({ line: index + 1, reason: `her projede olmayan kural: ${rule}` });
      }
    }
    if (MONEY_FORMAT.test(line) && !MONEY_PASS.test(lines[index - 1] ?? "")) found.push({ line: index + 1, reason: "money.format geçiş yorumu yok" });
    return found;
  });
}

function sourceFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

test("dedektör: yabancı eklenti kuralını ve geçişsiz money.format'ı yakalar, izinlileri geçirir", () => {
  assert.equal(findLintHazards("// eslint-disable-next-line @next/next/no-img-element -- açıklama").length, 1);
  assert.equal(findLintHazards("x(); // eslint-disable-line react-hooks/set-state-in-effect -- açıklama").length, 1);
  assert.equal(findLintHazards("/* eslint-disable-next-line @typescript-eslint/no-explicit-any */").length, 1);
  assert.equal(findLintHazards("const a = money.format(1, {});").length, 1);
  assert.equal(findLintHazards("// eslint-disable-next-line no-console\nconst a = money.format(1, {});").length, 1);
  assert.equal(findLintHazards("}, []); // eslint-disable-line react-hooks/exhaustive-deps -- açıklama").length, 0);
  assert.equal(findLintHazards("// eslint-disable-next-line no-restricted-properties -- kuruş\nconst a = money.format(1, {});").length, 0);
  assert.equal(findLintHazards("x(); // eslint-disable-line -- kural adı bilerek yazılmadı").length, 0);
  assert.equal(findLintHazards("money.formatGroupedInput(raw, {}); money.formatMajor(1);").length, 0);
});

test("registry altındaki hiçbir .ts/.tsx dosyası kuran projede lint hatası doğuracak yorum ya da çağrı taşımaz", () => {
  const found = sourceFiles(path.join(root, "registry")).flatMap(file =>
    findLintHazards(readFileSync(file, "utf8")).map(hit => `${path.relative(root, file)}:${hit.line} ${hit.reason}`));
  assert.deepEqual(found, [], `Lint tehlikesi var:\n${found.join("\n")}`);
});
