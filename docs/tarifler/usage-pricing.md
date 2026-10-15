# Tarif: usage-pricing (koltuk + kullanım fiyat tahmini)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Fiyatı koltuk sayısı artı ölçülen kullanıma (örn. aylık istek sayısı) bağlı bir ürün için "faturanız ne kadar olur" tahminini verir. İki kaydırıcı (koltuk, kullanım) ve aylık/yıllık anahtarı vardır; bileşen koltuk ve kullanıma en uygun planı kendisi bulup önerir, özelliklerini listeler ve maliyeti kalem kalem döker. Kaydırıcılar oynadıkça önerilen plan adı, fiyatlar ve özellik listesi akarak değişir.

## Hangi aile projesinde ne için (tahmin)

- Kullanıma göre ücretlendirilen bir ürünün fiyat sayfası (örn. SNN-Ihale-Maliyet-Teklif-Yonetimi ürünleşirse "kullanıcı + sayfa/sorgu" fiyatı).
- Yalnız koltuğa göre fiyat için `pricing-calculator`; mevcut müşterinin dönem içi harcama tahmini için `usage-forecast`.

## Bölümler

1. **Başlık ve açıklama:** "Faturanızı tahmin edin" benzeri başlık; fiyatlandırma kuralını bir iki cümlede söyler (koltuk başına ücret, her planın kullanım payı, aşımda sabit birim fiyat).
2. **Koltuk kaydırıcısı:** etiket, sağda seçilen sayı, kaydırıcı; plan geçiş noktaları iz üzerinde işaretli ve adlı.
3. **Kullanım kaydırıcısı:** etiket ("Aylık istek"), seçilen miktar (kısaltmalı: "15 Mn"), kaydırıcı; plan geçiş işaretleri.
4. **Dönem anahtarı:** "Aylık" / "Yıllık" ve yanında yıllıkta yıllık tasarruf tutarı.
5. **Plan kartı:** önerilen plan adı (değişirken harfler dönüşerek yer değiştirir), "Şu koltuk ve kullanımın üstünde önerilir" gerekçesi, aylık tutar (büyük, döner), dönem notu ("Aylık ödenir, kullanım dahil"), özellik satırları (iki plan karşılaştırmalı: bir önceki ve önerilen), "Denemeyi başlat" düğmesi.
6. **Döküm:** koltuk (sayı × birim fiyat = tutar), kullanım (kullanılan, aşım ve aşım birim fiyatı, tutar), "Tahmini toplam, vergi öncesi".
7. **Plan ölçeği:** karttaki yan ölçek, geçerli plan konumunu gösteren dekoratif çubuk (ekran okuyucudan gizli; sayılar gerçek metindir).

## Kullanıcı ne yapar, ne olur

- **Koltuk ya da kullanım kaydırıcısını oynatır:** önerilen plan yeniden belirlenir; plan adı, tutarlar, döküm ve özellik listesi güncellenir; plan değişince kart yüksekliği yumuşakça uyum sağlar ve değişim duyurulur ("Takım planı önerilir: 5 koltuk ve 2 Mn istek üstü").
- **Aylık/Yıllık seçer:** fiyatlar, tasarruf ve döküm akarak değişir.
- **"Denemeyi başlat":** uygulama kayıt akışına bağlar.
- **Aşım:** kullanım planın dahil payını geçerse döküm "N Mn aşım, birim fiyatıyla" satırıyla aşımı ayrı yazar.
- **Özellik listesi:** plan değişince eklenen ve çıkan özellikler yeniden yerleşir.

## Durumlar

- **Aşım yok:** kullanım satırı "Dahil" der, tutar sıfırdır.
- **En üst plan aşıldı:** "Özel teklif için bize ulaşın" yönlendirmesi (uygulama belirler).
- **Yükleniyor / plan tablosu yok:** iskelet.
- **Genişlik:** yaklaşık 780 px ve üstünde plan kartı kaydırıcıların yanında ayrı sütundadır; daha darda her şey alt alta; bileşen en çok geniş bir sütun kadar yayılır ve taşmayı kesip içinde tutar.
- **Dokunmatik:** kaydırıcılar parmak izler.

## Klavye ve ekran okuyucu

- Plan kartı ve döküm, başlıklarıyla bağlı etiketli bölgelerdir.
- Plan değişimi, adı ve gerekçesiyle kibar canlı bölgede duyurulur.
- Plan ölçeği gibi dekoratif parçalar ekran okuyucudan gizlenir; sayılar gerçek metindir.
- Kaydırıcılar yerel aralık girdisidir (oklar, Home/End, PageUp/PageDown), değer metni birimlidir ("18 koltuk", "15 milyon istek").

## Hareket

- Fiyatlar döner; plan adı harf harf dönüşür; özellik listesi eklenen/çıkan satırlara göre yer değiştirir; kart yüksekliği ölçülüp yumuşakça uyum sağlar.
- **"Hareketi azalt" açıkken:** yerleşim ve giriş animasyonları kapalı.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Koltuk sayısı | adet | `money.fmtDecimalGrouped` |
| Kullanım miktarı (istek) | adet, kısa | `money.compactMajor` mantığıyla ("15 Mn") ve tam biçim `money.fmtDecimalGrouped` |
| Koltuk birim fiyatı, tutarı | para, TRY | `money.format` |
| Aşım birim fiyatı (milyon başına) | para, TRY | `money.format` |
| Aşım miktarı | adet | `money.compactMajor` |
| Aylık tutar, tahmini toplam | para, TRY | `money.format` |
| Yıllık tasarruf | para, TRY | `money.format` |
| Plan sınırlarındaki koltuk/istek sayıları | adet | `money.fmtDecimalGrouped` |

Toplam hesabı (koltuk × birim fiyat + aşım × birim fiyat, yıllık indirim) uygulamanın fiyat tablosundan gelir; kuruş yuvarlaması ABACUS para aracında yapılır.

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `slot-text` (plan adı dönüşümü), `usage-meter`/`gauge` (plan ölçeği fikri), `button`, `skeleton`.

Katalogda olmayan:
- `slider` (işaretli duraklı; `pricing-calculator` ile ortak)
- `segmented-control` / `billing-toggle` (aylık/yıllık)
- `plan-card`
- `usage-pricing` kabuğu (plan öneri mantığı uygulamadan verilir ya da ayrı bir saf işlev olarak yazılır)

## Türkçe ekran metinleri (öneri)

- Başlık: "Faturanızı tahmin edin"; açıklama: "Koltuk başına ödersiniz. Her plan belirli bir kullanım payı içerir; payı aşan kısım birim fiyatla eklenir."
- Kaydırıcı: "Koltuk", "Aylık istek"; dönem: "Aylık", "Yıllık", "Yılda {tutar} tasarruf"
- Kart: "Önerilir: {koltuk} koltuktan ve {istek} istekten sonra", "Aylık ödenir, kullanım dahil", "{plan} ile başlayın", "{n} gün ücretsiz, sonra tahmini tutar üzerinden"
- Döküm: "Koltuk", "İstek: {kullanılan} kullanıldı, {aşım} aşım", "Tahmini toplam, vergi öncesi"

## Kapsam dışı (bilerek)

- Özellik karşılaştırma tablosu (ayrı bileşen).
- Mevcut müşterinin dönem içi tahmini (`usage-forecast`).
- Kayıt ve ödeme: "Denemeyi başlat" bağlanır; hesap tahmindir, bağlayıcı fatura değildir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; kaydırıcılar denenmedi, davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
