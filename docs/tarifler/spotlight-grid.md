# Tarif: spotlight-grid (ışıklı özellik ızgarası)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Dört özelliği kart ızgarasında gösteren tanıtım bölümü. İmleç kartların kenarında yumuşak bir ışık izi bırakır; karta gelince küçük bir canlı önizleme oynar; karta basınca kart yerinde büyüyerek çalışan bir ayrıntı görünümüne dönüşür. Yalnızca anlatmaz, denetir.

## Hangi aile projesinde ne için (tahmin)

- Geliştirici ya da ürün tanıtım sayfalarında "özellikler" bölümü; küçük çalışan örneğin metinden iyi anlattığı yerler.
- Müşteri hikâyeleri için değil; tek kartın genişlemesi için değil (`expandable-card`).

## Bölümler

1. **Başlık ve alt cümle:** bölüm adıyla etiketli.
2. **Dört kart:** her biri başlık, kısa açıklama ve canlı önizleme taşır: gecikme eğrisi, dağıtım sayacı, bir özellik anahtarı, yoruma iğnelenmiş not. Başlık tüm kartı kaplayan bir düğmedir.
3. **Kenar ışığı:** imleci izleyen yumuşak ışık (yalnız fare ile).
4. **Ayrıntı görünümü:** açılan kartın yerine geçen çalışan panel; kapat düğmesi. İçinde, karta göre: zaman aralığı seçici ve grafik; dağıtım listesi ve onay düğmesi; açık/kapalı anahtarı ve yayılma yüzdesi seçici; yorumlar.

## Kullanıcı ne yapar, ne olur

- **Fareyi kartlar üzerinde gezdirir:** ışık kenarlarda izler; hover'daki kartın önizlemesi oynar (eğri periyodik yenilenir, sayaç tıklar, anahtar ve iğne yaylanarak gelir).
- **Karta basar ya da Enter/Space:** kart yayla büyüyerek ayrıntıya dönüşür; odak kapat düğmesine gider; arkadaki ızgara etkileşime kapanır.
- **Ayrıntıda zaman aralığı seçer:** grafik yolunu değiştirerek yeni aralığa geçer, etiketler kısa bulanıkla değişir.
- **Anahtarı açar/kapar, yüzde seçer:** durum güncellenir.
- **Dağıtımı onaylar:** onay düğmesi basılı durumda kalır; sonuç duyurulur (bilgi benzetimdir, uygulama bağlar).
- **Escape:** ayrıntıyı kapatır, odak açan karta döner; kart yerine yerleşir.

## Durumlar

- **Dokunmatik:** ışık ve hover önizlemeleri yok; kart dokununca açılır.
- **Genişlik:** kap boyut kabıdır; 520 px altında tek sütun, 520'den iki sütun (geniş kart iki sütun kaplar), 820'den üç sütun. 520 altında ayrıntı üstte değil, kartın kendi konumunda açılır; kartlar, dolgu, grafik küçülür.
- **Ayrıntı açıkken:** ızgara etkileşime kapalı.

## Klavye ve ekran okuyucu

- Tab kart düğmeleri arasında gezer. Enter/Space açar; Escape kapatır ve odağı geri verir. Ayrıntıda oklar zaman aralığı ve yayılma seçicilerinde gezer.
- Bölüm başlığıyla etiketli; kart düğmeleri `aria-expanded` ve `aria-controls`; açık ayrıntı etiketli bölge, arkası etkileşime kapalı.
- Seçiciler radyo grubu, anahtar `role="switch"`, onay düğmesi `aria-pressed`.
- Grafik bir `role="img"` ve etiketi aralığı ve değeri söyler. Mini önizlemeler ekran okuyucudan gizli; anlam başlık ve açıklamada.
- Dağıtım ve onay sonuçları kibar canlı bölgede.

## Hareket

- Kartın yüzeyi ve başlığı ayrıntı görünümüyle ortak yerleşim öğesidir; açılış hafif sekmeli, kapanış sekmesiz yayla.
- Kenar ışığı imleci yaylarla izler, girip çıkarken solar; yalnız fare için.
- Önizlemeler yalnız hover ya da odakta çalışır; ilk gösterim ızgaranın görünüşünde bir kez başlar.
- Grafik aralık değiştirirken yol dönüşür; değişen etiketler kısa bulanıkla geçer.
- **"Hareketi azalt" açıkken:** yerleşim dönüşümü, imleç ışığı ve zamanlayıcılar kapalı; içerik solar ya da anında değişir; önizleme son halini gösterir.

## Görseller

Gerçek görsel yok; önizlemeler bileşenle çizilir (eğri, sayaç, anahtar, iğne). Yorumda küçük avatar. Yazım oturumu yer tutucu avatar kullanır.

## Para ve kart alanları

Para ve kart alanı yok. Sayılar adet ve süre; `money.fmtDecimalGrouped`.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Gecikme (ms) | süre | tamsayı, `animated-counter` |
| Haftalık dağıtım sayısı | adet | `money.fmtDecimalGrouped` + `animated-counter` |
| Yayılma yüzdesi | yüzde | `money.percent` |

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `segmented-control`, `switch`, `button`, `line-chart` ya da `sparkline`, `avatar`.

Katalogda olmayan:
- `pointer-glow` (fareyi izleyen kenar ışığı)
- `expand-card` (kartın yerinde ayrıntıya dönüşmesi)
- `spotlight-grid` kabuğu

## Türkçe ekran metinleri (öneri)

Özellik metinleri uygulamaya özgüdür. Sabitler: "Kapat", "Aç", "Onayla", "Onaylandı", "Zaman aralığı", "Yayılma".

## Kapsam dışı (bilerek)

- Müşteri/kullanım hikâyesi galerisi (`use-case-gallery`), tek açılır kart, tek statik özellik görseli.
- Dağıtım, anahtar ve onay gerçek sistemlere bağlanmaz; benzetimdir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
