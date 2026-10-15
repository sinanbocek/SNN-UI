"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Drawer, DrawerContent } from "../drawer/drawer";
import { EmptyState } from "../empty-state/empty-state";
import { Switch } from "../switch/switch";
import { motionTokens } from "../lib/motion-tokens";
import { priceText } from "../lib/shop-format";
import { FramedPhoto, SwatchGroup, useAnnouncer, type SwatchOption } from "../lib/shop-parts";
import { useElementWidth, useReducedMotionSafe } from "../lib/viz-utils";
import { SORT_OPTIONS, PRICE_STEP, activeFilterCount, addedText, filtersButtonText, initialFilters, moveRange, priceBounds, productCountText, rangeText, visibleProducts, type Filters, type Product, type ProductPhoto, type SortKey } from "./product-listing-format";
import styles from "./product-listing.module.css";

export type { Product, ProductPhoto, Filters, SortKey, SwatchOption };

/** Bir koleksiyondaki ürünleri süzgeç, sıralama ve hızlı ekle ile kart ızgarası olarak göstermek için kullanın. Süzme ve sıralama bellekte yapılır; çok büyük kataloglarda sunucuda yapıp yalnız sonucu `products` olarak verin. Sepetin kendisi ve ödeme kapsam dışıdır. */
export interface ProductListingProps {
  title: string;
  products: Product[];
  /** Renk süzgeci seçenekleri; ürünlerin `colors` alanı bu değerlere bağlanır. */
  colors: SwatchOption[];
  /** Sepetteki toplam adet; dönen sayaçta gösterilir. */
  cartCount: number;
  /** Hızlı ekle tamamlanınca çağrılır. Çok bedenli üründe seçilen beden gelir. */
  onAddToCart: (product: Product, size?: string) => void;
  /** Süzgeç ya da sıralama değişince çağrılır (durumu adrese yazmak için). */
  onChange?: (state: { filters: Filters; sort: SortKey }) => void;
  loading?: boolean;
}

const NARROW = 640;

function CartIcon({ count }: { count: number }) {
  const reduced = useReducedMotionSafe();
  const first = useRef(true);
  const [tilt, setTilt] = useState(0);
  useEffect(() => { if (first.current) { first.current = false; return; } setTilt(value => value + 1); }, [count]);
  return <span className={styles.cart} role="status" aria-label={`Sepet, ${count} ürün`}>
    <motion.svg key={tilt} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" animate={reduced || !tilt ? undefined : { rotate: [0, -14, 8, 0] }} transition={{ duration: .4 }}><path d="M5 8h14l-1.2 11H6.2z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></motion.svg>
    <span className={styles.cartCount} aria-hidden="true"><AnimatedCounter value={count} /></span>
  </span>;
}

/** Çift başlı fiyat aralığı: iki yerel aralık girdisi üst üste durur; oklar 10 TRY oynatır. */
function RangeSlider({ bounds, value, onChange }: { bounds: [number, number]; value: [number, number]; onChange: (range: [number, number]) => void }) {
  const span = bounds[1] - bounds[0] || 1;
  const from = ((value[0] - bounds[0]) / span) * 100, to = ((value[1] - bounds[0]) / span) * 100;
  const input = (end: "low" | "high", label: string) => <input type="range" className={styles.thumb} min={bounds[0]} max={bounds[1]} step={PRICE_STEP} value={end === "low" ? value[0] : value[1]}
    aria-label={label} aria-valuetext={priceText(end === "low" ? value[0] : value[1])} onChange={event => onChange(moveRange(value, end, Number(event.target.value), bounds))} />;
  return <div className={styles.range}>
    <div className={styles.rangeTrack} aria-hidden="true"><span style={{ left: `${from}%`, right: `${100 - to}%` }} /></div>
    {input("low", "En düşük fiyat")}{input("high", "En yüksek fiyat")}
    <p className={styles.rangeText}>{rangeText(value)}</p>
  </div>;
}

