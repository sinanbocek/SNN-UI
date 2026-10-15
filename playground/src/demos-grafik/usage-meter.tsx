// usage-meter örneği. Rakamlar uydurmadır.
import { useState } from "react";
import { UsageMeter } from "../../../registry/components/usage-meter/usage-meter";
import { Button } from "../../../registry/components/button/button";

export function UsageMeterDemo() {
  const [photos, setPhotos] = useState(31);
  return (
    <div className="col" style={{ maxWidth: 520 }}>
      <span className="etiket">Gösterge satırlarının ya da çubuğun üstüne gelin. Fotoğrafları artırıp limiti aşın: taşan kısım taramalı çizilir.</span>
      <UsageMeter
        label="Çalışma alanı depolaması"
        unit="GB"
        limit={100}
        segments={[
          { id: "belge", label: "Belgeler", value: 42.5 },
          { id: "foto", label: "Fotoğraflar", value: photos },
          { id: "yedek", label: "Yedekler", value: 12.3 },
        ]}
      />
      <div className="row">
        <Button size="sm" onClick={() => setPhotos(v => v + 8.5)}>Fotoğrafları artır</Button>
        <Button size="sm" variant="secondary" onClick={() => setPhotos(v => Math.max(0, v - 8.5))}>Azalt</Button>
        <Button size="sm" variant="ghost" onClick={() => setPhotos(31)}>Sıfırla</Button>
      </div>
    </div>
  );
}
