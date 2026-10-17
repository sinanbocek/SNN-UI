// expanding-search örneği. Veriler uydurmadır.
import { useState } from "react";
import { ExpandingSearch, type ExpandingSearchItem } from "../../../registry/components/expanding-search/expanding-search";

const ITEMS: ExpandingSearchItem[] = [
  { id: "p1", title: "Çağrı Merkezi Raporu", meta: "Proje · Kasım güncellemesi", group: "Projeler", keywords: ["çözüm", "destek"] },
  { id: "p2", title: "İsmail Yıldız Portföyü", meta: "Proje · Ayşe Demir", group: "Projeler" },
  { id: "p3", title: "Şube Açılış Takvimi", meta: "Proje · 3 gün önce", group: "Projeler" },
  { id: "d1", title: "Öğrenci Sözleşmesi Şablonu", meta: "Belge · Hukuk", group: "Belgeler" },
  { id: "d2", title: "Ağustos Bütçe Özeti", meta: "Belge · ₺1.250.000 toplam", group: "Belgeler", keywords: ["maliyet"] },
  { id: "d3", title: "Işık Mimarlık Teklifi", meta: "Belge · Mehmet Kaya", group: "Belgeler" },
];

export function ExpandingSearchDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  return <div className="col" style={{ maxWidth: 420 }}>
    <span className="etiket">Türkçe harfe duyarsız: “cagri”, “ismail”, “isik”, “ogrenci” yazıp dene.</span>
    <ExpandingSearch label="Projelerde ve belgelerde ara" items={ITEMS} suggestions={ITEMS.slice(0, 2)} placeholder="Ara…" onSelect={item => setPicked(item.title)} />
    <span className="etiket">{picked ? `Seçilen: ${picked}` : "Henüz bir şey seçilmedi."}</span>
  </div>;
}
