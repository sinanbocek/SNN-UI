# Tarif: multi-step-form (adım adım form)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Uzun bir formu her seferinde tek karar sunan kısa adımlara böler. Üstte adım listesi, ortada o adımın alanları, altta "Geri" ve "Devam". Son adımdan sonra başarı mesajı. Kullanıcı geri dönse de girdikleri kaybolmaz.

## Hangi aile projesinde ne için (tahmin)

- SNN-Ihale-Maliyet-Teklif-Yonetimi: yeni teklif/proje sihirbazı.
- GHS-Panel, SNN-Portfoy-Yonetimi: ilk kurulum ve kayıt akışları.
- Yalnız ilerleme göstergesi gerekirse ayrı bir adım göstergesi; tam sayfa alışveriş/ödeme akışı bu bileşen değil.

## Bölümler

1. **Adım listesi:** numaralı adımlar; tamamlananlarda tik, aktifte vurgu. Taşarsa yana kayar.
2. **Adım sayacı:** "Adım 1 / 2" (sayı değişirken yuvarlanır).
3. **Adım başlığı ve açıklaması:** o adımın başlığı ve kısa yönlendirme cümlesi.
4. **Alanlar:** adımın içeriği (projenin verdiği alanlar).
5. **Alt eylemler:** solda "Geri", sağda "Devam" (son adımda "Bitir"; yazı değişince düğme genişliği yumuşakça uyar).
6. **Başarı alanı:** son adımdan sonra durum mesajı ve başlık.

## Kullanıcı ne yapar, ne olur

- **Alanları doldurur, Devam'a (ya da Enter'a) basar:** adım doğrulanır; geçerliyse bir sonraki adıma yön gösterecek biçimde kayarak geçilir, form kutusu yeni adımın yüksekliğine yaylanır.
- **Geçersiz alan varsa:** geçiş olmaz; ilk geçersiz alan hata yazısıyla işaretlenir ve odak ona gider.
- **Geri:** önceki adıma döner; girilenler korunur. İlk adımda pasiftir.
- **Son adımda Bitir:** tamamlama uygulamaya iletilir; başarı durumu görünür, odak başarı başlığına gider.
- **Adım listesindeki tamamlanmış adıma basar:** o adıma geri dönülür (isteğe bağlı; varsayılan: yalnız tamamlanmış adımlara dönülebilir, ileri atlanamaz).

## Durumlar

- **Bekleyen alan değerleri:** değerler üst bileşende tutulur (yalnız aktif adım çizilir), adım değişince kaybolmaz.
- **Gönderiliyor:** Devam/Bitir meşgul olur, alanlar pasif.
- **Hata (sunucu):** son adımda kırmızı kısa metin ve "Yeniden dene"; girdiler korunur.
- **Başarı:** "Tamamlandı" mesajı ve ikinci bir eylem bağlantısı (örn. "Panoya git").
- **Boş adım listesi:** hiçbir şey çizilmez.
- **Çok uzun içerik:** adım içeriği kendi içinde kayar; çok uzun adım listesi yatay kayar.
- **Dar ekran:** adım listesi yatay kayar; dar başlıkta adım sayacı üste çıkar ve iç boşluklar azalır.

## Klavye ve ekran okuyucu

- Her adım bir alan grubudur (grup + başlık); adım değişince odak yeni adım başlığına (ya da başarı başlığına) gider.
- Adım listesi etiketli bir gezinme; etkin adım `aria-current="step"`; görünmez nazik bir satır "Adım 2 / 3" der.
- Enter adımı gönderir (formun yerel gönderimi); Tab alanlar ve düğmeler arasında gezer.
- Başarı durum rolüyle bildirilir. Yerel `required`, `pattern` gibi kısıtlar geçişi engeller.

## Hareket

- Adımlar yön gösterecek biçimde kısa mesafe kayar; form kutusunun yüksekliği yeni adıma yaylanır.
- Tamamlanan adımın işareti tik çizerek belirir; adım sayısı yuvarlanır; düğme genişliği etiket değişince yumuşakça uyar.
- **"Hareketi azalt" açıkken:** adım, yükseklik ve etiket değişimi anında.

## Kurulacak SNN-UI parçaları

Katalogdan: `input`, `textarea`, `select`, `radio-group`, `checkbox`, `switch` (adım içeriği için), `button` (Geri, Devam, Bitir, meşgul durumu), `toast` (isteğe bağlı), `empty-state`.

Katalogda olmayan:
- `progress` / `stepper` (adım listesi: numara, tik, aktif vurgu; yeni parça)
- `multi-step-form` kabuğu (adımları ve tamamlama işlevini dışarıdan alır; doğrulama yerel kısıtlarla, ötesi projeye bırakılır)
- Para, sayı, tarih, telefon alanları bu rafta yok: ABACUS ile 2. rafta (giriş alanları standardı).

## Türkçe ekran metinleri (öneri)

- Sayaç: "Adım {n} / {m}"
- Düğme: "Geri", "Devam", "Bitir", gönderirken "Gönderiliyor…"
- Başarı: "Tamamlandı.", "Bilgileriniz kaydedildi."
- Hata: "Bu alan zorunlu.", "Gönderilemedi, lütfen tekrar deneyin." / "Yeniden dene"
- Duyuru: "Adım {n} / {m}: {başlık}"

## Kapsam dışı (bilerek)

- Adım listesi tek başına (adım göstergesi), tam sayfa ödeme/alışveriş akışı.
- Koşullu/dallanan adımlar, taslak kaydetme, çok kullanıcılı doldurma.
- Gelişmiş doğrulama (proje yazar; bileşen yalnız yerel kısıtlara saygı duyar).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede iki adımlı örnek, adım listesi ve alt düğmeler görüldü; adım geçişi ve doğrulama denenmedi, sayfa metnindeki davranış listesinden alındı. "Adıma geri tıklama" davranışı sayfada yoktur, tasarım önerimizdir.
