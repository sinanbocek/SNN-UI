# Teknik Borç Kütüğü — Arşiv (kapanan kalemler)

> Kapanan kayıtlar silinmez; ders ve uyarı taşır. Biçim: standarttaki "Kapanış" bölümü.

---

## Kapanan Kalemler

- **Kapanış:** 2026-10-17 — **TB-001: Sırt çizgisi grafiği (ridgeline) telefonda yana taşıyor.**
  - **Ne yapıldı (sade):** Grafik ekrana girmeden önce de eksen çizgileri verinin kendi aralığına göre diziliyor; geçici 0–1 aralığı kullanılmıyor.
  - **Ölçülen sonuç:** 390 px'te örnek kutusunun genişliği 11 427 px'ten 356 px'e indi; eksen çizgileri 69–327 px arasında, ekrana girmeden önce ve sonra aynı yerde.
  - **Ders:** Görünüme girince başlayan açılış hareketi olan bileşende, hareket başlamadan önceki durum da çizilir; sayfanın aşağısındaki bileşen bu ara durumda görülür ve ölçülür.
- **Kapanış:** 2026-10-18 — **TB-002: Katalogda kod yazım kuralı denetimi (lint) yok.**
  - **Ne yapıldı (sade):** Kuran projede lint hatası doğuran iki kalıbı her değişiklikte arayan bir test eklendi (`test/lint-hazards.test.mjs`): her projede bulunmayan kurala atıf yapan yorum ve geçiş yorumu olmadan `money.format`.
  - **Ölçülen sonuç:** Test ilk koşuda gerçek bir tehlike buldu: `card.tsx:122` `react-hooks/set-state-in-effect` atfı. Aile projelerinin 3'ü react-hooks 5.x kullanıyor (bu kural yok, "kural bulunamadı" hatası), 5'i 7.x. Yorum kural adı vermeyen biçime çevrildi. Sabotaj: `@next` atfı geri konunca ve `money.format` geçişi silinince test kırmızı (çıkış 1), geri alınınca yeşil.
  - **Ders:** Katalog yorumu, kuran bütün projelerin lint ayarında geçerli olmalı. Bir eklenti kuralına atıf, o eklentinin en eski aile sürümünde de var mı diye ölçülür.
- **Kapanış:** 2026-10-18 — **TB-003: Galeride yedi bileşenin görüntüsünde önceden var olan kusurlar.**
  - **Ne yapıldı (sade):** Üç kusur çekim betiğinden çıktı, betik düzeltildi. Dört kusur bileşen ya da örnek düzeltilerek giderildi.
  - **Ölçülen sonuç:** Kök neden: `scripts/shots.mjs` `captureBeyondViewport` ile çekerken başsız tarayıcı pencereyi bir anlığına 800 px'e döndürüyordu. Takvim bunu dar ekran sanıp "3 gün"e geçiyordu (başsız tarayıcıda görünüm sırası: çekimden önce "Hafta", sonra "3 gün"). Betik artık pencereyi sayfa boyuna uzatıp çekiyor, tembel görselleri ve hareketleri bekliyor. Sonra: week-calendar 1400 px'te tek "Hafta" ızgarası; metric-card 390 px'te "1.234,5 adet"; product-listing 390 px'te 10 görselin hepsi yüklü. Bileşen düzeltmeleri: color-picker örneğindeki 480 px ayrılmış boşluk kaldırıldı (panel açıkken yüzüyor, tarayıcıda doğrulandı); billing-toggle örneğinde etiket fiyatın üstüne alındı; plan-comparison dar boyda düğme "Seç" yazıyor, ekran okuyucu tam adı duyuyor; usage-pricing'de çakışan kaydırıcı işareti gizleniyor (`fittingMarks`, testli, sabotajda kırmızı). 35 bileşen yeni betikle 1400 ve 390 px'te yeniden çekildi.
  - **Ders:** Görsel denetimde tuhaf görüntü önce çekim aracından şüphelenilerek ölçülür. Genişliğe ya da görünüşe bağlı bileşen, çekim sırasında pencere değişirse yanlış hâlde çekilir.
