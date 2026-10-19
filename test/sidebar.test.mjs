// Kenar menüsünde bağlantı basışının türü (saf mantık): düz basış uygulama içinde yönlenir, diğerleri tarayıcıya kalır.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp, click;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-sidebar-"));
  const outfile = path.join(temp, "click.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/sidebar/sidebar-click.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  click = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };

test("düz sol tık uygulama içinde yönlenir", () => {
  assert.equal(click.isPlainClick(plain), true);
});

test("yeni sekme, yeni pencere, indirme, orta tuş ve önlenmiş basış tarayıcıya kalır", () => {
  for (const change of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
    assert.equal(click.isPlainClick({ ...plain, ...change }), false, JSON.stringify(change));
  }
});
