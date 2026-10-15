# Kaynak kaydı

Her parça Arc'tan alındı: `kuratlielia/arc-library`, commit **`bfdf7e8`** (2026-10-14), MIT lisansı.
Bu dosya her parçanın Arc'taki yerini ve yapılan uyarlamayı yazar. Arc güncellenince hangi parçanın neyi değiştirdiği buradan izlenir.

## Her parçada ortak uyarlamalar

1. **İçe aktarma yolu:** `@/lib/motion-tokens` → `../lib/motion-tokens`. Kurulumda bütün dosyalar `components/snn/` altında Arc'ın düzeniyle durur; yol projenin `@/` ayarına bağlı kalmaz.
2. **Kod yorumları Türkçe** (`kod-dili-standardi.md`). Yorumdaki kod adları ve tırnak içindeki örnek prop değerleri ("More actions", "12 characters" gibi) olduğu gibi kaldı. Kod, tanımlayıcı ve CSS kuralı değişmedi; her dosyada satır sayısı aynı.
3. **Kurulum yeri:** Arc `components/arc/` altına kurar; SNN-UI `components/snn/` altına kurar.

## Temel dosyalar

| Parça | Arc'taki yer | Uyarlama |
|---|---|---|
| `snn-foundation` | `registry/foundation.css` | Aşağıdaki "Renk farkları" |
| `snn-motion-tokens` | `registry/motion-tokens.ts` | Yorumlar Türkçe. Arc'taki `lib/motion-tokens.ts` yönlendirme dosyası alınmadı; tek dosya `lib/motion-tokens.ts` olarak kurulur. |

### Renk farkları (`snn-foundation.css`)

| Arc | SNN | Neden |
|---|---|---|
| `--warning: oklch(58% .18 75)` (amber), koyu: `oklch(83% .17 80)` | `oklch(50% .09 255)` (mavi-gri), koyu: `oklch(78% .08 255)` | Amber/turuncu uyarı rengi yasak (`arayuz-standardi.md` §1) |
| `data-accent="amber"` (açık, koyu, denetim dolgusu) | yok | Aynı kural |
| `data-accent="orange"` (açık, koyu, denetim dolgusu) | yok | Turuncu da kural kapsamında (ton açısı ~51–63) |
| `--arc-gradient*` (lavanta → şeftali, 7 değişken) | yok | Şeftali ucu amber aralığında (ton 55–70); ilk raftaki hiçbir bileşen kullanmıyor |
| `--series-1` … `--series-4` grafik paleti | yok | Yedek renk `#e58f00` amber; göreli renk formülü vurguya göre amber ton üretebiliyor (mavi vurguda seri 3 ≈ 74°). Grafikler 2. rafta yeniden kurulur |

Koruma: `test/amber.test.mjs` registry altındaki her CSS dosyasında amber/turuncu tonu (OKLCH açısı 50–95, doygunluk ≥ 0,03), sabit tonu olmayan göreli rengi ve `data-accent="amber|orange|yellow"` seçeneğini arar. Arc'ın özgün dosyasında 46 bulgu verir; bu dosyada 0. Sabotaj: `npm run sabotage`.

## Bileşenler (ilk raf, 19)

| Parça | Arc'taki yer | Türkçeye çevrilen ekran metni |
|---|---|---|
| `button` | `registry/components/button` | — (metin kullanıcıdan gelir) |
| `button-group` | `registry/components/button-group` | — |
| `input` | `registry/components/input` | — |
| `textarea` | `registry/components/textarea` | — |
| `select` | `registry/components/select` | Varsayılan `placeholder`: "Select an option" → "Bir seçenek seçin" |
| `checkbox` | `registry/components/checkbox` | — |
| `switch` | `registry/components/switch` | — |
| `radio-group` | `registry/components/radio-group` | — |
| `dialog` | `registry/components/dialog` | Kapat düğmesi: "Close dialog" → "Pencereyi kapat" |
| `dropdown-menu` | `registry/components/dropdown-menu` | — |
| `popover` | `registry/components/popover` | — |
| `tooltip` | `registry/components/tooltip` | — |
| `tabs` | `registry/components/tabs` | "Scroll tabs left/right" → "Sekmeleri sola/sağa kaydır" |
| `card` | `registry/components/card` | "Close quick look" → "Hızlı bakışı kapat" |
| `toast` | `registry/components/toast` | "Dismiss notification" → "Bildirimi kapat" |
| `empty-state` | `registry/components/empty-state` | — |
| `skeleton` | `registry/components/skeleton` | Varsayılan `label`: "Loading content" → "İçerik yükleniyor" |
| `pagination` | `registry/components/pagination` | "Pagination" → "Sayfalama", "Previous page" → "Önceki sayfa", "Page N" → "Sayfa N", "Next page" → "Sonraki sayfa" |
| `search-field` | `registry/components/search-field` | "Clear search" → "Aramayı temizle" |

