// waffle-chart örneği. Rakamlar uydurmadır.
import { useState } from "react";
import { WaffleChart } from "../../../registry/components/waffle-chart/waffle-chart";
import type { WaffleCategory } from "../../../registry/components/waffle-chart/waffle-chart";
import { Button } from "../../../registry/components/button/button";

const yil1: WaffleCategory[] = [
  { key: "gunes", label: "Güneş", value: 18.4 },
  { key: "ruzgar", label: "Rüzgâr", value: 31.2 },
  { key: "hidro", label: "Hidroelektrik", value: 52.7 },
  { key: "dogalgaz", label: "Doğal gaz", value: 78.9 },
  { key: "komur", label: "Kömür", value: 64.3 },
];

const yil2: WaffleCategory[] = [
  { key: "gunes", label: "Güneş", value: 29.6 },
  { key: "ruzgar", label: "Rüzgâr", value: 38.5 },
  { key: "hidro", label: "Hidroelektrik", value: 47.1 },
  { key: "dogalgaz", label: "Doğal gaz", value: 70.2 },
  { key: "komur", label: "Kömür", value: 58.0 },
];

export function WaffleChartDemo() {
  const [later, setLater] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Hücrelerin ya da gösterge satırlarının üstüne gelin; ok tuşlarıyla hücre hücre gezin. Yılı değiştirince hücreler kategoriler arasında uçar.</span>
      <div className="row"><Button size="sm" variant="secondary" onClick={() => setLater(value => !value)}>{later ? "2024'ü göster" : "2025'i göster"}</Button></div>
      <WaffleChart label={`Elektrik üretimi, ${later ? 2025 : 2024}`} data={later ? yil2 : yil1} unit="TWh" decimals={1} accentKey="gunes" />
    </div>
  );
}
