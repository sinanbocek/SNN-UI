// number-field örneği. Yüzde ön ek, gün son ek olarak gösterilir; ondalık sınırı formatOptions ile.
import { useState } from "react";
import { NumberField } from "../../../registry/components/number-field/number-field";

export function NumberFieldDemo() {
  const [days, setDays] = useState(30);
  const [rate, setRate] = useState(18.5);
  const [count, setCount] = useState(1250);
  return (
    <div className="col">
      <span className="etiket">Eksi/artı düğmelerini basılı tutun: hızlanarak tekrarlar, sınıra dayanınca değer gerilip geri yaylanır. Kutuya yazınca Türkçe gruplanır ("1.234,5"); nokta tuşu ondalık sayılır.</span>
      <div className="row" style={{ flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
        <NumberField label="Vade" value={days} onValueChange={setDays} min={0} max={365} suffix=" gün" description="Fatura tarihinden itibaren." />
        <NumberField label="KDV oranı" value={rate} onValueChange={setRate} min={0} max={100} step={0.5} prefix="%" formatOptions={{ maximumFractionDigits: 2 }} />
        <NumberField label="Adet" value={count} onValueChange={setCount} min={-5000} max={1_000_000} step={50} scrub size="lg" />
      </div>
    </div>
  );
}
