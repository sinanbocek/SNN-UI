// usage-pricing örneği. Plan adları, kullanım payları ve fiyatlar uydurmadır (koltuk başı aylık ve milyon istek başı aşım, TRY).
import { useState } from "react";
import { UsagePricing } from "../../../registry/components/usage-pricing/usage-pricing";
import type { UsagePlan } from "../../../registry/components/usage-pricing/usage-pricing";

const PLANS: UsagePlan[] = [
  { key: "starter", name: "Başlangıç", seatPrice: 129, includedUsage: 1_000_000, overagePerMillion: 95, maxSeats: 10, features: ["Temel API erişimi", "Topluluk desteği", "7 gün kayıt saklama"] },
  { key: "team", name: "Takım", seatPrice: 229, includedUsage: 5_000_000, overagePerMillion: 70, maxSeats: 50, features: ["Temel API erişimi", "Topluluk desteği", "30 gün kayıt saklama", "Öncelikli e-posta desteği", "Takım panoları"] },
  { key: "business", name: "İş", seatPrice: 349, includedUsage: 25_000_000, overagePerMillion: 45, maxSeats: 250, features: ["Temel API erişimi", "30 gün kayıt saklama", "Öncelikli e-posta desteği", "Takım panoları", "Tek oturum açma (SSO)", "1 yıl kayıt saklama", "Hizmet seviyesi sözleşmesi"] },
];

export function UsagePricingDemo() {
  const [failNext, setFailNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState("");
  return (
    <div className="col">
      <span className="etiket">İki kaydırıcıyı oynatın: önerilen plan (koltuk × fiyat + aşım, en düşük toplam) yeniden belirlenir, plan adı harf harf döner, döküm ve özellikler güncellenir; kaydırıcı izindeki işaretler önerinin değiştiği duraklardır. 250'den fazla koltukta "özel teklif" çıkar. Yıllık ödeme indirimi ve tasarruf gösterilir.</span>
      <div className="row">
        <label><input type="checkbox" checked={failNext} onChange={event => setFailNext(event.target.checked)} /> Sonraki deneme başlatma başarısız olsun</label>
        <label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
      </div>
      <UsagePricing plans={PLANS} seatStops={[1, 3, 5, 10, 18, 30, 50, 100, 250, 500]} usageStops={[100_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 15_000_000, 25_000_000, 50_000_000, 100_000_000]} defaultSeats={18} defaultUsage={15_000_000}
        yearlyDiscount={20} description="Koltuk başına ücret, her planın dahil kullanım payı ve aşımda sabit milyon başı birim fiyat." loading={loading}
        onStartTrial={async selection => { await new Promise(resolve => window.setTimeout(resolve, 800)); if (failNext) { setFailNext(false); throw new Error("örnek hata"); } setLast(`${selection.plan}, ${selection.seats} koltuk, ${selection.usage} istek, ${selection.period}`); }} />
      {last && <span className="etiket">Başlatılan deneme: {last}</span>}
    </div>
  );
}
