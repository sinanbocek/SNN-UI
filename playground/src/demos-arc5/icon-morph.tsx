// icon-morph örnekleri: iki durum arasında yer değiştirmeden biçim değiştiren simgeler.
import { useState } from "react";
import { IconMorph, type IconMorphName } from "../../../registry/components/icon-morph/icon-morph";

const ITEMS: { name: IconMorphName; label: string; on: string }[] = [
  { name: "menu", label: "Menüyü aç", on: "Menüyü kapat" },
  { name: "play", label: "Oynat", on: "Duraklat" },
  { name: "plus", label: "Ekle", on: "Eklendi" },
  { name: "copy", label: "Kopyala", on: "Kopyalandı" },
  { name: "theme", label: "Koyu temaya geç", on: "Açık temaya geç" },
  { name: "chevron", label: "Ayrıntıyı aç", on: "Ayrıntıyı kapat" },
  { name: "bell", label: "Bildirimleri aç", on: "Bildirimleri kapat" },
  { name: "heart", label: "Beğen", on: "Beğenmekten vazgeç" },
];

function Toggle({ name, label, on }: (typeof ITEMS)[number]) {
  const [state, setState] = useState(false);
  return <button type="button" aria-pressed={state} aria-label={state ? on : label} onClick={() => setState(value => !value)}
    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 12, border: "1px solid var(--border-subtle)", background: "transparent", color: "inherit", cursor: "pointer" }}>
    <IconMorph name={name} state={state} />
  </button>;
}

export function IconMorphDemo() {
  return <div className="col">
    <span className="etiket">Sekiz simge; her düğme iki durum arasında gidip gelir</span>
    <div className="row">{ITEMS.map(item => <Toggle key={item.name} {...item} />)}</div>
  </div>;
}
