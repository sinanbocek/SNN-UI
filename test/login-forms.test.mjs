// Giriş formlarının saf mantığı: e-posta süzme ve alan doğrulama iletileri. Gerçek parola kullanılmaz.
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
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-login-"));
  const outfile = path.join(temp, "format.mjs");
  await build({ entryPoints: [path.join(root, "registry/components/login-split/login-form-format.ts")], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
  mod = await import(pathToFileURL(outfile).href);
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("e-posta yazarken boşluk atılır ve ASCII küçük harfe çevrilir", () => {
  assert.equal(mod.cleanLoginEmail("  Ayse.Demir @Ornek.com.TR "), "ayse.demir@ornek.com.tr");
  assert.equal(mod.cleanLoginEmail("ISIK@ornek.com.tr"), "isik@ornek.com.tr"); // Türkçe büyük I, küçük ı olmaz
});

test("boş ve biçimsiz e-posta ileti verir, geçerli e-posta null", () => {
  assert.equal(mod.loginEmailProblem(""), "Geçerli bir e-posta yazın.");
  assert.equal(mod.loginEmailProblem("ayse"), "Geçerli bir e-posta yazın.");
  assert.equal(mod.loginEmailProblem("ayse@ornek"), "Geçerli bir e-posta yazın.");
  assert.equal(mod.loginEmailProblem("ayse@ornek.com.tr"), null);
});

test("boş parola ileti verir, dolu parola null", () => {
  assert.equal(mod.loginPasswordProblem(""), "Parola boş olamaz.");
  assert.equal(mod.loginPasswordProblem("x"), null);
});

test("odak ilk hatalı alana gider", () => {
  assert.equal(mod.firstInvalidField("", ""), "email");
  assert.equal(mod.firstInvalidField("ayse@ornek.com.tr", ""), "password");
  assert.equal(mod.firstInvalidField("ayse@ornek.com.tr", "x"), null);
});
