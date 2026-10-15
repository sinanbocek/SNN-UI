// revenue-explorer örneği. 30 aylık yinelenen gelir uydurmadır (Nisan 2024 – Eylül 2026); ay adları ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { RevenueExplorer } from "../../../registry/components/revenue-explorer/revenue-explorer";
import type { RevenueMonth } from "../../../registry/components/revenue-explorer/revenue-explorer";

function build(): RevenueMonth[] {
  let total = 310000;
  return Array.from({ length: 30 }, (_, at) => {
    const index = 3 + at;
    const year = 2024 + Math.floor(index / 12), month = (index % 12) + 1;
    const newMrr = Math.round(42000 + at * 1400 + Math.sin(at * 1.3) * 6000);
    const expansion = Math.round(15000 + at * 700 + Math.cos(at * .9) * 3500);
    const churn = Math.round(total * (.012 + .006 * Math.sin(at * .8 + 1)) + 4000);
    total += newMrr + expansion - churn;
    return { key: `${year}-${String(month).padStart(2, "0")}`, newMrr, expansion, churn, total };
  });
}

export function RevenueExplorerDemo() {
  const months = useMemo(build, []);
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  return (
    <div className="col">
      <span className="etiket">Dönem düğmeleri fırça penceresini o uzunluğa getirir. Pencereyi sürükleyin, kenar tutamaçlarını çekin ya da odaklanıp ok tuşlarını (Shift: üç ay) kullanın; boş ize basmak pencereyi oraya ortalar. Seri düğmeleri grafikten seri çıkarır; "Önceki dönemle karşılaştır" bir önceki aynı uzunlukta dönemin net yeni gelir çizgisini ekler.</span>
      <div className="row">
        <label><input type="radio" name="gelir-durum" checked={status === "ready"} onChange={() => setStatus("ready")} /> Veri</label>
        <label><input type="radio" name="gelir-durum" checked={status === "loading"} onChange={() => setStatus("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="gelir-durum" checked={status === "error"} onChange={() => setStatus("error")} /> Hata</label>
      </div>
      <RevenueExplorer months={months} status={status} onRetry={() => setStatus("ready")} />
    </div>
  );
}
