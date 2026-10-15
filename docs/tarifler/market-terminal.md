# Tarif: market-terminal (piyasa ekranı: grafik, izleme listesi, emir fişi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir menkul kıymetin fiyatını mum grafikle gösteren, yanında izleme listesi ve emir fişi bulunan tam bir işlem ekranıdır. Grafikte mumlar, işlem hacmi, iki hareketli ortalama, imleç altındaki açılış-en yüksek-en düşük-kapanış okuması, tekerlek, sürükleme ve iki parmakla yakınlaştırma vardır. Fiyatlar canlı akar. Emir fişi piyasa ve limit emri verir; emir listesi gösterilir. Bileşen kendisi hiçbir gerçek emir göndermez: emri uygulamanın verdiği işleve iletir.

## Hangi aile projesinde ne için (tahmin)

- SNN-Piyasa-Core, trade-kasa: işlem ve piyasa ekranı (kâğıt üstü işlem ya da gerçek hesap bağlantısı projeye bağlıdır).
- SNN-Portfoy-Yonetimi: bir varlığın fiyat geçmişi ve pozisyon bilgisi.
- Yalnız sayı ve eğilim isteyen ekranlar için `line-chart` ya da `sparkline`.

## Bölümler

1. **Üst başlık:** sembol, ad ve borsa; "Canlı" düğmesi (yeşil nokta, tıklayınca akışı durdurur/sürdürür) ve görünüm düğmeleri.
2. **Fiyat satırı:** büyük güncel fiyat (rakamlar döner), günlük değişim (ok, işaret, tutar, yüzde) ve "bugün".
3. **Özet satırı:** açılış, en yüksek, en düşük, hacim.
4. **Araç çubuğu:** dönem düğmeleri (1G, 5G, 1A, 6A, 1Y), hareketli ortalama anahtarları (iki ortalama), yakınlaştır/uzaklaştır, tam ekran.
5. **Grafik (tek tuval):** mumlar, altında hacim çubukları, iki ortalama çizgisi, sağda fiyat ekseni, son fiyat etiketi ve yatay fiyat çizgisi; üstte imleç okuması (tarih, açılış, en yüksek, en düşük, kapanış, değişim, hacim, ortalamalar).
6. **İzleme listesi:** her satırda sembol, ad, fiyat, günlük değişim, küçük gün içi çizgi (sparkline); seçili satır dolgulu.
7. **Emir fişi:** alış/satış seçimi, emir türü (piyasa / limit), hisse adedi, limitse fiyat alanı, tahmini tutar, eldeki pozisyon, alım gücü, gönder düğmesi, altında durum satırı. Altında **emir listesi**: yön, tür, sembol, adet, fiyat, durum (gerçekleşti, bekliyor, iptal), zaman; bekleyen emir iptal edilebilir.

## Kullanıcı ne yapar, ne olur

- **Sembol seçer (listede):** grafik o sembole geçer; başlık ve fiş güncellenir.
- **Dönem seçer:** görünüm ve fiyat ölçeği yeni pencereye yumuşakça gider; gün içi dönemler dakikalık, diğerleri günlük mumdur.
- **Hareketli ortalamayı açar/kapatır:** çizgi eklenir/kalkar.
- **Tekerlekle yakınlaştırır, sürükleyerek kaydırır:** sürükleme bırakılınca savurma hızıyla azalarak sürer; iki parmak yakınlaştırır; "0" görünümü başa alır.
- **İmleci gezdirir:** fare ya da dokunmayla (ilk dokunuş imleci sabitler, ikincisi kaldırır); okuma satırı güncellenir.
- **"Canlı"ya basar:** simüle ya da gelen akış durur/başlar.
- **Emir verir:** alış/satış, tür, adet (ve limit fiyat) girilir; gönder'e basınca düğme meşgul olur, uygulamanın onayı beklenir; başarıda emir listeye eklenir, alım gücü ve pozisyon güncellenir; hata olursa emir verilmemiş sayılır ve sebep düğmenin altında yazılır.
- **Limit emir:** fiyat piyasaya gelince kendiliğinden gerçekleşir (gerçek akışta bu borsanın işidir; bileşen yalnız durumu gösterir). Piyasaya uygun limit emir, limit ile piyasanın iyi olanından gerçekleşir.
- **Bekleyen emri iptal eder:** listede iptal düğmesi, uygulamaya bildirilir.

## Durumlar

- **Yetersiz alım gücü / yetersiz pozisyon:** gönder pasif; durum satırı "Alım gücü yetersiz" ya da "Satılacak yeterli hisse yok".
- **Adet sıfır ya da geçersiz limit fiyat:** gönder pasif; sebep yazılır.
- **Akış kesildi:** "Canlı" yerine "Duraklatıldı" ve son güncelleme saati; yeniden bağlanınca devam.
- **Yükleniyor / veri yok:** tuval ve liste iskeleti; "Fiyat verisi yok".
- **Fiyat düşüşü / yükselişi:** yön yalnız renkle değil ok ve işaretle verilir (yeşil ve kırmızı klasik piyasa göstergesidir; amber kullanılmaz).
- **Geniş ekran (yaklaşık 1080 px üstü):** liste ve fiş grafiğin yanında dar bir sütunda üst üste; **720-1080 px arası** grafiğin altında yan yana; **daha dar** hepsi alt alta.
- **Dar grafik:** okuma satırı tuvalin üstüne çıkar, grafik daha alçak, mumlar arası en az birkaç piksel kalacak şekilde pencere seyrelir.
- **Çok dar (yaklaşık 640 px altı):** özet dört eşit sütun, dönem düğmeleri ayrı satır; araç çubuğu düğmeleri dokunma boyutuna (yaklaşık 44 px) büyür.
- **Dokunmatik:** yatay sürükleme grafiği kaydırır, dikey kaydırma sayfayı kaydırır.
- **Gizli sekme:** akış durur.

