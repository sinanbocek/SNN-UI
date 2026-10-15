# Tarif: usage-forecast (kullanım tahmini ve bütçe çizgisi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir fatura döneminde bir ölçünün (örn. istek sayısı, depolama, koltuk) şimdiye kadarki kullanımını çizer ve dönem sonuna kadar gidişi tahmin eder. Tahmin, belirsizliği gösteren soluk bir koni olarak devam eder. Kullanıcı grafikteki bütçe çizgisini sürükleyerek bütçeyi değiştirir; bütçenin ne zaman aşılacağı hemen tarihle ve "kaç gün önce" olarak yeniden hesaplanır. Alt kısımda eşik uyarıları (yüzde 50, 80, 100) açılıp kapatılır.

## Hangi aile projesinde ne için (tahmin)

- SNN-Proje-ve-Nakit-Akis-Yonetimi: dönem içi harcamanın bütçeyi ne zaman aşacağı.
- SNN-Ihale-Maliyet-Teklif-Yonetimi: proje maliyetinin dönem sonuna gidişi.
- Ölçümlü (kota, API, depolama) kullanan her projenin fatura sayfası.
- Sabit hakkın ne kadarının dolduğu için `usage-meter`; fiyatı önceden hesaplamak için `usage-pricing`.

## Bölümler

1. **Başlık satırı:** başlık, alt satırda müşteri/plan ve yenileme tarihi; sağda ölçü seçici (örn. üç ölçü).
2. **Ana cümle:** "Bu hızla bütçeye {tarih} günü ulaşırsınız. Dönem kapanmasına {n} gün var, büyük olasılıkla {tarih}–{tarih} arası." Aşma yoksa "Dönem sonunda bütçenin altında kalırsınız".
3. **Üç özet:** "Şimdiye kadar" (değer ve bütçenin yüzdesi), "Dönem sonu tahmini" (değer ve olası aralık), "Bütçe üstü maliyet" (birim fiyatla hesaplanan tutar; yoksa gizlenir).
4. **Grafik:** yatay gün ekseni, dikey kullanım; gerçekleşen düz çizgi, tahmin kesikli çizgi, olası aralık koni; bugün dikey çizgi; yüzde 50/80/100 eşik işaretleri; bütçe yatay çizgisi sol uçta tutamaçlı etiketle ("Bütçe 38 M"); aşıldığı noktada işaret ve tarih.
5. **Uyarı kuralları satırı:** "Uyarı: %50 · %80 · %100"; her biri anahtar düğme, yanında "ulaşıldı {tarih}" ya da "beklenen {tarih}".
6. **Açıklama satırı:** gerçekleşen, tahmin, olası aralık, bütçe aşımı.
7. **Gizli tablo:** her gün için okuma, olası aralık, "ölçüldü/tahmin".

## Kullanıcı ne yapar, ne olur

- **Bütçe çizgisini sürükler:** çizgi parmağı/imleci doğrudan izler; bırakınca hızlı bir yayla yerine oturur. Ana cümle, aşma tarihi, bütçe üstü maliyet ve uyarı tarihleri yeniden hesaplanır.
- **Klavyeyle bütçe tutamacı:** oklar bir adım, PageUp/PageDown beş adım, Home/End en az/en çok bütçe.
- **Grafikte gezer:** fare/ok ile gün gün okuma paneli: tarih, değer, aralık; PageUp/Down bir hafta; Home/End ilk/son gün; Esc okumayı temizler.
- **Uyarı kuralına basar:** kural açılır/kapanır; kuralın durumu etikette yazar. Kaydetmek için uygulama bağlanır (önizlemede e-posta benzetimi yapılır).
- **Ölçü değiştirir:** çizgi, koni, özet ve cümle yeni ölçüye geçer, rakamlar döner.

## Durumlar

