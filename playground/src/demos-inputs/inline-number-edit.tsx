// inline-number-edit örneği. Tutar kuruş tam sayısıdır; veriler uydurmadır.
import { useState } from "react";
import { InlineNumberEdit } from "../../../registry/components/inline-number-edit/inline-number-edit";

/** Sunucu gecikmesini taklit eder; 999 değeri reddedilir. */
const fakeSave = (next: number | null) => new Promise<void>((resolve, reject) => setTimeout(() => (next === 999 ? reject(new Error("kayıt başarısız")) : resolve()), 700));

export function InlineNumberEditDemo() {
  const [price, setPrice] = useState<number | null>(123_450);
  const [quantity, setQuantity] = useState<number | null>(1250.5);
  const [rate, setRate] = useState<number | null>(null);
  return <div className="col">
    <span className="etiket">Para (kuruş): tıkla, kutuda ham tutar ("1234,50") seçili gelir; Enter kaydeder, Escape vazgeçer. Kayıtta "₺1.234,50" yazılır.</span>
    <InlineNumberEdit kind="money" label="Birim fiyat" value={price} min={0} onSave={async next => { await fakeSave(next); setPrice(next); }} allowEmpty={false} />
    <span className="etiket">Sayı: iki ondalığa kadar. 999 yazarsan kayıt reddedilir, son kayıtlı değer geri gelir.</span>
    <InlineNumberEdit label="Miktar" value={quantity} onSave={async next => { await fakeSave(next); setQuantity(next); }} />
    <span className="etiket">Boş değer: silip Enter'a basınca boş (null) kaydedilir. 0–100 aralığı dışı reddedilir.</span>
    <InlineNumberEdit label="İskonto oranı" value={rate} min={0} max={100} maxFractionDigits={1} onSave={next => setRate(next)} />
    <span className="etiket" role="status">Değerler: {String(price)} · {String(quantity)} · {String(rate)}</span>
  </div>;
}
