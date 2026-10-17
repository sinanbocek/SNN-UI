// Faturalama anahtarının saf fiyat mantığı: para yazımı ve yıllık indirim hesabı.
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
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-billing-"));
  const outfile = path.join(temp, "billing.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/billing-toggle/billing-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  f = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("para birimi simgesi: varsayılan TRY, bilinmeyen kod boş", () => {
  assert.equal(f.currencyPrefix(), "₺");
  assert.equal(f.currencyPrefix("USD"), "$");
  assert.equal(f.currencyPrefix("XXX"), "");
});

test("tutar yazımı: Türkçe ayraçlar, ondalıkta kuruş", () => {
  assert.equal(f.formatPrice(1250), "₺1.250");
  assert.equal(f.formatPrice(1250, "TRY", 2), "₺1.250,00");
  assert.equal(f.formatPrice(Number.NaN), "—");
});

test("yıllık eşdeğer: yüzde indirim düşer, tam liraya yuvarlanır", () => {
  assert.equal(f.yearlyMonthlyEquivalent(399, 20), 319);
  assert.equal(f.yearlyMonthlyEquivalent(849, 20), 679);
  assert.equal(f.yearlyMonthlyEquivalent(100, 0), 100);
});

test("indirim yüzdesi ve yıllık tasarruf", () => {
  assert.equal(f.savingsPercent(399, 319), 20);
  assert.equal(f.savingsPercent(0, 10), 0);
  assert.equal(f.savingsPercent(Number.NaN, 10), 0);
  assert.equal(f.yearlySavings(399, 319), 960);
  assert.equal(f.yearlySavings(100, 120), 0);
});
