# Tarif: cohort-retention (kohort elde tutma üçgeni)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Aynı ayda katılan grupların (kohortların) aylar geçtikçe ne kadarının hâlâ aktif kaldığını gösterir. Her satır bir katılım ayı, her sütun katılımdan sonraki ay; hücrede kalan yüzde yazar, rengi yüzdeye göre koyulaşır. Bir anahtarla aynı veri "eğriler" görünümüne geçer: her kohort bir çizgi olur. Segment seçilince renkler ve rakamlar yeniden boyanır.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel: müşteri ya da abonelerin ilk satın alma ayına göre elde tutulması.
- SNN-Games: oyuncuların kayıt ayına göre geri dönüşü.
- Düzenli müşteri ilişkisi olan her proje.
- Gün gün etkinlik için `activity-heatmap`; aşamalar arası yollar için `sankey-flow`.

## Bölümler

1. **Başlık satırı:** başlık, alt satırda ölçüm tarihi; sağda segment seçici ("Tümü" + iki segment).
2. **Üç gösterge:** "1. ay elde tutma", "6. ay elde tutma" (işaretli değişim: son üç kohort ile ilk üç kohort farkı, puan olarak) ve "Yeni kayıt" toplamı. Rakamlar döner.
3. **Görünüm anahtarı:** "Isı haritası" / "Eğriler"; solda "% elde tutma" renk ölçeği açıklaması.
4. **Isı haritası:** satırlar = kohortlar (ad ve büyüklük), sütunlar = 1…12. ay; hücrede yüzde. Ölçülmemiş gelecek hücreler boş (alt üçgen). En altta "Ortalama" satırı.
5. **Eğriler görünümü:** her kohort için ay-yüzde çizgisi; yatay eksen "katılımdan sonraki ay", dikey eksen 0-100%.
6. **İmleç:** seçili hücre ya da nokta için okuma.
7. **Gizli tablo:** her kohortun her aydaki yüzdesi; ölçülmemişler "Henüz ölçülmedi".

## Kullanıcı ne yapar, ne olur

- **Görünümü değiştirir:** hücreler eğrilere dönüşür (ve geri); biçim değiştirerek geçer.
- **Segment seçer:** hücre renkleri sıralı bir gecikmeyle yeniden boyanır, gösterge rakamları yeni değere döner.
- **Hücre üstüne gelir ya da oklarla gezer:** oklar kohortlar (satır) ve aylar (sütun) arasında; Home/End o kohortun ilk/son ayı; Esc imleci temizler. Okunan kohort, ay ve oran canlı bölgede duyurulur.
- **Dokunmatik:** hücre okuma sürükleyerek yapılır, dikey sayfa kaydırması engellenmez.

## Durumlar

- **Ölçülmemiş ay:** hücre çizilmez (üçgen biçimi); tabloda "Henüz ölçülmedi".
- **Çok küçük kohort:** (örn. birkaç kayıt) oran gürültülü olur; uygulama gerekirse alt sınır belirler, bileşen göstermeye devam eder ve boyut sütununu açık tutar.
- **Hiç veri yok:** "Kohort verisi yok".
- **Yükleniyor:** gri üçgen iskeleti.
- **Dar kap (yaklaşık 560 px altı):** dolgu daralır; gösterge açıklamaları sarar; hücre sayısı artarsa yatay kaydırma.
- **Çok büyük ızgara:** 12×12 civarı için tasarlanmıştır; daha büyüğünde hücre sayısı ve animasyon ağırlaşır.

## Klavye ve ekran okuyucu

- Grafik tek odaklanabilir gruptur; yönergesi "Kohort ve ay arasında oklarla gezin, Home/End kohort içinde uca atlar, Esc temizler" der.
- Hücreler ve eğriler dekoratiftir; ekran okuyucu okunan hücreyi canlı bölgeden ve gizli tablodan alır; renk ölçeği etiketli görsel olarak verilir.

## Hareket

- Isı haritası ↔ eğriler geçişinde hücreler eğrilere dönüşür; segment değişiminde renkler hücre hücre sırayla yeniden boyanır (renk geçişi stil geçişidir).
- Gösterge rakamları döner.
- **"Hareketi azalt" açıkken:** değerler anında, imleç yaysız.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Hücre ve eğri değeri | yüzde (hücrede tam sayı, ipucunda bir ondalık) | `money.percent` |
| Gösterge yüzdeleri | yüzde | `money.percent` |
| Değişim | puan farkı ("+5,2 puan") | oran farkı, "puan" birimiyle |
| Kohort büyüklüğü, toplam kayıt | adet | `money.fmtDecimalGrouped` |
| Kohort adı (katılım ayı) | tarih | `date.monthName` + yıl (`date.format`) |
| Ölçüm tarihi | tarih | `date.format` |
| Ay sütun başlığı | sıra sayısı | düz tamsayı ("1", "2") |

## Kurulacak SNN-UI parçaları

Katalogdan: `activity-heatmap` (renk ölçeği ve hücre mantığı), `line-chart` (eğriler görünümü), `animated-counter`, `metric-card`, `tooltip`, `skeleton`, `empty-state`.

Katalogda olmayan:
- `segmented-control` (segment seçici ve görünüm anahtarı)
- `cohort-grid` (üçgen ızgara, renk ölçeği, hücre↔eğri geçişi) — kabuk: `cohort-retention`

## Türkçe ekran metinleri (öneri)

- Başlık: "Kohort elde tutma"; alt: "Katılımdan sonra her ay hâlâ etkin olanlar. Veri {tarih} tarihine kadar."
- Göstergeler: "1. ay elde tutma", "6. ay elde tutma", "Yeni kayıt"; alt metin "son 3 kohort, ilk 3 kohorta göre"
- Anahtar: "Isı haritası", "Eğriler"; ölçek: "% elde tutma"
- Hücre ipucu: "{kohort}, {n}. ay: %{oran}"
- Yönerge: "Kohortlar ve aylar arasında ok tuşlarıyla gezin; Esc temizler."
- Boş: "Kohort verisi yok."

## Kapsam dışı (bilerek)

- Gelir elde tutması (para bazlı kohort) ayrı bir bileşendir.
- Gün bazlı etkinlik (`activity-heatmap`), yollar (`journey-flow`).
- Kohort verisi üretmek; kohort büyüklüğü ve aylık kalan sayısını uygulama verir, oran bileşende hesaplanır.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; eğriler görünümü ve segment geçişi denenmedi, sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
