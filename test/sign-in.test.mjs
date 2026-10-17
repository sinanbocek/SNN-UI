// Giriş bloğunun saf mantığı: ad tahmini (Türkçe büyük harf), alan adı önerisi, hesap kurma.
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
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-signin-"));
  const outfile = path.join(temp, "format.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/sign-in/sign-in-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  f = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("addan ad kurar, baş harf Türkçe büyük olur", () => {
  assert.equal(f.nameFromEmail("ismail.yilmaz@ornek.com.tr"), "İsmail Yilmaz");
  assert.equal(f.nameFromEmail("ISPARTA_ILKER@ornek.com.tr"), "Isparta Ilker");
  assert.equal(f.nameFromEmail("irem@ornek.com.tr"), "İrem");
});

test("yalnız ilk iki parçayı alır, boşsa yedek ad verir", () => {
  assert.equal(f.nameFromEmail("ali.veli.can@ornek.com.tr"), "Ali Veli");
  assert.equal(f.nameFromEmail("..@ornek.com.tr"), "SNN üyesi");
});

test("alan adı yazım hatasında öneri verir", () => {
  assert.equal(f.suggestionFor("Elif@GMIAL.com"), "elif@gmail.com");
  assert.equal(f.suggestionFor("elif@ornek.com.tr"), "");
  assert.equal(f.suggestionFor("a@b@gmial.com"), "");
});

test("e-posta denetimi", () => {
  assert.equal(f.isEmail("elif@ornek.com.tr"), true);
  assert.equal(f.isEmail("elif@ornek"), false);
});

test("tanıdık kişi fotoğrafını korur, Türkçe harfe duyarsız eşleşir", () => {
  const people = [{ name: "Çağrı Öztürk", email: "x", photo: "/f.jpg" }, { name: "İsmail Yıldız", email: "y" }];
  assert.deepEqual(f.accountFor(" CAGRI@ornek.com.tr ", people), { name: "Çağrı Öztürk", email: "cagri@ornek.com.tr", photo: "/f.jpg" });
  assert.equal(f.accountFor("ismail@ornek.com.tr", people).name, "İsmail Yıldız");
  assert.deepEqual(f.accountFor("deniz.aksoy@ornek.com.tr", people), { name: "Deniz Aksoy", email: "deniz.aksoy@ornek.com.tr" });
});
