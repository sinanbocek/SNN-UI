// product-detail örneği. Ürün, fiyat ve yorum sayıları uydurmadır; görseller kendi yer tutucularımızdır.
import { useState } from "react";
import { ProductDetail } from "../../../registry/components/product-detail/product-detail";
import type { Distribution, Finish, Size } from "../../../registry/components/product-detail/product-detail";

const FINISHES: Finish[] = [
  { value: "mese", label: "Meşe", color: "#b79b78", photos: [0, 1, 2, 3].map(at => ({ alt: `Meşe kaplama, ${at + 1}. açı (yer tutucu)`, tone: at })) },
  { value: "ceviz", label: "Ceviz", color: "#5a3d2b", photos: [2, 3, 4].map(at => ({ alt: `Ceviz kaplama, ${at - 1}. açı (yer tutucu)`, tone: at })) },
  { value: "beyaz", label: "Beyaz", color: "#f1efe9", photos: [5, 1].map(at => ({ alt: `Beyaz kaplama (yer tutucu)`, tone: at })) },
];
const SIZES: Size[] = [
  { value: "s", label: "Küçük (80 cm)", price: 2400 },
  { value: "m", label: "Orta (120 cm)", price: 3190.5 },
  { value: "l", label: "Büyük (160 cm)", price: 4250, soldOutIn: ["ceviz"] },
];
const REVIEWS: Distribution = [128, 41, 12, 4, 3];

export function ProductDetailDemo() {
  const [log, setLog] = useState("");
  const [fail, setFail] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Fotoğrafı sürükleyin ya da şerit odaktayken sol/sağ ok tuşuna basın; kaplama değişince fotoğraflar soluk geçişle değişir. "Büyük" boyu Ceviz kaplamada tükenmiştir: seçilebilir, ama düğme "Gelince haber ver"e döner. "Ekleme başarısız" kutusu düğmeyi "Tekrar dene"ye düşürür.</span>
      <div className="row"><label><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Ekleme başarısız</label><span>{log}</span></div>
      <ProductDetail name="Masa Sehpası Orta" trail={[{ label: "Mağaza", href: "#" }, { label: "Sehpalar", href: "#" }, { label: "Masa Sehpası" }]} summary={["Katı ağaç gövde, mat vernik.", "Montaj gerektirmez."]}
        finishes={FINISHES} sizes={SIZES} reviews={REVIEWS}
        promises={[{ title: "Teslimat", text: "3 iş gününde kapınızda." }, { title: "İade", text: "30 gün içinde ücretsiz." }, { title: "Garanti", text: "2 yıl üretici garantisi." }]}
        sections={[{ title: "Ölçüler", content: "Yükseklik 45 cm, derinlik 50 cm." }, { title: "Bakım", content: "Nemli bezle silin; çözücü kullanmayın." }, { title: "Malzeme", content: "Katı meşe ya da ceviz; su bazlı vernik." }]}
        onAddToCart={async selection => { await new Promise(done => setTimeout(done, 700)); if (fail) throw new Error("hata"); setLog(`Eklendi: ${selection.finish} / ${selection.size} × ${selection.quantity}`); }}
        onNotify={selection => setLog(`Haber verilecek: ${selection.finish} / ${selection.size}`)} />
    </div>
  );
}
