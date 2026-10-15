# Tarif: realtime-stream (canlı akan çizgi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Tek bir ölçümün son saniye ya da dakikalarını canlı gösterir: çizgi sürekli sola kayar, yeni okumalar akıcı biçimde içeri girer. Fare üstüne gelince görüntü durur ve okunur; olağandışı noktalar küçük işaretle ve kısa etiketle öne çıkar. Sağ üstte canlı/duraklatılmış durumu gösteren bir düğme vardır.

## Hangi aile projesinde ne için (tahmin)

- SNN-Piyasa-Core, trade-kasa: anlık fiyat, spread ya da işlem sayısı akışı.
- SNN-Portfoy-Yonetimi: anlık portföy değeri.
- Herhangi bir projenin durum sayfası: yanıt süresi, kuyruk uzunluğu, açık kullanıcı sayısı.
- Geçmişe bakış için `brush-chart`, birkaç seri için `line-chart`, küçük eğilim için `sparkline`.

## Bölümler

1. **Başlık alanı:** ölçüm adı, bir satır açıklama (örn. kaynak).
2. **Büyük anlık değer:** en yeni okuma, birimiyle; rakamlar döner.
3. **Durum düğmesi:** "Canlı" ya da "Duraklatıldı"; şekil ve yazıyla ayırt edilir, renk tek ipucu değildir.
4. **Çizim alanı:** zaman penceresi (varsayılan son 30 saniye), değer ekseni, yumuşak çizgi; en yeni nokta sağda.
5. **Anomali işaretleri:** çizgi üstünde nokta ve kısa etiket ("Sıçrama" gibi, etiketi veri sağlar; grafik kendisi anomali bulmaz).
6. **Gizli tablo:** son yirmi okuma: zaman, değer, not.

## Kullanıcı ne yapar, ne olur

- **Çizim alanına gelir ya da dokunur:** görüntü durur, yeni okumalar arka planda birikir; okunan noktada ipucu (zaman, değer, varsa not).
- **Fareyi çeker:** görüntü canlıya yumuşakça döner.
- **Durum düğmesine ya da Boşluk'a basar:** akışı duraklatır/sürdürür.
- **Oklarla gezer:** sol/sağ önceki/sonraki nokta; PageUp/PageDown on nokta; Home/End en eski/en yeni; Esc okumayı bırakır ve akışı sürdürür.
- **Anomali gelir:** işaret hafif taşarak belirir; kibar canlı bölgede bir kez duyurulur.

## Durumlar

- **İlk okuma gelmedi:** "Veri bekleniyor".
- **Akış kesildi:** son değer solar, "Bağlantı kesildi" ve "Yeniden dene" (proje bağlar).
- **Sabit eksen:** alt/üst sınır verilmişse eksen onlara oturur; verilmemişse veriyi izler, çizgiler kayarak değişir.
- **Dar ekran:** zaman etiketleri seyrelir; tuval kap genişliğine ve ekran yoğunluğuna uyar.
- **Görünüm dışı ya da gizli sekme:** çizim durur, geri gelince devam eder.
- **Çok veri:** yalnız pencere içindeki noktalar çizilir; dizi sınırsız büyütülmez (uygulama son birkaç pencereyi tutar).

## Klavye ve ekran okuyucu

- Çizim alanı odaklanabilir; Tab ile gelince görüntü durur ve en yeni nokta okunur.
- Anlık değer metindir; dönen rakamlar ekran okuyucudan gizlenir.
- Durum düğmesi `aria-pressed` taşıyan bir anahtardır.
- Anomali ve nokta okumaları kibar canlı bölgede duyurulur; gizli tablo son yirmi okumayı verir.

## Hareket

- Çizgi ekran yenileme hızında sürekli kayar; uç nokta iki okuma arasında ara değerle ilerler, nokta "zıplamaz".
- Değer ekseni görünen aralığa yavaşça uyum sağlar, çizgiler kayar.
- Anomali işareti bir kez hafifçe taşarak belirir; duraklatmadan çıkış yumuşak geçişle canlıya döner.
- **"Hareketi azalt" açıkken:** kayma yok; çizim yalnız yeni okuma gelince yenilenir, ara değer ve işaret taşması yok.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Anlık değer ve nokta değeri (süre, adet) | sayı ya da süre | `money.fmtDecimalGrouped` + birim ("ms") |
| Anlık değer (fiyat, tutar) | para, TRY | `money.format` |
| Zaman etiketleri | saat:dakika:saniye | `date.format` (saat biçimi) |
| Değer ekseni | sayı | kısa biçim, `money.compactMajor` ya da `money.fmtDecimalGrouped` |
| Değişim (isteğe bağlı) | yüzde | `math.percentChange`, `money.percent` |

## Kurulacak SNN-UI parçaları

Katalogdan: `line-chart` ve `brush-chart` (kardeş parçalar, ortak renk dizisi), `sparkline`, `animated-counter`/`slot-text`, `tooltip`, `empty-state`, `skeleton`.

Katalogda olmayan:
- `realtime-stream` kabuğu (tek tuval, tek zamanlayıcı döngüsü, ikili arama ile pencere, ara değer)
- `switch` ya da `toggle` (durum düğmesi; başka tariflerde de gerekir)

## Türkçe ekran metinleri (öneri)

- Durum: "Canlı", "Duraklatıldı"
- Boş: "Veri bekleniyor."
- Hata: "Bağlantı kesildi." / "Yeniden dene"
- Duyuru: "Olağandışı değer: {not}, {değer}"

## Kapsam dışı (bilerek)

- Anomali tespiti (veri sağlar).
- Çok serili ya da geçmişi yakınlaştırılan çizim (`line-chart`, `brush-chart`).
- Veri kaynağı bağlantısı (WebSocket vb.); bileşen yalnız sıralı nokta dizisini alır.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Sayfadaki düz metin okundu; metinler, örnek veriler, renk ve süre değerleri alınmadı.
