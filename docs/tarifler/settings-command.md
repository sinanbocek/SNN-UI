# Tarif: settings-command (aranabilir çok ayarlı sayfa)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Onlarca ayarın tek uzun sayfada durduğu ekran. Üstteki arama kutusu bir komut paletine dönüşür; kullanıcı ayarın adını yazar, seçince sayfa o satıra kayar ve satır dikkat çeker. Değişiklikler altta yüzen çubukta toplanır.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel, SNN-Portfoy-Yonetimi, SNN-Ihale-Maliyet-Teklif-Yonetimi, trade-kasa: ayarları 15'ten fazla olan yönetim ekranları ("Ayarlar" sayfası).
- `settings-page` kısa, sayfalı profil formudur; bu ise çok ayarlı, aranabilir olandır. Biri seçilir, ikisi birlikte kurulmaz.

## Bölümler

1. **Başlık satırı:** "Ayarlar" ve yanında arama kutusu; kutunun sağında kısayol ipucu.
2. **Bölüm gezgini:** solda dikey liste (simge + ad); görünen bölümü kayan bir vurgu işaretler.
3. **Ayar satırı:** solda ad ve bir cümlelik açıklama, sağda denetim. Denetim türleri: anahtar, iki-üç seçenekli segment, açılır seçim, metin kutusu (önüne sabit ek metin alabilir).
4. **Bölüm başlığı:** her bölümün adı ve kısa açıklaması; satırlar tek uzun sayfada art arda dizilir.
5. **Düzenlendi işareti:** değiştirilen satırın ve ait olduğu bölümün yanında nokta.
6. **Komut paleti:** arama kutusunun büyüyüp açıldığı yüzey; üstte yazı alanı, altında sonuç listesi, yazmadan önce önerilen ayarlar.
7. **Kaydetme çubuğu:** altta; küçük bir toptan açılır, "N değişiklik", "Vazgeç", "Kaydet".

## Kullanıcı ne yapar, ne olur

- **Arama kutusuna tıklar ya da Ctrl/Cmd+K ya da "/" basar** (blok içinde odak varken): kutu büyüyerek palete dönüşür; yazmadan önce önerilen ayarlar görünür.
- **Yazar:** ayarlar ad, açıklama ve anahtar kelimelere göre süzülür ("2fa", "karanlık mod" gibi insanların gerçekte yazdığı sözler eşleşmeli; her ayarın ek anahtar kelime listesi olur).
- **Ok tuşları + Enter ya da tık:** palet kapanır, sayfa o satıra kayar, odak satırın denetimine geçer, satır iki kez hafifçe "nefes alır" (arka plan dalgalanır).
- **Esc:** palet arama kutusuna geri küçülür, odak kutuya döner.
- **Bölüm gezgininde bir ada basar:** sayfa o bölüme kayar. Kaydırdıkça vurgu görünen bölüme geçer.
- **Ayarı değiştirir:** satır ve bölüm "düzenlendi" noktası alır; çubuk küçük toptan açılıp sayıyı gösterir. Değer eskiye dönünce değişiklik sayısı düşer.
- **Kaydet:** değişen ayarların yalnız kimlikleri ve değerleri uygulamaya iletilir; çubuk "Ayarlar kaydedildi" durumuna dönüp kapanır. **Hata olursa** çubuk açık kalır, "Yeniden dene" çıkar.
- **Geçersiz alan varsa Kaydet:** engellenir ve ilk geçersiz satıra aynı arama uçuşuyla gidilir; hata satırda yazar.
- **Vazgeç:** tüm değerler son kaydedilene döner.

## Durumlar

- **Boş arama sonucu:** palette "Eşleşen ayar yok" ve önerilen ayarlar yeniden gösterilir.
- **Yükleniyor:** satırlar iskelet olur; arama pasif.
- **Kaydediliyor:** Kaydet meşgul, tekrar basılamaz.
- **Hata:** alan hatası satır altında, sunucu hatası çubukta; değişiklikler korunur.
- **Çok uzun içerik:** sayfa kendi çerçevesinde kayar, gezgin ve çubuk sabit kalır. Uzun açıklama satırı kırar.
- **Dar ekran:** gezgin içeriğin üstünde yatay kayan şerit olur. Çok dar ekranda seçim ve segment denetimleri etiketin altına iner; anahtar satırda kalır. Palet çerçeveye sığar, ipucu satırı düşer.

