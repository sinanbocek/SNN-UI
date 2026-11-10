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
| Çekirdek (ABACUS) | Sayı, para, tarih biçimlerini yazan ortak kütüphane: SNN-Abacus-Core |
| Geçici çözüm | Çekirdekteki bir eksiği yerelde kapatan ek kod |
| Dependabot | GitHub'ın kullandığımız paketlerde güvenlik açığı arayan ve güncelleme öneren otomatik görevlisi |

---

### TB-005 — Geliştirme aracı shadcn altında yaması alınamayan iki güvenlik uyarısı
- **Tespit Tarihi:** 2026-11-10 (Dependabot uyarıları #19 ve #20)
- **Öncelik:** P3 (Fırsatta) — açık yalnız geliştirme aracında; projelere kopyalanan bileşenlere girmiyor, bugün yapılabilecek bir yama da yok. Proje sahibinin kararı (2026-11-10).

#### 🟢 Sade Anlatım
- **Sorun ne?** Katalog dosyalarını üreten shadcn aracının içinde kullandığı iki pakette güvenlik uyarısı var. Birinin yaması henüz yayımlanmadı. Diğerinin yaması var, ama shadcn o sürümü kabul etmiyor.
- **Benzetme:** Atölyedeki bir makinenin parçası için üretici geri çağırma duyurmuş, yedek parça ise henüz gelmemiş. Makine yalnız atölyede çalışıyor, müşteriye giden ürünün içine girmiyor. Parça gelince takılacak.
- **Çözülmezse ne olur?** Saldırının işlemesi için araca kötü niyetli girdi verilmesi gerekir; araç burada yalnız kendi depomuzun dosyalarını işliyor. GitHub'da 2 uyarı açık görünür ve Dependabot koşusu kırmızı kalabilir.
- **Senden beklenen karar:** Yok. Uyarıları açık tutma kararı verildi, çünkü kapatılırsa yama çıkınca haber gelmez.

#### 🔧 Teknik Detay
- **Açıklama:** İkisi de `package-lock.json` içinde, dolaylı ve geliştirme kapsamında. (1) Uyarı #20 `minimatch` 10.2.6, orta, GHSA-g3hv-75wg-m249, etkilenen aralık `>=7.0.0 <11.0.1`, yama 11.0.1. Zincir: `shadcn@4.21.5` → `ts-morph@26.0.0` → `@ts-morph/common@0.27.0` → `minimatch@^10.0.1`. En güncel `shadcn@4.23.0` hâlâ `ts-morph@^26.0.0`, en güncel `ts-morph@28.0.0` altındaki `@ts-morph/common` hâlâ `minimatch@^10.0.1` istiyor (2026-11-10 ölçüldü). Dependabot güvenlik güncellemesi bu çakışmayla "latest possible version 10.2.6" diyerek hata veriyor. (2) Uyarı #19 `deepmerge` 4.3.1, düşük, GHSA-gcqx-w48m-w2h4, etkilenen aralık `>=4.2.0 <=4.3.1`, yayımlanmış yama yok; `shadcn` doğrudan, `@shadcn/registry` de bağlı. Hipotez: `shadcn` içinde bu iki pakete dış girdi ulaşmıyor; çağrı yerleri tek tek denetlenmedi.
- **Etki:** Yalnız `npm run build` ve yerel `shadcn` komutları. `public/r` ile kurulan bileşenler bu paketleri getirmez.
- **Çözüm yönü:** `deepmerge` yaması ya da `minimatch ^11` kabul eden `ts-morph`/`shadcn` çıkınca Dependabot PR'ı birleştirilir veya `shadcn` yükseltilir; sonra `npm run build` çıktısında fark olmadığına bakılır. `package.json` `overrides` ile `minimatch` 11'e zorlamak denenmedi; `deepmerge` uyarısını zaten kapatmaz.
- **Neden Şimdi Çözülmüyor:** Bağımlılık: yama ya yok ya da üst paket kabul etmiyor.
- **Bağlı kalemler:** Yok.
