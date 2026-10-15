# Tarif: budget-variance (bütçe–gerçekleşen sapması)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Planlanan ile gerçekleşen harcamayı bölüm (maliyet merkezi) bazında hizalı çubuklarla karşılaştırır. Her satırın bütçe işareti aynı hizada durur; harcama çubuğu bu işareti geçerse geçen kısım tehlike renginde görünür. Yanında işaretli sapma tutarı ve yüzdesi ("aşım", "altında", "plana uygun") yazar. Ay, çeyrek ve yıl başından beri arasında geçilir; bir bölüm satır içinde açılıp bütçe kalemlerine inilir; en üstte toplam satırı vardır. Burada tüm kalemler gider sayılır: bütçenin altında kalmak olumlu, aşmak olumsuzdur.

## Hangi aile projesinde ne için (tahmin)

- SNN-Proje-ve-Nakit-Akis-Yonetimi: bölüm ya da proje bazında bütçe–gerçekleşen izleme.
- SNN-Ihale-Maliyet-Teklif-Yonetimi: teklif maliyet kalemlerinde planlanan ve gerçekleşen.
- Ay kapanışı ve yönetim toplantısı ekranları.
- Eğilim için çizgi grafik; tek toplamın nasıl değiştiği için `mrr-waterfall` mantığı; çok sayıda birimde sıralanabilir tablo.

## Bölümler

1. **Başlık satırı:** başlık, alt satırda dönem açıklaması ("Eylül 2026"); sağda dönem anahtarı (Ay / Çeyrek / Yıl başından beri).
2. **Ölçek şeridi:** sütun başında 0%, 50%, 100% çizgileri; bütçe işareti 100% hizasında hep aynı yerde durur.
3. **Toplam satırı:** "Toplam işletme gideri", "harcanan / bütçe", işaretli sapma ve yüzdesi, çubuk.
4. **Bölüm satırları:** bölüm adı, sorumlu (avatar), harcanan/bütçe, işaretli sapma, çubuk, açma oku. Geniş kapta tablo sütunları: ad ve sorumlu, çubuk, gerçekleşen, bütçe, sapma, ok.
5. **Açık bölümün kalemleri:** her kalem için aynı bilgi (ad, harcanan/bütçe, sapma, çubuk). Aynı anda tek bölüm açık kalır.
6. **Açıklama:** "Gerçekleşen", "Bütçe", "Bütçe aşımı", "Bütçenin %90–110'u" (tolerans bandı).

## Kullanıcı ne yapar, ne olur

- **Dönem değiştirir:** tüm çubuklar yeni uzunluğuna yayla gider, tutarlar ve yüzdeler sayarak değişir; ölçek ve bütçe işareti yerinden oynamaz.
- **Bir bölüme basar:** o bölümün kalemleri yükseklik ve saydamlıkla açılır; önce açık olan bölüm kapanır. Ok döner. Kapatma açmadan hızlıdır.
- **Klavyeyle:** Tab dönem anahtarına, sonra bölüm listesine gider; yukarı/aşağı ok bölümler arasında, Home/End ilk/son; Enter/Boşluk açar/kapatır; dönem anahtarında sol/sağ ok dönemi değiştirir.
- **Bir bölüm açıldığında** uygulama haberdar edilir (kalemleri tembel yüklemek için).

## Durumlar

