# Tarif: liquid-tab-bar (simgeli bölüm geçişi, kayan seçim)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur. Bu bileşende değer büyük ölçüde görünüştedir; bu tarif yalnız **işlevi** anlatır. Görünümü yazım oturumu SNN-UI değişkenleriyle kendisi kurar.

## Ne işe yarar

Uygulamanın birkaç eş bölümü arasında geçiş yapan simgeli bir sekme çubuğudur. Seçili sekme belirgin bir "seçim" yüzeyiyle gösterilir; seçim yeni sekmeye geçerken yüzey yer değiştirir. Sekmelere yeni öğe sayısı (rozet) konabilir. Seçim yüzeyi sürüklenip bırakılarak da değiştirilebilir.

## Hangi aile projesinde ne için (tahmin)

- Telefon boyutlu uygulama düzenlerinde ana bölümler (Gunum-Var, SNN-Games gibi mobil ekranlar), alt ya da üst çubuk.
- Yalnız yazılı panel sekmeleri için değil (`tabs`); küçük süzgeç/görünüm anahtarı için değil (`segmented-control`); site gezinmesi için değil (`morph-nav`).

## Bölümler

1. **Sekme listesi:** birkaç sekme, her birinde simge; isteğe bağlı etiket ve rozet.
2. **Seçili sekme göstergesi:** hangi sekmenin seçili olduğunu gösteren yüzey; seçili sekmenin simgesi dolu (etkin) biçimde görünür.
3. **Etiket modu (üç seçenek):** yalnız seçili sekmenin etiketi görünür / hepsinin etiketi görünür / hiçbirinin görünmez (yalnız simge).
4. **Rozet:** sekme üstünde yeni öğe sayısı; sayı değişince basamak değişimi görülür.
5. **Panel bağlantıları:** her sekmenin içerik paneline erişim kimliği üreten yardımcılar (panel bağlaması için).

## Kullanıcı ne yapar, ne olur

- **Bir sekmeye basar (tıklama/dokunma):** seçim o sekmeye geçer, değer değişimi çağırana bildirilir. Bileşen kontrollüdür; seçili değeri uygulama tutar.
- **Sol/Sağ ok:** önceki/sonraki sekme seçilir ve odak ona geçer (uçlarda başa sarar). Home/End: ilk/son sekme.
- **Seçim yüzeyini sürükler ya da fırlatır:** bıraktığı yerdeki en yakın sekme seçilir; hızlı bir fırlatma en az bir sekme ilerletir; uçlardan öteye direnç gösterir.
- **Fareyle başka bir sekmenin üstüne gelir:** seçim yüzeyi hafifçe o yöne meyleder (yalnız fareyle; dokunmatikte yok).
- **Seçim değişirken etiket:** eski etiket hemen söner, yenisi seçim yerine ulaşınca belirir; iki etiket aynı anda görünmez.
- **Rozet değişince:** yeni sayı eski sayının yerine döner gibi geçer.

## Durumlar

- **Seçili / seçili değil**, **etiket modu** (üç), **rozetli / rozetsiz**.
- **Sekme sayısı:** birkaç sekmeye göre tasarlanır; çok sekme için uygun değildir.
- **Dar alan:** çubuk kabın genişliğiyle sınırlıdır; yer darsa etiket modu "hiçbiri" yapılır. Dikey kaydırma bozulmaz; yatay sürükleme dokunmatikte seçim yüzeyini sürükler, sayfayı kaydırmaz.
- **Devre dışı / yükleniyor:** bileşende yok; uygulama sekmeyi çıkarır ya da rozeti göstermez.

## Klavye ve ekran okuyucu

- Sekme listesi: `tablist` rolü, adı değiştirilebilir ("Bölümler"); her sekme `tab`, `aria-selected`, `aria-controls`; yalnız seçili sekme sekme sırasında (gezen odak).
- Sekme adı rozeti de içerir; rozetin okunacak metni ("2 yeni") çağıran verir.
- Seçim yüzeyinin içindeki kopya süstür; ekran okuyucuya tek bir sekme kümesi sunulur.
- Panel yardımcıları: aynı taban kimliğiyle sekme kimliği ve panel kimliği üretir.

## Hareket

- Seçim yüzeyi yeni sekmeye tek bir şekil olarak yerini ve boyutunu değiştirir (esneme ya da ezilme yok); sürüklenince momentumla en yakın sekmede durur.
- Etiket açılması ve rozet basamak dönüşü yumuşaktır.
- **"Hareketi azalt" açıkken:** seçim yüzeyi ve etiketler yolculuk ve meyil olmadan yerlerine atlar.

## Görseller

Simgeler çağıran verir (SNN-UI simge seti); seçili hâl için isteğe bağlı ayrı "dolu" simge, yoksa aynı simgenin dolu hâli. Renkler değişkenlerden; amber yok.

## Sayılar ve biçim

Rozet bir adettir; `fmtDecimalGrouped`. Büyük sayılarda üst sınır ("99+") uygulamanın kararıdır.

## Kurulacak SNN-UI parçaları

Katalogdan: `badge` (rozet için bakılabilir; sayı değişimi için `animated-counter`).

Katalogda olmayan:
- `liquid-tab-bar` (kontrollü sekme çubuğu, seçim yüzeyi, sürükleme)

## Türkçe ekran metinleri (öneri)

- Liste adı: "Bölümler"; sekmeler çağıranın: "Ana sayfa", "Kayıtlılar", "Gelen kutusu", "Profil"
- Rozet okunuşu: "{n} yeni"

## Kapsam dışı (bilerek)

- Metin ağırlıklı panel sekmeleri, çok sekmeli çubuk, site gezinmesi, küçük görünüm anahtarı.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine ve sayfadaki düz metne bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizlemeyle etkileşilmedi. Bu bileşende yalnız işlev yazıldı: görünüş, eğri, süre ve ölçü bilerek tarif edilmedi. Metinler, örnek veriler, görseller, renk ve süre değerleri alınmadı.
