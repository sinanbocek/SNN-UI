# Tarif: cover-flow (derinlikli görsel rayı)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Kısa bir görsel koleksiyonunu (albüm, yer, derleme) tek tek gezdirir. Öndeki kart öne çıkar, diğerleri iki yanda geri çekilir; her görsel çerçevesinin içinde hafifçe kayar. Fareyle ya da parmakla sürüklenir, fırlatılır; yan kaydırma hareketi de rayı oynatır. Altta seçili kartın açıklaması değişir.

## Hangi aile projesinde ne için (tahmin)

- Altı ila on iki görsellik koleksiyon: yerler, albümler, öne çıkan içerikler. Büyük kitaplık için `photo-grid`/`lightbox-gallery`; genel kartlar için döner şerit.

## Bölümler

1. **Ray:** kartlar sıralı; öndeki öne çıkar, uzaktakiler küçülür, kararır, merkeze doğru döner ve geri çekilir; görsel çerçevesinin içinde hareket eder.
2. **Konum işaretleri:** her kart için küçük çentik ("{ad} göster"); sekme sırasında değil.
3. **Açıklama alanı:** ön kartın başlığı, alt başlığı, üst bilgisi ve uygulamanın kendi içeriği (örneğin sayılar, bir düğme); ön kart değişince yön doğrultusundan yükselerek yenilenir.

## Kullanıcı ne yapar, ne olur

- **Sürükler ya da fırlatır:** ray bırakma hızının götürdüğü karta oturur; hızlı bir fırlatma en az bir kart ilerletir; uçlarda esner.
- **Yatay izleme yüzeyi kaydırması:** ray doğrudan hareket eder, sonra kaydırmanın momentumuyla bir karta oturur.
- **Yandaki karta basar:** o kart öne gelir.
- **Sol/sağ ok:** bir kart; Home/End ilk-son (ray odaktayken).
- **Çentiğe basar:** o karta gider.
- **Seçim dışarı bildirilir;** açıklama alanını uygulama doldurabilir (sayılar ve düğmeler).

## Durumlar

- **Tek ya da iki kart:** ray sade görünür; çentikler gizlenebilir.
- **Çok kart:** uzaktakiler gizlenir (kısıtlı bir sayıya kadar tutulması önerilir).
- **Genişlik:** kart genişliği kapla ölçeklenir (en az ve en çok sınırlı); dokunmatikte dikey kaydırma sayfayı kaydırır, yatay olan rayı oynatır.
- **40 piksel üstü sürükleme ya da bir kaydırma:** "hareketi azalt"ta bir kart ilerletir.

## Klavye ve ekran okuyucu

- Ray "döner şerit" rol açıklamasıyla etiketli; her kart "slayt" grubu ve "2 / 8: {başlık}" adlı. Öndekinden uzak kartlar ekran okuyucuya kapalı. Çentikler "{başlık} göster" etiketli, `aria-current` öndekinde, sekme dışı. Ray odağı alır ve tuşları işler.
- Öndeki kart kibar canlı bölgede duyurulur.

## Hareket

- Sürükleme, fırlatma ve kaydırma momentum hızına ayarlı yayla bir karta oturur; uçlar esner.
- Kartlar uzaklıkla küçülür, kararır, merkeze döner ve geri çekilir; her görselin içeriği çerçevesinde kayar; açıklama hareket yönünden yükselir.
- **"Hareketi azalt" açıkken:** kartlar atlar, kayma ve dönme yok, kısa solmalar kalır.

## Görseller

Her kart için bir görsel (odak noktası ayarlanabilir), anlamlı açıklama. Yansıma ve gölge bileşenin çizimi, görsel yuvası değil. Yazım oturumu yer tutucu görsel kullanır.

## Para ve kart alanları

Yok. Açıklama alanındaki sayılar uygulamadan gelir; tutar varsa TRY, `money`.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Açıklamadaki ölçüler | sayı (birimli) | `money.fmtDecimalGrouped` + `animated-counter` |
| Sıra metni "2 / 8" | adet | `money.fmtDecimalGrouped` |

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `button`.

Katalogda olmayan:
- `depth-rail` (derinlikli, fırlatılabilir ray; momentum kalıbı)
- `cover-flow` kabuğu (ray + değişen açıklama)

## Türkçe ekran metinleri (öneri)

- Ray etiketi uygulamaya göre ("Bu sonbaharın yürüyüşleri" gibi uygulama yazar). Sabitler: "{başlık} göster", "{n} / {toplam}: {başlık}".

## Kapsam dışı (bilerek)

- Büyük kitaplık (`photo-grid`, `lightbox-gallery`), genel slaytlar, üç zengin seçenekli derinlik kartları.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Etkileşim denenmedi. Rayın ayırt edici görsel imzası (açı, derinlik ölçüleri) bilerek tarif edilmedi; yazım oturumu kendi derinlik düzenini tasarlar. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
