# Tarif: scroll-story (kaydırmayla ilerleyen ürün anlatısı)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir ürünü dört adımda anlatan tanıtım bölümü. Sol/yan taraftaki metni kaydırdıkça sabit duran ürün görünümü adımdan adıma değişir. Örnek akış: mesajlar gelir, temaya göre ayrışır, bir eğilim çizgisine katlanır, bir paylaşım sayfasıyla biter. Adım sekmeleri ilerlemeyi gösterir.

## Hangi aile projesinde ne için (tahmin)

- Ürün tanıtım sayfalarında "nasıl çalışır" bölümü (GHS-Panel, Portföy gibi projelerin tanıtımı).
- Tek paragrafın kaydırmayla belirmesi ya da tek önce/sonra anahtarı için değil.

## Bölümler

1. **Kaydırma alanı:** kendi içinde kayan, odaklanabilir, etiketli bir görüş alanı (sayfanın kendisi değil).
2. **Adım sekmeleri:** dört sekme; etkin olan dolar, ilerlemeyi gösterir.
3. **Sabit ürün görünümü:** adıma göre değişen sahte ürün ekranı. Dar kapta metnin üstünde sabit kalır.
4. **Adım metinleri:** her adım için başlık ve kısa açıklama; etkin adım işaretli.
5. **Alt tarafta bir son adım:** bir bağlantıyı kopyalama ve bir kanala gönderme (benzetim).

## Kullanıcı ne yapar, ne olur

- **Metni kaydırır:** kaydırma konumu bir ilerleme değerine çevrilir; sekmeler dolar, sahnedeki öğeler (mesajlar, gruplar, çizgi) yay hareketiyle konumunu değiştirir, eğilim çizgisi çizilerek gelir.
- **Sekmeye basar ya da sol/sağ ok:** ilgili adımın metnine kayar.
- **Son adımda "Bağlantıyı kopyala" / "Kanala gönder":** sonuç kibar canlı bölgede duyurulur (gerçek gönderim uygulamanın işi).
- **Kaydırma ortasında hedef değişirse:** hız korunur, hareket kesintisiz devam eder.

## Durumlar

- **Adımlar:** her adımın ürün durumu önceden bellekte tutulur; kaydırmada yeniden çizilmez.
- **Genişlik:** görüş alanı yüksekliği ekran yüksekliğine göre sınırlı (yaklaşık yarım ekran ile 600 piksel arası); 700 px kap altında ürün görünümü metnin üstüne yığılır ve sabit kalır.
- **Dokunmatik:** normal kaydırma.

## Klavye ve ekran okuyucu

- Kaydırma alanı odaklanabilir ve etiketli; klavyeyle kayar.
- Adım sekmeleri sekme listesi, gezen odak; sol/sağ ok önceki-sonraki adıma götürür. Etkin adımın metni adım olarak işaretlenir.
- Ürün durumu ("gelen kutusunda yeni mesaj var") ve kopyalama/gönderme sonucu kibar canlı bölgede.

## Hareket

- Kaydırma konumu doğrudan ilerleme değerini sürer; sekme dolgusu, mesaj sıralaması ve çizgi çizimi buna bağlı. Yaylar sertlik/sönüm olarak tanımlanır, böylece kaydırma ortasında hedef değişince hız korunur.
- Kaydırma okuması pasif dinleyiciyle ve her çizim karesinde en çok bir kez.
- **"Hareketi azalt" açıkken:** adımlara yumuşak kayma yerine atlar, yaylar kısa solmaya çevrilir.

## Görseller

Gerçek görsel yok; sahte ürün ekranı bileşenle çizilir (liste satırları, avatar yer tutucuları, çizgi grafik). Yazım oturumu kendi örnek verisini ve avatar yer tutucularını kullanır.

## Para ve kart alanları

Para ve kart alanı yok. Eğilim grafiğinde sayılar adet; `money.fmtDecimalGrouped`.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Yeni mesaj sayısı, haftalık sayı | adet | `money.fmtDecimalGrouped` + `animated-counter` |
| Değişim yüzdesi | yüzde | `money.percent` |

## Kurulacak SNN-UI parçaları

Katalogdan: `tabs`, `avatar`, `badge`, `line-chart` ya da `sparkline`, `animated-counter`, `button`, `dropdown-menu`.

Katalogda olmayan:
- `scroll-progress` (kaydırma konumundan ilerleme değeri, adım sekmeleri)
- `scroll-story` kabuğu (sabit sahne + adım metinleri)

## Türkçe ekran metinleri (öneri)

Metinler uygulamaya özgü örnekle doldurulur; sabit olanlar: "Adım {n}/{toplam}", "Bağlantıyı kopyala", "Kanala gönder", "Bağlantı kopyalandı", "Gönderildi".

## Kapsam dışı (bilerek)

- Tek paragraf kaydırma vurgusu, tek önce/sonra anahtarı, statik özellik görseli.
- Gerçek paylaşım ve kopyalama sonucu dışa bağlıdır.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