## Klavye ve ekran okuyucu

- Tab sırası: Canlı düğmesi, dönem, ortalamalar, yakınlaştırma düğmeleri, grafik, izleme satırları, fiş.
- Grafik odaklanabilir görseldir; adı sembol, dönem ve mum aralığını söyler. Sol/sağ ok bir mum, Shift+ok on mum, Home/End ilk/canlı mum, "+" / "−" imleç çevresinde yakınlaştırır, "0" sıfırlar, Esc imleci temizler.
- İmleç klavyeyle gezerken mumun zamanı, açılış, en yüksek, en düşük, kapanış, değişim ve hacim kibar canlı bölgede okunur.
- İzleme satırları tam adlı düğmedir (sembol, ad, fiyat, bugünkü değişim); grafikteki sembol `aria-current`; yukarı/aşağı ok, Home/End satırlar arası, Enter/Boşluk sembolü grafiğe getirir.
- Emir sorunları ve hatalar düğme altındaki durum satırında yazılır; emir durumu metindir.

## Hareket

- Grafik tek tuvaldır, yalnız bir şey hareket ederken çizim döngüsü çalışır.
- Yakınlaştırma, kaydırma ve dönem geçişi görünümü ve fiyat ölçeğini yaysız yaklaşma ile yumuşatır; taşma yok, her hareket yarıda geri alınabilir. Savurma "atılmış kart" gibi azalır.
- Canlı veride son mum, fiyat etiketi, fiyat çizgisi ve ortalamalar yeni fiyata süzülür; başlıktaki fiyat döner.
- Listede fiyat değişince satır, yöne göre kısa bir yeşil/kırmızı tonla solar; seçili satır dolgusu satırlar arasında süzülür.
- Limit alanı yükseklik ve saydamlıkla açılır; yeni emirler listeye büyüyerek girer; yalnız canlı noktanın nabzı sürekli döngüdür.
- **"Hareketi azalt" açıkken:** görünüm, fiyat ve paneller anında değişir; savurma ve nabız yok; fiyat parlaması kısa sabit bir ton olarak kalır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Fiyat (hisse, kur) | para (genelde TRY; yabancı sembolde kendi birimi) | `money.format` (iki ondalık, Türkçe ayraç) |
| Günlük değişim (tutar) | para, işaretli | `money.format` |
| Günlük değişim (yüzde) | yüzde değişim | `math.percentChange(önceki kapanış, fiyat)` → `money.percent` |
| Açılış, en yüksek, en düşük, kapanış | para | `money.format` |
| Hacim | adet | `money.fmtDecimalGrouped`; kısa biçim `money.compactMajor` (Mn, Mr) |
| Alım gücü, tahmini tutar | para, TRY | `money.format` |
| Pozisyon (adet) | adet | `money.fmtDecimalGrouped` |
| Eksen fiyatları | para | `money.format` (ondalık eksen aralığına göre) |
| Tarih ve saat (imleç, emir saati) | tarih-saat | `date.format`, `date.dayName`, `date.monthName` |

## Kurulacak SNN-UI parçaları

Katalogdan: `line-chart`, `sparkline` (liste içi), `brush-chart` (yakınlaştırma/kaydırma fikri), `animated-counter` (fiyat), `slot-text`, `tooltip`, `skeleton`, `empty-state`, `button`, `input`.

Katalogda olmayan:
- `candlestick-chart` (tuval tabanlı mum, hacim, ortalama, imleç, yakınlaştırma motoru; büyük yeni parça)
- `segmented-control` (dönem), `toggle-chip` (ortalamalar), `number-field` (adet ve limit fiyat)
- `watchlist` (satır içi sparkline ve fiyat parlaması)
- `order-ticket` ve `order-list`
- `market-terminal` kabuğu
- Kayıt/emir güvenliği: bileşen emir **göndermez**; `onPlaceOrder` ve `onCancelOrder` işlevlerini uygulama bağlar, doğrulama (alım gücü, pozisyon) bileşende ön kontrol, asıl kontrol sunucuda olur.

## Türkçe ekran metinleri (öneri)

- Düğme: "Canlı", "Duraklatıldı", "Gönder"; dönem: "1G", "5G", "1A", "6A", "1Y"
- Alanlar: "Alış", "Satış", "Piyasa", "Limit", "Adet", "Limit fiyat", "Tahmini tutar", "Alım gücü", "Pozisyon"
- Durum: "Alım gücü yetersiz.", "Satılacak yeterli hisse yok.", "Emir gönderilemedi."
- Emir durumları: "Gerçekleşti", "Bekliyor", "İptal"; düğme: "İptal et"
- Okuma: "Açılış", "En yüksek", "En düşük", "Kapanış", "Hacim"

## Kapsam dışı (bilerek)

- Emir defteri derinliği, opsiyon kâr-zarar eğrisi, gelişmiş emir türleri (stop vb.).
- Gerçek emir iletimi ve hesap bağlantısı: projenin işi; bu bileşen yalnız ekrandır.
- Çizim araçları (trend çizgisi), gösterge kütüphanesi.
- Fiyat verisi: tüm mumlar, fiyatlar ve emirler uygulamadan gelir (örnek bileşen simüle veri üretir; SNN-UI sürümünde simülasyon yalnız örnek/demo yolunda olur).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemede başlık ve grafik bölümü görüldü, izleme listesi ve emir fişi görülmedi ya da denenmedi; davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
