# Tarif: testimonial-stage (portreli müşteri görüşleri sahnesi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Birkaç kişinin görüşünü, kişinin portresi öne çıkacak biçimde gösterir. Üstte kişi sekmeleri, altta seçili kişinin portresi ve alıntısı vardır. Kendiliğinden dönmez; yalnız kullanıcı sekmeye ya da oka basınca değişir.

## Hangi aile projesinde ne için (tahmin)

- Tanıtım sayfalarında müşteri ya da kullanıcı görüşü bölümü; kişinin yüzünün önemli olduğu yerler.
- Yalnız logo yeterliyse logo şeridi; çok sayıda kısa yorum için döner şerit; kendi ekibi için `team-showcase`.

## Bölümler

1. **Bölüm başlığı.**
2. **Kişi sekmeleri:** her kişi için küçük portre ve ad; sekme listesi, sarmalayan gezinme.
3. **Portre alanı:** seçili kişinin büyük portresi.
4. **Alıntı paneli:** alıntı metni, kişinin adı, unvanı ve şirketi; kibar canlı bölge.

## Kullanıcı ne yapar, ne olur

- **Sekmeye basar:** portre ve alıntı küçük yön kaymasıyla soluk geçişle değişir.
- **Sol/sağ ok:** önceki/sonraki kişiye geçer, listenin sonunda başa sarar, odağı yeni sekmeye taşır.
- **Otomatik oynatma yok:** yalnız kullanıcı girdisiyle değişir.
- **Seçim dışarı bildirilir** (örneğin istatistik için).

## Durumlar

- **Tek kişi:** sekme listesi gizlenebilir; yalnız alıntı kalır.
- **Genişlik:** 800 px altında sütunlar daralır; 680 altında portre alıntının üstüne yığılır; 350 altında dolgu ve alıntı yazısı küçülür.
- **Yükleniyor:** portre ve metin iskeleti.

## Klavye ve ekran okuyucu

- Kişiler `role="tablist"`, `role="tab"`, `aria-selected`; sol/sağ ok gezdirir. Alıntı paneli kibar canlı bölge.
- Portrelerin anlamlı açıklaması olur (kişi adı ve unvan).

## Hareket

- Portre ve alıntı kısa yön kaymasıyla soluk geçiş yapar.
- **"Hareketi azalt" açıkken:** kayma yok, geçişler anında.

## Görseller

Her kişi için bir portre (avatar yuvası). Yalnız seçili portre yüklenir; ilki öncelikli. Yazım oturumu yer tutucu portre kullanır. Gerçek sitede yalnız izin alınmış portre ve doğrulanmış alıntı kullanılır (uygulamanın sorumluluğu).

## Para ve kart alanları

Yok.

## Sayılar ve biçim

Ekranda biçimlenecek sayı yok.

## Kurulacak SNN-UI parçaları

Katalogdan: `avatar`, `tabs`, `button`.

Katalogda olmayan:
- `testimonial-stage` kabuğu (portre + alıntı geçişi)

## Türkçe ekran metinleri (öneri)

- Bölüm başlığı: "Ekipler ne diyor". Sekme etiketi: "{ad}, {unvan}". Canlı bölge: "{ad} görüşü gösteriliyor."

## Kapsam dışı (bilerek)

- Logo şeridi, çok yorumlu döner şerit, kendi ekibi tanıtımı, otomatik oynatma.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
