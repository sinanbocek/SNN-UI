// ridgeline örneği. Sıcaklıklar uydurmadır (Ankara'nın aylık düzenine benzer); değerler ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { Ridgeline } from "../../../registry/components/ridgeline/ridgeline";
import type { RidgelineSeries } from "../../../registry/components/ridgeline/ridgeline";
import { Button } from "../../../registry/components/button/button";

/** Sabit tohumlu sahte rastgele sayı üretici; her açılışta aynı veriyi verir. */
function random(seed: number) {
  let state = seed;
  return () => { state = (state * 1664525 + 1013904223) % 4294967296; return state / 4294967296; };
}

const MEANS = [4, 6, 11, 16, 21, 26, 30, 30, 25, 18, 10, 5];

function makeSeries(shift: number): RidgelineSeries[] {
  const next = random(7);
  return MEANS.map((mean, index) => ({
    id: `ay${index + 1}`,
    label: date.monthName(index + 1, "short"),
    values: Array.from({ length: 30 }, () => Math.round((mean + shift + (next() + next() + next() - 1.5) * 7) * 10) / 10),
  }));
}

export function RidgelineDemo() {
  const [warm, setWarm] = useState(false);
  const series = useMemo(() => makeSeries(warm ? 3 : 0), [warm]);
  return (
    <div className="col">
      <span className="etiket">Sırtların üstüne gelin ya da odaklanıp ok tuşlarını kullanın (↑↓ sırt, ←→ değer). İklimi değiştirince dağılımlar yeni biçime akar.</span>
      <div className="row"><Button size="sm" variant="secondary" onClick={() => setWarm(value => !value)}>{warm ? "Normal yılı göster" : "3 °C daha sıcak yılı göster"}</Button></div>
      <Ridgeline label="Ankara günlük en yüksek sıcaklık" unit="°C" series={series} />
    </div>
  );
}