- **Bütçe aşılmayacak:** ana cümle olumlu söyler, aşma işareti ve maliyet satırı yok.
- **Zaten aşıldı:** "Bütçeyi {tarih} günü aştınız" ve aşım tutarı; çizgi aşıldıktan sonra tehlike rengine döner (gerçek hata → kırmızı; amber yok).
- **Dönemin ilk günü / yetersiz veri:** tahmin gösterilmez, "Tahmin için yeterli veri yok".
- **Veri yok:** boş durum. **Yükleniyor:** iskelet.
- **Dar kap (yaklaşık 560 px altı):** özet ve açıklama daralır; grafik dikey kaydırmayı engellemez, bütçe tutamacı sürüklemeyi yakalar.
- **Bütçe sınırları:** en az ve en çok bütçe vardır; tutamaç bu aralıkta kalır.

## Klavye ve ekran okuyucu

- Grafik alanı ve bütçe tutamacı kaydırıcıdır; değer metni sade cümledir ("bütçe 38 milyon, 26 Eylül'de aşılır").
- Grafik tam cümleli etiket taşır, veri tablosuyla anlatılır; tahmin özeti kibar canlı bölgede okunur.
- Uyarı kuralları `aria-pressed` düğmeleridir; etiketi geçerli durumu içerir ("%80, 21 Eylül'de ulaşıldı").
- Aşma yalnız renkle değil, yazıyla ve işaretle gösterilir.

## Hareket

- Bütçe çizgisi sürüklerken doğrudan izler; bırakınca keskin bir yayla oturur. Aşma işareti ve okuma paneli seçilen güne yayla kayar; sayılar döner, metin değişimi yumuşak geçişle olur.
- **"Hareketi azalt" açıkken:** yaylar kapalı, değişiklikler anında.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Kullanım (istek, depolama) | adet / birim | `money.fmtDecimalGrouped`; eksende ve özette kısa biçim (M, B) için `money.compactMajor` mantığı |
| Bütçe | adet / birim | aynı |
| Bütçe üstü maliyet | para, TRY | `money.format` |
| Birim fiyat ("1.000 istek başına") | para, TRY | `money.format` |
| Bütçenin yüzdesi, eşikler | yüzde | `money.percent` |
| Tahmin aralığı | adet | alt–üst, `money.fmtDecimalGrouped` |
| Tarihler (aşma, yenileme, gün ekseni) | tarih | `date.format`, `date.monthName`, `date.dayName` |
| Kalan gün | adet (gün) | tamsayı |

## Kurulacak SNN-UI parçaları

Katalogdan: `usage-meter`, `gauge`, `line-chart` (gerçek çizgi + kesik tahmin), `animated-counter`, `slot-text` (metin değişimi), `tooltip`, `skeleton`, `empty-state`.

Katalogda olmayan:
- `segmented-control` (ölçü seçici)
- `draggable-line` (sürüklenen yatay çizgi ve tutamaç; hem fare/dokunma hem klavye)
- `forecast-cone` (olası aralık alanı; `line-chart`'a eklenti)
- `toggle-chip` (uyarı kuralları)
- `usage-forecast` kabuğu

## Türkçe ekran metinleri (öneri)

- Ana cümle: "Bu hızla bütçeye {tarih} günü ulaşırsınız."; alt: "Dönemin kapanmasına {n} gün var, büyük olasılıkla {tarih}–{tarih} arasında."
- Özet: "Şimdiye kadar", "Dönem sonu tahmini", "Bütçe üstü maliyet"
- Etiket: "Bütçe", "Bugün"; uyarı: "Uyarı", "ulaşıldı {tarih}", "beklenen {tarih}"
- Açıklama: "Gerçekleşen", "Tahmin", "Olası aralık", "Bütçe aşımı"
- Yönerge: "Bütçe çizgisini sürükleyin ya da ok tuşlarını kullanın."

## Kapsam dışı (bilerek)

- Tahmin modelini üretmek: bileşen verilen tahmini ve aralığı çizer; hesap (düz eğilim) uygulamadan gelir.
- Fiyat planı seçimi (`usage-pricing`), basit doluluk (`usage-meter`).
- Uyarıları kaydetmek ve e-posta göndermek: uygulama bağlar.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; sürükleme denenmedi, davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
