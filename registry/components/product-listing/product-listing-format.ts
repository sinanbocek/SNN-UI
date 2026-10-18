// Ürün listesinin saf mantığı: süzgeç, sıralama, fiyat sınırları ve yazımlar. Para TRY'dir; sayılar ABACUS'tandır.
import { priceText, countText } from "../lib/shop-format";

export interface ProductPhoto {
  alt: string;
  /** Verilmezse kendi yer tutucu çizilir. */
  src?: string | undefined;
  /** Fotoğrafın odak noktası (CSS object-position), örneğin "40% 60%". */
  position?: string | undefined;
  /** Yer tutucunun renk tonu (0–5). */
  tone?: number | undefined;
}

export interface Product {
  id: string;
  name: string;
  /** Tek satır ayrıntı (malzeme gibi). */
  detail?: string | undefined;
  /** Ana birimde TRY. */
  price: number;
  /** Eski fiyat; verilirse üstü çizili yazılır. */
  compareAt?: number | undefined;
  /** Renk değerleri (`colors` seçeneklerinin `value` alanı). */
  colors: string[];
  sizes: string[];
  inStock: boolean;
  badge?: string | undefined;
  photo: ProductPhoto;
  hoverPhoto?: ProductPhoto | undefined;
  /** Büyük sayı daha yenidir ("En yeniler" sıralaması). */
  addedAt: number;
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc";
export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Öne çıkanlar" },
  { value: "newest", label: "En yeniler" },
  { value: "price-asc", label: "Fiyat: artan" },
  { value: "price-desc", label: "Fiyat: azalan" },
];

export interface Filters { range: [number, number]; colors: string[]; sizes: string[]; inStockOnly: boolean }

export const PRICE_STEP = 10;

/** Fiyat sınırları: en düşük aşağı, en yüksek yukarı 10'a yuvarlanır. Ürün yoksa [0, 0]. */
export function priceBounds(products: Pick<Product, "price">[]): [number, number] {
  if (!products.length) return [0, 0];
  const prices = products.map(product => product.price);
  return [Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP, Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP];
}

export const initialFilters = (bounds: [number, number]): Filters => ({ range: bounds, colors: [], sizes: [], inStockOnly: false });

/** Bir ürün, seçilen renklerden ve bedenlerden herhangi birine sahipse eşleşir; seçim yoksa eşleşir. */
export function matches(product: Product, filters: Filters): boolean {
  if (product.price < filters.range[0] || product.price > filters.range[1]) return false;
  if (filters.inStockOnly && !product.inStock) return false;
  if (filters.colors.length && !product.colors.some(color => filters.colors.includes(color))) return false;
  if (filters.sizes.length && !product.sizes.some(size => filters.sizes.includes(size))) return false;
  return true;
}

export function visibleProducts(products: Product[], filters: Filters, sort: SortKey): Product[] {
  const list = products.filter(product => matches(product, filters));
  if (sort === "newest") return [...list].sort((a, b) => b.addedAt - a.addedAt);
  if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
  return list;
}

/** Etkin süzgeç sayısı: fiyat aralığı daraltıldıysa 1, her seçili renk ve beden, stok anahtarı. */
export function activeFilterCount(filters: Filters, bounds: [number, number]): number {
  const rangeOn = filters.range[0] > bounds[0] || filters.range[1] < bounds[1];
  return (rangeOn ? 1 : 0) + filters.colors.length + filters.sizes.length + (filters.inStockOnly ? 1 : 0);
}

/** Fiyat başını 10 TRY oynatır; iki baş birbirini geçemez ve sınırlar içinde kalır. */
export function moveRange(range: [number, number], end: "low" | "high", value: number, bounds: [number, number]): [number, number] {
  const snapped = Math.round(value / PRICE_STEP) * PRICE_STEP;
  if (end === "low") return [Math.min(Math.max(snapped, bounds[0]), range[1]), range[1]];
  return [range[0], Math.max(Math.min(snapped, bounds[1]), range[0])];
}

export const productCountText = (count: number) => `${countText(count)} ürün`;
export const rangeText = (range: [number, number]) => `${priceText(range[0])} – ${priceText(range[1])}`;
export const filtersButtonText = (count: number) => count ? `Süzgeçler (${countText(count)})` : "Süzgeçler";
export const addedText = (name: string, size?: string) => `${name}${size ? `, ${size}` : ""} sepete eklendi.`;