## Plandan sapma: `metric-card` alınmadı

Plan §6.4 ilk rafa 20 bileşen yazar; `metric-card` A sınıfı sayılmıştı (`docs/arc-siniflandirma.md`).
Ölçüm (2026-10-14): Arc'ın kurulum kaydında `metric-card`, `animated-counter` bileşenini de getirir.
`animated-counter` sayıyı `Intl.NumberFormat` ile ve varsayılan `locale = "en-US"` ile biçimler (`1,234`); `metric-card` de değeri virgülü atarak okur.
İkisi de B sınıfıdır (`giris-alanlari-standardi.md`). Sınıflandırma taraması yalnız bileşenin kendi klasörüne bakmıştı, bağımlılığı görmemişti.
`metric-card` 2. rafta ABACUS ile gelir.

## Ortak parçalar (Pro-esinlenme bileşenleri için)

| Parça | Kaynak | Not |
|---|---|---|
| `save-bar` | Arc'tan alınmadı; sıfırdan yazıldı | Arc Pro settings-page'den esinlenildi; kod okunmadı; tarif: docs/tarifler/settings-page.md. Sayı düz metin olarak değişir; Arc'ın `slot-text` / `animated-counter` bileşenleri kullanılmadı (B sınıfı). Kısayol `event.code` ile okunur (`toLowerCase` yok). |

## Ortak parçalar: Arc'tan uyarlananlar (Pro-esinlenme bileşenleri için)

Arc commit'i `bfdf7e8`. Ortak uyarlamalar (içe aktarma yolu, Türkçe yorum, kurulum yeri) yukarıdaki üç madde gibidir; satır sayısı korunmuştur (aşağıda belirtilen yerler dışında).

