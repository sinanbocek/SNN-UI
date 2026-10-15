# Tarif: search-results (arama sonuçları sayfası)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Çalışma alanının tamamında arama yapan tam sayfa: üstte arama kutusu, solda süzgeçler, ortada karışık sonuç listesi (belge, kişi, dosya), sağda seçili sonucun önizlemesi. Kullanıcı türe, ekibe ve tarihe göre daraltır, sonucu açmadan önce okur.

## Hangi aile projesinde ne için (tahmin)

- SNN-Ihale-Maliyet-Teklif-Yonetimi: teklif, şartname, firma ve dosya karışık arama.
- SNN-Portfoy-Yonetimi, SNN-Proje-ve-Nakit-Akis-Yonetimi: kayıt/işlem/belge arama.
- GHS-Panel: müşteri, belge, not arama.
- Tek tür kayıt arayan basit listeler için gerekmez; onlar `search-field` + liste yeter.

## Bölümler

1. **Arama çubuğu:** büyük kutu, temizle düğmesi, "/" ipucu. Odaklanınca altında öneri menüsü (son aramalar, sonra önerilenler).
2. **Süzgeç kenar çubuğu:** "Tür" grubu (belgeler, kişiler, dosyalar), "Ekip" grubu, "Son düzenleme" aralığı için iki uçlu kaydırgan. Her seçeneğin yanında sonuç sayısı.
3. **Etkin süzgeç çipleri:** sonuç listesinin üstünde, her biri kaldırılabilir; "Tümünü temizle".
4. **Sonuç başlığı:** "N sonuç" ve sıralama seçici (en uygun, en yeni, A–Z).
5. **Sonuç listesi:** türe göre farklı satır; hepsinde başlık, yol/ekip bilgisi, eşleşen cümle, kimin ne zaman değiştirdiği. Eşleşen kelimeler vurgulu.
6. **İmleç dolgusu:** klavyeyle ya da fareyle üzerinde durulan satırın arkasında kayan sade dolgu.
7. **Önizleme paneli:** seçili sonucun içeriği ve ana eylemi ("Belgeyi aç", "Profili gör", "İndir").
8. **Süzgeç ve önizleme çekmeceleri:** dar ekranda süzgeçler alttan açılan sayfaya, önizleme alttan açılan sayfaya taşınır.

## Kullanıcı ne yapar, ne olur

- **Yazar, Enter basar:** sorgu çalışır; sayı, liste, süzgeç sayıları güncellenir; sorgu son aramalara eklenir (en çok 5).
- **Kutuya odaklanır:** öneri menüsü açılır; ok tuşuyla gezilir, Enter seçeneği çalıştırır; Esc önce menüyü kapatır, ikinci Esc metni siler.
- **"/" tuşuna basar:** başka alanda odak yoksa arama kutusuna gider.
- **Süzgeç işaretler:** liste anında daralır; sayı aşağı yuvarlanır; çip eklenir. Süzgeç sayıları şöyle çalışır: her seçenekteki sayı, "bunu da seçersem ne görürüm" sayısıdır (aynı grup içinde bağımsız). Sonucu olmayan seçenek **gizlenmez, devre dışı** görünür.
- **Tarih aralığını çeker:** yalnız belge ve dosyalara uygulanır (kişilerde etkisiz; kutuda belirtilir).
- **Sıralama değiştirir:** liste yeniden dizilir, imleç ilk satıra döner.
- **Sonuç satırında gezer** (ok, J/K, Home/End): imleç dolgusu kayar, önizleme o sonucu gösterir. İlk satırda yukarı ok kutuya döner.
- **Enter/Boşluk/tık:** geniş ekranda önizlemeyi o sonuca sabitler; dar ekranda alttan sayfa açılır. Önizlemedeki ana eylem tamamlanınca uygulama haberdar edilir.
- **Eşleşme yoksa:** boş durum, yazım düzeltme önerisi ve önerilen aramalar; birine basınca o sorgu çalışır.

## Durumlar

- **Boş sorgu:** sonuç yerine son ve önerilen aramalar.
- **Yükleniyor:** sonuç satırlarının yerinde iskeletler; düzen kaymaz; bölge "meşgul" işaretlenir.
- **Sonuç yok:** boş durum + yazım önerisi + öneri çipleri + süzgeçleri temizle düğmesi (süzgeç yüzündense).
- **Hata:** "Arama yapılamadı" ve "Yeniden dene"; son sonuçlar ekranda kalabilir ama soluk gösterilir.
- **Çok uzun içerik:** başlıklar iki satıra, özet iki satıra kırpılır; liste ve önizleme kendi içinde kayar. Çok sonuçta sayfalama (`pagination`) ya da sonsuz kayma; varsayılan sayfalama.
- **Dar ekran:** süzgeçler "Süzgeçler" düğmesine (etkin sayı rozetli) taşınır; sayfanın altında "Tümünü temizle" ve "Sonuçları göster" yapışkan alanı; satır ve düğmeler dokunmaya uygun büyüklüktedir.
- **Orta genişlik:** önizleme paneli yok, sayfa olarak açılır. Karar pencere genişliğine değil, bileşenin bulunduğu kolonun genişliğine göre verilir.

