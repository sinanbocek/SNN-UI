// billing-toggle örnekleri: dönem anahtarı ve yeni tutara dönen fiyat. Veriler uydurmadır.
import { useState } from "react";
import { BillingToggle, BillingPrice } from "../../../registry/components/billing-toggle/billing-toggle";
import { formatPrice, yearlyMonthlyEquivalent, yearlySavings } from "../../../registry/components/billing-toggle/billing-format";

const PLANS = [
  { name: "Başlangıç", monthly: 249 },
  { name: "Takım", monthly: 599 },
  { name: "İşletme", monthly: 1490 },
];
const DISCOUNT = 20;

export function BillingToggleDemo() {
  const [period, setPeriod] = useState("yearly");
  const yearly = period === "yearly";
  const options = [
    { value: "monthly", label: "Aylık" },
    { value: "yearly", label: "Yıllık", badge: `%${DISCOUNT} indirim`, activeBadge: `Yılda ${formatPrice(yearlySavings(PLANS[1]!.monthly, yearlyMonthlyEquivalent(PLANS[1]!.monthly, DISCOUNT)))} kazanırsınız` },
  ];
  return <div className="col">
    <span className="etiket">Dönem anahtarı: başparmak kayar, tasarruf notu seçilince renklenir</span>
    <div className="row"><BillingToggle value={period} onValueChange={setPeriod} options={options} /></div>
    <span className="etiket">Fiyat yeni tutara döner; eski fiyat üstü çizili görünür</span>
    <div className="row" style={{ alignItems: "flex-end", gap: 32 }}>
      {PLANS.map(plan => {
        const price = yearly ? yearlyMonthlyEquivalent(plan.monthly, DISCOUNT) : plan.monthly;
        return <div key={plan.name} className="col">
          <span className="etiket">{plan.name}</span>
          <BillingPrice amount={price} was={yearly ? plan.monthly : undefined} period="kullanıcı başına / ay" />
        </div>;
      })}
    </div>
    <span className="etiket">Büyük boy</span>
    <div className="row"><BillingToggle value={period} onValueChange={setPeriod} size="lg" /></div>
  </div>;
}
