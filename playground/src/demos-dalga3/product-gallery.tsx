// product-gallery örneği. Ürün, renk ve bedenler uydurmadır; fotoğraflar playground/public/ornek-foto içindeki Unsplash görselleridir (KAYNAK.md), her renge farklı bir görsel dizisi bağlıdır.
import { useState } from "react";
import { money } from "@snn/abacus-core";
import { Button } from "../../../registry/components/button/button";
import { ProductGallery } from "../../../registry/components/product-gallery/product-gallery";
import type { GalleryColor, GallerySize } from "../../../registry/components/product-gallery/product-gallery";

const photo = (color: string, name: string, file: string, at: number, position?: string) => ({ id: `${color}-${at}`, alt: `${name}, ${at + 1}. açı`, src: `/ornek-foto/${file}.jpg`, position, width: 1200, height: 1200, title: name, caption: `${at + 1}. açı` });
const COLORS: GalleryColor[] = [
  { value: "kum", label: "Kum", color: "#d9cfba", photos: [photo("kum", "Keten örtü", "urun-ortu", 0), photo("kum", "Seramik kupa", "urun-kupa", 1)] },
  { value: "tas", label: "Taş", color: "#8a8d91", photos: [photo("tas", "Seramik kupalar", "urun-kupa-2", 0), photo("tas", "Seramik kupa", "urun-kupa", 1, "40% 50%"), photo("tas", "Keten örtü", "urun-ortu", 2)] },
  { value: "ceviz", label: "Ceviz", color: "#5b4636", photos: [photo("ceviz", "Ahşap sehpa", "urun-sehpa-1", 0, "55% 60%"), photo("ceviz", "Cam üstlü sehpa", "urun-sehpa-2", 1), photo("ceviz", "Seramik kupa", "urun-kupa", 2)] },
];
const SIZES: GallerySize[] = [
  { value: "S", label: "S" }, { value: "M", label: "M", soldOutIn: ["tas"] }, { value: "L", label: "L" }, { value: "XL", label: "XL", soldOutIn: ["kum", "tas"] },
];

export function ProductGalleryDemo() {
  const [log, setLog] = useState("");
  return (
    <div className="col">
      <span className="etiket">Fareyi ana fotoğrafın üstünde gezdirin: büyüteç merceği imleci yaylarla izler ("Büyüteç" düğmesi kapatır). Fotoğrafa basın ya da büyüt simgesine basın: görüntüleyici fotoğrafın yerinden büyür; + / − / 0, çift tıklama, Ctrl+tekerlek ve iki parmakla yakınlaşır, aşağı çekince kapanır, Esc önce uzaklaştırır. Rengi değiştirin: fotoğraflar bulanıktan netleşir; "M" bedeni Taş rengi için tükenmiştir (çizili, seçilemez). Bedenlerde oklar tükenenleri atlar. {log}</span>
      <ProductGallery colors={COLORS} sizes={SIZES} onSelectionChange={selection => setLog(selection.cleared ? "Beden tükendiği için seçim kalktı." : "")}
        header={<><b>Sofra ve oturma seti</b><span>{money.formatMajor(2490, { currency: "TRY", digits: 0 })}</span></>}
        footer={<Button disabled>Sepete ekle (uygulamanız bağlar)</Button>} />
    </div>
  );
}
