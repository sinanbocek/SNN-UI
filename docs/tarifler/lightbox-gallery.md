# Tarif: lightbox-gallery (oranı korunan fotoğraf duvarı ve tam ekran görüntüleyici)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Fotoğrafları oranlarını koruyarak sütunlu bir "duvar" (masonry) düzeninde gösterir. Bir fotoğrafa basınca fotoğraf kendi yerinden büyüyerek tam ekran görüntüleyiciye açılır; orada kaydırılır, iki parmakla yakınlaştırılır, aşağı çekilerek kapatılır. Kapanınca o an gösterilen fotoğrafın yuvasına geri uçar.

## Hangi aile projesinde ne için (tahmin)

- Geziler, portfolyolar, ilan fotoğrafları gibi yakından bakılan koleksiyonlar.
- Aynı boyda kare ızgara ve yoğunluk değiştirme için `photo-grid`; seçenekli ürün fotoğrafları için `product-gallery`.

## Bölümler

1. **Fotoğraf duvarı:** sütun sayısı, kabın genişliğine göre en az iki olacak biçimde hesaplanır (sütun en az belirlenen genişlikte kalır); fotoğraflar aralıklı, her biri kendi oranında.
2. **Görüntüleyici (tam ekran):** büyük fotoğraf, alt yazı iki satırı (başlık, açıklama), "2 / 12" sayacı, önceki/sonraki okları, yakınlaştırma düğmesi, kapat düğmesi, küçük resim şeridi.

## Kullanıcı ne yapar, ne olur

- **Fotoğrafa basar ya da Enter/Space:** fotoğraf yuvasından ekrana sığacak biçimde büyür (köşe yuvarlaklığı sabit kalır); arka plan kararır.
- **Sol/sağ ok ya da yana kaydırma:** önceki/sonraki fotoğraf; momentumlu kaydırma.
- **Yakınlaştırma:** `+`, `-`, `0` tuşları; iki parmakla sıkıştırma, Ctrl+tekerlek ya da çift tıklama imleç çevresinde yakınlaştırır; yakın planda sürükleyerek gezilir.
- **Aşağı çeker:** direnç hissiyle kapanır.
- **Escape ya da kapat:** görüntüleyici, o an gösterilen fotoğrafın yuvasına doğru küçülür; odak duvardaki o fotoğrafa döner.

## Durumlar

- **Uçlarda:** önceki/sonraki kapalı.
- **Genişlik:** sütunlar kabın kendi genişliğinden hesaplanır; 640 px görüntüleyici genişliği altında yan oklar gizlenir, kaydırma ile gezilir; dokunmatikte sıkıştırma, aşağı çekip kapama, çift dokunma çalışır.
- **Yükleniyor:** fotoğraf iskeletleri; çok büyük koleksiyonlar sayfalanır (duvar sanallaştırılmaz).

## Klavye ve ekran okuyucu

- Duvar etiketli bölgedir, fotoğraflar düğme ("{başlık} aç, 1 / 3 fotoğraf"). Görüntüleyici kipli iletişim kutusudur, odak tuzağı vardır, odak kapat düğmesinde başlar.
- Yalnız geçerli slayt ekran okuyucuya açık; "2 / 12" kibar canlı sayaç.
- Yakınlaştırma `aria-pressed` anahtarı; uçlarda ok düğmeleri kapalı; küçük resim şeridi geçerli fotoğrafı `aria-current` ile gösterir.

## Hareket

- Açılışta fotoğraf yuvasından ekrana, kapanışta güncel fotoğrafın yuvasına yayla uçar; arka plan solar.
- Aşağı çekme dirençli; kaydırma momentumlu; yakınlaştırma imleç çevresinde.
- **"Hareketi azalt" açıkken:** uçuş ve yaylar yok; görüntüleyici solar, yakınlaştırma ve kaydırma anında.

## Görseller

Her fotoğraf için kaynak, gerçek genişlik ve yükseklik (duvar oranı, uçuş ve yakınlaştırma bunlardan), anlamlı açıklama, isteğe bağlı başlık ve alt yazı. Yazım oturumu galeride farklı oranlı (dikey ve yatay) yer tutucular kullanır.

## Para ve kart alanları

Yok.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Sayaç "2 / 12" | adet | `money.fmtDecimalGrouped` |

## Kurulacak SNN-UI parçaları

Katalogdan: `button`, `dialog` (görüntüleyici temeli), `skeleton`.

Katalogda olmayan:
- `masonry-grid`
- `image-viewer` (yuvadan büyüyen, yakınlaşan, aşağı çekilen; `product-gallery` ile ortak aday)
- `lightbox-gallery` kabuğu

## Türkçe ekran metinleri (öneri)

- "Fotoğraf galerisi", "{başlık} aç", "Kapat", "Önceki", "Sonraki", "Yakınlaştır", "{n} / {toplam}"

## Kapsam dışı (bilerek)

- Aynı boyda ızgara ve yoğunluk değiştirme (`photo-grid`), yatay döner şerit, rastgele içerik gösterme, sanallaştırma.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemede fotoğraf duvarı düz metne yansımadı; etkileşim denenmedi, davranış sayfa metninden alındı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
