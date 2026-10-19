// Kullanıcı menüsünün yazarak atlama eşleştirmesi (saf mantık).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp, format;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-user-menu-"));
  const outfile = path.join(temp, "format.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/user-menu/user-menu-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  format = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("yazarak atlama: 'i' yazınca 'İzinler' eşleşir (noktalı büyük İ)", () => {
  assert.equal(format.matchesTypeahead("İzinler", "i"), true);
  assert.equal(format.matchesTypeahead("İzinler", "İz"), true);
});

test("yazarak atlama: Türkçe harfe duyarsız ('c' → 'Çıkış yap', 's' → 'Şifre')", () => {
  assert.equal(format.matchesTypeahead("Çıkış yap", "c"), true);
  assert.equal(format.matchesTypeahead("Şifre", "s"), true);
  assert.equal(format.matchesTypeahead("Hesap ayarları", "h"), true);
});

test("yazarak atlama: başlamayan etiket ve boş yazı eşleşmez", () => {
  assert.equal(format.matchesTypeahead("Faturalama", "z"), false);
  assert.equal(format.matchesTypeahead("Faturalama", "ar"), false);
  assert.equal(format.matchesTypeahead("Faturalama", ""), false);
  assert.equal(format.matchesTypeahead(undefined, "f"), false);
});

const themes = [{ value: "light" }, { value: "dark" }, { value: "system" }];

test("tema seçenekleri: verilen sıra korunur, tekrar ve bilinmeyen atılır", () => {
  assert.deepEqual(format.pickThemeOptions(themes, ["dark", "light", "dark", "sepya"]).map(option => option.value), ["dark", "light"]);
});

test("tema seçenekleri: verilmez ya da geçerli değer kalmazsa üçü de döner", () => {
  assert.deepEqual(format.pickThemeOptions(themes).map(option => option.value), ["light", "dark", "system"]);
  assert.deepEqual(format.pickThemeOptions(themes, []).map(option => option.value), ["light", "dark", "system"]);
  assert.deepEqual(format.pickThemeOptions(themes, ["sepya"]).map(option => option.value), ["light", "dark", "system"]);
});
