# Tarif: data-flow (veri akışı anlatım çizimi)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur. Bu bileşende değer büyük ölçüde görünüştedir; bu tarif yalnız **işlevi** anlatır. Akış görüntüsünün nasıl çizileceğini yazım oturumu SNN-UI değişkenleriyle kendisi kurar.

## Ne işe yarar

Verinin bir üründe nasıl aktığını anlatan hareketli bir şemadır: solda kaynaklar, ortada bir işleme noktası, sağda hedefler. Kayıtlar kaynaktan çıkar, işleme noktasında biçim değiştirir ve hedeflere dağılır. Bazı hedefler kayıtların yalnız bir kısmını alır. Bu bir **anlatım çizimidir**; gerçek veri hacmini ölçmez, gerçek veri göstermez.

## Hangi aile projesinde ne için (tahmin)

- Tanıtım ve belge sayfalarında "veri nasıl akar" bölümü: veri alımı, dönüştürme, yönlendirme, eşitleme (SNN-Piyasa-Core, Abacus tanıtımı, Ihale özet akışı anlatımı).
- Gerçek hacim göstermek için değil (`sankey-flow`); işin canlı durumu için değil; tek tek kayıt üzerinde işlem için değil (tablo).

## Bölümler

1. **Kaynaklar (üç okunur):** her birinin adı, ikinci satırı (dar düzende gizlenebilir), fareyle görünen ayrıntı satırı, simgesi.
2. **İşleme noktası:** adı, ayrıntı satırı ve canlı sayaç (sayının yanındaki sözcük ve başlangıç değeri verilebilir).
3. **Hedefler (üç okunur):** kaynaklarla aynı alanlar; isteğe bağlı **pay** değeri bir hedefin kayıtların yalnız bir kesrini aldığını söyler (örneğin uyarılar kayıtların küçük bir kısmını alır).
4. **Kayıtlar:** işlenmemiş kayıt ile işlenmiş kayıt farklı şekildedir (yalnız renk değil).
5. **Alt yazı (isteğe bağlı):** şemanın altında görünür açıklama.

## Kullanıcı ne yapar, ne olur

- **İzler:** akış kendi kendine döner; döngü zamanın saf bir fonksiyonudur, kesintisiz tekrarlanır.
- **Fareyle bir düğümün üstüne gelir:** o düğümün yolu ve kayıtları vurgulanır, tek satırlık bir ayrıntı etiketi çıkar; akış hafifçe yavaşlar. Dokunmatikte etiket yok, şema aynı.
- **Hız ve duraklatma:** uygulama verir; değişim yumuşakça olur, duraklatınca bir anda değil, yavaşlayarak durur; hız sıfır akışı tutar.
- **Ekran dışında ya da sekme gizliyken:** akış durur.
- Düğme, giriş alanı yok; düğümler denetim değildir, sekme sırasında yer almaz.

## Durumlar

- **Çalışıyor / duraklatıldı / hız sıfır.**
- **Hareketi azalt:** tek durağan kare: her giriş yolunda bir işlenmemiş kayıt, her çıkış yolunda bir işlenmiş kayıt.
- **Sayaç:** işlenen kayıt sayısı artarak yazılır; geriye sıçramaz.
- **Pay verilen hedef:** kayıtların yalnız o kesri o hedefe gider; şema doğruyu söylemelidir.
- **Genişlik:** geniş düzende soldan sağa; dar düzende yukarıdan aşağıya (kaynaklar bir satırda üstte, hedefler altta). Şema gerçek piksel ölçüsüyle çizilir, her genişlikte keskin.
- **Etiketler:** bir ya da iki sözcük; ürün adı ikinci satıra.

## Klavye ve ekran okuyucu

- Şema tek bir `role="img"`; etiketi tüm akışı anlatır (kaynaklar, işleme, hedefler); verilmezse adlardan üretilir.
- Düğümler denetim olmadığından sekme sırasında değil; hover etiketi isteğe bağlı tekrar bilgidir.
- Durum yalnız renkle verilmez: işlenmemiş ve işlenmiş kayıt farklı şekildedir.
- İsteğe bağlı görünür alt yazı açıklamadır.
- Klavye odağı geldiyse paylaşılan odak halkası görünür.

## Hareket

- Tek bir çizim döngüsü yalnız değişen değerleri yazar; bileşen kare başına yeniden çizilmez.
- Kayıtlar kaynaktan işleme noktasına, oradan hedeflere eşit hızda ve her ayakta yumuşak başlayıp biten biçimde gider; işleme noktasında kayıt biçim değiştirir, çıkışta hedeflere dağılır.
- Kayıt çıktığında ve vardığında ilgili kapılar ve düğüm kenarları kısa süre vurgulanır.
- Hız, duraklatma ve hover yavaşlaması sönümlü yayla.
- **"Hareketi azalt" açıkken:** yukarıdaki tek durağan kare.

## Görseller

Gerçek görsel yok; kaynak ve hedef için simge (çizim yolu, görsel adresi ya da herhangi bir düğüm) ve her düğüm için isteğe bağlı renk. Marka simgeleri yalnız ürün hikâyesi için anlamlıysa kullanılır; yazım oturumu yer tutucu simgelerle yazar, Arc'ın simgeleri alınmaz.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| İşlenen kayıt sayısı | adet | `fmtDecimalGrouped` + `animated-counter` (tabular rakam) |

Sayaç başlangıcı uygulamadan verilir; bileşende sabit değil.

## Kurulacak SNN-UI parçaları

Katalogdan: `animated-counter`.

Katalogda olmayan:
- `flow-diagram` (düğümler, yollar, yolda ilerleyen kayıt; tek döngü saati; dalga 3'te `payment-flow` tarifinde de aynı parça adı geçti, ortak yazılır)
- `data-flow` kabuğu

## Türkçe ekran metinleri (öneri)

- Düğümler çağıranın; örnek roller: "Uygulama", "Veritabanı", "Olaylar", "Depo", "Gösterge paneli", "Uyarılar"
- İşleme: "Dönüştür", sayaç sözcüğü "işlendi"

## Kapsam dışı (bilerek)

- Gerçek hacim gösterimi, canlı iş durumu, tek tek kayıt işlemi.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Bu bileşende yalnız işlev yazıldı: görünüş, eğri, süre ve ölçü bilerek tarif edilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
