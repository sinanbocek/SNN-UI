// split-bar örneği. Tutarlar uydurmadır; dönem değişince dilimler yeni genişliklerine kayar.
import { useState } from "react";
import { SplitBar } from "../../../registry/components/split-bar/split-bar";
import SegmentedControl from "../../../registry/components/segmented-control/segmented-control";

const PERIODS: Record<string, { label: string; values: [string, string, number][] }> = {
  "7": { label: "7 gün", values: [["personel", "Personel", 412000], ["kira", "Kira", 185000], ["vergi", "Vergi", 96000], ["enerji", "Enerji", 41500], ["nakliye", "Nakliye", 22800], ["diger", "Diğer", 9400]] },
  "30": { label: "30 gün", values: [["personel", "Personel", 1648000], ["kira", "Kira", 740000], ["vergi", "Vergi", 512000], ["enerji", "Enerji", 164000], ["nakliye", "Nakliye", 118500], ["diger", "Diğer", 61000]] },
  "90": { label: "90 gün", values: [["personel", "Personel", 4710000], ["kira", "Kira", 2220000], ["vergi", "Vergi", 1090000], ["enerji", "Enerji", 530000], ["nakliye", "Nakliye", 0], ["diger", "Diğer", 265000]] },
};

export function SplitBarDemo() {
  const [period, setPeriod] = useState("30");
  const [state, setState] = useState<"normal" | "loading" | "empty">("normal");
  const data = state === "empty" ? [] : PERIODS[period]!.values.map(([key, label, value]) => ({ key, label, value }));
  return (
    <div className="col">
      <span className="etiket">Dilimin üstüne gelin ya da çubuğa odaklanıp ok tuşlarını kullanın. Açıklamadan dilim kapatılır; son açık dilim kapanmaz. 90 günde "Nakliye" sıfır olduğu için yer almaz.</span>
      <div className="row">
        <label><input type="radio" name="split-durum" checked={state === "normal"} onChange={() => setState("normal")} /> Veri</label>
        <label><input type="radio" name="split-durum" checked={state === "loading"} onChange={() => setState("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="split-durum" checked={state === "empty"} onChange={() => setState("empty")} /> Boş</label>
      </div>
      <SplitBar label="Gider dağılımı" description="Kalemlere göre toplam gider" data={data} loading={state === "loading"}
        actions={<SegmentedControl label="Dönem" value={period} onValueChange={setPeriod} options={Object.entries(PERIODS).map(([value, item]) => ({ value, label: item.label }))} />} />
    </div>
  );
}
