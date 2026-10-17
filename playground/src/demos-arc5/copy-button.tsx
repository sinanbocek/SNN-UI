// copy-button örneği. Veriler uydurmadır.
import { CopyButton } from "../../../registry/components/copy-button/copy-button";

export function CopyButtonDemo() {
  return <div className="col">
    <span className="etiket">Kopyalayınca düğme kısa süre "Kopyalandı" der, sonra eski haline döner.</span>
    <div className="row">
      <CopyButton value="TR00 0000 0000 0000 0000 0000 00" label="IBAN'ı kopyala" />
      <CopyButton value="FTR-2026-000184" />
      <CopyButton value="https://ornek.test/fatura/FTR-2026-000184" iconOnly label="Bağlantıyı kopyala" variant="plain" />
    </div>
  </div>;
}
