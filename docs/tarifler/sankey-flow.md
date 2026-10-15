# Tarif: sankey-flow (akış şeması)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Bir toplamın aşamalar boyunca nasıl bölündüğünü ve yeniden birleştiğini, düğümler arasında kalınlığı değere orantılı şeritlerle gösterir. Bir düğüme ya da şeride gelince o payın baştan sona tüm yolu vurgulanır. Şeritlerin üzerinde yavaşça akan ince noktalar yönü hissettirir.

## Hangi aile projesinde ne için (tahmin)

- SNN-Proje-ve-Nakit-Akis-Yonetimi: para kaynağından gider kalemlerine nakit akışı (gelir türü → hesap → gider grubu).
- GHS-Panel: müşteri adayı kaynağından satışa giden yol.
- SNN-Portfoy-Yonetimi: yatırımın varlık sınıfı → ürün → sonuç dağılımı.
- Doğrusal ve dallanmayan hunide `funnel-chart`; katı ağaç hiyerarşisinde `treemap` daha doğrudur.

## Bölümler

1. **Başlık alanı:** grafik adı, bir satır açıklama, isteğe bağlı dönem seçici (iki dönem arasında veri değişimi için).
2. **Sütun başlıkları:** düğüm sütunlarının üstünde aşama adları ("Kaynak", "Aşama" gibi); sığmazsa gizlenir.
3. **Düğümler:** her sütunda alt alta dikdörtgenler; yanında ad ve değer.
4. **Şeritler:** kaynaktan hedefe yumuşak eğriler; rengi kaynağın rengidir.
5. **"Akış" anahtarı:** grafiğin altında, şeritlerdeki noktaları açar/kapatır.
6. **Gizli tablo:** her şerit için kaynak, hedef, değer ve kaynağa göre pay (ekran okuyucu içindir).

## Kullanıcı ne yapar, ne olur

- **Düğümün üstüne gelir:** o düğümden geçen tüm şeritler baştan sona renkle dolar, kalanlar soluklaşır. Ipucu kutusunda düğüm adı, değeri ve toplama göre payı yazar.
- **Şeridin üstüne gelir:** yalnız o akış ve bağlı olduğu yol vurgulanır; ipucunda "kaynak → hedef", değer ve kaynağın yüzde kaçı olduğu yazar.
- **"Akış" anahtarını kapatır:** noktalar durur, şeritler düz kalır.
- **Dönem değiştirir:** düğümler ve şeritler yeni değerlere kayarak geçer.
- **Klavyeyle:** Tab grafiğe girer ve ilk düğümü seçer; yukarı/aşağı aynı sütunda gezer; sol/sağ komşu sütunun en yakın düğümüne geçer; Home/End ilk/son sütun; Esc vurguyu temizler.

## Durumlar

- **Pozitif akış yok:** "Henüz akış yok" boş durumu.
- **Çok düğüm:** bir sütunda yaklaşık 12'den fazla düğümde küçük şeritler okunmaz; uygulama küçükleri "Diğer" yapar.
- **Düğüm değeri:** gelenle gidenin büyüğü kadar yükseklik alır; toplamlar uyuşmazsa şerit uyuşmayan yanı boş bırakır.
- **Yükleniyor:** gri düğüm ve şerit iskeleti.
- **Dar ekran (yaklaşık 420 px altı):** şema dikeye döner (aşamalar yukarıdan aşağı); sütun başlıkları gizlenir; yükseklik büyür.
- **Dokunmatik:** basılı tutup sürükleme düğümleri okur; sayfa dikey kaydırılabilir.

## Klavye ve ekran okuyucu

- Grafik tek odaklanabilir gruptur; seçili düğüm değeri, toplamdaki payı ve nereye aktığıyla duyurulur.
- Görsel öğeler ekran okuyucudan gizlenir; her akışı sayıyla veren gizli tablo okunur.
- Renk tek ipucu değildir: her düğümde ad ve değer yazılıdır.

## Hareket

- Şeritler ilk görünüşte soldan sağa açılır; noktalar şerit boyunca ilerler (az sayıda, yavaş).
- Vurgu geçişi kısa solmadır; veri değişiminde düğüm yükseklikleri ve şerit kalınlıkları yayla yeni hâline gider.
- **"Hareketi azalt" açıkken:** noktalar çizilmez, geçişler anında yapılır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Düğüm ve şerit değeri (kişi, adet) | adet | `money.fmtDecimalGrouped` |
| Düğüm ve şerit değeri (tutar) | para, TRY | `money.format`; düğüm yanında `money.compactMajor` |
| "Kaynağın yüzde kaçı" | yüzde | `money.percent` (oran hesabı `math.percentChange` değil, düz oran) |
| Toplam ("n kayıttan %x") | yüzde | `money.percent` |
| Dönem başlığı (isteğe bağlı) | tarih | `date.format`, `date.monthName` |

Her sayı Türkçe ayraçlarla ABACUS'tan gelir; `Intl` yok.

## Kurulacak SNN-UI parçaları

Katalogdan: `streamgraph` ve `treemap` (kardeş akış/oran parçaları, ortak renk dizisi), `animated-counter` ya da `slot-text`, `tooltip`, `empty-state`, `skeleton`.

Katalogda olmayan:
- `sankey-flow` kabuğu (düğüm yerleşimi, eğri şerit çizimi, akış noktaları için tuval katmanı)
- `segmented-control` (dönem seçici), `switch` (Akış anahtarı) — başka tariflerde de gerekir

## Türkçe ekran metinleri (öneri)

- Anahtar: "Akış"
- İpucu: "{kaynak} → {hedef}: {değer} {birim} (kaynağın %{pay}'i)"
- Boş: "Henüz akış yok."
- Ekran okuyucu: "akış şeması, {ad}: {değer}, toplamın %{pay}'i, sonra {hedef}'e akıyor"

## Kapsam dışı (bilerek)

- Düğüm sürükleme, elle yeniden sıralama.
- Döngülü (geri dönen) akışlar.
- Şerit sağ tıklama menüsü, dışa aktarma.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemedeki ve sayfa metnindeki davranış açıklaması okundu; metinler, örnek veriler, renk ve süre değerleri alınmadı.
