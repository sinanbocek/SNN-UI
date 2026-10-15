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
  line: "registry/components/line-chart/line-chart-format.ts",
  splitBar: "registry/components/split-bar/split-bar-format.ts",
  sankey: "registry/components/sankey-flow/sankey-flow-format.ts",
  funnel: "registry/components/funnel-chart/funnel-chart-format.ts",
  race: "registry/components/race-bar-chart/race-bar-chart-format.ts",
  stream: "registry/components/realtime-stream/realtime-stream-format.ts",
  metrics: "registry/components/metrics-dashboard/../lib/metric-format.ts",
  kpi: "registry/components/kpi-drilldown/../lib/chart-format.ts",
  explorer: "registry/components/metric-explorer/../lib/metric-format.ts",
  revenue: "registry/components/revenue-explorer/revenue-explorer-format.ts",
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

test("çizgi grafik: ipucu 1234.5 → '1.234,5', eksen 1250000 → ABACUS kısaltması", () => {
  assert.equal(mods.line.formatLineValue(1234.5), money.fmtDecimalGrouped(1234.5, 1));
  assert.equal(mods.line.formatLineValue(1234.5), "1.234,5");
  assert.equal(mods.line.formatLineTick(1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }).replace("₺", ""));
  assert.equal(mods.line.formatLineTick(1250000), "1,25Mn");
  assert.equal(mods.line.formatLineTick(500), "500");
});

