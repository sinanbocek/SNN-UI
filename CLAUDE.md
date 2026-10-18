# SNN-UI — bu depoda çalışma rehberi

**Aile standartları:** sinanbocek/SNN-Standartlar. Bu proje SNN aile standardına bağlıdır; kurallar orada yazılıdır, burada tekrar edilmez.
Özellikle: `standartlar/arayuz-standardi.md` (amber yok), `standartlar/kod-dili-standardi.md` (tanımlayıcılar İngilizce, yorum ve ekran metni Türkçe), `standartlar/giris-alanlari-standardi.md` (sayı, para, tarih ABACUS'tan).

## Bu depo ne yapar

SNN ailesinin arayüz kataloğu. Arc'tan (kuratlielia/arc-library, MIT) seçilmiş bileşenler Türkçeye uyarlanır ve shadcn ile projelere **kopyalanır**.
Katalog adı `@snn-ui`: projeler `npx shadcn@latest add @snn-ui/button` ile kurar.
Plan: `SNN-Standartlar/docs/arayuz-standardi-plani.md`.

## Kurallar

1. **`registry.json`, `AI/katalog.md`, `public/r/` elle düzenlenmez.** Kaynak `scripts/catalog.mjs`; `npm run build` üretir. CI eski çıktıyı yakalar.
2. **Amber/turuncu yok.** `npm test` her CSS dosyasında OKLCH ton açısı 50–95 arasındaki rengi yakalar. Testi gevşetme; renk değiştir.
3. **B sınıfı bileşen uyarlanmadan alınmaz.** `Intl.*`, `toLocaleString`, `toFixed`, `toUpperCase`, `toLowerCase` içeren bileşen (ya da onu getiren bağımlılık) ABACUS'a bağlanmadan kataloğa girmez. Vaka: `metric-card`, `animated-counter` üzerinden `en-US` biçimi getiriyordu (2026-10-14).
4. **Her yeni parça `KAYNAK.md`'ye yazılır:** Arc'taki yer, Arc commit'i, yapılan uyarlama.
5. **Projeler kendiliğinden güncellenmez.** Katalog değişikliği hiçbir projenin ekranını değiştirmez; proje `shadcn add --overwrite` ile kendisi ister.
6. **Görsel denetim (PR'dan önce zorunlu).** Yeni ya da değişen her bileşen için galeride 1400 px ve 390 px genişlikte ekran görüntüsü alınır:
   `npm run shots -- <bileşen-adı>` (çıktı `shots/`, git'e girmez). Görüntü `usage-pricing` ve `bar-chart` ile yan yana bakılır: boşluk düzeni, başlık sıralaması,
   üzerine gelme ve basma durumları, hareket, yazı tipi (betik yüklü yazı tiplerini de yazar; "YOK" görürsen dur). PR gövdesine ekran görüntüleri ya da
   bileşen başına tek cümlelik görsel değerlendirme yazılır. Vaka: 2026-10-15, dalga 3 blokları galeride kalitesiz çıktı; yazı tipi hiç yüklenmiyordu ve kimse ekrana bakmamıştı.

## Komutlar

```bash
npm run build      # katalog → registry.json, AI/katalog.md, public/r
npm test           # amber testi
npm run typecheck  # TypeScript tip denetimi: galeri ve bütün bileşenler; bileşenler ayrıca kuran projelerin sıkı ayarıyla (playground/tsconfig.strict.json)
npm run sabotage   # amber testini bilerek boz, kırmızıya döndüğünü gör
npm run shots -- <ad> # bileşenin galeri ekran görüntüsü, 1400 ve 390 px (shots/)
```
