// team-showcase örneği. Kişiler, şehirler ve iletişim bilgileri uydurmadır; portreler baş harfli yer tutucudur, gerçek yüz ve gerçek numara yok.
import { useState } from "react";
import { TeamShowcase } from "../../../registry/components/team-showcase/team-showcase";
import type { TeamMember } from "../../../registry/components/team-showcase/team-showcase";

const MEMBERS: TeamMember[] = [
  { id: "elif", name: "Elif Aksoy", title: "Kurucu ortak", city: "İzmir", country: "Türkiye", bio: "Finans ve operasyon tarafını yönetir; ekibin ilk üyesidir.", email: "elif@ornek.test", phone: "0532 000 00 11", tone: 0 },
  { id: "baris", name: "Barış Yıldız", title: "Ürün müdürü", city: "Ankara", country: "Türkiye", bio: "Yol haritasını ve müşteri görüşmelerini yürütür.", email: "baris@ornek.test", tone: 2 },
  { id: "deniz", name: "Deniz Korkmaz", title: "Yazılım mühendisi", city: "İstanbul", country: "Türkiye", bio: "Arayüz kataloğunun bakımını yapar.", phone: "0533 000 00 22", tone: 3 },
  { id: "cem", name: "Cem Arslan", title: "Tasarımcı", city: "Bursa", country: "Türkiye", bio: "Renk, yazı ve hareket kararlarına bakar.", email: "cem@ornek.test", phone: "0534 000 00 33", tone: 4 },
  { id: "seda", name: "Seda Polat", title: "Müşteri başarısı", city: "Eskişehir", country: "Türkiye", email: "seda@ornek.test", tone: 5 },
];

export function TeamShowcaseDemo() {
  const [mask, setMask] = useState(true);
  const [last, setLast] = useState("");
  return (
    <div className="col">
      <span className="etiket">Yerleşim seçicisi yalnız tanıtım ortamında görünür; üretimde tek yerleşim seçilir. Bir kişiye basın: profil yerinde açılır (dizinde satır genişler). Kopyala düğmesi e-postayı ya da telefonu panoya alır ve kısa süre "Kopyalandı" der; telefon ekranda maskelidir, panoya gerçeği gider. Son seçim: <b>{last || "—"}</b></span>
      <div className="row"><label><input type="checkbox" checked={mask} onChange={event => setMask(event.target.checked)} /> Telefonu maskele</label></div>
      <TeamShowcase title="Ekiple tanışın" members={MEMBERS} layoutSwitcher maskPhone={mask} onSelect={member => setLast(member.name)} />
    </div>
  );
}
