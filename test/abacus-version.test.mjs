// ABACUS sürüm testi: katalogdaki abacus-core aralığı kök package.json ile aynıdır.
// shadcn add kayıttaki aralığı kuran projeye yazar; eski aralık projedeki yeni sürümü düşürür.
// Vaka: Furkan-Ambalaj-Teklif 2026-11-26, kurulum ^4.4.0'ı ^4.3.0'a çekti.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ABACUS_RANGE, components, foundation } from "../scripts/catalog.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

test("katalogdaki ABACUS aralığı kök package.json'daki ile aynı", () => {
  assert.equal(pkg.devDependencies["@snn/abacus-core"], `github:sinanbocek/SNN-Abacus-Core#semver:${ABACUS_RANGE}`);
});

test("hiçbir parça başka bir ABACUS aralığı taşımaz", () => {
  const stale = [...foundation, ...components].flatMap(item =>
    (item.deps ?? []).filter(dep => dep.startsWith("@snn/abacus-core") && !dep.endsWith(`semver:${ABACUS_RANGE}`)).map(dep => `${item.name}: ${dep}`));
  assert.deepEqual(stale, []);
});
