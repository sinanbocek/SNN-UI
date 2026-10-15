// lightbox-gallery örneği. Başlıklar uydurmadır; görseller farklı oranlı (dikey, yatay, kare) kendi yer tutucularımızdır, gerçek fotoğraf yok.
import { useState } from "react";
import { LightboxGallery } from "../../../registry/components/lightbox-gallery/lightbox-gallery";
import type { ViewerImage } from "../../../registry/components/lightbox-gallery/lightbox-gallery";

const SIZES: [number, number][] = [[800, 1000], [1200, 800], [900, 900], [800, 1200], [1200, 700], [900, 1100], [1000, 1000], [1200, 900], [800, 1000], [1100, 700], [900, 1200], [1000, 800]];
const TITLES = ["Kıyıda sabah", "Çarşı", "Taş köprü", "Zeytinlik", "Liman", "Pencere", "Sofra", "Dağ yolu", "Kapı", "Meydan", "Kule", "Sahil"];
const IMAGES: ViewerImage[] = SIZES.map(([width, height], at) => ({ id: `f${at + 1}`, alt: `${TITLES[at]}, ${width > height ? "yatay" : width < height ? "dikey" : "kare"} yer tutucu`, tone: at, width, height, title: TITLES[at], caption: `${at + 1}. gün` }));

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
