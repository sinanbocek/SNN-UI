# Tarif: pricing-calculator (koltuk sayısına göre fiyat hesaplayıcı)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Koltuk (kullanıcı) başına fiyatlanan bir ürün için, ekip büyüklüğünü kaydırıcıyla seçtirir. Aylık/yıllık anahtarı ve üç plan kartı seçime göre canlı güncellenir: fiyatlar, toplam tutar, hacim indirimi ve özellikler değişir. "Önerilen" rozeti ekip büyüklüğüne en uygun plana kayar. Seçilen planın özeti ve tasarrufu altta görünür, "Denemeyi başlat" ile bitirilir.

## Hangi aile projesinde ne için (tahmin)

- Aile projelerinden biri kullanıcı başına abonelik satarsa abonelik sayfası (SNN-Games, GHS-Panel, trade-kasa gibi ürünleşirse).
- Kendi planlarını tanıtan herhangi bir ürün sayfası.
- Kullanıma göre (ölçüm) fiyatlanıyorsa `usage-pricing`; yalnız aylık/yıllık geçişi için sade anahtar.

## Bölümler

1. **Başlık ve alt metin:** "Kullandığın koltuk kadar öde" tarzı başlık, bir cümlelik açıklama (deneme süresi bilgisi).
2. **Ekip büyüklüğü:** etiket, ortada büyük koltuk sayısı (döner) ve "koltuk"; yanında eksi/artı düğmeleri; altında sabit duraklı kaydırıcı; kaydırıcı altında plan sınırları işaretli ("Başlangıç", "Takım", "İş").
3. **Dönem anahtarı:** "Aylık" / "Yıllık", yıllıkta tasarruf rozeti ("%20 tasarruf").
4. **Üç plan kartı:**
   - **Sınırlı plan (en küçük):** koltuk üst sınırını aşınca fiyat yerine "Bu plan en çok N koltuğa uygun. Siz M koltuk seçtiniz." ve "N koltuğa dön" düğmesi.
   - **Orta ve üst plan:** ad, kısa açıklama, koltuk başına aylık fiyat (büyük, döner), toplam tutar ve dönem ("yıllık olarak ödenir, N koltuk için"), seçme düğmesi, özellik listesi. Seçili kartın çerçevesi ve "Önerilen" rozeti kartlar arasında kayar.
5. **Seçim özeti:** "Takım, 20 koltuk", toplam tutar ve dönem, koltuk başına fiyat açıklaması, "Tasarruf ettiğiniz" yıllık tutar ve "Denemeyi başlat" düğmesi.

## Kullanıcı ne yapar, ne olur

- **Kaydırıcıyı sürükler ya da eksi/artı'ya basar:** koltuk sayısı sabit duraklardan birine oturur; fiyatlar, toplam, hacim indirimi ve özellik listeleri güncellenir; sınırı geçince uygun plan kartı öne çıkar ve "Önerilen" rozeti ona kayar.
- **Aylık/Yıllık seçer:** fiyatlar ve toplamlar akarak değişir; yıllıkta tasarruf satırı görünür.
- **Plan kartından seçer:** çerçeve o karta kayar, özet alanı o plana göre güncellenir.
- **Sınırlı plandaki "N koltuğa dön":** koltuk sayısı sınıra iner.
- **"Denemeyi başlat":** düğme meşgul olur (uygulama kayıt/ödeme akışına bağlar), sonuç durumda duyurulur.
- **Hacim indirimi:** koltuk belli eşikleri geçince koltuk başı fiyat düşer; özellik listesinde ek özellikler açılıp kapanabilir (yükseklik animasyonuyla).

## Durumlar

