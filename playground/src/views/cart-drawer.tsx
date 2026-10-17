// Sepet çekmecesi: seçilen bileşenler, tema ve AI'a yapıştırılacak metin.
import { Bot, Link2, Terminal, Trash2, X } from "lucide-react";
import { REGISTRY_URL } from "../../../scripts/catalog.mjs";
import { Button } from "../../../registry/components/button/button";
import { Drawer, DrawerContent } from "../../../registry/components/drawer/drawer";
import { EmptyState } from "../../../registry/components/empty-state/empty-state";
import { buildPrompt, installCommand, shareHash, SITE_URL, type CartTheme } from "../lib/cart";
import { accentTitles, copyText, entryOf, type Entry, type Shop } from "../lib/data";
import { routeHash } from "../lib/route";

/** Galerinin şu anki vurgusunu sepet temasına çevirir. */
export const themeFromAccent = (accent: string): CartTheme => accentTitles[accent] ? { kind: "preset", key: accent, title: accentTitles[accent]! } : { kind: "custom", hex: accent };
const themeLabel = (theme: CartTheme) => theme.kind === "preset" ? `${theme.title} (data-accent="${theme.key}")` : `Özel renk ${theme.hex}`;
const themeColor = (theme: CartTheme) => theme.kind === "custom" ? theme.hex : undefined;

export function CartDrawer({ open, onOpenChange, shop, clear }: { open: boolean; onOpenChange: (open: boolean) => void; shop: Shop; clear: () => void }) {
  const items = shop.cart.map(entryOf).filter((entry): entry is Entry => !!entry);
  const prompt = buildPrompt(items, shop.cartTheme, REGISTRY_URL);
  const copy = async (value: string, done: string) => shop.notify(await copyText(value) ? done : "Kopyalanamadı; metni seçip kopyalayın");
  const empty = !items.length && !shop.cartTheme;
  return <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent title="Sepet" description={empty ? "Henüz bir şey eklenmedi." : `${items.length} bileşen${shop.cartTheme ? " ve bir tema" : ""}`} side="right">
      <div className="cart">
        {empty ? <EmptyState title="Sepet boş" description="Bileşen sayfalarındaki “Sepete ekle” düğmesiyle seçim yapın. Renk laboratuvarından tema da eklenebilir." /> : <>
          <ul className="cart-list">
            {items.map(entry => <li key={entry.name}>
              <a href={routeHash.component(entry.name)} onClick={() => onOpenChange(false)}><strong>{entry.title}</strong><code>@snn-ui/{entry.name}</code></a>
              <Button variant="ghost" size="sm" aria-label={`${entry.title} sepetten çıkar`} onClick={() => shop.toggle(entry.name)}><X size={15} strokeWidth={1.75} aria-hidden="true" /></Button>
            </li>)}
          </ul>
          <div className="cart-theme">
            <span className="code-label">Tema</span>
            {shop.cartTheme
              ? <div className="cart-theme-row"><span className="dot" style={{ background: themeColor(shop.cartTheme) ?? "var(--accent)" }} aria-hidden="true" />{themeLabel(shop.cartTheme)}<Button variant="ghost" size="sm" aria-label="Temayı sepetten çıkar" onClick={() => shop.setCartTheme(null)}><X size={15} strokeWidth={1.75} aria-hidden="true" /></Button></div>
              : <div className="cart-theme-row">Tema eklenmedi.<Button variant="secondary" size="sm" onClick={() => shop.setCartTheme(themeFromAccent(shop.accent))}>Şu anki rengi ekle</Button></div>}
          </div>
          <label className="code-label" htmlFor="cart-prompt">AI'a verilecek metin</label>
          <textarea id="cart-prompt" className="prompt" readOnly value={prompt} rows={12} onFocus={event => event.currentTarget.select()} />
          <div className="cart-actions">
            <Button onClick={() => copy(prompt, "AI metni kopyalandı")}><Bot size={16} strokeWidth={1.75} aria-hidden="true" /> AI metnini kopyala</Button>
            {items.length > 0 && <Button variant="secondary" onClick={() => copy(installCommand(items.map(entry => entry.name)), "Komut kopyalandı")}><Terminal size={16} strokeWidth={1.75} aria-hidden="true" /> Yalnız komut</Button>}
            <Button variant="secondary" onClick={() => copy(`${SITE_URL}/${shareHash(shop.cart, shop.cartTheme)}`, "Bağlantı kopyalandı")}><Link2 size={16} strokeWidth={1.75} aria-hidden="true" /> Bağlantı</Button>
            <Button variant="ghost" onClick={() => { clear(); shop.notify("Sepet boşaltıldı"); }}><Trash2 size={16} strokeWidth={1.75} aria-hidden="true" /> Boşalt</Button>
          </div>
        </>}
      </div>
    </DrawerContent>
  </Drawer>;
}
