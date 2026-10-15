# Tarif: sidebar (kenar menüsü kabuğu)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Uygulamanın sol tarafında duran gezinme çerçevesi. Geniş ekranda tam menü, kullanıcı isterse yalnız simgelerden oluşan dar şerit, telefonda ise bir düğmeyle açılan çekmece olur. Üstte yol izi (hangi sayfadayım), altta sayfa içeriği vardır.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel, trade-kasa, SNN-Portfoy-Yonetimi, SNN-Proje-ve-Nakit-Akis-Yonetimi: yönetim paneli çerçevesi (Pano, Raporlar, Ayarlar gibi gruplar).
- SNN-Ihale-Maliyet-Teklif-Yonetimi: Teklifler, Şartnameler, Maliyet gruplarını taşıyan çerçeve.
- Küçük sitelerde (Gunum-Var, Naturapan) gerekmez; orada üst menü yeter.

## Bölümler (ekranda hangi parçalar var)

1. **Menü başlığı:** uygulama/çalışma alanı adı ve kısa alt yazısı, solda küçük bir logo kutusu.
2. **Gezinme listesi:** düz satırlar (simge + ad). Bir satırın yanında küçük bir sayı rozeti olabilir (örn. okunmamış).
3. **Bölüm başlığı:** listeyi gruplayan küçük, sönük başlık.
4. **Katlanır grup:** altında iç içe satırlar olan satır; sağında aç/kapa oku.
5. **Sabitlenenler bölümü:** kullanıcının kısa yol olarak tuttuğu satırlar.
6. **Alt alan:** Ayarlar satırı ve kullanıcı kartı (avatar, ad, görev).
7. **Katlama düğmesi:** içerik üst çubuğunda, menüyü şeride indirir/geri açar.
8. **Yol izi:** üst çubukta, ana bölümden aktif sayfaya doğru; son parça aktif sayfadır.
9. **İçerik alanı:** menüden bağımsız kayan alan. Çerçevenin kendisi sabit boyda kalır, kayma içeride olur.
10. **Dar ekran çekmecesi:** sol kenardan kayan panel, aynı menüyü taşır.

## Kullanıcı ne yapar, ne olur

- **Satıra tıklar:** o satır aktif olur (görsel vurgu), içerik ve yol izi değişir, ekran okuyucuya "bölüm değişti" bildirilir.
- **Grup okuna tıklar:** alt satırlar yükseklik animasyonuyla açılır/kapanır; aktif alt satır varken grup kapatılabilir ama grup başlığı aktif ipucu taşır.
- **Katlama düğmesine ya da Ctrl+B'ye basar:** menü şeride iner; yazılar gizlenir, simgeler kalır. Tercih kullanıcı bazında saklanır (uygulama kaydeder, bileşen `onCollapsedChange` ile haber verir).
- **Şeritteyken simgenin üstüne gelir/odaklanır:** ipucu satırın adını gösterir.
- **Şeritteyken grup simgesine tıklar:** menü kendiliğinden açılmaz; grubun ilk sayfasına gidilir ya da küçük bir açılır menüde alt sayfalar listelenir (proje seçer; varsayılan: açılır menü).
- **Telefonda menü düğmesine basar:** çekmece açılır, odak aktif satıra gider. Satıra basınca ya da boşluğa basınca ya da sola sürükleyince ya da Esc ile kapanır.
- **Pencere genişleyince:** açıkken çekmece kendiliğinden kapanır.
- **Alt alandaki kullanıcı kartına tıklar:** açılır menü (profil, çıkış). Menü içeriğini proje verir.

## Durumlar

- **Boş:** grupta alt sayfa yoksa grup satırı gösterilmez. Hiç menü öğesi yoksa yalnız başlık ve alt alan kalır.
- **Yükleniyor:** menü verisi geliyorsa satır sayısı kadar iskelet satır; başlık ve alt alan yerinde kalır.
- **Hata:** menü verisi alınamazsa kısa bir mesaj ve "Yeniden dene" düğmesi; uygulama çalışmaya devam eder (sabit, kodla gömülü menüyle).
- **Çok uzun içerik:** satır adı tek satırda kesilir, kesilen adda tam ad ipucuyla görünür. Menü kendi içinde kayar, alt alan sabit kalır.
- **Dar ekran:** menü gizlenir, üst çubukta menü düğmesi çıkar. Kart içindeki satırlarda ikincil bilgi (zaman damgası gibi) içerik darlaşınca düşer.
- **Aktif sayfa bulunamadı:** hiçbir satır vurgulanmaz, yol izi yalnız ana bölümü gösterir.

