# Tarif: team-members (ekip üyeleri yönetimi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Çalışma alanındaki kişileri yönetir: kaç koltuk dolu, kimler üye, rolü kim değiştirir, bekleyen davetler. Kullanıcı birden çok e-postayı yazar ya da yapıştırır, her biri bir etikete dönüşür, tek düğmeyle davet gider.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel, SNN-Portfoy-Yonetimi, SNN-Ihale-Maliyet-Teklif-Yonetimi: kullanıcı ve rol yönetimi sayfası (yönetici ekranı).
- Rolleri tanımlamak için ayrı bir "roller ve izinler" ekranı gerekir; bu parça yalnız atama yapar.

## Bölümler

1. **Başlık alanı:** "Üyeler", kısa açıklama, sağda koltuk sayacı ("kullanılan / toplam").
2. **Davet alanı:** e-posta etiketlerini taşıyan tek kutu, yanında rol seçici ve "Davet gönder" düğmesi; altında ipucu satırı.
3. **Üye listesi başlığı:** "Üyeler" + sayı, sağda arama kutusu.
4. **Üye satırı:** avatar (çevrimiçiyse yeşil nokta), ad (kendisiyse "Sen" etiketi), e-posta, son görülme, rol seçici, çıkar düğmesi. Sahip rolü seçici değildir, düz yazıdır; kendi satırında çıkar düğmesi yoktur.
5. **Bekleyen davetler:** başlık + sayı; satırda baş harf yuvarlağı (kesik çizgili), e-posta, rol ve davet tarihi, "Yeniden gönder" ve "İptal et".
6. **Alt not:** "Değişiklikler hemen uygulanır."

## Kullanıcı ne yapar, ne olur

- **Davet kutusuna e-posta yazar:** Enter, virgül, noktalı virgül ya da boşlukla yazılan adres etikete dönüşür. Geçersiz adres etiketlenmez; kutunun altında anlaşılır hata yazar (nazikçe duyurulur).
- **Birden çok adres yapıştırır:** hepsi ayrı etiket olur.
- **Geri tuşu (kutu boşken):** son etiketi siler.
- **Rol seçer:** davet edilenlerin tamamı bu rolle gelir.
- **Enter (kutu boşken) ya da "Davet gönder":** etiketler daire içinde kutudan "Bekleyen davetler" listesine uçar, koltuk sayacı yuvarlanarak artar. Koltuk yetmiyorsa gönderilmez, sebep yazılır ve fazla etiket işaretli kalır.
- **Rol değiştirir (üye satırında):** hemen uygulanır, kısa onay duyurusu çıkar; hata olursa eski role döner.
- **Çıkar düğmesine basar:** satır, aynı yerde "Çıkarılsın mı?" sorusuna ve "Vazgeç" / "Çıkar" düğmelerine dönüşür. Çıkar kırmızıdır (gerçek yıkıcı eylem). Esc ya da Vazgeç iptal eder; çıkarınca satır kapanır, sayaç düşer.
- **Ara:** ad ya da e-postaya göre listeyi süzer, sayı güncellenir.
- **Yeniden gönder:** davet tarihi yenilenir, kısa onay; **İptal et:** davet listeden kalkar, koltuk geri açılır.

## Durumlar

- **Boş (yalnızca sahip):** boş durum parçası: "Henüz kimseyi davet etmediniz", üstteki kutuya odak götüren düğme.
- **Arama sonucu yok:** "Eşleşen üye yok".
- **Bekleyen davet yok:** bölüm gizlenir.
- **Yükleniyor:** satır iskeletleri; davet kutusu pasif.
- **Hata:** liste yüklenemezse "Üyeler yüklenemedi" ve "Yeniden dene"; satır eylemi hatasında satır içinde kırmızı kısa mesaj, eylem geri alınır.
- **Koltuk dolu:** sayaç vurgulanır (uyarı rengi mavi-gri; kırmızı değil), davet düğmesi pasif ve neden yazılır.
- **Çok uzun içerik:** ad ve e-posta tek satırda kırpılır, tam değer ipucuyla. Çok üyede sayfalama (`pagination`); liste sanallaştırılmaz.
- **Dar ekran:** başlık ve davet satırı alt alta dizilir, arama tam genişlik olur. Çok dar ekranda her üye satırı ikiye bölünür: üstte kimlik, altta son görülme, rol, çıkar.

