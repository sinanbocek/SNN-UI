# Tarif: settings-page (hesap ayarları sayfası)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Birkaç bölümlü (profil, bildirimler, güvenlik, faturalama gibi) ayar ekranı. Solda bölüm listesi, sağda seçili bölümün formu vardır. Kullanıcı bir alanı değiştirince altta yüzen bir kaydetme çubuğu belirir; değişiklik yoksa çubuk yoktur.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel, trade-kasa, SNN-Portfoy-Yonetimi, SNN-Proje-ve-Nakit-Akis-Yonetimi: kullanıcı/çalışma alanı ayarları.
- SNN-Ihale-Maliyet-Teklif-Yonetimi: firma bilgileri, bildirim tercihleri.
- Bu ekran "ayar çerçevesi"dir; içindeki alanları proje verir.

## Bölümler

1. **Başlık:** "Ayarlar".
2. **Bölüm listesi:** her satırda simge + ad. Seçili satırın altında kayan bir vurgu şeridi vardır. Bir bölümde kaydedilmemiş değişiklik varsa satırın sağında küçük bir nokta çıkar.
3. **Kullanıcı kartı:** bölüm listesinin altında avatar, ad, plan/rol.
4. **Form alanı:** seçili bölümün başlığı, bir cümlelik açıklaması ve alanları.
5. **Profil bölümü örneği:** fotoğraf, "Fotoğrafı değiştir" ve "Kaldır" düğmeleri; ad, görev, e-posta (altında açıklama), saat dilimi seçimi; iki sütun.
6. **Bildirimler bölümü örneği:** gruplanmış satırlar (örn. "E-posta", "Cihazlarda"). Her satırda başlık, açıklama ve sağda anahtar.
7. **Faturalama bölümü örneği:** plan özeti ve tutar, aylık/yıllık seçici, kayıtlı kart satırı, fatura e-postası ve firma adı alanları.
8. **Güvenlik bölümü:** parola, iki adımlı doğrulama, oturumlar için ayrılmış bölüm; içeriği bu tarifte tanımlanmadı (önizlemede boş göründü, bakılamadı).
9. **Kaydetme çubuğu:** formun altında yüzen hap biçimli çubuk: "N kaydedilmemiş değişiklik", "Vazgeç", "Kaydet". N, değişen alan sayısıdır ve değişince sayı yuvarlanarak güncellenir.

## Kullanıcı ne yapar, ne olur

