# SNN-UI Galeri

Katalogdaki bütün bileşenleri tek sayfada canlı görüp denemek içindir. Katalogda yayınlanmaz; yalnız yerelde çalışır.
Bileşenleri `../registry/components` altından doğrudan alır, bu yüzden bileşen değişince sayfa kendiliğinden yenilenir.
Soldaki liste `scripts/catalog.mjs`'ten gelir: kataloğa eklenen parça listede görünür, örneği yoksa "örnek henüz yazılmadı" der.

## Çalıştırma

```powershell
Set-Location "C:\Users\sboce\Documents\SNN-AI-Asus-Z14\SNN-UI\playground"
npm install
npm run dev
```

Tarayıcıda `http://localhost:5311` açılır. Üstteki çubukla açık/koyu tema, vurgu rengi ve "hareketi azalt" denenir.

## Tek dosya (sunucusuz)

`npm run build` sonrası `playground/dist/index.html` çift tıkla açılır.

## Yeni bileşen örneği eklemek

`src/demos.tsx` içine bir örnek işlevi yaz, dosyanın sonundaki `demos` tablosuna bileşen adıyla ekle.
