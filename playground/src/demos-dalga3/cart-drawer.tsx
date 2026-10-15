// cart-drawer örneği. Ürünler, fiyatlar ve kuponlar uydurmadır; fotoğraflar playground/public/ornek-foto içindeki Unsplash görselleridir (KAYNAK.md). Gerçek ödeme yoktur.
import { useState } from "react";
import { text } from "@snn/abacus-core";
import { CartDrawer } from "../../../registry/components/cart-drawer/cart-drawer";
import type { CartProduct } from "../../../registry/components/cart-drawer/cart-drawer";

const ITEMS: [string, string, number, string, string?][] = [
  ["Seramik kupa", "350 ml, el yapımı", 185, "urun-kupa"], ["Keten örtü", "140 × 220 cm", 649.9, "urun-ortu"], ["Ahşap sehpa", "Meşe, 90 cm", 2475.5, "urun-sehpa-1", "55% 60%"],
  ["Cam üstlü sehpa", "Çelik ayaklı", 3260, "urun-sehpa-2"], ["Kupa takımı", "Dörtlü, kil", 520, "urun-kupa-2"], ["Rüzgârlık", "Su geçirmez, mavi", 1410, "urun-ceket"],
];
const PRODUCTS: CartProduct[] = ITEMS.map(([name, description, price, photo, position], at) => ({ id: `u${at + 1}`, name, description, price, photo: { alt: name, src: `/ornek-foto/${photo}.jpg`, position, tone: at } }));

export function CartDrawerDemo() {
  const [fail, setFail] = useState(false);
  return (
    <div className="col">
      <span className="etiket">"Sepete ekle" fotoğrafı sepet düğmesine uçurur; sayaç ancak uçuş bitince artar. Sepeti açın: adedi değiştirin, satırı sola kaydırın (ya da eksiye basın), kupon deneyin ("HOSGELDIN" yüzde 10, "KARGO50" 50 ₺ indirim, diğerleri geçersizdir). Ücretsiz kargo eşiği 1.000 ₺. Sipariş benzetimdir; kutu işaretliyse başarısız olur.</span>
      <div className="row"><label><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Sipariş başarısız olsun</label></div>
      <CartDrawer products={PRODUCTS} shipping={{ fee: 49.9, freeFrom: 1000 }}
        onApplyCoupon={async code => {
          await new Promise(done => setTimeout(done, 500));
          const key = text.toAsciiUpper(code.trim());
          return key === "HOSGELDIN" ? { code: key, percent: 10 } : key === "KARGO50" ? { code: key, amount: 50 } : null;
        }}
        onCheckout={async () => { await new Promise(done => setTimeout(done, 1100)); if (fail) throw new Error("hata"); }} />
    </div>
  );
}
