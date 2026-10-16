// stepper örneği. İhale hattının 10 adımı uydurmadır; adım listesini proje verir.
import { useState } from "react";
import { Stepper } from "../../../registry/components/stepper/stepper";
import type { StepperStep } from "../../../registry/components/stepper/stepper";
import { Button } from "../../../registry/components/button/button";

const LABELS = ["İlan", "Şartname", "Keşif", "Metraj", "Birim fiyat", "Teklif", "Onay", "Teminat", "Sözleşme", "İş başlangıcı"];

export function StepperDemo() {
  const [current, setCurrent] = useState(5);
  const [furthest, setFurthest] = useState(5);
  // Geri dönülünce, geçerli adımla en ileri adım arasındakiler "geri dönüldü" olur.
  const steps: StepperStep[] = LABELS.map((label, index) => ({ id: `s${index}`, label, returned: index > current && index <= furthest, error: index === 7 && current === 7 ? "Teminat mektubu eksik" : undefined }));
  const go = (next: number) => { setCurrent(next); setFurthest(value => Math.max(value, next)); };
  return (
    <div className="col">
      <span className="etiket">Tamamlanan bir adıma basınca geri dönülür; aradaki adımlar "geri dönüldü" (geri ok, mavi-gri) olur. 390 px'te 10 adım tek satırda kalır, geçerli adımın adı altta yazılır.</span>
      <Stepper steps={steps} current={current} onStepSelect={go} label="İhale hattı" />
      <div className="row">
        <Button size="sm" variant="secondary" onClick={() => go(Math.max(0, current - 1))}>Geri</Button>
        <Button size="sm" onClick={() => go(Math.min(LABELS.length, current + 1))}>İleri</Button>
      </div>
      <span className="etiket">Dikey, açıklamalı</span>
      <div style={{ maxWidth: 360 }}>
        <Stepper orientation="vertical" current={2} steps={[
          { id: "a", label: "Belgeler yüklendi", description: "Şartname ve keşif özeti" },
          { id: "b", label: "Metraj kontrolü", description: "Kalem eşleştirmesi tamam" },
          { id: "c", label: "Teklif hazırlanıyor", description: "Birim fiyatlar giriliyor" },
          { id: "d", label: "Onay", description: "Yönetici onayı bekleniyor", returned: true },
        ]} />
      </div>
    </div>
  );
}
