# Tarif: checkout-summary (ödeme öncesi sipariş özeti)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Tek ürünlü bir siparişin ödemeden önceki son özeti: ürün satırı, otomatik indirim satırları, kupon kodu (uygulanınca çipe dönüşür), vergi satırı, dönen genel toplam ve "Öde" düğmesi (boşta → işleniyor → ödendi). Gerçek ödeme almaz; ödemeyi uygulama bağlar.

## Hangi aile projesinde ne için (tahmin)

- Abonelik ya da tek ürün satan aile projesinin ödeme öncesi yan paneli; fiyat sayfasında son tutarı onaylatan kart.
- Çok ürünlü sepet için `cart-drawer`; adres ve kart toplayan çok adımlı ödeme bu bileşenin dışında.

## Bölümler

1. **Başlık:** "Sipariş özeti" (bölümün erişilebilir adı).
2. **Ürün satırı:** küçük görsel kutusu, ad (tek satır, taşan kesilir), kısa açıklama, fiyat ve dönem notu ("yıllık").
3. **Kupon alanı:** kod girişi ve "Uygula"; uygulanınca kod çipi ve kaldır düğmesi.
4. **Tutar satırları:** ara toplam, her indirim (negatif, renkli), kupon indirimi, vergi (oran verilirse hesaplanır, verilmezse "ödemede hesaplanır" notu).
5. **Genel toplam:** büyük, dönen rakamlar.
6. **Öde düğmesi:** etiket toplamı içerir; altında kilit simgeli güvenlik notu ve isteğe bağlı küçük yazı.

## Kullanıcı ne yapar, ne olur

- **Kod yazıp Enter'a basar ya da "Uygula"ya basar:** doğrulama sunucuda yapılır. Geçerliyse form çipe dönüşür, indirim satırı yükseklikle açılır, toplam döner. Geçersizse alan yatay sallanır ve hata iletisi çıkar.
- **Boş alanda Enter:** odak alanda kalır, bir şey olmaz.
- **Çipin kaldır düğmesi:** kodu geri alır, odak alana döner.
- **"Öde":** düğme işleniyor (dönen halka), sonra "Ödendi" olur; hata olursa "Tekrar dene" ve satır içi hata. Alternatif olarak form gönderimiyle barındırılan ödeme sayfasına yönlenir; geri dönüşte düğme sıfırlanır.
- **Ara toplam hiçbir zaman sıfırın altına inmez.**

## Durumlar

- **Kupon geçersiz:** alan hatalı, uyarı iletisi.
- **Ödeme kapalı:** düğme görünür ama basılamaz (ödeme henüz açılmadıysa).
- **Ödeme işleniyor / ödendi / hata:** düğmenin etiketi ve simgesi her değişimde yükselerek bulanıkla yer değiştirir.
- **Genişlik:** kart en çok 440 px, daha dar kapta doldurur; dolgu 20–28 px arası ölçeklenir; ürün adı tek satır, fiyat sütunu kırılmaz. Fare üzerine gelme biçimleri yalnız ince imleçte.

## Klavye ve ekran okuyucu

- Kupon alanında Enter uygular; çipin kaldır düğmesinde Enter/Space kaldırır.
- Bölüm başlıkla etiketli; kupon alanının görünmez etiketi var; hata `aria-invalid`, `aria-describedby`, `role="alert"`.
- Çipin kaldır düğmesi "Kodu kaldır {kod}" der. Öde düğmesi kibar canlı bölgedir (işleniyor, ödendi, tekrar dene duyurulur).
- Toplamın görünmez biçimli metni var; dönen rakamlar ekran okuyucudan gizli.

## Hareket

- İndirim ve kupon satırları yükseklik yayıyla açılır ve solarak gelir. Kupon formu çipe küçük ölçek ve bulanıklıkla geçer. Geçersiz kodda alan kısa süre yatay sallanır.
- Toplam döner; düğme durumları yükselme+bulanıkla değişir, işleme halkası döner.
- **"Hareketi azalt" açıkken:** sallanma yok, satırlar anında belirir, geçişler solma, halka yavaşlar.

## Görseller

Ürün için küçük bir görsel ya da simge kutusu (isteğe bağlı). Yazım oturumu yer tutucu kullanır.

## Para ve kart alanları

Bu bileşende kart numarası, son kullanma, CVC alanı **yok**; ödeme ya barındırılan ödeme sayfasına yönlendirilir ya da uygulama kendi ödemesini bağlar. Tutarlar TRY, `money` ile, kuruş tamsayısıyla; vergi satırı oran verilirse indirimli ara toplam üzerinden hesaplanır. Kupon doğrulaması **sunucuda** yapılır, bileşen istemci tarafında karar vermez. İleride kart alanı eklenirse `giris-alanlari-standardi.md` (yazarken süzme + kaydederken doğrulama) ve ABACUS `mask` / `validate` kullanılır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Ürün fiyatı, ara toplam | para, TRY | `money.format` |
| İndirimler (negatif) | para, TRY | `money.format`, eksi işaretiyle |
| Vergi | para, TRY | `money.format`; oran `money.percent` |
| Genel toplam | para, TRY | `money.format` + `animated-counter`; ondalık kuruş varsa iki basamak |

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `button`, `input`, `badge` (kupon çipi için), `skeleton`.

Katalogda olmayan:
- `promo-code-field` (çipe dönüşen alan, sallanma)
- `order-line` (indirim satırı, not satırı)
- `pay-button` (boşta/işleniyor/ödendi/hata)
- `checkout-summary` kabuğu

## Türkçe ekran metinleri (öneri)

- "Sipariş özeti", "Kupon kodu", "Uygula", "Ara toplam", "Vergi", "Toplam", "{tutar} öde", "İşleniyor", "Ödendi", "Tekrar dene"
- "Şifreli ödeme", "Vergi ödemede hesaplanır", "Kodu kaldır: {kod}"

## Kapsam dışı (bilerek)

- Adres ve kart toplayan ödeme akışı, çok ürünlü sepet, vergi kuralları, kupon mantığı, gerçek ödeme.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi; ödeme alanı denenmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
