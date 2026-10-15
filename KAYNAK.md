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
| `race-bar-chart` | Arc Pro race-bar-chart'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/race-bar-chart.md | Zaman `requestAnimationFrame` döngüsüyle ilerler; sıra değişimi satır `transform` geçişiyle, eksen üst sınırı hedefe üstel yaklaşımla yumuşar. Rakamlar rakam rakam dönmez (kare başına yeniden yazılır). Üst N dışına çıkan çubuk aşağı kayıp saydamlaşır. |
| `realtime-stream` | Arc Pro realtime-stream'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/realtime-stream.md | Tuval yerine SVG; çizgi kare başına yeniden yazılır ve pencere sonu ile eksen aralığı hedefe üstel yaklaşır (yeni okuma gelince çizgi kayar, uç nokta atlamaz). Okuma sıklığı yüksek (saniyede onlarca) akışlar için tuvale geçmek gerekebilir. ABACUS'ta saniyeli saat biçimi yok: saat ve dakika `date.format(…, "time")`, saniye damgadan eklenir (ABACUS'a aday). |
| `metrics-dashboard` | Arc Pro metrics-dashboard'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/metrics-dashboard.md | `animated-counter`, `line-chart`, `segmented-control`, `button`, `skeleton` kataloğun kendi parçalarıdır (gösterge kutusu `metric-card` yerine sekme olarak yazıldı). Gösterge sekmeleri `tablist` olarak yazıldı (ok tuşları, Home/End). Ortak yazım `lib/metric-format.ts` (`snn-metric-format`). |
| `kpi-drilldown` | Arc Pro kpi-drilldown'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/kpi-drilldown.md | Kart ile ayrıntı aynı yüzey: `lib/morph-grid.tsx` (`snn-morph-grid`) motion paylaşılan düzen geçişini kullanır; açıkken ızgara `inert`. Tarifteki "düşmesi iyide düşüş yeşil, artış kırmızı" yerine arayüz standardı gereği olumsuz yön mavi-gri yazılır (kırmızı yalnız gerçek hata). Mini kart grafiği `sparkline` yerine yalın SVG yoludur (`miniLinePath`). Karşılaştır düğmesi önceki dönem çizgisini açar; kart değişimi her zaman gösterilir. |
| `metric-explorer` | Arc Pro metric-explorer'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/metric-explorer.md | Kart ile panel aynı yüzey: `lib/morph-grid.tsx` (`snn-morph-grid`). Okuma imleci `line-chart`'ın kendi artı imlecidir (kaydırıcı, ok tuşları, Home/End); okuma satırı onun `onActiveChange` çıktısını yazar. Mini kart grafiği yalın SVG yoludur (`miniLinePath`). Tarifteki "düşmesi iyi göstergede renk tersine döner" kuralı kırmızı yerine mavi-gri olarak uygulandı. |
| `revenue-explorer` | Arc Pro revenue-explorer'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/revenue-explorer.md | Ana grafik `line-chart`, fırça şeridi bu blokta yazıldı (pencere ve iki tutamaç kaydırıcıdır; aylık adım hesabı `revenue-explorer-format.ts`, saf ve test edilir). `brush-chart` yerine ayrı fırça yazıldı çünkü o tek seriye ve kendi ana grafiğine bağlı. Kayıp oranı ay kaybının ay başı toplama bölümünün aylık ortalamasıdır. |
| `mrr-waterfall` | Arc Pro mrr-waterfall'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/mrr-waterfall.md | Çubuklar SVG, yüzen çubuk yer ve yükseklik geçişi motion yayıyla; basamaklar radyo düğmesi grubudur (gezen odak, ok tuşları, Home/End). Basamak, gösterge ve ölçek hesabı `mrr-waterfall-format.ts` dosyasında (saf, test edilir). Daralma ve kayıp rengi kırmızı değil menekşedir (kırmızı yalnız gerçek hata); eksi işareti ve "-" metni yönü ayrıca söyler. |
| `cohort-retention` | Arc Pro cohort-retention'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/cohort-retention.md | Isı haritası CSS ızgarası, eğriler SVG; iki görünüm arasında hücrelerin eğrilere dönüşen geçişi yok (yerleşim yeniden kurulur). Hücre rengi vurgunun `color-mix` payıdır (yüzdeyle orantılı), segment değişiminde hücre başına gecikmeli renk geçişi vardır. Ağırlıklı ortalama ve gösterge hesabı `cohort-retention-format.ts` içinde (saf, test edilir). |
| `usage-forecast` | Arc Pro usage-forecast'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/usage-forecast.md | Tahmin ve koni hesabı `usage-forecast-format.ts` içinde (saf, test edilir); grafik SVG, bütçe tutamacı kaydırıcı rolünde HTML öğesidir (sürükleme ve klavye). Bırakınca yaylı yerleşme yok, çizgi doğrudan izler. Ölçü seçici ve uyarı kurallarının e-posta benzetimi galeride yok; kural durumu yalnız yerel anahtardır. |
| `budget-variance` | Arc Pro budget-variance'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/budget-variance.md | Çubuk bütçeye oranla çizilir (işaret ortak %100 hizasında); aşım aynı çubuğun işaret ötesindeki parçasıdır. Çubuk ve rakam geçişi CSS ile (`AnimatedCounter`). Aşım kırmızı yazıldı (bütçe aşımı gerçek hata sayıldı), altında kalma yeşil. Kalem açılışı motion ile yükseklik ve saydamlık; kapanış daha hızlı. |
| `small-multiples` | Arc Pro small-multiples'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/small-multiples.md | Paneller SVG (viewBox 100×40, yalın yumuşak çizgi yolu `miniLinePath`), imleç ve nokta HTML öğesi (çizgi gerilmesin diye); sıralama motion `layout` ile, ölçek geçişi `d` CSS geçişiyle (Chromium'da yumuşak). Büyüme, trend, sıralama ve ölçek hesabı `small-multiples-format.ts` içinde (saf, test edilir). Düz seri kısmen sönük gösterim anahtarı yalnız panel saydamlığını azaltır. |
| `line-replay` | Arc Pro line-replay'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/line-replay.md | Oynatma tek bir zaman değerini `requestAnimationFrame` ile ilerletir; her karede çizgi, alan, imleç, uç etiketi ve okuma yeniden çizilir (tarifteki gibi doğrudan DOM yazımı değil, React durumu). Başa sarma ve atlama anlıktır (yaylı süzülme yok). Sorun anı üçgen simge ve mavi-gri (`--warning`) ile işaretlenir. Etki hesabı ve ara değer `line-replay-format.ts` içinde (saf, test edilir). ABACUS'ta saniyeli saat biçimi yok (ABACUS'a aday). |
| `market-terminal` | Arc Pro market-terminal'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/market-terminal.md | Grafik tuval yerine SVG (yaklaşık yüz mum için yeterli; binlerce mumda tuval gerekir). Yakınlaştırma, kaydırma ve savurma işaretçi olaylarıyla (iki parmak: iki işaretçi aralığı); dönem geçişi görünümü sona alır (yumuşak geçiş yok). Tam ekran düğmesi yapılmadı. Fiyat ekseni, ortalama, görünüm penceresi, emir doğrulama ve yazım `market-terminal-format.ts` içinde (saf, test edilir). ABACUS'ta saniyeli saat biçimi yok (ABACUS'a aday). |
| `journey-flow` | Arc Pro journey-flow'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/journey-flow.md | Şema `sankey-flow` bileşenidir (tarif de bunun hazır panelli uygulaması olduğunu söyler); bu blok kanal seçici, başlık toplamı, yan panel ve akış tablosunu ekler. `sankey-flow`'a seçili düğüm (tıklama / Enter sabitler, Esc kaldırır), `bare` (başlık gizleme) ve `muted` düğüm eklendi. Panel hesabı `journey-flow-format.ts` içinde (saf, test edilir). Tarifteki "ilk aşamaya payı" metni Türkçe ek almaması için "İlk aşamanın payı %6,0" olarak yazıldı. |
| `invoice-studio` | Arc Pro invoice-studio'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/invoice-studio.md | Tablo `role=table` ile yazıldı, satırlar motion yükseklik geçişiyle girer ve çıkar. Toplam, ekran okuyucu için tek cümlelik canlı bir çıktıdır; görsel rakamlar (`AnimatedCounter`) gizlidir. Hesap, doğrulama ve alan yazımı `invoice-studio-format.ts` içinde (saf, test edilir). Belge tarihi ve vade alanı yapılmadı (tarifte "varsa"). |
| `pricing-calculator` | Arc Pro pricing-calculator'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/pricing-calculator.md | Seçim çerçevesi ve "Önerilen" rozeti motion paylaşılan düzen öğeleridir (kartlar arasında yayla kayar). Koltuk durakları, plan sınırları ve özellik eşikleri `pricing-calculator-format.ts` içinde saf işlevlerle hesaplanır (test edilir). Kullanıcı bir planı elle seçerse seçim, o plan hâlâ satılıyorsa korunur; yoksa önerilene döner. |
| `usage-pricing` | Arc Pro usage-pricing'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/usage-pricing.md | Plan adı `slot-text` ile harf harf döner; özellik satırları motion ile yükseklik ve saydamlıkla girip çıkar, kart yüksekliği `layout` ile uyum sağlar. Tarifteki "plan ölçeği" dekoratif çubuk olarak plan sırasını gösterir (ekran okuyucudan gizli). Öneri, döküm ve geçiş işareti hesabı `usage-pricing-format.ts` içinde (saf, test edilir). Tarifteki "iki plan karşılaştırmalı özellik" bir önceki plana göre "yeni" etiketi olarak yapıldı. |

## Dalga 3: Arc Pro'dan esinlenen vitrin ve satış blokları

Temiz oda (`arayuz-standardi.md` §2.1): tarif oturumu Pro sayfasına bakar, yazan oturum yalnız `docs/tarifler/<ad>.md` dosyasını okur. Arc Pro kodu okunmadı ve kopyalanmadı; görseller galeride kendi yer tutucumuzdur. Sayılar ve tarihler ABACUS'tandır (`Intl`, `toFixed`, `toLowerCase` yok).

| Parça | Kaynak | Not |
|---|---|---|
| `product-listing` | Arc Pro product-listing'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/product-listing.md | Süzgeç mantığı (`matches`, `visibleProducts`, `priceBounds`, `moveRange`) `product-listing-format.ts` içinde saf ve test edilir. Fiyat aralığı iki üst üste yerel aralık girdisidir (tarayıcı klavye ve dokunmayı verir). Sıralama menüsü liste kutusu açılırıdır (`aria-activedescendant`). Dar kap süzgeç sayfası katalogdaki `drawer`dır. Ortak parçalar (yer tutucu, renk örnekleri) `lib/shop-parts.tsx`. Ortak yazım: `lib/shop-format.ts`. |
| `product-detail` | Arc Pro product-detail'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/product-detail.md | Galeri, `lib/shop-parts.tsx` içindeki `SwipeTrack`tir (sürükleme, uçlarda esneme, hızlı atışta komşuya geçiş). Tükenme, kuruş hesabı ve yorum dağılımı `product-detail-format.ts` içinde (saf, test edilir). Kaplama ve boy radyo grubudur; ayrıntı bölümleri `aria-expanded` ile açılır. |
| `cart-drawer` | Arc Pro cart-drawer'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/cart-drawer.md | Sepet durumu (adet, kargo eşiği, kupon indirimi, toplam) `cart-drawer-format.ts` içinde saf ve test edilir. Uçuş, fotoğrafın ve sepet düğmesinin ekran konumundan hesaplanır ve `document.body`e taşınan ayrı bir öğeyle yapılır. Satır silme `motion` sürüklemesi (yön kilitli) ve düğme karşılığıdır. Çekmece katalogdaki `drawer`dır; adet düzenleyici `lib/shop-parts.tsx` içindeki `NumberStepper`dır. Ödeme düğmesi ile onay yuvarlağı ortak yerleşim öğesidir. |
| `checkout-summary` | Arc Pro checkout-summary'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/checkout-summary.md | Özet hesabı (indirim, kupon, vergi, toplam) `checkout-summary-format.ts` içinde saf ve test edilir. Kupon çipi, geçersiz kodda sallanan alan ve ödeme düğmesinin dört durumu bu blokta yazıldı; kupon alanı ayrı bir parça olarak çıkarılmadı. |
| `wallet-card` | Arc Pro wallet-card'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/wallet-card.md | Tutar doğrulama, hareket süzme ve grafik yolu `wallet-card-format.ts` içinde saf ve test edilir. Grafik SVG'dir; gezinme üst üste duran saydam yerel aralık girdisiyle yapılır (fare, dokunma ve ok tuşları tarayıcıdan gelir). Hesap seçici katalogdaki `dropdown-menu`, dönem `segmented-control`, arama `search-field`dir; ayrı `money-input` ve `activity-row` parçaları çıkarılmadı. |
| `payment-flow` | Arc Pro payment-flow'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/payment-flow.md | Döngü karesi (`cycleFrame`), yolda konum, yerleşim, vurgu çizgisi dolulukları ve yazımlar `payment-flow-format.ts` içinde saf ve test edilir. Duraklar ve çip SVG üstünde yüzde konumlu HTML öğeleridir (metin sarsın, şema her genişlikte ölçeklensin diye); tek `requestAnimationFrame` döngüsü yalnız değişen metni ve dönüşümü doğrudan DOM'a yazar. Hız ve duraklama üstel yaklaşımla yumuşar; döngü ekran dışında ve hız sıfırken durur. Ayrı `flow-diagram` ve `step-row` parçaları çıkarılmadı. |
| `hero-signup` | Arc Pro hero-signup'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/hero-signup.md | E-posta süzme, doğrulama iletileri ve yazım düzeltme önerisi `hero-signup-format.ts` içinde saf ve test edilir (düzeltme tablosu sık görülen alan adı hatalarıdır). Akan arka plan CSS'te vurgu renginden `color-mix` ile türetilmiş katmanlı radyal geçişlerdir; ayrı `mesh-background` ve `email-field` parçaları çıkarılmadı. Düğmenin başarıda alanı kaplayıp onaya dönüşmesi, alanın solarak onay kutusuyla yer değiştirmesi olarak yapıldı (ortak yerleşim öğesi yok). |
| `scroll-story` | Arc Pro scroll-story'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/scroll-story.md | Kaydırma konumundan adım konumu (`stepPosition`), etkin adım, sekme dolgusu ve yazımlar `scroll-story-format.ts` içinde saf ve test edilir. Sahne bileşenin içinde sabit değildir: `renderStage` ile gelir (tarifteki sahte ürün ekranı galeri örneğinde kendi verimizle çizildi). Ayrı `scroll-progress` parçası çıkarılmadı; sekmeler katalogdaki `tabs` yerine bu blokta `tablist` olarak yazıldı (dolgu çubuklu). |
| `spotlight-grid` | Arc Pro spotlight-grid'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/spotlight-grid.md | Sütun sayısı, kart kaplaması ve ışık konumu `spotlight-grid-format.ts` içinde saf ve test edilir. Kartın ayrıntıya dönüşmesi ortak yerleşim öğesidir (açılış sekmeli yay, kapanış sekmesiz); kart açıkken ortak kimliğini ayrıntıya bırakır. Dört örnek özellik (gecikme eğrisi, dağıtım sayacı, özellik anahtarı, iğnelenmiş not) galeri örneğinde kendi verimizle çizildi. Ayrı `pointer-glow` ve `expand-card` parçaları çıkarılmadı. |
| `product-gallery` | Arc Pro product-gallery'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/product-gallery.md | Tükenme, beden gezme, büyüteç kayması ve yazımlar `product-gallery-format.ts` içinde, görüntüleyicinin sığdırma, yakınlaştırma, kaydırma sınırı ve eşikleri `lib/image-viewer-format.ts` içinde saf ve test edilir. Mercek, ana fotoğrafın büyütülmüş bir kopyasını imlecin altında kaydırır (görüntü kaynağından bağımsız, yer tutucuyla da çalışır). Görüntüleyici ortak parça `lib/image-viewer.tsx`tir (`lightbox-gallery` ve `photo-grid` de kullanır); ana fotoğraf şeridi `lib/shop-parts.tsx` içindeki `SwipeTrack`tir. Ayrı `image-magnifier` ve `carousel` parçaları çıkarılmadı. |
| `lightbox-gallery` | Arc Pro lightbox-gallery'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/lightbox-gallery.md | Sütun sayısı ve fotoğrafların en kısa sütuna dağılımı `lightbox-gallery-format.ts` içinde saf ve test edilir. Görüntüleyici ortak parça `lib/image-viewer.tsx`tir (`product-gallery` ve `photo-grid` de kullanır; yuvadan büyüme ve yuvaya dönme iki ucun ekran konumundan hesaplanır, kapanış uçuşu kapanış hedefine çıkınca bitirilir). Ayrı `masonry-grid` parçası çıkarılmadı. |
| `photo-grid` | Arc Pro photo-grid'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/photo-grid.md | Seviyeler, sıkıştırmadan sütun sayısı, ok tuşuyla odak ve yazımlar `photo-grid-format.ts` içinde saf ve test edilir. Sıkıştırma iki işaretçi aralığıyla canlı ölçeklenir (yerleşim değişince sayfa kaydırması düzeltilir); görüntüleyici ortak parça `lib/image-viewer.tsx`tir. Ayrı `pinch-zoom-grid` ve `filmstrip` parçaları çıkarılmadı; küçük resim şeridi görüntüleyicinin parçasıdır ve kaydırıcı yerine düğme listesidir (geçerli olan `aria-current`). |
| `testimonial-stage` | Arc Pro testimonial-stage'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/testimonial-stage.md | Sarmalayan gezinme, baş harfler ve yazımlar `testimonial-stage-format.ts` içinde saf ve test edilir. Sekme, katalogdaki `tabs` yerine bu blokta `tablist` olarak yazıldı (kayan çizgi ortak yerleşim öğesidir); portre geçişi yön kaymalı soluk geçiştir. |
| `team-showcase` | Arc Pro team-showcase'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/team-showcase.md | İletişim satırları, maskeli telefon, sayaç ve yazımlar `team-showcase-format.ts` içinde saf ve test edilir. Kopyalama panoya yazar (`navigator.clipboard`, başarısızsa "Kopyalanamadı"); ayrı `copy-button` parçası çıkarılmadı. Yerleşim seçici katalogdaki `segmented-control`dür; dizin satırı yükseklik animasyonuyla genişler. |
| `media-player` | Arc Pro media-player'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/media-player.md | Süre yazımı, parça sırası, parça bitişi ve ses düzeyi `media-player-format.ts` içinde saf ve test edilir. Galeri örneğinde ses dosyası yoktur: her parça tarayıcıda üretilen kısa bir sinüs tonudur (WAV nesne adresi). Ayrı `slider` ve `playlist-row` parçaları çıkarılmadı; çalan işaret ortak yerleşim öğesidir. |
| `wallet-stack` | Arc Pro wallet-stack'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/wallet-stack.md | Son dört hane güvenliği, deste konumu (`placeOf`), ok ve sürükleme kararları ve yazımlar `wallet-stack-format.ts` içinde saf ve test edilir. Kart yüzleri bileşenle çizilir (görsel yok); malzeme görünümleri yalnız foundation değişkenlerinden türetilen yüzeylerdir. Ayrı `card-stack` parçası çıkarılmadı; cihaz eğimi yapılmadı. |
| `cover-flow` | Arc Pro cover-flow'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/cover-flow.md | Kart dönüşümü (`coverTransform`), momentumla oturma, sürüklemeden konum, ray tuşları ve yazımlar `cover-flow-format.ts` içinde saf ve test edilir. Ray konumu tek bir ondalık hareket değeridir; her kartın konumu, ölçeği, dönmesi, karartması ve iç görsel kayması bu değerden türer. Ayrı `depth-rail` parçası çıkarılmadı. |

## Dalga 4: Arc Pro'dan esinlenen dönüşen bileşenler

Bu parçalar Arc'tan alınmadı; tariflerinden sıfırdan yazıldı (`arayuz-standardi.md` §2.1). Yazan oturum uiarc.dev sayfalarını açmadı, Pro kodu okunmadı. Hareket yalnız `snn-motion-tokens` ve `snn-foundation` değişkenleriyle kurulur; "hareketi azalt" yolu hepsinde vardır. Son üçünde (`liquid-tab-bar`, `orbit-menu`, `data-flow`) görünüş tarife değil kendi tasarıma dayanır (SNN-UI değişkenleri, sade).

| Parça | Kaynak kaydı | Not |
|---|---|---|
| `morph-loader` | Arc Pro morph-loader'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/morph-loader.md | Dört yükleniyor biçimi (CSS) ve onay / çarpı çizimi (`motion` yol çizimi). Sayı, tarih yok. |
| `skeleton-morph` | Arc Pro skeleton-morph'tan esinlenildi; kod okunmadı; tarif: docs/tarifler/skeleton-morph.md | Kabuk `SkeletonMorph` ve blok `MorphBlock`. Çözülme sırası belge sırasından okunur. Katalogdaki `skeleton`'dan ayrı, onun yerine geçmez. |
| `action-morph` | Arc Pro action-morph'tan esinlenildi; kod okunmadı; tarif: docs/tarifler/action-morph.md | Eylem harfi `event.code` ile okunur (`toUpperCase` yok). Yazma yüzünde `morph-loader` kullanılır. Tarih biçimi yok; seçenek etiketleri uygulamadan gelir. |
| `morph-nav` | Arc Pro morph-nav'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/morph-nav.md | Arama `text.searchKey` (Türkçe harf farkı gözetmez), sonuç sayısı `money.fmtDecimalGrouped`. Katlanma eşiği kap genişliğine bağlıdır (`useElementWidth`). |
| `liquid-tab-bar` | Arc Pro liquid-tab-bar'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/liquid-tab-bar.md | Yalnız işlev tariften; görünüş sıfırdan. Rozet sayısı `animated-counter` (ABACUS). |
| `orbit-menu` | Arc Pro orbit-menu'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/orbit-menu.md | Yalnız işlev tariften; görünüş sıfırdan. Hedef seçimi imlecin açısından yapılır. Sayı, tarih yok. |
| `data-flow` | Arc Pro data-flow'dan esinlenildi; kod okunmadı; tarif: docs/tarifler/data-flow.md | Yalnız işlev tariften; görünüş sıfırdan. Tarifin ayrı `flow-diagram` parçası yazılmadı: çizim motoru `data-flow` içindedir (`payment-flow` kendi motorunu taşır; ortaklaştırma ayrı iştir). Sayaç `animated-counter`. |
