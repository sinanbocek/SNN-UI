# Tarif: funnel-chart (dönüşüm hunisi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Sıralı adımlarda her adımın bir öncekinin bir kısmını koruduğu süreci tek yumuşak, daralan bantla gösterir. Her adım sınırında kaç kişinin düştüğü görünür. Bant "toplam" ya da parçalara bölünmüş (örn. cihaza göre) çizilir; görünüm değişince bant şekil değiştirir.

## Hangi aile projesinde ne için (tahmin)

- SNN-Ihale-Maliyet-Teklif-Yonetimi: ihale takibi (ilan → inceleme → teklif → sonuç → kazanım).
- GHS-Panel: müşteri adayından siparişe satış hattı.
- Kayıt ve onboarding akışı olan her proje: kayıt → doğrulama → ilk kullanım.
- Dallanma varsa `sankey-flow`.

## Bölümler

1. **Üst başlıklar:** her adımın adı, kalan sayısı (kısaltılmış) ve bir önceki adımdan yüzde kaç kaldığı.
2. **Bant:** yatay, adımda düz, adımlar arasında yumuşak inen bir şerit; adım sınırlarında düşüş işareti.
3. **Odak sütunu:** üzerinde bulunulan adımı yumuşakça vurgulayan sütun.
4. **İpucu kutusu:** adımın tam sayısı, bir öncekine ve ilke göre oranlar; parçalıysa parça kırılımı.
5. **Görünüm seçici (isteğe bağlı, uygulama koyar):** "Toplam", "Bölünmüş", ya da tek bir parça.
6. **Gizli özet ve tablo:** her adım, her parça, iki oran.

## Kullanıcı ne yapar, ne olur

- **Adımın üstüne gelir ya da oklarla gezer:** odak sütunu o adıma kayar, ipucu yanında gelir, sınırın dışına taşmaz.
- **Görünümü "Bölünmüş" yapar:** parçalar aralarında ince boşlukla üst üste dizilir; bant yeni şekline akar.
- **Tek bir parçayı seçer:** yalnız o parça kalır, bant yüksekliği doldurana kadar yeniden ölçeklenir.
- **"Toplam"a döner:** parçalar tek banda birleşir.
- **Akış noktaları:** bantta küçük noktalar adımlardan geçer; düşenler adım sınırında bandı terk eder, düşen oran gerçek düşüş oranıyla uyumludur.
- **Dokunmatik:** basıp sürükleyerek adımlar okunur; sayfa dikey kaydırılabilir.

## Durumlar

- **İlk adım sıfır:** "Veri yok".
- **Parçasız veri:** yalnız "Toplam" görünümü.
- **Yükleniyor:** gri bant iskeleti.
- **Dar ekran (yaklaşık 420 px altı):** huni dikeye döner, adım adları sağda alt alta yazılır; ipucu kutusu çerçeveye kenetlenir.
- **Çok adım ya da uzun ad:** adlar iki satıra kırılır; kısa tutulması önerilir.
- **Düşüş görünümü:** ok işareti ve sayıyla verilir; yalnız renkle değil.

## Klavye ve ekran okuyucu

- Huni tek odaklanabilir gruptur; Tab ilk adımı okur; sağ/aşağı sonraki, sol/yukarı önceki; Home/End ilk/son; Esc okumayı temizler.
- Kibar (polite) canlı bölge: adım adı, sayısı, bir önceki adımdan kalan oran ve ilk adıma göre oran.
- Bant, noktalar ve başlıklar ekran okuyucudan gizlenir; gizli özet ve tablo aynı sayıları verir.

## Hareket

- Görünüm değişince bant bulunduğu şekilden yeni şekline yayla geçer; bölünme boşluğu aynı yayla açılıp kapanır.
- Sayılar ve oranlar yeni değerlerine döner.
- Bant ilk görününce ortasından büyür; noktalar ekran dışında ve gizli sekmede durur.
- **"Hareketi azalt" açıkken:** geçişler anında, nokta yok.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Adım sayısı | adet | başlıkta `money.compactMajor` mantığıyla kısa ("12 B"), ipucunda `money.fmtDecimalGrouped` |
| Önceki adımdan kalan oran | yüzde | `money.percent` |
| İlk adıma göre oran | yüzde | `money.percent` |
| Düşüş | adet ve yüzde | `money.fmtDecimalGrouped`, `math.percentChange` (negatif işaretli) |
| Adım tutarı (satış hunisinde) | para, TRY | `money.format` / `money.compactMajor` |

## Kurulacak SNN-UI parçaları

Katalogdan: `bar-chart` ve `slope-chart` (kardeş parçalar, ortak renk dizisi), `animated-counter`, `tooltip`, `empty-state`, `skeleton`.

Katalogda olmayan:
- `funnel-chart` kabuğu (daralan bant yolu üretimi, bölünmüş/izole görünüm, tuval noktaları)
- `segmented-control` (görünüm seçici)

## Türkçe ekran metinleri (öneri)

- Görünüm: "Toplam", "Bölünmüş"
- Başlıkta: "{adım} · {sayı} · %{oran}"
- Düşüş: "↓ {sayı} kişi (%{oran})"
- Boş: "Veri yok."
- Ekran okuyucu: "{adım}: {sayı}, önceki adımdan %{oran} kaldı, ilk adımın %{oran}'i"

## Kapsam dışı (bilerek)

- Dallanan akışlar (`sankey-flow`).
- Adım içi kırılım tablosu, dışa aktarma.
- Dönem karşılaştırma çizgisi (iki huni yan yana kullanılır).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Sayfadaki düz metin okundu; metinler, örnek veriler, renk ve süre değerleri alınmadı.
