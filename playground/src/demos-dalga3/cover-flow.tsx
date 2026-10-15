// cover-flow örneği. Yerler, ölçüler ve başlıklar uydurmadır; görseller kendi yer tutucularımızdır, gerçek fotoğraf yok.
import { useState } from "react";
import { money } from "@snn/abacus-core";
import { AnimatedCounter } from "../../../registry/components/animated-counter/animated-counter";
import { CoverFlow } from "../../../registry/components/cover-flow/cover-flow";
import type { CoverItem } from "../../../registry/components/cover-flow/cover-flow";

const PLACES: [string, string, string, number, number][] = [
  ["Kıyı yolu", "Sabah yürüyüşü", "Eylül", 12.4, 180], ["Zeytinlik", "Gölgeli patika", "Eylül", 8.2, 90], ["Taş köprü", "Kısa mola", "Ekim", 3.1, 40],
  ["Dağ eteği", "Zorlu çıkış", "Ekim", 15.6, 640], ["Eski liman", "Akşam turu", "Ekim", 5.5, 25], ["Sazlık", "Kuş izleme", "Kasım", 6.8, 15], ["Yayla", "Uzun gün", "Kasım", 18.3, 820],
];
const ITEMS: CoverItem[] = PLACES.map(([title, subtitle, kicker], at) => ({ id: `y${at + 1}`, title, subtitle, kicker, alt: `${title} için yer tutucu görsel`, tone: at }));

export function CoverFlowDemo() {
  const [last, setLast] = useState("");
  return (
    <div className="col">
      <span className="etiket">Rayı sürükleyin ya da fırlatın: bırakma hızının götürdüğü karta oturur, uçlarda esner. Yandaki karta ya da çentiğe basın, odaktayken sol/sağ ok ve Home/End kullanın; trackpad'de yatay kaydırma rayı oynatır. Altta seçili kartın açıklaması yönden yükselerek değişir; uzunluk ve yükseklik ölçüleri uygulamanın içeriğidir. "Hareketi azalt"ta kartlar atlar. Son seçim: <b>{last || "—"}</b></span>
      <CoverFlow label="Bu sonbaharın yürüyüşleri" items={ITEMS} onChange={item => setLast(item.title)}
        renderDetail={(item, index) => <p style={{ display: "flex", gap: 16, margin: "8px 0 0", fontVariantNumeric: "tabular-nums" }}>
          <span><AnimatedCounter value={PLACES[index]![3]} decimals={1} suffix=" km" /></span>
          <span><AnimatedCounter value={PLACES[index]![4]} suffix=" m" /></span>
          <span className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>{`${item.title}: ${money.fmtDecimalGrouped(PLACES[index]![3], 1)} kilometre, ${money.fmtDecimalGrouped(PLACES[index]![4], 0)} metre`}</span>
        </p>} />
    </div>
  );
}
