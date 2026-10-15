// product-listing örneği. Ürünler, fiyatlar ve renkler uydurmadır; fotoğraflar playground/public/ornek-foto içindeki Unsplash görselleridir (KAYNAK.md).
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
const NAMES: [string, string, string, string, string?][] = [
  ["Seramik kupa", "El yapımı, 350 ml", "urun-kupa", "urun-kupa-2"], ["Keten örtü", "%100 keten", "urun-ortu", "urun-kupa"], ["Ahşap sehpa", "Meşe, çelik ayak", "urun-sehpa-1", "urun-sehpa-2", "55% 60%"],
  ["Cam üstlü sehpa", "Cam ve meşe", "urun-sehpa-2", "urun-sehpa-1"], ["Kupa takımı", "Dörtlü, kil", "urun-kupa-2", "urun-kupa"], ["Rüzgârlık", "Su geçirmez", "urun-ceket", "urun-ortu"],
  ["Sehpa seti", "İkili, doğal", "urun-sehpa-1", "urun-sehpa-2", "30% 60%"], ["Beyaz kupa", "Mat sır", "urun-kupa", "urun-kupa-2", "40% 55%"], ["Masa örtüsü", "Nakışlı keten", "urun-ortu", "urun-kupa"], ["Rafa uygun set", "Kil kupalar", "urun-kupa-2", "urun-kupa", "30% 50%"],
];
const SIZES = ["Küçük", "Orta", "Büyük", "Çok büyük"];

const PRODUCTS: Product[] = NAMES.map(([name, detail, front, back, position], at) => ({
  id: `urun-${at + 1}`, name, detail,
  price: 390 + at * 175 + (at % 3 === 0 ? .5 : 0),
  compareAt: at % 4 === 1 ? 390 + at * 175 + 200 : undefined,
  colors: [COLORS[at % 5]!.value, COLORS[(at + 2) % 5]!.value],
  sizes: at === 2 ? ["Tek boy"] : SIZES.slice(at % 2, 3 + (at % 2)),
  inStock: at !== 4 && at !== 7,
  badge: at % 5 === 0 ? "Yeni" : undefined,
  photo: { alt: `${name}, ön görünüm`, src: `/ornek-foto/${front}.jpg`, position, tone: at },
  hoverPhoto: { alt: `${name}, ikinci görünüm`, src: `/ornek-foto/${back}.jpg`, tone: at + 3 },
  addedAt: at,
}));

export function ProductListingDemo() {
  const [cart, setCart] = useState(0);
  const [loading, setLoading] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Sürgüleri ok tuşlarıyla 10 ₺ oynatın; renk ve boya basın, "Yalnız stokta"yı deneyin. Karta gelince ikinci görsel soluk geçişle gelir, "Hızlı ekle" çok bedenli üründe beden satırı açar. Pencereyi daraltınca (640 px altı) süzgeçler soldan açılan sayfaya geçer.</span>
      <div className="row"><label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label></div>
      <ProductListing title="Sonbahar koleksiyonu" products={PRODUCTS} colors={COLORS} cartCount={cart} onAddToCart={() => setCart(count => count + 1)} loading={loading} />
    </div>
  );
}
