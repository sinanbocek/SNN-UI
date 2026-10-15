// sankey-flow örneği. Tutarlar uydurmadır: gelir türünden hesaba, hesaptan gider grubuna nakit akışı.
import { useState } from "react";
import { SankeyFlow } from "../../../registry/components/sankey-flow/sankey-flow";
import SegmentedControl from "../../../registry/components/segmented-control/segmented-control";

const NODES = [
  { id: "satis", label: "Satış" }, { id: "hizmet", label: "Hizmet" }, { id: "faiz", label: "Faiz geliri" },
  { id: "kasa", label: "Ana kasa" }, { id: "doviz", label: "Dövizli hesap" },
  { id: "personel", label: "Personel" }, { id: "kira", label: "Kira" }, { id: "vergi", label: "Vergi" }, { id: "tedarik", label: "Tedarik" }, { id: "birikim", label: "Birikim" },
];

const MONTHS: Record<string, { label: string; links: [string, string, number][] }> = {
  eylul: { label: "Eylül", links: [["satis", "kasa", 2400000], ["hizmet", "kasa", 820000], ["hizmet", "doviz", 310000], ["faiz", "doviz", 95000], ["kasa", "personel", 1250000], ["kasa", "kira", 420000], ["kasa", "vergi", 610000], ["kasa", "tedarik", 880000], ["kasa", "birikim", 60000], ["doviz", "tedarik", 260000], ["doviz", "birikim", 145000]] },
  ekim: { label: "Ekim", links: [["satis", "kasa", 2750000], ["hizmet", "kasa", 640000], ["hizmet", "doviz", 520000], ["faiz", "doviz", 120000], ["kasa", "personel", 1310000], ["kasa", "kira", 420000], ["kasa", "vergi", 705000], ["kasa", "tedarik", 910000], ["kasa", "birikim", 45000], ["doviz", "tedarik", 380000], ["doviz", "birikim", 260000]] },
};

export function SankeyFlowDemo() {
  const [month, setMonth] = useState("ekim");
  const [state, setState] = useState<"normal" | "loading" | "empty">("normal");
  const links = state === "empty" ? [] : MONTHS[month]!.links.map(([source, target, value]) => ({ source, target, value }));
  return (
    <div className="col">
      <span className="etiket">Düğümün ya da şeridin üstüne gelin: baştan sona tüm yol vurgulanır. Odaklanıp ok tuşlarıyla düğümler arasında gezin. "Akış" anahtarı noktaları durdurur. Pencereyi daraltınca (420 px altı) şema dikeye döner.</span>
      <div className="row">
        <label><input type="radio" name="sankey-durum" checked={state === "normal"} onChange={() => setState("normal")} /> Veri</label>
        <label><input type="radio" name="sankey-durum" checked={state === "loading"} onChange={() => setState("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="sankey-durum" checked={state === "empty"} onChange={() => setState("empty")} /> Boş</label>
      </div>
      <SankeyFlow label="Nakit akışı" description="Gelir türünden hesaba, hesaptan gider grubuna" kind="money" nodes={NODES} links={links} loading={state === "loading"} columnLabels={["Kaynak", "Hesap", "Gider"]}
        actions={<SegmentedControl label="Dönem" value={month} onValueChange={setMonth} options={Object.entries(MONTHS).map(([value, item]) => ({ value, label: item.label }))} />} />
    </div>
  );
}
