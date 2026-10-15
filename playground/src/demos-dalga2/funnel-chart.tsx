// funnel-chart örneği. Sayılar uydurmadır: bir e-ticaret satış hunisi, cihaza göre parçalı.
import { useState } from "react";
import { FunnelChart } from "../../../registry/components/funnel-chart/funnel-chart";
import type { FunnelStep } from "../../../registry/components/funnel-chart/funnel-chart";

const NAMES = ["Ziyaretçi", "Ürün sayfası", "Sepet", "Ödeme", "Sipariş"];
const TOTALS = [48200, 21400, 6300, 3100, 2480];
const MOBILE = [.62, .58, .49, .44, .41];

function build(parts: boolean): FunnelStep[] {
  return NAMES.map((label, at) => {
    const value = TOTALS[at]!;
    const mobile = Math.round(value * MOBILE[at]!);
    return { key: String(at), label, value, parts: parts ? [{ key: "mobil", label: "Mobil", value: mobile }, { key: "masaustu", label: "Masaüstü", value: value - mobile }] : undefined };
  });
}

export function FunnelChartDemo() {
  const [withParts, setWithParts] = useState(true);
  const [state, setState] = useState<"normal" | "loading" | "empty">("normal");
  const steps = state === "empty" ? [] : build(withParts);
  return (
    <div className="col">
      <span className="etiket">Bir adımın üstüne gelin ya da odaklanıp ok tuşlarıyla gezin. Görünüm seçicisi bandı toplam, bölünmüş ya da tek parça gösterir.</span>
      <div className="row">
        <label><input type="checkbox" checked={withParts} onChange={event => setWithParts(event.target.checked)} /> Cihaza göre parçalı</label>
        <label><input type="radio" name="huni-durum" checked={state === "normal"} onChange={() => setState("normal")} /> Veri</label>
        <label><input type="radio" name="huni-durum" checked={state === "loading"} onChange={() => setState("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="huni-durum" checked={state === "empty"} onChange={() => setState("empty")} /> Boş</label>
      </div>
      <FunnelChart label="Satış hunisi" description="Ziyaretten siparişe, son 30 gün" steps={steps} loading={state === "loading"} />
    </div>
  );
}
