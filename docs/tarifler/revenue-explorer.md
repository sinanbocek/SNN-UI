# Tarif: revenue-explorer (aylık gelir hareketleri ve fırça)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Aylık yinelenen gelirin üç hareketini (yeni, genişleme, kayıp) aylara göre alan grafiğinde gösterir. Altındaki fırça şeridinde bir pencere sürüklenerek ya da kenarlarından büyütülüp küçültülerek dönem seçilir; çizgiler, eksenler ve rakamlar yeni döneme akar. İstenirse önceki dönemle karşılaştırılır.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel: abonelik ya da düzenli gelir olan müşteri hatları (aylık gelir, yeni müşteri, kayıp).
- SNN-Proje-ve-Nakit-Akis-Yonetimi: aylık giriş, çıkış ve net nakit hareketi.
- SNN-Portfoy-Yonetimi: aylık getiri bileşenleri.
- İki an arasındaki köprü için `mrr-waterfall`; küçük kart içi grafik için `bar-chart`/`sparkline`.

## Bölümler

1. **Başlık satırı:** başlık, seçili ay aralığı; sağda dönem düğmeleri ("3A / 6A / 12A / Tümü").
2. **Özet üçlüsü:** üç sütun: ana gelir (büyük değer, seçili dönemin başından beri değişim), aylık net yeni gelir (önceki döneme göre değişim), kayıp oranı (puan farkı). Rakamlar döner.
3. **Seri düğmeleri:** "Yeni", "Genişleme", "Kayıp" (açılıp kapanan renkli düğmeler) ve sağda "Önceki dönemle karşılaştır" anahtarı.
4. **Ana grafik:** üç alan/çizgi; sıfır çizgisinin altında kayıp; dikey eksende para, yatay eksende aylar, yıl değişiminde yıl etiketi.
5. **Fırça şeridi:** tüm geçmişin küçük özeti; üstünde seçili pencere ve iki tutamaç; altında yıllar.
6. **Gizli tablo:** her ay için yeni, genişleme, kayıp, net yeni ve ay sonu toplamı.

## Kullanıcı ne yapar, ne olur

- **Dönem düğmesine basar (3A/6A/12A/Tümü):** fırça penceresi o uzunluğa gelir; eksen, çizgi ve özet rakamları akarak yeni döneme geçer.
- **Fırça penceresini sürükler / tutamaçları çeker:** pencere aylık adımlarla oturur, grafik yeni aralığa akar.
- **Seri düğmesi:** seriyi grafikten çıkarır/getirir (`aria-pressed`); eksen aralığı yeniden hesaplanır.
- **"Karşılaştır" anahtarı:** bir önceki aynı uzunlukta dönem soluk çizgiyle eklenir; özet altındaki karşılaştırma metni ona göre yazılır.
- **Grafiğin üstünde gezer:** fare ya da oklarla ay ay gezinir; ipucunda ay, her serinin değeri ve net.
- **Klavye fırçada:** oklar pencereyi ya da seçili tutamacı bir ay, Shift+ok üç ay oynatır; Home/End zaman çizelgesi uçlarına gider.

## Durumlar

- **24 aydan az veri:** Tümü seçeneği olan veriye kadar gider; karşılaştırma için önceki dönem yoksa anahtar pasif ve "Önceki dönem yok" yazar.
- **Yükleniyor:** özet ve grafik iskeleti.
- **Hata:** "Yüklenemedi", "Yeniden dene".
- **Dar kap (yaklaşık 560 px altı):** dolgu daralır, karşılaştırma bağlamı özetin altına sarar.
- **Dokunmatik:** grafikte dikey kaydırma serbest; fırçada sürükleme yakalanır ve sayfa kaymaz.
- **Aylık geçmiş çok uzunsa:** uygulama aylara toplulaştırıp verir; bileşen günlük noktayı seyreltmez.

## Klavye ve ekran okuyucu

- Fırça penceresi ve iki tutamaç kaydırıcıdır; değer metni ay adıdır ("Mart 2026").
- Seri düğmeleri `aria-pressed`, karşılaştırma anahtarı `role=switch` (`aria-checked`).
- Ana grafik odaklanabilir görsel; canlı bölgede özetlenir; gizli tablo tüm ayları verir.
- Esc grafikte seçili ayı temizler.

## Hareket

- Çizgi yolları, eksen çizgileri ve ay etiketleri yeni aralığa yayla akar; toplamlar döner.
- **"Hareketi azalt" açıkken:** değerler anında atlar, hareket yerine solma kullanılır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Aylık gelir, yeni/genişleme/kayıp | para, TRY | `money.compactMajor` özette; `money.format` ipucu ve tabloda |
| Eksen değerleri | para | `money.compactMajor` ("₺25 B" gibi), eksi değerler işaretli |
| Büyüme, değişim | yüzde değişim | `math.percentChange` → `money.percent` |
| Kayıp oranı | yüzde (iki ondalık) | `money.percent`; önceki döneme fark "puan" |
| Ay etiketleri | tarih | `date.monthName`, yıl etiketi için `date.format` |
| Tablo ay | tarih | `date.format` |

## Kurulacak SNN-UI parçaları

Katalogdan: `brush-chart` (özet şerit ve pencere mantığı), `line-chart`, `streamgraph` (katmanlı alan fikri), `animated-counter`, `tooltip`, `skeleton`.

Katalogda olmayan:
- `segmented-control` (dönem düğmeleri)
- `switch` (karşılaştır) ve `toggle-chip` (seri düğmeleri)
- `revenue-explorer` kabuğu (üç serili sıfır çizgili alan grafiği; mevcut `brush-chart`'ın üstüne ya da yanına)

## Türkçe ekran metinleri (öneri)

- Dönem: "3 ay", "6 ay", "12 ay", "Tümü"
- Seriler: "Yeni", "Genişleme", "Kayıp"; anahtar "Önceki dönemle karşılaştır"
- Özet: "Aylık gelir", "Aylık net yeni gelir", "Kayıp oranı"; alt metin "önceki 12 aya göre"
- Uyarı: "Önceki dönem için yeterli veri yok."

## Kapsam dışı (bilerek)

- İki an arasındaki köprü anlatımı ve hesap kırılımı (`mrr-waterfall`).
- Günlük veri, seyreltme, yakınlaştırma sınırsız (`brush-chart`).
- Veri yükleme: aylık seri uygulama verir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; metinler, örnek veriler, renk ve süre değerleri alınmadı.
