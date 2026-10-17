import { useEffect, useMemo, useState } from "react";
import { MotionConfig } from "motion/react";
import { ShoppingBag, Palette, Type, House } from "lucide-react";
import { text } from "@snn/abacus-core";
import { Button } from "../../registry/components/button/button";
import { SearchField } from "../../registry/components/search-field/search-field";
import SegmentedControl from "../../registry/components/segmented-control/segmented-control";
import Toast from "../../registry/components/toast/toast";
import { accentCss, parseColor } from "./lib/color";
import { parseShare, type CartTheme } from "./lib/cart";
import { parseRoute, routeHash } from "./lib/route";
import { useStored } from "./lib/stored";
import { CartDrawer } from "./views/cart-drawer";
import { ColorLab } from "./views/color-lab";
import { TypeScale } from "./views/type-scale";
import { CategoryView, ComponentView, Home, SearchResults, SharedCart } from "./views/showcase";

import { accentTitles, entries, groups, type Shop } from "./lib/data";

const known = new Set(entries.map(entry => entry.name));
const categoryKeys = new Set(groups.map(group => group.key));
const isNames = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === "string" && known.has(item));
const isTheme = (value: unknown): value is CartTheme | null => value === null || (typeof value === "object" && value !== null && ((value as CartTheme).kind === "preset" || ((value as CartTheme).kind === "custom" && !!parseColor((value as { hex: string }).hex))));
const isMode = (value: unknown): value is "light" | "dark" | "system" => value === "light" || value === "dark" || value === "system";
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
    accent, setAccent, cartTheme, setCartTheme,
    notify: message => setToast(current => ({ open: true, message, key: current.key + 1 })),
  }), [accent, cart, cartTheme, setAccent, setCart, setCartTheme]);

  const shared = route.view === "share" ? parseShare(hash, known, accentTitles) : null;
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
            : route.view === "type" ? <TypeScale />
            : route.view === "share" && shared ? <SharedCart names={shared.names} theme={shared.theme} shop={shop} onDone={() => { go(routeHash.home); setCartOpen(true); }} setCart={setCart} />
            : <Home shop={shop} />}
        </main>
      </div>
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} shop={shop} clear={() => { setCart([]); setCartTheme(null); }} />
      <Toast key={toast.key} title={toast.message} open={toast.open} onOpenChange={open => setToast(current => ({ ...current, open }))} duration={2500} />
    </MotionConfig>
  );
}
