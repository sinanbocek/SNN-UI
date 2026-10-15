// slot-text örneği. Rakamlar ve adlar uydurmadır.
import { useState } from "react";
import { SlotText } from "../../../registry/components/slot-text/slot-text";
import { formatMoney } from "../../../registry/components/lib/chart-format";
import { Button } from "../../../registry/components/button/button";

const cities = ["İstanbul", "Çanakkale", "Şanlıurfa", "Diyarbakır", "Muğla"];

export function SlotTextDemo() {
  const [count, setCount] = useState(12480);
  const [price, setPrice] = useState(1250000);
  const [city, setCity] = useState(0);
  return (
    <div className="col">
      <span className="etiket">Düğmelerle değeri değiştirin: rakamlar gittiği yönde sayar, harfler makara gibi döner, makaralar soldan sağa durur.</span>
      <div style={{ fontSize: "2.25rem", fontWeight: 500, lineHeight: 1.1 }}><SlotText value={count} /></div>
      <div style={{ fontSize: "2.25rem", fontWeight: 500, lineHeight: 1.1 }}><SlotText value={price} format={value => formatMoney(value)} /></div>
      <div style={{ fontSize: "1.75rem", fontWeight: 500, lineHeight: 1.1 }}><SlotText value={cities[city]!} announce /></div>
      <div className="row">
        <Button size="sm" onClick={() => setCount(value => value + 1523.5)}>Sayıyı artır</Button>
        <Button size="sm" variant="secondary" onClick={() => setCount(value => Math.max(0, value - 1523.5))}>Azalt</Button>
        <Button size="sm" variant="secondary" onClick={() => setPrice(value => value + 187500)}>Tutarı artır</Button>
        <Button size="sm" variant="ghost" onClick={() => setCity(value => (value + 1) % cities.length)}>Şehri değiştir</Button>
      </div>
    </div>
  );
}
