// mention-input örneği: kişi ve kanal anması. Veriler uydurmadır.
import { useState } from "react";
import { MentionInput, serializeMentions, type MentionValue } from "../../../registry/components/mention-input/mention-input";

const PEOPLE = [
  { id: "p1", name: "Çağrı Öztürk", role: "Ürün yöneticisi" },
  { id: "p2", name: "İsmail Yılmaz", role: "Arayüz geliştirici" },
  { id: "p3", name: "Şule Aydın", role: "Tasarımcı" },
  { id: "p4", name: "Ayşe Karaca", role: "Muhasebe uzmanı" },
  { id: "p5", name: "Ömer Demir", role: "Veri analisti" },
];
const CHANNELS = [
  { id: "c1", name: "genel", description: "Herkesin görebildiği duyurular", members: 42 },
  { id: "c2", name: "muhasebe", description: "Fatura ve ödeme konuları", members: 8 },
  { id: "c3", name: "ürün-ekibi", description: "Yol haritası ve kararlar", members: 12 },
];

export function MentionInputDemo() {
  const [value, setValue] = useState<MentionValue>({ text: "", mentions: [] });
  return <div className="col">
    <span className="etiket">@ ile kişi, # ile kanal anın. "cagri" yazınca "Çağrı Öztürk" bulunur.</span>
    <MentionInput value={value} onChange={setValue} people={PEOPLE} channels={CHANNELS} placeholder="Bir mesaj yazın…" aria-label="Mesaj" minRows={2} />
    <span className="etiket">Saklanan metin: {serializeMentions(value) || "(boş)"}</span>
  </div>;
}
