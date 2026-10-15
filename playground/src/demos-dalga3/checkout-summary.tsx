// checkout-summary örneği. Ürün, fiyat ve kuponlar uydurmadır. Gerçek ödeme yoktur; kart alanı yoktur.
import { useState } from "react";
import { text } from "@snn/abacus-core";
import { CheckoutSummary } from "../../../registry/components/checkout-summary/checkout-summary";

export function CheckoutSummaryDemo() {
  const [fail, setFail] = useState(false);
  const [tax, setTax] = useState(true);
  const [closed, setClosed] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Kupon deneyin: "YILLIK15" yüzde 15, "ARKADAS100" 100 ₺ indirim, diğerleri geçersizdir (alan sallanır, uyarı çıkar). Yıllık ödeme indirimi otomatik satırdır. "Öde" benzetimdir: işleniyor, ödendi ya da hata gösterir.</span>
      <div className="row">
        <label><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Ödeme başarısız olsun</label>
        <label><input type="checkbox" checked={tax} onChange={event => setTax(event.target.checked)} /> Vergi oranı belli (%20)</label>
        <label><input type="checkbox" checked={closed} onChange={event => setClosed(event.target.checked)} /> Ödeme kapalı</label>
      </div>
      <CheckoutSummary item={{ name: "Takım planı", description: "10 koltuk · yıllık fatura", price: 4780.8, periodNote: "yıllık" }}
        discounts={[{ id: "yillik", label: "Yıllık ödeme indirimi", amount: 478.08 }]} taxRate={tax ? 20 : null} payDisabled={closed}
        onApplyCoupon={async code => {
          await new Promise(done => setTimeout(done, 500));
          const key = text.upper(code.trim());
          return key === "YILLIK15" ? { code: key, percent: 15 } : key === "ARKADAS100" ? { code: key, amount: 100 } : null;
        }}
        onPay={async () => { await new Promise(done => setTimeout(done, 1200)); if (fail) throw new Error("hata"); }}
        footnote="Fiyatlar TRY'dir. Toplam sunucuda yeniden hesaplanır." />
    </div>
  );
}
