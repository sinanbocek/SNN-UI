// small-multiples örneği. Bölge cirosu uydurmadır: 24 ay (Ekim 2024 – Eylül 2026); ay adları ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { SmallMultiples } from "../../../registry/components/small-multiples/small-multiples";
import type { MultiPeriod, MultiSeries } from "../../../registry/components/small-multiples/small-multiples";

/** [bölge, başlangıç cirosu, yıllık büyüme, dalga] */
const REGIONS: [string, number, number, number][] = [
  ["Marmara", 4_200_000, 1.22, .05], ["Ege", 2_300_000, 1.14, .08], ["İç Anadolu", 1_900_000, 1.01, .04], ["Akdeniz", 1_650_000, 1.31, .12],
  ["Karadeniz", 980_000, .93, .06], ["Doğu Anadolu", 640_000, 1.0, .09], ["Güneydoğu", 720_000, 1.08, .07], ["Yurt dışı", 1_100_000, 1.45, .1],
];

function build(): { periods: MultiPeriod[]; series: MultiSeries[] } {
  const periods = Array.from({ length: 24 }, (_, at) => { const index = 9 + at; return { key: `${2024 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}` }; });
  const series = REGIONS.map(([label, base, yearly, wave], row) => ({
    key: label, label,
    values: periods.map((_, at) => Math.round(base * yearly ** (at / 12) * (1 + wave * Math.sin(at * .9 + row))) ),
  }));
  return { periods, series };
}

export function SmallMultiplesDemo() {
  const { periods, series } = useMemo(build, []);
  const [loading, setLoading] = useState(false);
  const [few, setFew] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Bir panelin üzerinde gezin ya da odaklanıp ok tuşlarını kullanın: dikey imleç tüm panellerde aynı ayı gösterir (PageUp / PageDown on iki ay). Sıralama ve ölçek değişince paneller yeni yerlerine ve aralıklarına geçer; "Düz gidenleri sönük göster" değişimi %2'nin altındaki serileri soluklaştırır.</span>
      <div className="row">
        <label><input type="checkbox" checked={few} onChange={event => setFew(event.target.checked)} /> Yalnız 4 seri</label>
        <label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
      </div>
      <SmallMultiples title="Bölgeye göre ciro" subtitle={`Aylık ciro · ${date.format("2024-10", "monthYear")} – ${date.format("2026-09", "monthYear")}`} periods={periods} series={few ? series.slice(0, 4) : series} loading={loading} />
    </div>
  );
}
