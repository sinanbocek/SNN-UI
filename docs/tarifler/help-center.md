# Tarif: help-center (yardım merkezi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Kendi kendine destek ekranı: büyük bir arama kutusu, konu kartları, çok okunan makaleler ve okuma görünümü. Kullanıcı arar ya da konuya girer, makaleyi okur, "işe yaradı mı" diye oy verir, olmadı ise destekle iletişime geçer.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel, trade-kasa, SNN-Portfoy-Yonetimi: uygulama içi "Yardım" sayfası.
- Gunum-Var, Naturapan-Web-Sitesi: müşteri soruları sayfası (gerekirse).
- SNN-Ihale-Maliyet-Teklif-Yonetimi: kullanım kılavuzu.

## Bölümler

**Ana ekran**
1. Üst çubuk: marka adı ve "Yardım" etiketi.
2. Büyük başlık ve altında geniş arama kutusu.
3. Hızlı aramalar: arama kutusunun altında 3 önerilen kelime.
4. Konu kartları: ad, bir cümle açıklama, makale sayısı, simge. Satırda 1–3 kart, genişliğe göre.
5. Çok okunanlar: makale adı + konusu, liste.
6. "Hâlâ yardım lazım mı?" kartı: kısa metin ve iletişim düğmesi.

**Okuma görünümü**
1. Üst çubukta küçük arama (ana ekranı bıraktıktan sonra buraya taşınır) ve yol izi: Yardım › Konu.
2. Makale başlığı, güncellenme tarihi, okuma süresi, özet cümle.
3. Bölümler: ara başlıklı paragraflar ve gerekirse adım listesi.
4. "Bu sayfada" ana hat: geniş ekranda sağda yapışkan; okunan bölümü işaretler.
5. Geri bildirim kartı: "Işe yaradı mı?" Evet/Hayır; Hayır'da kısa açıklama kutusu açılır.
6. İlgili makaleler listesi.

## Kullanıcı ne yapar, ne olur

- **Yazarak arar:** her tuşta sonuçlar kutunun altında açılır liste olarak çıkar. Eşleşen kelimeler vurgulanır; her sonuçta başlık, kısa özet, konu adı. Tüm kelimeler eşleşmeli; başlıkta eşleşen sonuç önce gelir.
- **Hızlı arama kelimesine basar:** kutuya yazılır, sonuçlar açılır.
- **Aşağı/yukarı ok ile gezip Enter basar ya da tıklar:** makale açılır, görünüm sağa kayarak değişir.
- **Esc:** önce aramayı temizler, sonra kutudan çıkar.
- **Konu kartına basar:** o konunun makaleleri listelenir (konu görünümü: kartların yerine makale listesi, geri dönüşlü). Konu görünümü Pro önizlemede ayrıca denenmedi; makale listesi olarak tahmin edildi.
- **Çok okunan makaleye basar:** doğrudan okuma görünümü.
- **Okuma görünümünde ana hat bağlantısına basar:** sayfa o bölüme yumuşakça kayar, odak başlığa gider, aktif işaret oraya geçer. Kaydırdıkça işaret kendiliğinden ilerler.
- **Evet:** teşekkür metni, kart küçülür. **Hayır:** kısa açıklama kutusu ve "Gönder" açılır; gönderince teşekkür.
- **Geri (yol izi "Yardım"):** ana ekrana sola kayarak döner.
- **Destekle iletişim:** iletişim düğmesi proje tarafından bağlanır; basınca "istek gönderildi" durumu (düğme meşgul → onay).
- Makale bağlantısı doğrudan açılabilir (derin bağlantı).

## Durumlar

- **Boş arama sonucu:** "bulunamadı" metni, yazım denemesi önerisi ve konu kartlarına/öneri kelimelerine yönlendirme; destekle iletişim bağlantısı.
- **Yükleniyor:** konu kartları ve çok okunanlar iskelet olur; arama kutusu hemen kullanılabilir.
- **Hata:** makaleler alınamazsa "Yardım içeriği yüklenemedi" ve "Yeniden dene"; iletişim kartı yine görünür.
- **Çok uzun içerik:** başlık satır kırar; uzun makalede ana hat kendi içinde kayar. Çok sayıda sonuçta liste sınırlı yükseklikte kayar.
- **Dar ekran:** kartlar tek sütun; ana hat gizlenir, makale tek sütun okunur; arama üst çubuğa taşınır.
- **Makale yok / yanlış bağlantı:** "Bu makale bulunamadı" ve ana ekrana dön düğmesi.

