// streamgraph örneği. Rakamlar uydurmadır; hafta etiketleri ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { Streamgraph } from "../../../registry/components/streamgraph/streamgraph";
import type { StreamgraphDatum } from "../../../registry/components/streamgraph/streamgraph";
import { Button } from "../../../registry/components/button/button";

const DAY = 86_400_000;
const series = [
  { key: "billing", label: "Fatura" },
  { key: "signin", label: "Giriş" },
  { key: "delivery", label: "Teslimat" },
  { key: "returns", label: "İade" },
  { key: "other", label: "Diğer" },
];

/** Verilen sayıda haftalık uydurma destek talebi; son hafta 2026-10-12. */
function makeData(weeks: number): StreamgraphDatum[] {
  const end = Date.UTC(2026, 9, 12);
  return Array.from({ length: weeks }, (_, at) => {
    const iso = new Date(end - (weeks - 1 - at) * 7 * DAY).toISOString().slice(0, 10);
    const wave = (phase: number, base: number, amp: number) => Math.round(base + Math.sin(at / 2.4 + phase) * amp + at * 0.6);
    return {
      key: iso,
      label: `${date.format(iso, "long")} haftası`,
      axisLabel: at % 3 === 0 ? date.format(iso, "dayMonth") : undefined,
      values: { billing: wave(0, 42, 12), signin: wave(1.2, 30, 9), delivery: wave(2.4, 24, 10), returns: wave(3.6, 14, 5), other: wave(4.8, 10, 3) },
    };
  });
}

export function StreamgraphDemo() {
  const [weeks, setWeeks] = useState(18);
  const data = useMemo(() => makeData(weeks), [weeks]);
  return (
    <div className="col">
      <span className="etiket">Katmanların üstüne gelin ya da odaklanıp ok tuşlarını kullanın (←→ zaman, ↑↓ katman). Göstergeden katman kapatın; aralığı değiştirin.</span>
      <div className="row"><Button size="sm" variant="secondary" onClick={() => setWeeks(value => value === 18 ? 9 : 18)}>{weeks === 18 ? "Son 9 haftayı göster" : "Son 18 haftayı göster"}</Button></div>
      <Streamgraph label="Konuya göre destek talebi" data={data} series={series} unit="talep" />
    </div>
  );
}
