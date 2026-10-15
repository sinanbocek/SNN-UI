// product-gallery örneği. Ürün, renk ve bedenler uydurmadır; görseller kendi yer tutucularımızdır, gerçek fotoğraf yok.
import { useState } from "react";
import { money } from "@snn/abacus-core";
import { ProductGallery } from "../../../registry/components/product-gallery/product-gallery";
import type { GalleryColor, GallerySize } from "../../../registry/components/product-gallery/product-gallery";

const photo = (color: string, at: number, tone: number) => ({ id: `${color}-${at}`, alt: `${color} ceket, ${at + 1}. açı (yer tutucu)`, tone, width: 800, height: 1000, title: `${color} ceket`, caption: `${at + 1}. açı` });
const COLORS: GalleryColor[] = [
  { value: "kum", label: "Kum", color: "#d9cfba", photos: [0, 1, 2, 3].map(at => photo("Kum", at, at)) },
  { value: "orman", label: "Orman", color: "#3e5a43", photos: [0, 1, 2].map(at => photo("Orman", at, at + 2)) },
  { value: "gece", label: "Gece", color: "#1f2a44", photos: [0, 1, 2, 3, 4].map(at => photo("Gece", at, at + 1)) },
];
const SIZES: GallerySize[] = [
  { value: "S", label: "S" }, { value: "M", label: "M", soldOutIn: ["orman"] }, { value: "L", label: "L" }, { value: "XL", label: "XL", soldOutIn: ["kum", "orman"] },
];

export function ProductGalleryDemo() {
  const [log, setLog] = useState("");
  return (
    <div className="col">
      <span className="etiket">Fareyi ana fotoğrafın üstünde gezdirin: büyüteç merceği imleci yaylarla izler ("Büyüteç" düğmesi kapatır). Fotoğrafa basın ya da büyüt simgesine basın: görüntüleyici fotoğrafın yerinden büyür; + / − / 0, çift tıklama, Ctrl+tekerlek ve iki parmakla yakınlaşır, aşağı çekince kapanır, Esc önce uzaklaştırır. Rengi değiştirin: fotoğraflar bulanıktan netleşir; "M" bedeni Orman rengi için tükenmiştir (çizili, seçilemez). Bedenlerde oklar tükenenleri atlar. {log}</span>
      <ProductGallery colors={COLORS} sizes={SIZES} onSelectionChange={selection => setLog(selection.cleared ? "Beden tükendiği için seçim kalktı." : "")}
        header={<><b>Yağmurluk ceket</b><span>{money.formatMajor(2490, { currency: "TRY", digits: 0 })}</span></>}
        footer={<button type="button" disabled style={{ padding: "10px 16px" }}>Sepete ekle (uygulama bağlar)</button>} />
    </div>
  );
}
