// photo-grid örneği. Başlıklar uydurmadır; fotoğraflar playground/public/ornek-foto içindeki Unsplash görselleridir (KAYNAK.md).
import { useState } from "react";
import { PhotoGrid } from "../../../registry/components/photo-grid/photo-grid";
import type { ViewerImage } from "../../../registry/components/photo-grid/photo-grid";

const FOTOS: [string, string, number, number, string?][] = [
  ["sahne-deniz", "Deniz kıyısında köpüren dalgalar", 1200, 800], ["portre-4", "Kırmızı hırkalı gülümseyen kadın", 900, 1100], ["urun-sehpa-1", "Kanepenin yanında ahşap sehpa", 1200, 800],
  ["sahne-dag", "Sisli dağ zirvesi", 1200, 800], ["urun-kupa", "Ahşap masada beyaz seramik kupa", 900, 1100], ["sahne-orman", "Ormanın havadan görüntüsü", 1200, 800],
  ["portre-3", "Takım elbiseli adam", 900, 1100], ["sahne-sokak", "Şehir sokağı", 1200, 800, "18% 50%"], ["urun-ortu", "Keten örtü", 900, 1100],
  ["sahne-yemek", "Kurulu yemek masası", 1200, 800], ["doku-kapak", "Soyut renkli doku", 900, 1100], ["urun-ceket", "Askıda mavi rüzgârlık", 1200, 800],
  ["sahne-ic-mekan", "Aydınlık oturma odası", 1200, 800], ["portre-5", "Gri ceketli kadın", 900, 1100], ["urun-sehpa-2", "Üzerinde kitap duran sehpa", 1200, 800],
  ["portre-1", "Beyaz sakallı yaşlı adam", 900, 1100], ["urun-kupa-2", "Rafta kahverengi kupalar", 1200, 800], ["portre-2", "Gülümseyen yaşlı kadın", 1200, 800, "48% 40%"],
  ["sahne-deniz", "Kumsalda sakin sabah", 900, 1100, "70% 50%"], ["sahne-dag", "Dağ yamacında bulutlar", 900, 1100, "30% 50%"],
];
const IMAGES: ViewerImage[] = FOTOS.map(([foto, alt, width, height, position], at) => ({ id: `a${at + 1}`, alt, src: `/ornek-foto/${foto}.jpg`, position, width, height, title: `Fotoğraf ${at + 1}`, caption: `${at + 1}.10.2026` }));

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