## Klavye ve ekran okuyucu

- Arama kutusu birleşik kutu; öneriler gruplu liste ("Son aramalar", "Önerilenler").
- Sonuç listesi tek seçenek listesi; etkin sonuç bildirilir: ekran okuyucu her sonucun başlığını, künyesini ve özetini okur.
- Sonuç sayısı ve yükleme nazik durum bölgesinde duyurulur; bölge yüklenirken "meşgul" işaretlidir.
- Süzgeç grupları çerçeve+başlıkla (fieldset/legend) işaretlenir; seçenekler etiketli onay kutusudur; sonucu olmayanlar devre dışıdır.
- Tarih aralığı iki tutamaçlı kaydırgan: tutamaç adları ("başlangıç", "bitiş") ve ay değerleri okunur.
- Klavye konumu **odak halkasıyla değil**, kayan dolguyla gösterilir. Vurgular işaretleme öğesiyle yapılır; eşleşme yalnız renkle belirtilmez (kalın/alt çizgi gibi ek biçim).

## Hareket

- Sade bir dolgu, satırlar arasında yumuşak ve sekmesiz kayar.
- Sonuç sayısı büyürken yukarı, daralırken aşağı doğru yuvarlanarak değişir (sabit genişlikli rakamlarla).
- Yeni sonuç kümesi kısa yükselişle solarak gelir; önizleme sonuç değişince solar.
- Öneri menüsü kutudan hafif büyüyerek açılır; çip satırı yüksekliği yumuşak açılıp kapanır.
- İskeletler sonuç satırlarının aynı yerini tutar; sonuç gelince kayma olmaz.
- **"Hareketi azalt" açıkken:** kayma, yuvarlanma ve iskelet atımı kalkar; yalnız düz solma kalır.

## Kurulacak SNN-UI parçaları

Katalogdan: `search-field`, `checkbox`, `select` (sıralama), `tabs` (isteğe bağlı tür sekmeleri), `empty-state`, `skeleton`, `button`, `pagination`, `dialog` (alttan sayfa için temel), `popover` (öneri menüsü için temel), `card`.

Katalogda olmayan:
- `combobox` (öneri menüsü; help-center ile ortak parça)
- `highlight-text` (help-center ile ortak)
- `range-slider` (iki uçlu)
- `filter-chip` / etkin süzgeç çip satırı
- `bottom-sheet` (alttan açılan sayfa)
- `avatar`
- `result-row` kalıpları (belge/kişi/dosya satırı) ve `search-results` kabuğu
- **Tarih etiketleri, aralık ay adları, sayılar (sonuç sayısı, dosya boyutu): ABACUS.** `Intl`/`toLocaleString` kullanılmaz; "2 gün önce" gibi göreli tarih metinleri de ABACUS kuralına bağlanır.

## Türkçe ekran metinleri (öneri)

- Yer tutucu: "{çalışma alanı} içinde ara"
- Öneri grupları: "Son aramalar", "Önerilen aramalar"
- Süzgeç grupları: "Tür" (Belgeler, Kişiler, Dosyalar), "Ekip", "Son düzenleme"; not: "Belge ve dosyalar için geçerli."
- Sıralama: "En uygun", "En yeni", "A–Z"
- Sayı: "{n} sonuç"
- Süzgeç düğmesi: "Süzgeçler ({n})", alt alan: "Tümünü temizle", "Sonuçları göster"
- Önizleme eylemi: "Belgeyi aç", "Profili gör", "İndir"
- Boş: "'{sorgu}' için sonuç bulunamadı", "Yazımı kontrol edin ya da önerilen aramalardan birini deneyin."
- Hata: "Arama şu an yapılamıyor." / "Yeniden dene"
- Duyuru: "{n} sonuç bulundu", "Sonuçlar yükleniyor"

## Kapsam dışı (bilerek)

- Gerçek arama dizini, sunucu tarafı süzme ve sıralama (proje bağlar; birkaç yüz kayıttan sonra sunucu gerekir).
- Belge/dosya önizlemesi içeriği (resim, sayfa kırpıntısı).
- Kaydedilmiş aramalar, paylaşılan arama bağlantısı.
- Hızlı gezinme paleti (`command-palette`): ayrı bileşen.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede arama satırı, süzgeçler, kaydırgan ve sonuç listesi görüldü; klavye ve dar ekran davranışı sayfanın düz metnindeki davranış listesinden alındı, tek tek denenmedi.
