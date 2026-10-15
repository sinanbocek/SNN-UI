// gauge örneği. Rakamlar uydurmadır; ayrıntı metinleri ABACUS ile yazılır.
import { useState } from "react";
import { money } from "@snn/abacus-core";
import { Gauge } from "../../../registry/components/gauge/gauge";
import { Button } from "../../../registry/components/button/button";

const bands = [
  { from: 0, tone: "accent" as const, label: "Normal" },
  { from: 70, tone: "warning" as const, label: "Dolmak üzere" },
  { from: 90, tone: "danger" as const, label: "Kritik" },
];

export function GaugeDemo() {
  const [value, setValue] = useState(72);
  return (
    <div className="col">
      <span className="etiket">Değeri değiştirin: eşiği geçince renk ve durum adı sayımla birlikte değişir.</span>
      <div className="row" style={{ flexWrap: "wrap", gap: "2rem", alignItems: "flex-start" }}>
        <Gauge label="Depo doluluğu" value={value} thresholds={bands} detail={`Hedef ${money.percent(80, 0)}`} />
        <Gauge label="Teklif tamamlama" value={18} max={25} detail="18 / 25 teklif" />
      </div>
      <div className="row">
        <Button size="sm" onClick={() => setValue(v => Math.min(100, v + 9))}>Artır</Button>
        <Button size="sm" variant="secondary" onClick={() => setValue(v => Math.max(0, v - 9))}>Azalt</Button>
      </div>
    </div>
  );
}
