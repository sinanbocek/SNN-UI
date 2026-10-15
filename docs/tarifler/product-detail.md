# Tarif: product-detail (ürün sayfası)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Tek bir ürünün sayfası: kaydırılabilir fotoğraf galerisi, kaplama (renk/yüzey) ve boy seçenekleri, adet düzenleyici, "Sepete ekle" düğmesi, teslimat vaatleri, yorum özeti ve açılır ayrıntı bölümleri. Kaplama değişince galeri o kaplamanın fotoğraflarına geçer; boy değişince fiyat döner.

## Hangi aile projesinde ne için (tahmin)

- Ürün satan aile projelerinin ürün sayfası (kaplama ve boy gibi birkaç seçenekli ürünler).
- Çok seçenekli, canlı fiyatlı ürünler için bu değil; birçok ürünü gezmek için `product-listing`.

## Bölümler

1. **Yol izi:** mağaza › koleksiyon › ürün adı.
2. **Galeri (sol/üst):** büyük fotoğraf, "1 / 4" sayacı, küçük resim şeridi; sürükleyerek geçilir.
3. **Bilgi sütunu:** ürün adı, fiyat (döner), yıldız ortalaması ve yorum sayısı, özet cümleleri.
4. **Kaplama seçimi:** renk örnekleri, seçili kaplamanın adı.
5. **Boy seçimi:** her boy için ad ve fiyat; seçili kaplamada tükenen boy seçilebilir kalır ama "Tükendi" der.
6. **Adet ve "Sepete ekle · {tutar}":** adet düzenleyici (üst sınırı olan), düğme.
7. **Teslimat vaatleri:** teslimat, iade, garanti satırları (başlık + kısa metin).
8. **Yorum özeti:** ortalama, toplam, 5'ten 1'e yıldız çubukları ve sayıları.
9. **Ayrıntılar:** açılır bölümler (ilki açık); en çok üç dört bölüm.
10. **Favori kalbi:** açılıp kapanır, değişim dışarı bildirilir.

## Kullanıcı ne yapar, ne olur

- **Fotoğrafı sürükler ya da oklara basar:** galeri parmağı bire bir izler; uçlarda esner, hızlı kaydırma bir sonrakine atlar.
- **Küçük resme basar:** o fotoğrafa geçer; seçili halka küçük resimler arasında kayar.
- **Kaplama seçer:** tüm fotoğraflar yerinde soluk geçişle yeni kaplamanınkilerle değişir. Seçili boy o kaplamada tükenmişse seçim kalkar.
- **Boy seçer:** fiyat ve düğmedeki tutar döner.
- **Adedi artırır/azaltır:** düğmedeki tutar adetle çarpılır.
- **"Sepete ekle":** düğme "Ekleniyor" olur, sonra "Sepete eklendi"ye döner (genişlik değişmez), sepet simgesi eğilir, sayı döner. Başarısız olursa düğmenin kendisi "Tekrar dene" der.
- **Tükenen kaplama+boy:** düğme yerine "Gelince haber ver" akışı; seçim bilgisi dışarı bildirilir.
- **Ayrıntı başlığına basar:** bölüm yükseklik animasyonuyla açılır/kapanır.

## Durumlar

- **Tükenmiş seçim:** boy yazıyla belirtilir, seçilebilir; ekle düğmesi yerine haber ver.
- **Ekleme sürüyor / hata:** düğmede meşgul ve "Tekrar dene".
- **Yükleniyor:** galeri ve bilgi iskeleti.
- **Genişlik:** yaklaşık 980 px üstünde galeri yapışkan, yanda bilgi sütunu; 680–980 arasında iki sütun eşit; 680 altında alt alta, kare galeri ve dört küçük resimlik şerit; 420 altında yorum özeti çubukların üstüne yığılır. Dokunmatikte oklar yok, kaydırma var.

## Klavye ve ekran okuyucu

- Galeride sol/sağ ok önceki-sonraki fotoğraf; seçim gruplarında oklar seçimi gezdirir. Tab galeri → küçük resimler → seçenekler → adet → ekle → ayrıntılar sırasıyla gezer. Enter/Space küçük resim, ayrıntı bölümü, ekleme.
- Galeri etiketli bölge; gizli slaytlar `aria-hidden`; sayaç canlı.
- Kaplama ve boy radyo grubu (gezen odak). Tükenen boy "Tükendi" yazar.
- Ekle düğmesi meşgulken `aria-busy`; sonuç duyurulur.
- Ayrıntı başlıkları başlık içinde, `aria-expanded` ve `aria-controls`.
- Yıldız çubukları ekran okuyucudan gizli; her satırda "5 yıldız, N yorum" metni var.

## Hareket

- Galeri bire bir sürükleme, uçlarda esneme, bırakma hızıyla yay.
- Kaplama değişince fotoğraflar yerinde soluk geçiş; küçük resim halkası kayar.
- Fiyat döner; ekle düğmesi durumlar arasında genişliği korur; yıldız çubukları görünce bir kez dolar; ayrıntılar yükseklik yayıyla açılır.
- **"Hareketi azalt" açıkken:** galeri atlar, bulanıklık ve yolculuk yok, çubuklar son genişlikte.

## Görseller

Her kaplamanın kendi fotoğraf listesi (ürün fotoğrafı, farklı açılar), kaplama örneği için renk noktası. Yazım oturumu galeride yer tutucu kullanır. İlk fotoğraf öncelikli, diğerleri tembel yüklenir.

## Para ve kart alanları

Bu bileşende kart girişi yok; ödeme uygulamanın sepet/ödeme akışına bırakılır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Boy fiyatı, düğmedeki tutar | para, TRY | `money.format`; tutar = fiyat × adet kuruş tamsayısıyla; fiyat `animated-counter` ile döner |
| Yıldız ortalaması | ondalık | `money.fmtDecimalGrouped` (bir basamak) |
| Yorum sayıları, yıldız dağılımı | adet | `money.fmtDecimalGrouped` |
| Adet | tamsayı | üst sınırı olan düzenleyici |

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `button`, `radio-group` (kaplama/boy), `tabs` ya da küçük resim şeridi için kendi odak yönetimi, `progress` (yıldız çubukları), `skeleton`, `breadcrumb`.

Katalogda olmayan:
- `carousel` (sürüklenebilir, uçta esneyen)
- `number-stepper` (üst sınırlı)
- `accordion`
- `swatch-group`
- `product-detail` kabuğu

## Türkçe ekran metinleri (öneri)

- "Kaplama", "Boy", "Sepete ekle · {tutar}", "Ekleniyor", "Sepete eklendi", "Tekrar dene", "Tükendi", "Gelince haber ver"
- "{n} yorum", "Ayrıntılar", "Teslimat", "İade", "Garanti"

## Kapsam dışı (bilerek)

- Çok seçenekli, canlı fiyatlı ürün yapılandırıcı; ürün listesi (`product-listing`); sepetin kendisi (`cart-drawer`).
- Sepete ekleme isteği, haber verme kaydı: uygulama bağlar.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi; davranış sayfa metninden alındı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