## Klavye ve ekran okuyucu

- Palet modal bir pencere; içinde birleşik kutu ve seçenek listesi. Okların odağı kutuda kalır, etkin sonuç duyurulur. Boşluğa basılan dış alan paleti kapatır.
- Her satırın denetimi ayar adıyla etiketli, açıklama ve hata metniyle tanımlıdır.
- Düzenlenmiş satır ve bölümde noktaya ek olarak gizli "düzenlendi" yazısı vardır; durum yalnız renk değildir.
- Nazik durum bölgesi: atlamalar, kaydetme, vazgeçme ve doğrulama sorunları duyurulur.
- Tab: gezgin → denetimler → Kaydet/Vazgeç.

## Hareket

- Arama kutusu palete dönüşürken konum, boyut ve köşe yuvarlaklığı tek yaylanmayla değişir; sonuçlar yeniden dizilmek yerine büyüyen kenarla ortaya çıkar.
- Sonuç seçilince palet satıra uçar, sayfa aynı anda kayar, satırın dalgası iki kez kabarıp söner.
- Gezgin vurgusu görünen bölüme kayar.
- Kaydetme çubuğu küçük bir toptan büyür, sayı yuvarlanır, kaydedilince küçülüp "kaydedildi" yazar.
- **"Hareketi azalt" açıkken:** uçuşlar solmaya, kaydırma anında olur, tek yumuşak vurgu kalır.

## Kurulacak SNN-UI parçaları

Katalogdan: `search-field` (tetikleyici), `dialog` (palet), `switch`, `select`, `input`, `radio-group` (segment yerine geçici), `button`, `tabs` değil, `toast`, `skeleton`, `empty-state`.

Katalogda olmayan:
- `command-palette` / `combobox` (modal arama listesi; help-center ve search-results ile ortak parça)
- `segmented-control`
- `highlight-text` (eşleşen kelime vurgusu, isteğe bağlı)
- `save-bar` (settings-page ile ortak)
- `section-nav` (kayan vurgulu dikey gezgin)
- `settings-command` kabuğu; ayarlar tek bir şema dosyasından (bölümler, ayarlar, denetim türü, anahtar kelimeler) okunur: palet, gezgin ve satırlar aynı şemayı kullanır.

## Türkçe ekran metinleri (öneri)

- Başlık: "Ayarlar"; arama: "Ayarlarda ara"; ipucu: "Ctrl K"
- Palet: "Ayar ara…", "Önerilen ayarlar", "Eşleşen ayar yok"
- Bölümler (proje belirler, örnek): "Genel", "Görünüm", "Bildirimler", "Güvenlik", "Üyeler", "Faturalama"
- Çubuk: "{n} değişiklik", "Vazgeç", "Kaydet", "Ayarlar kaydedildi.", "Kaydedilemedi", "Yeniden dene"
- Satır işareti (gizli metin): "Düzenlendi"
- Duyuru: "{ayar} ayarına gidildi"

Not: dil, saat dilimi, para birimi, hafta başı gibi ayarların seçenek içerikleri ve biçimleri ABACUS ile tanımlanır; bu bileşen biçim kodu yazmaz.

## Kapsam dışı (bilerek)

- Gerçek kayıt ve ayar şemasının içeriği (proje verir).
- Birkaç alanlık kısa form: `settings-page` ya da düz form.
- Uygulama geneli komut paleti (gezinme + eylemler): ayrı bileşen.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede bölüm gezgini ve satırlar görüldü; palet açılışı ve uçuş denenmedi (tıklamada palet açılmadı), bu kısımlar sayfa metnindeki davranış listesinden alındı.
