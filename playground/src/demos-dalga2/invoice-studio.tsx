// invoice-studio örneği. Firma adları, kalemler ve tutarlar uydurmadır; kayıt, tarayıcıda bir gecikmeyle benzetilir (sunucu yok).
import { useState } from "react";
import { InvoiceStudio } from "../../../registry/components/invoice-studio/invoice-studio";
import type { InvoiceDraft, InvoiceItem } from "../../../registry/components/invoice-studio/invoice-studio";

const ITEMS: InvoiceItem[] = [
  { id: "kalem-1", description: "Saha keşfi ve ölçüm", quantity: 2, unitPrice: 4500 },
  { id: "kalem-2", description: "Elektrik tesisatı işçiliği", quantity: 38.5, unitPrice: 725.5 },
  { id: "kalem-3", description: "Kablo ve bağlantı malzemesi", quantity: 1, unitPrice: 12480.75 },
];

export function InvoiceStudioDemo() {
  const [kind, setKind] = useState<"invoice" | "quote">("quote");
  const [failNext, setFailNext] = useState(false);
  const [saved, setSaved] = useState<InvoiceDraft | null>(null);
  const save = async (draft: InvoiceDraft) => {
    await new Promise(resolve => window.setTimeout(resolve, 900));
    if (failNext) { setFailNext(false); throw new Error("örnek hata"); }
    setSaved(draft);
  };
  return (
    <div className="col">
      <span className="etiket">Adet ya da birim fiyat yazdıkça satır tutarı, ara toplam, KDV ve genel toplam anında yeniden hesaplanır (kuruş tamsayısıyla, kayan noktasız). Virgül ondalık ayracı olarak yazılır, binlik ayracı kendiliğinden konur. "Kalem ekle" yeni satırın açıklamasına odaklanır; açıklaması boş kalemle kayıt gitmez. Bu ekran yalnız taslağı düzenler; gerçek belgede toplam sunucuda yeniden hesaplanmalıdır.</span>
      <div className="row">
        <label><input type="radio" name="fatura-tur" checked={kind === "quote"} onChange={() => setKind("quote")} /> Teklif</label>
        <label><input type="radio" name="fatura-tur" checked={kind === "invoice"} onChange={() => setKind("invoice")} /> Fatura</label>
        <label><input type="checkbox" checked={failNext} onChange={event => setFailNext(event.target.checked)} /> Sonraki kayıt başarısız olsun</label>
      </div>
      <InvoiceStudio key={kind} kind={kind} sender={{ name: "Örnek Elektrik Ltd. Şti.", lines: ["Atatürk Cd. 12/4", "Çankaya, Ankara"] }} recipient={{ name: "Demo Yapı A.Ş.", lines: ["Sanayi Mh. 5. Sk. 8", "Kadıköy, İstanbul"] }}
        defaultItems={ITEMS} vatRate={20} defaultNote="Ödeme: teslimden sonra 30 gün içinde." onSave={save} />
      {saved && <span className="etiket">Son kaydedilen taslak: {saved.items.length} kalem, KDV %{saved.vatRate}.</span>}
    </div>
  );
}
