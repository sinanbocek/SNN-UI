// photo-grid örneği. Başlıklar uydurmadır; görseller kendi yer tutucularımızdır, gerçek fotoğraf yok.
import { useState } from "react";
import { PhotoGrid } from "../../../registry/components/photo-grid/photo-grid";
import type { ViewerImage } from "../../../registry/components/photo-grid/photo-grid";

const IMAGES: ViewerImage[] = Array.from({ length: 30 }, (_, at) => {
  const wide = at % 3 === 0;
  return { id: `a${at + 1}`, alt: `Albüm fotoğrafı ${at + 1} (yer tutucu)`, tone: at, width: wide ? 1200 : 900, height: wide ? 800 : 1100, title: `Fotoğraf ${at + 1}`, caption: `${(at % 28) + 1}.10.2026` };
});

export function PhotoGridDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="col">
      <span className="etiket">+ / − düğmeleri, odaktayken + ve − tuşları ya da Ctrl+tekerlek sütun sayısını değiştirir (beş, üç, iki); dokunmatikte iki parmakla sıkıştırın. Hücrede oklar odağı gezdirir (PageUp/PageDown üç satır, Home/End ilk-son). Bir hücreye basın: görüntüleyici o hücreden büyür, altta küçük resim şeridi vardır; sağ üstteki kalp favoriler.</span>
      <div className="row"><label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label></div>
      <PhotoGrid title="Sonbahar albümü" images={IMAGES} defaultFavorites={["a3", "a8"]} loading={loading} />
    </div>
  );
}
