// Renk laboratuvarı: hazır vurgular, renk kodu girişi, basamaklar, alternatifler, okunabilirlik ve canlı önizleme.
import { useState } from "react";
import { Check, Copy, Paintbrush, Plus } from "lucide-react";
import { Button } from "../../../registry/components/button/button";
import { Badge } from "../../../registry/components/badge/badge";
import { Input } from "../../../registry/components/input/input";
import { Progress } from "../../../registry/components/progress/progress";
import { Switch } from "../../../registry/components/switch/switch";
import { accentCss, accentTokens, allowedHue, alternatives, contrastLabel, contrastRatio, isAmber, isNeutral, nearestShade, oklchCss, oklchHex, parseColor, shades, toHex, toOklch, type Rgb, type Swatch } from "../lib/color";
import { ACCENTS, copyText, type Shop } from "../lib/data";
import { themeFromAccent } from "./cart-drawer";

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const INK: Rgb = { r: 17, g: 17, b: 17 };
/** snn-foundation.css'teki hazır vurguların açık ve koyu tema değerleri (galeride gösterim için). */
const PRESET_HEX: Record<string, [light: string, dark: string]> = { blue: ["#0562EF", "#6BA3FF"], violet: ["#7747FF", "#A78BFF"], green: ["#0DB879", "#53DCA6"], coral: ["#F15F55", "#FF9386"], rose: ["#ED4E9D", "#FF8BC5"], neutral: ["#363636", "#BEBEBE"] };
const SEMANTIC: [token: string, title: string][] = [["--success", "Başarı"], ["--warning", "Uyarı (mavi-gri)"], ["--danger", "Hata"], ["--foreground", "Metin"], ["--text-secondary", "İkincil metin"], ["--text-muted", "Soluk metin"], ["--border", "Kenar"], ["--surface", "Yüzey"], ["--surface-muted", "Soluk yüzey"], ["--background", "Zemin"]];

function Contrast({ label, first, second }: { label: string; first: Rgb; second: Rgb }) {
  const result = contrastLabel(contrastRatio(first, second));
  const tone = result.level === "Yetersiz" ? "danger" : result.level === "Büyük yazı" ? "warning" : "success";
  return <li className="contrast"><span className="contrast-sample" style={{ background: toHex(second), color: toHex(first) }} aria-hidden="true">Ag</span><span>{label}</span><strong>{result.text}</strong><Badge tone={tone} size="sm">{result.level}</Badge></li>;
}

function SwatchButton({ swatch, active, onPick }: { swatch: Swatch; active?: boolean; onPick: (hex: string) => void }) {
  return <button type="button" className="swatch" aria-pressed={active} aria-label={`${swatch.label}: ${swatch.hex}, bu rengi seç`} onClick={() => onPick(swatch.hex)}>
    <span className="swatch-color" style={{ background: swatch.hex }} />
    <span className="swatch-label">{swatch.label}</span>
    <code>{swatch.hex}</code>
  </button>;
}

