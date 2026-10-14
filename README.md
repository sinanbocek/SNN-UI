# SNN-UI

SNN ailesinin arayüz kataloğu. Arc'tan ([uiarc.dev](https://uiarc.dev), MIT) seçilmiş, Türkçeye uyarlanmış React bileşenleri.
Bileşenler shadcn ile projeye **kopyalanır**: kurulan kod projenindir, katalog güncellense de projenin ekranı kendiliğinden değişmez.

- **AI için liste:** [`AI/katalog.md`](AI/katalog.md) — hangi bileşen var, ne işe yarar, nasıl kurulur.
- **Kaynak ve uyarlamalar:** [`KAYNAK.md`](KAYNAK.md)
- **Kural:** `SNN-Standartlar/standartlar/arayuz-standardi.md`; plan: `SNN-Standartlar/docs/arayuz-standardi-plani.md`

## Projeye kurulum

`components.json` içine:

```json
{ "registries": { "@snn": "https://raw.githubusercontent.com/sinanbocek/SNN-UI/main/public/r/{name}.json" } }
```

Sonra:

```bash
npx shadcn@latest add @snn/button
```

Uygulama girişinde bir kez: `import "@/components/snn/snn-foundation.css";`

Gereken: React 19, TypeScript, Vite ya da Next.js. Tailwind gerekmez.

## Bu depoda çalışma

| Komut | Ne yapar |
|---|---|
| `npm run build` | `scripts/catalog.mjs` listesinden `registry.json` ve `AI/katalog.md` üretir, sonra `shadcn build` ile `public/r/*.json` yazar |
| `npm test` | Amber testi: hiçbir CSS dosyasında amber/turuncu ton kalmaz |
| `npm run sabotage` | Amber testini bilerek bozar, kırmızıya döndüğünü gösterir |

Yeni bileşen eklerken: dosyaları `registry/components/<ad>/` altına koy, `scripts/catalog.mjs` listesine ekle, `npm run build`, `KAYNAK.md` satırını yaz.
`registry.json`, `AI/katalog.md` ve `public/r/` elle düzenlenmez.