| Parça | Arc'taki yer | Uyarlama |
|---|---|---|
| `badge` | `registry/components/badge` | Yalnız yorumlar Türkçe. |
| `breadcrumb` | `registry/components/breadcrumb` | `@/lib/arc-provider` içe aktarması kalktı: `ArcLink` yerine düz `<a>` (SNN-UI'de `arc-provider` yok; yönlendirici bağlantısı gerekirse proje `onClick` kullanır). Varsayılan `ariaLabel`: "Breadcrumb" → "Yol izi". |
| `progress` | `registry/components/progress` | Varsayılan `aria-label`: "Progress" → "İlerleme". Sayaç `Math.round` ile düz yüzde yazar; `Intl` yok. |
| `segmented-control` | `registry/components/segmented-control` | Yalnız yorumlar Türkçe. |
| `drawer` | `registry/components/drawer` | Yorumlar Türkçe; "Close drawer" → "Çekmeceyi kapat". |
| `combobox` | `registry/components/combobox` | **B sınıfı, ABACUS'a bağlandı.** Süzmedeki iki `toLocaleLowerCase` yerine `text.searchKey` (`import { text } from "@snn/abacus-core"`). "İstanbul", "Istanbul", "istanbul" aynı sonucu bulur. Varsayılan metinler: "Search or select…" → "Ara ya da seç…", "No matches found" → "Eşleşme bulunamadı", "Clear selection" → "Seçimi temizle", "{label} options" → "{label} seçenekleri". İki satır eklendi (içe aktarma, açıklama yorumu). |
| `avatar` | `registry/components/avatar` | **B sınıfı, ABACUS'a bağlandı.** Baş harf `toUpperCase` yerine `text.upper` ("ismail" → "İ"). `@/lib/arc-provider` içe aktarması kalktı: `ArcImage` (fill) yerine düz `<img>`; doldurma davranışı CSS ile verildi (`position: absolute; inset: 0; width/height: 100%`). Durum etiketi Türkçe: "online/offline" → "çevrimiçi/çevrimdışı" (`statusLabel`). |

**ABACUS bağımlılığı.** Kayıttaki npm bağımlılığı `@snn/abacus-core@github:sinanbocek/SNN-Abacus-Core#semver:^4.3.0` biçimindedir; `shadcn add` bunu `npm install` ile kurar ve proje `package.json`'ına `"@snn/abacus-core": "github:…#semver:^4.3.0"` yazar. Düz `@snn/abacus-core` adı npm'de olmadığı için 404 verir (2026-10-15 ölçüldü). Paket ham TypeScript sunar; boş Vite + React 19 + TS projesinde `tsc -b && vite build` geçti.

## Bloklar (Arc Pro esinlenmesi, temiz oda)

Bu parçalar Arc'tan alınmadı; tariflerinden sıfırdan yazıldı (`arayuz-standardi.md` §2.1). Yazan oturum uiarc.dev Pro sayfalarını açmadı, Pro kodu okunmadı. Katalogdaki parçalardan kurulur (`registryDependencies`).

| Parça | Kaynak kaydı | Katalog parçaları |
|---|---|---|
| `settings-page` | Arc Pro settings-page'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/settings-page.md | `avatar`, `empty-state`, `save-bar`, `skeleton` |
| `team-members` | Arc Pro team-members'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/team-members.md | `avatar`, `badge`, `button`, `empty-state`, `pagination`, `search-field`, `select`, `skeleton`, `tooltip` |
| `sidebar` | Arc Pro sidebar'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/sidebar.md | `avatar`, `badge`, `breadcrumb`, `button`, `drawer`, `popover`, `skeleton`, `tooltip` |
| `search-results` | Arc Pro search-results'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/search-results.md | `avatar`, `badge`, `button`, `checkbox`, `drawer`, `empty-state`, `pagination`, `search-field`, `select`, `skeleton` |
| `help-center` | Arc Pro help-center'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/help-center.md | `breadcrumb`, `button`, `empty-state`, `search-field`, `skeleton`, `textarea` |
| `settings-command` | Arc Pro settings-command'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/settings-command.md | `dialog`, `empty-state`, `input`, `save-bar`, `segmented-control`, `select`, `skeleton`, `switch` |
| `team-directory` | Arc Pro team-directory'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/team-directory.md | `avatar`, `button`, `empty-state`, `search-field`, `skeleton`, `tooltip` |
| `roles-permissions` | Arc Pro roles-permissions'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/roles-permissions.md | `avatar`, `button`, `checkbox`, `dropdown-menu`, `empty-state`, `skeleton`, `tooltip` |
| `inbox-triage` | Arc Pro inbox-triage'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/inbox-triage.md | `avatar`, `badge`, `button`, `empty-state`, `pagination`, `skeleton`, `tabs` |
| `release-readiness` | Arc Pro release-readiness'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/release-readiness.md | `avatar`, `button`, `checkbox`, `progress`, `skeleton`, `switch`, `tooltip` |
| `multi-step-form` | Arc Pro multi-step-form'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/multi-step-form.md | `button` |
| `week-calendar` | Arc Pro week-calendar'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/week-calendar.md | `button`, `checkbox`, `dialog`, `empty-state`, `input`, `popover`, `segmented-control`, `select`, `skeleton`, `snn-pointer-drag` |
| `availability-picker` | Arc Pro availability-picker'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/availability-picker.md | `avatar`, `button`, `empty-state`, `skeleton` |
| `project-board` | Arc Pro project-board'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/project-board.md | `avatar`, `badge`, `button`, `empty-state`, `input`, `progress`, `segmented-control`, `skeleton`, `tooltip` |
| `kanban-board` | Arc Pro kanban-board'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/kanban-board.md | `avatar`, `button`, `checkbox`, `drawer`, `empty-state`, `input`, `segmented-control`, `select`, `skeleton`, `snn-pointer-drag` |

## Grafik ve sayı bileşenleri (ABACUS'a bağlı, B sınıfı)

Arc'ın ücretsiz grafik ve sayı bileşenleri (commit `bfdf7e8`, MIT). Hepsi `Intl`, `toLocaleString`, `toFixed`, `toUpperCase` ya da `toLowerCase` kullanıyordu (`docs/arc-siniflandirma.md`, B sınıfı) ve varsayılanı `en-US` / USD idi. Burada ABACUS'a bağlandı: sayı `money.fmtDecimalGrouped`, para `money.formatMajor` / `money.compactMajor`, yüzde `money.percent`, değişim `math.percentChange`, yuvarlama `math.round`, tarih `date.*`, harf `text.upper` / `text.lower`. `locale` ve `currency` prop'ları kaldırıldı ya da ABACUS'a geçti; varsayılan para birimi TRY, ondalık ayracı virgüldür. Bağımlılık satırı avatar ile aynı: `@snn/abacus-core` `^4.3.0`.

Ortak uyarlamalar (ilk raftakilere ek):

1. **Ortak biçimleyici:** `snn-chart-format` (`registry/components/lib/chart-format.ts`). Arc'ta yok; Arc her dosyada kendi `Intl.NumberFormat` örneğini kuruyordu. `formatNumber`, `formatCompact`, `formatMoney`, `formatMoneyCompact`, `formatRatio`, `formatPercent`, `formatChange` ve çizim koordinatı için `roundTo`.
2. **Grafik renkleri:** `snn-chart-palette` (`registry/foundation/snn-chart-palette.css`). Arc'ın `--series-1…4` paleti `foundation.css` içindeydi; üçüncü rengi amberdi (ilk rafta bu yüzden alınmadı). Yeni palet: mavi, menekşe, yeşil, gül; açık ve koyu tema. `test/amber.test.mjs` bu dosyayı da tarar.
3. **Koruma:** `test/yasak-cagri.test.mjs` registry altındaki her `.ts/.tsx` dosyasında beş yasak çağrıyı arar; `test/bicim.test.mjs` biçimleyicileri ABACUS çıktısıyla karşılaştırır.
4. **Satır sonu:** `shadcn build` kaynak dosyayı olduğu gibi gömer; Windows'ta yazılan dosyalar CRLF kalırsa CI'daki LF çıktısıyla `public/r` farklı çıkar. Dosyalar LF olarak commit edilir.

| Parça | Arc'taki yer | Uyarlama |
|---|---|---|
| `animated-counter` | `registry/components/animated-counter` | `Intl.NumberFormat.formatToParts` yerine `money.fmtDecimalGrouped` ("1.234,5"); parçalama `counter-parts.ts` dosyasına ayrıldı (saf, test edilir). `locale` prop'u kaldırıldı. Bulanıklık `toFixed(2)` yerine `math.round`. İçe aktarma yolu `../lib/motion-tokens`. |
| `metric-card` | `registry/components/metric-card` | Değer yazımı `metric-card-format.ts` ile ABACUS'tan: `format` ("number" / "money" / "compact-money") ve `currency` (TRY) prop'ları eklendi, Arc'ın `prefix` yazımı yerine geçti. Değişim yönü okuması Türkçe sayıyı ("1.234,5", "%12,3") doğru okur; Arc virgülü atıp en-US okuyordu. |
| `sparkline` | `registry/components/sparkline` | `Intl.NumberFormat("en-US")` yerine `chart-format.formatNumber` (en çok 2 ondalık, "1.234,5"); `toFixed(2)` yerine `roundTo`. Değişim yönünü okuyan `amountIn` Türkçe sayıyı okur (Arc virgülü atıyordu). Ekran okuyucu metinleri Türkçe: "değerleri gez", "Son", "Nokta N / M". |
| `line-chart` | `registry/components/line-chart` | `Intl.NumberFormat("en-US")` (tam ve kısaltılmış) yerine `line-chart-format.ts` (`formatLineValue` → `formatNumber`, `formatLineTick` → `formatCompact`); `toFixed(1)` yerine `roundTo`; `toLowerCase` yerine `text.lower`. Varsayılan metinler Türkçe: "Bu aralıkta veri yok", "Tarih", "Göstermek için bir seri seçin", "Yükleniyor", "N seriden M tanesi gösteriliyor". Bu grafik `--series-*` kullanmaz (renkler vurgu ve nötr basamaklardır), palet kurulumu gerekmez. |
| `bar-chart` | `registry/components/bar-chart` | `Intl.NumberFormat("en-US")` yerine `chart-format.formatNumber(value, 0)` ("1.234"); `toFixed(2)` yerine `roundTo`; `toLowerCase` yerine `text.lower`. Varsayılan metinler Türkçe: "Günlük ortalama", "Toplam", "Gün", "Ort.", "Veri yok", "En yüksek", "En düşük", "… boyunca gez". `--series-*` kullanmaz. |
| `donut-chart` | `registry/components/donut-chart` | `Intl.NumberFormat("en-US")` (sayı ve yüzde) yerine `chart-format.formatNumber` ve `formatRatio` ("%36", sıfıra yakın pay "<%1"); `toLowerCase` yerine `text.lower`. Varsayılan metinler ve ekran okuyucu cümleleri Türkçe ("Toplam", "Diğer", "Henüz veri yok", "toplam içinde", "İçerdikleri:", "gösterildi/gizlendi"). `--series-1…4` paleti Arc'ın amberli paleti yerine `snn-chart-palette`tir. |
| `gauge` | `registry/components/gauge` | Yüzde işareti Arc'ta sayıdan sonraydı ("72%"); Türkçe yazıma göre sayıdan önce ("%72") ve CSS boşluğu buna göre taşındı. `toFixed(3)` yerine `roundTo`. Ekran okuyucu metni `value of max` yerine `value / max`, sayılar `formatNumber` ile. Eşik ve ayrıntı metinleri kullanıcıdan gelir. |
| `usage-meter` | `registry/components/usage-meter` | `Intl.NumberFormat("en-US").formatToParts` yerine `animated-counter/counter-parts.ts` (ABACUS `money.fmtDecimalGrouped`); `value.toFixed(decimals)` yerine `money.fmtDecimalGrouped(value, decimals)` (sabit ondalık, "42,5"); limit metnindeki gereksiz sıfır kuralı virgüle göre (`,0`). `toFixed(2)` bulanıklık için `roundTo`. Varsayılan metinler Türkçe: "Boş", "Limit aşımı", "Neredeyse dolu", "N aşıldı", "plan payı %N". `lucide-react` simgeleri aynen. |
| `slope-chart` | `registry/components/slope-chart` | `Intl.NumberFormat("en-US")` yerine `chart-format.formatNumber`. Ekran okuyucu ve ipucu metinleri Türkçe ("Veri yok", "aynı sıra", "N sıra yükseldi / düştü, K. sırada", "eğim grafiği", tablo başlıkları Öğe/Değişim/Sıra). CSS'teki `--series-1` artık `snn-chart-palette` dosyasından gelir. |
| `treemap` | `registry/components/treemap` | `Intl.NumberFormat("en-US")` (sayı ve yüzde) yerine `chart-format.formatNumber` ve `formatRatio` ("%12,3"); `toFixed(2)`, `toFixed(3)` yerine `roundTo`. Ekran okuyucu ve ipucu metinleri Türkçe ("X içinde", "Henüz veri yok", "ağaç haritası", "… yolu", tablo başlıkları Yol/Değer/Üst öğedeki pay). CSS'teki `--series-*` artık `snn-chart-palette` dosyasından gelir. |
| `waffle-chart` | `registry/components/waffle-chart` | `Intl.NumberFormat("en-US")` yerine `chart-format.formatNumber`; paylardaki `value.toFixed(decimals) + "%"` yerine `chart-format.formatPercent(..., true)` (ABACUS `money.percent`, sabit ondalık, "%36"). Ekran okuyucu metinleri Türkçe ("Veri yok", "kare ızgara grafiği", "N hücre", "kategorileri", tablo başlıkları Kategori/Değer/Pay/Hücre). CSS'teki `--series-*` artık `snn-chart-palette` dosyasından gelir. |
| `brush-chart` | `registry/components/brush-chart` | `Intl.NumberFormat` (sayı ve kısaltma) ve `Intl.DateTimeFormat` (gün, ay, yıl, tam tarih) yerine ABACUS: `chart-format.formatNumber` / `formatCompact`, `date.format` ("long", "short", "dayMonth"), `date.dayName`, `date.monthName`; zaman damgası UTC gününe çevrilip ISO metni olarak verilir. `toFixed(1)` yerine `roundTo`; haftalık değişim `chart-format.formatChange` ("+%12,3"). Metinler Türkçe ("Henüz veri yok", "yedi günlük ortalama", "bir hafta öncesine göre", "Aralık başlangıcı/sonu", tablo başlıkları Tarih/Olay). CSS'teki `--series-*` artık `snn-chart-palette` dosyasından gelir. |
| `activity-heatmap` | `registry/components/activity-heatmap` | `Intl.DateTimeFormat` (ay, gün adı, uzun ve kısa tarih) ve `Intl.NumberFormat` yerine ABACUS: `date.format` / `date.dayName` / `date.monthName` ve `money.fmtDecimalGrouped`; `locale` prop'u kaldırıldı. Ekran metinleri Türkçe: birim "katkı" (çoğul eki yok), "N gün: 1–3 katkı", "katkı yok", "ve üzeri", "Az / Çok", "… olan günleri vurgula". Özet cümlesi Türkçe sözdizimine göre: sayı + birim + dönem ("1.284 katkı 2025 yılında"); Arc'taki "in" sözcüğü kaldırıldı. Bu bileşen `--series-*` kullanmaz. |
| `streamgraph` | `registry/components/streamgraph` | `Intl.NumberFormat("en-US")` yerine `chart-format.formatNumber`; `toFixed(1)` yerine `roundTo`. Ekran okuyucu metinleri Türkçe ("Bu aralıkta veri yok", "Tarih", "akış grafiği", "… ile … arası", "son değer", "N katman, toplam …", "katmanları"). CSS'teki `--series-*` artık `snn-chart-palette` dosyasından gelir. Yan yana duran iki doküman yorumu tek Türkçe yorumda birleştirildi. |
| `ridgeline` | `registry/components/ridgeline` | `Intl.NumberFormat("en-US")` (sayı ve yüzde) yerine `chart-format.formatNumber` ve `formatRatio`; `toFixed(2)` yerine `roundTo`. Ekran okuyucu ve ipucu metinleri Türkçe ("Medyan", "Orta yarı", "Aralık", "X ve altı: %N", "sırt çizgisi grafiği", tablo başlıkları Seri/Medyan/Birinci çeyrek/…/Adet). Arc'ta `/** */` olarak yazılmış tek satır içi yorum `//` yorumuna çevrildi. CSS'teki `--series-*` artık `snn-chart-palette` dosyasından gelir. |
| `slot-text` | `registry/components/slot-text` | `value.toLocaleString("en-US")` yerine `chart-format.formatNumber(value, 3)` (ABACUS `money.fmtDecimalGrouped`); `toFixed(2)`, `toFixed(4)` yerine `roundTo`; `LOWER.toUpperCase()` yerine her harf için ABACUS `text.upper` (i → İ, ı → I). Harf makaralarının alfabesi a–z yerine Türk alfabesi (32 harf: ç, ğ, ı, ö, ş, ü eklendi; q, w, x kaldı), böylece "İstanbul" gibi adlar da makarada döner. Başka uyarlama yok (ekran metni yok). |

## Dalga 2: Arc Pro'dan esinlenen, sıfırdan yazılan parçalar

Temiz oda (`arayuz-standardi.md` §2.1): tarif oturumu Pro sayfasına bakar, yazan oturum yalnız `docs/tarifler/<ad>.md` dosyasını okur. Arc Pro kodu okunmadı ve kopyalanmadı; hiçbir dosya Arc'tan gelmez. Sayılar ve tarihler ABACUS'tandır (`Intl`, `toFixed`, `toLowerCase` yok).

| Parça | Kaynak | Not |
|---|---|---|
| `split-bar` | Arc Pro split-bar'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/split-bar.md | Dilimler `flex-grow` ile genişler (kırpma ve yerleşim hesabı yok); dış etiket şeridi `spreadLabels` ile ayrılır (`lib/viz-utils.ts`). Metin ölçümü tuvalle değil karakter sayısından kestirilir. Yazım `split-bar-format.ts`. |
| `sankey-flow` | Arc Pro sankey-flow'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/sankey-flow.md | Yerleşim (sütun, sıra düzeltmesi, şerit uçları) saf işlev olarak `sankey-flow-format.ts` içinde; şeritler orta çizgisi kalınlıkta çizilen eğridir; noktalar SVG `animateMotion` ile. Veri değişiminde şerit geçişi `d` CSS geçişiyle yapılır (Chromium'da yumuşak, diğerlerinde anında). |
| `funnel-chart` | Arc Pro funnel-chart'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/funnel-chart.md | Band, düz basamaklar ve eğri geçişlerle SVG yolu olarak kurulur (`funnel-chart-format.ts` bantları hesaplar, saf). Düşen noktalar (adım sınırında bandı terk eden) yapılmadı; bant boyunca akan noktalar var. Veri değişiminde yol geçişi `d` CSS geçişiyle (Chromium'da yumuşak). |
