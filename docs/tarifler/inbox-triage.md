# Tarif: inbox-triage (gelen kutusu ayıklama)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Karar bekleyen mesaj ya da talep kuyruğunu hızlıca eritir. Üç klasör vardır (gelen, ertelenen, arşiv). Kullanıcı satırı yerinde açıp okur; tek tuşla arşivler, erteler ya da geri alır. Son hamle geri alınabilir.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel: destek talepleri / müşteri mesajları kuyruğu.
- SNN-Ihale-Maliyet-Teklif-Yonetimi: gelen ihale duyuruları ya da onay bekleyen işler.
- Bildirim merkezi (sistem bildirimleri) ve e-posta menüsü ayrı bileşenlerdir.

## Bölümler

1. **Başlık:** "Mesajlar", okunmamış sayısı, sağda "Yalnız okunmamışlar" süzgeç düğmesi.
2. **Klasör sekmeleri:** Gelen, Ertelenen, Arşiv; her birinde sayı. Seçili sekmenin altında kayan çizgi.
3. **Mesaj satırı:** okunmamışsa solda nokta ve kalın yazı; gönderen avatarı ve adı, konu, önizleme cümlesi, sağda zaman.
4. **Açılmış mesaj:** satırın altında yerinde açılan ayrıntı (tam metin) ve eylem düğmeleri (arşivle, ertele, geri al).
5. **Alt şerit:** kısayol ipuçları ("S ertele", "E arşivle"); klasöre göre değişir.
6. **Durum satırı:** son hamleyi söyler ("Arşivlendi") ve "Geri al" düğmesi taşır.

## Kullanıcı ne yapar, ne olur

- **Satıra basar (Enter/Boşluk):** satır yerinde açılır, okundu olur, sayaç düşer. Tekrar basınca kapanır.
- **E:** odaktaki mesajı arşivler (Arşiv klasöründe çalışmaz). **S:** erteler (yalnız Gelen'de). **U:** Gelen'e geri alır (Ertelenen ve Arşiv'de).
- **Hamleden sonra:** satır kapanıp çıkar, odak sonraki satıra geçer; liste boşalmışsa başlığa geçer. Sekme sayıları güncellenir; durum satırı hamleyi bildirir.
- **Geri al:** son hamle tersine döner, mesaj eski yerine gelir, odak o satıra döner.
- **Klasör değiştirir:** liste o klasöre geçer, çizgi kayar, durum satırı temizlenir.
- **"Yalnız okunmamışlar":** okunmuşları gizler; düğme basılı görünür.
- Erteleme süresi varsa (bugün akşam, yarın gibi) proje seçer; varsayılan: tek erteleme, belirli bir saat sorulmaz.

## Durumlar

- **Boş klasör:** her klasör için ayrı boş durum ("Gelen kutusu temiz", "Ertelenen yok", "Arşiv boş").
- **Süzgeç sonucu yok:** "Okunmamış mesaj yok" ve süzgeci kapatma bağlantısı.
- **Yükleniyor:** satır iskeletleri.
- **Hata:** hamle sunucuda başarısızsa satır geri döner, durum satırında "Taşınamadı" ve "Yeniden dene".
- **Çok uzun içerik:** konu ve önizleme tek satırda kırpılır; açılan mesaj kendi içinde kayar. Çok mesajda sayfalama.
- **Dar ekran:** satır iki satıra döner (üstte gönderen, altında konu ve önizleme; küçük avatar); alt şerit kısa ipucu verir. Çok darda okunmamış sayısı gizlenir, sekmeler sıkışır.

## Klavye ve ekran okuyucu

- Klasörler sekme listesi; sol/sağ ok klasör değiştirir; liste sekme paneli.
- Yukarı/aşağı ok satırlar arasında; Enter/Boşluk açar-kapar ve okundu yapar.
- E, S, U tek tuş kısayolları; satırlar `aria-keyshortcuts` bildirir ve kısayollar yalnız yazı alanında değilken çalışır.
- Satır `aria-expanded` ve açılan bölgeye bağlantı taşır; okunmamışlık yalnız noktayla değil, "okunmamış" adıyla da bildirilir.
- Hamleler nazik durum bölgesinde duyurulur; süzgeç düğmesi basılı durumu bildirir.
- Odak yönetimi: hamleden sonra sonraki satır, geri almada geri gelen satır.

## Hareket

- Satır açılıp kapanırken yükseklik ve saydamlık yumuşakça değişir.
- Klasör çizgisi sekmeler arasında kayar; durum satırı kısa bir yükselişle değişir.
- Çıkan satır solup yukarıdaki boşluğu kapatır.
- **"Hareketi azalt" açıkken:** yükseklik ve kayma yok, yalnız düz solma.

## Kurulacak SNN-UI parçaları

Katalogdan: `tabs` (klasörler; kayan çizgi var), `button`, `empty-state`, `skeleton`, `pagination`, `toast` (durum satırı için isteğe bağlı), `tooltip`.

Katalogda olmayan:
- `avatar`
- `badge` (sayı rozeti)
- `kbd` (kısayol tuşu etiketi)
- `message-row` (açılır satır)
- `undo-bar` (durum satırı + geri al)
- `inbox-triage` kabuğu
- Mesaj zamanı ("09.42", "Dün"): tarih/saat biçimi ABACUS'tan; bileşen biçim kodu yazmaz.

## Türkçe ekran metinleri (öneri)

- Başlık: "Mesajlar"; sayaç: "{n} okunmamış"
- Süzgeç: "Yalnız okunmamışlar"
- Klasörler: "Gelen", "Ertelenen", "Arşiv"
- Eylemler: "Arşivle", "Ertele", "Gelene geri al", "Geri al"
- Kısayol etiketleri: "S ertele", "E arşivle", "U geri al"
- Durum: "Arşivlendi.", "Ertelendi.", "Geri alındı."
- Boş: "Gelen kutusu temiz.", "Ertelenen mesaj yok.", "Arşiv boş."
- Hata: "Mesaj taşınamadı." / "Yeniden dene"

## Kapsam dışı (bilerek)

- Mesaj gönderme/yanıt yazma, klasör ağacı ve etiketler (e-posta kenar menüsü ayrı).
- Sistem bildirimleri (bildirim merkezi), kaydırarak eylem (dokunmatik liste).
- Gerçek veri servisi (proje bağlar; bileşen yalnız hamle olaylarını iletir).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede liste, sekmeler ve alt şerit görüldü; satır açma, kısayollar ve geri alma denenmedi, sayfa metnindeki davranış listesinden alındı.
