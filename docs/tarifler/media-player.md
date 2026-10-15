# Tarif: media-player (ses oynatıcı ve çalma listesi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Küçük bir ses koleksiyonu (podcast, örnek paketi, çalma listesi) için tam oynatıcı: kapak, parça adı, ilerleme çubuğu, oynat/duraklat, önceki/sonraki, ses ve sessiz, çalma listesi. Çalan parça listede işaretlidir.

## Hangi aile projesinde ne için (tahmin)

- Ses içeren tanıtım ya da içerik sayfaları. Küçük "şimdi çalıyor" kutusu için ayrı bir parça; yazıyla eşzamanlı döküm ya da kayıt yapma bu bileşenin dışında.

## Bölümler

1. **Kapak alanı:** parça kapağı; parça değişince soluk geçer.
2. **Başlık:** parça adı ve ikinci satır (koleksiyon ya da tür).
3. **İlerleme çubuğu:** geçen süre / toplam süre ve aralık girdisi.
4. **Kumanda:** önceki, oynat/duraklat, sonraki; ses kaydırıcısı ve sessiz düğmesi.
5. **Çalma listesi:** parça satırları (ad, süre); çalan satırın yanında kayan işaret ve çalarken oynayan çubuklar.

## Kullanıcı ne yapar, ne olur

- **Oynat/duraklat:** ses başlar ya da durur; simge kısa ölçek ve bulanıkla değişir.
- **İlerleme çubuğunu sürükler ya da ok basar:** konum değişir; değer metni "0:12 / 0:24" biçiminde.
- **Önceki/sonraki:** parça değişir; kapak soluk geçer, başlık yükselerek gelir.
- **Çalma listesinde satıra basar:** o parça çalmaya başlar; işaret satıra kayar.
- **Ses kaydırıcısı ve sessiz:** sessiz düğmesinin etiketi "Sessize al" ve "Sesi aç" arasında değişir; değer metni yüzde.
- **Parça bitince:** bir sonrakine geçer (listenin sonunda durur).

## Durumlar

- **Yükleniyor / ses dosyası açılamadı:** satır içi hata ve "Tekrar dene".
- **Tek parça:** önceki/sonraki kapalı, liste gizlenebilir.
- **Genişlik:** 420 px altında dolgu daralır, kapak daha yatay oranlı olur, düğmeler küçülür, ses kaydırıcısı daralır. Aralık girdileri yerel olduğundan dokunmatik ve klavye ek iş istemez.

## Klavye ve ekran okuyucu

- Yerel ses öğesi ve aralık girdileri: oklar konum ve sesi ayarlar.
- Kumanda ve liste düğmeleri etiketli ("{parça} çal", "Sonraki parça"); çalan parça `aria-current`.
- İlerleme ve ses değer metni taşır ("0:12 / 0:24", "% 70").

## Hareket

- Seçili satırın işareti ortak yerleşim öğesiyle çalan parçaya kayar; çalarken çubuklar atar.
- Kapak soluk geçer, başlık yükselir; oynat simgesi kısa ölçek ve bulanıkla değişir.
- **"Hareketi azalt" açıkken:** kayma, geçiş ve çubuk animasyonu yok.

## Görseller

Parça başına bir kapak görseli. Yazım oturumu yer tutucu kapak kullanır. Ses dosyaları uygulamadan gelir (bileşen içinde gerçek ses gömülmez).

## Para ve kart alanları

Yok.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Geçen ve toplam süre | süre | "d:ss" biçimi; küçük yardımcı fonksiyon |
| Ses düzeyi | yüzde | `money.percent` |

## Kurulacak SNN-UI parçaları

Katalogdan: `button`, `progress`, `tooltip`.

Katalogda olmayan:
- `slider` (ilerleme ve ses için yerel aralık girdisi sarmalayıcı)
- `playlist-row` (çalan işaretli satır)
- `media-player` kabuğu

## Türkçe ekran metinleri (öneri)

- "Oynat", "Duraklat", "Önceki parça", "Sonraki parça", "Sessize al", "Sesi aç", "Çalma listesi", "{parça} çal"

## Kapsam dışı (bilerek)

- Yazıyla eşzamanlı döküm, ses kaydı, mini "şimdi çalıyor" pencereciği, görüntü (video) oynatma, akış sunucusu.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
