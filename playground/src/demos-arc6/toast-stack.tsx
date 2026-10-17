// toast-stack örnekleri: bildirim yığını, yerinde güncelleme ve geri alma. Veriler uydurmadır.
import { ToastStack, ToastStackProvider, useToastStack } from "../../../registry/components/toast-stack/toast-stack";

function Controls() {
  const { toast, update, dismiss, count } = useToastStack();
  return <div className="row">
    <button type="button" onClick={() => toast({ type: "success", title: "Fatura gönderildi", description: "FTR-2026-0142 numaralı fatura Ayşe Yılmaz'a iletildi." })}>Başarı</button>
    <button type="button" onClick={() => toast({ type: "info", title: "Yeni sürüm hazır", description: "Yenilemek için sayfayı yeniden yükle." })}>Bilgi</button>
    <button type="button" onClick={() => toast({ type: "warning", title: "Depolama dolmak üzere", description: "Kotanın yüzde 90'ını kullandın." })}>Uyarı</button>
    <button type="button" onClick={() => toast({ type: "error", title: "Ödeme alınamadı", description: "Kartın reddedildi. Başka bir kart dene." })}>Hata</button>
    <button type="button" onClick={() => {
      const id = toast({ type: "loading", title: "Rapor hazırlanıyor" });
      window.setTimeout(() => update(id, { type: "success", title: "Rapor hazır", description: "Eylül satış raporu indirilebilir.", duration: 5000 }), 2000);
    }}>Yükleniyor, sonra başarı</button>
    <button type="button" onClick={() => toast({
      type: "info", title: "Müşteri arşivlendi", description: "Kaya Ticaret listeden kaldırıldı.",
      action: { label: "Geri al", onClick: id => update(id, { type: "success", title: "Geri alındı", description: "Kaya Ticaret yeniden listede.", action: undefined }) },
    })}>Geri alınabilir</button>
    <button type="button" onClick={() => dismiss()} disabled={count === 0}>Hepsini kapat ({count})</button>
  </div>;
}

export function ToastStackDemo() {
  return <ToastStackProvider>
    <div className="col" style={{ position: "relative", minHeight: 340 }}>
      <span className="etiket">Birkaç bildirim ekle; yığının üzerine gelince liste gibi açılır. Sağa kaydırarak kapat. Alt+T odağı yığına taşır.</span>
      <Controls />
      <ToastStack contained position="bottom-right" />
    </div>
  </ToastStackProvider>;
}
