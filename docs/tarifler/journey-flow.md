# Tarif: journey-flow (kullanıcı yolculuğu akışı)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Kullanıcıların bir sürecin aşamaları boyunca (ziyaret, kayıt, kurulum, ilk hafta, plan) nereye gittiğini akış şemasıyla gösterir: her aşamada hem devam edenler hem de düşenler ayrı kollar olarak görünür. Bir kanal seçici şeritleri kanala göre yeniden biçimler. Bir adıma gelince o adımdan geçen grup baştan sona izlenir; bir adıma basınca yan panelde kimlerin nereden geldiği ve nereye gittiği yazılır. Aynı sayıları gösteren bir tablo da açılabilir. `sankey-flow`'un tek amaçlı, hazır panelli uygulamasıdır.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel: ziyaretten kayda, siparişe giden yol; kanala göre (kaynak) ayrım.
- SNN-Games: oyuncu hunisi (indirme, ilk oyun, ilk satın alma).
- SNN-Ihale-Maliyet-Teklif-Yonetimi: ihale takibi aşamaları (ilan, inceleme, teklif, sonuç) arasındaki geçişler ve düşenler.
- Doğrusal ve dallanmayan akış için `funnel-chart`; elde tutma için `cohort-retention`.

## Bölümler

1. **Başlık alanı:** başlık, büyük toplam ("16.965"; döner) ve alt cümle ("Ağustos ayında ziyaret, ilk oturumdan plana kadar izlendi"); sağda kanal seçici ("Tüm kullanıcılar", kanallar).
2. **Şema:** beş sütun (aşama adları altta: örn. "Ziyaret", "Hesap", "Kurulum", "İlk hafta", "Plan"); her adım bir düğüm (ad, sayı, ilk aşamaya payı); devam kolları kaynağın renginde, düşenler gri; şeritler yumuşak eğri.
3. **Yan ya da alt panel:** seçili adımın adı, büyük sayı ve açıklaması ("ziyaretçilerin yüzde 6'sı ücretli plana geçti"); "En büyük düşüşler" (adım, sayı, yüzde); "Kurulumdan sonra plan" gibi dağılım satırları. Seçim yokken "Nereden geldiğini ve nereye gittiğini görmek için bir adım seçin" yazar.
4. **"Akış tablosu" anahtarı:** aynı sayıları tablo olarak gösterir.

## Kullanıcı ne yapar, ne olur

- **Kanal seçer:** tüm şeritlerin kalınlığı yeni kanala göre yayla değişir; sayılar bir an sonra döner.
- **Adımın ya da şeridin üstüne gelir:** o adımdan geçen grup baştan sona vurgulanır, kalanlar soluklaşır; ipucu kutusu adım ve sayıları söyler.
- **Adıma basar/Enter:** adım sabitlenir; yan panel o adımın girenlerini ve çıkanlarını yazar, rakamlar yerinde döner. Esc seçimi kaldırır.
- **Tabloyu açar:** akışın tüm sayıları satır satır görünür.
- **Klavyeyle:** kanal seçicide oklar kanal değiştirir; adımlarda yukarı/aşağı aynı sütunda gezer, sol/sağ komşu aşamanın en yakın adımına geçer; Home/End ilk/son adım.

## Durumlar

- **Kanalın verisi yok:** "Bu kanal için veri yok".
- **Düşen kolu çok küçük:** şerit çok ince kalır; gerçek sayı etikette görülür.
- **Çok aşama ve düğüm:** onun üstünde şema kalabalıklaşır ve geçiş yavaşlar; bu bileşen beş aşama, yaklaşık on üç düğüm için tasarlanmıştır.
- **Yükleniyor:** gri şema iskeleti. **Hata:** "Yüklenemedi", "Yeniden dene".
- **Geniş (yaklaşık 860 px üstü):** panel şemanın yanında dar sütunda; **daha dar:** şemanın altında.
- **560 px altı:** kanal seçici tam genişlik, dolgu daralır; **480 px altı** adım etiketleri küçülür. Şema, ölçeklenmek yerine genişliğe göre yeniden yerleşir.

## Klavye ve ekran okuyucu

- Kanal seçici radyo grubudur; adımlar, gezen odaklı bir araç çubuğundadır (`aria-pressed`).
- Şema görsel tanımlıdır ve metin özeti taşır; her adım düğmesinin adı kullanıcı sayısını ve ziyaretçiye payını içerir.
- Kanal değişince "{n} ziyaret, {n} ücretli plan" kibar canlı bölgede duyurulur.
- Yan panel etiketli ayrı bölgedir; tablo anahtarı `aria-expanded` taşır.

## Hareket

- Şeritler kanal değişiminde bir kontrolden biraz yavaş yayla genişlik değiştirir; sayılar bir an sonra, sıçramadan değişir.
- İzleme dışındakini soluklaştırır; panel metinleri kısa yükselmeyle yerleşir, rakamlar yerinde döner.
- **"Hareketi azalt" açıkken:** geçişler anında, yalnız saydamlık solması.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Aşama sayıları (ziyaret, kayıt, plan) | adet | `money.fmtDecimalGrouped` |
| Aşamanın ilk aşamaya payı | yüzde | `money.percent` |
| Düşüş yüzdesi, plana geçiş oranı | yüzde (bir ondalık) | `money.percent` |
| Toplam (başlıkta) | adet | `money.fmtDecimalGrouped` (döner) |
| Ay adı (alt metin) | tarih | `date.monthName` |
| Gelir (satış sürecinde varsa) | para, TRY | `money.format` / `money.compactMajor` |

## Kurulacak SNN-UI parçaları

Katalogdan: `streamgraph`/`treemap` (kardeş akış parçaları, ortak renk dizisi), `animated-counter`, `tooltip`, `skeleton`, `empty-state`.

Katalogda olmayan:
- `sankey-flow` (önce o; bu bileşen onun üstüne kurulur: kanal seçici, sabitlenen adım, yan panel, tablo anahtarı)
- `segmented-control` (kanal seçici), `switch`/`disclosure` (tablo anahtarı)
- `journey-flow` kabuğu

## Türkçe ekran metinleri (öneri)

- Başlık: "Ücretli plana giden yollar"; alt: "{ay} ayındaki {n} ziyaret, ilk oturumdan plana kadar izlendi"
- Kanallar: "Tüm kullanıcılar", "Organik", "Reklam", "Yönlendirme"
- Panel: "En büyük düşüşler", "Kurulumdan sonra plan"; boş: "Nereden gelip nereye gittiklerini görmek için bir adım seçin."
- Anahtar: "Akış tablosu"; boş: "Bu kanal için veri yok."

## Kapsam dışı (bilerek)

- Kanal ya da adım sayısını kullanıcının eklemesi.
- Zaman içinde elde tutma (`cohort-retention`), doğrusal huni (`funnel-chart`).
- Veri yükleme: düğümler, bağlantı sayıları ve kanal başına sayılar uygulamadan gelir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; kanal ve adım seçimi denenmedi, davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
