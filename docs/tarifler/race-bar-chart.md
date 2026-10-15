# Tarif: race-bar-chart (sıralama yarışı)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir sıralamanın zaman içinde nasıl değiştiğini yatay çubuklarla anlatır. Çubuklar büyür, birbirini geçer, değerler sayarak artar; dönem adı büyük yazıyla değişir. Altta oynat/duraklat ve istenen döneme sürüklenen bir zaman çubuğu vardır. Dikkat çekmek için hazırlanmış bir anlatı bileşenidir; her gün bakılan panelde yeri yoktur.

## Hangi aile projesinde ne için (tahmin)

- SNN-Portfoy-Yonetimi: varlıkların aylık değerinin yarışı.
- GHS-Panel: müşteri ya da ürüne göre aylık ciro yarışı (yıl sonu özeti).
- SNN-Ihale-Maliyet-Teklif-Yonetimi: kurumlara göre toplam teklif tutarı.
- Anlık karşılaştırma için `bar-chart`; trend için `line-chart`.

## Bölümler

1. **Başlık alanı:** başlık, bir satır açıklama (örn. dönem aralığı).
2. **Büyük dönem etiketi:** grafiğin sağ alt köşesinde, geçerli dönem.
3. **Çubuk sahası:** en çok N çubuk (varsayılan 8) sıralı, her birinde ad ve değer; bir ana öğe vurgulanabilir (kalın ad ve değer).
4. **Değer ekseni:** üstte, ölçekle birlikte kayan çizgiler.
5. **Grup açıklaması:** çubuk renkleri grup başına (en çok 4 grup); açıklama satırı.
6. **Zaman çubuğu:** oynat/duraklat düğmesi, dönemleri gösteren kaydırıcı, ilk ve son dönem adı.
7. **Gizli tablo:** her öğenin her dönemdeki değeri.

## Kullanıcı ne yapar, ne olur

- **Sayfa görünüme girince:** yarış ilk dönemden son döneme kendiliğinden oynar (ayarla kapatılabilir; "hareketi azalt" varsa oynamaz).
- **Oynat/duraklat:** oynarken duraklatır; sonda basılırsa baştan oynatır.
- **Zaman çubuğunu sürükler ya da tıklar:** yarış o döneme akar; dönem etiketi döner.
- **Sol/sağ ok:** bir dönem geri/ileri; yukarı/aşağı ok sıralamada gezdirir ve ipucunu gösterir.
- **Çubuğun üstüne gelir:** ipucunda ad, sıra, değer.
- **Döngü:** istenirse son dönemden sonra başa sarar.

## Durumlar

- **Veri eksik öğe:** o dönemde değeri sıfır sayılır.
- **Üst N dışına çıkan çubuk:** aşağıya kayıp görünmez olur; girenler aşağıdan yükselir.
- **Hiç dönem yok:** "Veri yok".
- **Dar ekran (yaklaşık 400 px altı):** adlar çubuğun içine alınır; kısa çubuğun değeri adın sağına yazılır; dönem etiketi küçülür.
- **Zaman çubuğu:** parmakla sürüklenebilecek yükseklikte (dokunma hedefi).
- **Görünüm dışı:** oynatma durur.

## Klavye ve ekran okuyucu

- Boşluk/Enter oynatır-duraklatır; sol/sağ ok dönem; Home/End ilk/son dönem; yukarı/aşağı ok sırada gezinti; Esc okumayı temizler.
- Zaman çubuğu kaydırıcıdır; değer metni dönem adıdır.
- Dönem değişince dönem ve lider kibar canlı bölgede duyurulur; çubuk okununca ad, sıra ve değer duyurulur.
- Her çubukta ad ve değer yazılıdır; renk tek ipucu değildir. Gizli tablo tüm veriyi taşır.

## Hareket

- Zaman sürekli akar: dönemler arası değerler ara değerlerle hesaplanır, çubuklar düzgün uzar, sayılar sayarak artar.
- Sıra değişince her satır kendi yayıyla kayar; üst N'e girenler aşağıdan yükselerek belirir.
- Eksen çizgileri ölçekle birlikte kayar; dönem etiketi kısa bulanıklıkla değişir.
- **"Hareketi azalt" açıkken:** otomatik oynatma yok, dönemler ara değersiz atlar, çubuklar anında yerleşir.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Çubuk değeri (ciro, bakiye) | para, TRY | `money.compactMajor` (çubukta), `money.format` (ipucu ve tabloda) |
| Çubuk değeri (adet) | adet | `money.fmtDecimalGrouped` |
| Eksen çizgi değerleri | para ya da adet | kısa biçim, `money.compactMajor` |
| Dönem etiketi | tarih (ay/yıl) | `date.monthName`, `date.format` |
| Sıra | adet (tamsayı) | düz tamsayı |

Sayarak artan değerlerde ara değerler biçimlenmeden önce yuvarlanır; ekranda kuruş görünmez.

## Kurulacak SNN-UI parçaları

Katalogdan: `bar-chart` (kardeş parça, ortak renk dizisi), `line-chart`, `slot-text`/`animated-counter` (dönen değer), `tooltip`, `empty-state`, `skeleton`.

Katalogda olmayan:
- `race-bar-chart` kabuğu (sıra yayları, sürekli zaman, ara değer üretimi)
- `timeline-scrubber` (oynat düğmesi + kaydırıcı; `line-replay` ve `market-terminal` ile ortak aday)
- `button` zaten katalogda (oynat/duraklat)

## Türkçe ekran metinleri (öneri)

- Düğme: "Oynat", "Duraklat", "Baştan oynat"
- Duyuru: "{dönem}, lider {ad}", "{ad}, {sıra}. sıra, {değer}"
- Boş: "Veri yok."

## Kapsam dışı (bilerek)

- Çok seri çizgi yarışı (`line-chart`).
- Ses ya da dışa aktarma (video).
- Çubuk üzerinde tıklama ile ayrıntıya inme.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Sayfadaki düz metin okundu; metinler, örnek veriler, renk ve süre değerleri alınmadı.
