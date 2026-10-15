// kanban-board örneği. Kişiler ve kartlar uydurmadır.
import { useState } from "react";
import { KanbanBoard } from "../../../registry/components/kanban-board/kanban-board";
import type { KanbanCard, KanbanColumn, KanbanPerson, KanbanTag } from "../../../registry/components/kanban-board/kanban-board";

const columns: KanbanColumn[] = [
  { id: "todo", label: "Yapılacak" },
  { id: "doing", label: "Sürüyor", limit: 3 },
  { id: "review", label: "Kontrolde", limit: 2 },
  { id: "done", label: "Bitti" },
];

const people: KanbanPerson[] = [
  { id: "p1", name: "Nilay Karaca" },
  { id: "p2", name: "Barış Tunç" },
  { id: "p3", name: "Ece Yalın" },
];

const tags: KanbanTag[] = [
  { id: "offer", label: "Teklif", tone: "accent" },
  { id: "site", label: "Saha", tone: "success" },
  { id: "pay", label: "Finans", tone: "info" },
];

const first: KanbanCard[] = [
  { id: "k1", code: "TKL-12", title: "Birim fiyat tablosunu güncelle", column: "todo", assigneeId: "p1", tagId: "offer", due: "2026-10-22", points: 3, checklist: [{ id: "a", text: "Çelik fiyatları", done: true }, { id: "b", text: "Beton fiyatları", done: false }, { id: "c", text: "İşçilik oranı", done: false }] },
  { id: "k2", code: "TKL-13", title: "Şartnamedeki belirsiz maddeleri idareye sor", column: "todo", assigneeId: "p2", tagId: "offer", due: "2026-10-24", points: 2 },
  { id: "k3", code: "SHA-4", title: "Aplikasyon kontrolü için saha ekibini ayarla", column: "doing", assigneeId: "p3", tagId: "site", points: 5, checklist: [{ id: "a", text: "Ölçüm aleti", done: true }, { id: "b", text: "Ulaşım", done: true }] },
  { id: "k4", code: "TKL-14", title: "İş programını kritik yola göre baştan çiz ve haftalık planla birleştir", column: "doing", assigneeId: "p1", tagId: "offer", due: "2026-10-28", points: 8 },
  { id: "k5", code: "FIN-7", title: "Teminat mektubu talebini bankaya ilet", column: "doing", assigneeId: "p2", tagId: "pay", due: "2026-10-21", points: 2 },
  { id: "k6", code: "FIN-8", title: "Aylık ödeme planını onaya gönder", column: "review", assigneeId: "p3", tagId: "pay", points: 3 },
  { id: "k7", code: "TKL-9", title: "Referans belgelerini topla", column: "done", assigneeId: "p1", tagId: "offer", points: 1 },
  { id: "k8", code: "SHA-3", title: "Şantiye fotoğraf albümünü tamamla", column: "todo", tagId: "site" },
];

export function KanbanBoardDemo() {
  const [cards, setCards] = useState(first);
  const [loading, setLoading] = useState(false);
  const [fail, setFail] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [width, setWidth] = useState(1000);
  const wait = () => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("fail")) : resolve()), 400));
  return (
    <div className="col">
      <span className="etiket">Kartı basılı tutup sürükleyin. Klavyede karta odaklanıp Boşluk ile kaldırın, ok tuşlarıyla taşıyın, Boşluk ile bırakın, Esc ile vazgeçin. «Sürüyor» sütununun sınırı 3. Enter ayrıntı çekmecesini açar.</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={empty} onChange={event => setEmpty(event.target.checked)} /> Hiç kart yok</label>
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Kayıt başarısız olsun</label>
        <label className="row">Genişlik <input type="range" min={340} max={1200} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
      </div>
      <div style={{ width, maxWidth: "100%" }}>
        <KanbanBoard
          name="Teklif hazırlık hattı" cards={empty ? [] : cards} columns={columns} people={people} tags={tags} currentUserId="p1" loading={loading}
          onChange={async next => { await wait(); setCards(next); }}
          onAdd={async (column, title) => { await wait(); setCards(current => [...current, { id: `n-${current.length + 1}`, title, column, assigneeId: "p1" }]); }}
        />
      </div>
    </div>
  );
}
