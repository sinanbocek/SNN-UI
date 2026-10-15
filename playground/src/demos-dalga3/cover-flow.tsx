// cover-flow örneği. Yerler, ölçüler ve başlıklar uydurmadır; fotoğraflar playground/public/ornek-foto içindeki Unsplash görselleridir (KAYNAK.md).
import { useState } from "react";
import { money } from "@snn/abacus-core";
import { AnimatedCounter } from "../../../registry/components/animated-counter/animated-counter";
import { CoverFlow } from "../../../registry/components/cover-flow/cover-flow";
import type { CoverItem } from "../../../registry/components/cover-flow/cover-flow";

const PLACES: [string, string, string, number, number, string, string?][] = [
  ["Kıyı yolu", "Sabah yürüyüşü", "Eylül", 12.4, 180, "sahne-deniz"], ["Orman patikası", "Gölgeli rota", "Eylül", 8.2, 90, "sahne-orman"], ["Dağ eteği", "Zorlu çıkış", "Ekim", 15.6, 640, "sahne-dag"],
  ["Eski sokak", "Akşam turu", "Ekim", 5.5, 25, "sahne-sokak", "15% center"], ["Köy sofrası", "Uzun mola", "Kasım", 1.8, 10, "sahne-yemek"],
];
const ITEMS: CoverItem[] = PLACES.map(([title, subtitle, kicker, , , photo, position], at) => ({ id: `y${at + 1}`, title, subtitle, kicker, alt: `${title} rotasından bir kare`, src: `/ornek-foto/${photo}.jpg`, position, tone: at }));

export function CoverFlowDemo() {
  const [last, setLast] = useState("");
  return (
    <div className="col">
      <span className="etiket">Rayı sürükleyin ya da fırlatın: bırakma hızının götürdüğü karta oturur, uçlarda esner. Yandaki karta ya da çentiğe basın, odaktayken sol/sağ ok ve Home/End kullanın; trackpad'de yatay kaydırma rayı oynatır. Altta seçili kartın açıklaması yönden yükselerek değişir; uzunluk ve yükseklik ölçüleri uygulamanın içeriğidir. "Hareketi azalt"ta kartlar atlar. Son seçim: <b>{last || "—"}</b></span>
      <CoverFlow defaultIndex={1} label="Bu sonbaharın yürüyüşleri" items={ITEMS} onChange={item => setLast(item.title)}
        renderDetail={(item, index) => <div style={{ display: "flex", gap: "var(--space-8)", marginTop: "var(--space-4)" }}>
          <AnimatedCounter label="Mesafe" value={PLACES[index]![3]} decimals={1} suffix={" km"} />
          <AnimatedCounter label="Yükselti" value={PLACES[index]![4]} suffix={" m"} />
          <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>{`${item.title}: ${money.fmtDecimalGrouped(PLACES[index]![3], 1)} kilometre, ${money.fmtDecimalGrouped(PLACES[index]![4], 0)} metre`}</span>
        </div>} />
    </div>
  );
}
