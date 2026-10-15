# Tarif: line-replay (zaman tekrarı çizgi grafiği)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir günün (ya da bir olayın) tek serisini, oynat düğmesine basınca soldan sağa kendini çizerek anlatır. Çizginin ucunda bir oynatma imleci ve değer etiketi gider; kilit anlar (duyuru, yayın, sorun, bülten) imleç oradan geçince çizgi üzerinde işaretlenir, üstte bir açıklama çıkar, yandaki "kilit anlar" listesinde ilgili satır yanar. Altta oynat düğmesi, kaydırıcı ve hız seçici vardır. "Ne zaman ne oldu, sonra ne değişti" hikâyesini gösterir.

## Hangi aile projesinde ne için (tahmin)

- SNN-Piyasa-Core, trade-kasa: bir işlem günü ya da bir haber anı sonrası fiyatın tekrarı.
- GHS-Panel: kampanya ya da bülten günü ziyaret/sipariş akışı.
- Herhangi bir projenin olay sonrası inceleme sayfası (arıza, yayın, kesinti).
- Karşılaştırmalı çoklu seri için `line-chart`, canlı akış için `realtime-stream`.

## Bölümler

1. **Başlık alanı:** başlık, alt satırda neyin ölçüldüğü ve ne zaman; sağda açıklama (ana çizgi adı, kıyas çizgisi adı).
2. **Okuma satırı:** dört alan: saat, değer, "kıyasa göre" oran (kıyas yoksa gizlenir), "şu ana kadarki tepe" (değer ve saati).
3. **Grafik:** değer ekseni tüm seriye göre sabittir (çalınırken kayma olmaz); zaman ekseni saat etiketli; çizgi ve altındaki alan; kıyas çizgisi tamamen çizili ve kesikli; oynatma imleci dikey çizgi; ucunda değer etiketi; zaman ekseninde saat etiketi.
4. **Kilit an işaretleri:** çizgi üstünde nokta ve ince dikey çizgi; üstteki şeritte açıklama balonu (başlık ve saat). Sorun anları farklı simge ve başlıkla (yalnız renkle değil) gösterilir.
5. **Denetim satırı:** "Tekrar oynat" / "Oynat" / "Duraklat" düğmesi, kilit an işaretli kaydırıcı, hız seçici (0,5× 1× 2× 4×).
6. **Kilit anlar listesi:** geniş kapta yanda ayrı sütun, dar kapta altta iki ya da tek sütun. Her satır: simge, başlık, saat, tek satır ayrıntı; geçilince satır yanar ve "sonraki saatte +n" ya da "20 dakikada −%n" gibi etki satırı açılır.

## Kullanıcı ne yapar, ne olur

- **Oynat'a basar:** çizgi baştan çizilir; imleç ilerler; saat, değer, oran ve tepe yazıları canlı güncellenir; kilit an geçilince işaret konur, açıklama yükselir, liste satırı yanar.
- **Duraklat:** durur; kaydırıcı değer metni güncellenir.
- **Kaydırıcıyı sürükler/tıklar:** imleç oraya gider; kilit anlar yine gösterilir fakat "geçildi" bildirimi yapılmaz.
- **Hızı değiştirir:** oynatma hızı anında değişir.
- **Kilit an satırına basar:** imleç o ana atlar; oynuyorsa oradan devam eder.
- **Sonda "Tekrar oynat":** baştan oynatır.
- **Açılışta:** varsayılan olarak çizgi tamam, tüm anlar işli, imleç sonda durur; istenirse bileşen yüzde 40 görününce kendiliğinden oynar (hareketi azalt varsa oynamaz).

## Durumlar

- **Kıyas serisi yok:** kıyas çizgisi, açıklaması ve oran alanı yok.
- **Kilit an yok:** liste yok, yalnız çizgi.
- **Sorun anı:** farklı simge ve başlıkla; etkisi "düşüş" olarak hesaplanır, diğerlerinin etkisi "sonraki bir saatteki artış"tır.
- **Noktalar eşit aralıklı olmayabilir;** aradaki kilit anlar ara değerleme ile çizgiye konur.
- **Yükleniyor / veri yok:** iskelet, "Gösterilecek veri yok".
- **Çok geniş kap (yaklaşık 1000 px üstü):** kilit anlar grafiğin yanında bölünmüş sütunda.
- **Dar kap (yaklaşık 560 px altı):** okuma satırı üç sütun, tepe ayrı satır; saat etiketleri altı saatte bir; grafik daha alçak ama okunur; kaydırıcı ayrı tam satır olur; düğmeler ve satırlar en az yaklaşık 44 px.
- **Dokunmatik:** yatay sürükleme ya da dokunma imleci koyar; dikey kaydırma serbest.

## Klavye ve ekran okuyucu

