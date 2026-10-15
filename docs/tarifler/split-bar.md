# Tarif: split-bar (bölünmüş yüzde çubuğu)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir bütünü tek yatay çubukta paylara böler. Bir dilime gelince o dilim biraz genişler, kesin değeri ve payı üstteki okuma alanında yazılır. Alttaki açıklama satırından dilimler kapatılıp açılır; kalanlar çubuğu yeniden doldurur. Etiket sığıyorsa dilimin içinde, sığmıyorsa çubuğun altında ince çizgiyle gösterilir.

## Hangi aile projesinde ne için (tahmin)

- SNN-Proje-ve-Nakit-Akis-Yonetimi: gider kalemlerinin dağılımı (personel, kira, vergi, diğer).
- SNN-Ihale-Maliyet-Teklif-Yonetimi: bir teklifin maliyet payları (malzeme, işçilik, genel gider, kâr).
- SNN-Portfoy-Yonetimi, trade-kasa: varlık sınıfı ya da hesap dağılımı.
- GHS-Panel: kanal ya da müşteri grubuna göre satış payı.
- Toplam değer başlıksa `donut-chart`, kare sayımıysa `waffle-chart`, çok kategori ve mutlak karşılaştırmaysa `bar-chart` kullanılır.

## Bölümler

1. **Başlık alanı:** başlık, bir satır açıklama, sağda dönem seçici (örn. "7 gün / 30 gün / 90 gün"; isteğe bağlı, uygulama koyar).
2. **Okuma alanı:** hiçbir şey seçili değilken "Toplam" ve toplam değer; bir dilim seçiliyken dilimin adı, payı ve değeri. İkisi birbirine yumuşakça geçer.
3. **Çubuk:** tek satır, her dilim kendi payı kadar genişlikte. Küçük dilimlerde etiket çubuğun altındaki şeride taşar.
4. **Dış etiket şeridi:** sığmayan etiketler dilimden aşağı doğru ince eğri çizgilerle bağlanır; üst üste binmemek için birbirinden uzaklaştırılır. Şerit gerekmeyince kapanır.
5. **Açıklama satırı (legend):** her dilim için renk kutusu, ad ve pay; tıklanınca dilim kapanır/açılır.

## Kullanıcı ne yapar, ne olur

- **Dilimin üstüne gelir ya da dokunur:** dilim çubuğun yaklaşık yüzde 4-5'i kadar genişler (küçükse adı ve payı sığacak kadar), diğerleri orantılı daralır ve soluklaşır. Okuma alanı dilimi yazar. Fare çıkınca eski hâline döner.
- **Açıklama satırından bir dilime basar:** dilim yerinde çöker, kalanlar çubuğu doldurur, yüzdeler yeni paya doğru döner. Tekrar basınca geri açılır.
- **Son açık dilimi kapatmaya çalışır:** engellenir; açıklama öğesi hafifçe sallanır ve sebep okunur ("En az bir dilim açık kalmalı").
- **Dönem ya da veri değişir:** aynı kimlikli dilimler eski yerlerinden yeni genişliklerine kayar; yeniden çizim yok, kesintisiz geçiş.
- **Dokunmatik:** dilime dokunmak seçer, başka yere dokunmak temizler; dikey kaydırma engellenmez.

## Durumlar

- **Tek dilim:** çubuk tamamen dolu, kapatılamaz.
- **Sıfır ya da negatif değerli dilim:** çubukta ve açıklamada yer almaz.
- **Hiç veri yok:** soluk "Gösterilecek veri yok" alanı.
- **Yükleniyor:** gri çubuk iskeleti.
- **Çok dilim:** 2-8 dilim için tasarlanmıştır; fazlası "Diğer" altında toplanır (uygulama yapar), "Diğer" en sonda nötr renkte durur.
- **Dar ekran:** daha fazla etiket dışarı taşar; okuma alanı başlığın altına iner; açıklama birkaç satıra sarar.
- **Uzun ad:** yalnız geniş dilimin içinde görünür, kalan her yerde dış şeritte kısalır.
- **Kapalı dilim:** renksiz, içi boş kutu, üstü çizili ad ve "Kapalı" sözüyle gösterilir (renk tek ipucu olmaz).

