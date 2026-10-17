// Tipografi sayfası: yazı aileleri, boyut basamakları ve Türkçe harf denetimi. Değerler snn-foundation.css değişkenlerinden okunur.
const SAMPLE = "Pijamalı hasta yağız şoföre çabucak güvendi.";
const SIZES: [token: string, rem: number, use: string][] = [
  ["--text-5xl", 4.5, "Karşılama başlığı"], ["--text-4xl", 3.25, "Sayfa vitrini"], ["--text-3xl", 2.25, "Büyük sayı, gösterge"],
  ["--text-2xl", 1.75, "Sayfa başlığı"], ["--text-xl", 1.375, "Bölüm başlığı"], ["--text-lg", 1.125, "Öne çıkan metin"],
  ["--text-base", 1, "Gövde metni"], ["--text-sm", .875, "Form, tablo, düğme"], ["--text-xs", .75, "Etiket, dipnot"],
];

export function TypeScale() {
  return <>
    <header className="page-head">
      <p className="eyebrow">Tasarım</p>
      <h1>Tipografi</h1>
      <p className="lead">Başlıklar Geist, gövde Inter. İkisi de temel değişkenlerle birlikte kurulur; ayrıca yazı tipi eklenmez.</p>
    </header>
    <section className="lab-section" aria-labelledby="aileler">
      <h2 id="aileler">Yazı aileleri</h2>
      <div className="families">
        <div className="family"><code>--font-display</code><span className="family-name" style={{ fontFamily: "var(--font-display)" }}>Geist</span><p style={{ fontFamily: "var(--font-display)" }}>{SAMPLE}</p><span className="muted">Başlık, büyük sayı, kart başlığı</span></div>
        <div className="family"><code>--font-body</code><span className="family-name" style={{ fontFamily: "var(--font-body)" }}>Inter</span><p style={{ fontFamily: "var(--font-body)" }}>{SAMPLE}</p><span className="muted">Gövde metni, form, tablo</span></div>
      </div>
      <p className="turkish" aria-label="Türkçe harf denetimi">ç ğ ı i ö ş ü · Ç Ğ I İ Ö Ş Ü · ₺ 1.234,56 · %12,5</p>
    </section>
    <section className="lab-section" aria-labelledby="basamaklar">
      <h2 id="basamaklar">Boyut basamakları</h2>
      <div className="scale">
        {SIZES.map(([token, rem, use]) => <div key={token} className="scale-row">
          <div className="scale-meta"><code>{token}</code><span>{rem * 16} px · {use}</span></div>
          <p style={{ fontSize: `var(${token})`, fontFamily: rem >= 1.375 ? "var(--font-display)" : "var(--font-body)", letterSpacing: rem >= 1.375 ? "var(--tracking-display)" : "var(--tracking-body)", lineHeight: rem >= 1.375 ? "var(--leading-display)" : "var(--leading-body)" }}>{rem >= 2.25 ? "Aylık ciro ₺1,25Mn" : SAMPLE}</p>
        </div>)}
      </div>
    </section>
    <section className="lab-section" aria-labelledby="kalinlik">
      <h2 id="kalinlik">Kalınlıklar</h2>
      <div className="weights">{[400, 500, 600, 700].map(weight => <p key={weight} style={{ fontWeight: weight }}><code>{weight}</code> {SAMPLE}</p>)}</div>
    </section>
  </>;
}
