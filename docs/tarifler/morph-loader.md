# Tarif: morph-loader (küçük yükleniyor işareti, sonunda onay ya da hata)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Satır içine sığan küçük bir yükleniyor işaretidir. İş sürerken dört biçimden biriyle döner; iş bitince aynı yerde onay işaretine, başarısız olursa çarpı işaretine dönüşür. Sonuç ayrı bir yerde değil, işaretin durduğu yerde görünür. İşlem bir sonrakine başlarken işaret yeniden yükleniyor durumuna döner.

## Hangi aile projesinde ne için (tahmin)

- Kaydet, yayımla, yükle gibi kısa işlerin düğme, satır ya da alan içindeki durumu (her projede form ve liste ekranları).
- Yüzdesi bilinen iş için değil (`progress` kullanılır); sayfa içeriği yüklenirken değil (`skeleton`, `skeleton-morph`).

## Bölümler

1. **İşaret:** tek bir küçük çizim; boyutu çağıran verir, yerleşim yeri değişmez.
2. **Yükleniyor biçimleri (dört seçenek):** noktalar, çubuklar, halka, kare. Ürün başına tek biçim seçilir, karışık kullanılmaz.
3. **Sonuç işaretleri:** başarıda onay, hatada çarpı.
4. **Görünmez durum metni:** ekran okuyucu içindir; yükleniyor / bitti / başarısız diye değişir.

## Kullanıcı ne yapar, ne olur

Kullanıcı bu bileşenle etkileşmez; yalnız izler. Durumu uygulama verir: yükleniyor, başarılı, hatalı.

- **Yükleniyor:** seçilen biçim sürekli hareket eder.
- **Başarılı olunca:** yükleniyor hareketi söner, çizim dik konuma gelir, onay işareti çizilir.
- **Hatalı olunca:** aynı yolla çarpı çizilir.
- **Yükleniyora dönünce:** işaret dağılmış parçalarını toplayıp seçilen biçime geri döner; aynı işaret bir sonraki istek için yeniden kullanılır.
- **Yüklenirken biçim değişirse:** çizim yeni biçime kendiliğinden dönüşür, kopma olmaz.
- Düğme, giriş alanı, sekme sırası yok.

## Durumlar

- **Yükleniyor / başarılı / hatalı** (üç durum).
- **Renk:** başarı onayı başarı renginde, hata çarpısı hata renginde; kapatılırsa çevresindeki yazı rengini alır. Durum yalnız renkle verilmez: onay ile çarpı farklı şekildir.
- **Süs olarak kullanım:** bir düğmenin içinde, düğme zaten durumu söylüyorsa işaret ekran okuyucudan tümüyle gizlenir; aynı durum iki kez okunmaz.
- **Boyut:** küçük satır içi boyuttan boş durum boyutuna kadar her ölçekte keskin (vektör çizim). Küçük boyutta çizgi biraz daha kalın olur ki simge çizgileriyle uyuşsun. Durum değişince yerleşim hiç kaymaz.

## Klavye ve ekran okuyucu

- Kök `role="status"`; içinde görünmez bir metin durum değişince "Yükleniyor", "Tamamlandı", "Başarısız" olarak güncellenir. Metinler çağıran tarafından değiştirilebilir.
- Çizim `aria-hidden`.
- Odak alamaz, klavye etkileşimi yok.

## Hareket

- Her biçim kendi tarzında döner (noktalar sıralı zıplar, çubuklar sırayla uzar, halka döner, kare çeyrek dönerek ilerler). Biçimler arası geçiş ve durumlar arası geçiş kesilirse bile hız korunur; hareket ani kopmaz.
- Bitince önce yükleniyor hareketi söner, sonra onay ya da çarpı çizilir ve işaret bir kez belirgin biçimde belirir.
- Çizim döngüsü yalnız yükleniyor ya da geçiş sırasında çalışır; sakin durumda durur.
- **"Hareketi azalt" açıkken:** hareket yoktur; her durum için tek durağan şekil gösterilir ve durumlar arasında anında geçilir.

## Görseller

Gerçek görsel yok; işaret tümüyle çizimdir. Başarı ve hata renkleri SNN-UI değişkenlerinden gelir; amber/turuncu yok.

## Sayılar ve biçim

Ekranda sayı, para ya da tarih yok.

## Kurulacak SNN-UI parçaları

Katalogdan: yok (kendi başına durur). Yazım oturumu `button` içinde kullanım örneği için `button`'a bakabilir.

Katalogda olmayan:
- `morph-loader` (dört yükleniyor biçimi ve iki sonuç işareti arasında dönüşen tek çizim)

## Türkçe ekran metinleri (öneri)

- Görünmez durum metni: "Yükleniyor", "Tamamlandı", "Başarısız"
- Kullanım örneği: "Yayımlandı", "Yayımlanamadı"

## Kapsam dışı (bilerek)

- Yüzdesi bilinen ilerleme göstergesi, içerik iskeleti, etiketi de değişen düğme.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ile kısa bir deneme yapıldı, sonuç alınamadı; hareket tarifi sayfadaki düz metin açıklamasına dayanır. Hareketin ayrıntıları ve ölçüleri (süreler, hızlar) bilerek yazılmadı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
