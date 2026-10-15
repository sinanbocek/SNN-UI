// slope-chart örneği. Rakamlar uydurmadır; değerler ABACUS ile yazılır.
import { useState } from "react";
import { money } from "@snn/abacus-core";
import { SlopeChart } from "../../../registry/components/slope-chart/slope-chart";
import type { SlopeItem } from "../../../registry/components/slope-chart/slope-chart";
import { Button } from "../../../registry/components/button/button";

const first: SlopeItem[] = [
  { key: "arama", label: "Arama", start: 3.2, end: 4.8 },
  { key: "eposta", label: "E-posta", start: 5.1, end: 4.6 },
  { key: "sosyal", label: "Sosyal medya", start: 1.4, end: 2.9 },
  { key: "dogrudan", label: "Doğrudan", start: 4.2, end: 4.4 },
  { key: "yonlendirme", label: "Yönlendirme", start: 2.6, end: 2.1 },
];

const second: SlopeItem[] = first.map(item => ({ ...item, start: item.end, end: Math.round((item.end * 1.15 + 0.3) * 10) / 10 }));

export function SlopeChartDemo() {
  const [later, setLater] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Çizgilerin üstüne gelin ya da odaklanıp yukarı/aşağı oklarını kullanın. Sağdaki ok sıra değişimini gösterir.</span>
      <div className="row"><Button size="sm" variant="secondary" onClick={() => setLater(value => !value)}>{later ? "1. → 2. çeyreği göster" : "2. → 3. çeyreği göster"}</Button></div>
      <SlopeChart
        label="Kanala göre dönüşüm oranı"
        startLabel={later ? "2. çeyrek" : "1. çeyrek"}
        endLabel={later ? "3. çeyrek" : "2. çeyrek"}
        data={later ? second : first}
        highlightKey="sosyal"
        formatValue={value => money.percent(value, 1)}
      />
    </div>
  );
}
