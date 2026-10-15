// project-board örneği. Kişiler ve işler uydurmadır.
import { useState } from "react";
import { ProjectBoard } from "../../../registry/components/project-board/project-board";
import type { BoardPerson, BoardTask } from "../../../registry/components/project-board/project-board";

const people: BoardPerson[] = [
  { id: "p1", name: "Nilay Karaca" },
  { id: "p2", name: "Barış Tunç" },
  { id: "p3", name: "Ece Yalın" },
];

const first: BoardTask[] = [
  { id: "t1", title: "Birim fiyat tablosunu güncelle", stage: "planned", tag: "Teklif", due: "Per", dueToday: true, assigneeId: "p1", comments: 3 },
  { id: "t2", title: "Şartnamedeki belirsiz maddeleri idareye sor", stage: "planned", tag: "Şartname", due: "24 Eki", assigneeId: "p2" },
  { id: "t3", title: "Çelik tedarikçisinden yazılı fiyat al", stage: "active", tag: "Satın alma", due: "Cum", assigneeId: "p3", comments: 1 },
  { id: "t4", title: "İş programını kritik yola göre baştan çiz ve haftalık planla birleştir", stage: "active", tag: "Teklif", assigneeId: "p1" },
  { id: "t5", title: "Teminat mektubu talebini bankaya ilet", stage: "review", tag: "Finans", due: "Pzt", assigneeId: "p2", comments: 2 },
  { id: "t6", title: "Referans belgelerini topla", stage: "done", tag: "Belgeler", assigneeId: "p3" },
];

export function ProjectBoardDemo() {
  const [tasks, setTasks] = useState(first);
  const [loading, setLoading] = useState(false);
  const [fail, setFail] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [width, setWidth] = useState(980);
  const wait = () => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("fail")) : resolve()), 400));
  return (
    <div className="col">
      <span className="etiket">Kartlardaki oklarla aşama değiştirin (odak taşınan kartta kalır). «Benim işlerim» yalnız Nilay'ın işlerini bırakır. Genişliği küçültün.</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={empty} onChange={event => setEmpty(event.target.checked)} /> Hiç iş yok</label>
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Taşıma başarısız olsun</label>
        <label className="row">Genişlik <input type="range" min={340} max={1100} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
      </div>
      <div style={{ width, maxWidth: "100%" }}>
        <ProjectBoard
          name="Hastane ek binası teklifi" tasks={empty ? [] : tasks} people={people} currentUserId="p1" loading={loading}
          onMove={async (id, stage) => { await wait(); setTasks(current => current.map(task => (task.id === id ? { ...task, stage } : task))); }}
          onAdd={async title => { await wait(); setTasks(current => [{ id: `n-${current.length + 1}`, title, stage: "planned", assigneeId: "p1" }, ...current]); }}
        />
      </div>
    </div>
  );
}
