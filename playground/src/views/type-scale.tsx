// Tipografi sayfası: yazı tipi takımları, yazı aileleri, boyut basamakları ve Türkçe harf denetimi. Değerler snn-foundation.css değişkenlerinden okunur.
import { Check, Plus } from "lucide-react";
import { Button } from "../../../registry/components/button/button";
import { FONT_SETS, type Shop } from "../lib/data";

const SAMPLE = "Pijamalı hasta yağız şoföre çabucak güvendi.";
const SIZES: [token: string, rem: number, use: string][] = [
  ["--text-5xl", 4.5, "Karşılama başlığı"], ["--text-4xl", 3.25, "Sayfa vitrini"], ["--text-3xl", 2.25, "Büyük sayı, gösterge"],
  ["--text-2xl", 1.75, "Sayfa başlığı"], ["--text-xl", 1.375, "Bölüm başlığı"], ["--text-lg", 1.125, "Öne çıkan metin"],
  ["--text-base", 1, "Gövde metni"], ["--text-sm", .875, "Form, tablo, düğme"], ["--text-xs", .75, "Etiket, dipnot"],
];

export function TypeScale({ shop }: { shop: Shop }) {
  const current = FONT_SETS.find(set => set.key === shop.font) ?? FONT_SETS[0]!;
  return <>
    <header className="page-head">
      <p className="eyebrow">Tasarım</p>
      <h1>Tipografi</h1>
      <p className="lead">Varsayılan takım: başlık Geist, gövde Inter, rakam ve kod Geist Mono. Dört takım daha isteğe bağlıdır; birine basınca bütün galeri o yazı tipine geçer.</p>
    </header>

    <section className="lab-section" aria-labelledby="takimlar">
      <h2 id="takimlar">Yazı tipi takımları</h2>
      <p className="muted">Projede tek satırla seçilir: <code>&lt;html data-font="plex"&gt;</code>. Seçilmeyen takımın yazı tipi indirilmez. Hepsi OFL lisanslı, Türkçe harfler tam.</p>
      <div className="font-sets">
        {FONT_SETS.map(set => <button key={set.key} type="button" className="font-set" aria-pressed={shop.font === set.key} onClick={() => { shop.setFont(set.key); shop.notify(`Yazı tipi: ${set.title}`); }}>
          <span className="font-set-head"><strong>{set.title}</strong>{shop.font === set.key && <Check size={16} strokeWidth={2} aria-hidden="true" />}</span>
          <span className="font-set-display" style={{ fontFamily: `${set.families.display}, sans-serif` }}>Aylık ciro ₺1,25Mn</span>
          <span className="font-set-body" style={{ fontFamily: `${set.families.body}, sans-serif` }}>{SAMPLE}</span>
          <span className="font-set-mono" style={{ fontFamily: `${set.families.mono}, monospace` }}>FTR-2026-000184 · 1.234,56</span>
          <span className="font-set-meta">{set.display} · {set.body} · {set.mono}</span>
          <span className="font-set-use">{set.use}</span>
        </button>)}
      </div>
      <div className="row">
        {current.key === "default"
          ? <span className="muted">Varsayılan takım temel değişkenlerle kendiliğinden gelir; sepete eklemeye gerek yok.</span>
          : <Button variant="secondary" size="sm" onClick={() => { shop.setCartFont({ key: current.key, title: current.title }); shop.notify("Yazı tipi takımı sepete eklendi"); }}><Plus size={15} strokeWidth={1.75} aria-hidden="true" /> {current.title} takımını sepete ekle</Button>}
      </div>
    </section>

    <section className="lab-section" aria-labelledby="aileler">
      <h2 id="aileler">Yazı aileleri ({current.title})</h2>
      <div className="families">
        <div className="family"><code>--font-display</code><span className="family-name" style={{ fontFamily: "var(--font-display)" }}>{current.display}</span><p style={{ fontFamily: "var(--font-display)" }}>{SAMPLE}</p><span className="muted">Başlık, büyük sayı, kart başlığı</span></div>
        <div className="family"><code>--font-body</code><span className="family-name" style={{ fontFamily: "var(--font-body)" }}>{current.body}</span><p style={{ fontFamily: "var(--font-body)" }}>{SAMPLE}</p><span className="muted">Gövde metni, form, tablo</span></div>
        <div className="family"><code>--font-mono</code><span className="family-name" style={{ fontFamily: "var(--font-mono)" }}>{current.mono}</span><p style={{ fontFamily: "var(--font-mono)" }}>FTR-2026-000184 · ₺1.234,56</p><span className="muted">Kod, kimlik numarası, hizalı rakam</span></div>
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