- Tab sırası: oynat düğmesi, kaydırıcı, hız seçici, kilit anlar.
- Kaydırıcı dakika cinsinden ilerleyen kaydırıcıdır; değer metni saat ve değeri okur ("09:40, 2.316 kişi"); oynarken sürekli güncellenmez, yalnız durdurulunca güncellenir ki ekran okuyucu boğulmasın.
- Boşluk/Enter/K oynatır ya da duraklatır; sol/sağ ok bir nokta, Shift+ok ya da PageUp/PageDown bir saat; Home/End baş/son; hız seçicide oklar hızlar arası.
- Kilit an satırı Enter/Boşluk ile imleci oraya götürür; son geçilen satır `aria-current` taşır; etki satırı oynatma o aralığı geçene dek ekran okuyucudan gizlidir.
- Okuma satırı tüm sayıları metin olarak taşır; çizim ekran okuyucudan gizlidir.
- Duyurular kibar canlı bölgede: geçilen an ("09:40. Sıralamada öne çıktı."), duraklatma, atlama, bitiş ("Tekrar bitti. Tepe: 6.041, 10:25").
- Oynat düğmesinin adı duruma göre değişir: "Tekrarı oynat", "Tekrarı duraklat", "Baştan oynat".

## Hareket

- Oynatma tek bir zaman değerini ilerletir; her karede çizgi, alan, imleç, uç etiketi, eksen saati, kaydırıcı ve okuma metni doğrudan yazılır; bileşen yalnız kilit an geçilince, oynatma başlayıp bitince ve boyut değişince yeniden çizilir.
- Başa sarma ya da atlama sönümsüz yaylı süzülmedir; yarıda yeni atlama bulunduğu yerden devam eder.
- Kilit an geçilince işareti çizgiye oturur (saydamlık ve ölçek), ince çizgisi solarak belirir, açıklaması üst şeritte yükselir; önceki açıklama daha hızlı solar.
- Zaman ekseni etiketi imleç saatine yer açmak için solar.
- **"Hareketi azalt" açıkken:** oynatma izleyicinin isteğiyle çalışır (duraklatılabilir) ama sarma, atlama, işaret ve açıklamalar anlıktır; kendiliğinden oynatma kapalıdır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Saat (okuma, etiket, kilit an) | saat:dakika | `date.format` (24 saat, Türkçe) |
| Değer (kişi, işlem, sipariş) | adet | `money.fmtDecimalGrouped` |
| Değer (fiyat, tutar) | para, TRY | `money.format` |
| Eksen değerleri | adet ya da para | `money.compactMajor` |
| Kıyasa göre oran | çarpan ("4,8×") | `money.fmtDecimalGrouped` (bir ondalık) + "×" |
| Kilit an etkisi | adet farkı ya da yüzde | `money.fmtDecimalGrouped` işaretli; yüzde için `math.percentChange` → `money.percent` |
| Tepe (değer ve saat) | adet + saat | yukarıdakilerle |
| Gün adı ve tarih (başlıkta) | tarih | `date.dayName`, `date.format`, `date.monthName` |

## Kurulacak SNN-UI parçaları

Katalogdan: `line-chart` (çizgi, alan, kıyas çizgisi), `slot-text`/`animated-counter` (okuma satırı), `brush-chart` (kaydırıcı benzeri etkileşim fikri), `button`, `tooltip`.

Katalogda olmayan:
- `timeline-scrubber` (oynat düğmesi, kilit an işaretli kaydırıcı, hız seçici; `race-bar-chart` ve `market-terminal` ile ortak)
- `segmented-control` (hız seçici)
- `event-list` (kilit anlar listesi: yanan, açılan satır)
- `line-replay` kabuğu (sabit eksen, oynatma imleci, işaret ve açıklama yerleşimi)

## Türkçe ekran metinleri (öneri)

- Başlık: "{olay adı}"; açıklama: "{ölçü} her beş dakikada, {gün}, {saat dilimi}"
- Okuma: "Saat", "Anlık değer", "Kıyasa göre", "Şu ana kadarki tepe"
- Düğme: "Tekrarı oynat", "Duraklat", "Baştan oynat"; hızlar "0,5×", "1×", "2×", "4×"
- Liste başlığı: "Kilit anlar"
- Duyuru: "{saat}. {an adı}.", "Tekrar bitti. Tepe: {değer}, {saat}."

## Kapsam dışı (bilerek)

- Kullanıcının kendi notlarını ekleyip düzenlediği, durağan açıklamalı çizgi.
- İki ölçünün birlikte hareketi (bağlı dağılım grafiği).
- Çoklu seri karşılaştırma. Bu bileşen tek seri ve bir kıyas çizgisidir.
- Veri üretmek: noktalar ve kilit anlar aynı dakika saatinde uygulamadan gelir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; oynatma denenmedi, davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
