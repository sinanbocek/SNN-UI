# Teknik Borç Kütüğü

Fark edilen ama şimdi çözülmeyen sorunlar. **Açık borçlar için tek kaynak burasıdır.**
Kapanan kayıtlar: `docs/teknik-borc-arsiv.md`

> **Teknik borç nedir?** Bir işi hızlı bitirmek için kestirme yol kullanmak, sonradan
> ödenecek bir borç almak gibidir. Borç ödenmedikçe faizi (bakım zorluğu, hata riski) büyür.

> **Standart:** `~/.claude/standartlar-canli/standartlar/teknik-borc-standardi.md` (tek kaynak: SNN-Standartlar)

## Sözlük
| Terim | Türkçe karşılığı |
|---|---|
| Kütük | Bu dosya: açık teknik borçların tek listesi |
| Eksen çizgisi (tick) | Grafikte değerleri gösteren ince dikey çizgi ve yanındaki sayı |
| Lint (ESLint) | Kodu yazım kurallarına göre tarayan denetim aracı; derlemeden ayrıdır |

---

### TB-002 — Katalogda kod yazım kuralı denetimi (lint) yok
- **Tespit Tarihi:** 2026-10-18 (nakit kurulum hataları düzeltilirken, PR #39 sonrası denetimde)
- **Öncelik:** P3 (Fırsatta)

#### 🟢 Sade Anlatım
- **Sorun ne?** Katalog her değişiklikte tip ve renk denetiminden geçiyor, ama kod yazım kuralları denetlenmiyor. Nakit'in bildirdiği 8 yazım hatası düzeltildi; bir kısmı yeniden gelirse kimse fark etmez.
- **Benzetme:** Kapıdaki görevli kimlik soruyor ama çantaya bakmıyor; çantadaki yasaklı eşya ancak içeride fark ediliyor.
- **Çözülmezse ne olur?** Hatayı yine bileşeni kuran proje bulur; derlemesi kırılır, katalogda düzeltme beklenir.
- **Senden beklenen karar:** Yok.

#### 🔧 Teknik Detay
- **Açıklama:** Nakit 2026-10-18'de 8 ESLint hatası bildirdi: 3 kullanılmayan içe aktarma, 2 `@next/next/no-img-element` atfı, 3 `money.format` kuruş geçişi (`no-restricted-properties`). PR #39 hepsini düzeltti. Kullanılmayan içe aktarmayı artık `playground/tsconfig.strict.json` içindeki `noUnusedLocals` yakalıyor. Next.js'e özel kural atfı ve geçiş yorumu olmadan `money.format` çağrısı yeniden eklenirse hiçbir CI adımı yakalamaz. Kökte `eslint` bağımlılığı ve ayarı yok (`package.json`).
- **Etki:** Bileşeni kuran ve ESLint çalıştıran projeler (en az nakit).
- **Çözüm yönü:** Aile ESLint ayarı (`no-restricted-properties` ile `money.format` kuralı) SNN-Standartlar'da paylaşılan bir biçimde varsa onu `registry/components` üstünde CI'da çalıştır. Yoksa iki hedefli denetim yeter: `registry/` içinde `@next/` geçen yorum ve geçiş yorumu olmadan `money.format(` için `test/yasak-cagri.test.mjs` benzeri bir test. Sabotaj: bir dosyaya bilerek ekleyip testin kırmızıya döndüğünü gör.
- **Neden Şimdi Çözülmüyor:** Talep tip denetimi içindi; lint denetimi yeni bir kapı, ayrı iş.
- **Bağlı kalemler:** Yok.

---

### TB-003 — Galeride yedi bileşenin görüntüsünde önceden var olan kusurlar
- **Tespit Tarihi:** 2026-10-18 (PR #39 sonrası görsel denetimde, 35 bileşen 1400 ve 390 px çekilirken)
- **Öncelik:** P3 (Fırsatta)

#### 🟢 Sade Anlatım
- **Sorun ne?** Galeride bazı bileşenlerin görüntüsünde üst üste binen yazı, kırpılan düğme ya da boş alan var. Hepsi önceki kodda da aynı; son düzeltme yol açmadı.
- **Benzetme:** Vitrindeki ürün sağlam ama etiketi yamuk asılmış; satışı bozmaz, göze batar.
- **Çözülmezse ne olur?** Bileşeni seçen proje ekranda aynı kusuru görebilir; galeri kataloğu olduğundan kötü gösterir.
- **Senden beklenen karar:** Yok.

#### 🔧 Teknik Detay
- **Açıklama:** `npm run shots` çıktısı; her biri `fde9854` (PR #39 öncesi) koduyla yeniden çekilip aynı bulundu:
  - `week-calendar` 1400 px: hafta ve 3 gün ızgarası üst üste görünüyor. 390 px temiz. Hipotez: çekim görünüm geçişinin ortasında yapılıyor.
  - `color-picker` 1400 ve 390 px: tetik düğmesinin altında yaklaşık 450 px boş alan.
  - `billing-toggle` 1400 ve 390 px: "Başlangıç", "Takım", "İşletme" etiketi ₺ simgesine bitişik.
  - `plan-comparison` 390 px: "Stüdyo planını seç" düğmesi sağdan kırpılıyor.
  - `metric-card` 390 px: üçüncü kart "0.000,0 adet" gösteriyor (1400 px'te "1.234,5 adet"). Hipotez: sayaç animasyonu bitmeden çekiliyor.
  - `usage-pricing` 390 px: kaydırıcı altındaki "Başlangıç" ve "Takım" işaretleri üst üste.
  - `product-listing` 390 px: ilk çekimde ikinci görselden sonrası boştu, ikinci çekimde doluydu. Çekim betiği tembel yüklenen görselleri beklemiyor.
- **Etki:** Galeri (snn-ui.web.app) ve `shots/` ile yapılan görsel denetim. Hipotezli iki madde gerçek bileşen kusuru olmayabilir.
- **Çözüm yönü:** Önce hipotezleri ölç: `scripts/shots.mjs` animasyon ve görsel yüklemesi bitene kadar beklesin, sonra yeniden çek. Kalanları bileşen bileşen düzelt; her biri için 1400 ve 390 px görüntüyle doğrula.
- **Neden Şimdi Çözülmüyor:** Yan bulgu; asıl iş katalog tip düzeltmesiydi.
- **Bağlı kalemler:** Yok.
