// metric-card örneği. Rakamlar uydurmadır; değişim etiketleri ABACUS ile üretilir.
import { useState } from "react";
import { math, money } from "@snn/abacus-core";
import { MetricCard } from "../../../registry/components/metric-card/metric-card";
import { Button } from "../../../registry/components/button/button";

/** Değişim etiketi: "+%12,3". Önceki sıfırsa etiket yoktur. */
function changeText(current: number, previous: number): string | undefined {
  const change = math.percentChange(current, previous);
  return change === null ? undefined : money.percent(change, 1, { sign: "always" });
}

export function MetricCardDemo() {
  const [revenue, setRevenue] = useState(1250000);
  const previous = 1113000;
  return (
    <div className="col">
      <span className="etiket">Tutar yazımı ABACUS'tandır: tam (₺1.250.000) ve kısaltılmış (₺1,25Mn). Düğme değeri değiştirir; metinler yöne göre kayar.</span>
      <div className="row" style={{ alignItems: "stretch", flexWrap: "wrap" }}>
        <MetricCard label="Aylık ciro" value={revenue} format="compact-money" change={changeText(revenue, previous)} context="Geçen aya göre" />
        <MetricCard label="Tahsilat" value={revenue * 0.82} format="money" change={changeText(revenue * 0.82, previous)} context="Vadesi gelen alacaklar" />
        <MetricCard label="Açık teklif" value={1234.5} decimals={1} suffix=" adet" change="-%4,2" context="Bu hafta" />
      </div>
      <div className="row">
        <Button size="sm" onClick={() => setRevenue(r => r + 187500)}>Ciroyu artır</Button>
        <Button size="sm" variant="secondary" onClick={() => setRevenue(r => Math.max(0, r - 187500))}>Azalt</Button>
      </div>
    </div>
  );
}
