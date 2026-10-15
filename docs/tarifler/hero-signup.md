# Tarif: hero-signup (bekleme listesi karşılama bölümü)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Sayfanın ilk ekranını dolduran, tek e-posta alanı olan karşılama bölümü. Arka planda yavaşça akan yumuşak bir renk geçişi vardır. Alan yazarken sakin biçimde doğrulanır; gönderince düğme alanın tamamına yayılıp "listedeki sıran" onayına dönüşür.

## Hangi aile projesinde ne için (tahmin)

- Yeni ürün duyuran, bekleme listesi ya da erken erişim toplayan açılış sayfaları (SNN-Games, Gunum-Var gibi projelerin tanıtım sayfaları).
- Parola ya da onay isteyen kayıt için değil; sayfa altındaki bülten kutusu için değil.

## Bölümler

1. **Arka plan:** yavaş akan renk geçişi; vurgu renginden türetilir, açık temada soluk, koyu temada derin.
2. **Başlık ve alt cümle:** başlık kelime kelime yükselerek gelir.
3. **E-posta alanı ve düğme:** tek satır; çok dar kapta düğme etiketi kısalır ("Katıl").
4. **Alt not satırı:** sakin bir güvence cümlesi; doğrulama iletisi, yazım düzeltme önerisi, hata ve onay aynı yerde bunun yerine geçer. Satır yüksekliği ayrılmıştır; mesaj çıkınca alttaki içerik oynamaz.
5. **Onay durumu:** "Listede {sıra}. sıradasınız"; sıra rakam rakam döner; "E-postayı değiştir" bağlantısı.
6. **Sosyal kanıt:** en çok beş küçük portre, "{n} kişi listede" (sayı döner, katılınca bir artar).

## Kullanıcı ne yapar, ne olur

- **Yazar:** ilk adres yazılırken hiçbir hata gösterilmez; alandan çıkınca ya da gönderince belirli iletiler çıkar ("@ eksik", "alan adı tamamlanmamış"). Bilinen bir yazım hatası varsa düzeltme önerilir ve tek tıkla uygulanır.
- **Enter ya da "Katıl":** düğme yerinde dönen halkaya geçer (boyutu değişmez); tekrar basmak ikinci kez kaydetmez.
- **Başarı:** düğmenin biçimi alanın tamamına yayılır ve onaya dönüşür; sıra döner; odak onaya taşınır.
- **Hata:** iletisi alt notta, "Tekrar dene" bağlantısı; alan hafif sallanabilir.
- **"E-postayı değiştir":** forma döner, odak alana gider.

## Durumlar

- **Boşta, gönderiliyor, hata, başarı** (dışarıya durum değişimi bildirilmeli).
- **Geçersiz e-posta:** satır içi, belirli ileti.
- **Genişlik:** tam bir ekran yüksekliği doldurur (mobil adres çubuğunu hesaba katar), içerik dikey ortada; 320 px'e kadar çalışır; başlık kapla ölçeklenir; sosyal kanıt dar kapta alt alta. Telefonda yazı 16 px altına inmez, tüm hedefler en az 44 px.

## Klavye ve ekran okuyucu

- Gerçek bir form: e-posta türü, e-posta otomatik tamamlama, e-posta klavyesi, "gönder" tuşu. Enter gönderir; Tab alandan düğmeye, sonra satır içi eylemlere (düzeltme, tekrar dene, değiştir) gider.
- İletiler `aria-describedby` ve `aria-invalid` ile alana bağlı; yalnız alandan çıkınca ya da gönderince.
- Gönderiliyor, başarı, hata kibar durum bölgesinde duyurulur; başarıda odak onaya, "değiştir"de alana gider.
- Düğme meşgulken odaklanabilir kalır, tekrar basışı yok sayar.

## Hareket

- Başlık kelime kelime yükselir, ardından alt cümle, alan, sosyal kanıt.
- Gönderiliyorda etiket halkayla soluk geçer, düğme boyutu sabit. Başarı tek bir uzamsal geçiştir: düğme alanı kaplar, onaya döner, sıra rakam rakam döner.
- Arka plan yavaş, dikişsiz bir döngüyle akar; ekran dışında ve sekme gizliyken durur. Tarayıcı bu çizimi desteklemezse aynı renkler düz geçişle verilir.
- **"Hareketi azalt" açıkken:** arka plan tek durağan kare, yükselme ve dönme yok, durumlar anında değişir.

## Görseller

Sosyal kanıt için en çok beş küçük portre (avatar). Başka görsel yok. Yazım oturumu yer tutucu avatar kullanır.

## Para ve kart alanları

Para ve kart alanı yok. E-posta alanı için `giris-alanlari-standardi.md` (yazarken süzme: boşluk kırpma, küçük harf; kaydederken doğrulama) ve ABACUS `validate` e-posta kuralı kullanılır.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Listedeki kişi sayısı | adet | `money.fmtDecimalGrouped` + `animated-counter` |
| Sıra | adet | `animated-counter` |

## Kurulacak SNN-UI parçaları

Katalogdan: `input`, `button`, `animated-counter`, `avatar`.

Katalogda olmayan:
- `mesh-background` (akan renk geçişi; durağan yedek)
- `email-field` (sakin doğrulama, yazım düzeltme önerisi)
- `hero-signup` kabuğu

## Türkçe ekran metinleri (öneri)

- "E-posta adresi", "Listeye katıl", "Katıl", "Listede {sıra}. sıradasınız", "{n} kişi listede"
- Not: "Davetiniz hazır olunca tek e-posta alırsınız."
- Hata: "Yerinizi kaydedemedik.", "Tekrar dene", "E-postayı değiştir", "Şunu mu demek istediniz: {öneri}?"

## Kapsam dışı (bilerek)

- Parolalı kayıt, SSO seçimi, onay kutuları; bülten kutusu; kaydı saklayan servis (uygulama bağlar).

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi; form denenmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
