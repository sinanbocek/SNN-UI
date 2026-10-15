// settings-command örneği. Örnek veri uydurmadır.
import { useState } from "react";
import { Bell, Palette, Settings, Shield, Users } from "lucide-react";
import { SettingsCommand } from "../../../registry/components/settings-command/settings-command";
import type { SettingValue, SettingsCommandItem, SettingsCommandSection } from "../../../registry/components/settings-command/settings-command";

const sections: SettingsCommandSection[] = [
  { id: "general", label: "Genel", description: "Çalışma alanının temel bilgileri.", icon: <Settings size={16} strokeWidth={1.75} /> },
  { id: "appearance", label: "Görünüm", description: "Ekranın nasıl görüneceğini seçin.", icon: <Palette size={16} strokeWidth={1.75} /> },
  { id: "notifications", label: "Bildirimler", description: "Hangi olaylarda haber alacağınızı belirleyin.", icon: <Bell size={16} strokeWidth={1.75} /> },
  { id: "security", label: "Güvenlik", description: "Hesabı koruyan ayarlar.", icon: <Shield size={16} strokeWidth={1.75} /> },
  { id: "members", label: "Üyeler", description: "Ekip ve davet kuralları.", icon: <Users size={16} strokeWidth={1.75} /> },
];

const items: SettingsCommandItem[] = [
  { id: "name", section: "general", title: "Çalışma alanı adı", description: "Menüde ve e-postalarda görünür.", control: { kind: "text", placeholder: "Alan adı" }, validate: value => (String(value).trim() === "" ? "Ad boş bırakılamaz." : undefined) },
  { id: "slug", section: "general", title: "Alan adresi", description: "Ekibinizin girişte yazacağı adres.", keywords: ["alt alan", "url"], control: { kind: "text", prefix: "acme.ornek.test/" } },
  { id: "language", section: "general", title: "Dil", description: "Arayüz dili.", keywords: ["language", "turkce"], control: { kind: "select", options: [{ value: "tr", label: "Türkçe" }, { value: "en", label: "İngilizce" }] } },
  { id: "theme", section: "appearance", title: "Tema", description: "Açık, koyu ya da cihazı izle.", keywords: ["karanlık mod", "dark"], control: { kind: "segment", options: [{ value: "light", label: "Açık" }, { value: "dark", label: "Koyu" }, { value: "auto", label: "Otomatik" }] } },
  { id: "dense", section: "appearance", title: "Sıkı satırlar", description: "Listelerde daha çok satır sığdırır.", keywords: ["yoğunluk", "kompakt"], control: { kind: "switch" } },
  { id: "reduceMotion", section: "appearance", title: "Hareketi azalt", description: "Geçiş ve kayma animasyonlarını kapatır.", keywords: ["animasyon"], control: { kind: "switch" } },
  { id: "emailAlerts", section: "notifications", title: "E-posta bildirimleri", description: "Önemli olaylar için e-posta gönderilir.", keywords: ["mail"], control: { kind: "switch" } },
  { id: "digest", section: "notifications", title: "Haftalık özet", description: "Pazartesi sabahı özet raporu.", keywords: ["rapor"], control: { kind: "select", options: [{ value: "off", label: "Kapalı" }, { value: "monday", label: "Pazartesi" }, { value: "friday", label: "Cuma" }] } },
  { id: "twofa", section: "security", title: "İki adımlı doğrulama", description: "Girişte ikinci bir kod ister.", keywords: ["2fa", "doğrulama kodu", "otp"], control: { kind: "switch" } },
  { id: "session", section: "security", title: "Oturum süresi", description: "Hareketsiz kalan oturum kapanır.", keywords: ["zaman aşımı", "timeout"], control: { kind: "select", options: [{ value: "1", label: "1 saat" }, { value: "8", label: "8 saat" }, { value: "24", label: "1 gün" }] } },
  { id: "invite", section: "members", title: "Davet kuralı", description: "Yeni üyeleri kimin ekleyebileceği.", keywords: ["izin", "yetki"], control: { kind: "segment", options: [{ value: "admin", label: "Yönetici" }, { value: "everyone", label: "Herkes" }] } },
  { id: "domain", section: "members", title: "İzinli e-posta uzantısı", description: "Yalnız bu uzantıdan gelenler katılabilir.", control: { kind: "text", prefix: "@", placeholder: "ornek.test" } },
];

const initial: Record<string, SettingValue> = {
  name: "Acme Ofis", slug: "acme", language: "tr", theme: "auto", dense: false, reduceMotion: false, emailAlerts: true, digest: "monday",
  twofa: false, session: "8", invite: "admin", domain: "ornek.test",
};

export function SettingsCommandDemo() {
  const [saved, setSaved] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [fail, setFail] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Ctrl K ya da / ile arayın: «2fa», «karanlik mod», «yogunluk». Bir ayarı değiştirin, altta çubuk açılır.</span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Kaydetme başarısız olsun</label>
      </div>
      <div style={{ height: 560 }}>
        <SettingsCommand
          sections={sections} items={items} values={saved} suggestedIds={["theme", "twofa", "emailAlerts"]} loading={loading}
          onSave={changes => new Promise<void>((resolve, reject) => setTimeout(() => { if (fail) reject(new Error("fail")); else { setSaved(current => ({ ...current, ...changes })); resolve(); } }, 700))}
        />
      </div>
    </div>
  );
}
