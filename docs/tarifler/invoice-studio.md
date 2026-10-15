# Tarif: invoice-studio (düzenlenebilir fatura / teklif sayfası)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Kalemli bir fatura ya da teklifi ekranda düzenletir. Kalem eklenir, silinir, adet ve birim fiyat değiştikçe ara toplam, vergi ve genel toplam anında yeniden hesaplanır ve rakamlar akarak değişir. En altta "Taslağı kaydet" düğmesi vardır. Bu bileşen yalnız belge **taslağını** düzenler; resmî e-fatura/e-arşiv üretimi ya da gönderimi kapsamı dışındadır.

## Hangi aile projesinde ne için (tahmin)

- SNN-Ihale-Maliyet-Teklif-Yonetimi: teklif kalemleri, birim fiyat, KDV ve toplam (en doğal yer).
- GHS-Panel: müşteriye kesilecek fatura/teklif taslağı.
- SNN-Proje-ve-Nakit-Akis-Yonetimi: gelecek tahsilat taslağı.
- Geçmiş faturaları listelemek için tablo; ödeme alma için ödeme akışı.

## Bölümler

1. **Üst alan:** büyük "Fatura" ya da "Teklif" başlığı; sağda iki taraf bloğu: "Gönderen" ve "Alıcı" (ad, adres satırları).
2. **Kalem tablosu:** sütunlar "İş/hizmet", "Adet", "Birim fiyat", "Tutar"; her satırda açıklama alanı, adet alanı, birim fiyat alanı (para simgesiyle), satır tutarı ve silme düğmesi.
3. **"Kalem ekle" düğmesi.**
4. **Not alanı:** altta sol tarafta kısa serbest metin (ödeme koşulu gibi).
5. **Toplamlar:** sağda "Ara toplam", "KDV · %{oran}", ve büyük "Ödenecek toplam".
6. **Alt şerit:** sağda "Taslağı kaydet" düğmesi; kayıt sonucu durum satırı.

## Kullanıcı ne yapar, ne olur

- **Açıklama, adet ya da birim fiyat yazar:** satır tutarı ve tüm toplamlar anında güncellenir; toplam rakamları kısa dikey kayma ve hafif bulanıklıkla değişir.
- **"Kalem ekle":** satır, yükseklik animasyonuyla altta belirir, odak yeni satırın açıklama alanına geçer.
- **Silme düğmesi:** satır yükseklik animasyonuyla kalkar, toplamlar güncellenir. Son satır silinemez ya da silinirse boş durum görünür (aşağıda).
- **"Taslağı kaydet":** her kalemin açıklaması doluysa düğme meşgul olur, kalem listesi uygulamanın kaydet işlevine verilir ve beklenir; başarıda "Taslak kaydedildi", hata fırlarsa satır içi "Kaydedilemedi" ve yeniden denenebilir. Açıklaması boş kalem varsa kayıt gitmez, ilgili satır işaretlenir ve "Her kalem için açıklama girin" yazar.
- **Adet:** sıfırdan küçük girilemez (sıfıra sabitlenir); ondalık adet izinlidir.

## Durumlar

- **Hiç kalem yok:** "Henüz kalem yok" boş durumu ve "Kalem ekle".
- **Doğrulama:** boş açıklama, negatif fiyat işaretlenir; metin hem satırda hem durum satırında okunur.
- **Kayıt sürüyor:** düğme pasif, "Kaydediliyor…".
- **Kayıt hatası:** satır içi hata, düğme yeniden basılabilir.
- **Çok kalem:** birkaç düzine satıra kadar rahat; kalemler sanallaştırılmaz.
- **Dar kap (yaklaşık 760 px altı):** sütunlar daralır; **620 px altı** sütun başlığı gizlenir, her kalem etiketli alanlarıyla üst üste kart olur; **380 px altı** gönderen ve alıcı blokları alt alta.
- **Toplam doğruluğu:** ekrandaki toplam yalnızca gösterimdir; kayıtta ve gerçek belgede **toplam sunucuda yeniden hesaplanır**, gönderilen veri taslak sayılır.

## Klavye ve ekran okuyucu

- Toplam, canlı (`aria-live`, `aria-atomic`) bir çıktıdır; değişince bütünüyle okunur.
- Kayıt ilerlemesi ve doğrulama iletileri durum olarak (`role=status`) duyurulur.
- Her satırın alanları ve silme düğmesi kalem sırasına göre adlandırılır ("3. kalem adet").
- Tab sırası: kalem alanları satır satır, "Kalem ekle", not, "Taslağı kaydet".

## Hareket

- Toplam rakamları kısa dikey kayma ve bulanıklıkla değişir; eklenen ve silinen satırlar yükseklikle büyür/küçülür.
- **"Hareketi azalt" açıkken:** yalnız saydamlık değişir, süre sıfır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Birim fiyat, satır tutarı | para, TRY | `money.format` (iki ondalık) |
| Ara toplam, KDV, ödenecek toplam | para, TRY | `money.format` |
| KDV oranı | yüzde | `money.percent` (örn. oran proje ayarından) |
| Adet | sayı (ondalık olabilir) | `money.fmtDecimalGrouped` |
| Düzenleme sırasında yazılan sayı | giriş | virgül ondalık ayracı kabul edilir; saklama ve hesap `money` tamsayı küsurat (kuruş) mantığıyla yapılır, kayan noktayla değil |
| Belge tarihi / vade (varsa) | tarih | `date.format` |

KDV hesabı ve yuvarlama kuralı ABACUS'un para aracına bırakılır; bileşen kendi hesabını yapmaz, uygulamadan gelen hesap işlevini kullanır (kuruş yuvarlaması aynı yerden).

## Kurulacak SNN-UI parçaları

Katalogdan: `button`, `input`, `animated-counter` ya da `slot-text` (toplamlar), `empty-state`, `toast`/durum iletisi, `tooltip`.

Katalogda olmayan:
- `number-field` (adet ve fiyat; para simgeli girdi)
- `editable-table` ya da `line-items` (kalem satırı, ekle/sil, yükseklik animasyonu)
- `invoice-studio` kabuğu (taraf blokları, toplam bloğu, kayıt akışı)

## Türkçe ekran metinleri (öneri)

- Başlık: "Fatura" ya da "Teklif"; bloklar: "Gönderen", "Alıcı"
- Sütunlar: "İş / hizmet", "Adet", "Birim fiyat", "Tutar"
- Düğmeler: "Kalem ekle", "Taslağı kaydet"; satır silme etiketi: "{n}. kalemi sil"
- Toplam: "Ara toplam", "KDV · %{oran}", "Ödenecek toplam"
- Durum: "Taslak kaydedildi.", "Kaydedilemedi.", "Her kalem için açıklama girin."
- Boş: "Henüz kalem yok."

## Kapsam dışı (bilerek)

- Geçmiş faturaların listesi, ödeme alma, e-fatura/e-arşiv üretimi ve gönderimi (GİB entegrasyonu).
- Çoklu para birimi, iskonto, çoklu vergi oranı, satır başına KDV (sonraki sürüm).
- PDF çıktısı; sunucuda toplam doğrulaması uygulamanın işidir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; düzenleme ve kayıt akışı denenmedi, davranış sayfa metnindeki anlatımdan alındı. Metinler, örnek veriler, renk ve süre değerleri alınmadı.
