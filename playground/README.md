# SNN-UI Galeri

Katalogdaki bileşenleri kategorilere bölünmüş hâlde canlı görüp denemek içindir. Yayın adresi: **https://snn-ui.web.app** (main'e her birleşmede `.github/workflows/galeri-yayin.yml` yükler).
Bileşenleri `../registry/components` altından doğrudan alır, bu yüzden bileşen değişince sayfa kendiliğinden yenilenir.
Kategoriler ve liste `scripts/catalog.mjs`'ten gelir (`categories`): kataloğa eklenen parça bir kategoriye yazılmazsa `npm test` kırmızı olur.

- **Sepet:** "Sepete ekle" ile seçilen bileşenler ve tema, AI'a yapıştırılacak kurulum metnine çevrilir. Sepet tarayıcıda saklanır; bağlantıyla paylaşılır (`#/sepet?b=...&renk=...`).
- **Renk laboratuvarı** (`#/renk`): hazır vurgular, renk kodu girişi (#EEEEEE, 238,238,238), 11 basamak, alternatifler, okunabilirlik oranı, amber uyarısı. Hesaplar `src/lib/color.ts` (test: `test/galeri.test.mjs`).
- **Tipografi** (`#/yazi`): yazı aileleri ve boyut basamakları.
- `#<bileşen-adı>` tek bileşen sayfasını açar; `npm run shots` bunu kullanır.

## Çalıştırma

```powershell
Set-Location "C:\Users\sboce\Documents\SNN-AI-Asus-Z14\SNN-UI\playground"
npm install
npm run dev
```

Tarayıcıda `http://localhost:5311` açılır. Üst çubukta arama, açık/koyu/sistem teması ve sepet vardır.

## Tek dosya (sunucusuz)

`npm run build:single` sonrası `playground/dist/index.html` çift tıkla açılır. `npm run build` site içindir: parçalı çıktı, örnekler ve yazı tipleri gerektiğinde iner.

## Yeni bileşen örneği eklemek

`src/demos.tsx` içine bir örnek işlevi yaz, dosyanın sonundaki `demos` tablosuna bileşen adıyla ekle.