- **Koltuk sınırını aşan seçim:** sınırlı plan fiyatı göstermez, yerine açıklama ve "geri dön" düğmesi koyar.
- **Özellik eşiği:** bazı özellikler yalnız belirli koltuk sayısından sonra listeye girer ya da çıkar.
- **Yükleniyor/plan verisi yok:** kart iskeletleri. **Deneme başlatma hatası:** satır içi "Başlatılamadı", yeniden dene.
- **Dar kap (yaklaşık 860 px altı):** üç kart tek sütuna dizilir; **560 px altı** başlık ve dolgu küçülür, denetimler sıkışır; **360 px altı** tasarruf satırı ve düğme birkaç satıra sarar.
- **Dokunmatik:** kaydırıcı parmak izler; eksi/artı düğmeleri dokunma boyutundadır.

## Klavye ve ekran okuyucu

- Koltuk kaydırıcısı yerel aralık girdisidir; etiketi "Ekip büyüklüğü", değer metni "20 koltuk"; oklar, Home/End, PageUp/PageDown duraklar arasında gezer.
- Dönem anahtarı radyo grubudur (gezen odak); plan düğmeleri `aria-pressed`.
- Her kart başlığıyla etiketlidir; özellik listeleri plan adıyla etiketlenir.
- Dönem değişimi, plan seçimi ve başlatılan deneme kibar canlı bölgede duyurulur.

## Hareket

- Seçim çerçevesi ve "Önerilen" rozeti ortak yerleşim öğeleridir; kartlar arasında yayla gider.
- Fiyatlar ve toplamlar döner; değişen metinler kısa bulanıklıkla çapraz solar; koltuğa bağlı özellikler yükseklikle açılır/kapanır.
- **"Hareketi azalt" açıkken:** kayma ve bulanıklık yok, yerleşim ve yükseklik geçişleri sıfır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Koltuk başına aylık fiyat | para, TRY | `money.format` (büyük yazı, döner) |
| Toplam tutar (dönemlik) | para, TRY | `money.format` |
| Tasarruf (yıllık) | para, TRY | `money.format` |
| Tasarruf yüzdesi (rozet) | yüzde | `money.percent` |
| Koltuk sayısı | adet (tamsayı) | `money.fmtDecimalGrouped` |
| Hacim indirimi | para (koltuk başı) | `money.format` |
| Toplam hesabı | — | fiyat × koltuk × ay sayısı, `money` kuruş tamsayısıyla; yıllıkta indirimli oran uygulama fiyat tablosundan gelir |

Fiyat tablosu (koltuk duraklarının listesi, plan fiyatları, indirim eşikleri) bileşende sabit değil, **uygulamadan** verilir. Para birimi TRY.

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`/`slot-text` (fiyatlar), `usage-meter` (kaydırıcı üzerindeki plan bandı fikri), `button`, `skeleton`.

Katalogda olmayan:
- `slider` (sabit duraklı, işaretli, klavye ve dokunma)
- `segmented-control` ya da `billing-toggle` (aylık/yıllık, tasarruf rozetli)
- `number-stepper` (eksi/artı)
- `plan-card` (seçim çerçevesi, önerilen rozeti)
- `pricing-calculator` kabuğu

## Türkçe ekran metinleri (öneri)

- Başlık: "Kullandığınız koltuk kadar ödeyin"; alt: "Ekip büyüklüğünüzü seçin. Her plan {n} gün deneme içerir."
- Etiket: "Ekip büyüklüğü", "{n} koltuk"; dönem: "Aylık", "Yıllık", rozet "%{n} tasarruf"
- Kart: "koltuk başı / ay", "yıllık olarak ödenir, {n} koltuk için", "Önerilen", "Seçildi", "{ad} planını seç"
- Sınır: "{plan} en çok {n} koltuğa uygundur. Siz {m} koltuk seçtiniz.", düğme "{n} koltuk kullan"
- Özet: "Tasarrufunuz", "{plan}, {n} koltuk"; düğme "Denemeyi başlat"

## Kapsam dışı (bilerek)

- Ölçüme (kullanıma) göre fiyat (`usage-pricing`), özellik karşılaştırma tablosu.
- Ödeme alma ve kayıt akışı: "Denemeyi başlat" işlevini uygulama bağlar.
- Fiyat ve plan verisi uygulamadan gelir; bileşen yalnız hesap gösterir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; kaydırıcı ve dönem anahtarı denenmedi, davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
