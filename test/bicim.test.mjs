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
  lineScale: "registry/components/line-chart/line-chart-scale.ts",
  avatar: "registry/components/avatar/avatar-initials.ts",
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
  usagePricing: "registry/components/usage-pricing/usage-pricing-format.ts",
  shop: "registry/components/lib/shop-format.ts",
  listing: "registry/components/product-listing/product-listing-format.ts",
  detail: "registry/components/product-detail/product-detail-format.ts",
  cart: "registry/components/cart-drawer/cart-drawer-format.ts",
  checkout: "registry/components/checkout-summary/checkout-summary-format.ts",
  wallet: "registry/components/wallet-card/wallet-card-format.ts",
  flow: "registry/components/payment-flow/payment-flow-format.ts",
  hero: "registry/components/hero-signup/hero-signup-format.ts",
  story: "registry/components/scroll-story/scroll-story-format.ts",
  spotlight: "registry/components/spotlight-grid/spotlight-grid-format.ts",
  viewer: "registry/components/lib/image-viewer-format.ts",
  gallery: "registry/components/product-gallery/product-gallery-format.ts",
  lightbox: "registry/components/lightbox-gallery/lightbox-gallery-format.ts",
  pgrid: "registry/components/photo-grid/photo-grid-format.ts",
  testimonial: "registry/components/testimonial-stage/testimonial-stage-format.ts",
  team: "registry/components/team-showcase/team-showcase-format.ts",
  player: "registry/components/media-player/media-player-format.ts",
  stack: "registry/components/wallet-stack/wallet-stack-format.ts",
  cover: "registry/components/cover-flow/cover-flow-format.ts",
  table: "registry/components/sortable-data-table/sortable-data-table-format.ts",
  moneyInput: "registry/components/money-input/money-input-format.ts",
  numberField: "registry/components/number-field/number-field-format.ts",
  calendar: "registry/components/calendar/calendar-format.ts",
  datePicker: "registry/components/date-picker/date-picker-format.ts",
  dropzone: "registry/components/file-dropzone/file-dropzone-format.ts",
  stepper: "registry/components/stepper/stepper-status.ts",
  revision: "registry/components/revision-diff/revision-diff-format.ts",
  calendarMath: "registry/components/week-calendar/calendar-math.ts",
};
const mods = {};
let temp;
let math;
let money;
let validate;
let mask;
let abacusDate;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-bicim-"));
  // Beklenen değerler ABACUS'tan alınır; paket TypeScript kaynağı taşıdığı için o da paketlenir.
  const abacusOut = path.join(temp, "abacus.mjs");
  await build({ stdin: { contents: 'export * from "@snn/abacus-core";', resolveDir: root }, bundle: true, format: "esm", platform: "node", outfile: abacusOut, logLevel: "silent" });
  ({ math, money, validate, mask, date: abacusDate } = await import(pathToFileURL(abacusOut).href));
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

test("çizgi grafik ölçeği: varsayılan sıfırdan başlar, \"auto\" verinin aralığına oturur, dar aralıkta etiketler ayrışır", () => {
  assert.deepEqual(mods.lineScale.niceScale(49.4, 49.55), { min: 0, max: 60, step: 20, ticks: [0, 20, 40, 60] });
  const auto = mods.lineScale.niceScale(49.4, 49.55, "auto");
  assert.deepEqual(auto, { min: 49.4, max: 49.55, step: 0.05, ticks: [49.4, 49.45, 49.5, 49.55] });
  assert.deepEqual(auto.ticks.map(value => mods.line.formatLineTick(value, mods.lineScale.tickDigits(auto.step))), ["49,4", "49,45", "49,5", "49,55"]);
  const flat = mods.lineScale.niceScale(50, 50, "auto");
  assert.ok(flat.min < 50 && flat.max > 50 && flat.max - flat.min <= 2, "düz seri %1 açılır");
  assert.equal(mods.lineScale.niceScale(-5, 10, "zero").min, -5);
  assert.equal(mods.lineScale.tickDigits(5), 1);
  assert.equal(mods.lineScale.tickDigits(0.25), 2);
  assert.equal(mods.line.formatLineTick(1250000, 3), "1,25Mn");
});

