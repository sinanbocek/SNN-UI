// inbox-triage örneği. Gönderenler ve mesajlar uydurmadır.
import { useState } from "react";
import { InboxTriage } from "../../../registry/components/inbox-triage/inbox-triage";
import type { InboxFolder, InboxMessage } from "../../../registry/components/inbox-triage/inbox-triage";

const messages: InboxMessage[] = [
  { id: "m1", from: "Nilay Karaca", subject: "Birim fiyat tablosu onayı", preview: "Tabloyu son haliyle ekledim, onayınızı bekliyorum.", body: ["Merhaba, birim fiyat tablosunu son haliyle ekledim.", "Cuma gününe kadar onay verirseniz teklif dosyasına eklenecek."], time: "09.42", unread: true, folder: "inbox" },
  { id: "m2", from: "Barış Tunç", subject: "Şartnamede iki belirsiz madde", preview: "7. ve 12. maddelerin idareye sorulması gerekiyor.", body: ["Şartnamenin 7. maddesi iş süresini, 12. maddesi ise teminat oranını belirsiz bırakıyor.", "Açıklama talebi için son gün çarşamba."], time: "09.10", unread: true, folder: "inbox" },
  { id: "m3", from: "Ece Yalın", subject: "Çelik tedarik teklifi geldi", preview: "İki tedarikçiden fiyat aldım, karşılaştırma ekte.", body: ["İki tedarikçiden yazılı fiyat aldım.", "Ekteki karşılaştırmada teslim süreleri de var."], time: "Dün", unread: false, folder: "inbox" },
  { id: "m4", from: "Şule Demirtaş", subject: "Teminat mektubu yenileme", preview: "Mektubun süresi ay sonunda doluyor.", body: ["Teminat mektubunun süresi ay sonunda doluyor.", "Bankaya başvuru için imzalı dilekçe gerekiyor."], time: "Dün", unread: true, folder: "inbox" },
  { id: "m5", from: "İsmail Öztaş", subject: "Hakediş dosyası eksik belge", preview: "İş programı ve fotoğraf albümü yüklenmemiş.", body: ["Hakediş dosyasında iş programı ve fotoğraf albümü eksik.", "Tamamlanınca tekrar gönderebilir misiniz?"], time: "Pzt", unread: false, folder: "inbox" },
  { id: "m6", from: "Ozan Gür", subject: "İtiraz süresi hatırlatma", preview: "Başvuru için 10 günlük süre başladı.", body: ["İtirazen şikâyet başvurusu için süre bugün başladı.", "Dosyayı hukuk birimiyle birlikte inceleyelim."], time: "Pzt", unread: false, folder: "snoozed" },
  { id: "m7", from: "Çağlar Uysal", subject: "Aplikasyon raporu", preview: "Saha ölçümleri tamamlandı.", body: ["Aplikasyon raporu ekte.", "Sapmalar tolerans içinde."], time: "Geçen hafta", unread: false, folder: "archive" },
];

export function InboxTriageDemo() {
  const [loading, setLoading] = useState(false);
  const [fail, setFail] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [width, setWidth] = useState(900);
  const [log, setLog] = useState("");
  return (
    <div className="col">
      <span className="etiket">Satıra basın (açılır, okundu olur). Odaktayken E arşivler, S erteler, U geri alır; ok tuşları satırlar arasında gezer. Altta «Geri al».</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={empty} onChange={event => setEmpty(event.target.checked)} /> Mesaj yok</label>
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Taşıma başarısız olsun</label>
        <label className="row">Genişlik <input type="range" min={340} max={900} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
        <span style={{ color: "var(--text-muted)", fontSize: ".85rem" }}>{log}</span>
      </div>
      <div style={{ width, maxWidth: "100%" }}>
        <InboxTriage
          messages={empty ? [] : messages} loading={loading} pageSize={5}
          onRead={id => setLog(`Okundu: ${id}`)}
          onMove={(id: string, to: InboxFolder) => new Promise<void>((resolve, reject) => setTimeout(() => { if (fail) reject(new Error("fail")); else { setLog(`${id} → ${to}`); resolve(); } }, 400))}
        />
      </div>
    </div>
  );
}
