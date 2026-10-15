// Biçim testi: grafik ve sayı bileşenlerinin etiket biçimleyicileri Türkçe biçim verir ("1.234,5") ve beklenen değerler ABACUS'tan alınır.
// Kaynak dosyalar TypeScript'tir ve ABACUS paketi de TypeScript kaynağı taşır (Node, node_modules içinde tür sökmez);
// bu yüzden her biçim dosyası esbuild ile paketlenip geçici klasörden içe aktarılır. React, CSS ve motion gerekmez.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILES = {
  chart: "registry/components/lib/chart-format.ts",
  counter: "registry/components/animated-counter/counter-parts.ts",
  metric: "registry/components/metric-card/metric-card-format.ts",
};
const mods = {};
let temp;
let math;
let money;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-bicim-"));
  // Beklenen değerler ABACUS'tan alınır; paket TypeScript kaynağı taşıdığı için o da paketlenir.
  const abacusOut = path.join(temp, "abacus.mjs");
  await build({ stdin: { contents: 'export * from "@snn/abacus-core";', resolveDir: root }, bundle: true, format: "esm", platform: "node", outfile: abacusOut, logLevel: "silent" });
  ({ math, money } = await import(pathToFileURL(abacusOut).href));
  for (const [key, file] of Object.entries(FILES)) {
    const outfile = path.join(temp, `${key}.mjs`);
    await build({ entryPoints: [path.join(root, file)], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
    mods[key] = await import(pathToFileURL(outfile).href);
  }
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("ortak biçimleyici: 1234.5 → '1.234,5' (ABACUS ile aynı)", () => {
  assert.equal(mods.chart.formatNumber(1234.5, 1), money.fmtDecimalGrouped(1234.5, 1));
  assert.equal(mods.chart.formatNumber(1234.5, 1), "1.234,5");
  assert.equal(mods.chart.formatNumber(1234, 1), "1.234");
  assert.equal(mods.chart.formatNumber(-0.5, 1), "-0,5");
});

test("ortak biçimleyici: kısaltma ve yüzde ABACUS çıktısıdır", () => {
  assert.equal(mods.chart.formatMoneyCompact(1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.chart.formatCompact(1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }).replace("₺", ""));
  assert.equal(mods.chart.formatMoney(1250000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.chart.formatRatio(0.123, 1), money.percent(math.mul(0.123, 100), 1));
  assert.equal(mods.chart.formatChange(120, 100, 0), money.percent(math.percentChange(120, 100), 0, { sign: "always" }));
});

test("sayaç: 1234.5 → '1.234,5', rakam sütunları basamak değerine göre anahtarlanır", () => {
  assert.equal(mods.counter.counterText(1234.5, 1), money.fmtDecimalGrouped(1234.5, 1));
  const parts = mods.counter.counterParts(1234.5, 1);
  const text = parts.map(part => ("text" in part ? part.text : String(part.digit))).join("");
  assert.equal(text, "1.234,5");
  // 999 → 1.000 olunca birler sütunu aynı anahtarı korur
  const keyOfOnes = value => mods.counter.counterParts(value, 0).find(part => part.key === "i0")?.key;
  assert.equal(keyOfOnes(999), "i0");
  assert.equal(keyOfOnes(1000), "i0");
});

test("gösterge kartı: 1234.5 → '1.234,5', 1250000 TRY → ABACUS kısaltması", () => {
  const joined = display => `${display.prefix}${mods.counter.counterText(display.value, display.decimals)}${display.suffix}`;
  assert.equal(joined(mods.metric.metricDisplay(1234.5, "number", "TRY", 1)), money.fmtDecimalGrouped(1234.5, 1));
  assert.equal(joined(mods.metric.metricDisplay(1250000, "compact-money")), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(joined(mods.metric.metricDisplay(1250000, "money")), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(joined(mods.metric.metricDisplay(-2500, "compact-money")), money.compactMajor(-2500, { style: "B/Mn/Mr" }));
});
