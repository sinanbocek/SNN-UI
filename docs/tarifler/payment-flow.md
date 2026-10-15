# Tarif: payment-flow (kartla ödemenin yolculuğu, anlatım çizimi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir kartlı ödemenin nasıl işlediğini hareketli bir şema olarak anlatır. Ödeme noktasından işlemciye, kart ağına, karta veren bankaya ve geri onayla gider; ardından ikinci bir hatta takas, işlemcinin komisyonu ve satıcı bakiyesine ödeme gelir. Her durak o an yaptığı işi yazar; tutar yolda bir çip olarak ilerler. Bu bir **anlatım çizimidir**, gerçek ödeme almaz; denetlenen bir form değildir.

## Hangi aile projesinde ne için (tahmin)

- Ödeme ya da satış tanıtım sayfasında "ödeme nasıl çalışır" bölümü; belgelerde komisyon ve ödeme süresi açıklaması.
- Gerçek ödeme formu için bu değil; olay yayılımı anlatımı için bu değil.

## Bölümler

1. **Şema:** beş durak: ödeme noktası, işlemci, kart ağı, karta veren banka, satıcı bakiyesi. Her durağın adı, dinlenme satırı ve gelinince açılan ayrıntı etiketi var; durak işlerken durum satırı değişir ("risk denetleniyor", "bankaya yönlendirildi", "onaylandı", "takas oldu", "komisyon", "ödendi").
2. **Tutar çipi:** ödeme tutarını taşır, duraklara girip çıkarak ilerler; onay çipi geri döner; takas hattında komisyon düşüldükten sonra net tutara dönüşür.
3. **Yollar:** ilerleyen yol vurgu renginde yanar, onayla birlikte başarı rengine döner; ayrı bir takas hattı.
4. **Satıcı bakiyesi:** ödeme gelince sayar; döngüden döngüye artmaya devam eder, geri sıçramaz.
5. **Adım satırı:** "Yetkilendirme" süresi sayar, "Takas" aşaması dolar, takas zamanı yazılır ("ertesi iş günü").
6. **Alt yazı (isteğe bağlı).**

## Kullanıcı ne yapar, ne olur

- **İzler:** hareket kendi kendine döner: dokunma, yetkilendirme, onay, takas, ödeme, dinlenme, tekrar. Döngü tek bir zaman fonksiyonudur, kesintisiz tekrarlanır.
- **Fareyi duraklarda gezdirir:** ayrıntı etiketi görünür; hikâye hafifçe yavaşlar.
- **Hız ve duraklatma:** uygulama yapılandırır; değişim yayla yumuşar, duraklatınca bir anda değil, yavaşlayarak durur.
- **Ekran dışında ya da sekme gizliyken:** hareket durur.
- Düğme, giriş alanı yok; hiçbir durak denetim değildir, sekme sırasına girmez.

## Durumlar

- **Çalışıyor / duraklatıldı / hız sıfır (donuk).**
- **Hareketi azalt:** komisyon düşüldükten hemen sonrasının tek durağan karesi: ödeme noktasında onay, ağ takas etti, banka ödedi, net tutar bakiyeye gidiyor.
- **Komisyon ve tutar:** uygulamanın gerçek fiyatlandırmasıyla eşleştirilmeli ki şema doğruyu söylesin.
- **Genişlik:** şema gerçek piksel ölçüsüyle SVG'ye çizilir, her genişlikte keskin. 700 px altında dikeye döner: dört durak solda alt alta, bakiye sağ üstte, takas hattı zincirin yanında yukarı çıkar. 420 altında adım satırı tek sütuna iner. Ayrıntı etiketleri yalnız fareyle.

## Klavye ve ekran okuyucu

- Şema tek bir `role="img"`; etiketi tüm hikâyeyi söyler (tutar, her durak, onay, komisyon, ödeme); uygulama etiketi verebilir, yoksa duraklar ve tutarlardan üretilir. Duraklar denetim olmadığından sekme sırasında değil.
- Durum yalnız renkle verilmez: her durağın durum yazısı vardır, onay çipi bir tik ve bir sözcük taşır.
- İsteğe bağlı görünür alt yazı şemanın açıklamasıdır.

## Hareket

- Tek bir çizim döngüsü dönüşümleri, saydamlığı, çizgi tamamlanmasını ve metinleri yalnız değiştiklerinde yazar; bileşen çizim karesi başına yeniden çizilmez.
- Tutar duraktan durağa kayar, her durağın altından geçerken o durak işler; komisyon durağında brüt tutardan net tutara geçiş, komisyonun nedenini sonucuyla gösterir; bakiye sayar.
- Hız ve duraklatma sönümlü yayla.
- **"Hareketi azalt" açıkken:** yukarıdaki tek durağan kare.

## Görseller

Gerçek görsel yok; duraklar için simge (kendi yolu çizimi, görsel adresi ya da herhangi bir düğüm) ve her durak için isteğe bağlı renk. İşlemci ve ağ işaretleri ürünün kullandığı markalarla değiştirilir; Arc'ın işaretleri alınmaz. Yazım oturumu kendi yer tutucu simgelerini kullanır.

## Para ve kart alanları

Kart numarası, son kullanma, CVC gibi **giriş alanı yok**; bileşen yalnız anlatım çizimidir ve gerçek ödeme yapmaz. Tutar, komisyon ve bakiye TRY, `money` ile, kuruş tamsayısıyla; ödeme tutarı = net + komisyon. Sunucu ve tarayıcı aynı çıktıyı versin diye yerel ayar sabit tutulur. Kart girişi gereken bir ekran kurulursa `giris-alanlari-standardi.md` ve ABACUS `mask` / `validate`; bu bileşenin işi değil.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Ödeme tutarı, net tutar | para, TRY | `money.format` |
| Komisyon | para, TRY | `money.format` |
| Satıcı bakiyesi | para, TRY | `money.format` + `animated-counter` (tabular rakam) |
| Yetkilendirme süresi | süre | saniye, iki ondalık, sayarak |

Tutar, komisyon ve bakiye bileşende sabit değil, **uygulamadan** verilir.

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `badge`.

Katalogda olmayan:
- `flow-diagram` (düğümler, yollar, yolda ilerleyen çip; durum satırı; tek döngü saati)
- `step-row` (yetkilendirme/takas adımları)
- `payment-flow` kabuğu

## Türkçe ekran metinleri (öneri)

- Duraklar: "Ödeme noktası", "İşlemci", "Kart ağı", "Banka", "Bakiyeniz"
- Durumlar: "Risk denetleniyor", "Bankaya yönlendirildi", "Onaylandı", "Takas oldu", "Komisyon {tutar}", "Ödendi"
- Adım satırı: "Yetkilendirme", "Takas", "Ertesi iş günü"; onay çipi: "Onaylandı"

## Kapsam dışı (bilerek)

- Gerçek ödeme formu, ödeme sonrası olay dağıtımı anlatımı, kullanıcı etkileşimli adımlar.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Hareketin ayrıntıları ve ölçüleri (süreler, hızlar) bilerek yazılmadı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
