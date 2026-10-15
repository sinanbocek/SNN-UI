// team-directory örneği. Kişiler uydurmadır; gerçek kişi değildir.
import { useState } from "react";
import { TeamDirectory } from "../../../registry/components/team-directory/team-directory";
import type { DirectoryPerson } from "../../../registry/components/team-directory/team-directory";

const people: DirectoryPerson[] = [
  { id: "p1", name: "Nilay Karaca", title: "Maliyet uzmanı", team: "Teklif", status: "available", email: "nilay@ornek-firma.test", bio: "Birim fiyat analizlerini ve keşif özetlerini hazırlar.", working: "Hastane ek binası teklifi", location: "Ankara · 14.30" },
  { id: "p2", name: "Barış Tunç", title: "Şartname sorumlusu", team: "Teklif", status: "meeting", email: "baris@ornek-firma.test", bio: "İdari ve teknik şartnameleri okur, gereklilik listesini çıkarır.", working: "Yol onarımı şartnamesi", location: "Ankara · 14.30" },
  { id: "p3", name: "Ece Yalın", title: "Satın alma uzmanı", team: "Satın alma", status: "available", email: "ece@ornek-firma.test", bio: "Tedarikçi fiyat tekliflerini toplar ve karşılaştırır.", working: "Çelik tedarik görüşmeleri", location: "İzmir · 14.30" },
  { id: "p4", name: "İsmail Öztaş", title: "Proje yöneticisi", team: "Saha", status: "away", email: "ismail@ornek-firma.test", bio: "Şantiye ilerlemesini ve hakedişleri izler.", working: "Köprü bakım projesi", location: "Bursa · 14.30" },
  { id: "p5", name: "Şule Demirtaş", title: "Mali işler sorumlusu", team: "Finans", status: "available", email: "sule@ornek-firma.test", bio: "Nakit akışı ve teminat mektuplarını takip eder.", working: "Aylık nakit planı", location: "Ankara · 14.30" },
  { id: "p6", name: "Çağlar Uysal", title: "Harita mühendisi", team: "Saha", status: "meeting", email: "caglar@ornek-firma.test", working: "Aplikasyon kontrolleri", location: "Konya · 14.30" },
  { id: "p7", name: "Ozan Gür", title: "Hukuk danışmanı", team: "Finans", status: "available", email: "ozan@ornek-firma.test", bio: "Sözleşme ve itiraz süreçlerinde destek verir.", location: "Ankara · 14.30" },
];

export function TeamDirectoryDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [width, setWidth] = useState(900);
  const [last, setLast] = useState("");
  return (
    <div className="col">
      <span className="etiket">«IS» yazın (İsmail bulunur), ekip düğmesine basın, Esc aramayı siler, e-postayı kopyalayın. Genişliği küçültün.</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={error} onChange={event => setError(event.target.checked)} /> Hata</label>
        <label className="row">Genişlik <input type="range" min={340} max={900} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
        <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{last && `Son seçim: ${last}`}</span>
      </div>
      <div style={{ width, maxWidth: "100%" }}>
        <TeamDirectory people={people} loading={loading} error={error} onRetry={() => setError(false)} onSelect={person => setLast(person.name)} />
      </div>
    </div>
  );
}
