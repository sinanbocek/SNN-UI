# Tarif: wallet-stack (kart destesi, seçilen kartın hareketleri)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Birkaç ödeme kartını ya da üyelik kartını üst üste duran bir deste olarak gösterir. Fareyle üstüne gelince deste açılır; sürükleyerek ya da oklarla kartlar arasında dönülür; bir karta basınca kart öne çıkıp bakiyesini ve son hareketlerini gösterir. Bu yalnızca bir arayüzdür: gerçek kart numarası tutmaz ve gerçek ödeme yapmaz.

## Hangi aile projesinde ne için (tahmin)

- Kart, bilet ya da üyelik gösteren ekranlar (Portföy, nakit akışı gibi bir projede hesap kartları).
- Çok sayıda hesap için düz liste; genel kaydırılan içerik için kart destesi; tek kartın büyümesi için `expandable-card`.

## Bölümler

1. **Başlık ve sayaç:** "Kartlarım", "1 / 4"; bir kart açıkken sayaç yerine "Tüm kartlar" düğmesi.
2. **Deste:** kartlar üst üste, öndeki seçili; yalnız öndeki kart sekme sırasında.
3. **Kart yüzü:** veren kurum, ürün adı, numaranın yalnız son dört hanesi (kalanı nokta), kart sahibi, son kullanma, bir ağ işareti. Her kartın malzeme görünümü farklı olabilir (bir seçenek olarak: metal, siyah, cam, düz renk).
4. **Açık kart görünümü:** kartın üstte durduğu, altında bakiye (etiketli) ve üç son hareketin (satıcı, ayrıntı, tutar) göründüğü alan.

## Kullanıcı ne yapar, ne olur

- **Deste üstüne gelir (fare):** kartlar yukarı doğru açılır, üstüne gelinen kart öne yükselir. Öndeki kart imleci hafifçe izler, üstünde bir parlama gezer; telefonda cihaz eğimi izlenir.
- **Aşağı/yukarı sürükler ya da oklar:** bir sonraki/önceki kart öne gelir (Aşağı/Sağ ileri, Yukarı/Sol geri, Home/End ilk-son). Hızlı kaydırma bir kart ilerletir, uçlarda esner.
- **Karta basar (Enter/Space):** kart yukarı çıkar, diğerleri altta toplanır; bakiye sayarak gelir, üç hareket sırayla belirir.
- **Açık kartı aşağı çeker, Escape ya da "Tüm kartlar":** kart desteye geri döner, odak karta iner.
- **Kart açıkken oklar:** açık kartı değiştirir.

## Durumlar

- **Hareket yok:** "Henüz hareket yok".
- **Dokunmatik:** dikey sürükleme kartları döndürür, yatay sürükleme sayfayı bozmaz; açık kart aşağı çekilerek kapanır.
- **Genişlik:** deste genişliği kapla ölçeklenir, kart oranı sabit, tüm yazılar karta göre ölçeklenir; deste yüksekliği karta uyar.
- **Aşırı kart sayısı:** her kart çizildiğinden birkaç kart ile sınırlı tutulur.

## Klavye ve ekran okuyucu

- Deste etiketli gruptur, klavye ipucu tanımlıdır. Yalnız öndeki kart sekme sırasındadır (gezen odak); her kart "{kurum}, {ürün}, son dört hane {xxxx}, {n}/{toplam}, bakiye" diye okunur; `aria-expanded`.
- Maskeli rakamlar ve süs çizimleri ekran okuyucudan gizli; yalnız son dört hane okunur.
- Etkinlik alanı kart açılana dek etkileşime kapalı.
- Dönme ve açma kibar canlı bölgede; geri dönünce odak karta gelir.

## Hareket

- Her kartın konumu "deste konumu, açıklık, açılma" üç sürekli değerin tek fonksiyonudur; yaylar, sürükleme ve kesilmeler hep aynı biçimi sürer. Kartların üst üste sırası hiç değişmez, bir kart ötekinin üstüne fırlamaz.
- Açılma taşmasız yayla; sürüklemede ön kart parmağı bire bir izler, bırakınca momentumla en yakın karta oturur; uçlarda esner.
- Seçilince kart tek sönümlü yayla üste çıkar; bakiye sayar, hareketler sırayla gelir.
- Yalnız konum ve saydamlık hareket eder; gölge ve parlama önceden çizilir.
- **"Hareketi azalt" açıkken:** yolculuk, eğim ve parlama yok; durumlar anında.

## Görseller

Gerçek görsel yok; kart yüzleri bileşenle çizilir. İsteğe bağlı kart arka planı resmi ve hareket satırında simge ya da kişi avatarı. Yazım oturumu kendi kart yüzlerini ve yer tutucu simgeleri kullanır. Ağ işareti kurgusal olmalı; gerçek marka işareti konmaz.

## Para ve kart alanları

Bu bileşen **görünüm**dür; kart girişi alanı yok. **Gerçek kart numarası hiçbir yerde tutulmaz veya gösterilmez; yalnız son dört hane gösterilir.** Bakiye ve hareket tutarları TRY, `money` ile, kuruş tamsayısıyla; çıkan tutar eksi. Kart numarası, son kullanma, CVC girişi gereken ekran kurulursa `giris-alanlari-standardi.md` (yazarken süzme, kaydederken doğrulama) ve ABACUS `mask` / `validate` kullanılır; ancak bunlar bu bileşenin parçası değildir.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Bakiye | para, TRY | `money.format` + `animated-counter` |
| Hareket tutarı | para, TRY | `money.format`, işaretli |
| Son dört hane | metin | olduğu gibi (`mask` ile maskeli gösterim) |
| Sıra sayacı | adet | `money.fmtDecimalGrouped` |

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `button`, `avatar`.

Katalogda olmayan:
- `card-stack` (sürüklenebilir, fan açılımlı deste)
- `wallet-stack` kabuğu (açık kart + hareket listesi)

## Türkçe ekran metinleri (öneri)

- "Kartlarım", "{n} / {toplam}", "Tüm kartlar", "Son kullanma", "Kullanılabilir", "Son hareketler"
- İpucu: "Oklarla kart değiştirin. Enter kartı açar, Escape geri koyar."

## Kapsam dışı (bilerek)

- Kart ekleme/silme, gerçek ödeme, kart numarasının tamamı, genel kaydırılan kart destesi, çok sayıda hesap listesi.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi; kart alanı yok, kart numarası yazılmadı. Kartların ayırt edici görsel imzası ölçüyle tarif edilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
