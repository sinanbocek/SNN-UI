// Galeri sitesinin saf mantığı: kategori kapsamı, renk laboratuvarı hesapları, sepet metni ve paylaşım bağlantısı.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "esbuild";
import { categories, components } from "../scripts/catalog.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let temp, color, cart;

before(async () => {
  temp = mkdtempSync(path.join(tmpdir(), "snn-ui-galeri-"));
  const load = async (file, name) => {
    const outfile = path.join(temp, `${name}.mjs`);
    await build({ entryPoints: [path.join(root, file)], bundle: true, format: "esm", platform: "node", outfile, logLevel: "silent" });
    return import(pathToFileURL(outfile).href);
  };
  color = await load("playground/src/lib/color.ts", "color");
  cart = await load("playground/src/lib/cart.ts", "cart");
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test("kategoriler: her bileşen tam bir kategoride, bilinmeyen ad yok, anahtarlar İngilizce", () => {
  const names = new Set(components.map(item => item.name));
  const listed = categories.flatMap(category => category.names);
  assert.equal(listed.length, new Set(listed).size, "bir bileşen iki kategoride");
  assert.deepEqual(listed.filter(name => !names.has(name)), [], "katalogda olmayan ad");
  assert.deepEqual([...names].filter(name => !listed.includes(name)), [], "kategorisiz bileşen");
  for (const category of categories) assert.match(category.key, /^[a-z]+$/);
});

test("renk kodu okuma: #EEE, #EEEEEE, EEEEEE, rgb() ve virgüllü yazım; geçersiz kod null", () => {
  for (const input of ["#EEE", "#eeeeee", "EEEEEE", "rgb(238, 238, 238)", "238,238,238", "238 238 238", "rgba(238,238,238,.5)"]) {
    assert.deepEqual(color.parseColor(input), { r: 238, g: 238, b: 238 }, input);
  }
  for (const input of ["#EEEE", "rgb(300,0,0)", "mavi", ""]) assert.equal(color.parseColor(input), null, input);
  assert.equal(color.toHex({ r: 5, g: 98, b: 239 }), "#0562EF");
});

test("OKLCH gidiş-dönüş rengi korur; ekrana sığmayan renk sığdırılır", () => {
  for (const hex of ["#0562EF", "#7747FF", "#0DB879", "#EEEEEE", "#111111"]) {
    assert.equal(color.oklchHex(color.toOklch(color.parseColor(hex))), hex, hex);
  }
  const wild = color.fromOklch({ l: .6, c: .5, h: 150 });
  for (const channel of [wild.r, wild.g, wild.b]) assert.ok(channel >= 0 && channel <= 255);
});

test("kontrast: beyaz-siyah 21:1, Türkçe yazım ve WCAG düzeyi", () => {
  assert.equal(Math.round(color.contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })), 21);
  assert.deepEqual(color.contrastLabel(4.56), { text: "4,6:1", level: "AA" });
  assert.equal(color.contrastLabel(2.1).level, "Yetersiz");
});

test("amber: Tailwind amber-500 yakalanır, gri ve mavi yakalanmaz; öneriler amber aralığına düşmez", () => {
  const amber = color.toOklch(color.parseColor("#F59E0B"));
  assert.ok(color.isAmber(amber));
  assert.ok(!color.isAmber(color.toOklch(color.parseColor("#EEEEEE"))));
  assert.ok(!color.isAmber(color.toOklch(color.parseColor("#0562EF"))));
  assert.ok([45, 100].includes(color.allowedHue(70)));
  for (const swatch of [...color.shades(amber), ...color.alternatives(amber)]) {
    assert.ok(!color.isAmber(swatch.oklch), `${swatch.label} ${swatch.hex} amber`);
  }
  const tokens = color.accentTokens(color.parseColor("#F59E0B"));
  for (const value of Object.values({ ...tokens.light, ...tokens.dark })) {
    const rgb = color.parseColor(value.replace(/ \/ [\d.]+\)$/, ")"));
    if (rgb) assert.ok(!color.isAmber(color.toOklch(rgb)), value);
  }
});

