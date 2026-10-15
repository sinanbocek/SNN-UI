# Tarif: release-readiness (yayına hazırlık listesi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir iş yapılmadan önce tamamlanması gereken kontrolleri tek yerde toplar. Hepsi işaretlenmeden son eylem düğmesi açılmaz. İlerleme çubuğu "kaç kontrol kaldı" der; isteğe bağlı bir anahtar, eylem çalışırken ilgilileri bilgilendirir.

## Hangi aile projesinde ne için (tahmin)

- SNN-Ihale-Maliyet-Teklif-Yonetimi: "Teklifi gönder" öncesi kontrol listesi (şartname okundu, fiyatlar onaylandı, belgeler eksiksiz).
- GHS-Panel, SNN-Portfoy-Yonetimi, trade-kasa: sürüm yayınlama ya da dönem kapatma kapısı.
- Kullanıcının kendi başlangıç görevleri için bu bileşen değil, ayrı bir "başlangıç listesi" kullanılır.

## Bölümler

1. **Başlık:** iş adı (örn. "Sürüm 2.4"), alt satırda bağlam ve tarih; sağda sorumluların avatarları.
2. **İlerleme özeti:** "3 kontrol kaldı" (sayı değişirken yukarı kayar), "1 / 4", ince ilerleme çubuğu.
3. **Kontrol satırları:** onay kutusu, kısa başlık ve bir cümlelik açıklama. Geniş ekranda iki sütun, dar ekranda tek.
4. **Alt şerit:** solda "İlgilileri bilgilendir" anahtarı (kanal adıyla), sağda ana eylem düğmesi ("Yayını başlat").
5. **Sonuç alanı:** başarıda "durum" mesajı, hatada satır içi uyarı.

## Kullanıcı ne yapar, ne olur

- **Kontrolü işaretler/kaldırır:** sayaç ve çubuk güncellenir; hepsi işaretlenince eylem düğmesi aktif olur, kısa bir vurgu alır. Biri geri alınırsa tekrar pasif olur.
- **Anahtarı çevirir:** eylem çalışırken ilgililere bildirim gidip gitmeyeceğini belirler (seçim eyleme iletilir).
- **Eylem düğmesine basar:** düğme meşgul olur, uygulama işlevi beklenir. Başarıda "Başlatıldı" durumu görünür, kontroller kilitlenir; hata fırlarsa satır içi uyarı ve düğme yeniden basılabilir.
- **Pasif düğmeye basmaya çalışır:** (ipucu) "Önce tüm kontrolleri tamamlayın" der.

## Durumlar

- **Hiç kontrol işaretli değil:** çubuk boş, düğme pasif.
- **Hepsi tamam:** çubuk dolu, sayaç "Hazır", düğme aktif.
- **Yükleniyor:** satırlar iskelet; düğme pasif.
- **Çalışıyor:** düğme meşgul, kontroller geçici kilitli.
- **Hata:** satır içi kırmızı uyarı, "Yeniden dene"; kontrol durumları korunur.
- **Başarı:** "Başlatıldı" durum mesajı; liste okunur kalır.
- **Çok uzun içerik:** başlıklar iki satıra kırılır; uzun listede (yirmiden fazla kontrol) bölümlere ayrılması önerilir.
- **Dar ekran:** özet iki sütundan tek sütuna iner; kontroller tek sütun; alt şerit alt alta dizilir (anahtar üstte, düğme tam genişlik).

## Klavye ve ekran okuyucu

- Tamamlanan sayı nazik canlı bölgededir ("1 / 4 kontrol tamamlandı").
- Başarı durum rolüyle, hata uyarı rolüyle bildirilir.
- Her onay kutusunun gerçek etiketi ve açıklaması vardır (katalogdaki `checkbox`).
- Tab sırası: kontroller, anahtar, düğme. Pasif düğmenin neden pasif olduğu okunur ("Tüm kontroller tamamlanmadı").

## Hareket

- Sayaç değişirken sayı kısa bir yükselişle ve solarak değişir.
- İlerleme çubuğu genişleyerek dolar.
- Düğme aktif olunca kısa bir vurgu.
- **"Hareketi azalt" açıkken:** geçiş süreleri sıfır; sayaç anında değişir.

## Kurulacak SNN-UI parçaları

Katalogdan: `checkbox`, `switch`, `button` (meşgul durumuyla), `tooltip` (pasif düğme açıklaması), `skeleton`, `toast` (başarı için isteğe bağlı).

Katalogda olmayan:
- `progress` (ilerleme çubuğu; diğer birçok tarifle ortak)
- `avatar` (yalnız sorumlu göstergesi)
- `release-readiness` kabuğu (kontrol listesi verisini ve son eylemi dışarıdan alır)
- Sayaç sayıları ABACUS biçimiyle.

## Türkçe ekran metinleri (öneri)

- Özet: "{n} kontrol kaldı", "Hazır", "{m} / {n}"
- Anahtar: "{kanal} kanalını bilgilendir"
- Düğme: "Yayını başlat" (proje eylemi adlandırır), meşgulken "Başlatılıyor…"
- İpucu: "Önce tüm kontrolleri tamamlayın."
- Başarı: "İşlem başlatıldı."
- Hata: "İşlem başlatılamadı." / "Yeniden dene"
- Duyuru: "{m} / {n} kontrol tamamlandı"

## Kapsam dışı (bilerek)

- Kontrollerin otomatik doğrulanması (CI sonuçlarını okumak vb.): proje verir.
- Kontrollere atama/son tarih/yorum eklemek.
- Çok adımlı, sayfalara bölünmüş akış (`multi-step-form`).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede liste, çubuk, anahtar ve pasif düğme görüldü; işaretleme ve eylem denenmedi, sayfa metnindeki davranış listesinden alındı. "Pasif düğme ipucu" önizlemede görülmedi, tasarım önerimizdir.
