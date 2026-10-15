# Tarif: project-board (küçük proje panosu)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Az sayıda işin sabit aşamalar arasında ilerlediği küçük pano. Sürükleme yoktur: her kartta "önceki/sonraki aşamaya taşı" okları bulunur, dokunmatikte de rahat çalışır. Üstte dönem ilerleme çubuğu ve "Tümü / Benim işlerim" süzgeci.

## Hangi aile projesinde ne için (tahmin)

- SNN-Proje-ve-Nakit-Akis-Yonetimi: proje iş takibi (planlandı, sürüyor, kontrol, bitti).
- SNN-Ihale-Maliyet-Teklif-Yonetimi: teklif hazırlık aşamaları.
- Sürükle-bırak, sınır (WIP) ve ayrıntı çekmecesi isteyen büyük pano `kanban-board` tarifindedir.

## Bölümler

1. **Başlık:** pano adı ve "6 işten 1'i bu dönem bitti" gibi ilerleme cümlesi; altında ince ilerleme çubuğu.
2. **Katılımcı avatarları** ve **süzgeç düğmeleri** ("Tümü", "Benim işlerim"; seçili olanın arkasında kayan vurgu).
3. **"Görev ekle" düğmesi.**
4. **Dört sütun:** Planlandı, Sürüyor, Kontrolde, Bitti; başlıkta iş sayısı.
5. **Kart:** üstte etiket (hangi iş grubu) ve sağda gün (bugün vurgulu), başlık, altta sahibin avatarı, yorum sayısı ve iki ok düğmesi (sola/sağa taşı). İlk sütunda sol ok, son sütunda sağ ok pasif.

## Kullanıcı ne yapar, ne olur

- **Sağ/sol ok:** kart komşu sütuna uçar; sayılar ve ilerleme çubuğu güncellenir; taşıma duyurulur; uygulamaya "görev, yeni aşama" iletilir. Bitti sütununa taşıyınca ilerleme artar.
- **Süzgeç değiştirir:** "Benim işlerim" yalnız kendi atamalarını bırakır; kartlar boşluğu kapatır.
- **Görev ekle:** Planlandı sütununun başına yeni kart gelir (küçük ölçekten büyüyerek); başlığı hemen yazılabilir (örnekte kendiliğinden taslak başlık; bizde boş başlık alanı açılır).
- Sürükleme yok; yalnız düğmeler.

## Durumlar

- **Boş sütun:** "Bu aşamada iş yok" soluk metni.
- **Hiç iş yok:** boş durum: "Henüz iş eklenmedi", "Görev ekle".
- **Süzgeç sonucu yok:** "Size atanmış iş yok".
- **Yükleniyor:** sütun başına iskelet kartlar.
- **Hata:** taşıma başarısızsa kart eski sütuna döner, sütun altında "Taşınamadı" ve "Yeniden dene".
- **Çok uzun içerik:** kart başlığı iki satıra kırpılır, tam başlık ipucuyla. Çok kartta sütunlar kendi içinde kayar; onlarca kartta bırakın (yüzlerce için sürüklemeli, sanallaştırmalı pano gerekir).
- **Dar ekran:** dört sütun için geniş yer gerekir; dar alanda pano yana kayar ve sütunlar yakınlığa göre yerine oturur. Telefonda her sütun ekranın büyük kısmını kaplar, katılımcı avatarları gizlenir; çok darda "Görev ekle" yalnız simge olur.

## Klavye ve ekran okuyucu

- Her taşıma düğmesinin adı "{görev} görevini {aşama} aşamasına taşı".
- Sütunlar "{aşama}, {n} görev" etiketli bölgelerdir; süzgeç düğmeleri basılı durumu bildirir.
- Taşımalar görünmez nazik durum bölgesinde duyurulur.
- Taşımadan sonra odak, taşınan kartın yeni konumundaki düğmeye gider (düğme kaybolursa kartın kendisine).
- Bugün/yarın bilgisi yalnız renkle değil, yazıyla verilir.

## Hareket

- Kartlar sütunlar arasında yumuşak yayla uçar; yeni kart büyüyerek gelir.
- Süzgeç vurgusu iki düğme arasında kayar; ilerleme çubuğu yatayda büyür.
- **"Hareketi azalt" açıkken:** uçuş ve yay yok; kartlar yerinde değişir.

## Kurulacak SNN-UI parçaları

Katalogdan: `button`, `empty-state`, `skeleton`, `tooltip`, `toast`.

Katalogda olmayan:
- `avatar` ve `avatar-group`
- `progress` (ilerleme çubuğu)
- `filter-pills` (kayan vurgulu iki seçenekli süzgeç; `segmented-control` ile ortak)
- `board-card` ve `project-board` kabuğu
- Gün etiketleri ("bugün", "Per") ve sayılar ABACUS biçimiyle.

## Türkçe ekran metinleri (öneri)

- Başlık: "{pano adı}"; ilerleme: "Bu dönem {n} işten {m}'i bitti"
- Süzgeç: "Tümü", "Benim işlerim"
- Düğme: "Görev ekle", "Önceki aşamaya taşı", "Sonraki aşamaya taşı"
- Sütunlar: "Planlandı", "Sürüyor", "Kontrolde", "Bitti"
- Boş: "Bu aşamada iş yok.", "Henüz iş eklenmedi.", "Size atanmış iş yok."
- Duyuru: "{görev}, {aşama} aşamasına taşındı"
- Hata: "Taşınamadı." / "Yeniden dene"

## Kapsam dışı (bilerek)

- Sürükle-bırak, sınır (WIP) uyarıları, sıra sürükleme, ayrıntı çekmecesi (`kanban-board`).
- Kart düzenleme ve yorum yazma ekranı.
- Aşama sayısı ve adlarını kullanıcının belirlemesi (şimdilik dört sabit aşama; proje adlarını verebilir).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede pano, kartlar ve ok düğmeleri görüldü; taşıma ve süzgeç denenmedi, sayfa metnindeki davranış listesinden alındı.
