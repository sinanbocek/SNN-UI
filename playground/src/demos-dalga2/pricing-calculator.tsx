// pricing-calculator örneği. Plan adları, özellikler ve fiyatlar uydurmadır (koltuk başına aylık, TRY).
import { useState } from "react";
import { PricingCalculator } from "../../../registry/components/pricing-calculator/pricing-calculator";
import type { PricingPlan } from "../../../registry/components/pricing-calculator/pricing-calculator";

const PLANS: PricingPlan[] = [
  { key: "starter", name: "Başlangıç", description: "Küçük ekipler için temel araçlar.", maxSeats: 10, fitsSeats: [1, 10], tiers: [{ fromSeats: 1, price: 149 }],
    features: [{ label: "5 proje" }, { label: "Temel raporlar" }, { label: "E-posta desteği" }] },
  { key: "team", name: "Takım", description: "Büyüyen ekipler için işbirliği ve raporlama.", fitsSeats: [11, 50], tiers: [{ fromSeats: 1, price: 249 }, { fromSeats: 25, price: 219 }, { fromSeats: 50, price: 199 }],
    features: [{ label: "Sınırsız proje" }, { label: "Gelişmiş raporlar" }, { label: "Öncelikli destek" }, { label: "Rol ve yetki yönetimi", fromSeats: 20 }] },
  { key: "business", name: "İş", description: "Büyük kurumlar için güvenlik ve yönetim.", fitsSeats: [51, null], tiers: [{ fromSeats: 1, price: 389 }, { fromSeats: 100, price: 339 }, { fromSeats: 250, price: 299 }],
    features: [{ label: "Takım planındaki her şey" }, { label: "Tek oturum açma (SSO)" }, { label: "Denetim kayıtları" }, { label: "Özel hesap yöneticisi", fromSeats: 100 }] },
];
const STOPS = [1, 5, 10, 20, 35, 50, 75, 100, 150, 250, 500];

export function PricingCalculatorDemo() {
  const [failNext, setFailNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [last, setLast] = useState("");
  return (
    <div className="col">
      <span className="etiket">Kaydırıcıyı sürükleyin ya da eksi/artı düğmelerine basın (oklar, Home/End ve PageUp/PageDown duraklar arasında gezer): fiyatlar, toplam, hacim indirimi ve özellik listeleri güncellenir; "Önerilen" rozeti uygun plana kayar. 10'dan fazla koltukta Başlangıç planı fiyat göstermez. Yıllık ödeme indirimini ve tasarrufu gösterir.</span>
      <div className="row">
        <label><input type="checkbox" checked={failNext} onChange={event => setFailNext(event.target.checked)} /> Sonraki deneme başlatma başarısız olsun</label>
        <label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
      </div>
      <PricingCalculator plans={PLANS} stops={STOPS} defaultSeats={20} yearlyDiscount={20} description="30 gün ücretsiz deneyin, kredi kartı gerekmez." loading={loading}
        onStartTrial={async selection => { await new Promise(resolve => window.setTimeout(resolve, 800)); if (failNext) { setFailNext(false); throw new Error("örnek hata"); } setLast(`${selection.plan}, ${selection.seats} koltuk, ${selection.period}`); }} />
      {last && <span className="etiket">Başlatılan deneme: {last}</span>}
    </div>
  );
}
