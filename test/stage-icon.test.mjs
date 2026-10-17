// İş panolarının aşama simgesi türü: kimlik ve addaki tanıdık sözcükler, yoksa sıra.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp, mod;
before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-stage-"));
  const outfile = path.join(temp, "stage.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/lib/stage-kind.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  mod = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("aşama türü: tanıdık kimlik ve adlar", () => {
  assert.equal(mod.stageKind("planned", "Planlandı", 0, 4), "planned");
  assert.equal(mod.stageKind("active", "Sürüyor", 1, 4), "progress");
  assert.equal(mod.stageKind("review", "Kontrolde", 2, 4), "review");
  assert.equal(mod.stageKind("done", "Bitti", 3, 4), "done");
  assert.equal(mod.stageKind("todo", "Yapılacak", 0, 4), "planned");
  assert.equal(mod.stageKind("x", "Kontrol bekliyor", 2, 4), "review");
});

test("aşama türü: tanınmayan adlarda sıra", () => {
  assert.deepEqual([0, 1, 2, 3].map(index => mod.stageKind(`s${index}`, `Adım ${index}`, index, 4)), ["planned", "progress", "review", "done"]);
  assert.deepEqual([0, 1, 2].map(index => mod.stageKind(`s${index}`, `Adım ${index}`, index, 3)), ["planned", "progress", "done"]);
});
