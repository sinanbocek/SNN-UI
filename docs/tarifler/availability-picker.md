# Tarif: availability-picker (ortak uygun saat seçici)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Birkaç kişinin ortak toplantı saatini seçtirir. Üstte beş günlük şerit, altında seçili günün boş saatleri; her saatte kimin müsait olduğu görünür. Seçim altta özetlenir ve "Onayla" ile tamamlanır.

## Hangi aile projesinde ne için (tahmin)

- SNN-Ihale-Maliyet-Teklif-Yonetimi: keşif ya da teslim toplantısı saati seçimi.
- GHS-Panel: müşteriyle randevu saati.
- Takvim görünümü `week-calendar` tarifindedir; bu bileşen yalnız tek saat seçtirir.

## Bölümler

1. **Başlık alanı:** toplantı adı, süre ve saat dilimi ("30 dakika · İstanbul saati" gibi); sağda katılımcı avatarları.
2. **Gün şeridi:** beş gün kartı; kartta gün adı, gün sayısı ve "N boş" yazısı. Seçili kart dolu renkli.
3. **Saat listesi:** başlıkta seçili günün adı ve "Müsait / Meşgul" göstergesi; saat düğmeleri iki sütunda.
4. **Saat düğmesi:** saat, kısa durum ("Herkes müsait" ya da "{kişi} meşgul"), sağda üç küçük çubuk (her kişi için bir çubuk: yeşil müsait, gri meşgul). Seçilmişse işaretli.
5. **Özet çubuğu:** altta durum cümlesi, seçilen gün ve aralık ("10.30–11.00"), "Saati onayla" düğmesi.

## Kullanıcı ne yapar, ne olur

- **Gün kartına basar:** o günün saatleri gelir; eski liste yeni günün yönüne doğru kayıp solar, yenisi kayarak gelir. Seçili saat varsa temizlenir.
- **Saate basar:** saat seçilir (ilk açılışta ilk uygun saat seçili gelebilir; proje karar verir, varsayılan: seçili gelmez), vurgu kayarak oraya geçer; özet güncellenir.
- **Meşgul kişili saat:** seçilebilir ama özet "Herkes müsait değil: {kişi}" der; onay yine verilebilir ya da proje engelleyebilir (varsayılan: seçilebilir, uyarı gösterilir).
- **Onayla:** seçilen gün ve saat uygulamaya iletilir; düğme meşgul olup kısa bir "Planlandı" durumuna geçer.
- **Hiç saat seçilmemişse:** özet "Bir saat seçin" der, Onayla pasif.

## Durumlar

- **Boş gün (hiç boş saat):** kartta "Boş yok"; kart pasif ya da seçilince "Bu gün için uygun saat yok" mesajı. En yakın boş günü öneren bağlantı.
- **Hiç uygun gün yok:** boş durum: "Ortak uygun saat bulunamadı", "Katılımcıları değiştir".
- **Yükleniyor:** gün kartları ve saat listesi iskelet; bileşen veri çekmez, veri hazır gelmelidir.
- **Hata:** onay başarısızsa özet çubuğunda "Planlanamadı" ve "Yeniden dene"; seçim korunur.
- **Çok uzun içerik:** katılımcı adları uzunsa kırpılır; çok katılımcıda çubuk yerine sayı ("5 kişiden 4'ü müsait").
- **Dar ekran:** beş gün her genişlikte beş sütun kalır, saatler iki sütun kalır. Orta darlıkta katılımcı adları gizlenir (avatar kalır); çok darda gün kartları küçülür, başlık simgesi ve tarih başlığı düşer.
- **Saat dilimi:** veri ve etiket aynı dilimde; onay çıktısı gerçek zaman damgasına çevrilir (uygulama işi).

## Klavye ve ekran okuyucu

- Gün kartları ve saatler etiketli düğme grubu; seçili olan basılı durumda. Ok tuşları grup içinde gezer; Tab gruplar arası geçer.
- Seçili gün ve son seçim canlı bölgelerde okunur ("Seçilen: ... saat ...").
- Saat düğmesinin okunan adı: saat, kim müsait/meşgul. Çubuk renkleri yalnız renk değildir: metinle de bildirilir ("Herkes müsait").
- Onayla sonucu nazik durum bölgesinde duyurulur.

## Hareket

- Saat listesi gün değişince yönüne göre yatay kayarak değişir.
- Seçili saat vurgusu saatler arasında kayar (paylaşılan yerleşim yayı).
- **"Hareketi azalt" açıkken:** yatay kayma ve yay yok; yalnız anında değişim.

## Kurulacak SNN-UI parçaları

Katalogdan: `button`, `card` (gün kartı için), `radio-group` (saat seçimi mantığı), `tooltip`, `empty-state`, `skeleton`, `toast`.

Katalogda olmayan:
- `avatar` ve `avatar-group`
- `availability-bars` (kişi başı müsait/meşgul çubukları; renk dışı metin de taşır)
- `day-strip` ve `slot-list` parçaları ve `availability-picker` kabuğu
- **Gün adı, tarih ve saat gösterimi: ABACUS.** `Intl` ve `toLocaleString` kullanılamaz; ABACUS tarih/saat çekirdeği olmadan kataloğa girmez.

## Türkçe ekran metinleri (öneri)

- Başlık satırı: "{toplantı adı}", "{süre} dakika · {saat dilimi}"
- Gün kartı: "{n} boş"
- Gösterge: "Müsait", "Meşgul"
- Satır durumu: "Herkes müsait", "{ad} meşgul"
- Özet: "Bir saat seçin", "Herkes müsait", "{gün}, {başlangıç}–{bitiş}"
- Düğme: "Saati onayla", "Planlandı"
- Boş: "Ortak uygun saat bulunamadı.", "Bu gün için uygun saat yok."
- Hata: "Planlanamadı." / "Yeniden dene"

## Kapsam dışı (bilerek)

- Takvim servisinden müsaitlik çekmek, davet göndermek (proje bağlar; bileşen yalnız seçimi iletir).
- Beşten fazla gün, gün atlama, haftalık gezinme.
- Tek tarih/tek saat girişi (`date-picker`, `time-picker`).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede gün şeridi, saat listesi ve özet çubuğu görüldü; tıklama ve geçiş animasyonları denenmedi, sayfa metnindeki davranış listesinden alındı.
