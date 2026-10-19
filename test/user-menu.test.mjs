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

// Açma düğmesi kutusu: sol x, üst y, genişlik, yükseklik.
const box = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height });
const view = { width: 1200, height: 800 };
const size = { width: 248, height: 300 };

test("panel konumu: varsayılan altta, sağ kenara hizalı; altta yer yoksa üste döner", () => {
  const placed = format.placePanel(box(900, 20, 40, 40), size, view);
  assert.deepEqual([placed.side, placed.left, placed.top], ["bottom", 940 - 248, 68]);
  const low = format.placePanel(box(900, 700, 40, 40), size, view);
  assert.deepEqual([low.side, low.top], ["top", 700 - 8 - 300]);
});

test("panel konumu: side='top' üste açar, üstte yer yoksa alta döner", () => {
  assert.equal(format.placePanel(box(100, 600, 40, 40), size, view, "top", "start").top, 600 - 8 - 300);
  assert.equal(format.placePanel(box(100, 20, 40, 40), size, view, "top", "start").side, "bottom");
});

test("panel konumu: side='right' sol alt köşedeki karttan sağa açar, alt kenarlar hizalı", () => {
  const placed = format.placePanel(box(8, 740, 240, 48), size, view, "right", "end");
  assert.equal(placed.side, "right");
  assert.equal(placed.left, 8 + 240 + 8);
  assert.equal(placed.top, 788 - 300);
  assert.equal(placed.origin.x, 0);
  // Alt kenar ekrana taşarsa panel içeride kalır.
  assert.equal(format.placePanel(box(8, 760, 240, 48), size, view, "right", "end").top, 800 - 300 - 12);
  // Sağda yer yoksa sola döner.
  assert.equal(format.placePanel(box(1000, 100, 180, 40), size, view, "right", "start").side, "left");
});
