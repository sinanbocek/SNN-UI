# Tarif: product-gallery (ürün fotoğraf galerisi, renk ve beden seçimi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Ürün sayfası için fotoğraf galerisi: büyük fotoğraf üstünde fareyle büyüteç, küçük resim şeridi, dokunmatikte kaydırma, tam ekran büyütme görünümü, renk ve beden seçici. Renk değişince fotoğraflar o rengin fotoğraflarına geçer. Beden bir renkte tükenmişse üstü çizili görünür, gizlenmez.

## Hangi aile projesinde ne için (tahmin)

- Ürün satan projelerin ürün sayfası (`product-detail` içindeki galerinin bağımsız ve daha zengin hâli).
- Dokusu ya da küçük baskısı yakından incelenecek ürünler. Seçeneksiz fotoğraf albümü için `lightbox-gallery`.

## Bölümler

1. **Üst alan (isteğe bağlı):** ürün adı, fiyat, yorum gibi uygulamanın verdiği içerik.
2. **Ana fotoğraf:** fareyle büyüteç merceği; dokunmatikte noktalar ve kalıcı büyüt simgesi.
3. **Küçük resim şeridi:** seçili küçük resim halkası kayarak değişir. Geniş kapta fotoğrafın yanında/altında, dar kapta altında.
4. **Renk seçici:** renk örnekleri ve seçili renk adı.
5. **Beden seçici:** düğmeler; tükenen beden `aria-disabled` ve çizili.
6. **Alt alan (isteğe bağlı):** "Sepete ekle" gibi uygulama düğmeleri.
7. **Tam ekran görüntüleyici:** fotoğrafın kendi yerinden büyüyen, yakınlaşma ve kaydırma destekleyen pencere.

## Kullanıcı ne yapar, ne olur

- **Ana fotoğrafın üstünde gezer:** mercek yayla imleci izler, belirlenen kat kadar büyütür. Büyüteç kapatılabilir.
- **Fotoğrafa basar ya da Enter:** tam ekran görüntüleyici fotoğrafın kendi dikdörtgeninden büyüyerek açılır.
- **Görüntüleyicide:** Escape önce uzaklaştırır, sonra kapatır; kapanışta odak ana fotoğrafa döner. Sol/sağ ok fotoğraf değiştirir. Yakınlaştırma imleci izleyerek kayar.
- **Sol/sağ ok, küçük resim, nokta:** fotoğraf değişir; kaydırma parmağı bire bir izler, uçta esner, bir hızlı kaydırma bir fotoğraf ilerletir.
- **Renk seçer:** tüm fotoğraflar bulanıktan netleşerek yeni renge geçer. Seçili beden bu renkte tükenmişse seçim kalkar ve dışarı bildirilir.
- **Beden seçer:** tükenenler atlanır. Tükenen kombinasyon açıklamasıyla ("{renk} rengi için {beden} tükendi") gösterilir.

## Durumlar

- **Tükenen beden:** çizili, seçilemez, metinle belirtilir.
- **Beden seçilmedi:** "Beden seçin" ipucu; ekle düğmesi uygulamada kapalı kalabilir.
- **Genişlik:** kap boyut kabıdır; 680 px üstünde fotoğraf ve ayrıntı yan yana, altında üst üste; 520 altında şerit fotoğrafın altına iner. Dokunmatikte mercek yok, noktalar ve büyüt simgesi var. Görüntüleyici çerçevesi ekrana ve fotoğraf oranına uyar, yeniden boyutta yeniden sığar.

## Klavye ve ekran okuyucu

- Sol/sağ ok ana fotoğrafta, şeritte ve görüntüleyicide fotoğraf değiştirir. Şerit, renk ve beden içinde oklar, Home/End seçimi gezdirir; tükenen bedenler atlanır.
- Ana fotoğraf; açıklaması, sırası ve "Tam ekran aç" ile etiketli düğmedir.
- Şerit sekme listesi; renk ve beden radyo grubu (gezen odak). Görüntüleyici kipli iletişim kutusu: kapat düğmesine odaklanır, Tab içeride döner, sayfa kaydırması kilitlenir, "2 / 12" kibar duyurulur.
- Her fotoğrafın anlamlı açıklaması olmalı; küçük resim ve mercek kopyaları süstür.

## Hareket

- Fotoğraf şeridi yayla oturur, parmağı izler; mercek yayla gecikmeli izler; şerit, renk ve beden vurguları seçime kayar.
- Görüntüleyici fotoğrafın kendi dikdörtgeninden büyür ve kapanınca oraya döner; yakınlaştırma yayla.
- Renk değişimi fotoğrafları bulanıktan netleştirerek geçirir.
- **"Hareketi azalt" açıkken:** şerit, mercek, yakınlaştırma anında; görüntüleyici uçuş yerine solar.

## Görseller

Her renk için kendi fotoğraf listesi (açı açı, açıklamalı); isteğe bağlı çoklu çözünürlük. Fotoğraf oranı ayarlanabilir (varsayılan dikey). Renk örneği için renk değeri. Yazım oturumu galeride kendi yer tutucularını kullanır. Yalnız görünen fotoğraf hemen yüklenir; diğerleri tembel.

## Para ve kart alanları

Fiyat bu bileşenin içinde değil, üst alanda uygulamadan gelir (TRY, `money.format`). Kart ya da ödeme alanı yok.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Fotoğraf sırası "2 / 12" | adet | `money.fmtDecimalGrouped` |
| Büyütme katı | oran | yapılandırılabilir sayı (varsayılan yaklaşık iki buçuk) |

## Kurulacak SNN-UI parçaları

Katalogdan: `radio-group` (renk, beden), `tabs` (küçük resim şeridi için erişim kalıbı), `button`, `dialog` (görüntüleyici kabuğu için temel).

Katalogda olmayan:
- `image-magnifier` (mercek)
- `carousel` (sürüklenebilir)
- `image-viewer` (kaynaktan büyüyen, yakınlaşan görüntüleyici)
- `swatch-group`
- `product-gallery` kabuğu

## Türkçe ekran metinleri (öneri)

- "Renk", "Beden", "Beden seçin", "Tam ekran aç", "Kapat", "Önceki", "Sonraki", "{renk} için {beden} tükendi"
- Duyuru: "{n} / {toplam}"

## Kapsam dışı (bilerek)

- Seçeneksiz fotoğraf albümü (`lightbox-gallery`), döner pazarlama slaytları, sepete ekleme mantığı.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
