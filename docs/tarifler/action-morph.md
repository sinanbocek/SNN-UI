# Tarif: action-morph (yüzen düğme: menü, satır içi form, onay)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Köşede duran yuvarlak bir "ekle" düğmesidir. Basınca aynı yüzey büyüyerek kısa bir eylem menüsüne, bir eylem seçilince satır içi küçük bir forma dönüşür; gönderilince küçülüp düğmeye döner ve kısa süre onay gösterir. Sayfadan ayrılmadan hızlı kayıt (görev, not, olay) için.

## Hangi aile projesinde ne için (tahmin)

- Sayfada en sık yapılan iki üç yaratma işi için kalıcı düğme: görev, not, hatırlatma (Proje-ve-Nakit-Akış, Portföy, GHS-Panel).
- Birden çok alanlı uzun form için değil (`dialog`/`drawer`); girdi gerektirmeyen anlık eylemler için değil (`dropdown-menu`); tek düğmede tek kayıt için değil (`button` + `morph-loader`).

## Bölümler

1. **Düğme:** yuvarlak, "+" simgeli; hangi köşede duracağı seçilebilir.
2. **Eylem menüsü:** başlık (düğme adı) ve eylem satırları: simge, ad, isteğe bağlı kısa açıklama, isteğe bağlı harf kısayolu.
3. **Yazma yüzü (composer):** eyleme özel; başlık, giriş alanı (tek satır ya da çok satır), isteğe bağlı seçenek grubu (örneğin "Ne zaman"), gönder düğmesi, geri düğmesi.
4. **Onay:** düğme başarı rengine döner, onay işareti çizilir, kısa süre sonra "+" geri gelir.
5. **Durum bildirimi:** görünmez, kibar canlı bölge.

## Kullanıcı ne yapar, ne olur

- **Düğmeye basar (Enter/Boşluk):** yüzey menüye açılır, odak ilk eyleme gider.
- **Yukarı/Aşağı:** eylemler arasında gezer (uçlarda başa sarar); Home/End ilk-son.
- **Eylem harfine basar:** menü açıkken o eylemin yazma yüzü açılır.
- **Bir eylemi seçer:** yüzey forma geçer, yeni yüz sağdan girer; odak giriş alanına gider.
- **Yazar ve gönderir:** tek satırda Enter, çok satırda Ctrl/Cmd+Enter ya da gönder düğmesi.
- **Gönderme sürerken:** form "gönderiliyor" durumunda; alanlar kilitli.
- **Başarılı olunca:** yüzey düğmeye küçülür, onay çizilir; ardından "+" döner, odak düğmede kalır.
- **Hatalı olursa:** form açık kalır, yazılan metin silinmez, hata iletisi görünür ve yeniden denenebilir.
- **Escape:** yazma yüzünden menüye, menüden kapanışa ve düğmeye odak dönüşüyle çıkar. Dışarı basmak da kapatır.
- **Taslak:** her eylemin taslağı bileşen açıkken saklanır; geri-ileri gidince yazı kaybolmaz.
- **Boş gönderim:** gönderilmez; alan geçersiz işaretlenir, yazılması istenir.

## Durumlar

- **Kapalı / menü / yazma yüzü / gönderiliyor / onay** (beş yüz).
- **Hata:** gönderim reddedilirse taslak kalır; "Eklenemedi, yeniden deneyin".
- **Boş seçenek:** seçenek grubu yoksa gösterilmez.
- **Köşe:** sol ya da sağ alt; yüzey köşeden uzağa doğru büyür.
- **Genişlik:** menü ve form dar telefonda kenarlardan taşmaz; düğme dokunmaya uygun ölçüde.
- **Yerleşim:** bileşen kendini konumlamaz; çağıran onu sabit bir kapsayıcıya koyar.
- Fare üstü vurguları yalnız fareli cihazlarda.

## Klavye ve ekran okuyucu

- Düğmede `aria-haspopup="menu"`; onaydan sonra etiketi başarı iletisini de içerir.
- Menü `role="menu"`, satırlar `role="menuitem"`, kısayollar `aria-keyshortcuts` ile bildirilir.
- Yazma alanı boş ya da başarısız gönderimde `aria-invalid` ve açıklama bağlantısı alır; form gönderilirken `aria-busy`.
- Başarı iletisi kibar canlı bölgede okunur; her yeni yüze odak taşınır, kapanınca düğmeye döner.

## Hareket

- Tek bir yüzey genişlik, yükseklik ve köşe yuvarlaklığıyla değişir: büyürken hafif yaylanır, küçülürken taşmadan oturur.
- Derine inerken yeni yüz sağdan girer, eskisi sola itilir; menü satırları sırayla belirir; satırlar arasında bir vurgu kayar.
- Gönderince yüzey düğmeye katlanır, düğme başarı rengine döner, onay çizilir, sonra "+" geri döner.
- Her yüz boyutunu yalnız kendisi güncel iken bildirir; yalnız güncel ve ayrılan yüz çizilir.
- **"Hareketi azalt" açıkken:** boyut anında atlar; yüzler solarak değişir; basış ölçeği ve hata titremesi yok; yükleniyor işareti yavaşlar.

## Görseller

Gerçek görsel yok; eylem simgeleri çağıran verir (SNN-UI'deki simge seti). Renkler değişkenlerden; amber yok.

## Sayılar ve biçim

Bileşenin kendi sayısı yok. Seçenek grubunda tarih varsa (bugün, yarın) etiketler uygulamadan gelir; tarih biçimi ABACUS `datetime` ile.

## Kurulacak SNN-UI parçaları

Katalogdan: `button`, `textarea` ya da `input` (varsa), `morph-loader` (gönderiliyor işareti için, bu dalgada).

Katalogda olmayan:
- `action-morph` (düğme + menü + yazma yüzü, tek yüzey)

## Türkçe ekran metinleri (öneri)

- Düğme: "Ekle"; menü başlığı "Hızlı ekle"
- Eylemler: "Yeni görev", "Yeni not"; yazma yüzü: "Ne yapılacak?", "Notunuzu yazın"
- Düğmeler: "Ekle", "Kaydet", "Geri"
- Onay: "Görev eklendi", "Not kaydedildi"; hata: "Eklenemedi, yeniden deneyin"; boş: "Önce bir şey yazın"

## Kapsam dışı (bilerek)

- Çok alanlı uzun form, anlık eylem menüsü, bileşenin kendi konumlanması.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Hareketin ayrıntıları ve ölçüleri (süreler, hızlar) bilerek yazılmadı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
