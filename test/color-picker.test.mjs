// Renk seçicinin saf renk okuma/yazma mantığı: hex, çıplak rgb, rgb(), hsl(), karşıtlık ve Türkçe oran.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp, f;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-color-"));
  const outfile = path.join(temp, "format.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/color-picker/color-picker-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  f = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("#eee kısa hex okunur ve büyük harfle yazılır", () => {
  const color = f.parseColor("#eee");
  assert.ok(color);
  assert.equal(f.toHex(color), "#EEEEEE");
  assert.equal(f.toHex(f.parseColor("eee")), "#EEEEEE");
});

test("çıplak '238, 238, 238' ve rgb() aynı rengi verir", () => {
  assert.equal(f.toHex(f.parseColor("238, 238, 238")), "#EEEEEE");
  assert.equal(f.toHex(f.parseColor("238 238 238")), "#EEEEEE");
  assert.equal(f.toHex(f.parseColor("rgb(238, 238, 238)")), "#EEEEEE");
  assert.equal(f.parseColor("rgb(238, 238, 238"), null);
});

test("geçersiz girdi null döner", () => {
  assert.equal(f.parseColor("mavi"), null);
  assert.equal(f.parseColor("#12"), null);
});

test("hsl() ve saydamlıklı hex doğru yazılır", () => {
  assert.equal(f.toHex(f.parseColor("hsl(0 100% 50%)")), "#FF0000");
  assert.equal(f.toHex(f.parseColor("#2f6bff80")), "#2F6BFF80");
});

test("formatColor rgb biçimini yazar", () => {
  assert.equal(f.formatColor(f.parseColor("#2F6BFF"), "rgb"), "rgb(47 107 255)");
});

test("karşıtlık: siyah/beyaz 21, düzey metinleri Türkçe, oran virgüllü", () => {
  const white = { r: 1, g: 1, b: 1, a: 1 };
  const ratio = f.contrast(f.parseColor("#000000"), white);
  assert.equal(Math.round(ratio), 21);
  assert.equal(f.level(ratio), "AAA");
  assert.equal(f.level(4.5), "AA");
  assert.equal(f.level(3.2), "AA büyük");
  assert.equal(f.level(2), "Geçmedi");
  assert.equal(f.formatRatio(4.5632), "4,56");
  assert.equal(f.formatRatio(21), "21,00");
});

test("okunur yazı rengi: açık renkte koyu, koyu renkte açık; saydam renk arka plana bindirilir", () => {
  assert.equal(f.readableForeground("#FFFFFF"), "#111111");
  assert.equal(f.readableForeground("#BFDBFE"), "#111111");
  assert.equal(f.readableForeground("#2F6BFF"), "#FFFFFF");
  assert.equal(f.readableForeground("#111827"), "#FFFFFF");
  assert.equal(f.readableForeground("#1D4ED800"), "#111111");
  assert.equal(f.readableForeground("okunmaz"), "#FFFFFF");
});
