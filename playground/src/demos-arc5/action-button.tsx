// action-button örnekleri: yazı yerinde dönüşür, genişlik yayla izler. Veriler uydurmadır.
import { ActionButton } from "../../../registry/components/action-button/action-button";

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function ActionButtonDemo() {
  return <div className="col">
    <span className="etiket">Kaydet: bekleme ve başarı durumları arasında yazı dönüşür</span>
    <div className="row">
      <ActionButton label="Değişiklikleri kaydet" onAction={() => wait(1200)} />
    </div>
    <span className="etiket">Özel yazılar</span>
    <div className="row">
      <ActionButton label="Faturayı gönder" pendingLabel="Gönderiliyor" successLabel="Fatura gönderildi" onAction={() => wait(1500)} />
      <ActionButton label="Dışa aktar" pendingLabel="Hazırlanıyor" successLabel="Hazır" resetAfterMs={4000} onAction={() => wait(900)} />
    </div>
    <span className="etiket">Pasif</span>
    <div className="row">
      <ActionButton label="Kaydet" disabled onAction={() => wait(500)} />
    </div>
  </div>;
}
