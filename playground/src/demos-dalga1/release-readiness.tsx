// release-readiness örneği. Kişiler ve işler uydurmadır.
import { useState } from "react";
import { ReleaseReadiness } from "../../../registry/components/release-readiness/release-readiness";
import type { ReadinessCheck } from "../../../registry/components/release-readiness/release-readiness";

const checks: ReadinessCheck[] = [
  { id: "c1", title: "Şartname baştan sona okundu", description: "İdari ve teknik şartnamedeki tüm maddeler gözden geçirildi." },
  { id: "c2", title: "Birim fiyatlar onaylandı", description: "Maliyet uzmanı tabloyu son haliyle onayladı." },
  { id: "c3", title: "Belgeler eksiksiz", description: "Teminat mektubu, referans ve vergi belgeleri yüklendi." },
  { id: "c4", title: "İş programı hazırlandı", description: "Kritik yol ve teslim tarihleri işlendi." },
];

export function ReleaseReadinessDemo() {
  const [loading, setLoading] = useState(false);
  const [fail, setFail] = useState(false);
  const [width, setWidth] = useState(760);
  const [key, setKey] = useState(0);
  const [log, setLog] = useState("");
  return (
    <div className="col">
      <span className="etiket">Kontrolleri işaretleyin; sayaç ve çubuk güncellenir, hepsi tamamlanınca düğme açılır.</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Eylem başarısız olsun</label>
        <label className="row">Genişlik <input type="range" min={340} max={900} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
        <button type="button" onClick={() => { setKey(value => value + 1); setLog(""); }}>Baştan başlat</button>
        <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{log}</span>
      </div>
      <div style={{ width, maxWidth: "100%" }}>
        <ReleaseReadiness
          key={key} title="Teklif dosyası: Hastane ek binası" context="Son teslim: 24 Ekim · 14.00" owners={[{ name: "Nilay Karaca" }, { name: "Barış Tunç" }, { name: "Ece Yalın" }]}
          checks={checks} defaultChecked={["c1"]} channel="Teklif ekibi" actionLabel="Teklifi gönder" loading={loading}
          successAction={{ label: "Panoya git", onClick: () => setLog("Panoya gidildi") }}
          onAction={notify => new Promise<void>((resolve, reject) => setTimeout(() => { if (fail) reject(new Error("fail")); else { setLog(notify ? "Gönderildi, ekip bilgilendirildi" : "Gönderildi"); resolve(); } }, 900))}
        />
      </div>
    </div>
  );
}
