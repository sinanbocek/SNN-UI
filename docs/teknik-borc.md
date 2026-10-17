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

---

### TB-001 — Sırt çizgisi grafiği (ridgeline) telefonda yana taşıyor
- **Tespit Tarihi:** 2026-10-17 (galeri sitesi, telefon genişliği denetimi)
- **Öncelik:** P2 (Planlı)

#### 🟢 Sade Anlatım
- **Sorun ne?** Sırt çizgisi grafiği dar ekranda eksen çizgilerini çok aralıklı diziyor; grafik kutusunun dışına binlerce piksel taşıyor.
- **Benzetme:** Cetvelin santim çizgileri kâğıda değil, odanın duvarlarına kadar uzanmış gibi.
- **Çözülmezse ne olur?** Bu grafiği kullanan bir proje telefonda sayfayı yana kaydırır ya da eksen etiketleri görünmez.
- **Senden beklenen karar:** Yok.

#### 🔧 Teknik Detay
- **Açıklama:** 390 px genişlikte `#ridgeline` örneğinde 6 eksen çizgisi (`.tick`) yaklaşık 2840 px arayla diziliyor (ölçülen sol konumlar: −2771, 69, 2909 … 11429 px); kabın `scrollWidth` değeri 11411 px. Konum `registry/components/ridgeline/ridgeline.tsx:197` içinde `translate3d(sx(value))` ile veriliyor. Hipotez: `sx` ölçeği ya da `plotWidth` ölçümü dar ekranda yanlış genişlikle kuruluyor.
- **Etki:** `ridgeline` kuran her proje; galeride Grafikler sayfası. Galeri `.product { overflow-x: clip }` ile taşmayı örtüyor (`playground/src/galeri.css`).
- **Çözüm yönü:** 390 px'te `plotWidth` ve `sx` alan/değer aralığını yazdır; ölçeği ölçülen genişliğe bağla; `npm run shots -- ridgeline` ile 390 ve 1400 px'te doğrula.
- **Neden Şimdi Çözülmüyor:** Galeri sitesi işinin kapsamı dışında; bileşen değişikliği ayrı görsel denetim ister.
- **Bağlı kalemler:** Yok.

---