test("kişi simgesi: baş harf parantezi atar, tire ve alt çizgiyi ayraç sayar, Türkçe büyütür", () => {
  assert.equal(mods.avatar.avatarInitials("trade-kasa (tarayıcı)"), "TK");
  assert.equal(mods.avatar.avatarInitials("Gunum-Var (grup harcama)"), "GV");
  assert.equal(mods.avatar.avatarInitials("ismail yılmaz"), "İY");
  assert.equal(mods.avatar.avatarInitials("snn_ui"), "SU");
  assert.equal(mods.avatar.avatarInitials("\"Ayşe\" Kaya"), "AK");
  assert.equal(mods.avatar.avatarInitials("Sinan"), "S");
  assert.equal(mods.avatar.avatarInitials("  "), "");
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

test("kullanıma göre fiyat: döküm, öneri, tutar ve kısa kullanım yazımı ABACUS çıktısıdır", () => {
  const starter = { key: "starter", name: "Başlangıç", seatPrice: 129, includedUsage: 1000000, overagePerMillion: 95, maxSeats: 10, features: ["a"] };
  const team = { key: "team", name: "Takım", seatPrice: 229, includedUsage: 5000000, overagePerMillion: 70, maxSeats: 50, features: ["a", "b"] };
  const detail = mods.usagePricing.breakdown(team, 18, 15000000, "month", 20);
  assert.equal(detail.seatLineMinor, 18 * 22900);
  assert.equal(detail.overage, 10000000);
  assert.equal(detail.overageLineMinor, 70000);
  assert.equal(detail.periodMinor, 18 * 22900 + 70000);
  const year = mods.usagePricing.breakdown(team, 18, 15000000, "year", 20);
  assert.equal(year.periodMinor, Math.round((18 * 22900 + 70000) * 12 * 0.8));
  assert.equal(year.savingsMinor, (18 * 22900 + 70000) * 12 - year.periodMinor);
  assert.equal(mods.usagePricing.breakdown(team, 3, 100000, "month", 20).overageLineMinor, 0);
  assert.equal(mods.usagePricing.recommendPlan([starter, team], 5, 500000).key, "starter");
  assert.equal(mods.usagePricing.recommendPlan([starter, team], 18, 500000).key, "team");
  assert.equal(mods.usagePricing.recommendPlan([starter, team], 100, 500000), null);
  assert.deepEqual([...mods.usagePricing.newFeatures([starter, team], team)], ["b"]);
  assert.equal(mods.usagePricing.minorMoney(448200), money.formatMajor(4482, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.usagePricing.minorMoney(448200), "₺4.482,00");
  assert.equal(mods.usagePricing.usageShort(15000000), money.compactMajor(15000000, { style: "B/Mn/Mr" }).replace("₺", ""));
  assert.equal(mods.usagePricing.usageFull(15000000), money.fmtDecimalGrouped(15000000, 0));
  assert.equal(mods.usagePricing.overageText(2500000), "2,5 Mn");
  assert.equal(mods.usagePricing.percentText(20), money.percent(20, 0));
});

test("satış ortak yazımı: fiyat, tutar ve kuruş hesabı ABACUS çıktısıdır", () => {
  assert.equal(mods.shop.priceText(1250), money.formatMajor(1250, { currency: "TRY", digits: 0 }));
  assert.equal(mods.shop.priceText(1250), "₺1.250");
  assert.equal(mods.shop.priceText(1250.5), money.formatMajor(1250.5, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.shop.priceText(1250.5), "₺1.250,50");
  assert.equal(mods.shop.exactText(480180), "₺4.801,80");
  assert.equal(mods.shop.signedMinorText(1500), "+₺15,00");
  assert.equal(mods.shop.signedMinorText(-1500), money.formatMajor(-15, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.shop.toMinor(12.35), 1235);
  assert.equal(mods.shop.lineMinor(1999, 3), 5997);
  assert.equal(mods.shop.countText(1234), "1.234");
  assert.equal(mods.shop.averageText(4.64), "4,6");
  assert.equal(mods.shop.percentText(20), money.percent(20, 0));
});

test("ürün listesi: fiyat sınırları, süzgeç ve sıralama doğru; yazımlar ABACUS çıktısıdır", () => {
  const base = { sizes: ["S"], inStock: true, photo: { alt: "x" } };
  const list = [
    { id: "a", name: "A", price: 395.5, colors: ["siyah"], addedAt: 1, ...base },
    { id: "b", name: "B", price: 1210, colors: ["krem"], addedAt: 3, ...base, inStock: false },
    { id: "c", name: "C", price: 640, colors: ["siyah", "haki"], addedAt: 2, ...base, sizes: ["M", "L"] },
  ];
  const bounds = mods.listing.priceBounds(list);
  assert.deepEqual(bounds, [390, 1210]);
  assert.deepEqual(mods.listing.priceBounds([]), [0, 0]);
  const open = mods.listing.initialFilters(bounds);
  assert.equal(mods.listing.activeFilterCount(open, bounds), 0);
  assert.deepEqual(mods.listing.visibleProducts(list, { ...open, colors: ["haki", "krem"] }, "featured").map(item => item.id), ["b", "c"]);
  assert.deepEqual(mods.listing.visibleProducts(list, { ...open, sizes: ["L"] }, "featured").map(item => item.id), ["c"]);
  assert.deepEqual(mods.listing.visibleProducts(list, { ...open, inStockOnly: true }, "price-desc").map(item => item.id), ["c", "a"]);
  assert.deepEqual(mods.listing.visibleProducts(list, open, "newest").map(item => item.id), ["b", "c", "a"]);
  assert.deepEqual(mods.listing.visibleProducts(list, { ...open, range: [400, 700] }, "price-asc").map(item => item.id), ["c"]);
  assert.equal(mods.listing.activeFilterCount({ ...open, range: [400, 1210], colors: ["siyah"], inStockOnly: true }, bounds), 3);
  assert.deepEqual(mods.listing.moveRange([390, 700], "low", 1000, bounds), [700, 700]);
  assert.deepEqual(mods.listing.moveRange([390, 700], "high", 12, bounds), [390, 390]);
  assert.deepEqual(mods.listing.moveRange([390, 700], "low", 403, bounds), [400, 700]);
  assert.equal(mods.listing.productCountText(1234), "1.234 ürün");
  assert.equal(mods.listing.rangeText([390, 1210]), "₺390 – ₺1.210");
  assert.equal(mods.listing.filtersButtonText(2), "Süzgeçler (2)");
  assert.equal(mods.listing.addedText("Mont", "M"), "Mont, M sepete eklendi.");
});

test("ürün sayfası: tükenme, kuruş tutarı, yorum dağılımı ve yazımlar ABACUS çıktısıdır", () => {
  const sizes = [{ value: "s", label: "Küçük", price: 2400 }, { value: "l", label: "Büyük", price: 4250.5, soldOutIn: ["ceviz"] }];
  assert.equal(mods.detail.isSoldOut(sizes[1], "ceviz"), true);
  assert.equal(mods.detail.isSoldOut(sizes[1], "mese"), false);
  assert.equal(mods.detail.keepSize(sizes, "l", "ceviz"), "");
  assert.equal(mods.detail.keepSize(sizes, "l", "mese"), "l");
  assert.equal(mods.detail.totalMinor(4250.5, 3), 1275150);
  assert.equal(mods.detail.addLabel(2400, 2), "Sepete ekle · " + money.formatMajor(4800, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.detail.addLabel(2400, 2), "Sepete ekle · ₺4.800,00");
  const reviews = [128, 41, 12, 4, 3];
  assert.equal(mods.detail.reviewTotal(reviews), 188);
  assert.equal(Math.round(mods.detail.reviewAverage(reviews) * 100), 453);
  assert.equal(mods.detail.reviewAverage([0, 0, 0, 0, 0]), null);
  assert.deepEqual(mods.detail.barRatios([4, 2, 0, 0, 1]), [1, .5, 0, 0, .25]);
  assert.equal(mods.detail.averageLabel(reviews), "4,5 / 5");
  assert.equal(mods.detail.averageLabel([0, 0, 0, 0, 0]), "Henüz yorum yok");
  assert.equal(mods.detail.reviewCountText(1234), "1.234 yorum");
  assert.equal(mods.detail.barRowLabel(5, 128), "5 yıldız, 128 yorum");
  assert.equal(mods.detail.sizeLabel(sizes[1], true), "Büyük · ₺4.250,50 · Tükendi");
  assert.equal(mods.detail.counterText(0, 4), "1 / 4");
});

test("sepet: toplam, kargo eşiği, kupon indirimi ve yazımlar kuruş tamsayısıyla ve ABACUS çıktısıdır", () => {
  const photo = { alt: "x" };
  const lines = [{ id: "a", name: "Kupa", price: 185, quantity: 2, photo }, { id: "b", name: "Örtü", price: 649.9, quantity: 1, photo }];
  const rule = { fee: 49.9, freeFrom: 1000 };
  const totals = mods.cart.cartTotals(lines, rule, null);
  assert.equal(totals.subtotalMinor, 101990);
  assert.equal(totals.shippingMinor, 0);
  assert.equal(totals.freeShipping, true);
  assert.equal(totals.totalMinor, 101990);
  const small = mods.cart.cartTotals([lines[0]], rule, null);
  assert.equal(small.shippingMinor, 4990);
  assert.equal(small.remainingMinor, 63000);
  assert.equal(small.progress, .37);
  assert.equal(small.totalMinor, 37000 + 4990);
  assert.equal(mods.cart.shippingText(small), "Ücretsiz kargo için " + money.formatMajor(630, { currency: "TRY", digits: 2, kurus: true }) + " kaldı");
  assert.equal(mods.cart.shippingText(totals), "Ücretsiz kargo kazandınız");
  assert.equal(mods.cart.discountOf(101990, { code: "A", percent: 10 }), 10199);
  assert.equal(mods.cart.discountOf(3000, { code: "B", amount: 50 }), 3000);
  assert.equal(mods.cart.discountOf(101990, null), 0);
  assert.equal(mods.cart.cartTotals(lines, rule, { code: "A", percent: 10 }).totalMinor, 101990 - 10199);
  assert.equal(mods.cart.cartTotals([], rule, null).totalMinor, 0);
  assert.equal(mods.cart.quantityOf(lines), 3);
  assert.equal(mods.cart.addLine(lines, lines[0]).find(line => line.id === "a").quantity, 3);
  assert.equal(mods.cart.addLine(lines, { id: "c", name: "C", price: 1, photo }).length, 3);
  assert.deepEqual(mods.cart.setQuantity(lines, "a", 0).map(line => line.id), ["b"]);
  assert.equal(mods.cart.lineTotalText(lines[0]), "₺370,00");
  assert.equal(mods.cart.cartButtonLabel(1234), "Sepet, 1.234 ürün");
  assert.equal(mods.cart.couponAppliedText("HOSGELDIN", 10199), "HOSGELDIN kuponu uygulandı, ₺101,99 indirim.");
  assert.equal(mods.cart.orderText(101990), "Siparişiniz alındı. Toplam ₺1.019,90.");
});

test("sipariş özeti: indirim, kupon, vergi ve toplam kuruş tamsayısıyla ve ABACUS çıktısıdır", () => {
  const auto = [{ id: "y", label: "Yıllık", amount: 478.08 }];
  const base = mods.checkout.summarize(478080, auto, null, 20);
  assert.equal(base.netMinor, 430272);
  assert.equal(base.taxMinor, 86054);
  assert.equal(base.totalMinor, 516326);
  const withCode = mods.checkout.summarize(478080, auto, { code: "A", percent: 15 }, 20);
  assert.equal(withCode.couponMinor, 64541);
  assert.equal(withCode.totalMinor, Math.round((430272 - 64541) * 1.2));
  assert.equal(mods.checkout.summarize(478080, auto, { code: "B", amount: 100 }, null).couponMinor, 10000);
  assert.equal(mods.checkout.summarize(478080, auto, null, null).taxMinor, null);
  assert.equal(mods.checkout.summarize(478080, auto, null, null).totalMinor, 430272);
  assert.equal(mods.checkout.summarize(5000, [], { code: "C", amount: 100 }, 20).totalMinor, 0);
  assert.equal(mods.checkout.summarize(5000, [{ id: "x", label: "X", amount: 80 }], null, 20).netMinor, 0);
  assert.equal(mods.checkout.payLabel(516326), money.formatMajor(5163.26, { currency: "TRY", digits: 2, kurus: true }) + " öde");
  assert.equal(mods.checkout.payLabel(516326), "₺5.163,26 öde");
  assert.equal(mods.checkout.taxLabel(20), "Vergi · " + money.percent(20, 0));
  assert.equal(mods.checkout.negativeText(64541), "-₺645,41");
  assert.equal(mods.checkout.removeCodeLabel("A"), "Kodu kaldır: A");
  assert.equal(mods.checkout.totalSentence(516326), "Ödenecek toplam ₺5.163,26");
});

test("hesap kartı: tutar doğrulama, hareket arama, grafik yolu ve yazımlar ABACUS çıktısıdır", () => {
  assert.deepEqual(mods.wallet.checkAmount("", "send", 100000), { minor: null, error: "Tutarı girin." });
  assert.equal(mods.wallet.checkAmount("0", "deposit", 0).error, "Tutar sıfırdan büyük olmalı.");
  assert.equal(mods.wallet.checkAmount("1.250,5", "send", 200000).minor, 125050);
  assert.equal(mods.wallet.checkAmount("1.250,5", "send", 100000).error, "Tutar bakiyenizi aşıyor.");
  assert.equal(mods.wallet.checkAmount("1.250,5", "deposit", 100000).minor, 125050);
  assert.equal(mods.wallet.checkAmount("12,345", "deposit", 0).error, "En çok iki ondalık yazılabilir.");
  assert.equal(mods.wallet.checkAmount("abc", "deposit", 0).error, "Geçerli bir tutar girin.");
  const list = [{ id: "1", title: "ÇİÇEK siparişi", date: "2026-10-14", source: "Işık Ltd.", amount: -120 }, { id: "2", title: "Kira", date: "2026-10-10", amount: -9500 }];
  assert.deepEqual(mods.wallet.filterTransactions(list, "çiçek").map(item => item.id), ["1"]);
  assert.deepEqual(mods.wallet.filterTransactions(list, "ışık").map(item => item.id), ["1"]);
  assert.deepEqual(mods.wallet.filterTransactions(list, "10.10.2026").map(item => item.id), ["2"]);
  assert.equal(mods.wallet.filterTransactions(list, " ").length, 2);
  const shape = mods.wallet.chartGeometry([{ date: "2026-10-01", value: 100 }, { date: "2026-10-02", value: 200 }, { date: "2026-10-03", value: 150 }]);
  assert.ok(shape.line.startsWith("M0 ") && shape.area.endsWith("Z"));
  assert.equal(shape.dots.length, 3);
  assert.equal(mods.wallet.chartGeometry([]).line, "");
  assert.equal(mods.wallet.balanceText(128450.5), money.formatMajor(128450.5, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.wallet.balanceText(128450.5), "₺128.450,50");
  assert.equal(mods.wallet.changeText(12300), "+₺12.300,00 bu ay");
  assert.equal(mods.wallet.changeText(-1800), "-₺1.800,00 bu ay");
  assert.equal(mods.wallet.transactionAmountText(-18450), "-₺18.450,00");
  assert.equal(mods.wallet.pointText({ date: "2026-10-14", value: 1000 }), "14 Ekim 2026: ₺1.000,00");
  assert.equal(mods.wallet.transactionMeta(list[0]), "14.10.2026 · Işık Ltd.");
  assert.equal(mods.wallet.submitLabel("send", 125050), "₺1.250,50 gönder");
  assert.equal(mods.wallet.submitLabel("deposit", 125050), "₺1.250,50 ekle");
  assert.equal(mods.wallet.submitLabel("convert", null), "Çevir");
});

test("ödeme akışı: döngü karesi, yol üstünde konum, yerleşim ve yazımlar ABACUS çıktısıdır", () => {
  const economics = { amount: 2400, commission: 69.6 };
  assert.equal(mods.flow.netOf(economics), 2330.4);
  assert.equal(mods.flow.chipText("amount", economics), "₺2.400,00");
  assert.equal(mods.flow.chipText("net", economics), money.formatMajor(2330.4, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.flow.chipText("net", economics), "₺2.330,40");
  assert.equal(mods.flow.chipText("approved", economics), "✓ Onaylandı");
  assert.equal(mods.flow.statusText("commission", economics), "Komisyon ₺69,60");
  assert.equal(mods.flow.statusText("risk", economics), "Risk denetleniyor");
  assert.equal(mods.flow.secondsText(1.84), "1,84 sn");
  assert.equal(mods.flow.secondsText(0), "0,00 sn");
  assert.equal(mods.flow.balanceAfter(18250, 3, economics), 18250 + 3 * 2330.4);
  assert.equal(mods.flow.balanceText(25241.2), "₺25.241,20");
  // yol üstünde konum
  assert.deepEqual(mods.flow.pointOnPath([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], .5), { x: 10, y: 0 });
  assert.deepEqual(mods.flow.pointOnPath([{ x: 0, y: 0 }, { x: 10, y: 0 }], 2), { x: 10, y: 0 });
  // döngü: tek zaman fonksiyonu, kesintisiz tekrar
  const start = mods.flow.cycleFrame(0), wrapped = mods.flow.cycleFrame(1), negative = mods.flow.cycleFrame(-1);
  assert.deepEqual(start, wrapped);
  assert.deepEqual(start, negative);
  assert.equal(start.statuses[0], "touch");
  assert.equal(mods.flow.cycleFrame(.2).statuses[1], "risk");
  assert.equal(mods.flow.cycleFrame(.38).statuses[2], "routed");
  assert.equal(mods.flow.cycleFrame(.54).statuses[3], "approved");
  assert.equal(mods.flow.cycleFrame(.7).chip, "approved");
  assert.equal(mods.flow.cycleFrame(.7).leg, "back");
  assert.equal(mods.flow.cycleFrame(.82).chip, "gross");
  assert.equal(mods.flow.cycleFrame(.88).statuses[1], "commission");
  assert.equal(mods.flow.cycleFrame(.88).chip, "net");
  assert.equal(mods.flow.cycleFrame(.99).statuses[4], "paid");
  assert.equal(mods.flow.cycleFrame(.99).chip, null);
  assert.equal(mods.flow.STATIC_FRAME.chip, "net");
  // yerleşim: geniş kapta yatay, 700 px altında dikey; komisyon noktası takas yolunun üçüncü noktasıdır
  const wide = mods.flow.layoutFor(900), narrow = mods.flow.layoutFor(400);
  assert.equal(wide.vertical, false);
  assert.equal(narrow.vertical, true);
  assert.deepEqual(wide.settle[2], wide.commission);
  assert.deepEqual(narrow.settle[2], narrow.commission);
  assert.deepEqual(mods.flow.positionOf(mods.flow.cycleFrame(0), wide), wide.stops[0]);
  assert.deepEqual(mods.flow.positionOf(mods.flow.cycleFrame(.88), wide), wide.commission);
  assert.deepEqual(mods.flow.positionOf(mods.flow.cycleFrame(.99), wide), wide.balance);
  const split = mods.flow.settleSplit(wide);
  assert.ok(split > 0 && split < 1);
  assert.deepEqual(mods.flow.lineFills(mods.flow.cycleFrame(.99), .99, split), { main: 0, back: 0, settle: 0 });
  assert.equal(mods.flow.lineFills(mods.flow.cycleFrame(.7), .7, split).main, 1);
  assert.match(mods.flow.describeFlow(economics, mods.flow.DEFAULT_STOPS, "ertesi iş günü"), /₺2\.400,00 tutarındaki ödeme.*₺69,60 komisyon.*₺2\.330,40 net tutar ertesi iş günü/);
});

test("karşılama kaydı: e-posta süzme, sakin doğrulama ve yazım önerisi ABACUS kurallarıdır; sayılar ABACUS çıktısıdır", () => {
  assert.equal(mods.hero.cleanEmail("  ALI@Site.COM "), "ali@site.com");
  assert.equal(mods.hero.cleanEmail("IRMAK @ SITE.com"), "irmak@site.com");
  assert.equal(mods.hero.emailProblem(""), "E-posta adresinizi yazın.");
  assert.equal(mods.hero.emailProblem("ali"), "Adreste @ işareti eksik.");
  assert.equal(mods.hero.emailProblem("@site.com"), "@ işaretinden önce bir ad yazın.");
  assert.equal(mods.hero.emailProblem("ali@site"), "Alan adı tamamlanmamış (örneğin ad@site.com).");
  assert.equal(mods.hero.emailProblem("ali@site."), "Alan adı tamamlanmamış (örneğin ad@site.com).");
  assert.equal(mods.hero.emailProblem("ali@site.com"), null);
  assert.equal(mods.hero.emailProblem("ali@site.com"), validate.email("ali@site.com") ? null : "x");
  assert.equal(mods.hero.suggestEmail("ali@gmial.com"), "ali@gmail.com");
  assert.equal(mods.hero.suggestEmail("ali@hotmail.con"), "ali@hotmail.com");
  assert.equal(mods.hero.suggestEmail("ali@gmail.com"), null);
  assert.equal(mods.hero.suggestEmail("ali"), null);
  assert.equal(mods.hero.suggestionText("ali@gmail.com"), "Şunu mu demek istediniz: ali@gmail.com?");
  assert.equal(mods.hero.peopleText(1284), "1.284 kişi listede");
  assert.equal(mods.hero.peopleText(1284), money.fmtDecimalGrouped(1284, 0) + " kişi listede");
  assert.equal(mods.hero.rankSentence(1285), "Listede 1.285. sıradasınız");
});

test("kaydırmalı anlatı: adım konumu, etkin adım, sekme dolgusu ve yazımlar doğru; sayılar ABACUS çıktısıdır", () => {
  const tops = [0, 400, 800, 1200];
  assert.equal(mods.story.stepPosition(tops, -200, 500), 0);
  assert.equal(mods.story.stepPosition(tops, 0, 500), .5);
  assert.equal(mods.story.stepPosition(tops, 200, 500), 1);
  assert.equal(mods.story.stepPosition(tops, 400, 500), 1.5);
  assert.equal(mods.story.stepPosition(tops, 1000, 500), 3);
  assert.equal(mods.story.stepPosition([], 100, 500), 0);
  assert.equal(mods.story.activeStep(1.4, 4), 1);
  assert.equal(mods.story.activeStep(1.5, 4), 2);
  assert.equal(mods.story.activeStep(9, 4), 3);
  assert.equal(mods.story.activeStep(-1, 4), 0);
  assert.equal(mods.story.tabFill(0, 0), 1);
  assert.equal(mods.story.tabFill(0, 1), 0);
  assert.equal(mods.story.tabFill(.5, 1), .5);
  assert.equal(mods.story.tabFill(2.4, 1), 1);
  assert.equal(mods.story.scrollTargetFor(tops, 2), 800);
  assert.equal(mods.story.scrollTargetFor(tops, 9), 0);
  assert.equal(mods.story.stepLabel(1, 4), "Adım 2/4");
  assert.equal(mods.story.stepLabel(0, 1234), "Adım 1/1.234");
  assert.equal(mods.story.FAILED_TEXT("Kopyalama"), "Kopyalama yapılamadı");
});

test("özellik ızgarası: sütun sayısı, kart kaplaması, ışık konumu ve yazımlar doğru; sayılar ABACUS çıktısıdır", () => {
  assert.equal(mods.spotlight.columnsFor(0), 3);
  assert.equal(mods.spotlight.columnsFor(519), 1);
  assert.equal(mods.spotlight.columnsFor(520), 2);
  assert.equal(mods.spotlight.columnsFor(819), 2);
  assert.equal(mods.spotlight.columnsFor(820), 3);
  assert.equal(mods.spotlight.spanFor(true, 3), 2);
  assert.equal(mods.spotlight.spanFor(true, 1), 1);
  assert.equal(mods.spotlight.spanFor(undefined, 3), 1);
  const rect = { left: 100, top: 50, width: 200, height: 120 };
  assert.deepEqual(mods.spotlight.glowAt(rect, 150, 80), { x: 50, y: 30 });
  assert.deepEqual(mods.spotlight.glowAt(rect, 20, 500), { x: 0, y: 120 });
  assert.deepEqual(mods.spotlight.glowAt(rect, 900, -5), { x: 200, y: 0 });
  assert.equal(mods.spotlight.closeLabel("Gecikme"), "Gecikme: ayrıntıyı kapat");
  assert.equal(mods.spotlight.cardCountText(1234), "1.234 özellik");
});

test("fotoğraf görüntüleyici: sığdırma, yakınlaştırma, kaydırma sınırı, eşikler ve sayaç doğru; sayılar ABACUS çıktısıdır", () => {
  assert.deepEqual(mods.viewer.fitRect(800, 1000, 1000, 600), { left: 260, top: 0, width: 480, height: 600 });
  assert.deepEqual(mods.viewer.fitRect(1000, 500, 1000, 1000, 100), { left: 100, top: 300, width: 800, height: 400 });
  assert.equal(mods.viewer.clampZoom(9), 4);
  assert.equal(mods.viewer.clampZoom(.2), 1);
  assert.equal(mods.viewer.zoomIn(1), 1.5);
  assert.equal(mods.viewer.zoomOut(1), 1);
  assert.equal(mods.viewer.zoomIn(3), 4);
  const rect = { left: 0, top: 0, width: 400, height: 300 };
  assert.deepEqual(mods.viewer.panLimit(rect, 2), { x: 200, y: 150 });
  assert.deepEqual(mods.viewer.panLimit(rect, 1), { x: 0, y: 0 });
  assert.deepEqual(mods.viewer.clampPan({ x: 999, y: -999 }, rect, 2), { x: 200, y: -150 });
  assert.deepEqual(mods.viewer.zoomAround({ x: 100, y: 0 }, { x: 0, y: 0 }, 1, 2), { x: -100, y: 0 });
  assert.equal(mods.viewer.swipeStep(-120, 0, 1, 5), 1);
  assert.equal(mods.viewer.swipeStep(120, 0, 1, 5), -1);
  assert.equal(mods.viewer.swipeStep(120, 0, 0, 5), 0);
  assert.equal(mods.viewer.swipeStep(-120, 0, 4, 5), 0);
  assert.equal(mods.viewer.swipeStep(-10, -900, 1, 5), 1);
  assert.equal(mods.viewer.swipeStep(-10, -100, 1, 5), 0);
  assert.equal(mods.viewer.pullCloses(130, 0), true);
  assert.equal(mods.viewer.pullCloses(40, 800), true);
  assert.equal(mods.viewer.pullCloses(40, 100), false);
  assert.equal(mods.viewer.pinchZoom(1, 100, 200), 2);
  assert.equal(mods.viewer.pinchZoom(2, 100, 400), 4);
  assert.equal(mods.viewer.pinchZoom(2, 0, 400), 2);
  assert.equal(mods.viewer.counterText(1, 12), "2 / 12");
  assert.equal(mods.viewer.counterText(0, 1234), "1 / 1.234");
  assert.equal(mods.viewer.openText({ alt: "Kıyı", title: "Kıyıda gün batımı" }, 0, 3), "Kıyıda gün batımı aç, 1 / 3 fotoğraf");
  assert.equal(mods.viewer.zoomPercent(2.5), "250");
});

test("ürün galerisi: tükenen beden, ok tuşuyla gezme, büyüteç kayması ve yazımlar doğru", () => {
  const sizes = [{ value: "S", label: "S" }, { value: "M", label: "M", soldOutIn: ["orman"] }, { value: "L", label: "L" }, { value: "XL", label: "XL", soldOutIn: ["orman"] }];
  assert.equal(mods.gallery.isSoldOut(sizes[1], "orman"), true);
  assert.equal(mods.gallery.isSoldOut(sizes[1], "kum"), false);
  assert.equal(mods.gallery.keepSize(sizes, "M", "orman"), "");
  assert.equal(mods.gallery.keepSize(sizes, "M", "kum"), "M");
  assert.equal(mods.gallery.keepSize(sizes, "", "kum"), "");
  assert.equal(mods.gallery.stepSize(sizes, "orman", "S", 1), "L");
  assert.equal(mods.gallery.stepSize(sizes, "orman", "L", 1), "L");
  assert.equal(mods.gallery.stepSize(sizes, "orman", "L", -1), "S");
  assert.equal(mods.gallery.stepSize(sizes, "kum", "S", 1), "M");
  assert.equal(mods.gallery.edgeSize(sizes, "orman", "last"), "L");
  assert.equal(mods.gallery.edgeSize(sizes, "kum", "last"), "XL");
  assert.equal(mods.gallery.edgeSize([{ value: "S", label: "S", soldOutIn: ["a"] }], "a", "first"), "");
  assert.equal(mods.gallery.soldOutText("Orman", "M"), "Orman için M tükendi");
  assert.deepEqual(mods.gallery.lensShift({ x: 100, y: 50 }, 2.5, 72), { x: -178, y: -53 });
  assert.deepEqual(mods.gallery.clampPoint({ left: 10, top: 10, width: 100, height: 200 }, 500, -5), { x: 100, y: 0 });
  assert.equal(mods.gallery.mainLabel({ alt: "Ön görünüm" }, 1, 4), "Ön görünüm, 2 / 4");
});

test("fotoğraf duvarı: sütun sayısı ve en kısa sütuna dağılım doğru; sayılar ABACUS çıktısıdır", () => {
  assert.equal(mods.lightbox.masonryColumns(0), 2);
  assert.equal(mods.lightbox.masonryColumns(300), 2);
  assert.equal(mods.lightbox.masonryColumns(580, 180, 12), 3);
  assert.equal(mods.lightbox.masonryColumns(1000, 180, 12), 5);
  assert.equal(mods.lightbox.masonryColumns(1000, 300, 0), 3);
  const sized = [{ width: 100, height: 200 }, { width: 100, height: 100 }, { width: 100, height: 100 }, { width: 100, height: 50 }];
  assert.deepEqual(mods.lightbox.assignColumns(sized, 2), [[0, 3], [1, 2]]);
  assert.deepEqual(mods.lightbox.assignColumns(sized, 1), [[0, 1, 2, 3]]);
  assert.deepEqual(mods.lightbox.assignColumns([], 3), [[], [], []]);
  assert.deepEqual(mods.lightbox.assignColumns(sized, 0), [[0, 1, 2, 3]]);
  assert.equal(mods.lightbox.galleryCountText(1234), "1.234 fotoğraf");
});

test("fotoğraf ızgarası: seviye, sıkıştırma, ok tuşuyla odak ve yazımlar doğru; sayılar ABACUS çıktısıdır", () => {
  assert.deepEqual([...mods.pgrid.LEVELS], [5, 3, 2]);
  assert.equal(mods.pgrid.nearestLevel(5), 0);
  assert.equal(mods.pgrid.nearestLevel(3.6), 1);
  assert.equal(mods.pgrid.nearestLevel(2.4), 2);
  assert.equal(mods.pgrid.nearestLevel(1), 2);
  assert.equal(mods.pgrid.stepLevel(0, "in"), 1);
  assert.equal(mods.pgrid.stepLevel(2, "in"), 2);
  assert.equal(mods.pgrid.stepLevel(0, "out"), 0);
  assert.equal(mods.pgrid.stepLevel(2, "out"), 1);
  assert.equal(mods.pgrid.pinchColumns(5, 1), 5);
  assert.equal(mods.pgrid.pinchColumns(5, 2), 2.5);
  assert.equal(mods.pgrid.pinchColumns(5, 9), 2);
  assert.equal(mods.pgrid.pinchColumns(3, .1), 5);
  assert.equal(mods.pgrid.nearestLevel(mods.pgrid.pinchColumns(5, 1.6)), 1);
  assert.equal(mods.pgrid.gridFocus("ArrowRight", 4, 5, 30), 5);
  assert.equal(mods.pgrid.gridFocus("ArrowLeft", 0, 5, 30), 0);
  assert.equal(mods.pgrid.gridFocus("ArrowDown", 27, 5, 30), 29);
  assert.equal(mods.pgrid.gridFocus("ArrowUp", 2, 5, 30), 0);
  assert.equal(mods.pgrid.gridFocus("PageDown", 2, 5, 30), 17);
  assert.equal(mods.pgrid.gridFocus("PageUp", 20, 5, 30), 5);
  assert.equal(mods.pgrid.gridFocus("Home", 9, 5, 30), 0);
  assert.equal(mods.pgrid.gridFocus("End", 9, 5, 30), 29);
  assert.equal(mods.pgrid.gridFocus("a", 9, 5, 30), 9);
  assert.equal(mods.pgrid.photoCountText(1234), "1.234 fotoğraf");
  assert.equal(mods.pgrid.columnsText(3), "3 sütun");
  assert.equal(mods.pgrid.cellLabel("Kıyı", true), "Kıyı, favori");
  assert.equal(mods.pgrid.cellLabel("Kıyı", false), "Kıyı");
  assert.equal(mods.pgrid.favoriteLabel(true), "Favoriden çıkar");
  assert.equal(mods.pgrid.favoriteLabel(false), "Favoriye ekle");
});

test("görüş sahnesi: sarmalayan gezinme, baş harfler ve yazımlar doğru", () => {
  assert.equal(mods.testimonial.wrapIndex(3, 1, 4), 0);
  assert.equal(mods.testimonial.wrapIndex(0, -1, 4), 3);
  assert.equal(mods.testimonial.wrapIndex(1, 1, 4), 2);
  assert.equal(mods.testimonial.wrapIndex(1, 9, 4), 2);
  assert.equal(mods.testimonial.wrapIndex(2, 1, 0), 0);
  assert.equal(mods.testimonial.initials("Elif Aksoy"), "EA");
  assert.equal(mods.testimonial.initials("  ismail  çelik yıldız "), "İÇ");
  assert.equal(mods.testimonial.initials("ışık"), "I");
  assert.equal(mods.testimonial.initials(""), "");
  assert.equal(mods.testimonial.tabLabel("Elif Aksoy", "Finans müdürü"), "Elif Aksoy, Finans müdürü");
  assert.equal(mods.testimonial.liveText("Elif Aksoy"), "Elif Aksoy görüşü gösteriliyor.");
  assert.equal(mods.testimonial.directionOf(1, 3), 1);
  assert.equal(mods.testimonial.directionOf(3, 1), -1);
});

test("ekip tanıtımı: iletişim satırları, maskeli telefon, sayaç ve baş harfler ABACUS çıktısıdır", () => {
  const member = { id: "e", name: "Elif Aksoy", title: "Kurucu", city: "İzmir", country: "Türkiye", email: "elif@ornek.test", phone: "0532 000 00 11" };
  const rows = mods.team.contactRows(member);
  assert.deepEqual(rows.map(row => row.kind), ["email", "phone"]);
  assert.equal(rows[0].label, "Elif Aksoy e-postasını kopyala");
  assert.equal(rows[1].label, "Elif Aksoy telefonunu kopyala");
  assert.equal(rows[1].shown, "0532 000 00 11");
  const masked = mods.team.contactRows(member, true);
  assert.equal(masked[1].shown, mask.phone("0532 000 00 11"));
  assert.equal(masked[1].shown, "+90 5** *** ** 11");
  assert.equal(masked[1].value, "0532 000 00 11");
  assert.deepEqual(mods.team.contactRows({ id: "x", name: "X", title: "Y" }), []);
  assert.deepEqual(mods.team.contactRows({ id: "x", name: "X", title: "Y", email: "x@ornek.test" }).map(row => row.kind), ["email"]);
  assert.equal(mods.team.placeText(member), "İzmir, Türkiye");
  assert.equal(mods.team.placeText({ city: "Ankara" }), "Ankara");
  assert.equal(mods.team.placeText({}), "");
  assert.equal(mods.team.counterLine(0, 5, "Elif Aksoy"), "1 / 5 · Elif Aksoy");
  assert.equal(mods.team.counterLine(0, 1234, "A"), "1 / 1.234 · A");
  assert.equal(mods.team.profileLive(member), "Elif Aksoy, Kurucu profili gösteriliyor.");
  assert.equal(mods.team.initials("ismail çelik"), "İÇ");
  assert.deepEqual(mods.team.LAYOUTS.map(item => item.value), ["gallery", "filmstrip", "directory", "spotlight"]);
});

test("ses oynatıcı: süre, ses düzeyi ve parça sırası doğru; sayılar ABACUS çıktısıdır", () => {
  assert.equal(mods.player.clock(12), "0:12");
  assert.equal(mods.player.clock(74.9), "1:14");
  assert.equal(mods.player.clock(3725), "62:05");
  assert.equal(mods.player.clock(6000), "100:00");
  assert.equal(mods.player.clock(70000), "1.166:40");
  assert.equal(mods.player.clock(-5), "0:00");
  assert.equal(mods.player.clock(NaN), "0:00");
  assert.equal(mods.player.clock(Infinity), "0:00");
  assert.equal(mods.player.clockPair(12, 24), "0:12 / 0:24");
  assert.equal(mods.player.volumeText(.7), money.percent(70, 0));
  assert.equal(mods.player.volumeText(.7), "%70");
  assert.equal(mods.player.volumeText(0), "%0");
  assert.equal(mods.player.volumeText(3), "%100");
  assert.equal(mods.player.neighbour(0, "prev", 4), 0);
  assert.equal(mods.player.neighbour(3, "next", 4), 3);
  assert.equal(mods.player.neighbour(1, "next", 4), 2);
  assert.equal(mods.player.afterEnd(1, 4), 2);
  assert.equal(mods.player.afterEnd(3, 4), null);
  assert.equal(mods.player.playLabel("Sabah kahvesi"), "Sabah kahvesi çal");
  assert.equal(mods.player.muteLabel(true), "Sesi aç");
  assert.equal(mods.player.muteLabel(false), "Sessize al");
});

test("kart destesi: yalnız son dört hane gösterilir; deste konumu, ok ve sürükleme kararları, yazımlar ABACUS çıktısıdır", () => {
  // güvenlik: tam numara verilse de yalnız son dört hane kalır
  assert.equal(mods.stack.safeLast4("0417"), "0417");
  assert.equal(mods.stack.safeLast4("1234 5678 9012 3456"), "3456");
  assert.equal(mods.stack.safeLast4("12"), "••12");
  assert.equal(mods.stack.safeLast4(""), "••••");
  assert.equal(mods.stack.maskedNumber("1234567890123456"), "•••• •••• •••• 3456");
  assert.equal(mods.stack.maskedNumber("1234567890123456").includes("1234"), false);
  const card = { id: "k", issuer: "Örnek Banka", product: "Metal Kart", last4: "1234567890120417", holder: "A", expiry: "08/29", balance: 48250.75, transactions: [] };
  const label = mods.stack.cardLabel(card, 0, 4);
  assert.equal(label, "Örnek Banka, Metal Kart, son dört hane 0 4 1 7, 1/4, bakiye ₺48.250,75");
  assert.equal(label.includes("12345678"), false);
  assert.equal(mods.stack.expiryText("08/29"), "08/29");
  assert.equal(mods.stack.expiryText("13/29"), "—");
  assert.equal(mods.stack.expiryText("8/29"), "—");
  assert.equal(mods.stack.expiryText(""), "—");
  assert.equal(mods.stack.visibleCards([1, 2, 3, 4, 5, 6, 7, 8]).length, 6);
  // deste konumu
  assert.deepEqual(mods.stack.placeOf(0, 0), { y: -0, scale: 1, opacity: 1, hidden: false });
  assert.equal(mods.stack.placeOf(1, 0).y, -.12);
  assert.ok(mods.stack.placeOf(1, 1).y < mods.stack.placeOf(1, 0).y);
  assert.equal(mods.stack.placeOf(-1, 0).hidden, true);
  assert.equal(mods.stack.placeOf(-1, 0).opacity, 0);
  assert.equal(mods.stack.placeOf(4, 0).hidden, true);
  assert.equal(mods.stack.placeOf(3, 0).hidden, false);
  assert.ok(mods.stack.placeOf(3, 0).opacity < 1 && mods.stack.placeOf(3, 0).opacity > 0);
  // ok tuşları ve sürükleme
  assert.equal(mods.stack.stepFront("ArrowDown", 0, 4), 1);
  assert.equal(mods.stack.stepFront("ArrowRight", 3, 4), 3);
  assert.equal(mods.stack.stepFront("ArrowUp", 0, 4), 0);
  assert.equal(mods.stack.stepFront("ArrowLeft", 2, 4), 1);
  assert.equal(mods.stack.stepFront("Home", 2, 4), 0);
  assert.equal(mods.stack.stepFront("End", 2, 4), 3);
  assert.equal(mods.stack.stepFront("x", 2, 4), 2);
  assert.equal(mods.stack.dragStep(80, 0), 1);
  assert.equal(mods.stack.dragStep(-80, 0), -1);
  assert.equal(mods.stack.dragStep(10, 600), 1);
  assert.equal(mods.stack.dragStep(10, 10), 0);
  // yazımlar
  assert.equal(mods.stack.counterText(0, 4), "1 / 4");
  assert.equal(mods.stack.balanceText({ balance: 48250.75 }), money.formatMajor(48250.75, { currency: "TRY", digits: 2, kurus: true }));
  assert.equal(mods.stack.transactionText(-1240.5), "-₺1.240,50");
  assert.equal(mods.stack.transactionText(5000), "+₺5.000,00");
});

test("derinlikli ray: kart dönüşümü, momentumla oturma, sürükleme, tuşlar ve yazımlar doğru; sayılar ABACUS çıktısıdır", () => {
  const front = mods.cover.coverTransform(0);
  assert.deepEqual([front.x, front.scale, front.rotate, front.shade, front.hidden], [0, 1, -0, 0, false]);
  const right = mods.cover.coverTransform(1), left = mods.cover.coverTransform(-1);
  assert.equal(right.x, -left.x);
  assert.equal(right.x, .62);
  assert.equal(right.rotate, -38);
  assert.equal(left.rotate, 38);
  assert.ok(right.scale < 1 && right.shade > 0);
  assert.ok(mods.cover.coverTransform(2).x > right.x);
  assert.equal(mods.cover.coverTransform(2).rotate, -38);
  assert.ok(mods.cover.coverTransform(.5).z > right.z);
  assert.equal(mods.cover.coverTransform(4, 3).hidden, true);
  assert.equal(mods.cover.coverTransform(3, 3).hidden, false);
  assert.equal(mods.cover.coverTransform(9).scale, .55);
  // oturma: yavaş bırakma en yakın kart, hızlı fırlatma en az bir kart ilerletir, uçlarda sınırlı
  assert.equal(mods.cover.settleIndex(2.4, 0, 8), 2);
  assert.equal(mods.cover.settleIndex(2.6, 0, 8), 3);
  assert.equal(mods.cover.settleIndex(2.1, 1.2, 8), 3);
  assert.equal(mods.cover.settleIndex(2.1, -1.2, 8), 1);
  assert.equal(mods.cover.settleIndex(2.1, 6, 8), 6);
  assert.equal(mods.cover.settleIndex(7.2, 3, 8), 7);
  assert.equal(mods.cover.settleIndex(-.4, -3, 8), 0);
  assert.equal(mods.cover.settleIndex(2.4, .3, 8), 2);
  // sürükleme: sola sürükleme sonraki karta götürür
  assert.ok(mods.cover.dragToPosition(2, -100, 300) > 2);
  assert.ok(mods.cover.dragToPosition(2, 100, 300) < 2);
  assert.equal(mods.cover.dragToPosition(2, 0, 300), 2);
  assert.equal(mods.cover.reducedStep(-60), 1);
  assert.equal(mods.cover.reducedStep(60), -1);
  assert.equal(mods.cover.reducedStep(30), 0);
  assert.equal(mods.cover.railKey("ArrowRight", 3, 8), 4);
  assert.equal(mods.cover.railKey("ArrowRight", 7, 8), 7);
  assert.equal(mods.cover.railKey("ArrowLeft", 0, 8), 0);
  assert.equal(mods.cover.railKey("Home", 5, 8), 0);
  assert.equal(mods.cover.railKey("End", 5, 8), 7);
  assert.equal(mods.cover.railKey("x", 5, 8), 5);
  assert.equal(mods.cover.slideLabel(1, 8, "Zeytinlik"), "2 / 8: Zeytinlik");
  assert.equal(mods.cover.slideLabel(0, 1234, "A"), "1 / 1.234: A");
  assert.equal(mods.cover.tickLabel("Zeytinlik"), "Zeytinlik göster");
  assert.equal(mods.cover.liveText(2, 8, "Taş köprü"), "3 / 8: Taş köprü");
});

test("sıralanabilir tablo: Türkçe alfabe sırası, para kuruştan, sayı ve tarih ABACUS çıktısıdır; sayfa satırı doğru", () => {
  const t = mods.table;
  // ABACUS collate: ç c'den sonra, ı i'den önce; büyük/küçük harf farkı yok
  const cities = ["İzmir", "Çorum", "Iğdır", "Adana", "cide", "Denizli"];
  assert.deepEqual([...cities].sort(t.compareText), ["Adana", "cide", "Çorum", "Denizli", "Iğdır", "İzmir"]);
  // para kuruş tam sayısıdır
  assert.equal(t.formatCell(123450, { format: "money" }), money.format(123450, { currency: "TRY", kurus: true, zero: "symbol" }));
  assert.equal(t.formatCell(123450, { format: "money" }), "₺1.234,50");
  assert.equal(t.formatCell(22075, { format: "money", currency: "USD" }), "$220,75");
  assert.equal(t.formatCell(0, { format: "money" }), "₺0,00");
  // sayı: türüne bakılır, ondalık korunur
  assert.equal(t.formatCell(1234.5), "1.234,5");
  assert.equal(t.formatCell(1234), "1.234");
  assert.equal(t.formatCell(-0.5), "-0,5");
  assert.equal(t.formatCell(12.3456, { digits: 2 }), money.fmtDecimalGrouped(12.3456, 2));
  // tarih: Date ya da ISO gün
  assert.equal(t.formatCell(new Date(2026, 9, 16)), abacusDate.format("2026-10-16", "short"));
  assert.equal(t.formatCell("2026-10-16", { format: "date" }), "16.10.2026");
  // boş ve metin
  assert.equal(t.formatCell(null), "–");
  assert.equal(t.formatCell(""), "–");
  assert.equal(t.formatCell("Proje A"), "Proje A");
  // sayfalama
  assert.equal(t.pageCountOf(48, 10), 5);
  assert.equal(t.pageCountOf(0, 10), 1);
  assert.equal(t.pageCountOf(48), 1);
  assert.equal(t.rangeLabel(2, 10, 48, "kayıt"), "11–20 / 48 kayıt");
  assert.equal(t.rangeLabel(5, 10, 48, "kayıt"), "41–48 / 48 kayıt");
  assert.equal(t.rangeLabel(101, 10, 2400, "kayıt"), "1.001–1.010 / 2.400 kayıt");
  assert.equal(t.rangeLabel(1, 10, 0, "kayıt"), "0–0 / 0 kayıt");
  assert.equal(t.pageSpan(3, 8, 24), "17–24");
  assert.equal(t.sortAnnouncement("Tutar", "desc"), "Tutar sütununa göre azalan sıralandı");
});

test("para kutusu: taslak kuruşa ABACUS ile okunur, yapıştırma yalnız Türkçe biçimi kabul eder, yazımlar ABACUS çıktısıdır", () => {
  const m = mods.moneyInput;
  assert.equal(m.draftToMinor(""), null);
  assert.equal(m.draftToMinor("1234.5"), 123450);
  assert.equal(m.draftToMinor("1234.56"), 123456);
  assert.equal(m.draftToMinor("12."), 1200);
  assert.equal(m.draftToMinor("0.05"), 5);
  assert.equal(m.draftToMinor("999999999999.99"), 99999999999999);
  assert.equal(m.minorToDraft(123450), "1234.50");
  assert.equal(m.minorToDraft(5), "0.05");
  assert.equal(m.minorToDraft(null), "");
  assert.equal(m.minorToDraft(123456), money.formatMinorInput(123456, 2).split(".").join("").replace(",", "."));
  // gidiş-dönüş: kuruş → taslak → kuruş
  for (const minor of [0, 1, 99, 100, 123456, 99999999999999]) assert.equal(m.draftToMinor(m.minorToDraft(minor)), minor);
  assert.equal(m.pastedToDraft("₺1.234,56"), "1234.56");
  assert.equal(m.pastedToDraft("1234,5"), "1234.50");
  assert.equal(m.pastedToDraft("220,75 USD"), "220.75");
  assert.equal(m.pastedToDraft("1,234.56"), null);
  assert.equal(m.pastedToDraft("abc"), null);
  assert.equal(m.formatAmount(123450, "TRY"), "₺1.234,50");
  assert.equal(m.formatAmount(123450, "EUR"), money.format(123450, { currency: "EUR", kurus: true, zero: "symbol" }));
  assert.equal(m.formatAmount(0, "TRY"), "₺0,00");
  assert.equal(m.formatWhole(100, "TRY"), "₺100");
  assert.equal(m.formatWhole(1000, "USD"), "$1.000");
  assert.equal(m.majorToMinor(100, "TRY"), 10000);
  assert.equal(m.majorToMinor(0.1 + 0.2, "TRY"), 30);
  assert.equal(m.currencyInfo("USD").name, "ABD doları");
  assert.equal(m.currencyInfo("XYZ").code, "TRY");
  assert.deepEqual(m.MONEY_CURRENCIES, ["TRY", "USD", "EUR"]);
  assert.equal(m.matchesTypeahead(m.currencyInfo("TRY"), "TÜ"), true);
  assert.equal(m.matchesTypeahead(m.currencyInfo("EUR"), "e"), true);
  assert.equal(m.matchesTypeahead(m.currencyInfo("USD"), "e"), false);
  assert.equal(m.rangeText("TRY", 1000, 50000), "₺10,00 – ₺500,00");
  assert.equal(m.rangeText("TRY", undefined, 50000), "En çok ₺500,00");
  assert.equal(m.rangeText("TRY", 1000), "En az ₺10,00");
  assert.equal(m.rangeText("TRY"), "");
});

test("sayı alanı: yazım, sütunlar, okuma ve canlı gruplama ABACUS çıktısıdır", () => {
  const n = mods.numberField;
  assert.equal(n.formatValue(1234.5, 1, 1), money.fmtDecimalGrouped(1234.5, 1));
  assert.equal(n.formatValue(1234.5, 0, 2), "1.234,5");
  assert.equal(n.formatValue(3, 2, 2), "3,00");
  assert.equal(n.formatValue(3, 0, 2), "3");
  assert.equal(n.formatValue(-0.5, 1, 1), "-0,5");
  assert.equal(n.formatValue(1234567, 0, 0, false), "1234567");
  assert.equal(n.formatValue(0.1 + 0.2, 0, 2), "0,3");
  // sütunlar basamak değerine göre anahtarlanır
  assert.deepEqual(n.partsOf("1.234,5").map(part => part.key), ["i3", "g3", "i2", "i1", "i0", "d", "f0"]);
  assert.deepEqual(n.partsOf("-12").map(part => part.key), ["m", "i1", "i0"]);
  assert.equal(n.partsOf("9")[0].digit, 9);
  // okuma
  assert.equal(n.parseDraft("1.234,5"), 1234.5);
  assert.equal(n.parseDraft("1234,5"), 1234.5);
  assert.equal(n.parseDraft("12,"), 12);
  assert.equal(n.parseDraft("-12"), -12);
  assert.equal(n.parseDraft(""), null);
  assert.equal(n.parseDraft("-"), null);
  assert.equal(n.parseDraft("1234.56"), money.parseNumber("1234.56"));
  // canlı gruplama: ondalık sınırı, nokta tuşu, eksi
  assert.equal(n.formatDraft("12345", 0, false), "12.345");
  assert.equal(n.formatDraft("12,345", 2, false), "12,34");
  assert.equal(n.formatDraft("12,5", 0, false), "12");
  assert.equal(n.formatDraft("98.5", 2, false), "98,5");
  assert.equal(n.formatDraft("8.5340", 2, false, "8.534"), "85.340");
  assert.equal(n.formatDraft("-1234", 0, true), "-1.234");
  assert.equal(n.formatDraft("-1234", 0, false), "1.234");
  assert.equal(n.formatDraft("12345", 0, false, undefined, false), "12345");
  // imleç: anlamlı karakter sayısı gruplamadan sonra aynı yere döner
  assert.equal(n.significantBefore("1234", 4), 4);
  assert.equal(n.caretAfter("1.234", 4), 5);
  assert.equal(n.caretAfter("1.234", 1), 1);
  assert.equal(n.caretAfter("1.234", 0), 0);
  assert.equal(n.numberInWord("₺1.234,5"), 1234.5);
  assert.equal(n.numberInWord("gün"), null);
});

test("takvim ve tarih seçici: hafta pazartesi başlar, adlar ve yazımlar ABACUS çıktısıdır, tatil listesi okunur", () => {
  const c = mods.calendar, d = mods.datePicker;
  assert.deepEqual(c.weekdayLabels(), ["Pzt", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"].map((_, index) => abacusDate.dayName(`2024-01-0${index + 1}`)));
  assert.equal(c.weekdayLabels()[0], abacusDate.dayName("2026-10-12"));
  assert.equal(c.weekIndex(new Date(2026, 9, 12)), 0);
  assert.equal(c.weekIndex(new Date(2026, 9, 18)), 6);
  assert.equal(c.isoKey(new Date(2026, 0, 5)), "2026-01-05");
  assert.equal(c.monthTitle(new Date(2026, 9, 1)), `${abacusDate.monthName(10)} 2026`);
  assert.equal(c.monthTitle(new Date(2026, 9, 1)), "Ekim 2026");
  assert.equal(c.dayLabel(new Date(2026, 9, 29)), `${abacusDate.format("2026-10-29", "long")} ${abacusDate.dayName("2026-10-29", "long")}`);
  assert.equal(c.dayLabel(new Date(2026, 9, 29), "Cumhuriyet Bayramı"), "29 Ekim 2026 Perşembe, tatil: Cumhuriyet Bayramı");
  const holidays = c.holidayMap([{ date: "2026-10-29", name: "Cumhuriyet Bayramı" }, { date: "2026-10-29", name: "Kurum tatili" }, { date: "2026-02-30", name: "Geçersiz" }, { date: "2026-05-01", name: "" }]);
  assert.equal(holidays.get("2026-10-29"), "Cumhuriyet Bayramı, Kurum tatili");
  assert.equal(holidays.size, 1);
  assert.equal(c.holidayMap().size, 0);
  assert.equal(d.formatPickerDate(new Date(2026, 9, 16)), abacusDate.format("2026-10-16", "long"));
  assert.equal(d.formatPickerDate(new Date(2026, 9, 16), "short"), "16.10.2026");
  assert.deepEqual(d.dateParts(new Date(2026, 9, 16)), [{ type: "part", value: "16" }, { type: "literal", value: " " }, { type: "part", value: "Ekim" }, { type: "literal", value: " " }, { type: "part", value: "2026" }]);
  assert.deepEqual(d.dateParts(new Date(2026, 9, 16), "short").map(part => part.type), ["part", "literal", "part", "literal", "part"]);
});

test("dosya bırakma alanı: boyut, yüzde ve uzantı ABACUS çıktısıdır; tür kuralı Türkçe harfte doğru çalışır", () => {
  const f = mods.dropzone;
  assert.equal(f.formatFileSize(512), "512 B");
  assert.equal(f.formatFileSize(38 * 1024 + 300), "38 KB");
  assert.equal(f.formatFileSize(1.5 * 1024 * 1024), "1,5 MB");
  assert.equal(f.formatFileSize(24 * 1024 * 1024), "24 MB");
  assert.equal(f.formatFileSize(1.2 * 1024 ** 3), "1,2 GB");
  assert.equal(f.formatFileSize(10 * 1024 * 1024), "10 MB");
  assert.equal(f.formatPercent(45.4), money.percent(45, 0));
  assert.equal(f.formatPercent(45.4), "%45");
  assert.equal(f.formatPercent(140), "%100");
  assert.equal(f.extensionOf("RAPOR.PDF"), "pdf");
  assert.equal(f.extensionOf("BENİOKU.TXT"), "txt");
  assert.equal(f.extensionOf(".gizli"), "");
  assert.equal(f.fileKind("keşif.XLSX"), "document");
  assert.equal(f.fileKind("foto.JPEG"), "image");
  assert.equal(f.fileKind("arsiv.7z"), "archive");
  assert.equal(f.fileKind("not"), "other");
  assert.equal(f.matchesAccept({ name: "TEKLİF.PDF", type: "application/pdf" }, ".pdf, .xlsx"), true);
  assert.equal(f.matchesAccept({ name: "cizim.dwg", type: "" }, ".pdf,.xlsx"), false);
  assert.equal(f.matchesAccept({ name: "a.png", type: "image/png" }, "image/*"), true);
  assert.equal(f.matchesAccept({ name: "a.mp4", type: "video/mp4" }, "image/*"), false);
  assert.equal(f.matchesAccept({ name: "a.bin", type: "application/octet-stream" }), true);
  assert.equal(f.noteText(5), "En çok 5 dosya");
  assert.equal(f.noteText(5, ".pdf,.xlsx"), "Kabul edilen: .pdf, .xlsx");
  assert.equal(f.addError(1, 0, false, 5, "cizim.dwg"), "cizim.dwg kabul edilen bir dosya türü değil.");
  assert.equal(f.addError(3, 2, false, 5), "Bazı dosyalar kabul edilen türde olmadığı için eklenmedi.");
  assert.equal(f.addError(3, 3, true, 5), "En çok 5 dosya ekleyebilirsiniz.");
  assert.equal(f.addError(3, 3, false, 5), "");
  assert.equal(f.tooLargeText(10 * 1024 * 1024), "Dosya 10 MB sınırını aşıyor");
});

test("adım göstergesi: durumlar (geri dönüldü dahil), simgeler ve duyurular doğru", () => {
  const s = mods.stepper;
  assert.equal(s.stepStatus({}, 0, 2), "complete");
  assert.equal(s.stepStatus({}, 2, 2), "current");
  assert.equal(s.stepStatus({}, 3, 2), "upcoming");
  assert.equal(s.stepStatus({ returned: true }, 3, 2), "returned");
  // geçerli ya da tamamlanan adımda "geri dönüldü" işareti etkisizdir; hata her şeyin önündedir
  assert.equal(s.stepStatus({ returned: true }, 2, 2), "current");
  assert.equal(s.stepStatus({ returned: true }, 1, 2), "complete");
  assert.equal(s.stepStatus({ error: "Belge eksik", returned: true }, 3, 2), "error");
  assert.equal(s.glyphOf("complete"), "check");
  assert.equal(s.glyphOf("returned"), "return");
  assert.equal(s.glyphOf("error"), "error");
  assert.equal(s.glyphOf("current"), "number");
  assert.equal(s.glyphOf("upcoming"), "number");
  assert.equal(s.statusText.returned, "geri dönüldü");
  assert.equal(s.progressText(2, 10, "Keşif", "Bitti"), "Adım 3 / 10: Keşif");
  assert.equal(s.progressText(10, 10, undefined, "Tüm adımlar tamamlandı"), "Tüm adımlar tamamlandı");
});

test("revizyon karşılaştırması: değişen alanlar, sayılar, özet ve yazımlar ABACUS çıktısıdır", () => {
  const r = mods.revision;
  const fields = [{ key: "name", label: "Kalem" }, { key: "amount", label: "Tutar", format: "money" }, { key: "qty", label: "Miktar" }, { key: "due", label: "Termin", format: "date" }];
  const changed = { key: "k1", status: "changed", before: { name: "Beton C30", amount: 125000, qty: 12.5, due: "2026-10-16" }, after: { name: "Beton C30", amount: 130050, qty: 12.5, due: "2026-11-02" } };
  const diff = r.changedFields(changed, fields);
  assert.deepEqual(diff.map(item => item.field.key), ["amount", "due"]);
  assert.equal(diff[0].before, money.format(125000, { currency: "TRY", kurus: true, zero: "symbol" }));
  assert.equal(diff[0].before, "₺1.250,00");
  assert.equal(diff[0].after, "₺1.300,50");
  assert.equal(diff[1].after, abacusDate.format("2026-11-02", "short"));
  assert.equal(r.formatValue(1234.5, { key: "x", label: "X" }), "1.234,5");
  assert.equal(r.formatValue(-0.5, { key: "x", label: "X" }), "-0,5");
  assert.equal(r.formatValue(null, { key: "x", label: "X" }), "–");
  // aynı yazım aynı sayılır
  assert.deepEqual(r.changedFields({ key: "k", status: "changed", before: { qty: 3 }, after: { qty: 3.0 } }, [{ key: "qty", label: "Miktar" }]), []);
  const rows = [changed, { key: "k2", status: "added", after: { name: "Demir" } }, { key: "k3", status: "added", after: { name: "Kum" } }, { key: "k4", status: "removed", before: { name: "Çakıl" } }, { key: "k5", status: "unmatched", before: { name: "İşçilik" } }, { key: "k6", status: "same", before: { name: "Su" }, after: { name: "Su" } }];
  const counts = r.countByStatus(rows);
  assert.deepEqual(counts, { added: 2, removed: 1, changed: 1, unmatched: 1, same: 1 });
  assert.equal(r.summaryText(counts), "2 eklendi, 1 silindi, 1 değişti, 1 eşlenmedi");
  assert.equal(r.summaryText({ added: 0, removed: 0, changed: 0, unmatched: 0, same: 4 }), "Fark yok");
  assert.equal(r.summaryText({ added: 1200, removed: 0, changed: 0, unmatched: 0, same: 0 }), "1.200 eklendi");
  assert.equal(r.rowTitle(rows[3], fields[0]), "Çakıl");
  assert.equal(r.rowTitle({ key: "k9", status: "added", after: {} }, fields[0]), "k9");
  assert.deepEqual(r.sideFields({ name: "Demir", amount: 5000, qty: "" }, fields).map(item => item.value), ["Demir", "₺50,00"]);
  assert.equal(r.unmatchedSide(rows[4]), "Yalnız önceki sürümde");
  assert.equal(r.unmatchedSide({ key: "x", status: "unmatched", after: {} }), "Yalnız yeni sürümde");
  assert.equal(r.statusLabel.unmatched, "Eşlenmedi");
});

test("hafta takvimi aralık başlığı: boş gün listesi boş metin verir, tek gün, aynı ay ve iki ay ABACUS biçimidir", () => {
  const { rangeTitle } = mods.calendarMath;
  assert.equal(rangeTitle([]), "");
  assert.equal(rangeTitle(["2026-10-14"]), `${abacusDate.format("2026-10-14", "long")} ${abacusDate.dayName("2026-10-14", "long")}`);
  assert.equal(rangeTitle(["2026-10-12", "2026-10-13", "2026-10-18"]), `12–${abacusDate.format("2026-10-18", "long")}`);
  assert.equal(rangeTitle(["2026-10-28", "2026-11-03"]), `${abacusDate.format("2026-10-28", "dayMonth")} – ${abacusDate.format("2026-11-03", "long")}`);
});
