// Dosya yükleme bileşeninin saf yazım ve eşleştirme mantığı (ABACUS'a bağlı).
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
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-upload-"));
  const outfile = path.join(temp, "format.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/file-upload/file-upload-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  f = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("boyut Türkçe yazılır", () => {
  assert.equal(f.formatFileSize(512).replace(/\s/g, " "), "512 B");
  assert.equal(f.formatFileSize(38 * 1024).replace(/\s/g, " "), "38 KB");
  assert.equal(f.formatFileSize(1.5 * 1024 * 1024).replace(/\s/g, " "), "1,5 MB");
  assert.equal(f.formatFileSize(24 * 1024 * 1024).replace(/\s/g, " "), "24 MB");
});

test("yüzde Türkçe yazılır ve sınırlanır", () => {
  assert.equal(f.formatPercent(45), "%45");
  assert.equal(f.formatPercent(140), "%100");
  assert.equal(f.formatPercent(-5), "%0");
});

test("accept: büyük harfli Türkçe ad uzantı kuralına uyar", () => {
  assert.equal(f.matchesAccept({ name: "TEKLİF.PDF", type: "" }, ".pdf"), true);
  assert.equal(f.matchesAccept({ name: "Teklif.Pdf", type: "application/pdf" }, ".PDF, .xlsx"), true);
  assert.equal(f.matchesAccept({ name: "foto.png", type: "image/png" }, "image/*"), true);
  assert.equal(f.matchesAccept({ name: "a.pdf", type: "application/pdf" }, "application/pdf"), true);
  assert.equal(f.matchesAccept({ name: "a.exe", type: "" }, ".pdf,image/*"), false);
  assert.equal(f.matchesAccept({ name: "a.exe", type: "" }, undefined), true);
  assert.equal(f.matchesAccept({ name: "a.exe", type: "" }, " , "), true);
});

test("duyuru ve hata iletileri", () => {
  assert.equal(f.addedStatus(2, 0), "2 dosya eklendi.");
  assert.equal(f.addedStatus(1, 1), "1 dosya eklendi. 1 dosyada sorun var.");
  assert.equal(f.addedStatus(0, 3), "3 dosyada sorun var.");
  assert.match(f.tooLargeText(5 * 1024 * 1024), /^Dosya 5\sMB sınırını aşıyor\.$/);
});
