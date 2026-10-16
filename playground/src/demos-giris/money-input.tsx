// money-input örneği. Değer kuruş tam sayısıdır; altındaki satır dışarı verilen değeri gösterir.
import { useState } from "react";
import { money } from "@snn/abacus-core";
import { MoneyInput } from "../../../registry/components/money-input/money-input";
import type { MoneyCurrency } from "../../../registry/components/money-input/money-input";

export function MoneyInputDemo() {
  const [minor, setMinor] = useState<number | null>(1_250_000);
  const [currency, setCurrency] = useState<MoneyCurrency>("TRY");
  return (
    <div className="col" style={{ maxWidth: 420 }}>
      <span className="etiket">Rakam yazın: binlik ayracı imleç kaymadan eklenir, kuruşlar soluk bekler. Hızlı ekle ve ok tuşları rakamları döndürür; birim menüsünden USD ya da EUR seçin.</span>
      <MoneyInput label="Hakediş tutarı" value={minor} onValueChange={setMinor} currency={currency} onCurrencyChange={setCurrency} min={100_00} max={50_000_000_00} description="Vergiler hariç." />
      <span className="etiket">Dışarı verilen değer: {minor === null ? "boş" : `${money.fmtDecimalGrouped(minor)} kuruş (${currency})`}</span>
      <span className="etiket">Tek birim, hızlı ekle yok, hata durumu</span>
      <MoneyInput label="Teminat" defaultValue={50_00} currencies={["TRY"]} quickAdd={[]} error="Teminat ihale bedelinin %3'ünden az olamaz." />
    </div>
  );
}
