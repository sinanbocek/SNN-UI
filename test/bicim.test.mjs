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
  waterfall: "registry/components/mrr-waterfall/mrr-waterfall-format.ts",
  cohort: "registry/components/cohort-retention/cohort-retention-format.ts",
  usage: "registry/components/usage-forecast/usage-forecast-format.ts",
  variance: "registry/components/budget-variance/budget-variance-format.ts",
  multiples: "registry/components/small-multiples/small-multiples-format.ts",
  replay: "registry/components/line-replay/line-replay-format.ts",
  market: "registry/components/market-terminal/market-terminal-format.ts",
  journey: "registry/components/journey-flow/journey-flow-format.ts",
  invoice: "registry/components/invoice-studio/invoice-studio-format.ts",
  pricing: "registry/components/pricing-calculator/pricing-calculator-format.ts",
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

test("gelir şelalesi: tutar etiketi 1250000 TRY, yüzde ve işaretli hareket ABACUS çıktısıdır", () => {
  assert.equal(mods.waterfall.stepValueText("amount", 1250000, 1000000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.waterfall.stepValueText("amount", 1250000, 1000000, true), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.waterfall.stepValueText("percent", 1250000, 1000000), money.percent(125, 1));
  assert.equal(mods.waterfall.signedText("amount", { kind: "up", amount: 148000 }, 1000000), "+" + money.compactMajor(148000, { style: "B/Mn/Mr" }));
  assert.equal(mods.waterfall.signedText("amount", { kind: "down", amount: 41500 }, 1000000), money.compactMajor(-41500, { style: "B/Mn/Mr" }));
  assert.equal(mods.waterfall.signedText("percent", { kind: "down", amount: 50000 }, 1000000), money.percent(-5, 1, { sign: "always" }));
  assert.equal(mods.waterfall.periodChangeText(100, 112.3), "+" + money.formatMajor(12, { currency: "TRY", digits: 0 }) + " (" + money.percent(12.3, 1, { sign: "always" }) + ")");
  const movements = [{ key: "a", label: "Yeni", direction: "up", role: "new", amount: 30 }, { key: "b", label: "Kayıp", direction: "down", role: "churn", amount: 10 }];
  const steps = mods.waterfall.buildSteps(100, movements);
  assert.deepEqual(steps.map(step => [step.low, step.high]), [[0, 100], [100, 130], [120, 130], [0, 120]]);
  const marks = mods.waterfall.indicators(100, movements);
  assert.equal(marks.quickRatio, 3);
  assert.equal(marks.churn, 10);
});

test("kohort elde tutma: yüzde, puan farkı, büyüklük ve kohort adı ABACUS çıktısıdır", () => {
  assert.equal(mods.cohort.cellText(68.4), money.percent(68.4, 0));
  assert.equal(mods.cohort.tipPercent(68.4), money.percent(68.4, 1));
  assert.equal(mods.cohort.tipPercent(68.4), "%68,4");
  assert.equal(mods.cohort.sizeText(1234), money.fmtDecimalGrouped(1234, 0));
  assert.equal(mods.cohort.pointsText(5.2), "+5,2 puan");
  assert.equal(mods.cohort.cohortLabel("2025-11"), "Kasım 2025");
  const cohorts = [10, 10, 10, 10].map((size, at) => ({ key: "2026-0" + (at + 1), size, retention: [at < 2 ? 50 : 60, null] }));
  assert.equal(mods.cohort.weightedAverage(cohorts, 0), 55);
  assert.equal(mods.cohort.weightedAverage(cohorts, 1), null);
  assert.equal(mods.cohort.trendPoints(cohorts, 0), 3.3);
  assert.equal(mods.cohort.totalSignups(cohorts), 40);
});

test("kullanım tahmini: kullanım, yüzde, tutar ve tarih ABACUS çıktısıdır; kesişim doğru", () => {
  assert.equal(mods.usage.usageText(38000000), money.fmtDecimalGrouped(38000000, 0));
  assert.equal(mods.usage.usageText(38000000), "38.000.000");
  assert.equal(mods.usage.percentOf(610, 1000), money.percent(61, 0));
  assert.equal(mods.usage.moneyText(1250), money.formatMajor(1250, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.usage.dayText("2026-09-01", 25), "26 Eylül 2026");
  assert.equal(mods.usage.addDays("2026-09-28", 4), "2026-10-02");
  const used = [10, 20, 30, 40, 50];
  const forecast = mods.usage.forecastUsage(used, 10);
  assert.equal(forecast.enough, true);
  assert.equal(forecast.rate, 10);
  assert.equal(forecast.mid[9], 100);
  assert.equal(mods.usage.crossingDay(forecast.mid, 75), 6.5);
  const outlook = mods.usage.budgetOutlook(forecast, 75);
  assert.equal(outlook.exceeded, false);
  assert.equal(outlook.day, 6.5);
  assert.equal(mods.usage.budgetOutlook(forecast, 35).exceeded, true);
  assert.equal(mods.usage.forecastUsage([5, 9], 10).enough, false);
  assert.equal(mods.usage.overageCost(1500, 1000, 100, 2), 10);
  assert.equal(mods.usage.budgetStep(0, 100), 5);
});

test("bütçe sapması: tutar etiketi 1250000 TRY, işaretli sapma ve yüzde ABACUS çıktısıdır", () => {
  assert.equal(mods.variance.moneyFull(1250000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.variance.moneyShort(1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.variance.signedMoney(150000), "+" + money.formatMajor(150000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.variance.signedMoney(-8500), money.formatMajor(-8500, { currency: "TRY", digits: 0 }));
  assert.equal(mods.variance.variancePercentText(1000, 1125), money.percent(math.percentChange(1125, 1000), 1, { sign: "always" }) + " aşım");
  assert.equal(mods.variance.variancePercentText(1000, 960), money.percent(math.percentChange(960, 1000), 1, { sign: "always" }) + " altında");
  assert.equal(mods.variance.variancePercentText(1000, 1010), "plana uygun");
  assert.equal(mods.variance.scalePercent(.5), money.percent(50, 0));
  assert.equal(mods.variance.scaleMax([{ budget: 100, actual: 90 }]), 1.2);
  assert.equal(mods.variance.scaleMax([{ budget: 100, actual: 131 }]), 1.4);
  const dept = mods.variance.resolveDepartment({ key: "a", name: "A", items: [{ key: "1", name: "x", budget: 10, actual: 12 }, { key: "2", name: "y", budget: 5, actual: 4 }] });
  assert.deepEqual([dept.budget, dept.actual], [15, 16]);
});

test("küçük çoklu grafikler: büyüme, trend, ad sıralaması ve ay etiketi ABACUS çıktısıdır", () => {
  assert.equal(mods.multiples.growthText(12.3), money.percent(12.3, 1, { sign: "always" }));
  assert.equal(mods.multiples.growthText(-4), money.percent(-4, 1, { sign: "always" }));
  assert.equal(mods.multiples.growthText(null), "—");
  const values = Array.from({ length: 13 }, (_, at) => 100 + at * 10);
  assert.equal(mods.multiples.growthAt(values, 12), math.percentChange(220, 100));
  assert.equal(mods.multiples.growthAt(values, 5), null);
  assert.equal(mods.multiples.trendOf(1.5), "flat");
  assert.equal(mods.multiples.trendOf(-8), "down");
  assert.equal(mods.multiples.trendOf(null), "none");
  assert.equal(mods.multiples.periodLabel("2026-09"), "Eylül 2026");
  const series = [{ key: "a", label: "Şanlıurfa", values: [1] }, { key: "b", label: "İzmir", values: [3] }, { key: "c", label: "Ankara", values: [2] }];
  assert.deepEqual(mods.multiples.sortSeries(series, "name", 0).map(item => item.key), ["c", "b", "a"]);
  assert.deepEqual(mods.multiples.sortSeries(series, "last", 0).map(item => item.key), ["b", "c", "a"]);
  assert.deepEqual(mods.multiples.totals(series, 1), [6]);
  assert.deepEqual(mods.multiples.domainFor(series[0], series, "shared"), [0, 3]);
});

test("çizgi tekrarı: değer, saat, çarpan ve etki yazımı ABACUS çıktısıdır; ara değer doğru", () => {
  assert.equal(mods.replay.valueText("count", 1234.4), money.fmtDecimalGrouped(1234, 0));
  assert.equal(mods.replay.valueText("money", 1250000), money.formatMajor(1250000, { currency: "TRY", digits: 0 }));
  assert.equal(mods.replay.tickText("money", 1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }));
  assert.equal(mods.replay.ratioText(480, 100), "4,8×");
  assert.equal(mods.replay.ratioText(5, 0), null);
  // 2026-10-18 06:40 UTC = Türkiye saatiyle 09:40
  assert.equal(mods.replay.timeText(Date.UTC(2026, 9, 18, 6, 40)), "09:40");
  assert.equal(mods.replay.clockText(Date.UTC(2026, 9, 18, 6, 40, 7)), "09:40:07");
  const points = [{ t: 0, value: 100 }, { t: 600000, value: 200 }, { t: 1200000, value: 150 }];
  assert.equal(mods.replay.valueAtTime(points, 300000), 150);
  assert.equal(mods.replay.valueAtTime(points, 9e9), 150);
  assert.deepEqual(mods.replay.pointsUntil(points, 300000).map(point => point.value), [100, 150]);
  assert.deepEqual(mods.replay.peakUntil(points, 1200000), { t: 600000, value: 200 });
  assert.equal(mods.replay.effectText("count", { t: 0, title: "x" }, [{ t: 0, value: 100 }, { t: 3600000, value: 1340 }]), "sonraki saatte +1.240");
  assert.equal(mods.replay.effectText("count", { t: 0, kind: "issue", title: "x" }, [{ t: 0, value: 200 }, { t: 1200000, value: 150 }]), "20 dakikada " + money.percent(-25, 1, { sign: "always" }));
  assert.equal(mods.replay.niceTop(2316), 2500);
});

test("işlem ekranı: fiyat, değişim, hacim ve adet ABACUS çıktısıdır; ortalama, görünüm ve emir doğrulama doğru", () => {
  assert.equal(mods.market.priceText(1250000), money.formatMajor(1250000, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.market.priceText(112.4), "₺112,40");
  assert.deepEqual(mods.market.priceParts(112.4), { prefix: "₺", value: 112.4, decimals: 2, suffix: "" });
  assert.equal(mods.market.signedPrice(1.25), "+₺1,25");
  assert.equal(mods.market.signedPercent(1.234), money.percent(1.234, 2, { sign: "always" }));
  assert.equal(mods.market.volumeShort(1250000), money.compactMajor(1250000, { style: "B/Mn/Mr" }).replace("₺", ""));
  assert.equal(mods.market.volumeFull(1250000), money.fmtDecimalGrouped(1250000, 0));
  assert.equal(mods.market.parseQuantity("1.250"), 1250);
  assert.equal(mods.market.parseQuantity("0"), null);
  assert.equal(mods.market.parseQuantity("2,5"), null);
  assert.equal(mods.market.parsePrice("12,35"), 12.35);
  assert.equal(mods.market.dayChange(110, 100).percent, math.percentChange(110, 100));
  const base = { side: "buy", type: "market", quantityText: "10", limitText: "", price: 100, buyingPower: 5000, position: 3 };
  assert.equal(mods.market.validateOrder(base), null);
  assert.equal(mods.market.validateOrder({ ...base, quantityText: "60" }), "Alım gücü yetersiz");
  assert.equal(mods.market.validateOrder({ ...base, side: "sell" }), "Satılacak yeterli hisse yok");
  assert.equal(mods.market.validateOrder({ ...base, type: "limit" }), "Geçerli bir limit fiyat girin");
  assert.equal(mods.market.validateOrder({ ...base, quantityText: "" }), "Adet sıfırdan büyük bir tam sayı olmalı");
  const candles = [1, 2, 3, 4].map((close, at) => ({ t: at, open: close, high: close + 1, low: close - 1, close, volume: 10 }));
  assert.deepEqual(mods.market.sma(candles, 2), [null, 1.5, 2.5, 3.5]);
  assert.deepEqual(mods.market.clampView({ from: 99, count: 3 }, 4), { from: 0, count: 4 });
  assert.deepEqual(mods.market.priceTicks({ low: 0, high: 10 }, 5), [0, 2, 4, 6, 8, 10]);
  assert.equal(mods.market.orderTime(Date.UTC(2026, 9, 18, 11, 3, 27)), "14:03:27");
});

test("yolculuk akışı: toplam, pay ve düşüş yazımı ABACUS çıktısıdır; panel hesabı doğru", () => {
  const data = { stages: ["A", "B"], nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "d", label: "Ayrıldı", muted: true }], links: [{ source: "a", target: "b", value: 250 }, { source: "a", target: "d", value: 750 }] };
  const facts = mods.journey.journeyFacts(data);
  assert.equal(facts.total, 1000);
  assert.equal(facts.finalTotal, 250);
  assert.equal(mods.journey.countText(16965), money.fmtDecimalGrouped(16965, 0));
  assert.equal(mods.journey.countText(16965), "16.965");
  assert.equal(mods.journey.shareText(250, 1000), money.percent(25, 1));
  const summary = mods.journey.nodeSummary(data, facts, "b");
  assert.equal(summary.value, 250);
  assert.equal(summary.shareOfTotal, "%25");
  assert.deepEqual(summary.incoming.map(row => row.id), ["a"]);
  const from = mods.journey.nodeSummary(data, facts, "a");
  assert.deepEqual(from.outgoing.map(row => [row.id, row.drop]), [["d", true], ["b", false]]);
  assert.deepEqual(mods.journey.topDrops(data, facts).map(row => [row.from, row.value, row.share]), [["A", 750, "%75"]]);
  assert.equal(mods.journey.channelAnnouncement(facts, "ziyaret", "ücretli plan"), "1.000 ziyaret, 250 ücretli plan");
});

test("fatura stüdyosu: kuruş hesabı, KDV, toplam ve alan yazımı ABACUS çıktısıdır", () => {
  assert.equal(mods.invoice.lineMinor({ quantity: 3, unitPrice: 0.1 }), 30);
  assert.equal(mods.invoice.lineMinor({ quantity: 2.5, unitPrice: 100 }), 25000);
  assert.equal(mods.invoice.lineMinor({ quantity: -1, unitPrice: 5 }), 0);
  const totals = mods.invoice.computeTotals([{ quantity: 3, unitPrice: 1250.5 }, { quantity: 2.5, unitPrice: 100 }], 20);
  assert.deepEqual(totals.lines, [375150, 25000]);
  assert.equal(totals.subtotalMinor, 400150);
  assert.equal(totals.vatMinor, 80030);
  assert.equal(totals.totalMinor, 480180);
  assert.equal(mods.invoice.computeTotals([{ quantity: 1, unitPrice: 100.01 }], 20).vatMinor, 2000);
  assert.equal(mods.invoice.minorText(480180), money.formatMajor(4801.8, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.invoice.minorText(480180), "₺4.801,80");
  assert.equal(mods.invoice.vatLabel(20), "KDV · " + money.percent(20, 0));
  assert.equal(mods.invoice.groupedInput("1250,5"), "1.250,5");
  assert.equal(mods.invoice.parseField("1.250,5"), 1250.5);
  assert.equal(mods.invoice.parseField(""), null);
  assert.equal(mods.invoice.fieldText(1250.5), "1.250,5");
  assert.equal(mods.invoice.fieldText(3, 3), "3");
  assert.deepEqual(mods.invoice.validateItems([{ id: "a", description: "  " }, { id: "b", description: "x" }]).map(problem => problem.id), ["a"]);
});

test("fiyat hesaplayıcı: koltuk başı fiyat, toplam, tasarruf ve yazım ABACUS çıktısıdır; kademe ve öneri doğru", () => {
  const team = { key: "team", name: "Takım", fitsSeats: [11, 50], features: [{ label: "a" }, { label: "b", fromSeats: 20 }], tiers: [{ fromSeats: 1, price: 249 }, { fromSeats: 25, price: 219 }] };
  const starter = { key: "starter", name: "Başlangıç", maxSeats: 10, fitsSeats: [1, 10], features: [], tiers: [{ fromSeats: 1, price: 149 }] };
  const business = { key: "business", name: "İş", fitsSeats: [51, null], features: [], tiers: [{ fromSeats: 1, price: 389 }] };
  assert.equal(mods.pricing.seatPriceMinor(team, 20), 24900);
  assert.equal(mods.pricing.seatPriceMinor(team, 30), 21900);
  assert.equal(mods.pricing.periodSeatMinor(team, 20, "year", 20), 19920);
  assert.equal(mods.pricing.totalMinor(team, 20, "month", 20), 498000);
  assert.equal(mods.pricing.totalMinor(team, 20, "year", 20), 4780800);
  assert.equal(mods.pricing.savingsMinor(team, 20, 20), 1195200);
  assert.equal(mods.pricing.volumeDiscountMinor(team, 30), 3000);
  assert.equal(mods.pricing.volumeDiscountMinor(team, 20), 0);
  assert.equal(mods.pricing.minorMoney(21900), money.formatMajor(219, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.pricing.minorMoney(21900), "₺219,00");
  assert.equal(mods.pricing.percentText(20), money.percent(20, 0));
  assert.equal(mods.pricing.seatsText(1234), "1.234 koltuk");
  assert.equal(mods.pricing.sellable(starter, 11), false);
  assert.equal(mods.pricing.sellable(starter, 10), true);
  assert.equal(mods.pricing.recommendedKey([starter, team, business], 5), "starter");
  assert.equal(mods.pricing.recommendedKey([starter, team, business], 20), "team");
  assert.equal(mods.pricing.recommendedKey([starter, team, business], 500), "business");
  assert.deepEqual(mods.pricing.visibleFeatures(team, 10).map(feature => feature.label), ["a"]);
  assert.deepEqual(mods.pricing.visibleFeatures(team, 20).map(feature => feature.label), ["a", "b"]);
  assert.equal(mods.pricing.limitMessage(10, 20), "Bu plan en çok 10 koltuğa uygun. Siz 20 koltuk seçtiniz.");
});
