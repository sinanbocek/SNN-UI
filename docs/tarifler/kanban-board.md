# Tarif: kanban-board (sürükle-bırak iş panosu)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Ekibin iş ya da süreç kartlarını sütunlar (aşamalar) arasında fiziksel bir his veren sürükle-bırakla taşıdığı pano. Kaldırılan kart imleci izler, hızla hafifçe yatar; bırakılacağı yerde bir boşluk açılır. Kişiye göre şeritlere ayrılabilir, sütunlara eşzamanlı iş sınırı konabilir, kart ayrıntısı yan çekmecede açılır.

## Hangi aile projesinde ne için (tahmin)

- SNN-Proje-ve-Nakit-Akis-Yonetimi: iş/görev panosu.
- SNN-Ihale-Maliyet-Teklif-Yonetimi: teklif hazırlık hattı (sıralama önemli).
- GHS-Panel: müşteri/satış hattı.
- Az sayıda iş için düğmeli, sürüklemesiz `project-board` yeter.

## Bölümler

1. **Başlık satırı:** pano adı, toplam kart sayısı (yuvarlanan rakamlarla) ve "Durum / Şerit" görünüm seçici (durum sütunları ya da kişiye göre şeritler).
2. **Sütun:** başlık, kart sayısı; sınırı varsa "3/3" biçimi (dolunca vurgulu), sağda "ekle" düğmesi.
3. **Kart:** kimlik kodu, etiket (renkli nokta), başlık, bitiş günü, kontrol listesi ilerlemesi ("2/4"), puan, sahibin avatarı.
4. **Sütun altında "Kart ekle"** satırı: yerinde küçük form açar.
5. **Şerit görünümü:** her kişi için bir yatay şerit; içinde aynı sütunlar.
6. **Kaldırılmış kart:** imleci izler, eğimlidir; arkasında bırakma boşluğu.
7. **Ayrıntı çekmecesi:** karta basınca yandan açılır; başlık, atanan, bitiş, etiket, puan, kontrol listesi düzenlenir.

## Kullanıcı ne yapar, ne olur

- **Kartı basılı tutup sürükler:** kart tutulduğu noktadan imleci izler, hızına göre yatar. Komşular boşluk açmak için kayar. Pano kenarlarında iken otomatik kayar (iki yönde).
- **Bırakır:** kart boşluğa yaylanarak oturur; yeni sıra uygulamaya iletilir (tüm kartların sıralı listesi). Sütunlardaki sayılar anlık güncellenir.
- **Sınırı aşan sütun:** sayaç vurgulanır ve yazıyla da bildirilir ("sınır aşıldı"); taşıma engellenmez (proje isterse engeller).
- **Karta basar (Enter):** ayrıntı çekmecesi açılır; değişiklikler kartı günceller, kontrol maddesi işaretlenince ilerleme güncellenir.
- **"Kart ekle":** sütun sonunda başlık alanı açılır; Enter kaydeder, kart mevcut kullanıcıya atanır.
- **Görünümü "Şerit" yapar:** kartlar uçarak kendi kişi şeridine gider; "Durum"a dönünce geri.
- **Klavyeyle:** Boşluk kartı kaldırır; yukarı/aşağı ok aynı sütunda, sol/sağ komşu sütunda yer değiştirir; Shift+yukarı/aşağı komşu şeride; Boşluk/Enter bırakır; Esc iptal eder ve kartı geri koyar.
- **Dokunmatik:** kısa basış sonrası sürükleme başlar; kaydırma pano kaydırması olarak kalır.

## Durumlar

- **Boş sütun:** soluk "Bu sütunda kart yok" alanı; sürüklerken bırakma bölgesi olarak vurgulanır.
- **Hiç kart yok:** boş durum ve "Kart ekle".
- **Yükleniyor:** iskelet sütun ve kartlar.
- **Hata:** kayıt başarısızsa kart eski yerine döner, "Kaydedilemedi" ve "Yeniden dene".
- **Çok uzun içerik:** başlık iki-üç satıra kırpılır; sütun kendi içinde kayar. Birkaç yüz karta kadar rahat; sonrası sanallaştırma/sayfalama.
- **Dar ekran:** sütunların asgari okunur genişliği vardır; pano yana kayar ve sütunlara yakınlıkla oturur. Ayrıntı çekmecesi panonun tamamını kaplar.
- **Sınır dolu sütuna bırakma:** uyarı gösterilir (varsayılan: izin verir, uyarır).

## Klavye ve ekran okuyucu

- Kartlar odaklanabilir düğmedir; "sürüklenebilir" rol açıklaması ve başlık, kimlik, atanan içeren adı vardır.
- Her kaldırma, taşıma, bırakma **atılgan (assertive) canlı bölgede** sütun ve sıra ile duyurulur ("{kart} {sütun}, {n}. sırada").
- Ayrıntı çekmecesi modal penceredir: odak içeri girer, Tab içeride döner, Esc kapatır, odak karta döner.
- Eşzamanlı iş sınırı yalnız renkle değil, metinle bildirilir.

## Hareket

- Kaldırılan kart imleç hareket değerlerini izler, hafifçe yükselir, yatay hıza göre yatar (yay).
- Komşular yerleşim yayıyla kayar; bırakınca kart, boşluğun canlı konumunu kovalayan küçük bir yayla oturur ve fırlatma hızını taşır.
- Şerit görünümüne geçerken tüm kartlar ortak kimliklerle yeni yerlerine uçar.
- **"Hareketi azalt" açıkken:** eğim ve uçuş yok; bırakılan kart anında yerine oturur.

## Kurulacak SNN-UI parçaları

Katalogdan: `button`, `checkbox` (kontrol listesi), `dialog` (çekmece için temel), `input`, `select` (atanan), `empty-state`, `skeleton`, `toast`, `tooltip`.

Katalogda olmayan:
- `avatar`, `badge`/etiket
- `segmented-control` (Durum/Şerit)
- `drag-engine` (sürükle-bırak, otomatik kaydırma, yay; kütüphane mi yoksa elle mi yazılacağı karar bekliyor; yeni, büyük parça)
- `side-sheet` (kenar çekmecesi; `sheet` ile ortak)
- `kanban-board` kabuğu
- Sayılar, bitiş günleri, puan ABACUS biçimiyle (Intl yok).

## Türkçe ekran metinleri (öneri)

- Görünüm: "Durum", "Şerit"; sayaç: "{n} kart"
- Sütun: "{ad}", sınırlıysa "{n}/{sınır}"
- Düğme: "Kart ekle", "Kapat"
- Kart ayrıntı alanları: "Başlık", "Atanan", "Bitiş", "Etiket", "Puan", "Kontrol listesi"
- Boş: "Bu sütunda kart yok.", "Henüz kart yok."
- Uyarı: "İş sınırı aşıldı."
- Duyuru: "{kart} kaldırıldı", "{kart} {sütun} sütununda {n}. sıraya bırakıldı", "Taşıma iptal edildi"
- Hata: "Kaydedilemedi." / "Yeniden dene"

## Kapsam dışı (bilerek)

- Tarih tabanlı zamanlama (takvim ya da zaman çizelgesi bileşenleri).
- Salt okunur durum özeti (tablo).
- Yorum akışı, dosya eki, kart şablonları, otomasyon kuralları.
- Veri servisi bağlantısı (proje bağlar; bileşen sıralı kart listesini iletir).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede sütunlar ve kartlar görüldü; sürükleme, şerit görünümü ve çekmece denenmedi, sayfa metnindeki davranış listesinden alındı.