## Klavye ve ekran okuyucu

- Arama kutusu birleşik kutu (combobox) olarak işaretli, sonuçlar seçenek listesi; ok tuşlarında odak kutuda kalır, etkin seçenek bildirilir. Sonuç sayısı nazikçe okunur.
- Aşağı/yukarı: sonuçlarda gez. Enter: aç. Esc: temizle, sonra çık. Tab: konular, makaleler, ana hat, geri bildirim sırasıyla.
- Makale gerçek başlık hiyerarşisi kullanır; ana hat bağlantıları odağı ilgili başlığa taşır, aktif olana `aria-current` verilir.
- Yol izi etiketli bir gezinme bölgesi. Konu simgeleri süstür (okunmaz); her kart adıyla okunan düğmedir.
- Geri bildirim sonucu nazikçe duyurulur.

## Hareket

- Sonuç listesi kutudan hafif solarak ve büyüyerek açılır; ok tuşuyla gezerken **animasyon yoktur**.
- Görünümler yönüne göre kayar: derine giderken sağa, geri dönerken sola.
- Ana hat işareti okunan bölümü yumuşakça izler; tıklanınca sayfa yumuşak kayar.
- Geri bildirim kartı durumlar arası geçerken solar ve boyu yumuşak değişir.
- **"Hareketi azalt" açıkken:** kayma yerine solma, kaydırma anında, işaret yerinde değişir.

## Kurulacak SNN-UI parçaları

Katalogdan: `search-field` (büyük arama; birleşik kutu davranışı için genişletilir), `card` (konu kartı, iletişim kartı), `button`, `textarea` (Hayır'da açıklama), `empty-state`, `skeleton`, `toast`, `popover` (arama sonuç listesi için temel olabilir), `tabs` gerekmez.

Katalogda olmayan:
- `combobox` / seçenek listeli arama (sonuç listesi + `aria-activedescendant`)
- `highlight-text` (eşleşen kelimeyi vurgulayan küçük parça)
- `breadcrumb`
- `article-outline` ("bu sayfada" ana hat, kaydırma izleyen)
- `feedback-card` (evet/hayır + açıklama)
- `help-center` kabuğu

## Türkçe ekran metinleri (öneri)

- Başlık: "Aklınızdaki soru ne?"
- Yer tutucu: "Yardım makalelerinde ara"
- Hızlı arama: "Örneğin:" + kelimeler (proje verir)
- Bölümler: "Konulara göz atın", "En çok okunanlar", "Bu sayfada", "İlgili makaleler"
- Kart altı: "{n} makale"
- Makale künyesi: "Güncellendi: {tarih} · {n} dk okuma"
- Geri bildirim: "Bu makale işinize yaradı mı?", "Evet", "Hayır", "Neyi eksik buldunuz?", "Gönder", "Geri bildiriminiz için teşekkürler."
- İletişim: "Aradığınızı bulamadınız mı?", "Destekle iletişime geç", "İsteğiniz iletildi."
- Boş: "Sonuç bulunamadı", "Farklı kelimelerle deneyin ya da konulara göz atın."
- Hata: "Yardım içeriği yüklenemedi." / "Yeniden dene"

Not: tarih ve okuma süresi sayıları ABACUS biçimiyle yazılır.

## Kapsam dışı (bilerek)

- Makale içeriği (resim, bağlantı, zengin metin): proje verir.
- Sunucu tarafı arama, çok büyük makale sayısı.
- Canlı sohbet, uygulama içi yardım başlatıcısı: ayrı bileşen.
- Konu görünümünün ayrıntılı tasarımı (Pro'da denenmedi).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede arama, Enter ile makale açma, okuma görünümü ve "Hayır" tıklaması denendi; "Hayır" sonrası açılan alan tam görünmedi, metin açıklamasından çıkarıldı.
