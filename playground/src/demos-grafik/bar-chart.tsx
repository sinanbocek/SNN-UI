// bar-chart örneği. Rakamlar uydurmadır; gün adları ve dönem metni ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { BarChart } from "../../../registry/components/bar-chart/bar-chart";
import type { BarChartDatum } from "../../../registry/components/bar-chart/bar-chart";

/** Uydurma günlük sipariş sayısı; son gün 2026-10-18. */
function makeData(days: number): BarChartDatum[] {
  const end = Date.UTC(2026, 9, 18);
  return Array.from({ length: days }, (_, at) => {
    const iso = new Date(end - (days - 1 - at) * 86400000).toISOString().slice(0, 10);
    const weekend = date.isWeekend(iso);
    const value = Math.round((weekend ? 420 : 860) + Math.sin(at * 1.7) * 150 + at * 6);
    return { key: iso, label: date.format(iso, "dayMonthWeekday"), axisLabel: days > 10 ? (at % 3 === 0 ? date.format(iso, "dayMonth") : undefined) : date.dayName(iso), value };
  });
}

export function BarChartDemo() {
  const [days, setDays] = useState(7);
  const data = useMemo(() => makeData(days), [days]);
  const period = `${date.format(data[0]!.key, "dayMonth")} – ${date.format(data[data.length - 1]!.key, "long")}`;
  return (
    <div className="col">
      <span className="etiket">Çubukların üstünde gezin ya da odaklanıp ok tuşlarını kullanın. Aralığı değiştirince çubuklar yeni değerlere akar.</span>
      <div className="row">
        <label><input type="radio" name="bar-aralik" checked={days === 7} onChange={() => setDays(7)} /> 7 gün</label>
        <label><input type="radio" name="bar-aralik" checked={days === 14} onChange={() => setDays(14)} /> 14 gün</label>
        <label><input type="radio" name="bar-aralik" checked={days === 30} onChange={() => setDays(30)} /> 30 gün</label>
      </div>
      <BarChart label="Günlük sipariş" period={period} data={data} unit="adet" />
    </div>
  );
}
