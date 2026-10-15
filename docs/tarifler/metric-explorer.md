# Tarif: metric-explorer (göstergeler ve gezilebilir grafik)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Sayfanın başında dört gösterge kartı yer alır. Karta basınca kart, aynı yüzeyin büyümesiyle sekmeli bir grafik paneline dönüşür: gösterge sekmeleri arasında geçilir, dönem seçilir, grafiğin üstünde bir nokta sürüklenerek günlük değer okunur. Kapatınca panel kartına geri katlanır.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel: satış göstergeleri sayfasının tepesi.
- SNN-Proje-ve-Nakit-Akis-Yonetimi: nakit, tahsilat, ödeme, bakiye.
- SNN-Portfoy-Yonetimi: toplam değer, getiri, risk.
- Tek bir gösterge için `metric-card`; kırılım isteyen genel bakış için `kpi-drilldown`; gelirin parçalara ayrışması için `revenue-explorer`.

## Bölümler

1. **Başlık satırı:** başlık, sağda "güncelleme tarihi" ve kaynak adı.
2. **Kartlar:** dört kart iki sütun ya da satırda; her birinde gösterge adı, büyük değer, işaretli değişim ve dönem adı ("30 gün"), altta sparkline.
3. **Açık panel:** üstte gösterge sekmeleri (her sekmede ad ve değer), yanda dönem anahtarı, ortada büyük çizgi grafik, altında okuma satırı (tarih, değer, değişim), köşede kapat düğmesi.
4. **Okuma imleci:** grafikte kaydırılan nokta; kaydırıcıdır, değeri tarihli okur.

## Kullanıcı ne yapar, ne olur

- **Karta basar:** kartın yüzeyi paylaşılan geçişle panele büyür; seçilen gösterge sekmesi açık gelir.
- **Sekme değiştirir:** vurgu kayar; çizgi yeni göstergenin şekline akar.
- **Dönem değiştirir:** çizgi yeni aralığa akar; değişim yeniden hesaplanır.
- **Grafikte gezer:** fare, dokunma ya da sol/sağ ok; Home/End ilk/son nokta; okuma satırı güncellenir.
- **Esc:** önce okunan noktayı temizler; ikinci Esc paneli karta geri kapatır, odak karta döner.
- **Kapat düğmesi:** aynı geri katlanma.

## Durumlar

- **Değişim yönü:** ok + işaret + renk; yükselme ve düşme renklerine ek olarak yön metinle de yazılır. Düşmesi iyi göstergede (maliyet, kayıp) renk tersine döner.
- **Yetersiz veri:** kart "Veri yok", açılamaz.
- **Yükleniyor:** kart ve panel iskeleti.
- **Hata:** kartta "Yüklenemedi", "Yeniden dene".
- **Dar kap (yaklaşık 760 px altı):** kartlar ikişer; **640 px altı** sekmelerde değerler gizlenir, okuma satırı alt alta; **440 px altı** dolgu ve değerler küçülür.
- **Dokunmatik:** grafikte sürükleme gezinti sayılır, dikey sayfa kaydırması engellenmez.

## Klavye ve ekran okuyucu

- Kartlar düğmedir; adı değer, değişim ve dönemi söyler.
- Açık panel sekme listesi + sekme paneli; sol/sağ ok sekmeler arasında geçer, Home/End ilk/son sekme.
- Okuma imleci kaydırıcıdır ve tarihli metin okur ("12 Eylül, 1,28 milyon").
- Kapat düğmesi Esc kısayolunu bildirir; değişimler kibar canlı bölgede duyurulur.

## Hareket

- Kartın yüzeyi paylaşılan geçişle panele büyür ve geri döner.
- Çizgi gösterge ve dönem değişiminde yeni şekle akar; sekme vurgusu kayar.
- **"Hareketi azalt" açıkken:** büyüme ve kayma yok, anında değişim.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Aylık gelir, bakiye, değer | para, TRY | `money.compactMajor` kartta, `money.format` panelde |
| Hesap/müşteri sayısı | adet | `money.fmtDecimalGrouped` |
| Aktivasyon, elde tutma oranı | yüzde | `money.percent` |
| Değişim (tutar/adet) | yüzde değişim | `math.percentChange` → `money.percent` |
| Değişim (oran) | puan farkı | oran farkı, "puan" |
| "Güncelleme" tarihi ve saati | tarih-saat | `date.format` |
| Okunan günün tarihi | tarih | `date.format`, `date.dayName` |

## Kurulacak SNN-UI parçaları

Katalogdan: `metric-card`, `sparkline`, `animated-counter`, `line-chart` (gezinen imleç dahil), `tooltip`, `skeleton`.

Katalogda olmayan:
- `segmented-control` (dönem anahtarı) ve `tabs` (gösterge sekmeleri)
- `morphing-card` (kart ↔ panel paylaşılan yüzey geçişi; `kpi-drilldown` ile ortak)
- `metric-explorer` kabuğu

## Türkçe ekran metinleri (öneri)

- Başlık: "Büyüme göstergeleri"; alt metin: "{kaynak} · güncelleme {tarih}"
- Dönem: "7 gün", "30 gün", "90 gün"
- Düğme: "Kapat" (ipucu: "Kapatmak için Esc")
- Boş: "Veri yok." / Hata: "Yüklenemedi." / "Yeniden dene"

## Kapsam dışı (bilerek)

- Ham sayısal tablo, dışa aktarma, kırılım (`kpi-drilldown`).
- Çok seri üst üste çizim, fırça ile yakınlaştırma (`revenue-explorer`).
- Veri yükleme: günlük seri uygulama verir; uzun geçmişler önce toplulaştırılır.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemede kapalı kartlar görüldü; açık panel denenmedi, davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