export function ColorLab({ shop }: { shop: Shop }) {
  const [draft, setDraft] = useState(() => shop.accent.startsWith("#") ? shop.accent : "#0562EF");
  const rgb = parseColor(draft);
  const base = rgb ? toOklch(rgb) : null;
  const amber = base ? isAmber(base) : false;
  const hex = rgb ? toHex(rgb) : "";
  const pick = (value: string) => setDraft(value);
  const copy = async (value: string, done: string) => shop.notify(await copyText(value) ? done : "Kopyalanamadı; metni seçip kopyalayın");
  const tokens = rgb && !amber ? accentTokens(rgb) : null;
  const applied = shop.accent === hex;

  return <>
    <header className="page-head">
      <p className="eyebrow">Tasarım</p>
      <h1>Renk laboratuvarı</h1>
      <p className="lead">Hazır vurgulardan birini seç ya da kendi renk kodunu gir. Galeri anında o renge boyanır; beğendiğini sepete tema olarak ekle.</p>
    </header>

    <section className="lab-section" aria-labelledby="hazir">
      <h2 id="hazir">Hazır vurgular</h2>
      <p className="muted">Projede <code>&lt;html data-accent="blue"&gt;</code> gibi tek satırla seçilir. Amber ve turuncu SNN kuralı gereği yoktur.</p>
      <div className="presets">
        {ACCENTS.map(([key, title]) => <button key={key} type="button" className="preset" aria-pressed={shop.accent === key} onClick={() => { shop.setAccent(key); shop.notify(`Vurgu: ${title}`); }}>
          <span className="preset-colors"><span style={{ background: PRESET_HEX[key]![0] }} /><span style={{ background: PRESET_HEX[key]![1] }} /></span>
          <strong>{title}</strong><code>{key}</code>
          {shop.accent === key && <Check className="preset-check" size={16} strokeWidth={2} aria-hidden="true" />}
        </button>)}
      </div>
      {ACCENTS.some(([key]) => key === shop.accent) && <div className="row"><Button variant="secondary" size="sm" onClick={() => { shop.setCartTheme(themeFromAccent(shop.accent)); shop.notify("Tema sepete eklendi"); }}><Plus size={15} strokeWidth={1.75} aria-hidden="true" /> Bu vurguyu sepete tema olarak ekle</Button></div>}
    </section>

    <section className="lab-section" aria-labelledby="kendi">
      <h2 id="kendi">Kendi rengin</h2>
      <div className="lab-input">
        <Input label="Renk kodu" description="#EEEEEE, EEE ya da 238, 238, 238 yazabilirsin." value={draft} onChange={event => setDraft(event.target.value)} error={draft.trim() && !rgb ? "Bu kod okunamadı. Örnek: #0562EF ya da 5, 98, 239" : undefined} spellCheck={false} autoComplete="off" />
        <label className="picker"><span>Seçici</span><input type="color" value={hex ? hex.toLowerCase() : "#0562ef"} onChange={event => setDraft(event.target.value.toUpperCase())} aria-label="Renk seçici" /></label>
      </div>

      {rgb && base && <>
        <div className="lab-main">
          <div className="big-swatch" style={{ background: hex }}><span style={{ color: contrastRatio(rgb, WHITE) >= contrastRatio(rgb, INK) ? "#FFFFFF" : "#111111" }}>{hex}</span></div>
          <dl className="codes">
            <div><dt>HEX</dt><dd><code>{hex}</code></dd></div>
            <div><dt>RGB</dt><dd><code>rgb({rgb.r} {rgb.g} {rgb.b})</code></dd></div>
            <div><dt>OKLCH</dt><dd><code>{oklchCss(base)}</code></dd></div>
            <div><dt>Basamak</dt><dd>{isNeutral(base) ? "Gri (ton yok)" : `${nearestShade(base)} civarı`}</dd></div>
          </dl>
        </div>

        {amber && <div className="callout" role="status">
          <strong>Bu renk amber/turuncu aralığında.</strong> SNN kuralı uyarı ve vurgu için amber kullanmaz. En yakın izinli tonlar:
          <div className="row">
            {[allowedHue(base.h) === 45 ? 45 : 100, allowedHue(base.h) === 45 ? 100 : 45].map(hue => { const value = oklchHex({ ...base, h: hue }); return <Button key={hue} variant="secondary" size="sm" onClick={() => pick(value)}><span className="dot" style={{ background: value }} aria-hidden="true" />{value}</Button>; })}
          </div>
        </div>}

        <h3>Açıktan koyuya</h3>
        <div className="swatches shade-row">{shades(base).map(swatch => <SwatchButton key={swatch.label} swatch={swatch} active={swatch.hex === hex} onPick={pick} />)}</div>

        <h3>Alternatifler</h3>
        <div className="swatches">{alternatives(base).map(swatch => <SwatchButton key={swatch.label} swatch={swatch} onPick={pick} />)}</div>

        <h3>Okunabilirlik</h3>
        <p className="muted">WCAG: normal yazı için en az 4,5:1 (AA), büyük yazı ve simge için 3:1.</p>
        <ul className="contrasts">
          <Contrast label="Renk üstünde beyaz yazı" first={WHITE} second={rgb} />
          <Contrast label="Renk üstünde koyu yazı" first={INK} second={rgb} />
          <Contrast label="Beyaz zeminde bu renkte yazı" first={rgb} second={WHITE} />
          <Contrast label="Koyu zeminde bu renkte yazı" first={rgb} second={INK} />
        </ul>

        {tokens && <>
          <div className="row lab-actions">
            <Button onClick={() => { shop.setAccent(hex); shop.notify("Galeri bu renge boyandı"); }} disabled={applied}><Paintbrush size={16} strokeWidth={1.75} aria-hidden="true" /> {applied ? "Galeri bu renkte" : "Galeriyi bu renge boya"}</Button>
            <Button variant="secondary" onClick={() => { shop.setCartTheme({ kind: "custom", hex }); shop.notify("Tema sepete eklendi"); }}><Plus size={16} strokeWidth={1.75} aria-hidden="true" /> Sepete tema olarak ekle</Button>
            <Button variant="ghost" onClick={() => copy(accentCss(rgb), "CSS kopyalandı")}><Copy size={16} strokeWidth={1.75} aria-hidden="true" /> CSS'i kopyala</Button>
          </div>
          <div className="token-grid">
            {(["light", "dark"] as const).map(mode => <div key={mode} className="token-card">
              <strong>{mode === "light" ? "Açık tema" : "Koyu tema"}</strong>
              {Object.entries(tokens[mode]).map(([name, value]) => <div key={name} className="token-row"><span className="dot" style={{ background: value }} aria-hidden="true" /><code>{name}</code><code>{value}</code></div>)}
            </div>)}
          </div>
        </>}
      </>}
    </section>

    <section className="lab-section" aria-labelledby="onizleme">
      <h2 id="onizleme">Canlı önizleme</h2>
      <p className="muted">Galerinin şu anki vurgusuyla gerçek bileşenler.</p>
      <div className="stage preview">
        <div className="row"><Button>Kaydet</Button><Button variant="secondary">Vazgeç</Button><Button variant="ghost">Ayrıntı</Button></div>
        <div className="row"><Switch label="Bildirimler" defaultChecked /><Badge tone="info">Bilgi</Badge><Badge tone="success">Tamam</Badge><Badge tone="warning">Uyarı</Badge><Badge tone="danger">Hata</Badge></div>
        <div style={{ width: "100%", maxWidth: 360 }}><Progress label="Yükleniyor" value={64} showValue /></div>
        <p>Metin içinde <a href="#/renk">bir bağlantı</a> da vurgu rengini alır.</p>
      </div>
    </section>

    <section className="lab-section" aria-labelledby="anlam">
      <h2 id="anlam">Anlam renkleri ve nötrler</h2>
      <p className="muted">Bunlar vurgudan bağımsızdır; değişken adıyla kullanılır. Uyarı rengi amber değil mavi-gridir; kırmızı yalnız gerçek hata içindir.</p>
      <div className="semantic">{SEMANTIC.map(([token, title]) => <div key={token} className="semantic-item"><span className="swatch-color" style={{ background: `var(${token})` }} /><strong>{title}</strong><code>{token}</code></div>)}</div>
    </section>
  </>;
}
