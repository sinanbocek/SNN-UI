// activity-heatmap örneği. Rakamlar uydurmadır; tarihler ve sayılar ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { ActivityHeatmap } from "../../../registry/components/activity-heatmap/activity-heatmap";
import type { ActivityDay } from "../../../registry/components/activity-heatmap/activity-heatmap";
import { Button } from "../../../registry/components/button/button";

const DAY = 86_400_000;

/** Verilen yılın uydurma günlük teklif sayısı: hafta sonları sakin, mevsimsel dalgalı. */
function makeYear(year: number): ActivityDay[] {
  const start = Date.UTC(year, 0, 1), end = Date.UTC(year, 11, 31);
  const out: ActivityDay[] = [];
  for (let time = start, at = 0; time <= end; time += DAY, at++) {
    const weekday = new Date(time).getUTCDay();
    const base = weekday === 0 || weekday === 6 ? 0.4 : 3.2;
    const wave = 1.4 + Math.sin(at / 23) + Math.sin(at * 1.7) * 0.5;
    out.push({ date: new Date(time).toISOString().slice(0, 10), count: Math.max(0, Math.round(base * wave * 1.6)) });
  }
  return out;
}

export function ActivityHeatmapDemo() {
  const [year, setYear] = useState(2025);
  const [selected, setSelected] = useState<string | null>(null);
  const days = useMemo(() => makeYear(year), [year]);
  return (
    <div className="col">
      <span className="etiket">Karelerin üstüne gelin ya da odaklanıp oklarla gezin (↑↓ gün, ←→ hafta); Enter seçer. Gösterge karelerine basarak düzeyleri vurgulayın. Yılı değiştirince ızgara süpürülür.</span>
      <ActivityHeatmap
        label={`${year} teklif etkinliği`}
        period={`${year} yılında`}
        days={days}
        unit={{ one: "teklif", other: "teklif" }}
        weekStartsOn={1}
        selectedDate={selected}
        onSelectDate={setSelected}
        actions={<div className="row"><Button size="sm" variant={year === 2024 ? "primary" : "secondary"} onClick={() => setYear(2024)}>2024</Button><Button size="sm" variant={year === 2025 ? "primary" : "secondary"} onClick={() => setYear(2025)}>2025</Button></div>}
      />
      <span className="etiket">{selected ? `Seçilen gün: ${date.format(selected, "long")} ${date.dayName(selected, "long")}` : "Henüz gün seçilmedi."}</span>
    </div>
  );
}
