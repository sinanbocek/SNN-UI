# Tarif: skeleton-morph (iskelet gerçek içeriğe dönüşür)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Yükleniyor iskeletinin gerçek içeriğe sert bir geçişle değil, yerinde büyüyerek dönüştüğü bölgedir. İçerik parça parça (blok blok) okuma sırasıyla belirir; her iskelet kutusu içeriğin ölçüsüne uzar ve içerik netleşerek yerine oturur. Kartın yüksekliği de içerik gelince yumuşakça değişir. Yükleniyora geri dönmek anında olur.

## Hangi aile projesinde ne için (tahmin)

- Profil kartı, bildirim akışı, kısa liste gibi birkaç saniyede yüklenen ve düzeni önceden bilinen alanlar (GHS-Panel, Portföy yönetimi kartları).
- Yüzlerce satırlık uzun liste için değil (`skeleton`); birkaç saniyeden uzun yüklemede ilerleme göstergesi; yüklenecek düzen önceden bilinmiyorsa değil.

## Bölümler

1. **Bölge (kabuk):** yükleniyor durumunu taşıyan kap; kendi çerçevesi ve kenarlığı vardır, yükseklik değişince kenarlık sıçramaz.
2. **Blok:** düzenin her görünen parçasını sarar (avatar, başlık, paragraf, düğme...). Yüklenirken ölçü eşleşmiş bir iskelet gösterir, bitince içeriğin kendisini.
3. **İskelet türleri:** dikdörtgen (köşe yuvarlaklığı seçilebilir), daire (avatar yeri), metin satırları (çok satırda son satır daha kısa).
4. **Görünmez durum metni:** yükleniyor sırasında ekran okuyucu için.

## Kullanıcı ne yapar, ne olur

Etkileşim yok; durumu uygulama verir.

- **Yükleniyor:** bloklar iskelet olarak durur ve hafifçe nabız gibi atar; kabuk "meşgul" işaretlidir.
- **Yükleme biter:** bloklar sırayla, okuma sırasıyla çözülür; her iskelet kutusu içeriğin ölçüsüne uzanıp solarken içerik bulanıklıktan netleşir. Hiçbir blok yerinden oynayıp başka yere gitmez; kabuk yeni yüksekliğe yumuşakça gelir.
- **Yeniden yükleniyora dönülürse:** anında iskelete geçer; hızlı yenilemelerde bir blok yarıda takılı kalmaz.
- Sarılmamış bir parça animasyonsuz, bir anda değişir; bu yüzden görünen her parça sarılır.

## Durumlar

- **Yükleniyor / yüklendi** (iki durum); yeniden yüklemeyle döngü tekrarlanabilir.
- **Ölçü eşleşmesi:** iskelet, gerçek içerikle aynı boyda olmalı; metinde satır yüksekliği ve satır sayısı iskelete de verilir; genişlik tipik metin genişliğine yakın seçilir, yüzde de verilebilir.
- **Hata:** bileşenin işi değil; uygulama hata ekranını ayrıca gösterir (`empty-state` ile).
- **Genişlik:** içerik yüklenince doğal akar; her genişlikte yeniden dizilir, sabit ölçü yok.

## Klavye ve ekran okuyucu

- Kök yüklenirken `aria-busy`; içinde görünmez durum metni ("Yükleniyor", değiştirilebilir).
- İskelet şekilleri ekran okuyucudan gizlidir; içerik hazır olana dek hiç çizilmez, yarım içerik okunmaz.
- Okuma ve odak sırası yükleme öncesi ve sonrası aynıdır.

## Hareket

- Bloklar belge sırasıyla, aralarında küçük bir gecikmeyle çözülür; gecikme proje tarafından ayarlanabilir.
- İskelet kutusu içeriğin ölçüsüne sönümlü yayla uzar ve solar; içerik hafif bulanıklıktan netleşir.
- Kabuk yüksekliği yumuşakça değişir; kenarlık sıçramaz.
- Yükleniyorken sakin bir parlaklık nabzı vardır; çözülünce durur.
- Her blok yalnız çözüldüğü anda bir kez ölçülür; uzun kartlarda ucuzdur.
- **"Hareketi azalt" açıkken:** nabız ve uzama yok; iskelet ile içerik arasında kısa bir çapraz geçiş.

## Görseller

Gerçek görsel yok; avatar yeri daire iskelettir. Renkler SNN-UI değişkenlerinden (iskelet için sakin gri-mavi); amber/turuncu yok.

## Sayılar ve biçim

Bileşenin kendi sayısı yok; içerideki sayılar uygulamanın verisidir ve ABACUS biçimleriyle yazılır.

## Kurulacak SNN-UI parçaları

Katalogdan: `skeleton` (basit iskelet için; bu bileşen onun hareketli sürümüdür), `avatar`.

Katalogda olmayan:
- `skeleton-morph` (kabuk) ve `morph-block` (blok)

## Türkçe ekran metinleri (öneri)

- Görünmez durum metni: "Yükleniyor"
- Kullanım örneği: "Profil yükleniyor", "Ödemeler yükleniyor"

## Kapsam dışı (bilerek)

- Yüzlerce satırlık liste, düzeni önceden bilinmeyen içerik, hata ve boş durum gösterimi.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Hareketin ayrıntıları ve ölçüleri (süreler, hızlar) bilerek yazılmadı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
