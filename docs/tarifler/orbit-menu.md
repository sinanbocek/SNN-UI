# Tarif: orbit-menu (basılı tutunca açılan, sürükleyerek seçilen eylem yayı)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur. Bu bileşende değer büyük ölçüde görünüştedir; bu tarif yalnız **işlevi** anlatır. Görünümü yazım oturumu SNN-UI değişkenleriyle kendisi kurar.

## Ne işe yarar

Bir nesne (not, fotoğraf, kayıt) üzerinde üç ila altı hızlı eylem sunan yuvarlak bir düğmedir. Düğmeye basılı tutulup eylemlerden birine doğru sürüklenip bırakılınca eylem çalışır; tek dokunuş menüyü açık bırakır, ikinci dokunuş kapatır. Menü uzun ya da yazı ağırlıklı listeler için değildir.

## Hangi aile projesinde ne için (tahmin)

- Bir kartın ya da kaydın hızlı eylemleri: sabitle, paylaş, sil gibi (Proje-ve-Nakit-Akış kartları, Portföy kayıtları, mobil ekranlar).
- Uzun liste için değil (`dropdown-menu`, `context-menu`); seçili kalan araçlar için değil (`dock`); tek eylem için değil (`button`).

## Bölümler

1. **Tetikleyici düğme:** yuvarlak; kapalıyken "daha fazla" anlamlı bir simge taşır.
2. **Eylem yayı:** her eylem bir yuvarlak düğme; simge ve ad; yön ve yayın genişliği seçilebilir ki menü boş alana açılsın.
3. **Etiket hapı:** hedeflenen eylemin adını, hedef dışına çıkılınca "Bırakınca iptal" yazısını, eylem çalışınca onay metnini gösterir.
4. **Eylem tanımı:** kimlik, ad, simge, isteğe bağlı onay metni ve ton (olağan ya da tehlikeli).
5. **Görünmez durum bölgesi:** onay metinlerini ekran okuyucuya iletir (kapatılabilir).

## Kullanıcı ne yapar, ne olur

- **Düğmeye basar ve sürükler:** yay açılır; imleç hangi eyleme doğru yöneliyorsa o hedeflenir (pasta menü gibi açıya göre; imlecin eyleme tam değmesi gerekmez, düğmenin yakınındaki küçük bir ölü bölge hariç).
- **Hedef üstünde bırakır:** eylem çalışır, etiket hapı onay metnini kısa süre gösterir, yay kapanır.
- **Yay dışında bırakır ya da sürüklemeden bırakır:** hiçbir eylem çalışmaz, yay kapanır.
- **Hedef dışına çıkarken:** etiket "Bırakınca iptal" der.
- **Tek dokunuş:** yay açık kalır; bir eyleme dokunmak onu çalıştırır; düğmeye yeniden dokunmak kapatır.
- **Klavye:** düğmede oklar yayı açar ve ilk eyleme (Yukarı ok sonuncuya) odaklar; eylemlerde oklar yay boyunca gezer; Home/End ilk-son; Enter/Boşluk odaktaki eylemi çalıştırır, düğmede açar/kapatır; Escape kapatır ve odağı düğmeye verir; Tab kapatıp ilerler.
- **Çalışan eylem:** eylem kimliği çağırana bildirilir.
- Açılış ve kapanış çağırana bildirilebilir.

## Durumlar

- **Kapalı / açık / hedefte / iptal bölgesinde / onayda.**
- **Devre dışı:** düğme etkisiz, yay kapanır.
- **Tehlikeli eylem:** ayrı ton; yalnız renk değil, adı da tehlikeyi söyler (örneğin "Sil").
- **Eylem sayısı:** üç ile altı; fazlası için bu bileşen değil.
- **Yer:** yay ekrana göre kısıtlanmaz; yön ve yarıçap boş alana açılacak biçimde seçilir. Çağıran bunu bilir.
- **Dokunmatik:** sürükleyerek seçme için sayfa kaydırması düğmede kapalıdır.

## Klavye ve ekran okuyucu

- Düğme `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`; adı değiştirilebilir ("Eylemler").
- Eylemler `menuitem`; kapalı menü etkileşime kapalı; gezen odak ile yalnız bir eylem sekme sırasında.
- Onay metinleri `role="status"` bölgesinde okunur.
- Yalnız hareketle seçilebilen bir şey yok: tüm eylemler klavyeyle ulaşılabilir.

## Hareket

- Eylemler yay boyunca sırayla belirir, kapanırken ters sırayla toplanır; hedef eylem vurgulanır, yakın eylemler imlece hafifçe yaklaşır (yalnız fareyle).
- Tetikleyici simgesi kapalıyken, açıkken ve onayda farklı bir anlam taşır (daha fazla, kapat, onay); etiket hapı metnine göre genişler.
- **"Hareketi azalt" açıkken:** savrulma, bulanıklık ve çekim yok; kısa solmalar ve anında konum değişimi.

## Görseller

Eylem simgeleri çağıran verir; yer tutucu simgeler kullanılır. Renkler değişkenlerden; tehlikeli ton kırmızı, amber yok.

## Sayılar ve biçim

Ekranda sayı yok.

## Kurulacak SNN-UI parçaları

Katalogdan: yok zorunlu. İsteğe bağlı: `button`.

Katalogda olmayan:
- `orbit-menu` (açıya göre hedefleyen yay menü)

## Türkçe ekran metinleri (öneri)

- Düğme adı: "Eylemler"; iptal: "Bırakınca iptal"
- Eylemler çağıranın; onay örnekleri: "Sabitlendi", "Silindi"

## Kapsam dışı (bilerek)

- Uzun ve yazılı menüler, seçili kalan araç çubuğu, sağ tık menüsü.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Bu bileşende yalnız işlev yazıldı: görünüş, eğri, süre, açı ve ölçü bilerek tarif edilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
