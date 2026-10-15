// payment-flow örneği. Tutar, komisyon ve bakiye uydurmadır; gerçek bir ödeme yoktur, giriş alanı yoktur.
import { useState } from "react";
import { PaymentFlow } from "../../../registry/components/payment-flow/payment-flow";

export function PaymentFlowDemo() {
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Ödeme bir döngü boyunca dolaşır: dokunma, yetkilendirme, onay, takas, komisyon, ödeme. Bakiye döngüden döngüye artar. Fareyi bir durağın üstüne getirince açıklaması çıkar ve hikâye yavaşlar. Hız ve duraklatma yayla yumuşar; "Hareketi azalt" açıkken tek durağan kare gösterilir. Pencereyi 700 px altına daraltınca şema dikeye döner.</span>
      <div className="row">
        <label>Hız <select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value={0}>Donuk</option><option value={0.5}>Yarım</option><option value={1}>Normal</option><option value={2}>Çift</option></select></label>
        <label><input type="checkbox" checked={paused} onChange={event => setPaused(event.target.checked)} /> Duraklat</label>
      </div>
      <PaymentFlow amount={2400} commission={69.6} balance={18250} speed={speed} paused={paused} caption="Müşteri 2.400 ₺ öder; işlemci komisyonu düşer, net tutar ertesi iş günü bakiyenize yatar." />
    </div>
  );
}
