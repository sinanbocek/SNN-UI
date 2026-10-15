// lightbox-gallery örneği. Başlıklar uydurmadır; fotoğraflar farklı oranlıdır (dikey, yatay, kare) ve playground/public/ornek-foto içindeki Unsplash görselleridir (KAYNAK.md).
import { useState } from "react";
import { LightboxGallery } from "../../../registry/components/lightbox-gallery/lightbox-gallery";
import type { ViewerImage } from "../../../registry/components/lightbox-gallery/lightbox-gallery";

const SIZES: [number, number][] = [[800, 1000], [1200, 800], [900, 900], [800, 1200], [1200, 700], [900, 1100], [1000, 1000], [1200, 900], [800, 1000], [1100, 700], [900, 1200], [1000, 800]];
const FOTOS: [string, string, string?][] = [
  ["Kıyıda sabah", "sahne-deniz"], ["Çarşı", "sahne-sokak", "18% 50%"], ["Zeytinlik", "sahne-orman"], ["Dağ yolu", "sahne-dag"], ["Oturma odası", "sahne-ic-mekan"], ["Sofra", "sahne-yemek"],
  ["Keten", "urun-ortu"], ["Raf", "urun-kupa-2"], ["Sehpa", "urun-sehpa-2"], ["Renkler", "doku-kapak"], ["Portre", "portre-4"], ["Rüzgârlık", "urun-ceket"],
];
const IMAGES: ViewerImage[] = SIZES.map(([width, height], at) => ({ id: `f${at + 1}`, alt: `${FOTOS[at]![0]}, ${width > height ? "yatay" : width < height ? "dikey" : "kare"} kare`, src: `/ornek-foto/${FOTOS[at]![1]}.jpg`, position: FOTOS[at]![2], width, height, title: FOTOS[at]![0], caption: `${at + 1}. gün` }));

export function LightboxGalleryDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Fotoğraflar oranlarını korur; sütun sayısı kabın genişliğinden gelir (en az iki). Bir fotoğrafa basın (ya da Enter): fotoğraf yerinden büyüyerek açılır. Sol/sağ ok, + / − / 0, çift tıklama, Ctrl+tekerlek ya da iki parmakla yakınlaştırın; aşağı çekin ya da Esc'ye basın, fotoğraf yuvasına döner ve odak oraya gelir.</span>
      <div className="row"><label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label></div>
      <LightboxGallery images={IMAGES} loading={loading} />
    </div>
  );
}
