// avatar-group örneği: ekle/çıkar düğmesiyle taşma sayacının kaymasını gösterir. Veriler uydurmadır.
import { useState } from "react";
import { AvatarGroup, type AvatarGroupMember } from "../../../registry/components/avatar-group/avatar-group";
import { Button } from "../../../registry/components/button/button";

const PEOPLE: AvatarGroupMember[] = [
  { name: "Elif Kaya", status: "online" },
  { name: "Mehmet Çelik" },
  { name: "Şule Yıldırım", status: "online" },
  { name: "İsmail Öztürk", status: "offline" },
  { name: "Ayşe Demir" },
  { name: "Çağrı Aydın" },
  { name: "Gökhan Şahin" },
];

export function AvatarGroupDemo() {
  const [count, setCount] = useState(6);
  return <div className="col">
    <span className="etiket">Dört kişiden fazlası "ve N kişi daha" sayacına toplanır; üzerine gelince ad görünür.</span>
    <div className="row" style={{ alignItems: "center" }}>
      <AvatarGroup members={PEOPLE.slice(0, count)} max={4} />
      <Button size="sm" variant="secondary" onClick={() => setCount(c => Math.max(1, c - 1))}>Kişi çıkar</Button>
      <Button size="sm" variant="secondary" onClick={() => setCount(c => Math.min(PEOPLE.length, c + 1))}>Kişi ekle</Button>
    </div>
    <span className="etiket">Boyutlar</span>
    <div className="row" style={{ alignItems: "center" }}>
      <AvatarGroup members={PEOPLE} max={3} size="sm" />
      <AvatarGroup members={PEOPLE} max={3} size="md" />
      <AvatarGroup members={PEOPLE} max={3} size="lg" />
    </div>
  </div>;
}
