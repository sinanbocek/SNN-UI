# Tarif: login-immersive (tam ekran görselli giriş ekranı)

Temiz oda tarifi. Arc Pro'daki `login?variant=login-immersive` çeşidinin kodu okunmadı, sayfası açılmadı; tarif yalnız çeşidin adına ve yaygın "sürükleyici" giriş ekranı kalıbına dayanır. Yazan oturum yalnız bu dosyayı ve SNN-UI kataloğunu okur.

## Ne işe yarar

Bütün ekranı kaplayan bir fotoğraf (ya da yavaş hareket eden renk alanı) üstünde, yarı saydam buzlu cam bir kartta giriş formu. Marka hissi güçlü, form sade. Tanıtım ağırlıklı ürünler ve davetle girilen alanlar için.

## Hangi aile projesinde ne için (tahmin)

- Vitrin ağırlıklı projeler (Naturapan, SNN-Games), etkinlik ya da davet sayfaları.
- İş ekranlarında sade giriş için `login-centered`; görsel yanında form için `login-split`.

## Bölümler

1. **Arka plan:** kabı kaplayan fotoğraf (`object-fit: cover`, odak noktası prop ile) ve üstünde okunurluk için koyulaştıran degrade (alttan ve kenarlardan). Fotoğraf yoksa foundation vurgu renginden türetilmiş, çok yavaş kayan iki renk lekesi (düz yüzeye düşebilir).
2. **Üst şerit:** sol üstte marka işareti ve adı (açık renk, arka plan üstünde), sağ üstte isteğe bağlı küçük bağlantı ("Yardım").
3. **Cam kart** (ortada ya da `cardAlign="center" | "end"` ile sağa yakın): buzlu arka plan (`backdrop-filter: blur`), ince açık kenar, gölge. İçinde başlık "Giriş yap", alt başlık, e-posta, parola (göster/gizle), "Parolamı unuttum", birincil "Giriş yap" düğmesi, isteğe bağlı sağlayıcı düğmeleri, altta "Hesabın yok mu? Kayıt ol".
4. **Alt bilgi:** sol altta fotoğraf künyesi (isteğe bağlı, "Fotoğraf: …"), sağ altta küçük yasal bağlantılar.

## Kullanıcı ne yapar, ne olur

- Form davranışı `login-split` ile aynı: gönderimde bekleme, `onSubmit({ email, password })` sözü, hata kutusu, alan hataları gönderimde ya da alandan çıkınca.
- **Fare hareketi (yalnız fare, hareket açıkken):** arka plan fotoğrafı imleç yönünde çok az kayar (en çok 8 px, yaylı); kart sabit.
- **"Parolamı unuttum", sağlayıcı, kayıt ol:** yalnız olay çağrıları (`onForgot`, `onProvider`, `onSignUp`).

## Durumlar

- **Dar ekran (kap 640 px altı):** kart tam genişliğe yakın (16 px kenar), arka plan yine görünür; alt bilgi kartın altına iner. Yatay kaydırma yok.
- **Saydamlığı azalt / yüksek karşıtlık:** kart düz yüzeye (`--surface-raised`) döner, bulanıklık kalkar.
- **Fotoğraf yüklenemezse:** renk lekeleri arka planı.
- **Okunurluk:** kart içindeki yazılar foundation renklerinde; kart dışındaki açık yazılar degrade sayesinde en az 4,5:1 karşıtlık.

## Klavye ve ekran okuyucu

- Arka plan süstür (`alt=""`, `aria-hidden`); künye metni okunur.
- Sekme sırası: marka bağlantısı → yardım → kart alanları → giriş → sağlayıcılar → kayıt ol → alt bağlantılar.
- Kart bir `form`; başlığı formu adlandırır (`aria-labelledby`).

## Hareket

- Açılışta arka plan 1.06 → 1 yakınlaşarak, kart altından hafif bulanıklıktan netleşerek gelir (motion-tokens).
- Hata kutusu yükseklik yayıyla; parola alanı hata anında hafifçe sallanır.
- "Hareketi azalt" açıkken: kayma, yakınlaşma ve bulanık giriş yok.

## Görseller

Fotoğraf prop ile (`media={{ src, alt, position, credit }}`); bileşen dosya içermez. Galeride `playground/public/ornek-foto/` altındaki Unsplash fotoğrafı.

## Kurulacak SNN-UI parçaları

Katalogdan: `input`, `password-field`, `button`. Doğrulama: ABACUS `validate` (e-posta).

## Türkçe ekran metinleri (öneri)

"Giriş yap", "Devam etmek için hesabınıza girin", "E-posta", "Parola", "Parolamı unuttum", "Giriş yapılıyor", "ya da", "Google ile devam et", "Hesabın yok mu?", "Kayıt ol", "Yardım", "Fotoğraf: {künye}", "Geçerli bir e-posta yazın.", "Parola boş olamaz.", "E-posta ya da parola hatalı."

## Yapılmayacaklar

Gerçek kimlik doğrulama, parola saklama, sağlayıcı bağlantısı, video arka plan.
