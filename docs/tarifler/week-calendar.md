# Tarif: week-calendar (haftalık takvim)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Zaman bloklarının haftalık ızgarada sürükleyerek oluşturulduğu, taşındığı ve uzatıldığı takvim. Renkli takvimler, tüm gün satırı, gün/hafta/iş haftası/üç gün/gündem görünümleri; telefonda kaydırma.

## Hangi aile projesinde ne için (tahmin)

- SNN-Proje-ve-Nakit-Akis-Yonetimi: ödeme ve görev planı.
- SNN-Ihale-Maliyet-Teklif-Yonetimi: ihale tarihleri, teslim günleri.
- GHS-Panel: randevu ya da saha planı olursa.
- Ay görünümü ve tek tarih seçici ayrı bileşenlerdir.

## Bölümler

1. **Üst çubuk:** "Bugün", önceki/sonraki oklar, görünen aralığın başlığı, görünüm seçici, takvim görünürlük düğmesi (renk noktaları), "Yeni" (+) düğmesi.
2. **Kenar çubuğu (yalnız geniş alanda):** mini ay takvimi ve takvim listesi (aç/kapat kutuları).
3. **Gün başlıkları:** hafta günü ve tarih; bugün vurgulu.
4. **Tüm gün satırı:** tüm gün etkinlikleri; dolunca daralır.
5. **Saat ızgarası:** sol kenarda saat etiketleri, 15 dakikalık adımlarla bölünmüş sütunlar; "şimdi" çizgisi.
6. **Etkinlik bloğu:** başlık, saat aralığı, yer; takvim rengiyle. Alt kenardan uzatılır.
7. **Hızlı oluşturma kutusu:** ızgarada çizilen aralıkta açılır: başlık alanı ve kaydet.
8. **Etkinlik ayrıntı kutusu:** başlık, gün, saat, takvim düzenlenir; sil.
9. **Geri al çubuğu:** silme/taşıma sonrası alttan çıkar.
10. **Gündem listesi** (telefonda): günlere göre gruplu satırlar.

## Kullanıcı ne yapar, ne olur

- **Boş zamanda sürükler:** renkli bir taslak çizilir; bırakınca hızlı oluşturma kutusu açılır, başlık yazılıp Enter ile kaydedilir. Esc iptal eder.
- **Etkinliği sürükler:** 15 dakikalık adımlarla gün ve saat değişir; komşular yer açar.
- **Alt kenarı çeker:** süre uzar/kısalır (adım 15 dakika).
- **Etkinliğe basar:** ayrıntı kutusu açılır; başlık, gün, saat, takvim değiştirilip kaydedilir; "Sil".
- **Sil / Delete tuşu:** etkinlik silinir, geri al çubuğu çıkar; Ctrl/Cmd+Z geri getirir.
- **Görünüm değiştirir (D, W ya da seçici):** gün, hafta, iş haftası, üç gün, gündem arasında geçilir. Telefonda hafta yerine üç gün ve gündem sunulur.
- **Oklar / yön tuşları / T:** sonraki-önceki aralık yön gösteren kayarak gelir; T bugüne döner.
- **N:** odaktaki günün ilk boş saatinde taslak açar.
- **Takvimleri aç/kapa:** o takvimin etkinlikleri gizlenir/gösterilir.
- **Telefonda:** yatay kaydırma gün değiştirir; uzun basış oluşturmayı ya da taşımayı başlatır (dikey kaydırma bozulmasın diye).

## Durumlar

- **Boş hafta:** ızgara boş, ipucu: "Etkinlik eklemek için bir saat aralığı sürükleyin."
- **Yükleniyor:** ızgara sütun iskeleti; etkinlik bloğu yok.
- **Hata:** etkinlik kaydedilemezse blok eski yerine döner, kısa uyarı ve "Yeniden dene".
- **Çakışan etkinlikler:** yan yana sütunlara bölünür, dar bloklar ayrıntıyı düşürür (başlık kırpılır).
- **Çok sayıda tüm gün etkinliği:** satır daralır, "+N daha" bağlantısı.
- **Geçmiş/gelecek aralık:** kaydırıldıkça bitişik aralık hazır gelir.
- **Dar ekran:** üç gün + gündem; kenar çubuğu yok, takvim seçimi açılır kutuya taşınır; orta darlıkta etkinlik blokları ayrıntıyı düşürür.
- **Saat dilimi:** ızgara uygulamanın saat diliminde çizilir; veri UTC tutulur.

