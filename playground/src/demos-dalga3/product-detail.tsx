// product-detail örneği. Ürün, fiyat ve yorum sayıları uydurmadır; fotoğraflar playground/public/ornek-foto içindeki Unsplash görselleridir (KAYNAK.md).
import { useState } from "react";
import { ProductDetail } from "../../../registry/components/product-detail/product-detail";
import type { Distribution, Finish, Size } from "../../../registry/components/product-detail/product-detail";

const shot = (name: string, file: string, at: number, position?: string) => ({ alt: `${name}, ${at + 1}. açı`, src: `/ornek-foto/${file}.jpg`, position, tone: at });
const FINISHES: Finish[] = [
  { value: "mese", label: "Meşe", color: "#b79b78", photos: [shot("Meşe kaplama", "urun-sehpa-1", 0, "55% 60%"), shot("Meşe kaplama", "urun-sehpa-2", 1), shot("Meşe kaplama", "sahne-ic-mekan", 2)] },
  { value: "ceviz", label: "Ceviz", color: "#5a3d2b", photos: [shot("Ceviz kaplama", "urun-sehpa-2", 0), shot("Ceviz kaplama", "urun-sehpa-1", 1, "30% 60%")] },
  { value: "beyaz", label: "Beyaz", color: "#f1efe9", photos: [shot("Beyaz kaplama", "sahne-ic-mekan", 0), shot("Beyaz kaplama", "urun-sehpa-1", 1, "70% 50%")] },
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
