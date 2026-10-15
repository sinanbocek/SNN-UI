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
