// sparkline örneği. Rakamlar uydurmadır; değişim etiketi ABACUS ile üretilir.
import { math, money } from "@snn/abacus-core";
import { Sparkline } from "../../../registry/components/sparkline/sparkline";
import { formatNumber } from "../../../registry/components/lib/chart-format";

const orders = [820, 910, 880, 1010, 1100, 1284];
const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const change = money.percent(math.percentChange(orders[orders.length - 1]!, orders[0]!), 1, { sign: "always" });

export function SparklineDemo() {
  return (
    <div className="col">
      <span className="etiket">Çizgi üzerinde gezin, sürükleyin ya da odaklanıp ok tuşlarını kullanın. Başlık gezilen noktayı gösterir.</span>
      <div className="row" style={{ flexWrap: "wrap", gap: "2rem" }}>
        <Sparkline label="Haftalık sipariş" value={formatNumber(orders[orders.length - 1]!, 0)} change={change} data={orders} labels={days} formatValue={value => `${formatNumber(value, 0)} adet`} />
        <Sparkline label="İade oranı" value="%2,4" change="-%0,6" tone="success" data={[3.4, 3.1, 3.2, 2.9, 2.6, 2.4]} labels={days} formatValue={value => money.percent(value, 1)} area={false} />
        <Sparkline label="Gecikme" value="14" change="+3" tone="danger" data={[8, 9, 9, 11, 12, 14]} labels={days} />
      </div>
    </div>
  );
}
