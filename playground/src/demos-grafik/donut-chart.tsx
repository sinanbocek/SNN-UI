// donut-chart örneği. Rakamlar uydurmadır.
import { useState } from "react";
import { DonutChart } from "../../../registry/components/donut-chart/donut-chart";
import type { DonutChartDatum } from "../../../registry/components/donut-chart/donut-chart";
import { formatMoney } from "../../../registry/components/lib/chart-format";
import { Button } from "../../../registry/components/button/button";

const visits: DonutChartDatum[] = [
  { key: "arama", label: "Arama", value: 4210 },
  { key: "dogrudan", label: "Doğrudan", value: 2380 },
  { key: "yonlendirme", label: "Yönlendirme", value: 1190 },
  { key: "sosyal", label: "Sosyal medya", value: 860 },
  { key: "eposta", label: "E-posta", value: 240 },
  { key: "diger1", label: "Haber bülteni", value: 130 },
];

const revenue: DonutChartDatum[] = [
  { key: "yapi", label: "Yapı", value: 1450000 },
  { key: "enerji", label: "Enerji", value: 820000 },
  { key: "yol", label: "Yol", value: 610000 },
];

export function DonutChartDemo() {
  const [money, setMoney] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Dilimin ya da gösterge satırının üstüne gelin; satıra basınca dilim gizlenir, halka yeniden dağılır. Veri kümesini değiştirin.</span>
      <div className="row"><Button size="sm" variant="secondary" onClick={() => setMoney(value => !value)}>{money ? "Ziyaretleri göster" : "Ciro dağılımını göster"}</Button></div>
      {money
        ? <DonutChart key="ciro" label="Sektöre göre ciro" data={revenue} formatValue={formatMoney} totalLabel="Toplam ciro" />
        : <DonutChart key="ziyaret" label="Kaynağa göre ziyaret" data={visits} unit="ziyaret" />}
    </div>
  );
}
