# Tarif: wallet-card (bakiye ve hareket kartı)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Küçük bir hesap görünümü: bakiye, bakiye geçmişi grafiği, son hareketler ve odaklı para işlemleri (gönder, yatır, çevir, al). Ana ve yedek olmak üzere iki hesap arasında geçilir; bakiye gizlenebilir. Bileşen gerçek para hareketi yapmaz; yalnız arayüzdür, işlemleri uygulama bağlar.

## Hangi aile projesinde ne için (tahmin)

- Portföy ve nakit akışı projelerinde bakiye özeti (SNN-Portfoy-Yonetimi, SNN-Proje-ve-Nakit-Akis-Yonetimi).
- Abonelik/fatura için değil (o `usage-pricing`, `invoice-studio` tarafında); kart destesi için `wallet-stack`.

## Bölümler

1. **Hesap değiştirici:** "Ana hesap" / "Yedek hesap" açılır menüsü; çok dar kapta etiketi düşer.
2. **Bakiye:** büyük tutar (döner), bu ay değişim ve para birimi; gizle/göster düğmesi.
3. **Bakiye geçmişi grafiği:** dönem seçici (1 hafta, 1 ay, 1 yıl); üstünde gezinince nokta okunur.
4. **Eylem düğmeleri:** Gönder, Yatır, Çevir, Al. Biri seçilince altta kendi paneli açılır.
5. **Son hareketler:** arama alanı, üç satır (açıklama, tarih ve kaynak, tutar; giren yeşil değil nötr-pozitif, çıkan eksi), "Tümünü gör".
6. **Eylem paneli:** tutar girişi, doğrulama iletisi, onay düğmesi ("{tutar} ekle" gibi tutarı taşır).

## Kullanıcı ne yapar, ne olur

- **Hesap değiştirir:** bakiye, grafik ve hareketler o hesabınkine geçer; kart yüksekliği yayla değişir.
- **Dönem seçer:** grafik yeni aralığa dönüşür; bu ay değişim güncellenir.
- **Grafikte fareyle gezer:** o noktanın değeri okunur. Dokunmatik ve klavyede grafik üzerindeki aralık girdisiyle gezilir (oklar noktaları dolaşır).
- **Eylem düğmesine basar:** ilgili panel yükselerek, bulanıkla gelir; düğme `aria-pressed`.
- **Tutar girer ve onaylar:** geçerliyse bakiye yeni değere sayarak ilerler, hareketler listesine yeni satır yerinde açılır; geçersizse ("bakiyeden fazla", boş, sıfır) hata iletisi.
- **Bakiyeyi gizler:** tutar yerine gizli gösterge; ekran okuyucu "Bakiye gizli" der.
- **Hareket araması:** bellekte süzer; yalnız üç satır görünür, "Tümünü gör" açar.

## Durumlar

- **Boş geçmiş:** "Henüz hareket yok". **Sonuç yok (arama):** boş durum.
- **Tutar hatası:** alan `aria-describedby` ile iletiye bağlı, `role="alert"`.
- **Yükleniyor:** bakiye, grafik, satır iskeletleri.
- **Genişlik:** kart kap sorgusuyla çalışır, en çok yaklaşık 660 px; 420 px altında dolgu daralır, eylem okları gizlenir; 280 px altında hesap değiştirici etiketini düşürür, alt yazı küçülür.

## Klavye ve ekran okuyucu

- Grafik aralık girdisinde oklar geçmiş noktalarını gezer. Eylem düğmeleri `aria-pressed` ve `aria-controls`; gönderimden sonra odak eylem düğmesine döner.
- Bakiye canlı bölgedir; gizliyse "Bakiye gizli".
- Tutar hataları `role="alert"`.

## Hareket

- Bakiye yeni değere kısa sürede sayarak gider; kart yüksekliği yumuşak yayla değişir.
- Paneller kısa yükselme ve bulanıkla yer değiştirir; yeni hareket satırı yerinde açılır.
- **"Hareketi azalt" açıkken:** değerler anında, yerleşim animasyonu yok.

## Görseller

Gerçek görsel yok; hareket satırında isteğe bağlı simge ya da kişi avatarı (kişiler arası aktarımda avatar). Yazım oturumu yer tutucu avatar/simge kullanır.

## Para ve kart alanları

Tutarlar TRY, `money` ile; tutar girişi için `money` giriş alanı mantığı (canlı ayraç) ve ABACUS `validate` (sıfırdan büyük, bakiyeyi aşmıyor, geçerli kuruş). Giriş alanlarında `giris-alanlari-standardi.md`: yazarken süzme, kaydederken doğrulama. IBAN ya da hesap numarası alanı eklenirse ABACUS `mask` / `validate` kullanılır. **Bileşen gerçek ödeme yapmaz;** her işlem uygulamanın defterine bağlanır ve istemci tutarına güvenilmez.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Bakiye | para, TRY | `money.format` + `animated-counter`; kuruş tamsayısı |
| Bu ay değişim | para, TRY | `money.format`, işaretli |
| Hareket tutarı | para, TRY | `money.format`; çıkan eksi |
| Grafik noktaları | para, TRY | `money.format` (okuma metni) |

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`, `line-chart` ya da `sparkline` (bakiye geçmişi), `segmented-control` (dönem), `dropdown-menu` (hesap), `popover`, `button`, `input`, `search-field`, `empty-state`, `skeleton`.

Katalogda olmayan:
- `money-input` (ayraçlı tutar girişi)
- `activity-row` (hareket satırı)
- `wallet-card` kabuğu

## Türkçe ekran metinleri (öneri)

- "Kullanılabilir bakiye", "Bu ay", "Son 30 gün", "Gönder", "Yatır", "Çevir", "Al", "Son hareketler", "Tümünü gör", "Hareketlerde ara"
- "Bakiye gizli", "Bakiyeyi göster/gizle", "Tutar bakiyenizi aşıyor."

## Kapsam dışı (bilerek)

- Gerçek para hareketi, kur çevirme, defter. Fatura ve abonelik (`invoice-studio`), kart destesi (`wallet-stack`).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