- **Plana uygun:** sapma eşikten küçükse (bütçenin küçük bir oranı) nötr görünür ("plana uygun").
- **Bütçenin üstünde:** çubuğun aşan kısmı kırmızı; yön "aşım" sözüyle de yazılır.
- **Bütçenin altında:** olumlu (yeşil ya da mavi-gri), "altında" sözüyle.
- **Toplamlar:** bölüm ve toplam kalemlerden toplanır, tutmama olamaz.
- **Hiç bölüm yok:** "Bütçe verisi yok". **Yükleniyor:** satır iskeleti. **Hata:** "Yüklenemedi", "Yeniden dene".
- **Çok bölüm (onlarca):** bu görünüm bir pencereyi görsel karşılaştırır; sıralanabilir tablo daha uygun.
- **Dar kap (yaklaşık 760 px altı):** her satırda üstte ad, harcanan/bütçe ve sapma, altında tam genişlik çubuk. Uzun ad kırpılmaz, sarar. Dönem anahtarı telefonda tam genişlik; dokunma hedefi büyür (satır en az yaklaşık 60 px).
- **Ölçek:** tüm satır ve dönemler tek ortak ölçeği kullanır (bütçenin en az yaklaşık yüzde 120'si, en büyük kaleme göre yukarı yuvarlanır), bütçe işareti dönem değişiminde hareket etmez.

## Klavye ve ekran okuyucu

- Her bölüm başlık + açma düğmesidir (`aria-expanded`, `aria-controls`); adı tam cümledir: "{ad}: bütçe {x}, gerçekleşen {y}, {z} aşım/altında".
- Toplam ve kalemler gizli metinle aynı cümleyi taşır; çubuklar ve sayan rakamlar gizlenir (iki kez okunmasın).
- Dönem değişince yeni dönem ve toplam kibar canlı bölgede duyurulur.
- Sapma yalnız renkle değil: tutar işaretlidir, yüzde "aşım / altında / plana uygun" ile biter.
- Fareyle odak halkası görünmez; klavyeyle ortak odak halkası görünür.

## Hareket

- Dönem değişince tüm çubuklar tek kritik sönümlü yayla yeni uzunluğa gider, tüm tutarlar ve yüzdeler yeni değere sayar. Aşım, aynı çubuğun bütçe işareti ötesine kırpılmış parçasıdır; ikinci bir animasyonla eşitlemek gerekmez.
- Bölüm açılırken kalemler yükseklik ve saydamlıkla büyür (taşma yok); kapanış daha hızlıdır; ok yaylı döner. Her animasyon yarıda kesilebilir.
- **"Hareketi azalt" açıkken:** çubuk ve rakamlar son değere atlar, kalemler tam yükseklikte açılır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Harcanan, bütçe | para, TRY | `money.format`; satırlarda kısa `money.compactMajor` ("₺1,37 M") |
| Sapma (işaretli) | para, TRY | `money.format` (işaret + ya da −) |
| Sapma yüzdesi | yüzde (bir ondalık) | `math.percentChange(bütçe, gerçekleşen)` → `money.percent`; sonuna "aşım / altında / plana uygun" |
| Ölçek (0, 50, 100%) | yüzde | `money.percent` |
| Dönem açıklaması | tarih | `date.monthName` + yıl, çeyrek adı; yıl başından beri için başlangıç ve bitiş `date.format` |

Para birimi `$` değil TRY; kısaltmalar (K, M) yerine Türkçe kısa biçim (B, Mn) ABACUS'tan gelir.

## Kurulacak SNN-UI parçaları

Katalogdan: `bar-chart` (çubuk ve ölçek mantığı), `usage-meter` (bant ve işaret fikri), `animated-counter`, `slot-text`, `tooltip`, `skeleton`, `empty-state`.

Katalogda olmayan:
- `segmented-control` (dönem anahtarı)
- `avatar` (sorumlu)
- `disclosure-row` / `accordion` (açılan bölüm)
- `bullet-bar` (hizalı ortak ölçekli çubuk ve bütçe işareti)
- `budget-variance` kabuğu

## Türkçe ekran metinleri (öneri)

- Başlık: "Bütçe ve gerçekleşen"; dönem: "Ay", "Çeyrek", "Yıl başından beri"
- Satır: "{harcanan} / {bütçe}"; sapma: "+{tutar} · %{oran} aşım", "−{tutar} · %{oran} altında", "plana uygun"
- Toplam: "Toplam işletme gideri"
- Açıklama: "Gerçekleşen", "Bütçe", "Bütçe aşımı", "Bütçenin %90–110'u"
- Boş: "Bütçe verisi yok."

## Kapsam dışı (bilerek)

- Gelir kalemleri (burada tüm kalemler gider sayılır; gelir için işaret mantığı tersine çevrilmelidir, ayrı bir seçenek gerekir).
- Zaman içinde eğilim, aşım tahmini (`usage-forecast`).
- Bütçeyi düzenlemek, kalem eklemek; veri uygulamadan gelir (dönem kimliğiyle tutar eşlemesi).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; metinler, örnek veriler, renk ve süre değerleri alınmadı.
