// Plan karşılaştırmasının saf fiyat mantığı: plan fiyatı, yıllık indirim, tutar yazımı.
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
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-plan-"));
  const outfile = path.join(temp, "plan.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/plan-comparison/plan-comparison-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  f = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("plan fiyatı: aylıkta liste fiyatı, yıllıkta indirimli eşdeğer", () => {
  assert.equal(f.planPrice("team", "monthly"), 399);
  assert.equal(f.planPrice("team", "yearly"), 319);
  assert.equal(f.planPrice("studio", "monthly"), 849);
  assert.equal(f.planPrice("studio", "yearly"), 679);
});

test("indirim yüzdesi: sıfır ya da geçersiz fiyatta 0, en yüksek değer seçilir", () => {
  assert.equal(f.savingsPercent(399, 319), 20);
  assert.equal(f.savingsPercent(0, 5), 0);
  assert.equal(f.savingsPercent(Number.NaN, 5), 0);
  assert.equal(f.maxSavingsPercent(), 20);
});

test("tutar ve simge yazımı", () => {
  assert.equal(f.currencyPrefix(), "₺");
  assert.equal(f.formatAmount(319), "319");
  assert.equal(f.formatAmount(1249), "1.249");
});
