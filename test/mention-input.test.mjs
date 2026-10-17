// Anma önerilerinin saf mantığı: Türkçe harfe duyarsız eşleştirme ve vurgulama.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp, format;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-mention-"));
  const outfile = path.join(temp, "format.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/mention-input/mention-input-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  format = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("cagri, Çağrı Öztürk'ü bulur", () => {
  assert.equal(format.rank("Çağrı Öztürk", "", "cagri"), 4);
});

test("ismail, İsmail'i bulur", () => {
  assert.equal(format.rank("İsmail Yılmaz", "", "ismail"), 4);
  assert.equal(format.rank("İsmail Yılmaz", "", "İSMAİL"), 4);
});

test("puan sırası: baş, sözcük başı, içinde, ek metin, yok", () => {
  assert.equal(format.rank("Ayşe Karaca", "", "ay"), 4);
  assert.equal(format.rank("Ayşe Karaca", "", "kar"), 3);
  assert.equal(format.rank("Ayşe Karaca", "", "ara"), 2);
  assert.equal(format.rank("Ayşe Karaca", "Muhasebe", "muhasebe"), 1);
  assert.equal(format.rank("Ayşe Karaca", "", "zzz"), 0);
  assert.equal(format.rank("Ayşe Karaca", "", ""), 1);
});

test("vurgulama aralığı özgün metne oturur", () => {
  assert.deepEqual(format.matchRange("Çağrı Öztürk", "cagri"), [0, 5]);
  assert.deepEqual(format.matchRange("Çağrı Öztürk", "ozt"), [6, 9]);
  assert.deepEqual(format.matchRange("İsmail Yılmaz", "ismail"), [0, 6]);
  assert.equal(format.matchRange("İsmail Yılmaz", "zzz"), null);
  assert.equal(format.matchRange("İsmail Yılmaz", ""), null);
});