- **Bölüm seçer** (tıkla ya da ok tuşları): form değişir, vurgu şeridi kayarak yeni satıra geçer. Yarım kalan değişiklikler korunur (bölümler arası geçişte kaybolmaz); kaydedilmemiş bölümde nokta kalır.
- **Alan değiştirir:** o alan "değişti" sayılır, çubuk belirir, bölüm satırında nokta çıkar. Değeri eskiye geri yazarsa değişiklik sayısı düşer; sıfırsa çubuk kaybolur.
- **Anahtar çevirir:** bildirim anahtarları da diğer alanlar gibi değişiklik sayılır ve Kaydet ile geçer (anında etkili değildir).
- **Kaydet / Ctrl+S (Mac'te Cmd+S):** değişiklikler kaydedilir; çubuk yerini kısa bir "Kaydedildi" durumuna bırakıp kapanır. Ekran okuyucuya duyurulur. Tarayıcının kendi kaydet penceresi açılmaz.
- **Vazgeç:** tüm alanlar son kaydedilmiş değere döner; "geri alındı" duyurulur.
- **Fotoğrafı değiştir:** dosya seçtirir; yeni görsel önizlenir ve değişiklik sayılır. **Kaldır:** baş harfli yer tutucuya döner, değişiklik sayılır.
- **Yıllık/aylık seçer:** tutar ve tasarruf ipucu güncellenir (ayrı bir kaydetme gerektirmez ya da değişiklik sayılır; proje seçer, varsayılan: değişiklik sayılır).

## Durumlar

- **Boş:** yeni kullanıcıda alanlar boş, yer tutucu metinleri görünür. Bildirimler bölümünde hiç tercih yoksa boş durum.
- **Yükleniyor:** form verisi gelirken alanlar yerine iskelet; bölüm listesi hemen görünür; kaydedilemez.
- **Kaydediliyor:** Kaydet düğmesi meşgul görünür, tekrar basılamaz, alanlar düzenlenebilir kalır.
- **Hata:** alan hatası alanın altında, sunucu hatası çubuğun içinde kırmızı kısa metin; değişiklikler **kaybolmaz**, çubuk açık kalır, "Yeniden dene" olur.
- **Çok uzun içerik:** form kendi içinde kayar; bölüm listesi ve çubuk yerinde kalır. Uzun e-posta/firma adı alan içinde kesilmeden kayar.
- **Dar ekran:** bölüm listesi formun üstünde yatay kayan şeride dönüşür; alanlar tek sütun olur. Çok dar ekranda çubuk ikincil yazıyı gizler ("Vazgeç" simgeye inebilir); profil başlığı dikey dizilir.

## Klavye ve ekran okuyucu

- Kök, etiketli bir bölge ("Ayarlar").
- Bölüm listesinde yukarı/aşağı ok (ya da dar ekranda sağ/sol) bölüm değiştirir; Home ilk, End son bölüme gider. Odak tek satırdadır, Tab formun içine geçer.
- Her alanın görünür etiketi vardır.
- Ctrl/Cmd+S: bekleyen değişiklikleri kaydeder.
- Çubuk değişince nazikçe okunur: "3 kaydedilmemiş değişiklik". Kaydet ve vazgeçte sonuç duyurulur.
- Noktalı bölüm satırının adına "kaydedilmemiş değişiklik var" eklenir (nokta yalnız renkle verilmez).

## Hareket

- Bölüm vurgu şeridi satırlar arasında kayar.
- Kaydetme çubuğu alttan yumuşakça açılıp biçim değiştirerek belirir; sayı yuvarlanarak değişir.
- Bölüm içeriği değişirken hafif solma.
- **"Hareketi azalt" açıkken:** şerit kaymaz (anında yer değiştirir), çubuk biçim değiştirmez, sadece solarak görünür; sayı yuvarlanmaz.
- Süre ve eğri `snn-foundation.css` değişkenlerinden.

## Kurulacak SNN-UI parçaları

Katalogdan: `input`, `select`, `switch`, `button`, `tabs` (bölüm listesi için dikey sekme düzeni olarak; kayan vurgu ayrı iş), `radio-group` (aylık/yıllık seçici yerine geçici), `toast` ("Kaydedildi"), `skeleton`, `empty-state`, `card`.

Katalogda olmayan:
- `avatar`
- `segmented-control` (aylık/yıllık; ya `radio-group` görünümüyle ya yeni parça)
- `save-bar` (kaydetme çubuğu; değişiklik sayısı, vazgeç, kaydet; yeni parça, diğer ayar ekranlarında da kullanılır)
- `settings-page` kabuğu (bölüm listesi + form + çubuk)
- Sayı yuvarlama ve tutar gösterimi: ABACUS (tutar kutusu ve para biçimi 2. rafta).

## Türkçe ekran metinleri (öneri)

- Başlık: "Ayarlar"; bölümler: "Profil", "Bildirimler", "Güvenlik", "Faturalama"
- Profil açıklaması: "Ekip arkadaşlarınız sizi böyle görür."
- Düğme: "Fotoğrafı değiştir", "Kaldır", "Kaydet", "Vazgeç"
- Çubuk: "{n} kaydedilmemiş değişiklik"
- Sonuç: "Değişiklikler kaydedildi.", "Değişiklikler geri alındı."
- Hata: "Kaydedilemedi. Değişiklikleriniz duruyor." / "Yeniden dene"
- Alan açıklaması: "Giriş ve bildirimler için kullanılır."
- Yükleniyor: "Ayarlar yükleniyor"

## Kapsam dışı (bilerek)

- Gerçek kaydetme, fotoğraf yükleme, sunucu doğrulaması (proje bağlar).
- Güvenlik, faturalama, ekip yönetimi ayrıntıları: Pro sayfası bunları ayrı bileşenlere bırakıyor; burada yalnız yer tutucu bölümler.
- Güvenlik bölümü içeriği (önizlemede açılamadı).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede alan değiştirme, vazgeç, bölüm geçişi denendi; çubuktaki Kaydet ve Ctrl+S denenmedi.
