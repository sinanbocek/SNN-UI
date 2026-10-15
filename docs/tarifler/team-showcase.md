# Tarif: team-showcase (görsel ekip tanıtımı)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Ekibi portre ağırlıklı tanıtan bölüm. Dört yerleşimden biriyle çalışır: galeri, film şeridi, dizin, ön plan. Bir kişiye basınca profili yerinde açılır: unvan, şehir, kısa tanım, kopyalanabilir iletişim bilgileri.

## Hangi aile projesinde ne için (tahmin)

- Hakkımızda ya da şirket sayfaları. İç, aranabilir kişi listesi için `team-directory`; üye ve rol yönetimi için `team-members`; müşteri alıntıları için `testimonial-stage`.

## Bölümler

1. **Başlık:** "Ekiple tanışın".
2. **Yerleşim seçimi:** yalnız tanıtım ortamında (demo) görünür; üretimde sabit bir yerleşim seçilir.
3. **Kişi görünümü** (yerleşime göre):
   - **Galeri:** portre kartları ızgarası, seçili profil ayrıntısı altında ya da yanında.
   - **Film şeridi:** yatay portre şeridi, seçileni öne çıkar.
   - **Dizin:** satır satır liste; satır açılınca profil içinde açılır.
   - **Ön plan:** büyük portre bir tarafta, ad ve tanım diğer tarafta; küçük seçici.
4. **Profil ayrıntısı:** ad, unvan, şehir ve ülke, tanım paragrafı, e-posta ve telefon (her biri kopyalama düğmeli).
5. **Sayaç:** "1 / 5" ve seçili kişinin erişilebilir adı.

## Kullanıcı ne yapar, ne olur

- **Kişiye basar:** profil yerinde soluk geçişle açılır; dizinde satır yüksekliği animasyonuyla genişler; seçili kişi görünüme kaydırılır.
- **Kopyala düğmesi:** e-posta ya da telefonu panoya alır; düğme kısa süre onay gösterir ("Kopyalandı").
- **Seçim dışarı bildirilir** (profil sayfasına gitmek ya da istatistik için).
- **Dar kapta galeri ve film şeridi** yatay yapışmalı kaydırıcı olur.

## Durumlar

- **Kopyalandı / kopyalanamadı** geri bildirimi.
- **Profilde iletişim yok:** satır gizlenir (iletişim bilgisi kişi başına isteğe bağlı olmalı; herkese açık sayfada bilgi kasıtlı verilir).
- **Genişlik:** kap boyut kabıdır; 760 px altında başlık yığılır, ayrıntı fotoğrafın altına iner; 440 altında galeri ve film şeridi yatay kaydırıcıya, ön plan alt alta dönüşür.

## Klavye ve ekran okuyucu

- Seçim düğmeleri `aria-pressed`; dizin satırları `aria-expanded` ve `aria-controls`.
- Profil değişimleri canlı bölgede duyurulur. Kopyala düğmeleri kişi adıyla etiketli ("{ad} e-postasını kopyala").

## Hareket

- Profiller soluk geçer ve yerinde genişler; seçili kişi yumuşak kaydırmayla görünüme alınır.
- **"Hareketi azalt" açıkken:** kayma ve yükseklik animasyonu yok; kaydırma anında.

## Görseller

Her kişi için portre (avatar). Yerleşime göre farklı boyda yüklenir. Yazım oturumu yer tutucu portre kullanır. Gerçek sitede yalnız izin alınmış portre ve bilgi kullanılır.

## Para ve kart alanları

Yok.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Sıra sayacı "n / toplam" | adet | `money.fmtDecimalGrouped` |
| Telefon | metin | biçim uygulamadan; ekranda `mask` ile gösterim istenirse ABACUS `mask` |

## Kurulacak SNN-UI parçaları

Katalogdan: `avatar`, `button`, `segmented-control`, `card`.

Katalogda olmayan:
- `copy-button`
- `team-showcase` kabuğu (dört yerleşim, yerinde profil)

## Türkçe ekran metinleri (öneri)

- "Ekiple tanışın", "E-postayı kopyala", "Telefonu kopyala", "Kopyalandı", "Galeri / Film şeridi / Dizin / Ön plan"

## Kapsam dışı (bilerek)

- İç kişi arama (`team-directory`), üye yönetimi (`team-members`), müşteri alıntıları.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi; yerleşimler tek tek denenmedi, davranış sayfa metninden alındı. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
