// radio-cards örnekleri: seçim halkası karttan karta kayar. Veriler uydurmadır.
import { useState } from "react";
import { RadioCards, type RadioCardOption } from "../../../registry/components/radio-cards/radio-cards";
import { formatPrice } from "../../../registry/components/billing-toggle/billing-format";

const SHIPPING: RadioCardOption[] = [
  { value: "standard", label: "Standart kargo", description: "3-5 iş günü içinde kapınızda", meta: "Ücretsiz" },
  { value: "fast", label: "Hızlı kargo", description: "Ertesi iş günü teslim", meta: formatPrice(79) },
  { value: "same-day", label: "Aynı gün teslim", description: "Yalnız İstanbul içi, saat 14.00'e kadar verilen siparişlerde", meta: formatPrice(149), disabled: true, disabledReason: "Bu adrese aynı gün teslim yapılamıyor" },
];

const PLANS: RadioCardOption[] = [
  { value: "starter", label: "Başlangıç", description: "Kişisel projeler için", meta: `${formatPrice(249)} / ay` },
  { value: "team", label: "Takım", description: "Küçük ekipler için", meta: `${formatPrice(599)} / ay` },
  { value: "business", label: "İşletme", description: "Birden çok ekip için", meta: `${formatPrice(1490)} / ay` },
];

export function RadioCardsDemo() {
  const [shipping, setShipping] = useState<string | null>("standard");
  const [plan, setPlan] = useState<string | null>("team");
  return <div className="col">
    <span className="etiket">Liste düzeni: kargo seçimi; üçüncü seçenek pasif ve nedeni yazılı</span>
    <RadioCards aria-label="Teslimat yöntemi" layout="list" options={SHIPPING} value={shipping} onValueChange={setShipping} name="shipping" />
    <span className="etiket">Izgara düzeni: plan seçimi</span>
    <RadioCards aria-label="Plan" options={PLANS} value={plan} onValueChange={setPlan} />
  </div>;
}
