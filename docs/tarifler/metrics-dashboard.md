# Tarif: metrics-dashboard (özet gösterge paneli)

Temiz oda tarifi. Yazan oturum Pro sayfasını açmaz; yalnız bu dosyayı okur.

## Ne işe yarar

Dört ana göstergeyi sekme gibi sıralar; seçilen gösterge altındaki tek çizgi grafikte görülür. Üstte dönem anahtarı (7/30/90 gün) vardır. Grafiğin altında iki sıralı liste (örn. en çok bakılan sayfalar ve kaynaklar) yatay oran çubuklarıyla durur. Küçük, gezilebilir bir özet içindir; büyük ya da derine inen veri için `metric-explorer`/`revenue-explorer`.

## Hangi aile projesinde ne için (tahmin)

- GHS-Panel: satış özeti (ciro, sipariş, dönüşüm, iptal oranı) ve en çok satan ürünler/kanallar.
- SNN-Proje-ve-Nakit-Akis-Yonetimi: gelir, gider, net nakit, tahsilat gecikmesi; en büyük kalemler listesi.
- SNN-Ihale-Maliyet-Teklif-Yonetimi: aktif teklif sayısı, toplam tutar, kazanma oranı; en çok teklif verilen kurumlar.

## Bölümler

1. **Başlık satırı:** başlık, alt satırda kaynak ve seçili dönem ("Son 30 gün"). Sağda dönem anahtarı (kayan göstergeli) ve "Dışa aktar" düğmesi.
2. **Gösterge sekmeleri:** dört kutu yan yana; her birinde ad, büyük değer ve işaretli değişim (ok + işaret + renk). Seçili sekmenin altında çizgi.
3. **Grafik:** seçili göstergenin gün gün çizgisi (90 günde haftalık). Sağ üstte gösterge adı ve "Karşılaştır" kutusu (önceki dönem çizgisi).
4. **Grafik gezgini:** fare ya da oklarla gezilen nokta; ipucunda tarih ve değer.
5. **İki liste:** "En çok bakılanlar" ve "Kaynaklar"; her satırda ad, sağda değer, arkada orana göre dolan çubuk.

## Kullanıcı ne yapar, ne olur

- **Dönem seçer:** dört değer, değişim yüzdeleri, grafik ve listeler yeni döneme geçer; sayılar döner.
- **Gösterge sekmesine basar:** vurgu çizgisi kayar, grafik yeni göstergeye çapraz solarak geçer.
- **"Karşılaştır"ı açar:** önceki dönemin soluk çizgisi grafiğe eklenir; kapatınca solar.
- **Grafiğin üstüne gelir/oklarla gezer:** nokta ilerler, ipucu tarih ve değeri verir; Home/End ilk/son nokta.
- **"Dışa aktar":** yerel onay iletisi gösterir (dışa aktarmayı uygulama bağlar).
- **Dokunmatik:** nokta seçimi odak ve oklarla; fare üstü yoktur.

## Durumlar

- **Veri yok:** soluk "Bu dönem için veri yok" alanı.
- **Yükleniyor:** dört gösterge kutusu ve grafik iskeleti.
- **Hata:** satır içi "Yüklenemedi" ve "Yeniden dene".
- **Daralan değişim:** değişim hep işaret + ok yönüyle yazılır, yalnız renkle değil.
- **Daha dar kap (yaklaşık 640 px altı):** gösterge sekmeleri 2×2 olur, iki liste alt alta yığılır.
- **Çok dar (yaklaşık 460 px altı):** dolgu daralır, dönem anahtarı ve eylemler tam genişlik olur, değerler küçülür, grafik alçalır.
- **Düzen, pencereye değil bileşenin kendi genişliğine bakar** (dar yan panelde de çalışır).

## Klavye ve ekran okuyucu

- Tab sırası: dönem anahtarı, dışa aktar, gösterge sekmeleri, karşılaştır, grafik.
- Dönem düğmeleri `aria-pressed`; gösterge kutuları sekme (`aria-selected`).
- Grafik görsel tanımlı (`img`), gezilen değer durum ipucuyla (kibar canlı bölge) duyurulur.
- Değişimler metinle yön söyler ("yüzde 11,7 arttı").

## Hareket

- Gösterge değerleri ve liste sayıları yeni değere sayarak geçer (sabit genişlikli rakamlarla).
- Dönem kaydırgacı ve sekme çizgisi yayla kayar; grafik gösterge ve dönem değişiminde çapraz solar.
- **"Hareketi azalt" açıkken:** değerler ve görünümler anında değişir.

## Sayılar ve biçim

| Ekrandaki sayı | Tür | Biçimleme |
|---|---|---|
| Ciro, tutar göstergeleri | para, TRY | `money.format` (kutuda `money.compactMajor`) |
| Ziyaretçi, sipariş, adet | adet | `money.fmtDecimalGrouped` |
| Dönüşüm, iptal oranı | yüzde | `money.percent` |
| Değişim (arttı/azaldı) | yüzde değişim | `math.percentChange`, `money.percent`; oran göstergelerinde fark "puan" olarak ("+0,1 puan") |
| Liste değerleri | adet | `money.fmtDecimalGrouped` |
| Grafik ekseni | para ya da adet | `money.compactMajor` |
| Eksen/ipucu tarihleri | tarih | `date.format`, `date.dayName`, `date.monthName` |

`Intl` yok; ondalık ayraç virgül, binlik ayraç nokta.

## Kurulacak SNN-UI parçaları

Katalogdan: `metric-card` (gösterge kutuları, sekme davranışı üstüne eklenecek), `line-chart` (ana grafik, önceki dönem çizgisi), `sparkline`, `animated-counter`, `bar-chart` (liste çubukları yerine ilke olarak yatay oran çubuğu), `button`, `tooltip`, `skeleton`, `empty-state`.

Katalogda olmayan:
- `segmented-control` (dönem anahtarı, kayan gösterge)
- `tabs` (gösterge sekmeleri; `metric-card` ile birleştirilebilir)
- `ranked-list` (oran çubuklu sıralı liste)
- `metrics-dashboard` kabuğu

## Türkçe ekran metinleri (öneri)

- Dönem: "7 gün", "30 gün", "90 gün"
- Düğme: "Dışa aktar", onay: "Dışa aktarma hazırlanıyor"
- Grafik: "Karşılaştır" (önceki dönem)
- Liste başlıkları: "En çok bakılanlar", "Kaynaklar"; sütun adı "Ziyaretçi"
- Boş: "Bu dönem için veri yok." / Hata: "Yüklenemedi." / "Yeniden dene"

## Kapsam dışı (bilerek)

- Çok sayıda gösterge ya da derine inme (`kpi-drilldown`, `metric-explorer`).
- Gerçek zamanlı akış (`realtime-stream`).
- Veri kaynağı bağlantısı: günlük seri ve listeleri uygulama verir.

## Kaynak

uiarc.dev Pro sayfasının önizlemesine bakıldı (2026-10-15); kod sekmesi, kaynak, ağ istekleri açılmadı. Önizleme ve sayfadaki düz metin okundu; metinler, örnek veriler, renk ve süre değerleri alınmadı.