/** Sıralama menüsü: liste kutusu açılır; odak listede kalır, seçili öğe `aria-activedescendant` ile bildirilir. */
function SortMenu({ value, onChange }: { value: SortKey; onChange: (value: SortKey) => void }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const current = SORT_OPTIONS.find(option => option.value === value)!;
  useEffect(() => { if (open) list.current?.focus(); }, [open]);
  const close = (restore = true) => { setOpen(false); if (restore) button.current?.focus(); };
  const choose = (at: number) => { onChange(SORT_OPTIONS[at]!.value); close(); };
  const key = (event: KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else if (event.key === "ArrowDown") { event.preventDefault(); setActive(at => Math.min(at + 1, SORT_OPTIONS.length - 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(at => Math.max(at - 1, 0)); }
    else if (event.key === "Home") { event.preventDefault(); setActive(0); }
    else if (event.key === "End") { event.preventDefault(); setActive(SORT_OPTIONS.length - 1); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(active); }
    else if (event.key === "Tab") close(false);
  };
  return <div className={styles.sort}>
    <button ref={button} type="button" className={styles.sortButton} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${uid}-list`}
      onClick={() => { setActive(Math.max(0, SORT_OPTIONS.findIndex(option => option.value === value))); setOpen(!open); }}>Sırala: <b>{current.label}</b></button>
    {open && <ul ref={list} id={`${uid}-list`} className={styles.sortList} role="listbox" tabIndex={-1} aria-label="Sırala" aria-activedescendant={`${uid}-o${active}`} onKeyDown={key} onBlur={() => setOpen(false)}>
      {SORT_OPTIONS.map((option, at) => <li key={option.value} id={`${uid}-o${at}`} role="option" aria-selected={option.value === value} data-active={at === active || undefined} onMouseEnter={() => setActive(at)} onMouseDown={event => { event.preventDefault(); choose(at); }}>{option.label}</li>)}
    </ul>}
  </div>;
}

function Photo({ photo }: { photo: ProductPhoto }) {
  return <FramedPhoto src={photo.src} alt={photo.alt} ratio="4 / 5" position={photo.position} tone={photo.tone} className={styles.img} />;
}

function ProductCard({ product, colors, onAdd, reduced }: { product: Product; colors: SwatchOption[]; onAdd: (product: Product, size?: string) => void; reduced: boolean }) {
  const [step, setStep] = useState<"idle" | "sizes" | "added">("idle");
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const done = (size?: string) => { onAdd(product, size); setStep("added"); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setStep("idle"), 1800); };
  const press = () => { if (!product.inStock) return; if (product.sizes.length > 1) setStep("sizes"); else done(product.sizes[0]); };
  const dots = product.colors.map(value => colors.find(option => option.value === value)).filter((option): option is SwatchOption => !!option);
  const fade = reduced ? { duration: 0 } : { duration: motionTokens.duration.fast };
  return <motion.li layout={!reduced} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : { layout: motionTokens.spring.smooth, opacity: fade }} className={styles.card} data-out={!product.inStock || undefined}>
    <div className={styles.photo}>
      <Photo photo={product.photo} />
      {product.hoverPhoto && <div className={styles.photoHover}><Photo photo={product.hoverPhoto} /></div>}
      {product.badge && <span className={styles.badge}><Badge tone="info" size="sm">{product.badge}</Badge></span>}
      {!product.inStock && <span className={styles.out}>Tükendi</span>}
      <div className={styles.quick} data-open={step !== "idle" || undefined}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "idle" && <motion.button key="idle" type="button" className={styles.pill} disabled={!product.inStock} onClick={press} aria-label={`Hızlı ekle: ${product.name}`} initial={{ opacity: 0, filter: "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={fade}>Hızlı ekle</motion.button>}
          {step === "sizes" && <motion.div key="sizes" role="group" aria-label={`Beden seçin: ${product.name}`} className={styles.sizeRow} initial={{ opacity: 0, filter: "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={fade} onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); setStep("idle"); } }}>
            {product.sizes.map((size, at) => <button key={size} type="button" className={styles.size} autoFocus={at === 0} onClick={() => done(size)}>{size}</button>)}
          </motion.div>}
          {step === "added" && <motion.span key="added" className={styles.pill} data-done="" initial={{ opacity: 0, filter: "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={fade}>✓ Eklendi</motion.span>}
        </AnimatePresence>
      </div>
    </div>
    <div className={styles.info}>
      <h3 className={styles.name}>{product.name}</h3>
      {product.detail && <p className={styles.detail}>{product.detail}</p>}
      <p className={styles.price}>{product.compareAt && <s aria-label={`Eski fiyat ${priceText(product.compareAt)}`}>{priceText(product.compareAt)}</s>}<b>{priceText(product.price)}</b></p>
      {dots.length > 0 && <p className={styles.dots} role="img" aria-label={`Renkler: ${dots.map(dot => dot.label).join(", ")}`}>{dots.map(dot => <i key={dot.value} className={styles.dot} style={{ background: dot.color }} />)}</p>}
    </div>
  </motion.li>;
}

export function ProductListing({ title, products, colors, cartCount, onAddToCart, onChange, loading = false }: ProductListingProps) {
  const reduced = useReducedMotionSafe();
  const bounds = useMemo(() => priceBounds(products), [products]);
  const [filters, setFilters] = useState<Filters>(() => initialFilters(bounds));
  const [sort, setSort] = useState<SortKey>("featured");
  const [sheet, setSheet] = useState(false);
  const [root, width] = useElementWidth<HTMLDivElement>();
  const [live, announce] = useAnnouncer();
  const narrow = width > 0 && width < NARROW;
  const sizes = useMemo(() => [...new Set(products.flatMap(product => product.sizes))], [products]);
  const list = useMemo(() => visibleProducts(products, filters, sort), [products, filters, sort]);
  const count = activeFilterCount(filters, bounds);

  const update = (next: Partial<Filters>, nextSort = sort) => { const merged = { ...filters, ...next }; setFilters(merged); onChange?.({ filters: merged, sort: nextSort }); };
  const toggle = (key: "colors" | "sizes", value: string) => update({ [key]: filters[key].includes(value) ? filters[key].filter(item => item !== value) : [...filters[key], value] });
  const clear = () => update(initialFilters(bounds));
  useEffect(() => { if (!narrow) setSheet(false); }, [narrow]);

  const panel = <div className={styles.panel}>
    <section><h3 className={styles.legend}>Fiyat</h3><RangeSlider bounds={bounds} value={filters.range} onChange={range => update({ range })} /></section>
    <section><h3 className={styles.legend}>Renk</h3><SwatchGroup label="Renk" options={colors} value={filters.colors} onToggle={value => toggle("colors", value)} /></section>
    <section><h3 className={styles.legend}>Beden</h3><div className={styles.sizeFilter} role="group" aria-label="Beden">{sizes.map(size => <button key={size} type="button" className={styles.chip} aria-pressed={filters.sizes.includes(size)} onClick={() => toggle("sizes", size)}>{size}</button>)}</div></section>
    <div className={styles.stock}><Switch checked={filters.inStockOnly} onCheckedChange={checked => update({ inStockOnly: checked })} label="Yalnız stokta" /></div>
    <Button variant="ghost" size="sm" onClick={clear} disabled={!count}>Süzgeçleri temizle</Button>
  </div>;

  return <div ref={root} className={styles.root} data-narrow={narrow || undefined} data-reduced={reduced || undefined}>
    <header className={styles.top}>
      <h2 className={styles.title}>{title} <span className={styles.total} aria-live="polite">{productCountText(list.length)}</span></h2>
      <CartIcon count={cartCount} />
    </header>
    <div className={styles.bar}>
      {narrow && <Button size="sm" variant="secondary" onClick={() => setSheet(true)}>{filtersButtonText(count)}</Button>}
      <SortMenu value={sort} onChange={value => { setSort(value); onChange?.({ filters, sort: value }); }} />
    </div>
    <div className={styles.body}>
      {!narrow && <aside className={styles.aside} aria-label="Süzgeçler">{panel}</aside>}
      <div className={styles.results}>
        {loading ? <div className={styles.grid} aria-busy="true" role="status" aria-label="Ürünler yükleniyor">{Array.from({ length: 6 }, (_, at) => <div key={at} className={styles.skeleton}><span /><span /><span /></div>)}</div>
          : list.length === 0 ? <EmptyState title="Ürün bulunamadı" description="Bu süzgeçlere uyan ürün yok." action={<Button variant="secondary" size="sm" onClick={clear}>Süzgeçleri temizle</Button>} />
          : <ul className={styles.grid}><AnimatePresence initial={false} mode="popLayout">{list.map(product => <ProductCard key={product.id} product={product} colors={colors} reduced={reduced} onAdd={(item, size) => { onAddToCart(item, size); announce(addedText(item.name, size)); }} />)}</AnimatePresence></ul>}
      </div>
    </div>
    {live}
    {narrow && <Drawer open={sheet} onOpenChange={setSheet}><DrawerContent side="left" title="Süzgeçler" description={productCountText(list.length)}>{panel}</DrawerContent></Drawer>}
  </div>;
}

export default ProductListing;