## Klavye ve ekran okuyucu

- Rol seçiciler tam klavye destekli seçim kutusudur.
- Etiketler: Enter, virgül, noktalı virgül ya da boşluk kaydeder; Geri tuşu (kutu boşken) son etiketi siler; her etiketin kaldırma düğmesi odaklanabilir ve adı okunur ("{adres} kaldır").
- Esc: bekleyen çıkarma sorusunu iptal eder.
- Doğrulama mesajları nazik durum bölgesinde okunur; "davet gönderildi", "rol değişti", "üye çıkarıldı" gibi eylemler durum bölgesinde duyurulur.
- Çevrimiçi noktası yalnız renk değildir: satırda "Şu an çevrimiçi" metni vardır (görünür ya da okunur).
- Çıkarma sorusu açılınca odak "Vazgeç"e gider (güvenli seçenek).

## Hareket

- Etiketler kutudan listeye uçar; koltuk sayısı yuvarlanır.
- Satırlar eklenirken ve çıkarken yer açar/kapatır (yeniden dizilim animasyonu); liste yüksekliği yumuşak değişir.
- Çıkar sorusuna dönüşen satır solarak değişir.
- **"Hareketi azalt" açıkken:** uçuş ve yeniden dizilim yoktur, öğeler anında yer değiştirir; sayaç yuvarlanmaz.

## Kurulacak SNN-UI parçaları

Katalogdan: `input` (kutu için temel), `select` (rol), `button`, `search-field` (liste araması), `empty-state`, `skeleton`, `toast` (onay), `tooltip` (kırpılmış değer), `pagination`, `dropdown-menu` (gerekirse rol seçimi yerine).

Katalogda olmayan:
- `avatar` (çevrimiçi göstergeli)
- `tag-input` / e-posta etiket kutusu (yeni, genel amaçlı olarak da kullanılır)
- `badge` ("Sen", rol etiketi)
- `seat-counter` (kullanılan/toplam) ve `team-members` kabuğu. Sayaç sayı gösterimi için ABACUS kuralına uyar; yuvarlanma animasyonu yalnız tamsayı için.
- E-posta doğrulama: giriş alanları standardına göre kendi doğrulayıcımız (`giris-alanlari-standardi.md`'ye bakılacak); yeni parça gerekirse ABACUS'a aday.

## Türkçe ekran metinleri (öneri)

- Başlık: "Üyeler", açıklama: "Çalışma alanına kimlerin erişebileceğini yönetin."
- Sayaç: "{kullanılan} / {toplam} koltuk"
- Davet: "Kişileri davet et", yer tutucu "E-posta adresleri", ipucu: "Adresleri virgülle ayırın ya da Enter'a basın. Davetler 7 gün geçerlidir."
- Düğmeler: "Davet gönder", "Yeniden gönder", "İptal et", "Çıkar", "Vazgeç"
- Roller (proje belirler, örnek): "Sahip", "Yönetici", "Üye", "Görüntüleyici"
- Satır: "Sen", "Şu an çevrimiçi", "{zaman} aktifti"
- Çıkarma: "{ad} çıkarılsın mı?", "Çalışma alanına erişimi hemen kapanır."
- Bölümler: "Bekleyen davetler", alt not: "Değişiklikler hemen uygulanır."
- Hata: "'{adres}' geçerli bir e-posta adresi değil.", "Koltuk kalmadı."
- Boş: "Henüz kimseyi davet etmediniz."

## Kapsam dışı (bilerek)

- Gerçek davet gönderimi, rol kaydı, çıkarma (proje bağlar; önizlemede hepsi benzetimdi).
- Rollerin neleri yapabileceği (ayrı "roller ve izinler" ekranı).
- Göz atılabilir kişi rehberi (ayrı "ekip rehberi" ekranı), toplu içe aktarma, tek tek davet bağlantısı.
- Listede sanallaştırma (çok büyük kurumlar için sayfalama yeter).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede liste, davet alanı ve çıkarma sorusu denendi; etiketleme, yapıştırma ve davet gönderme uçuşu denenmedi, sayfanın düz metnindeki davranış listesinden alındı.
