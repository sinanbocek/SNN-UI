// Vitrin sayfaları: ana sayfa, kategori, tek bileşen, arama sonuçları ve paylaşılan sepet.
import { Check, Copy, Plus, ArrowRight } from "lucide-react";
import { Button } from "../../../registry/components/button/button";
import { Badge } from "../../../registry/components/badge/badge";
import { EmptyState } from "../../../registry/components/empty-state/empty-state";
import { Skeleton } from "../../../registry/components/skeleton/skeleton";
import { useDemos } from "../lib/demo-loader";
import { accentTitles, copyText, entries, entryOf, groupOf, groups, type Category, type Entry, type Shop } from "../lib/data";
import type { CartTheme } from "../lib/cart";
import { routeHash } from "../lib/route";

const usesAbacus = (entry: Entry) => entry.deps.some(dep => dep.startsWith("@snn/abacus-core"));

export function CartButton({ name, shop, size = "sm" }: { name: string; shop: Shop; size?: "sm" | "md" }) {
  const added = shop.inCart(name);
  return <Button variant={added ? "secondary" : "primary"} size={size} aria-pressed={added} onClick={() => { shop.toggle(name); shop.notify(added ? "Sepetten çıkarıldı" : "Sepete eklendi"); }}>
    {added ? <Check size={15} strokeWidth={1.75} aria-hidden="true" /> : <Plus size={15} strokeWidth={1.75} aria-hidden="true" />}
    {added ? "Sepette" : "Sepete ekle"}
  </Button>;
}

/** Tek bileşenin vitrin bölümü: başlık, sepet düğmesi, canlı örnek, kullanım ve not. `id` npm run shots için bileşen adıdır. */
function Product({ entry, shop }: { entry: Entry; shop: Shop }) {
  const demos = useDemos();
  const demo = demos?.[entry.name];
  return <section id={entry.name} className="product" aria-labelledby={`${entry.name}-title`}>
    <div className="product-head">
      <div>
        <h2 id={`${entry.name}-title`}><a href={routeHash.component(entry.name)}>{entry.title}</a></h2>
        <div className="product-meta"><code>@snn-ui/{entry.name}</code>{usesAbacus(entry) && <Badge tone="info" size="sm">ABACUS</Badge>}</div>
      </div>
      <CartButton name={entry.name} shop={shop} />
    </div>
    <p className="product-desc">{entry.description}</p>
    <div className="stage" data-loading={!demos || undefined}>{!demos ? <Skeleton label="Örnek yükleniyor" lines={4} /> : demo ? demo() : <span className="eksik">Bu bileşen için örnek henüz yazılmadı.</span>}</div>
    <details className="usage">
      <summary>Kullanım ve kurulum</summary>
      <CodeLine label="Kurulum" value={`npx shadcn@latest add @snn-ui/${entry.name}`} shop={shop} />
      <CodeLine label="Örnek" value={entry.use} shop={shop} />
      {entry.note && <p className="note">{entry.note}</p>}
    </details>
  </section>;
}

function CodeLine({ label, value, shop }: { label: string; value: string; shop: Shop }) {
  return <div className="code-line">
    <span className="code-label">{label}</span>
    <pre><code>{value}</code></pre>
    <Button variant="ghost" size="sm" aria-label={`${label} kopyala`} onClick={async () => shop.notify(await copyText(value) ? "Kopyalandı" : "Kopyalanamadı; metni seçip kopyalayın")}><Copy size={15} strokeWidth={1.75} aria-hidden="true" /></Button>
  </div>;
}

