// Parola gücü puanlamasının saf mantığı. Gerçek parola kullanılmaz; yalnız örnek karakter dizileri.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp, mod;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-pass-"));
  const outfile = path.join(temp, "format.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/password-strength/password-strength-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  mod = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("boş parola: seviye 0, etiket boş", () => {
  assert.deepEqual(mod.estimateStrength(""), { level: 0, label: "", met: [] });
});

test("kısa parola ilk adımda kalır ve 'Çok kısa' der", () => {
  const result = mod.estimateStrength("aA1!");
  assert.equal(result.level, 1);
  assert.equal(result.label, "Çok kısa");
  assert.equal(result.short, true);
});

test("kurallar arttıkça seviye ve Türkçe etiket yükselir", () => {
  const level = value => mod.estimateStrength(value);
  assert.equal(level("abcdefghij").label, "Zayıf");
  assert.equal(level("abcdefghijAB").label, "Orta");
  assert.equal(level("abcdefghijAB12").label, "İyi");
  assert.equal(level("abcdefghijAB12!?").label, "Güçlü");
  assert.equal(level("abcdefghijAB12!?").level, 4);
});

test("Türkçe büyük/küçük harf: İ, ı, Ş, ğ kuralı sağlar", () => {
  const hasCase = mod.createPasswordRules().find(rule => rule.id === "case");
  assert.equal(hasCase.test("şğıİ"), true);
  assert.equal(hasCase.test("şğı"), false);
});

test("uzunluk kuralı: etiket Türkçe, eksik karakter doğru, emoji bir sayılır", () => {
  const [length] = mod.createPasswordRules({ minLength: 10 });
  assert.equal(length.label, "En az 10 karakter");
  assert.equal(length.remaining("abcd"), 6);
  assert.equal(length.remaining("a".repeat(12)), 0);
  assert.equal(mod.countCodePoints("a😀"), 2);
});

test("etiketler ve güç sözcükleri geçersiz kılınabilir", () => {
  const rules = mod.createPasswordRules({ labels: { number: "Rakam şart" } });
  assert.equal(rules.find(rule => rule.id === "number").label, "Rakam şart");
  assert.equal(mod.estimateStrength("abc", rules, { levels: { tooShort: "Kısa" } }).label, "Kısa");
});
