# Tarif: cart-drawer (yandan açılan sepet çekmecesi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Ürün ızgarasında "Sepete ekle" denince ürün fotoğrafı sepet düğmesine doğru uçar; sayaç ürün konunca değişir. Sepet düğmesi yandan bir çekmece açar: satır adetleri, kaydırarak silme, ücretsiz kargo çubuğu, kupon kodu ve ödeme düğmesi. Ödeme düğmesi onay yuvarlağına dönüşür.

## Hangi aile projesinde ne için (tahmin)

- Birden çok ürün ekleyen mağaza sayfaları; kargo eşiği ve kupon gösteren satış ekranları.
- Tek ürünün sipariş özeti için `checkout-summary`; yan panel olmayan genel çekmece için katalogdaki `drawer`.

## Bölümler

1. **Ürün ızgarası:** kart başına fotoğraf, ad, kısa açıklama, fiyat, "Sepete ekle". Geniş kapta üç, dar kapta iki sütun.
2. **Sepet düğmesi:** üstte; ürün adedi rozeti, etiketi ve açılır pencere bilgisi taşır.
3. **Çekmece:** başlık, kapat düğmesi, satır listesi, kargo çubuğu, kupon alanı, toplamlar, ödeme düğmesi.
4. **Satır:** küçük fotoğraf, ad, açıklama, fiyat, adet düzenleyici (adet 1 iken eksi düğmesi "Kaldır" olur).
5. **Ücretsiz kargo çubuğu:** eşiğe ne kadar kaldığını söyler, dolar; eşik aşılınca "kazanıldı" metni.
6. **Kupon alanı:** kod yazılır, Enter ya da "Uygula"; geçersizse alan uyarır ve notu değiştirir.
7. **Toplamlar:** ara toplam, kargo, kupon indirimi, genel toplam (döner).
8. **Ödeme düğmesi:** basınca işleniyor durumuna, sonra onay yuvarlağına ve çizilen tik işaretine dönüşür; örnek makbuz gösterir.

## Kullanıcı ne yapar, ne olur

- **"Sepete ekle":** ürün fotoğrafı yay çizerek sepet düğmesine uçar (küçülür, hafif döner); rozet sayısı yalnız uçuş bitince artar; düğme bir sıçrar.
- **Sepeti açar:** çekmece yandan gelir, odak kapat düğmesine gider, arkadaki mağaza etkileşime kapanır.
- **Adedi değiştirir:** toplamlar döner. Adet bire inince eksi "Kaldır"a dönüşür.
- **Satırı sola kaydırır ya da hızlıca fırlatır:** belli eşiği aşarsa satır silinir (yükseklik çökerek); kısa sürüklemede yerine döner. Her kaydırma işlemi için düğme karşılığı var.
- **Kupon yazar:** geçerliyse indirim satırı eklenir; geçersizse alan hata gösterir.
- **Ücretsiz kargo:** çubuk sepet tutarıyla dolar.
- **Ödeme:** düğme işleniyor olur, çekmece o sırada kilitlenir, sonra onay görünür. Bileşen gerçek ödeme yapmaz; ödemeyi uygulama bağlar.
- **Escape:** çekmeceyi kapatır (sipariş işlenirken kapatmaz); odak sepet düğmesine döner.

## Durumlar

- **Boş sepet:** boş durum metni ve "Alışverişe dön".
- **Geçersiz kupon:** alan hatalı, not metni hata olur. **Ödeme işleniyor:** çekmece gövdesi kilitli.
- **Genişlik:** kap bir boyut kabıdır; 640 px ve altında iki sütun; 380 px ve altında sepet etiketi gizlenir, fiyatlar adın altına iner, çekmece bloğu neredeyse tam doldurur. Satırlar yatay sürüklenir ama dikey kaydırma bozulmaz (yön kilidi).

## Klavye ve ekran okuyucu

- Enter/Space: ekle, sepeti aç, adet, kaldır, ödeme. Kupon alanında Enter uygular. Escape kapatır.
- Sepet düğmesi `aria-haspopup="dialog"`, `aria-expanded`, adet etiketi. Çekmece `role="dialog"`, `aria-modal`.
- Adet düzenleyici etiketli gruptur. Kargo çubuğu ilerleme çubuğu rolünde. Geçersiz kupon `aria-invalid`.
- Ekleme, silme, kupon değişimi ve sipariş sonucu kibar canlı bölgede duyurulur.

## Hareket

- Uçuş yay çizer; sayaç ancak konunca değişir; çekmece hafif sönümlü yayla girer; silinen satır yüksekliği çöker; toplamlar döner.
- Ödeme düğmesi ile onay yuvarlağı ortak yerleşim öğesidir; tik çizilerek gelir.
- **"Hareketi azalt" açıkken:** uçuş ve sıçrama yok, satır sürükleme kapalı, çekmece kayma yerine solar.

## Görseller

Ürün fotoğrafı kart ve satır küçük resmi için; uçuşta aynı fotoğraf kopyası kullanılır. Yazım oturumu yer tutucu kullanır.

## Para ve kart alanları

Gerçek ödeme ve kart girişi yok. Fiyatlar TRY ve `money` ile. Kargo eşiği, kargo ücreti ve kupon kuralları **uygulamadan** gelir; kupon doğrulaması sunucuda yapılır (bileşen yalnız sonucu gösterir). Kart numarası, son kullanma, CVC gibi alanlar bu bileşende yok; ödeme sayfasında gerekirse `giris-alanlari-standardi.md` (yazarken süzme + kaydederken doğrulama) ve ABACUS `mask` / `validate` kullanılır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Ürün fiyatı, satır toplamı | para, TRY | `money.format` |
| Ara toplam, kargo, indirim, genel toplam | para, TRY | `money.format`, kuruş tamsayısıyla toplanır; toplam `animated-counter` |
| Kargo çubuğu "kalan tutar" | para, TRY | `money.format`; yüzde için `money.percent` |
| Sepet adedi | adet | `animated-counter` |

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `button`, `drawer`, `progress`, `input`, `empty-state`.

Katalogda olmayan:
- `fly-to-cart` (uçuş)
- `swipe-row` (kaydırıp silme, düğme karşılıklı)
- `number-stepper`
- `cart-drawer` kabuğu

## Türkçe ekran metinleri (öneri)

- "Sepet", "Sepete ekle", "Kaldır", "Kupon kodu", "Uygula", "Ara toplam", "Kargo", "Toplam", "Siparişi tamamla", "Siparişiniz alındı"
- Kargo: "Ücretsiz kargo için {tutar} kaldı", "Ücretsiz kargo kazandınız"
- Hata: "Bu kupon geçerli değil."

## Kapsam dışı (bilerek)

- Çok adımlı ödeme (adres, kart), sepetin kalıcı saklanması, kupon kuralları, vergi hesabı.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
