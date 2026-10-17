// Açılan aramanın saf mantığı: Türkçe harfe duyarsız sıralama, gruplama, vurgu aralığı.
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
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-search-"));
  const outfile = path.join(temp, "format.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/expanding-search/expanding-search-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  mod = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

const items = [
  { id: "1", title: "Çağrı Merkezi", group: "Projeler" },
  { id: "2", title: "İsmail Yıldız", group: "Kişiler" },
  { id: "3", title: "Yeni Çağrı Kaydı", group: "Projeler" },
  { id: "4", title: "Rapor", meta: "Ismail hazırladı", group: "Belgeler" },
  { id: "5", title: "Işık Teklifi", group: "Belgeler", keywords: ["aydınlatma"] },
];
const ids = list => list.map(item => item.id);

test("Türkçe harfe duyarsız: cagri Çağrı'yı, ismail İsmail'i ve Ismail'i bulur", () => {
  assert.deepEqual(ids(mod.rank(items, "cagri", 10)), ["1", "3"]);
  assert.deepEqual(ids(mod.rank(items, "ISMAIL", 10)), ["2", "4"]);
  assert.deepEqual(ids(mod.rank(items, "isik", 10)), ["5"]);
});

test("sıralama: başlık başı, sözcük başı, sözcük içi, ek bilgi", () => {
  const list = [
    { id: "a", title: "Rapor", keywords: ["çağrı"] },
    { id: "b", title: "Pacagri" },
    { id: "c", title: "Yeni çağrı" },
    { id: "d", title: "Çağrı" },
  ];
  assert.deepEqual(ids(mod.rank(list, "cagri", 10)), ["d", "c", "b", "a"]);
});

test("anahtar sözcük bulur, boş sorgu ve sınır çalışır", () => {
  assert.deepEqual(ids(mod.rank(items, "aydinlatma", 10)), ["5"]);
  assert.deepEqual(mod.rank(items, "   ", 10), []);
  assert.equal(mod.rank(items, "a", 2).length, 2);
});

test("gruplama kaynaktaki ilk görünme sırasını izler", () => {
  const groups = mod.groupBy([items[4], items[2], items[0]], items);
  assert.deepEqual(groups.map(group => [group.name, ids(group.items)]), [["Projeler", ["3", "1"]], ["Belgeler", ["5"]]]);
});

test("vurgu aralığı Türkçe harfle de çalışır; uzunluk değişirse null", () => {
  assert.deepEqual(mod.matchRange("Çağrı Merkezi", "cagri"), [0, 5]);
  assert.deepEqual(mod.matchRange("Yeni İsmail", "ismail"), [5, 11]);
  assert.equal(mod.matchRange("Rapor", "xyz"), null);
  assert.equal(mod.matchRange("Çift  boşluk", "bosluk"), null);
});
