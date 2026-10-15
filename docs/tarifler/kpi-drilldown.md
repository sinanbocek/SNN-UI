# Tarif: kpi-drilldown (göstergeden ayrıntıya açılan kartlar)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Altı kadar gösterge, her biri küçük çizgi grafikli bir kart olarak ızgarada durur. Karta basınca kart, aynı yüzeyin büyümesiyle tam ayrıntı görünümüne açılır: büyük grafik, önceki dönemle karşılaştırma ve kırılım tablosu. Kapatınca aynı karta geri katlanır. Üstte dönem anahtarı ve "Karşılaştır" düğmesi bulunur.

## Hangi aile projesinde ne için (tahmin)

- SNN-Proje-ve-Nakit-Akis-Yonetimi: yönetim özeti (nakit, alacak, borç, gelir, gider).
- GHS-Panel: satış özeti; kırılım müşteri grubu ve kanala göre.
- SNN-Ihale-Maliyet-Teklif-Yonetimi: kurum ve işe göre teklif tutarı kırılımı.
- Tek bir gösterge için `metric-card`; çok gösterge tek grafikte karşılaştırılacaksa `metric-explorer`.

## Bölümler

1. **Başlık satırı:** başlık ("Genel bakış"), sağda "Karşılaştır" düğmesi ve dönem anahtarı (7/30/90 gün).
2. **Kart ızgarası:** her kartta gösterge adı, büyük değer, işaretli değişim ve kartın tamamını dolduran mini çizgi grafik.
3. **Ayrıntı görünümü (karta basınca):** kartın ad ve değeri yerinde kalır; çevresinde büyük çizgi grafik, önceki dönem çizgisi (karşılaştırma açıksa), gezilebilir imleç ve kapat düğmesi.
4. **Kırılım tablosu:** seçilen boyuta (örn. plana ya da bölgeye) göre satırlar; her satırda değer, değişim ve pay çubuğu. Boyut seçici ayrıntı içinde durur.
5. **Açıklama satırı:** göstergenin ne ölçtüğünü bir cümleyle söyler.

## Kullanıcı ne yapar, ne olur

- **Karta basar/Enter:** kart tek bir yaylı hareketle ayrıntıya büyür; odak kapat düğmesine geçer; ızgara arkada kalır.
- **Esc ya da kapat:** ayrıntı aynı karta geri katlanır, odak o karta döner.
- **Dönem değiştirir:** tüm minik grafikler yerinde şekil değiştirir, değerler rakam rakam döner.
- **"Karşılaştır":** önceki dönem çizgisi belirir/kaybolur; değişimler ona göre hesaplanır.
- **Grafikte gezer:** sol/sağ ok imleci bir gün oynatır; fareyle gelinen gün ipucu verir.
- **Kırılım boyutunu değiştirir:** satırlar çapraz solar, pay çubukları sırayla dolar.
- **Seçili göstergenin adresi paylaşılabilir:** açık gösterge dışarıdan verilebilir/dışarı bildirilir (adrese yazmak uygulamanın işi).

## Durumlar

- **Seri yetersiz:** önceki dönem için en az iki dönem uzunluğunda veri gerekir; yoksa "Karşılaştırma için yeterli veri yok" ve düğme pasif.
- **Düşmesi iyi olan gösterge (kayıp oranı gibi):** düşüş yeşil, artış kırmızı sayılır; yön yine ok ve işaretle verilir.
- **Değişim yok:** yatay ok ve "0,0 puan".
- **Yükleniyor:** kart iskeletleri.
- **Hata:** kart içinde "Yüklenemedi", "Yeniden dene".
- **Genişliğe göre sütun:** yaklaşık 760 px üstü üç, 520-760 px arası iki, altı tek sütun. 520 px altında pay sütunu gizlenir, "Karşılaştır" yalnız simgeli düğme olur.
- **Ayrıntı ızgaradan uzunsa:** kendi içinde kayar.

## Klavye ve ekran okuyucu

- Kartlar düğmedir; adı gösterge, değer ve değişimi söyler. Enter/Boşluk açar.
- Ayrıntı etiketli bir bölgedir; açıkken arkadaki ızgara ekran okuyucudan gizlenir.
- Grafikte konuşulan bir özet ve klavyeyle gezilen imleç vardır; değişim ok + işaret + renkle verilir.
- Kırılım gerçek tablodur (satır başlıklı).

## Hareket

- Kart ve ayrıntı aynı yüzey: büyüme ve geri katlanma tek yayla yapılır.
- Her dönem aynı sayıda noktaya yeniden örneklenir, böylece çizgiler yeniden çizilmez, biçim değiştirir.
- Karşılaştırma çizgisi solarak girer/çıkar; kırılım satırları çapraz solar, pay çubukları küçük aralıklarla dolar.
- **"Hareketi azalt" açıkken:** ızgara ile ayrıntı arasında atlama, yalnız kısa solma.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Gelir, nakit, kart değeri | para, TRY | `money.compactMajor` kartta; `money.format` ayrıntıda |
| Hesap, müşteri sayısı | adet | `money.fmtDecimalGrouped` |
| Elde tutma, dönüşüm, kayıp | yüzde | `money.percent` |
| Değişim (tutar/adet) | yüzde değişim | `math.percentChange` → `money.percent` |
| Değişim (oran gösterge) | puan farkı | oran farkı, "puan" birimiyle ("+1,1 puan") |
| Hesap başına gelir | para, TRY | `money.format` |
| Eksen ve ipucu tarihleri | tarih | `date.format`, `date.monthName` |
| Kırılım payı | yüzde | `money.percent` |

## Kurulacak SNN-UI parçaları

Katalogdan: `sparkline` (kart içi mini grafik), `metric-card`, `animated-counter`, `line-chart` (ayrıntı grafiği, imleç, önceki dönem), `bar-chart`/`usage-meter` (pay çubuğu fikri), `button`, `tooltip`, `skeleton`.

Katalogda olmayan:
- `segmented-control` (dönem ve boyut seçici)
- `morphing-card` ya da paylaşılan yüzey geçişi (kart ↔ ayrıntı)
- `data-table` (kırılım; basit tablo yeter)
- `kpi-drilldown` kabuğu

## Türkçe ekran metinleri (öneri)

- "Genel bakış", "Karşılaştır", dönem "7 gün / 30 gün / 90 gün"
- Düğme: "Kapat"; ipucu "Kapatmak için Esc"
- Tablo: "Kırılım", sütunlar "Ad", "Değer", "Değişim", "Pay"
- Uyarı: "Karşılaştırma için yeterli veri yok."

## Kapsam dışı (bilerek)

- Birden çok göstergeyi tek grafikte üst üste koymak (`metric-explorer`).
- Saniyelik gerçek zamanlı değerler.
- Veri ambarı bağlantısı; her göstergenin serisini ve kırılımlarını uygulama verir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; kartı açma ve kapatma denenmedi, davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
