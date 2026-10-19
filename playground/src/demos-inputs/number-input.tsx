// number-input örneği. Boş değer taşır; odakta ham metin, odak dışında biçimli gösterim.
import { useState } from "react";
import { NumberInput } from "../../../registry/components/number-input/number-input";

export function NumberInputDemo() {
  const [quantity, setQuantity] = useState<number | null>(1234.5);
  const [rate, setRate] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(12);
  return (
    <div className="col">
      <span className="etiket">Kutuya girince ham metin ("1234,5"), çıkınca biçimli ("1.234,5"). Silip çıkınca değer boş (null) olur. Nokta tuşu tek başına ondalık sayılır. Oklar adım atar, Shift ile on adım; Escape yazılanı geri alır.</span>
      <div className="row" style={{ flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
        <div style={{ width: 200 }}><NumberInput label="Miktar" value={quantity} onValueChange={setQuantity} min={0} formatOptions={{ maximumFractionDigits: 2 }} description="İki ondalığa kadar." /></div>
        <div style={{ width: 160 }}><NumberInput label="İskonto (%)" value={rate} onValueChange={setRate} min={0} max={100} step={0.5} placeholder="Yok" steppers={false} /></div>
        <div style={{ width: 140 }}><NumberInput label="Adet" size="sm" value={count} onValueChange={setCount} min={0} max={99} /></div>
        <div style={{ width: 140 }}><NumberInput label="Gizli etiketli" hideLabel size="sm" steppers={false} defaultValue={-42} min={-100} /></div>
        <div style={{ width: 160 }}><NumberInput label="Hatalı" defaultValue={null} error="Miktar gerekli." /></div>
      </div>
      <span className="etiket" role="status">Değerler: {String(quantity)} · {String(rate)} · {String(count)}</span>
    </div>
  );
}
