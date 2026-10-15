# Tarif: roles-permissions (roller ve izinler matrisi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Hangi rolün neyi yapabileceğini tek tabloda gösterir ve düzenletir. Satırlar izinler, sütunlar roller; kesişimde onay kutusu. İzinler gruplanır; grup kutusu hepsini birden açar/kapar. Değişiklikler kaydedilmeden önce bir inceleme çubuğunda toplanır.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel, SNN-Portfoy-Yonetimi, SNN-Ihale-Maliyet-Teklif-Yonetimi: yönetici ayarlarında "Roller" sayfası.
- Kişilere rol atama `team-members` tarifindedir; burada yalnız rolün yetkileri düzenlenir.

## Bölümler

1. **Başlık:** "Roller ve izinler", altında üye sayısı ve rol sayısı; sağda üye avatarları (kısaltmalı).
2. **Sütun başlıkları:** her rol: ad, kaç kişi, rol menüsü (çoğaltma gibi eylemler). Sahip rolünün yanında kilit simgesi var, izinleri sabit.
3. **İzin grupları:** katlanabilir bölümler (Projeler, Üyeler, Faturalama, Güvenlik gibi örnek); başlıkta grup adı ve izin sayısı, her rol sütununda grup kutusu.
4. **İzin satırları:** solda izin adı (satır başlığı), her rol için onay kutusu.
5. **Grup kutusu durumları:** hepsi açık, hiçbiri açık değil, kısmen açık (çizgili).
6. **Alt not:** sahibin her yetkiye her zaman sahip olduğu söylenir.
7. **İnceleme çubuğu:** değişiklik varken görünür: "Kaydedilmemiş değişiklik", sayı, "Vazgeç", "Değişiklikleri gözden geçir/Kaydet".
8. **Kaydedilmemiş nokta:** değişen rol sütununun başlığında.

## Kullanıcı ne yapar, ne olur

- **Hücreye basar (ya da Boşluk):** o rol o izni alır/kaybeder; hücrenin sütununda ve grup kutusunda durum güncellenir; değişiklik noktası çıkar; çubuk alttan kayarak gelir.
- **Grup kutusuna basar:** gruptaki izinler sırayla (hafif gecikmeyle dalga gibi) açılır ya da kapanır. Kısmi durumdan basınca hepsi açılır.
- **Grup başlığına basar:** grup katlanır/açılır.
- **Fare ile sütun üstünde dolaşır:** o rol sütunu hafifçe vurgulanır.
- **Rol menüsünden "çoğalt":** yeni rol, kaynağın izinleriyle eklenir, adı düzenlenmeye hazır gelir (menü içeriğini proje seçer).
- **Sahip sütunu:** kutular işaretli ve değiştirilemez; basınca neden kapalı olduğu ipucuyla söylenir.
- **Kaydet:** değişiklikler uygulamaya iletilir; çubuk "Kaydedildi" durumuna döner ve kapanır. **Vazgeç:** hepsi geri alınır.
- **Kaydetmeden önce inceleme:** çubuk değişen izinlerin kısa özetini açar ("Editör: Üyeleri davet et eklendi"); özet boşsa Kaydet pasif.

## Durumlar

- **Boş (hiç rol):** boş durum: "Henüz rol yok" ve "Rol oluştur".
- **Yükleniyor:** tablo iskeleti, kutular pasif.
- **Kaydediliyor / hata:** Kaydet meşgul; hata olursa çubukta kısa kırmızı metin, değişiklikler korunur, "Yeniden dene".
- **Çok uzun içerik:** çok sayıda izin için gruplar kapalı başlayabilir. Tablo sanallaştırılmaz; her hücre gerçek denetimdir.
- **Dar ekran:** tablo yana kayar, izin adı sütunu sabit kalır (yapışkan); rol sütunları dar ve eşit genişlikte; çok darda grup sayıları gizlenir. İnceleme çubuğu görünür alanda yapışkan kalır.
- **Kilitli hücre:** gri, odaklanabilir ama değişmez.

## Klavye ve ekran okuyucu

- Tablo `grid` olarak işaretlenir: satır, satır başlığı, sütun başlığı rolleri; tek Tab durağı.
- Ok tuşları hücreler arasında gezer (yan satıra geçerken en yakın hücreye oturur); Home/End satırın ilk/son hücresine; Ctrl+Home/End tablonun ilk/son hücresine.
- Hücreler anahtar ya da onay kutusu gibi okunur; grup kutusu karışık durumda "karışık" bildirir; kilitli hücre "devre dışı" der.
- Nazik durum bölgesi her değişikliği ve kayıt ilerlemesini duyurur.
- Durum yalnız renkle değil, işaret/çizgi/boş kutu biçimiyle de verilir.

## Hareket

- Grup kutusu izinleri kısa gecikmelerle sırayla çevirir (dalga).
- Fare ile üstünde durulan rol sütunu hafif bir bantla öne çıkar.
- Kaydedilmemiş nokta küçük bir zıplamayla belirir; inceleme çubuğu alttan kayar.
- **"Hareketi azalt" açıkken:** dalga ve yay yok; durumlar anında değişir.

## Kurulacak SNN-UI parçaları

Katalogdan: `checkbox` (hücre için temel; üç durumlu hâli gerekir), `button`, `dropdown-menu` (rol menüsü), `tooltip`, `toast`, `skeleton`, `empty-state`.

Katalogda olmayan:
- `permission-grid` (matris kabuğu ve gezinme)
- `tri-state-checkbox` (hepsi/hiçbiri/kısmen; mevcut `checkbox` genişletilebilir)
- `save-bar` (ortak; değişiklik özetli sürüm)
- `avatar-group`
- `collapsible-section`
- Kişi ve rol sayıları: ABACUS'a uyar.

## Türkçe ekran metinleri (öneri)

- Başlık: "Roller ve izinler"; alt: "{n} üye, {m} rol"
- Sütun: "{n} kişi", "İzinleri sabit"
- Grup: "{n} izin"
- Not: "Sahip her zaman tüm izinlere sahiptir."
- Çubuk: "Kaydedilmemiş değişiklik", "Vazgeç", "Kaydet", "Değişiklikler kaydedildi."
- Menü: "Rolü çoğalt", "Adı değiştir", "Sil"
- Boş: "Henüz rol yok", "Rol oluştur"
- Hata: "İzinler kaydedilemedi." / "Yeniden dene"
- Duyuru: "{rol} için {izin} açıldı", "kapatıldı"

## Kapsam dışı (bilerek)

- İzinlerin gerçekten uygulanması (proje yetkilendirme sistemine bağlar).
- Kişiye rol atama (`team-members`), tek kullanıcı güvenliği.
- Çok büyük izin kümeleri için arama ve sanallaştırma.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede matris ve grup kutuları görüldü; hücre ve grup tıklamaları, rol menüsü ve kaydetme denenmedi, sayfa metnindeki davranış listesinden alındı. İnceleme özetinin ayrıntısı önizlemede görülmedi, tasarım önerimizdir.
