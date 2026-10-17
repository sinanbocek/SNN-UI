// expanding-button-group örneği. Veriler uydurmadır.
import { useState } from "react";
import { Archive, Reply, Share2, Trash2, Pin } from "lucide-react";
import { ExpandingButtonGroup } from "../../../registry/components/expanding-button-group/expanding-button-group";

export function ExpandingButtonGroupDemo() {
  const [last, setLast] = useState("Henüz bir şey seçilmedi");
  const wait = () => new Promise<void>(resolve => setTimeout(resolve, 600));

  return <div className="col">
    <span className="etiket">Biri hep açık; üzerine geleni ya da odaklananı yazısını devralır. Arşivle ve Sabitle yerinde onaylanır, Sil tehlike rengindedir.</span>
    <div className="row">
      <ExpandingButtonGroup label="İleti işlemleri" onAction={id => setLast(`Son işlem: ${id}`)} items={[
        { id: "reply", label: "Yanıtla", icon: <Reply /> },
        { id: "archive", label: "Arşivle", doneLabel: "Arşivlendi", icon: <Archive />, onSelect: wait },
        { id: "pin", label: "Sabitle", doneLabel: "Sabitlendi", icon: <Pin /> },
        { id: "delete", label: "Sil", icon: <Trash2 />, tone: "danger" },
      ]} />
    </div>
    <span className="etiket">Küçük boy, ana eylem Paylaş; Sil devre dışı.</span>
    <div className="row">
      <ExpandingButtonGroup label="Belge işlemleri" size="sm" defaultExpanded="share" items={[
        { id: "reply", label: "Yanıtla", icon: <Reply /> },
        { id: "share", label: "Paylaş", doneLabel: "Bağlantı kopyalandı", icon: <Share2 /> },
        { id: "delete", label: "Sil", icon: <Trash2 />, tone: "danger", disabled: true },
      ]} />
    </div>
    <span className="etiket" role="status">{last}</span>
  </div>;
}
