// scripts/catalog.mjs listesinden registry.json ve AI/katalog.md üretir.
// Sonra `npx shadcn build` registry.json'u okuyup public/r/*.json kurulum dosyalarını yazar (npm run build ikisini sırayla yapar).
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ARC_COMMIT, INSTALL_ROOT, REGISTRY_URL, components, foundation } from "./catalog.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const NAMESPACE = "@snn-ui";

function componentFiles(name) {
  const dir = path.join(root, "registry", "components", name);
  return readdirSync(dir).sort().map(file => ({
    path: `registry/components/${name}/${file}`,
    type: "registry:component",
    target: `${INSTALL_ROOT}/${name}/${file}`,
  }));
}

const items = [
  ...foundation.map(item => ({
    name: item.name,
    type: "registry:item",
    title: item.title,
    description: item.description,
    ...(item.deps ? { dependencies: item.deps } : {}),
    files: item.files.map(file => ({ path: file.path, type: file.type ?? "registry:component", target: `${INSTALL_ROOT}/${file.target}` })),
  })),
  ...components.map(item => ({
    name: item.name,
    type: "registry:ui",
    title: item.title,
    description: item.description,
    dependencies: item.deps,
    // Bloklar (settings-page gibi) katalogdaki başka parçaları içe aktarır; `uses` bunları kurulum bağımlılığına çevirir.
    registryDependencies: [`${NAMESPACE}/snn-foundation`, ...(item.deps.includes("motion") ? [`${NAMESPACE}/snn-motion-tokens`] : []), ...(item.uses ?? []).map(name => `${NAMESPACE}/${name}`)],
    files: componentFiles(item.name),
    meta: { arcCommit: ARC_COMMIT, arcSource: `registry/components/${item.name}` },
  })),
];

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "snn",
  homepage: "https://github.com/sinanbocek/SNN-UI",
  items,
};
writeFileSync(path.join(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);

const importPath = name => `@/components/snn/${name}/${name}`;
const rows = components.map(item =>
  `| \`${item.name}\` | ${item.title} | ${item.description}${item.note ? ` ${item.note}` : ""} | \`npx shadcn@latest add ${NAMESPACE}/${item.name}\` |`);
const examples = components.map(item =>
  `### ${item.title} (\`${item.name}\`)\n\n\`\`\`tsx\nimport ${item.defaultExport ? item.exportName.split(" (")[0] : `{ ${item.exportName.split(" (")[0].replace("Toast", "default as Toast")} }`} from "${importPath(item.name)}";\n\n${item.use}\n\`\`\``);

const catalog = `# SNN-UI kataloğu (AI için)

> Bu dosya \`scripts/make-registry.mjs\` ile üretilir; elle düzenlenmez. Kaynak: \`scripts/catalog.mjs\`.

Yeni bir arayüz parçası yazmadan önce bu listeye bak. Burada varsa kur, kopyasını yazma.
Yoksa Arc'a (uiarc.dev) bak; ikisinde de yoksa yaz ve kataloğa aday olarak bildir.

**Kurallar (kısa):**

- Renk, boşluk, köşe, gölge ve hareket süresi elle yazılmaz; \`snn-foundation.css\` değişkenlerinden alınır.
- Uyarı rengi amber/turuncu olmaz (\`--warning\` mavi-gridir). Kırmızı (\`--danger\`) yalnız gerçek hata içindir.
- Sayı, para, tarih kutusu bu rafta yok: ABACUS ile 2. rafta gelir. \`Intl\`, \`toLocaleString\`, \`toFixed\` kullanılmaz (\`giris-alanlari-standardi.md\`).
- Ekran metni Türkçe; tanımlayıcılar İngilizce.
- Arc'ın MCP sunucusu kullanılmaz: oradan uyarlanmamış bileşen gelebilir.

## Projeye bir kez kurulum

1. \`components.json\` dosyasına kayıt ekle:

\`\`\`json
{ "registries": { "${NAMESPACE}": "${REGISTRY_URL}" } }
\`\`\`

2. Bileşeni kur (temel değişkenler ve hareket değerleri kendiliğinden gelir):

\`\`\`bash
npx shadcn@latest add ${NAMESPACE}/button
\`\`\`

3. Temel değişkenleri uygulamanın girişinde **bir kez** içe aktar (\`src/main.tsx\`):

\`\`\`ts
import "@/components/snn/snn-foundation.css";
\`\`\`

4. Vurgu rengini proje seçer: \`<html data-accent="blue">\` (\`neutral\`, \`violet\`, \`blue\`, \`green\`, \`coral\`, \`rose\`). Koyu tema: \`data-theme="dark"\`.

Yazı tipleri (Inter, Geist; \`@fontsource-variable/*\`, OFL) temel değişkenlerle birlikte kurulur ve aynı içe aktarmayla yüklenir; ayrıca bir şey eklenmez.

Gereken paketler: React 19, \`motion\`; bazı bileşenlerde Radix ve \`lucide-react\` (kurulum kendisi ekler).

## Bileşenler (ilk raf)

| Ad | Türkçe adı | Ne işe yarar | Kurulum |
|---|---|---|---|
${rows.join("\n")}

## Kullanım örnekleri

${examples.join("\n\n")}

## Bu rafta olmayanlar

| Ad | Neden | Ne zaman |
|---|---|---|
| \`metric-card\` | Arc'ta \`animated-counter\` ile gelir; o da \`Intl.NumberFormat\` ve varsayılan \`en-US\` biçimi kullanır (\`1,234\`). | 2. raf, ABACUS ile |
| \`money-input\`, \`number-field\`, \`phone-input\`, \`date-picker\`, \`sortable-data-table\`, grafikler | B sınıfı: yasak biçim çağrısı içerir. | 2. raf, ABACUS ile |
`;
writeFileSync(path.join(root, "AI", "katalog.md"), catalog);
console.log(`registry.json: ${items.length} parça; AI/katalog.md: ${components.length} bileşen`);
