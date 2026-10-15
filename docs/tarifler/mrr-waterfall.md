# Tarif: mrr-waterfall (gelir köprüsü / şelale grafiği)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Düzenli (aylık yinelenen) gelirin bir dönemin başından sonuna nasıl değiştiğini köprü grafiğiyle anlatır: başlangıç çubuğu, sonra yukarı doğru (yeni, genişleme, yeniden aktif) ve aşağı doğru (daralma, kayıp) süzülen basamaklar, sonda bitiş çubuğu. Her basamağa basınca altındaki hesap listesi açılır. Yönetim ya da kurul raporu içindir.

## Hangi aile projesinde ne için (tahmin)

- SNN-Proje-ve-Nakit-Akis-Yonetimi: dönem başı nakit → girişler → çıkışlar → dönem sonu nakit köprüsü.
- SNN-Portfoy-Yonetimi: portföy değerinin dönem başından sonuna katkı köprüsü (alım, getiri, çekim).
- GHS-Panel: dönem cirosu köprüsü (yeni müşteri, mevcut müşteri artışı, iptal).
- Aylar boyunca seyir için `revenue-explorer`; sıradan karşılaştırma için `bar-chart`.

## Bölümler

1. **Başlık satırı:** başlık, alt satırda kapsam ve tarih aralığı; sağda dönem seçici (ay ay ve çeyrek) ve birim seçici ("tutar" / "başlangıca göre %").
2. **Özet:** büyük bitiş değeri ("30 Eylül itibarıyla"), dönem başından beri değişim (tutar ve yüzde, işaretli) ve üç küçük gösterge (net elde tutma, hızlı oran, müşteri kaybı).
3. **Şelale grafiği:** Başlangıç, Yeni, Genişleme, Yeniden aktif, Daralma, Kayıp, Bitiş; yüzen çubuklar önceki seviyeden başlar; üstünde işaretli tutar.
4. **Hesap paneli:** seçili basamağın adı, toplamı, hesap sayısı; altında en büyük hesaplar (ad, ay ve plan bilgisi, tutar, küçük pay çubuğu) ve "Diğer hesaplar" satırı.
5. **Gizli tablo:** basamak, tutar, başlangıca göre pay, hesap sayısı.

## Kullanıcı ne yapar, ne olur

- **Dönem seçer (ay/çeyrek):** çubuklar yeni seviyelere kayar; özet, eksen ve liste yenilenir.
- **Birimi "% başlangıç" yapar:** tutarlar başlangıç değerine göre yüzde olur; eksen buna göre değişir.
- **Çubuğa basar (dokunma dahil), ya da ok tuşlarıyla gezer:** çubuk seçilir; altındaki panel o basamağın hesaplarını gösterir. Fare üstüne gelmek yalnız önizlemedir; seçim için basmak gerekir.
- **Boş seçim:** "Bir çubuğu seçin ya da ok tuşlarını kullanın" yönlendirmesi.
- **Hesap sırası değişince:** liste elemanları yer değiştirerek akar.

## Durumlar

- **Hiç hareket yok:** basamak sıfır çubuk olarak görünür, panel "Hesap yok".
- **Çok hesap:** listede en büyük birkaçı gösterilir, kalanlar "Diğer hesaplar (n hesap)" satırında toplanır; uzun liste sınırlandırılır ya da sayfalanır (liste sanallaştırılmaz).
- **Yükleniyor:** çubuk ve panel iskeleti.
- **Hata:** "Yüklenemedi", "Yeniden dene".
- **Dar kap (yaklaşık 800 px altı):** hesap paneli grafiğin altına geçer.
- **560 px altı:** üç gösterge tek satır, küçük puntoyla.
- **Dokunmatik:** dokunma seçer; fare üstü önizlemesi yoktur.

## Klavye ve ekran okuyucu

- Çubuklar radyo düğmesi grubudur (gezen odak): her etiket hareketi, tutarı ve hesap sayısını söyler.
- Sol/sağ ok önceki/sonraki çubuk (uçlarda başa sarar); Home/End ilk/son.
- Grafikte metin özeti, panelde seçili hareket adı etiketi vardır; seçim kibar canlı bölgede duyurulur.

## Hareket

- Dönem değişince çubuklar yeni seviyelerine geçer; hesap listesi yerleşim animasyonuyla yeniden sıralanır.
- Başlıklar ve rakamlar kısa yükselmeyle değişir; toplamlar döner.
- **"Hareketi azalt" açıkken:** değerler hareketsiz değişir.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Başlangıç, bitiş, hareket tutarları | para, TRY | `money.format` (panel, özet), `money.compactMajor` (çubuk üstü, eksen) |
| Başlangıca göre pay | yüzde | `money.percent` |
| Dönem boyu değişim | para + yüzde | tutar `money.format` işaretli; yüzde `math.percentChange` → `money.percent` |
| Net elde tutma, müşteri kaybı | yüzde | `money.percent` |
| Hızlı oran | oran (iki ondalık) | `money.fmtDecimalGrouped` (ondalık 2) |
| Hesap sayısı | adet | `money.fmtDecimalGrouped` |
| Tarih aralığı, ay etiketleri | tarih | `date.format`, `date.monthName` |

Daralma ve kayıp tutarları eksi işaretiyle ("−") yazılır, yalnız renkle değil.

## Kurulacak SNN-UI parçaları

Katalogdan: `bar-chart` (eksen ve çubuk mantığı), `animated-counter`, `metric-card` (üç küçük gösterge), `tooltip`, `skeleton`, `empty-state`.

Katalogda olmayan:
- `segmented-control` (dönem ve birim seçici)
- `radio-group` (çubuklar için gezen odak; ya da kabuk içinde)
- `mrr-waterfall` kabuğu (yüzen çubuk yerleşimi, bağlantı çizgileri)
- `account-list` (hesap satırı + pay çubuğu; basit liste yeter)

## Türkçe ekran metinleri (öneri)

- Basamaklar: "Başlangıç", "Yeni", "Genişleme", "Yeniden aktif", "Daralma", "Kayıp", "Bitiş"
- Birim: "Tutar", "Başlangıca göre %"
- Gösterge adları: "Net elde tutma", "Hızlı oran", "Müşteri kaybı"
- Boş seçim: "Hesapları görmek için bir çubuk seçin."
- Duyuru: "{basamak}: {tutar}, {n} hesap"

## Kapsam dışı (bilerek)

- Aylar boyunca eğilim (`revenue-explorer`).
- Elde tutma kohortu (`cohort-retention`).
- Hesap detayına gitme, dışa aktarma; hesap listesi uygulamadan gelir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; metinler, örnek veriler, renk ve süre değerleri alınmadı.
