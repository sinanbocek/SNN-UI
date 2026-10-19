# Teknik Borç Kütüğü

Fark edilen ama şimdi çözülmeyen sorunlar. **Açık borçlar için tek kaynak burasıdır.**
Kapanan kayıtlar: `docs/teknik-borc-arsiv.md`

> **Teknik borç nedir?** Bir işi hızlı bitirmek için kestirme yol kullanmak, sonradan
> ödenecek bir borç almak gibidir. Borç ödenmedikçe faizi (bakım zorluğu, hata riski) büyür.

> **Standart:** `~/.claude/standartlar-canli/standartlar/teknik-borc-standardi.md` (tek kaynak: SNN-Standartlar)

## Sözlük
| Terim | Türkçe karşılığı |
|---|---|
| Kütük | Bu dosya: açık teknik borçların tek listesi |
| Eksen çizgisi (tick) | Grafikte değerleri gösteren ince dikey çizgi ve yanındaki sayı |
| Lint (ESLint) | Kodu yazım kurallarına göre tarayan denetim aracı; derlemeden ayrıdır |
| Çekirdek (ABACUS) | Sayı, para, tarih biçimlerini yazan ortak kütüphane: SNN-Abacus-Core |
| Geçici çözüm | Çekirdekteki bir eksiği yerelde kapatan ek kod |

---

### TB-004 — Çekirdek 4.4.0 ile gereksiz kalan iki geçici çözüm
- **Tespit Tarihi:** 2026-10-19 (çekirdek 4.3.0 → 4.4.0 yükseltmesi, PR #44)
- **Öncelik:** P3 (Fırsatta) — davranış doğru, yalnız fazladan kod ve artık yanlış olan yorum var.

#### 🟢 Sade Anlatım
- **Sorun ne?** Çekirdek eskiden küçük eksi sayılarda eksi işaretini düşürüyordu ve birimsiz kısaltma yazamıyordu. Biz bunları kendi kodumuzla kapatmıştık. Çekirdek 4.4.0 ikisini de düzeltti; bizim yamalarımız artık gereksiz.
- **Benzetme:** Bozuk musluğa taktığımız kova, musluk tamir edildikten sonra hâlâ altında duruyor. Zarar vermez ama yer kaplar ve "musluk bozuk" yanılgısını sürdürür.
- **Çözülmezse ne olur?** Ekranda fark olmaz. Kodu okuyan, yorumdaki "çekirdek eksiyi düşürüyor" notuna inanıp yanlış karar verebilir.
- **Senden beklenen karar:** Yok.

#### 🔧 Teknik Detay
- **Açıklama:** (1) `registry/components/lib/chart-format.ts:11-17` `formatNumber` ve `registry/components/number-field/number-field-format.ts:12-17` değeri `math.abs` ile biçimleyip eksiyi elle ekliyor; 4.4.0'da `money.fmtDecimalGrouped(-0.5, 1)` → `"-0,5"` (madde 49, ölçüldü). Satır 11 ve 12'deki yorumlar artık yanlış. (2) `chart-format.ts:29` `formatCompact` `money.compactMajor(value, { style: "B/Mn/Mr" }).replace("₺", "")` kullanıyor; yerine `money.compactNumber(value, { style: "B/Mn/Mr" })` gelmeli (madde 50). 1250000, 12500, -1250000, 1000 için iki yolun çıktısı aynı (ölçüldü).
- **Etki:** `chart-format.ts`'i kullanan bütün grafik ve metrik bileşenleri; `number-field`. Davranış değişmez.
- **Çözüm yönü:** Elle eksi eklemeyi ve `.replace("₺", "")` yolunu kaldır, yorumları düzelt. `npm test`, `npm run typecheck`, `npm run build`; ardından etkilenen bileşenlerde `npm run shots` ile görsel denetim.
- **Neden Şimdi Çözülmüyor:** Yükseltme PR'ı ekranı değiştirmesin diye bileşen koduna dokunulmadı. Sadeleştirme çok sayıda bileşenin kaynağını değiştirir ve görsel denetim ister. Bu bileşenlere bir sonraki dokunuşta yapılır.
- **Bağlı kalemler:** Yok.
