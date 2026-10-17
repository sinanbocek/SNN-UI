import { useEffect, useMemo, useState } from "react";
import { MotionConfig } from "motion/react";
import { ShoppingBag, Palette, Type, House } from "lucide-react";
import { text } from "@snn/abacus-core";
import { Button } from "../../registry/components/button/button";
import { SearchField } from "../../registry/components/search-field/search-field";
import SegmentedControl from "../../registry/components/segmented-control/segmented-control";
import Toast from "../../registry/components/toast/toast";
import { accentCss, parseColor } from "./lib/color";
import { parseShare, type CartFont, type CartTheme } from "./lib/cart";
import { parseRoute, routeHash } from "./lib/route";
import { useStored } from "./lib/stored";
import { loadDemos } from "./lib/demo-loader";
import { CartDrawer } from "./views/cart-drawer";
import { ColorLab } from "./views/color-lab";
import { TypeScale } from "./views/type-scale";
import { CategoryView, ComponentView, Home, SearchResults, SharedCart } from "./views/showcase";

import { accentTitles, entries, fontTitles, groups, type Shop } from "./lib/data";

const known = new Set(entries.map(entry => entry.name));
const categoryKeys = new Set(groups.map(group => group.key));
const isNames = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === "string" && known.has(item));
const isTheme = (value: unknown): value is CartTheme | null => value === null || (typeof value === "object" && value !== null && ((value as CartTheme).kind === "preset" || ((value as CartTheme).kind === "custom" && !!parseColor((value as { hex: string }).hex))));
const isMode = (value: unknown): value is "light" | "dark" | "system" => value === "light" || value === "dark" || value === "system";
const isFontKey = (value: unknown): value is string => value === "default" || (typeof value === "string" && value in fontTitles);
const isCartFont = (value: unknown): value is CartFont | null => value === null || (typeof value === "object" && value !== null && typeof (value as CartFont).key === "string" && (value as CartFont).key in fontTitles);
const isAccent = (value: unknown): value is string => typeof value === "string" && (value in accentTitles || !!parseColor(value));
const searchable = entries.map(entry => ({ entry, key: text.searchKey(`${entry.title} ${entry.name} ${entry.description} ${groups.find(group => group.names.includes(entry.name))?.title ?? ""}`) }));

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => { setHash(window.location.hash); window.scrollTo({ top: 0 }); };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  const route = parseRoute(hash, known, categoryKeys);
  const [mode, setMode] = useStored<"light" | "dark" | "system">("snn-ui-tema", "system", isMode);
  const [accent, setAccent] = useStored("snn-ui-vurgu", "blue", isAccent);
  const [cart, setCart] = useStored<string[]>("snn-ui-sepet", [], isNames);
  const [cartTheme, setCartTheme] = useStored<CartTheme | null>("snn-ui-sepet-tema", null, isTheme);
  const [font, setFont] = useStored("snn-ui-yazi", "default", isFontKey);
  const [cartFont, setCartFont] = useStored<CartFont | null>("snn-ui-sepet-yazi", null, isCartFont);
  // Yazı tipi takımı data-font ile uygulanır; varsayılan takımda öznitelik kalkar.
  useEffect(() => { if (font === "default") delete document.documentElement.dataset.font; else document.documentElement.dataset.font = font; }, [font]);
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", key: 0 });
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  // Ana sayfa açıldıktan sonra örnekleri arka planda indir; kategoriye geçiş beklemeden açılsın.
  useEffect(() => { const timer = window.setTimeout(() => { void loadDemos(); }, 1500); return () => window.clearTimeout(timer); }, []);
  const theme = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  // Hazır vurgu data-accent ile, renk kodu ise üretilen değişkenlerle uygulanır.
  useEffect(() => {
    const rgb = accent in accentTitles ? null : parseColor(accent);
    document.documentElement.dataset.accent = rgb ? "custom" : accent;
    let style = document.getElementById("snn-custom-accent");
    if (!style) { style = document.createElement("style"); style.id = "snn-custom-accent"; document.head.append(style); }
    style.textContent = rgb ? accentCss(rgb) : "";
  }, [accent]);

  const shop: Shop = useMemo(() => ({
    cart,
    inCart: name => cart.includes(name),
    toggle: name => setCart(cart.includes(name) ? cart.filter(item => item !== name) : [...cart, name]),
    accent, setAccent, cartTheme, setCartTheme, font, setFont, cartFont, setCartFont,
    notify: message => setToast(current => ({ open: true, message, key: current.key + 1 })),
  }), [accent, cart, cartFont, cartTheme, font, setAccent, setCart, setCartFont, setCartTheme, setFont]);

  const shared = route.view === "share" ? parseShare(hash, known, accentTitles, fontTitles) : null;
  const searchKey = text.searchKey(query.trim());
  const results = searchKey ? searchable.filter(item => searchKey.split(/\s+/).every(word => item.key.includes(word))).map(item => item.entry) : [];

  const go = (target: string) => { setQuery(""); window.location.hash = target; };
  const current = route.view === "category" ? route.key : route.view === "component" ? groups.find(group => group.names.includes(route.name))?.key : route.view;

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip" href="#icerik">İçeriğe geç</a>
      <header className="top">
        <a className="brand" href={routeHash.home} onClick={() => setQuery("")}><span className="brand-mark" aria-hidden="true" />SNN-UI</a>
        <div className="top-search"><SearchField label="Bileşen ara" placeholder="Bileşen ara: grafik, tarih, sepet…" value={query} onValueChange={setQuery} /></div>
        <div className="top-actions">
          <SegmentedControl label="Tema" value={mode} onValueChange={value => setMode(value as typeof mode)} options={[{ value: "light", label: "Açık" }, { value: "dark", label: "Koyu" }, { value: "system", label: "Sistem" }]} />
          <Button variant="primary" onClick={() => setCartOpen(true)} aria-label={`Sepet, ${cart.length} bileşen`}>
            <ShoppingBag size={16} strokeWidth={1.75} aria-hidden="true" /> Sepet <span className="count" aria-hidden="true">{cart.length}</span>
          </Button>
        </div>
      </header>
      <div className="shell">
        <nav className="side" aria-label="Kategoriler">
          <a href={routeHash.home} aria-current={current === "home" && !query ? "page" : undefined} onClick={() => setQuery("")}><House size={15} strokeWidth={1.75} aria-hidden="true" /> Ana sayfa</a>
          <span className="side-title">Kategoriler</span>
          {groups.map(group => <a key={group.key} href={routeHash.category(group.key)} aria-current={current === group.key && !query ? "page" : undefined} onClick={() => setQuery("")}>{group.title}<span className="side-count">{group.names.length}</span></a>)}
          <span className="side-title">Tasarım</span>
          <a href={routeHash.color} aria-current={current === "color" && !query ? "page" : undefined} onClick={() => setQuery("")}><Palette size={15} strokeWidth={1.75} aria-hidden="true" /> Renk laboratuvarı</a>
          <a href={routeHash.type} aria-current={current === "type" && !query ? "page" : undefined} onClick={() => setQuery("")}><Type size={15} strokeWidth={1.75} aria-hidden="true" /> Tipografi</a>
        </nav>
        <main className="main" id="icerik" tabIndex={-1}>
          {query.trim() ? <SearchResults query={query} results={results} shop={shop} onOpen={name => go(routeHash.component(name))} />
            : route.view === "category" ? <CategoryView group={groups.find(group => group.key === route.key)!} shop={shop} />
            : route.view === "component" ? <ComponentView name={route.name} shop={shop} />
            : route.view === "color" ? <ColorLab shop={shop} />
            : route.view === "type" ? <TypeScale shop={shop} />
            : route.view === "share" && shared ? <SharedCart names={shared.names} theme={shared.theme} font={shared.font} shop={shop} onDone={() => { go(routeHash.home); setCartOpen(true); }} setCart={setCart} />
            : <Home shop={shop} />}
        </main>
      </div>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} shop={shop} clear={() => { setCart([]); setCartTheme(null); setCartFont(null); }} />
      <Toast key={toast.key} title={toast.message} open={toast.open} onOpenChange={open => setToast(current => ({ ...current, open }))} duration={2500} />
    </MotionConfig>
  );
}