## Klavye ve ekran okuyucu

- Çubuk tek odak noktasıdır; adında tüm açık dilimler ve payları vardır ("Ad yüzde ..." biçiminde).
- Sağ/aşağı ok sonraki açık dilimi, sol/yukarı ok öncekini seçer; Home/End ilk/son dilim; Enter ya da Boşluk seçili dilimi kapatır; Esc seçimi temizler.
- Açıklama öğeleri Tab ile gezilen düğmelerdir, `aria-pressed` taşır; adı dilim ve payını ya da "kapalı"yı söyler.
- Seçim ve kapatma/açma kibar (polite) canlı bölgede duyurulur.
- Çubuğun içindeki ve dışındaki etiketler, bağlantı çizgileri ekran okuyucudan gizlenir; okuma alanı ve çubuk adı aynı sayıları metin olarak taşır.

## Hareket

- Dilim sınırları yay ile (yumuşak) yer değiştirir; yalnız kırpma ve kaydırma animasyonu, yerleşim hesabı yapılmaz.
- Etiketler kendi diliminin içinde kayar, sınırda kesilir; dış etiketler yeni yerine süzülür, bağlantı çizgileri eğri biçimde onunla birlikte değişir.
- Yüzdeler ve değerler rakam rakam döner (`animated-counter` / `slot-text` mantığı), dönüş yönü sayının gittiği yöndür.
- Okuma alanı iki metin arasında hafif yükselme ve bulanıklıkla yer değiştirir.
- **"Hareketi azalt" açıkken:** dilimler ve etiketler anında yer değiştirir, rakamlar yerinde değişir, sallama yok.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Dilim değeri (gider, maliyet) | para, TRY | `money.format` (okuma alanında tam); etiket içinde sığmıyorsa `money.compactMajor` |
| Dilim değeri (oturum, adet) | adet | `money.fmtDecimalGrouped` (binlik ayraçlı, ondalıksız) |
| Dilim payı | yüzde, bir ondalık | `money.percent` |
| Toplam | para ya da adet | yukarıdakiyle aynı |
| Dönem karşılaştırması (isteğe bağlı) | yüzde değişim | `math.percentChange`, `money.percent` |

`Intl.NumberFormat` ve sabit `en-US` yok; her sayı ABACUS araçlarıyla, Türkçe ayraçlarla yazılır ("%41,6"). Pay hesabı açık dilimlerin toplamına göre yapılır; yüzdeler yuvarlanınca toplamın %100,0'dan sapması uygulamada sorun sayılmaz ama görünen yüzdeler yalnız gösterim içindir, hesap yuvarlanmamış değerle yapılır.

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter` ya da `slot-text` (dönen rakamlar), `bar-chart`/`donut-chart` (kardeş parçalar, ortak renk dizisi), `tooltip`, `skeleton`, `empty-state`.

Katalogda olmayan:
- `segmented-control` (dönem seçici; zaten başka tariflerde aday)
- `split-bar` kabuğu (kırpma tabanlı dilim katmanları, etiket yerleştirme, dış etiket şeridi)
- Metin ölçümü için tuval tabanlı bir ölçü yardımcısı (etiket sığıyor mu hesabı; yerleşimi okumadan)

## Türkçe ekran metinleri (öneri)

- Okuma alanı: "Toplam", "{ad}: %{pay} · {değer}"
- Açıklama: "{ad} %{pay}", kapalıysa "{ad} (kapalı)"
- Uyarı: "En az bir dilim açık kalmalı."
- Boş: "Gösterilecek veri yok."
- Ekran okuyucu: "bölünmüş çubuk, {ad} yüzde {pay}, …; ok tuşlarıyla gezin"

## Kapsam dışı (bilerek)

- Zaman içindeki payların gidişi (`streamgraph` ya da yığılmış grafik).
- Dilimin içine inme (alt kırılım).
- Dikey çubuk ya da çoklu satır.
- Veri servisi bağlantısı; dilim listesini uygulama verir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; metinler, örnek veriler, renk ve süre değerleri alınmadı, her şey kendi cümlemizle yazıldı.
