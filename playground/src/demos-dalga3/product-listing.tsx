// product-listing örneği. Ürünler, fiyatlar ve renkler uydurmadır; görseller kendi yer tutucularımızdır.
import { useState } from "react";
import { ProductListing } from "../../../registry/components/product-listing/product-listing";
import type { Product } from "../../../registry/components/product-listing/product-listing";

const COLORS = [
  { value: "siyah", label: "Siyah", color: "#222426" },
  { value: "krem", label: "Krem", color: "#e9e3d6" },
  { value: "haki", label: "Haki", color: "#5d6b4a" },
  { value: "lacivert", label: "Lacivert", color: "#233b66" },
  { value: "bordo", label: "Bordo", color: "#6e2433" },
];
const NAMES: [string, string][] = [["Keten gömlek", "%100 keten"], ["Yün kazak", "Merinos yünü"], ["Pamuklu tişört", "Organik pamuk"], ["Kargo pantolon", "Dokuma pamuk"], ["Su geçirmez mont", "Geri dönüşümlü naylon"], ["Triko hırka", "Yün karışımı"], ["Kadife ceket", "Pamuk kadife"], ["Basic sweatshirt", "Havlu doku"], ["Denim etek", "Esnek denim"], ["Keten pantolon", "Keten ve viskon"]];
const SIZES = ["XS", "S", "M", "L", "XL"];

const PRODUCTS: Product[] = NAMES.map(([name, detail], at) => ({
  id: `urun-${at + 1}`, name, detail,
  price: 390 + at * 175 + (at % 3 === 0 ? .5 : 0),
  compareAt: at % 4 === 1 ? 390 + at * 175 + 200 : undefined,
  colors: [COLORS[at % 5]!.value, COLORS[(at + 2) % 5]!.value],
  sizes: at === 2 ? ["Tek beden"] : SIZES.slice(at % 2, 4 + (at % 2)),
  inStock: at !== 4 && at !== 7,
  badge: at % 5 === 0 ? "Yeni" : undefined,
  photo: { alt: `${name}, ön görünüm (yer tutucu)`, tone: at },
  hoverPhoto: { alt: `${name}, arka görünüm (yer tutucu)`, tone: at + 3 },
  addedAt: at,
}));

export function ProductListingDemo() {
  const [cart, setCart] = useState(0);
  const [loading, setLoading] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Sürgüleri ok tuşlarıyla 10 ₺ oynatın; renk ve bedene basın, "Yalnız stokta"yı deneyin. Karta gelince ikinci görsel soluk geçişle gelir, "Hızlı ekle" çok bedenli üründe beden satırı açar. Pencereyi daraltınca (640 px altı) süzgeçler soldan açılan sayfaya geçer.</span>
      <div className="row"><label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label></div>
      <ProductListing title="Sonbahar koleksiyonu" products={PRODUCTS} colors={COLORS} cartCount={cart} onAddToCart={() => setCart(count => count + 1)} loading={loading} />
    </div>
  );
}
