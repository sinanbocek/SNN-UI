// Gruplu tablo ve ağaç görünümünün saf arama mantığı (issue #26).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp, table, tree;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-data-"));
  const load = async (file, name) => {
    const outfile = path.join(temp, `${name}.mjs`);
    await build({ entryPoints: [path.join(root, file)], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
    return import(pathToFileURL(outfile).href);
  };
  table = await load("registry/components/grouped-table/grouped-table-filter.ts", "table");
  tree = await load("registry/components/tree-view/tree-view-search.ts", "tree");
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

const groups = [
  { key: "fx", title: "Döviz", rows: [{ code: "USDTRY", source: "TCMB" }, { code: "EURTRY", source: "TCMB" }] },
  { key: "index", title: "Endeks", rows: [{ code: "XU100", source: "Borsa İstanbul" }, { code: "TUFE", source: "TÜİK" }] },
];
const text = row => `${row.code} ${row.source}`;

test("gruplu tablo: boş arama her şeyi döndürür, toplamı korur", () => {
  const result = table.filterGroups(groups, "  ", text);
  assert.equal(result.matches, 4);
  assert.deepEqual(result.groups.map(group => [group.key, group.rows.length, group.total]), [["fx", 2, 2], ["index", 2, 2]]);
});

test("gruplu tablo: Türkçe harfe duyarsız arama, eşleşmesiz grup düşer, toplam kalır", () => {
  const result = table.filterGroups(groups, "istanbul", text);
  assert.equal(result.matches, 1);
  assert.deepEqual(result.groups.map(group => [group.key, group.rows.length, group.total]), [["index", 1, 2]]);
  assert.equal(table.filterGroups(groups, "tuik", text).matches, 1);
  assert.equal(table.filterGroups(groups, "try tcmb", text).matches, 2, "her kelime geçmeli");
  assert.equal(table.filterGroups(groups, "yok", text).groups.length, 0);
});

const nodes = [
  { id: "01", label: "Gıda", children: [
    { id: "01.1", label: "Süt ürünleri", children: [{ id: "01.1.1", label: "Süt" }, { id: "01.1.2", label: "Peynir" }] },
    { id: "01.2", label: "İçecek", children: [{ id: "01.2.1", label: "Çay", meta: "kod 0121" }] },
  ] },
  { id: "04", label: "Konut" },
];

test("ağaç: boş arama null; eşleşme, üstleri ve görünür düğümler", () => {
  assert.equal(tree.searchTree(nodes, " "), null);
  const result = tree.searchTree(nodes, "sut");
  assert.deepEqual([...result.matches].sort(), ["01.1", "01.1.1"]);
  assert.deepEqual([...result.expand].sort(), ["01", "01.1"]);
  assert.deepEqual([...result.visible].sort(), ["01", "01.1", "01.1.1"]);
});

test("ağaç: ek bilgi de aranır, büyük İ ve ç doğru eşleşir", () => {
  assert.deepEqual([...tree.searchTree(nodes, "0121").matches], ["01.2.1"]);
  assert.deepEqual([...tree.searchTree(nodes, "icecek").matches], ["01.2"]);
  assert.deepEqual([...tree.searchTree(nodes, "cay").expand].sort(), ["01", "01.2"]);
  assert.equal(tree.searchTree(nodes, "yok").matches.size, 0);
});

test("ağaç: üst düğümler ve vurgu aralığı", () => {
  assert.deepEqual(tree.ancestorsOf(nodes, "01.2.1"), ["01", "01.2"]);
  assert.deepEqual(tree.ancestorsOf(nodes, "04"), []);
  assert.deepEqual(tree.ancestorsOf(nodes, "zz"), []);
  assert.deepEqual(tree.matchRange("Süt ürünleri", "urun"), [4, 8]);
  assert.equal(tree.matchRange("Süt", ""), null);
  assert.equal(tree.matchRange("Konut", "sut"), null);
});