export function Home({ shop }: { shop: Shop }) {
  return <>
    <section className="hero">
      <p className="eyebrow">SNN ailesinin arayüz kataloğu · {entries.length} bileşen</p>
      <h1>Beğendiğini sepete at, AI'a ver.</h1>
      <p className="lead">Bileşenleri canlı dene. Sepet, kodlama yaparken AI'a yapıştıracağın kurulum metnini hazırlar. Renk laboratuvarında kendi rengini dene; tema olarak sepete ekle.</p>
      <ol className="steps">
        <li><strong>Gez</strong><span>Kategoriden ya da aramadan bileşeni bul, canlı örneği dene.</span></li>
        <li><strong>Sepete ekle</strong><span>İstediklerini seç; istersen bir renk teması da ekle.</span></li>
        <li><strong>Kopyala</strong><span>Sepetteki "AI metnini kopyala" düğmesi kurulum talimatını hazırlar.</span></li>
      </ol>
    </section>
    <div className="tiles">
      {groups.map(group => <a key={group.key} className="tile" href={routeHash.category(group.key)}>
        <span className="tile-count">{group.names.length} bileşen</span>
        <strong>{group.title}</strong>
        <span className="tile-desc">{group.description}</span>
        <span className="tile-names">{group.names.slice(0, 4).map(name => entryOf(name)?.title).join(" · ")}…</span>
      </a>)}
      <a className="tile tile-accent" href={routeHash.color}>
        <span className="tile-count">Tasarım</span>
        <strong>Renk laboratuvarı</strong>
        <span className="tile-desc">Renk kodu gir; açıktan koyuya basamakları, alternatifleri ve okunabilirliği gör.</span>
        <span className="tile-names">Şu anki vurgu: {accentTitles[shop.accent] ?? shop.accent}</span>
      </a>
    </div>
  </>;
}

export function CategoryView({ group, shop }: { group: Category; shop: Shop }) {
  const items = group.names.map(entryOf).filter((entry): entry is Entry => !!entry);
  const added = items.filter(entry => shop.inCart(entry.name)).length;
  return <>
    <header className="page-head">
      <p className="eyebrow">Kategori · {items.length} bileşen{added ? ` · ${added} sepette` : ""}</p>
      <h1>{group.title}</h1>
      <p className="lead">{group.description}</p>
      <nav className="jump" aria-label={`${group.title} içindekiler`}>{items.map(entry => <a key={entry.name} href={`#${entry.name}`} onClick={event => { event.preventDefault(); document.getElementById(entry.name)?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>{entry.title}</a>)}</nav>
    </header>
    {items.map(entry => <Product key={entry.name} entry={entry} shop={shop} />)}
  </>;
}

export function ComponentView({ name, shop }: { name: string; shop: Shop }) {
  const entry = entryOf(name)!;
  const group = groupOf(name);
  return <>
    {group && <p className="crumb"><a href={routeHash.category(group.key)}>{group.title}</a> / {entry.title}</p>}
    <Product entry={entry} shop={shop} />
  </>;
}

export function SearchResults({ query, results, shop, onOpen }: { query: string; results: Entry[]; shop: Shop; onOpen: (name: string) => void }) {
  return <>
    <header className="page-head"><p className="eyebrow">Arama</p><h1>“{query.trim()}” için {results.length} sonuç</h1></header>
    {results.length === 0
      ? <EmptyState title="Sonuç yok" description="Başka bir kelime deneyin: grafik, tarih, para, tablo, sepet…" />
      : <ul className="results">{results.map(entry => <li key={entry.name}>
          <button type="button" className="result-open" onClick={() => onOpen(entry.name)}>
            <strong>{entry.title}</strong>
            <span className="result-cat">{groupOf(entry.name)?.title}</span>
            <span className="result-desc">{entry.description}</span>
            <span className="result-go">Canlı örneği aç <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" /></span>
          </button>
          <CartButton name={entry.name} shop={shop} />
        </li>)}</ul>}
  </>;
}

export function SharedCart({ names, theme, shop, setCart, onDone }: { names: string[]; theme: CartTheme | null; shop: Shop; setCart: (names: string[]) => void; onDone: () => void }) {
  const items = names.map(entryOf).filter((entry): entry is Entry => !!entry);
  return <>
    <header className="page-head">
      <p className="eyebrow">Paylaşılan sepet</p>
      <h1>{items.length} bileşen{theme ? " ve bir tema" : ""}</h1>
      <p className="lead">Bu bağlantı birinin seçtiği bileşenleri taşıyor. Sepetine eklersen kendi seçtiklerin korunur.</p>
    </header>
    <ul className="results">{items.map(entry => <li key={entry.name}><a className="result-open" href={routeHash.component(entry.name)}><strong>{entry.title}</strong><span className="result-desc">{entry.description}</span></a></li>)}</ul>
    {theme && <p className="note">Tema: {theme.kind === "preset" ? theme.title : theme.hex}</p>}
    <div className="row"><Button onClick={() => { setCart([...new Set([...shop.cart, ...names])]); if (theme) shop.setCartTheme(theme); shop.notify("Sepetine eklendi"); onDone(); }}>Sepetime ekle</Button></div>
  </>;
}