## Klavye ve ekran okuyucu

- Menü bir gezinme bölgesi, etiketli ("Ana menü").
- Aktif satırda `aria-current="page"`; katlanır grup düğmesinde `aria-expanded`.
- Yukarı/aşağı ok satırlar arasında gezer; sağ ok grubu açar, sol ok kapatır (yerel karar: Tab ile de sırayla gezilebilir kalır).
- Ctrl+B: menüyü katla/aç; yazı alanında, menüde ya da pencerede odak varsa çalışmaz.
- Esc: dar ekran çekmecesini kapatır; odak menü düğmesine döner.
- Çekmece açılınca odak içeri hapsolur, kapanınca düğmeye döner.
- Şerit simgeleri ipucu alır; ipucu odakla da açılır. Simge düğmesinin görünmez adı vardır.
- Rozet sayıları okunur şekilde verilir ("4 okunmamış").
- Bölüm değişimi sayfa dışı nazik bir durum bölgesinde duyurulur.

## Hareket

- Şeride inme/açılma: yumuşak, hafif yaylanan genişlik değişimi. Yazılar önce solar, sonra genişlik daralır.
- Grup açılması: yükseklik büyür, alt satırlar hafifçe aşağı süzülür.
- Yol izinde yeni bölüm adı alttan hafifçe yükselerek gelir.
- Çekmece soldan kayar, arka plan hafif kararır.
- **"Hareketi azalt" açıkken:** katlama, grup açılması ve yol izi değişimi anında olur; çekmece kaymak yerine solarak görünür.
- Süre ve eğri değerleri `snn-foundation.css` değişkenlerinden alınır, elle yazılmaz.

## Kurulacak SNN-UI parçaları

Katalogdaki mevcut parçalardan:
- `tooltip` (şerit simge ipuçları)
- `dropdown-menu` (kullanıcı kartı menüsü; şeritteki grup menüsü)
- `button` (katlama düğmesi, menü düğmesi, yeniden dene)
- `dialog` (çekmece için temel; kenardan açılan görünümle sarılır)
- `skeleton` (yükleniyor)
- `empty-state` (menü hiç yoksa nadir durum)
- `toast` (gerekirse hata bildirimi)

Katalogda olmayan, ayrıca yazılması gerekenler:
- `avatar` (kullanıcı kartı, ve diğer 4 tarifte de gerekir)
- `badge` (rozet sayısı; durum etiketi)
- `breadcrumb` (yol izi)
- `sheet` / kenar çekmecesi (şimdilik `dialog` üzerine kurulabilir; ortak bir `sheet` daha temiz olur)
- `sidebar` kabuğunun kendisi (yeni bileşen)

Not: rozetteki sayı ve içerikteki ölçü kutuları ABACUS kuralına uyar; `Intl`/`toLocaleString` yok.

## Türkçe ekran metinleri (öneri)

- Düğme: "Menüyü daralt", "Menüyü genişlet", "Menüyü aç", "Menüyü kapat"
- Bölge etiketi: "Ana menü", "Yol izi"
- Bölüm başlıkları: "Çalışma alanı", "Sabitlenenler"
- Alt alan: "Ayarlar", "Profil", "Çıkış yap"
- Rozet adı: "{n} okunmamış"
- Yükleniyor: "Menü yükleniyor"
- Hata: "Menü yüklenemedi." / "Yeniden dene"
- Duyuru: "{ad} bölümü açıldı"

## Kapsam dışı (bilerek)

- Pro sayfasında bu bileşenin üç kardeşi var: çalışma alanı değiştiren, sürükle-bırak sık kullanılanlı menü; belge ağacı + sürüm seçici + "bu sayfada" ana hat; e-posta kenar menüsü + yazı penceresi. Bu tarif **yalnız ilk (daralan şerit + çekmece) kabuğu** anlatır; diğerlerine bakılmadı, ayrı tarif gerekir.
- Menüde sürükle-bırak, canlı arama, çalışma alanı değiştirici.
- Görsel örnek içerik (Proje adları, kişiler); proje kendi menüsünü verir.
- Kullanıcı tercihinin kalıcı saklanması (uygulama işi).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Sayfanın düz metni ve görünen önizleme kullanıldı; önizlemede katlama düğmesi ve dar ekran görünümü denendi. Çekmece içi ve şerit ipucu davranışı açılan sayfa metnindeki davranış listesine dayanır, tek tek denenmedi.
