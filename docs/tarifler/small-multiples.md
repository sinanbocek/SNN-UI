# Tarif: small-multiples (küçük çizgi grafik ızgarası)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Aynı ölçünün birkaç serisini (bölge, ürün, plan) her biri küçük bir çizgi grafikte, ızgara düzeninde gösterir; hepsi tek grafik gibi okunur. Fareyle ya da oklarla gezilen tek bir dikey imleç bütün panellerde aynı ayı gösterir. Y ekseni "bağımsız" (her panel kendi aralığına sığar, şekil karşılaştırılır) ya da "ortak" (hepsi sıfırdan başlar, büyüklük karşılaştırılır) olabilir. Paneller son değere, büyümeye ya da ada göre sıralanır; her panelin arkasında toplamın soluk bir izi durur; düz giden seriler soluklaştırılabilir.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel: bölge ya da ürün grubuna göre aylık ciro.
- SNN-Portfoy-Yonetimi: varlık sınıfı ya da hesap bazında değer seyri.
- SNN-Proje-ve-Nakit-Akis-Yonetimi: proje bazında aylık nakit.
- İki üç seri aynı çizimde karşılaştırılacaksa `line-chart`; tablo satırı içi `sparkline`.

## Bölümler

1. **Başlık alanı:** başlık, alt satırda ölçü ve dönem aralığı.
2. **Denetim satırı:** sıralama grubu ("Son değer / Büyüme / Ad"), ölçek grubu ("Bağımsız / Ortak"), "Düz gidenleri sönük göster" anahtarı.
3. **Okuma satırı:** seçili ay adı ve bir gösterge ("Son" ya da imlecin ayı), tüm serilerin toplamı ve açıklama: ana çizgi (seri) ile kesikli çizgi (toplamın izi, kendi ölçeğinde).
4. **Panel ızgarası:** her panelde ad, o aydaki değer, trend oku ve işaretli büyüme ("geçen yıla göre"); altta çizgi grafik, sağda 2-3 eksen değeri; son noktada nokta.
5. **Gizli tablo:** seri, değer, büyüme ve trend (Yükseliyor/Düz/Düşüyor), sıraya göre.

## Kullanıcı ne yapar, ne olur

- **Bir panelin üzerinde gezer (fare):** dikey imleç tüm panellerde aynı aya gelir; her panelin değeri o aya göre güncellenir, okuma satırı ayı ve toplamı gösterir. Fare çıkınca son değere dönülür.
- **Dokunmatik:** grafiğe dokunmak ya da yatay sürüklemek imleci koyar; dikey kaydırma sayfayı kaydırır.
- **Sıralamayı değiştirir:** paneller yeni yerlerine kayar (yer değiştirme animasyonu), ayırıcı çizgiler panelle gider.
- **Ölçeği değiştirir:** her panelin y aralığı yayla yeni aralığa geçer; çizgiler yeniden şekillenir, eksen değerleri kayar ya da solarak değişir.
- **"Düz gidenleri sönük göster":** değişimi eşiğin altındaki paneller soluklaşır, "Düz" etiketi taşır.
- **Klavye:** Tab'la panel grubuna girilince imleç son aya konur; sol/sağ ok bir ay, PageUp/PageDown on iki ay, Home/End ilk/son ay, Esc imleci temizler. Denetim gruplarında oklar seçeneği değiştirir.

## Durumlar

- **Düz seri:** büyüme mutlak değerce eşiğin altındaysa düz sayılır.
- **Karşılaştırma ayı yok** (seri kısa): büyüme gösterilmez, "Yeterli geçmiş yok".
- **Dört ila on iki panel:** en iyi sonuç; fazlası sayfalanır ya da gruplanır.
- **Yükleniyor:** gri panel iskeletleri. **Boş:** "Gösterilecek seri yok."
- **Kolon sayısı:** yaklaşık 640 px üstü dört, altı iki; panel yükseklikleri kap daraldıkça küçülür.
- **Telefon:** denetimler tam satıra sarar, değer adın altına iner, eksen yeri daralır; denetim hedefleri büyür (en az yaklaşık 44 px).
- **Uzun ad:** panel başlığında kısaltılır, tam ad gizli tabloda.

## Klavye ve ekran okuyucu

- Tüm ızgara tek Tab durağıdır (sekiz panel için sekiz durak olmaz); klavye ipucu metni vardır.
- İmleç klavyeyle kayarken ay, toplam ve en yüksek seri kibar canlı bölgede duyurulur; sıralama, ölçek ve sönük gösterim değişimleri de duyurulur.
- Trend yönü yalnız renkle/solukluktan değil, ok simgesi ve gerçek eksi işaretli yüzdeyle verilir; düz seriler "Düz" diye etiketlenir.
- Gizli tablo anlık ayın değerlerini sıralı verir.

## Hareket

- Ölçek geçişinde her panelin alanı, çizgisi, son noktası ve eksen değerleri aynı iki değerden türetilir; eksenler kayar, çizgi yeniden şekillenir.
- Sıralamada paneller sönümsüz yayla yeni yerlerine gider.
- İmleç ilk çıkışta yerinde belirir, sonra aylar arasında kısa yayla süzülür; her paneldeki nokta kendi çizgisinde kayar.
- Sönükleştirme yalnız panel içeriğini solar; ızgara çizgileri net kalır.
- **"Hareketi azalt" açıkken:** ölçek, sıralama ve imleç anında.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Panel değeri, toplam | para, TRY | `money.compactMajor` (başlıkta), `money.format` (okuma satırı) |
| Eksen değerleri | para | `money.compactMajor` |
| Büyüme | yüzde değişim | `math.percentChange(geçen yıl ayı, bu ay)` → `money.percent`, gerçek eksi işareti |
| Düz eşiği | yüzde | `money.percent` (örn. varsayılan eşik kodda sabit; görünmez) |
| Dönem etiketleri ("Eylül 2026") | tarih | `date.monthName` + yıl (`date.format`) |
| Serinin adet ölçüsü (kayıt vb.) | adet | `money.fmtDecimalGrouped` |

## Kurulacak SNN-UI parçaları

Katalogdan: `sparkline` ve `line-chart` (panel çizgisi), `streamgraph`/`ridgeline` (kardeş çoklu seri parçaları), `slot-text` (değer değişimi), `tooltip`, `skeleton`.

Katalogda olmayan:
- `segmented-control` (sıralama ve ölçek)
- `switch` (sönük gösterim)
- `small-multiples` kabuğu (ortak imleç, bağımsız/ortak ölçek, yer değiştirme animasyonu, toplam izi)

## Türkçe ekran metinleri (öneri)

- Sıralama: "Son değer", "Büyüme", "Ad"; ölçek: "Bağımsız", "Ortak"; anahtar: "Düz gidenleri sönük göster"
- Okuma: "Toplam"; çizgi adı: "Bölge", "Tüm bölgeler, sığacak ölçekte"
- Panel: "{değer}", "+%{oran} geçen yıla göre", "Düz"
- Yönerge: "İmleci tüm panellerde birlikte gezdirmek için sol ve sağ oku kullanın; Home ve End ilk ve son ay, Esc temizler."

## Kapsam dışı (bilerek)

- İki ya da üç serinin aynı eksende karşılaştırılması (`line-chart`).
- Tek bir ölçünün ayrıntıya açılması (`kpi-drilldown`).
- Veri yükleme: her seri dönem sayısı kadar değer verir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; denetimler ve imleç denenmedi, davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