## Klavye ve ekran okuyucu

- Her görünür aralık `grid` olarak işaretlenir; tarihleriyle etiketli, kullanım yönergesiyle tanımlı. Her gün etiketli bir hücredir (tarih ve etkinlik sayısı).
- Sol/sağ ok günler arasında (kenarı aşınca sonraki aralık); T bugün; N yeni; Enter kaydeder/açar; Delete/Backspace siler; Esc kapatır/iptal eder; D/W görünüm; yukarı/aşağı ok etkinlikten etkinliğe.
- Alt+ok: odaktaki etkinliği bir gün ya da 15 dakika kaydırır; Alt+Shift+yukarı/aşağı süreyi değiştirir. Ctrl/Cmd+Z geri alır.
- Etkinlik düğmesinin adı başlık, tam tarih, başlangıç-bitiş saati, takvim ve yeri okur.
- Hızlı oluşturma ve ayrıntı kutusu etiketli pencereler; odak içeri girer, Esc/dış tık kapatır, odak etkinliğe döner.
- Nazik canlı bölge: aralık değişimi, oluşturma, taşıma, boyutlandırma, silme, geri alma duyurulur. Fare odağı halka çizmez, klavye odağı çizer.

## Hareket

- Aralıklar yön gösterecek biçimde kayar (taşmasız yay); başlık ve tüm gün satırı ızgarayla birlikte hareket eder. Telefonda kaydırma komşu günleri birlikte sürükler.
- Etkinlikler yalnız dönüşümle yeni konuma gider; sürüklenen blok adımdan adıma atlar, komşular yerleşir.
- Kutular, etkinliğe bakan kenardan büyüyerek açılır; geri al çubuğu alttan yükselir.
- **"Hareketi azalt" açıkken:** kayma ve yaylanma yerine anlık yer değişimi ve kısa solma.

## Kurulacak SNN-UI parçaları

Katalogdan: `button`, `popover` (hızlı oluşturma ve ayrıntı kutusu), `input`, `select` (takvim/saat), `checkbox` (takvim listesi), `tabs` (görünüm seçici için geçici), `dropdown-menu`, `toast` (geri al), `empty-state`, `skeleton`, `tooltip`.

Katalogda olmayan:
- `calendar` (mini ay)
- `segmented-control` (görünüm)
- `time-grid` (sürükle/yeniden boyutlandır motoru; yeni, büyük parça)
- `event-block`, `agenda-list`
- **Tarih ve saat yazımı: ABACUS.** Gün adları, ay adları, "14.30" biçimi, saat dilimi dönüşümü `Intl` ile yapılamaz; ABACUS tarih/saat çekirdeği gerekir. Bu bileşen ABACUS'a bağlanmadan kataloğa girmez.

## Türkçe ekran metinleri (öneri)

- Düğme: "Bugün", "Önceki", "Sonraki", "Yeni etkinlik", "Takvimler"
- Görünümler: "Hafta", "İş haftası", "Gün", "3 gün", "Gündem"
- Etkinlik: "Başlık", "Gün", "Başlangıç", "Bitiş", "Takvim", "Yer", "Kaydet", "Sil", "Vazgeç"
- Tüm gün satırı: "Tüm gün"; taşma: "+{n} daha"
- Geri al: "Etkinlik silindi.", "Geri al"
- Boş: "Etkinlik eklemek için bir saat aralığı sürükleyin."
- Duyuru: "{gün} günü, {n} etkinlik"; "Etkinlik {saat} saatine taşındı"

## Kapsam dışı (bilerek)

- Tekrarlayan etkinlik, davetli yanıtları, saat dilimi seçimi, ay görünümü.
- Çok bin etkinlik (yalnız görünen aralık verilir).
- Takvim servisi bağlantısı (proje bağlar; bileşen oluşturma/güncelleme/silme olaylarını iletir).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod, kaynak, ağ istekleri açılmadı. Önizlemede hafta ızgarası, üst çubuk ve etkinlikler görüldü; sürükleme, boyutlandırma ve klavye denenmedi, sayfa metnindeki davranış listesinden alındı.
