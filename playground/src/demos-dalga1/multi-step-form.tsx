// multi-step-form örneği. Veriler uydurmadır.
import { useState } from "react";
import { text } from "@snn/abacus-core";
import { MultiStepForm } from "../../../registry/components/multi-step-form/multi-step-form";
import { Input } from "../../../registry/components/input/input";
import { Select } from "../../../registry/components/select/select";
import { Switch } from "../../../registry/components/switch/switch";
import { Textarea } from "../../../registry/components/textarea/textarea";

export function MultiStepFormDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sector, setSector] = useState("building");
  const [note, setNote] = useState("");
  const [weekly, setWeekly] = useState(true);
  const [fail, setFail] = useState(false);
  const [width, setWidth] = useState(640);
  const [key, setKey] = useState(0);
  return (
    <div className="col">
      <span className="etiket">Ad ya da e-posta boşken Devam'a basın (hata ve odak); e-posta ABACUS ile denetlenir. Adım listesinden tamamlanan adıma dönülür.</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Gönderme başarısız olsun</label>
        <label className="row">Genişlik <input type="range" min={340} max={900} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
        <button type="button" onClick={() => { setKey(value => value + 1); setName(""); setEmail(""); setNote(""); }}>Baştan başlat</button>
      </div>
      <div style={{ width, maxWidth: "100%" }}>
        <MultiStepForm
          key={key}
          steps={[
            {
              id: "contact", title: "İletişim bilgileri", description: "Teklif size bu bilgilerle ulaşacak.",
              content: (
                <>
                  <Input label="Ad soyad" value={name} required onChange={event => setName(event.target.value)} />
                  <Input label="E-posta" type="email" value={email} required onChange={event => setEmail(event.target.value)} />
                </>
              ),
              validate: () => (text.email(email).valid ? undefined : "Geçerli bir e-posta adresi yazın."),
            },
            {
              id: "work", title: "İş bilgileri", description: "Hangi alanda teklif hazırlıyorsunuz?",
              content: (
                <>
                  <Select label="Alan" value={sector} onValueChange={setSector} options={[{ value: "building", label: "Yapı işleri" }, { value: "road", label: "Yol ve altyapı" }, { value: "supply", label: "Mal alımı" }]} />
                  <Textarea label="Not" description="İsteğe bağlı." value={note} onChange={event => setNote(event.target.value)} />
                  <Switch label="Haftalık özet e-postası gönder" checked={weekly} onCheckedChange={setWeekly} />
                </>
              ),
            },
          ]}
          successAction={{ label: "Panoya git", onClick: () => undefined }}
          onComplete={() => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("fail")) : resolve()), 800))}
        />
      </div>
    </div>
  );
}
