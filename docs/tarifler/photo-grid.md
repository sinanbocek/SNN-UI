# Tarif: photo-grid (yakınlaştırılabilir fotoğraf kitaplığı)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir albümü eş boyutlu hücrelerle gösterir. İki parmakla sıkıştırarak (ya da Ctrl+kaydırma, ya da düğmelerle) sütun sayısı değişir: yoğun, orta, geniş. Fotoğrafa basınca tam ekran görüntüleyici tıklanan hücreden büyür; altında küçük resim şeridi vardır. Fotoğraflar favorilenebilir.

## Hangi aile projesinde ne için (tahmin)

- Gezinilen fotoğraf kitaplığı ya da albüm; favori işaretleme gereken galeriler.
- Oranı koruyan duvar için `lightbox-gallery`; kısa slayt için döner şerit.

## Bölümler

1. **Üst çubuk:** albüm adı, fotoğraf sayısı, sütun sayısı (döner), yakınlaştır/uzaklaştır düğmeleri.
2. **Fotoğraf ızgarası:** eş boyutlu hücreler; favori olanlarda küçük kalp.
3. **Görüntüleyici:** büyük fotoğraf, başlık ve ayrıntı satırı (tarih gibi), favori kalbi, önceki/sonraki, kapat, alt tarafta küçük resim şeridi.

## Kullanıcı ne yapar, ne olur

- **İki parmakla sıkıştırır ya da Ctrl+tekerlek:** hücreler canlı ölçeklenir, parmakların altındaki fotoğraf yerinde kalacak biçimde yeniden dizilir; bırakınca en yakın sütun sayısına oturur.
- **Yakınlaştır/uzaklaştır düğmeleri ya da `+`/`-`:** bir seviye gider; odaktaki fotoğraf çevresinde.
- **Hücreye basar ya da Enter/Space:** görüntüleyici o hücreden büyür.
- **Kalbe basar:** favori açılır/kapanır, simge kısa bir belirmeyle değişir, değişim dışarı bildirilir.
- **Görüntüleyicide:** sol/sağ ok, Home/End fotoğraf değiştirir; yana kaydırma ya da küçük resim şeridi gezdirir; aşağı çekmek ya da Escape kapatır.
- **Izgarada oklar:** odak fotoğraflar arasında gezer; PageUp/PageDown üç satır, Home/End ilk-son.

## Durumlar

- **Favori olan fotoğraf:** erişilebilir adına ", favori" eklenir.
- **Genişlik:** sütun sayısı kırılım noktasından değil, yakınlaştırma seviyelerinden gelir (varsayılan beş, üç, iki); kap yükseklik ister ve en az 320 px. 480 altında üst çubuk ve şerit küçülür, önceki/sonraki gizlenir, kaydırma ya da şeritle gezilir. Fare olmayan cihazlarda oklar gizli.
- **Çok büyük kitaplık:** sanallaştırılmaz, sayfalanır; küçük resimler hafif kaynakla yüklenir.

## Klavye ve ekran okuyucu

- Izgara etiketli, hücreler fotoğraf açıklamasıyla adlandırılmış düğmelerdir. Yakınlaştırma düğmeleri `aria-pressed`.
- Görüntüleyici etiketli iletişim kutusu; küçük resim şeridi kaydırıcı, değer metni fotoğraf başlığı. Değişimler kibar durum bölgesinde.

## Hareket

- Sıkıştırma canlı ölçekler ve parmakların altındaki fotoğraf çevresinde yeniden dizer. Görüntüleyici tıklanan hücreden büyür, aşağı çekilince kapanır.
- Sayaçlar döner, favori simgeleri kısa bulanıkla belirir.
- **"Hareketi azalt" açıkken:** yerleşim yolculuğu yok; solmalar kalır.
- Saydamlık gerekmeyen kullanıcıda arka plan bulanıklığı düz yüzeye döner.

## Görseller

Her fotoğraf için kaynak (isteğe bağlı çoklu çözünürlük), gerçek genişlik ve yükseklik, açıklama, başlık, ayrıntı. Yazım oturumu yer tutucuları kullanır.

## Para ve kart alanları

Yok.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Fotoğraf sayısı, sütun sayısı | adet | `money.fmtDecimalGrouped` + `animated-counter` |

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `button`, `dialog`, `skeleton`.

Katalogda olmayan:
- `pinch-zoom-grid` (sıkıştırmayla yoğunluk)
- `image-viewer` (hücreden büyüyen; `lightbox-gallery` ile ortak aday)
- `filmstrip` (küçük resim şeridi, kaydırıcı)
- `photo-grid` kabuğu

## Türkçe ekran metinleri (öneri)

- "{n} fotoğraf", "Yakınlaştır", "Uzaklaştır", "Favoriye ekle", "Favoriden çıkar", "Kapat", "Önceki", "Sonraki"
- İpucu: "Yakınlaştırmak için iki parmakla sıkıştırın ya da Ctrl basılıyken kaydırın."

## Kapsam dışı (bilerek)

- Oranı koruyan duvar, kısa slayt, önce/sonra karşılaştırma, favorilerin saklanması (uygulama bağlar).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Etkileşim denenmedi, davranış sayfa metninden alındı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
