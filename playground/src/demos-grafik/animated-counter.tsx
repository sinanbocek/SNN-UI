// animated-counter örneği. Rakamlar uydurmadır.
import { useState } from "react";
import { AnimatedCounter } from "../../../registry/components/animated-counter/animated-counter";
import { Button } from "../../../registry/components/button/button";

export function AnimatedCounterDemo() {
  const [value, setValue] = useState(1234.5);
  return (
    <div className="col">
      <span className="etiket">Binlik ayracı nokta, ondalık ayracı virgül. Düğmelerle değeri değiştirin; rakamlar değişen yöne döner.</span>
      <AnimatedCounter value={value} decimals={1} label="Aylık ciro (bin ₺)" animateOnView />
      <div className="row">
        <Button size="sm" onClick={() => setValue(v => v + 8765.4)}>Artır</Button>
        <Button size="sm" variant="secondary" onClick={() => setValue(v => Math.max(0, v - 8765.4))}>Azalt</Button>
        <Button size="sm" variant="ghost" onClick={() => setValue(1234.5)}>Sıfırla</Button>
      </div>
      <AnimatedCounter value={98.4} decimals={1} prefix="%" label="Teslim oranı" />
    </div>
  );
}