test("basamaklar: 11 basamak açıktan koyuya; gri renge gri alternatif", () => {
  const blue = color.toOklch(color.parseColor("#0562EF"));
  const steps = color.shades(blue);
  assert.deepEqual(steps.map(step => step.label), ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]);
  for (let index = 1; index < steps.length; index++) assert.ok(steps[index].oklch.l < steps[index - 1].oklch.l);
  assert.equal(color.alternatives(blue).length, 6);
  assert.equal(color.alternatives(blue)[0].label, "Tamamlayıcı (amber dışı)", "mavinin tamamlayıcısı amber aralığına düşer");
  assert.deepEqual(color.alternatives(color.toOklch(color.parseColor("#EEEEEE"))).map(item => item.label), ["Daha açık", "Daha koyu", "Mavi-gri", "Menekşe-gri"]);
});

test("vurgu değişkenleri: hazır vurgularla aynı adlar, koyu temada daha açık vurgu, okunur ön plan", () => {
  const rgb = color.parseColor("#0562EF");
  const { light, dark } = color.accentTokens(rgb);
  assert.deepEqual(Object.keys(light).sort(), ["--accent", "--accent-foreground", "--accent-strong", "--accent-subtle", "--control-glyph", "--control-on", "--control-thumb-on"]);
  assert.equal(light["--accent"], "#0562EF");
  assert.equal(light["--accent-foreground"], "#FFFFFF");
  assert.ok(color.toOklch(color.parseColor(dark["--accent"])).l > color.toOklch(rgb).l);
  const css = color.accentCss(rgb);
  assert.match(css, /:root\[data-accent="custom"\] \{/);
  assert.match(css, /:root\[data-theme="dark"\]\[data-accent="custom"\] \{/);
});

test("sepet: komut, AI metni, hazır ve özel tema", () => {
  assert.equal(cart.installCommand(["line-chart", "avatar"]), "npx shadcn@latest add @snn-ui/line-chart @snn-ui/avatar");
  assert.equal(cart.installCommand([]), "");
  const items = [{ name: "line-chart", title: "Çizgi grafik" }];
  const preset = cart.buildPrompt(items, { kind: "preset", key: "blue", title: "Mavi" }, "https://example.test/r/{name}.json");
  assert.match(preset, /- Çizgi grafik \(@snn-ui\/line-chart\)/);
  assert.match(preset, /npx shadcn@latest add @snn-ui\/line-chart/);
  assert.match(preset, /<html data-accent="blue"> \(Mavi\)/);
  const custom = cart.buildPrompt([], { kind: "custom", hex: "#0562EF" }, "x");
  assert.match(custom, /özel vurgu #0562EF/);
  assert.match(custom, /--accent: #0562EF;/);
  assert.doesNotMatch(custom, /npx shadcn/);
  assert.equal(cart.buildPrompt([], null, "x"), "");
});

test("paylaşım bağlantısı: gidiş-dönüş; bilinmeyen ad ve geçersiz renk atılır", () => {
  const known = new Set(["line-chart", "avatar"]);
  const presets = { blue: "Mavi" };
  const hash = cart.shareHash(["line-chart", "avatar"], { kind: "preset", key: "blue", title: "Mavi" });
  assert.equal(hash, "#/sepet?b=line-chart,avatar&renk=blue");
  assert.deepEqual(cart.parseShare(hash, known, presets), { names: ["line-chart", "avatar"], theme: { kind: "preset", key: "blue", title: "Mavi" } });
  const custom = cart.parseShare(cart.shareHash(["avatar"], { kind: "custom", hex: "#0562EF" }), known, presets);
  assert.deepEqual(custom, { names: ["avatar"], theme: { kind: "custom", hex: "#0562EF" } });
  assert.deepEqual(cart.parseShare("#/sepet?b=yok,avatar,avatar&renk=zzz", known, presets), { names: ["avatar"], theme: null });
  assert.equal(cart.parseShare("#/renk", known, presets), null);
});
