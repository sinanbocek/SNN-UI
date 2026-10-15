// line-chart örneği. Rakamlar uydurmadır; günler ve değerler ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { LineChart } from "../../../registry/components/line-chart/line-chart";
import type { LineChartDatum } from "../../../registry/components/line-chart/line-chart";
import { formatMoneyCompact } from "../../../registry/components/lib/chart-format";

/** 14 günlük uydurma sipariş verisi, 2026-10-02'den başlar. */
function makeData(days: number): LineChartDatum[] {
  const start = new Date(Date.UTC(2026, 9, 2));
  return Array.from({ length: days }, (_, at) => {
    const day = new Date(start.getTime() + at * 86400000);
    const iso = day.toISOString().slice(0, 10);
    const wave = Math.sin(at / 2.2);
    return {
      key: iso,
      label: date.format(iso, "dayMonthWeekday"),
      axisLabel: at % 2 === 0 ? date.format(iso, "dayMonth") : undefined,
      values: { bu: Math.round(1150 + at * 38 + wave * 140), gecen: Math.round(1020 + at * 22 + Math.cos(at / 2) * 110) },
    };
  });
}

export function LineChartDemo() {
  const [days, setDays] = useState(14);
  const [para, setPara] = useState(false);
  const data = useMemo(() => makeData(days), [days]);
  return (
    <div className="col">
      <span className="etiket">Grafiğin üstünde gezin ya da odaklanıp ok tuşlarını kullanın. Göstergeden seriyi kapatın. Aralığı ve birimi değiştirin.</span>
      <div className="row">
        <label><input type="radio" name="line-aralik" checked={days === 14} onChange={() => setDays(14)} /> 14 gün</label>
        <label><input type="radio" name="line-aralik" checked={days === 7} onChange={() => setDays(7)} /> 7 gün</label>
        <label><input type="checkbox" checked={para} onChange={event => setPara(event.target.checked)} /> Tutar olarak göster (₺)</label>
      </div>
      <LineChart
        label="Haftalık sipariş"
        data={data}
        series={[{ key: "bu", label: "Bu dönem" }, { key: "gecen", label: "Önceki dönem", dashed: true }]}
        unit={para ? "" : "adet"}
        formatValue={para ? value => formatMoneyCompact(value * 1000) : undefined}
        formatTick={para ? value => formatMoneyCompact(value * 1000) : undefined}
      />
    </div>
  );
}
