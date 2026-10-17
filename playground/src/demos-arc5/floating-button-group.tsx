// floating-button-group örneği. Veriler uydurmadır.
import { useState } from "react";
import { Bold, Italic, Link2, Share2, Copy, Trash2, Presentation, Undo2, Redo2 } from "lucide-react";
import { FloatingButtonGroup, type FloatingButtonGroupItem } from "../../../registry/components/floating-button-group/floating-button-group";

const FORMAT_ITEMS: FloatingButtonGroupItem[] = [
  { id: "bold", label: "Kalın", icon: <Bold />, shortcut: "Ctrl+B" },
  { id: "italic", label: "İtalik", icon: <Italic />, shortcut: "Ctrl+I" },
  { id: "link", label: "Bağlantı", icon: <Link2 /> },
];

export function FloatingButtonGroupDemo() {
  const [present, setPresent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [last, setLast] = useState("Henüz bir şey seçilmedi");

  const boardItems: FloatingButtonGroupItem[] = [
    { id: "present", label: "Sunum", icon: <Presentation />, pressed: present, onSelect: () => setPresent(value => !value) },
    {
      id: "share", label: copied ? "Kopyalandı" : "Paylaş", icon: copied ? <Copy /> : <Share2 />, reserveLabels: ["Kopyalandı"],
      onSelect: () => { setCopied(true); setTimeout(() => setCopied(false), 1400); },
    },
    { type: "separator", id: "sep" },
    { id: "delete", label: "Sil", icon: <Trash2 />, disabled: true },
  ];

  return <div className="col">
    <span className="etiket">Sakin tepsi: üzerine gelince ortak vurgu düğmeler arasında akar. Sunum açılıp kapanır, Paylaş yazısı genişliği değiştirmeden döner.</span>
    <div className="row"><FloatingButtonGroup label="Pano işlemleri" items={boardItems} onAction={id => setLast(`Son işlem: ${id}`)} /></div>
    <span className="etiket">Yüzen, yalnız simge: yazılar ipucu kutusunda.</span>
    <div className="row"><FloatingButtonGroup label="Biçimlendirme" variant="floating" iconOnly items={FORMAT_ITEMS} onAction={id => setLast(`Son işlem: ${id}`)} /></div>
    <span className="etiket">Dikey, küçük boy.</span>
    <div className="row">
      <FloatingButtonGroup label="Düzenleme" orientation="vertical" size="sm" iconOnly items={[
        { id: "undo", label: "Geri al", icon: <Undo2 />, shortcut: "Ctrl+Z" },
        { id: "redo", label: "Yinele", icon: <Redo2 />, shortcut: "Ctrl+Y" },
        { id: "copy", label: "Kopyala", icon: <Copy /> },
      ]} onAction={id => setLast(`Son işlem: ${id}`)} />
    </div>
    <span className="etiket" role="status">{last}</span>
  </div>;
}
