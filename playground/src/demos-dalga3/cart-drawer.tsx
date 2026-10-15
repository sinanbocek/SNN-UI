// cart-drawer örneği. Ürünler, fiyatlar ve kuponlar uydurmadır; görseller kendi yer tutucularımızdır. Gerçek ödeme yoktur.
import { useState } from "react";
import { text } from "@snn/abacus-core";
import { CartDrawer } from "../../../registry/components/cart-drawer/cart-drawer";
import type { CartProduct } from "../../../registry/components/cart-drawer/cart-drawer";

const ITEMS: [string, string, number][] = [
  ["Seramik kupa", "350 ml, el yapımı", 185], ["Keten örtü", "140 × 220 cm", 649.9], ["Cam sürahi", "1,2 litre", 320],
  ["Ahşap tepsi", "Meşe, 40 cm", 475.5], ["Mum seti", "Üçlü, ıhlamur", 260], ["Pamuk havlu", "Bej, 70 × 140", 410],
];
const PRODUCTS: CartProduct[] = ITEMS.map(([name, description, price], at) => ({ id: `u${at + 1}`, name, description, price, photo: { alt: `${name} (yer tutucu)`, tone: at } }));

export function CartDrawerDemo() {
  const [fail, setFail] = useState(false);
  return (
    <div className="col">
      <span className="etiket">"Sepete ekle" fotoğrafı sepet düğmesine uçurur; sayaç ancak uçuş bitince artar. Sepeti açın: adedi değiştirin, satırı sola kaydırın (ya da eksiye basın), kupon deneyin ("HOSGELDIN" yüzde 10, "KARGO50" 50 ₺ indirim, diğerleri geçersizdir). Ücretsiz kargo eşiği 1.000 ₺. Sipariş benzetimdir; kutu işaretliyse başarısız olur.</span>
      <div className="row"><label><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Sipariş başarısız olsun</label></div>
      <CartDrawer products={PRODUCTS} shipping={{ fee: 49.9, freeFrom: 1000 }}
        onApplyCoupon={async code => {
          await new Promise(done => setTimeout(done, 500));
          const key = text.upper(code.trim());
          return key === "HOSGELDIN" ? { code: key, percent: 10 } : key === "KARGO50" ? { code: key, amount: 50 } : null;
        }}
        onCheckout={async () => { await new Promise(done => setTimeout(done, 1100)); if (fail) throw new Error("hata"); }} />
    </div>
  );
}
