// notification-center örnekleri: çan düğmesinden açılan bildirim paneli. Veriler uydurmadır.
import { NotificationCenter } from "../../../registry/components/notification-center/notification-center";

const notifications = [
  { id: "n1", title: "Elif Demir yorum yaptı", description: "Üçüncü çeyrek bütçesine bir not ekledim, bakabilir misin?", time: "2 dk önce", actor: { name: "Elif Demir", photo: "/ornek-foto/portre-1.jpg" } },
  { id: "n2", title: "Ödeme alındı", description: "Kaya Ticaret, FTR-2026-0142 numaralı faturayı ödedi.", time: "1 sa önce", tone: "success" as const },
  { id: "n3", title: "Depolama dolmak üzere", description: "Kotanın yüzde 90'ını kullandın.", time: "Dün", tone: "warning" as const },
  { id: "n4", title: "Mehmet Aksoy seni ekledi", description: "Pazarlama ekibine katıldın.", time: "Dün", read: true, actor: { name: "Mehmet Aksoy" } },
  { id: "n5", title: "Haftalık özet hazır", time: "3 gün önce", read: true, tone: "info" as const },
];

export function NotificationCenterDemo() {
  return <div className="col">
    <span className="etiket">Çana bas: sekmeler, tek tek okundu işareti, toplu işlemler</span>
    <div className="row" style={{ minHeight: 120 }}>
      <NotificationCenter notifications={notifications} />
    </div>
    <span className="etiket">Kenar menüsünün sol alt köşesinden sağa açılan: side="right", align="end"</span>
    <div className="row" style={{ minHeight: 60 }}>
      <NotificationCenter notifications={notifications} label="Bildirimler (sağa açılan)" side="right" align="end" />
    </div>
  </div>;
}
