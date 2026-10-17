# Tarif: login-split (iki bölmeli giriş ekranı)

Temiz oda tarifi. Arc Pro'daki `login?variant=login-split` çeşidinin kodu okunmadı, sayfası açılmadı; tarif yalnız çeşidin adına ve yaygın giriş ekranı kalıbına dayanır. Yazan oturum yalnız bu dosyayı ve SNN-UI kataloğunu okur.

## Ne işe yarar

Ekranı ikiye bölen giriş sayfası: bir yanda giriş formu, öbür yanda ürünü tanıtan bir görsel bölme (fotoğraf ya da marka yüzeyi, kısa bir alıntı ve kimin söylediği). Formun dikkati dağılmaz; görsel bölme güven verir.

## Hangi aile projesinde ne için (tahmin)

- Kullanıcı girişi olan her proje (GHS-Panel, Portföy, Nakit akışı). Görsel bölmede şirket fotoğrafı ya da ürün ekran görüntüsü.
- Ortada tek kartlı sade giriş için `login-centered`; tam ekran fotoğraf üstünde kart için `login-immersive`.

## Bölümler

1. **Form bölmesi** (varsayılan sol): logo ve ürün adı (üst), başlık "Tekrar hoş geldiniz", alt başlık, e-posta alanı, parola alanı (göster/gizle), "Beni hatırla" onay kutusu ve "Parolamı unuttum" bağlantısı aynı satırda, birincil "Giriş yap" düğmesi, "ya da" ayracı, bir ya da iki sağlayıcı düğmesi (yalnız görünüm; ör. "Google ile devam et"), en altta "Hesabın yok mu? Kayıt ol".
2. **Görsel bölme** (varsayılan sağ): kenara taşan fotoğraf ya da foundation değişkenlerinden türetilmiş vurgu yüzeyi; üstünde alt kısımda bir alıntı ("…") ve kişi adı, unvanı, isteğe bağlı küçük kişi simgesi. İsteğe bağlı üstte küçük bir rozet ("SNN ailesi").
3. Bölme oranı geniş ekranda yaklaşık 1:1 (form en çok ~440 px genişlik, kendi bölmesinde ortalı).

## Kullanıcı ne yapar, ne olur

- **E-posta ve parola yazar, "Giriş yap"a basar:** düğme beklemeye geçer (dönen gösterge, odak düğmede kalır), `onSubmit({ email, password, remember })` sözü çözülünce başarı; reddedilirse form üstünde hata kutusu ("E-posta ya da parola hatalı.") ve parola alanı odağı alır.
- **Boş ya da biçimsiz e-posta:** gönderimde alan altında hata ("Geçerli bir e-posta yazın."); yazarken hata gösterilmez, alandan çıkınca ya da gönderimde gösterilir.
- **"Parolamı unuttum":** `onForgot(email)` çağrılır; bileşen sayfa değiştirmez.
- **Sağlayıcı düğmesi:** `onProvider(id)`; gerçek oturum açma yapılmaz.
- **Görsel bölme yer değiştirme:** `mediaSide="left" | "right"` prop'u.

## Durumlar

- **Dar ekran (kap 768 px altı):** görsel bölme gizlenir ya da formun üstünde ince bir şerit olur (yalnız fotoğraf, alıntı gizli); form tam genişlik, kenar boşluğu 16 px. Yatay kaydırma yok.
- **Fotoğraf yoksa ya da yüklenemezse:** vurgu renginden türetilmiş düz yüzey ve hafif doku; alıntı yine okunur.
- **Gönderiliyor:** alanlar ve düğmeler etkisiz, düğme "Giriş yapılıyor".
- **Hata:** form üstünde `role="alert"` kutusu, kırmızı yalnız gerçek hata için.

## Klavye ve ekran okuyucu

- Sekme sırası: e-posta → parola → göster/gizle → beni hatırla → parolamı unuttum → giriş yap → sağlayıcılar → kayıt ol.
- Görsel bölme süstür: fotoğraf `alt=""`, alıntı okunur ama sekme sırasında değil.
- Alanların etiketi görünür (yer tutucu etiket yerine geçmez), hata `aria-describedby` ile bağlı.
- Enter formu gönderir.

## Hareket

- Açılışta görsel bölme hafifçe yakınlaşarak (1.04 → 1) belirir, form öğeleri kısa kademeyle yükselir (motion-tokens).
- Hata kutusu yükseklik yayıyla açılır; parola alanı hata anında hafifçe sallanır.
- "Hareketi azalt" açıkken: kademe, yakınlaşma ve sallanma yok; durumlar anında.

## Görseller

Fotoğraf prop ile gelir (`media={{ src, alt }}`); bileşen dosya içermez. Galeride `playground/public/ornek-foto/` altındaki Unsplash fotoğrafları kullanılır. Marka işareti prop (`brand={{ name, mark }}`).

## Kurulacak SNN-UI parçaları

Katalogdan: `input` (e-posta), `password-field`, `checkbox`, `button`, `avatar` (alıntı sahibi). Doğrulama: ABACUS `validate` (e-posta).

## Türkçe ekran metinleri (öneri)

"Tekrar hoş geldiniz", "Hesabınıza giriş yapın", "E-posta", "Parola", "Beni hatırla", "Parolamı unuttum", "Giriş yap", "Giriş yapılıyor", "ya da", "Google ile devam et", "Hesabın yok mu?", "Kayıt ol", "Geçerli bir e-posta yazın.", "Parola boş olamaz.", "E-posta ya da parola hatalı."

## Yapılmayacaklar

Gerçek kimlik doğrulama, parola saklama, sağlayıcı bağlantısı. Bileşen yalnız görünüm ve olay çağrılarıdır.
