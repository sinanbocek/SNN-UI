# Tarif: product-listing (ürün listeleme sayfası)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir koleksiyondaki ürünleri kart ızgarası olarak gösterir. Yanda süzgeçler (fiyat aralığı, renk, beden, yalnız stoktakiler), üstte sıralama menüsü vardır. Kartın üstüne gelince ikinci fotoğraf görünür; "Hızlı ekle" kartın içinde beden satırı açar ve ürünü sepete ekler. Sepet sayacı eklemeyle döner.

## Hangi aile projesinde ne için (tahmin)

- Ürün satan herhangi bir aile projesi (Naturapan-Web-Sitesi gibi vitrin sayfaları).
- Birkaç düzine ile birkaç yüz ürünlük kategori sayfası. Çok büyük kataloglarda süzme sunucuda yapılır; bileşen yalnız kartı ve süzgeç görünümünü verir.
- Tek ürünün sayfası için `product-detail`.

## Bölümler

1. **Başlık ve sayaç:** koleksiyon adı, yanında ürün sayısı; sağ üstte sepet simgesi ve dönen adet.
2. **Araç çubuğu:** sıralama düğmesi (öne çıkanlar, yeniler, fiyat artan, fiyat azalan), dar kapta "Süzgeçler" düğmesi ve etkin süzgeç sayısı.
3. **Süzgeç paneli:** çift başlı fiyat aralığı (sınırlar ürün fiyatlarından, 10'a yuvarlanarak gelir), renk örnekleri, beden düğmeleri, "Yalnız stokta" anahtarı, "Süzgeçleri temizle".
4. **Ürün ızgarası:** her kartta oranı sabit fotoğraf, ad, tek satır ayrıntı (malzeme gibi), fiyat, varsa eski fiyat üstü çizili, kart altında renk noktaları, isteğe bağlı rozet ("Yeni"), "Tükendi" yazısı.
5. **Hızlı ekle:** kartın altında cam görünümlü hap; tıklayınca beden satırına, beden seçince "Eklendi" durumuna dönüşür.

## Kullanıcı ne yapar, ne olur

- **Fiyat aralığını sürükler ya da oklarla oynatır:** kartlar süzülür; çıkanlar solar, kalanlar yeni yerine kayar. Ok tuşu aralığı 10 TRY oynatır.
- **Renk ya da beden seçer:** bir ürün, seçilen değerlerden herhangi birine sahipse eşleşir. Seçim açma-kapama düğmesidir.
- **"Yalnız stokta":** tükenenleri gizler. **"Süzgeçleri temizle":** hepsini sıfırlar.
- **Sıralamayı değiştirir:** kartlar yerlerini değiştirir.
- **Karta gelir:** ikinci fotoğraf aynı kutuda soluk geçişle gelir (büyütme yok); "Hızlı ekle" yükselir.
- **"Hızlı ekle":** tek bedenli üründe doğrudan ekler; çok bedenliyse beden satırı açılır, beden seçilince ekler. Sepet simgesi kısa eğilir, sayı döner.
- **Tükenen ürün:** hızlı ekle kapalı.
- **Dar kapta "Süzgeçler":** süzgeçleri soldan açılan bir sayfada gösterir.

## Durumlar

- **Sonuç yok:** boş durum ve "Süzgeçleri temizle" bağlantısı.
- **Yükleniyor:** kart iskeletleri.
- **Tükenen:** kartta yazı, düğme kapalı. **İndirimli:** eski fiyat üstü çizili, yeni fiyat yanında.
- **Genişlik:** yaklaşık 900 px üstünde yan panel + en az 196 px'lik kartlar; 640–900 arasında panel daralır; 640 altında panel sayfaya (modal) dönüşür; 420 altında sıralama düğmesi satırı doldurur. Dokunmatikte "Hızlı ekle" hep görünür.

## Klavye ve ekran okuyucu

- Tab süzgeçler, sıralama, her kartın hızlı ekle düğmesi arasında gezer. Enter/Space renk, beden açar-kapar, sıralama seçer, hızlı ekle açar. Escape sıralama menüsünü, beden satırını, süzgeç sayfasını kapatır.
- Fiyat başları yerel aralık girdisidir; etiket ve para değer metni taşır.
- Renk ve beden düğmeleri `aria-pressed`; renk adı okunur; kart altındaki renkler tek etiketle sayılır.
- Sıralama menüsü liste kutusu açılırı: `aria-activedescendant`, kapanınca odak düğmeye döner.
- Hızlı ekle ürün adını söyler; beden satırı etiketli gruptur; her ekleme kibar canlı bölgede duyurulur.
- Dar kaptaki süzgeç sayfası odağı alır, Escape ile kapanır.

## Hareket

- Süzgeç ve sıralamada kartlar yay hareketiyle yer değiştirir; çıkan solar, giren belirir; kart boyutu sabit.
- Fotoğraf değişimi aynı kutuda soluk geçiş. Hızlı ekle ↔ beden ↔ "Eklendi" aynı hapın içinde kısa bulanıklıkla yer değiştirir.
- **"Hareketi azalt" açıkken:** yer değiştirme animasyonu yok; yalnız saydamlık geçişi.

## Görseller

Her ürün için ana fotoğraf ve isteğe bağlı ikinci fotoğraf (aynı oran, 4:5). Yazım oturumu galeride kendi yer tutucularını kullanır; Arc görseli yoktur. Fotoğrafın açıklaması (alt metin) zorunlu.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Ürün fiyatı, eski fiyat | para, TRY | `money.format` |
| Fiyat aralığı uçları | para, TRY | `money.format`; uçlar ürünlerden, 10'a yuvarlanır |
| Ürün sayısı, sepet adedi | adet | `money.fmtDecimalGrouped`; sepet adedi `animated-counter` |

Para birimi TRY. Ürün, renk ve beden verisi uygulamadan gelir.

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `button`, `switch`, `dropdown-menu`, `drawer` (dar kap süzgeç sayfası), `empty-state`, `skeleton`, `badge`.

Katalogda olmayan:
- `range-slider` (çift başlı, klavye ve dokunma)
- `swatch-group` (renk örnekleri, açma-kapama)
- `product-card` (ikinci fotoğraf geçişi, hızlı ekle hapı)
- `product-listing` kabuğu

## Türkçe ekran metinleri (öneri)

- "{n} ürün", "Sırala", "Öne çıkanlar / En yeniler / Fiyat: artan / Fiyat: azalan", "Fiyat", "Renk", "Beden", "Yalnız stokta", "Süzgeçleri temizle", "Süzgeçler ({n})"
- Kart: "Hızlı ekle", "Beden seçin", "Eklendi", "Tükendi", "Yeni"
- Boş: "Bu süzgeçlere uyan ürün yok."
- Duyuru: "{ürün}, {beden} sepete eklendi."

## Kapsam dışı (bilerek)

- Sunucuda arama ve çok boyutlu süzme; süzgeç durumunun adrese yazılması uygulamanın işi (bileşen bu durumu dışarı verebilmeli).
- Sepetin kendisi (`cart-drawer`), ürün sayfası (`product-detail`), ödeme.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi; davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