test("bölünmüş çubuk: tutar ve pay ABACUS çıktısıdır", () => {
  assert.equal(mods.splitBar.fullValueText(1250000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.splitBar.fullValueText(1250000), "₺1.250.000");
  assert.equal(mods.splitBar.shareText(412000, 990000), money.percent(math.mul(412000 / 990000, 100), 1));
  assert.equal(mods.splitBar.shareText(1, 4), "%25");
});

test("akış şeması: tutar etiketi 1250000 TRY ve pay ABACUS çıktısıdır; yerleşim toplamı korur", () => {
  assert.equal(mods.sankey.flowValueText("money", 1250000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.sankey.flowShortText("money", 1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.sankey.flowValueText("count", 1234), money.fmtDecimalGrouped(1234, 0));
  assert.equal(mods.sankey.flowShareText(250, 1000), "%25");
  const layout = mods.sankey.layoutSankey([{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "c", label: "C" }], [{ source: "a", target: "b", value: 30 }, { source: "a", target: "c", value: 10 }], 200);
  assert.equal(layout.columns, 2);
  assert.equal(layout.total, 40);
  assert.equal(layout.links.reduce((sum, link) => sum + link.value, 0), 40);
});

test("huni grafiği: tutar 1250000 TRY, oran ve düşüş ABACUS çıktısıdır", () => {
  assert.equal(mods.funnel.countText("money", 1250000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.funnel.shortText("money", 1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.funnel.countText("count", 48200), money.fmtDecimalGrouped(48200, 0));
  const steps = [{ key: "a", label: "A", value: 200 }, { key: "b", label: "B", value: 50 }];
  assert.equal(mods.funnel.ratioText(mods.funnel.stepRatios(steps, 1).previous), money.percent(25, 1));
  assert.equal(mods.funnel.dropText("count", 200, 50), "↓ 150 (" + money.percent(math.percentChange(50, 200), 1, { sign: "always" }) + ")");
  const band = mods.funnel.funnelBands(steps, "total")[0];
  assert.deepEqual([band.top[0], band.bottom[0]], [0, 1]);
});

test("sıralama yarışı: tutar etiketi 1250000 TRY ABACUS çıktısıdır, ara değer ve sıralama doğru", () => {
  assert.equal(mods.race.fullText("money", 1250000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.race.shortText("money", 1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.race.shortText("money", 1250000.4), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.race.fullText("count", 1234.4), money.fmtDecimalGrouped(1234, 0));
  assert.equal(mods.race.valueAt([100, 200], .5), 150);
  const rows = mods.race.rowsAt([{ key: "a", label: "A", values: [10, 40] }, { key: "b", label: "B", values: [30, 20] }], .5);
  assert.deepEqual(rows.map(row => row.key + row.rank), ["a0", "b1"]);
  assert.equal(mods.race.niceMax(1234), 2000);
});

test("canlı akış: değer, eksen ve saat yazımı ABACUS çıktısıdır", () => {
  assert.equal(mods.stream.valueText("money", 1250000), money.formatMajor(1250000, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.stream.valueText("money", 41.25), "₺41,25");
  assert.equal(mods.stream.valueText("number", 1234.5, 1), money.fmtDecimalGrouped(1234.5, 1));
  assert.equal(mods.stream.valueText("number", 1234.5, 1), "1.234,5");
  assert.equal(mods.stream.tickText("money", 1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  // 2026-10-15 11:03:27 UTC = Türkiye saatiyle 14:03:27
  assert.equal(mods.stream.clockText(Date.UTC(2026, 9, 15, 11, 3, 27)), "14:03:27");
  const readings = [{ t: 0, value: 1 }, { t: 10, value: 3 }, { t: 20, value: 2 }];
  assert.equal(mods.stream.nearestIndex(readings, 12), 1);
  assert.deepEqual(mods.stream.domainFor(readings, 0, 10), [0, 10]);
});

test("gösterge yazımı: tutar, adet, yüzde ve değişim ABACUS çıktısıdır", () => {
  assert.equal(mods.metrics.metricValueText("money", 1250000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.metrics.metricShortText("money", 1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.metrics.metricValueText("count", 1234), money.fmtDecimalGrouped(1234, 0));
  assert.equal(mods.metrics.metricValueText("percent", 3.2), money.percent(3.2, 1, { fixed: true }));
  assert.equal(mods.metrics.metricChange("money", 120, 100).text, money.percent(math.percentChange(120, 100), 1, { sign: "always" }));
  assert.equal(mods.metrics.metricChange("percent", 3.3, 3.2).text, "+0,1 puan");
  assert.equal(mods.metrics.metricChange("count", 90, 100).arrow, "▼");
  assert.equal(mods.metrics.metricChange("count", 5, undefined).text, "—");
});

test("ayrıntı paneli: kırılım payı ve kart değeri ABACUS çıktısıdır; mini çizgi yolu geçerli", () => {
  assert.equal(mods.metrics.metricValueText("money", 842000), money.formatMajor(842000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.metrics.metricShortText("money", 842000), money.compactMajor(842000, { style: "B/Mn/Mr" }));
  assert.equal(mods.chart.formatRatio(0.5, 1), money.percent(50, 1));
  assert.equal(mods.metrics.metricChange("percent", 91.4, 90.3).text, "+1,1 puan");
  const path = mods.chart.miniLinePath([1, 3, 2], 100, 32, 2);
  assert.ok(path.startsWith("M0 ") && path.includes("L100 "));
});

test("gösterge gezgini: okuma satırı değeri ve kart değişimi ABACUS çıktısıdır", () => {
  assert.equal(mods.explorer.metricValueText("money", 41000), money.formatMajor(41000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.explorer.metricShortText("money", 1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.explorer.metricValueText("count", 2410), "2.410");
  const drop = mods.explorer.metricChange("money", 90, 100);
  assert.equal(drop.text, money.percent(math.percentChange(90, 100), 1, { sign: "always" }));
  assert.equal(drop.direction, -1);
  assert.equal(mods.explorer.metricChange("money", 5, 0).text, "—");
});

test("gelir gezgini: tutar, büyüme, kayıp oranı ve ay adı ABACUS çıktısıdır", () => {
  assert.equal(mods.revenue.moneyText(1250000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.revenue.moneyShort(1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.revenue.rateText(1.84), money.percent(1.84, 2, { fixed: true }));
  assert.equal(mods.revenue.pointsText(1.96, 1.84), "+0,12 puan");
  assert.equal(mods.revenue.monthLabel("2026-03"), "Mart 2026");
  assert.equal(mods.revenue.axisMonth("2026-01"), "Oca 2026");
  assert.equal(mods.revenue.axisMonth("2026-03"), "Mar");
  const months = [100, 120, 150].map((total, at) => ({ key: "2026-0" + (at + 1), newMrr: 30, expansion: 10, churn: 5, total }));
  const summary = mods.revenue.summarize(months, { start: 1, end: 2 });
  assert.equal(summary.total, 150);
  assert.equal(summary.opening, 100);
  assert.equal(mods.revenue.growthText(summary), money.percent(math.percentChange(150, 100), 1, { sign: "always" }));
  assert.deepEqual(mods.revenue.moveRange({ start: 1, end: 2 }, "window", 5, 6), { start: 4, end: 5 });
  assert.deepEqual(mods.revenue.moveRange({ start: 1, end: 2 }, "end", -9, 6), { start: 1, end: 2 });
});
