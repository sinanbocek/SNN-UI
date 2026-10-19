// Galerinin "Yenilikler" listesi: git çıktısından ekleme tarihi ve son 24 saat süzgeci (saf mantık).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";
import { parseAddedLog } from "../scripts/added-dates.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp, news;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-yenilikler-"));
  const outfile = path.join(temp, "news.mjs");
  await build({ entryPoints: [path.join(root, "playground/src/lib/news.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  news = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("git çıktısı: her bileşenin ilk görüldüğü tarih alınır, lib atlanır", () => {
  const log = [
    "@2026-10-01T10:00:00+03:00",
    "registry/components/button/button.tsx",
    "registry/components/lib/motion-tokens.ts",
    "",
    "@2026-10-19T21:20:20+03:00",
    "registry/components/number-input/number-input.tsx",
    "registry/components/button/fresh-dosya.ts",
  ].join("\n");
  assert.deepEqual(parseAddedLog(log), { button: "2026-10-01T10:00:00+03:00", "number-input": "2026-10-19T21:20:20+03:00" });
  assert.deepEqual(parseAddedLog(""), {});
});

test("son 24 saat: katalogdaki fresh bileşenler en fresh önce, eskiler ve bilinmeyenler dışarıda", () => {
  const now = Date.parse("2026-10-20T12:00:00+03:00");
  const dates = {
    old: "2026-10-18T12:00:00+03:00",
    edge: "2026-10-19T12:00:00+03:00",
    fresh: "2026-10-20T09:00:00+03:00",
    missing: "2026-10-20T10:00:00+03:00",
    broken: "tarih değil",
  };
  const known = new Set(["old", "edge", "fresh", "broken"]);
  assert.deepEqual(news.recentNames(dates, known, now), ["fresh", "edge"]);
  assert.deepEqual(news.recentNames(dates, known, now, 1), []);
  assert.deepEqual(news.recentNames({}, known, now), []);
});
