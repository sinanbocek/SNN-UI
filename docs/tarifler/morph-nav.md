# Tarif: morph-nav (site üst gezinmesi: menüler ve arama tek yüzeyde)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir sitenin ya da ürünün üst çubuğudur. Bölümler çubukta sıralanır; ayrıntısı olan bir bölüm üzerine gelinince ya da seçilince çubuğun kendisi büyüyüp bağlantı paneline dönüşür. Arama da aynı yüzeyden açılır, ayrı bir pencere gerekmez. Uçta tek bir ana eylem (örneğin "Kayıt ol") durur. Sayfa kayınca çubuk sıkılaşabilir, dar kapta tek menüye katlanır.

## Hangi aile projesinde ne için (tahmin)

- Tanıtım ve ürün siteleri (Naturapan-Web-Sitesi, ürün tanıtım sayfaları): birkaç bölüm, her birinde birkaç hedef.
- Uygulama içi bölüm geçişi için değil (`liquid-tab-bar`); sayfa içi görünüm geçişi için değil (`tabs`); tek komut menüsü için değil (`dropdown-menu`).

## Bölümler

1. **Marka:** çubuğun başında marka düğmesi (ad ve işaret; ana sayfaya gider).
2. **Üst düzey öğeler:** ya doğrudan bağlantı ya da bir panel açan bölüm. Geçerli sayfanın bölümü işaretlidir.
3. **Panel:** bağlantı listesi (simge, ad, kısa açıklama); çok bağlantı varsa iki sütun, az ise bir. İsteğe bağlı bir öne çıkan alan ve alt satır.
4. **Arama:** çubuktan açılan giriş alanı ve sonuç listesi; sonuçlar gruplu, boş sorguda önerilenler.
5. **Ana eylem:** çubuğun ucunda tek düğme.
6. **Katlanmış menü:** dar kapta bölümleri toplayan tek menü.

## Kullanıcı ne yapar, ne olur

- **Fareyle bir bölümün üstüne gelir:** kısa bir niyet beklemesinden sonra panel açılır; çubuktan çıkınca kısa bir gecikmeyle kapanır, böylece aradaki boşlukta panel titremez. Dokunmatikte dokunuşla açılır.
- **Bir bölümden komşuya geçer:** panel yan yana kayarak değişir, vurgu öğeler arasında akar.
- **Bağlantıya ya da sonuca basar:** gezinme olayı verilir; panel kapanır.
- **Aramayı açar (düğme ya da simge):** çubuk giriş alanına büyür; yazdıkça sonuçlar süzülür; Yukarı/Aşağı etkin sonucu değiştirir, Enter açar.
- **Boş sorgu:** ilk birkaç kayıt "Önerilenler" olarak listelenir.
- **Dışarı basar ya da Escape:** arama ya da panel kapanır, odak geldiği yere döner.
- **Sayfa kayınca:** çağıran "sıkı" durumu verir; çubuk küçülür, geri dönünce açılır.
- **Dar kapta:** bölümler tek menüye katlanır.

## Durumlar

- **Kapalı / panel açık / arama açık** ve **tam / sıkı** boyut ayrımı.
- **Geçerli bölüm** işaretli.
- **Arama sonucu yok:** "Sonuç bulunamadı".
- **Çok kayıt:** arama yalnız en iyi birkaç sonucu gösterir; çok büyük dizinler önceden süzülür.
- **Genişlik:** katlanma eşiği bileşenin kendi kap genişliğine bağlıdır (ekrana değil); çok dar ekranda panel tek sütun olur.
- **Hover:** yalnız fareli işaretçi hover ile açar.

## Klavye ve ekran okuyucu

- `nav` işaretlenmiş alan, adı değiştirilebilir ("Ana gezinme"); geçerli öğe `aria-current="page"`; panel düğmeleri `aria-expanded` ve `aria-controls`.
- Sol/Sağ: üst düzey öğeler arasında gezer, açık panel yeni öğeye geçer; Home/End ilk-son.
- Aşağı/Enter/Boşluk: panelli öğede paneli açar ve odağı ilk bağlantıya taşır; panelde Aşağı/Yukarı bağlantılar arasında gezer, ilk bağlantıda Yukarı tetikleyiciye döner.
- Arama bir birleşik kutu (combobox): sonuç listesi, etkin sonuç bildirimi, sonuç sayısı kibar canlı bölgede.
- Odak nav dışına çıkınca panel kapanır; Escape odağı geldiği yere döndürür.

## Hareket

- Tek sürekli yüzey: her panelin boyutuna yaylanır (büyürken hafif yaylı, küçülürken taşmasız); komşu panele geçerken yeni panel o yönden girer; seçili öğenin vurgusu öğeler arasında akar.
- Arama aynı yüzeyden büyür, çubuk bulanıklaşıp solar; sıkı ve katlanmış durumlar çubuğu yeniden ayarlar.
- Arka plan bulanıklığı "saydamlığı azalt" ya da yüksek karşıtlık tercihlerinde düz yüzeye düşer.
- **"Hareketi azalt" açıkken:** yolculuk, ölçek ve bulanıklık yok; yalnız kısa solmalar.

## Görseller

Gerçek görsel yok. Marka işareti ve bağlantı simgeleri çağıran verir; yazım oturumu yer tutucu kullanır. Renkler değişkenlerden; amber yok.

## Sayılar ve biçim

Bileşenin sayısı yok. Arama sonuç sayısı "N sonuç" diye yazılır (`fmtDecimalGrouped`).

## Kurulacak SNN-UI parçaları

Katalogdan: `button`, `input` ya da arama alanı (varsa).

Katalogda olmayan:
- `morph-nav` (tek yüzeyli çubuk, paneller, arama)

## Türkçe ekran metinleri (öneri)

- Alan adı: "Ana gezinme"; arama: "Ara", "Önerilenler", "Sonuç bulunamadı"
- Katlanmış menü: "Menü"; ana eylem: çağıranın metni ("Ücretsiz başla" gibi)

## Kapsam dışı (bilerek)

- Uygulama içi simgeli sekme çubuğu, sayfa içi sekmeler, kenar menüsü.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Hareketin ayrıntıları ve ölçüleri (süreler, hızlar) bilerek yazılmadı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
