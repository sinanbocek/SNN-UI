# Tarif: team-directory (ekip rehberi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Kurum içi kişi rehberi: solda aranabilir, ekibe göre süzülen kişi listesi; sağda seçili kişinin profil paneli (durum, ekip, üzerinde çalıştığı iş, yer, e-posta). E-posta tek tıkla kopyalanır.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel, SNN-Ihale-Maliyet-Teklif-Yonetimi: ekip içi iletişim sayfası.
- Rol atama için değil; rol ve davet `team-members`, izinler `roles-permissions` tarifindedir.

## Bölümler

1. **Başlık:** "Kişiler" ve toplam sayı.
2. **Arama kutusu.**
3. **Ekip süzgeç düğmeleri:** "Tümü" ve her ekip; hepsinde kişi sayısı. Seçili olanın arkasında kayan vurgu vardır.
4. **Kişi listesi:** avatar (köşede müsaitlik noktası), ad, görev; seçili satır vurgulu.
5. **Profil paneli:** büyük avatar, ad, görev, kısa tanıtım yazısı; altında satır satır bilgi: durum, ekip, üzerinde çalıştığı iş, yer ve saat dilimi, e-posta + "Kopyala" düğmesi.

## Kullanıcı ne yapar, ne olur

- **Yazar:** liste ad (ve görev) üzerinden süzülür; eşleşmeyen satırlar solarak kapanır, kalanlar boşluğu doldurur. Esc arama metnini siler.
- **Ekip düğmesine basar:** liste o ekibe daralır; sayılar sabit kalır (ya da aramaya göre güncellenir; proje seçer, varsayılan: sabit).
- **Satıra basar:** profil paneli o kişiye geçer, içerik hafifçe yukarı süzülerek yenilenir. Seçim değişince uygulama haberdar edilir (profil sayfasına gitmek için).
- **Kopyala:** e-posta panoya gider, düğme kısa süre "Kopyalandı" yazar; panoya yazılamazsa "Kopyalanamadı" yazar ve adres seçili gösterilir.
- İlk açılışta ilk kişi seçilidir. Süzgeç ya da arama seçili kişiyi gizlerse seçim ilk görünen kişiye geçer; hiç kişi kalmazsa panel boş durum gösterir.

## Durumlar

- **Boş liste (arama/süzgeç):** "Eşleşen kişi yok" ve süzgeçleri temizleme düğmesi; panel "Bir kişi seçin" der.
- **Yükleniyor:** liste ve panel iskelet.
- **Hata:** "Rehber yüklenemedi" + "Yeniden dene".
- **Çok uzun içerik:** uzun ad/görev tek satırda kırpılır, tam değer ipucuyla. Liste kendi içinde kayar. Yüzlerce kişide sunucu tarafı süzme ve sayfalama.
- **Dar ekran:** (bileşenin kolonu genişliğine göre) orta darlıkta Kopyala düğmesi yalnız simge; daha darda profil paneli listenin altına iner; çok darda başlık dikey dizilir, arama tam genişlik olur, süzgeç sayıları gizlenir.
- **Fotoğrafı yok:** avatar baş harflere döner.

## Klavye ve ekran okuyucu

- Süzgeç düğmeleri etiketli bir grup; seçili olan `aria-pressed`. Kişi satırları da basılı/basılı değil düğmedir.
- Esc: arama kutusunu temizler.
- Profil paneli nazik canlı alan: seçim değişince yeni kişinin adı okunur.
- Kopyalama sonucu durum bölgesinde duyurulur.
- Müsaitlik noktası yalnız renk değildir: panelde "Müsait / Toplantıda" gibi yazı vardır, satırda okunur adı olur.

## Hareket

- Süzgeç vurgusu ve seçili satır vurgusu satırlar arasında kayar.
- Süzülen satırlar boşluğu kapatırken solar.
- Profil içeriği kişi değişince hafifçe yukarı süzülür.
- **"Hareketi azalt" açıkken:** yerleşim animasyonu ve süzülme yok; geçişler anında.

## Kurulacak SNN-UI parçaları

Katalogdan: `search-field`, `button`, `empty-state`, `skeleton`, `tooltip`, `toast` (kopyalama sonucu için isteğe bağlı).

Katalogda olmayan:
- `avatar` (müsaitlik noktalı)
- `filter-pills` (sayılı, kayan vurgulu seçim düğmeleri; `segmented-control` ile ortak olabilir)
- `copy-button` (kopyala → "Kopyalandı" geri bildirimi)
- `team-directory` kabuğu

## Türkçe ekran metinleri (öneri)

- Başlık: "Kişiler"; arama: "Ad ya da göreve göre ara"
- Süzgeç: "Tümü", ekip adları (proje verir)
- Panel etiketleri: "Durum", "Ekip", "Şu an üzerinde", "Konum", "E-posta"
- Durumlar: "Müsait", "Toplantıda", "İzinde"
- Düğme: "Kopyala", "Kopyalandı", "Kopyalanamadı"
- Boş: "Eşleşen kişi yok", "Süzgeçleri temizle", "Bir kişi seçin"
- Hata: "Rehber yüklenemedi." / "Yeniden dene"
- Saat dilimi gösterimi ABACUS ile (yerel saat yazımı için ayrı biçim kodu yok).

## Kapsam dışı (bilerek)

- Rol/davet yönetimi (`team-members`), izin matrisi (`roles-permissions`).
- Kamuya açık, görsel ağırlıklı ekip tanıtımı.
- Binlerce kişilik tablo.
- Mesaj/arama başlatma düğmeleri.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede liste ve profil paneli görüldü; arama, süzgeç ve kopyalama tek tek denenmedi, sayfa metnindeki davranış listesinden alındı.
