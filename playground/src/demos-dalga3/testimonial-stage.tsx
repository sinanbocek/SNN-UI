// testimonial-stage örneği. Kişiler, şirketler ve alıntılar uydurmadır; portreler baş harfli yer tutucudur, gerçek yüz yok.
import { useState } from "react";
import { TestimonialStage } from "../../../registry/components/testimonial-stage/testimonial-stage";
import type { Testimonial } from "../../../registry/components/testimonial-stage/testimonial-stage";

const PEOPLE: Testimonial[] = [
  { id: "elif", name: "Elif Aksoy", role: "Finans müdürü", company: "Demo A.Ş.", quote: "Aylık kapanış iki günden yarım güne indi; artık rakamların nereden geldiğini tartışmıyoruz.", tone: 0 },
  { id: "baris", name: "Barış Yıldız", role: "Üretim planlama", company: "Örnek Ltd.", quote: "Sahadaki ekip ilk haftada kendi başına kullanmaya başladı.", tone: 2 },
  { id: "deniz", name: "Deniz Korkmaz", role: "Bilgi işlem", company: "Ornek Gıda", quote: "Kurulum bir öğleden sonra sürdü, yedekleme sorunu kalmadı.", tone: 3 },
  { id: "cem", name: "Cem Arslan", role: "Genel müdür", company: "Demo Yapı", quote: "Karar toplantıları artık tek ekrandan yapılıyor.", tone: 4 },
];

export function TestimonialStageDemo() {
  const [last, setLast] = useState("");
  const [loading, setLoading] = useState(false);
  const [single, setSingle] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Sekmeye basın ya da sol/sağ ok kullanın (sondan başa sarar); portre ve alıntı küçük yön kaymasıyla değişir. Kendiliğinden dönmez. Son seçim: <b>{last || "—"}</b></span>
      <div className="row">
        <label><input type="checkbox" checked={single} onChange={event => setSingle(event.target.checked)} /> Tek kişi</label>
        <label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
      </div>
      <TestimonialStage title="Ekipler ne diyor" people={single ? PEOPLE.slice(0, 1) : PEOPLE} loading={loading} onSelect={person => setLast(person.name)} />
    </div>
  );
}
