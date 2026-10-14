// Amber testinin sabotaj denemesi: snn-foundation.css'i bilerek bozar, testin kırmızıya döndüğünü görür, dosyayı geri yazar.
// Kullanım: node scripts/sabotage-amber.mjs   (çıkış kodu 0 = her sabotaj yakalandı ve temiz hâl yeşil)
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "registry", "foundation", "snn-foundation.css");
const clean = readFileSync(file, "utf8");

const sabotages = [
  ["Arc'ın amber uyarısı geri", "--warning: oklch(50% .09 255)", "--warning: oklch(58% .18 75)"],
  ["amber vurgu seçeneği geri", ':root[data-accent="rose"] { --accent: #ed4e9d', ':root[data-accent="amber"] { --accent: #ed4e9d'],
  ["mavi vurgu yerine Tailwind amber-500", "--accent: #0562ef;", "--accent: #f59e0b;"],
  ["turuncu rgb()", "rgb(5 98 239 / .12)", "rgb(244 129 32 / .12)"],
];

const runTests = () => spawnSync(process.execPath, ["--test", "test/amber.test.mjs"], { cwd: root, encoding: "utf8" }).status;

let failures = 0;
try {
  for (const [name, from, to] of sabotages) {
    if (!clean.includes(from)) { console.log(`ATLANDI (metin bulunamadı, sabotaj boş geçerdi): ${name}`); failures++; continue; }
    writeFileSync(file, clean.replace(from, to));
    const status = runTests();
    const caught = status !== 0;
    console.log(`${caught ? "KIRMIZI (yakalandı)" : "YEŞİL (KAÇTI!)"}: ${name}`);
    if (!caught) failures++;
  }
} finally {
  writeFileSync(file, clean);
}
const cleanStatus = runTests();
console.log(`Temiz hâl: ${cleanStatus === 0 ? "YEŞİL" : "KIRMIZI"}`);
process.exit(failures === 0 && cleanStatus === 0 ? 0 : 1);
