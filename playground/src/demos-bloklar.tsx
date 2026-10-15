// Blok örnekleri: Arc Pro'dan esinlenen iş ekranları. Örnek veri uydurmadır; gerçek kişi ya da firma değildir.
import { useState } from "react";
import type { ReactNode } from "react";
import { Bell, CreditCard, Shield, User } from "lucide-react";
import { text } from "@snn/abacus-core";
import { Avatar } from "../../registry/components/avatar/avatar";
import { Button } from "../../registry/components/button/button";
import { Input } from "../../registry/components/input/input";
import { Select } from "../../registry/components/select/select";
import { Switch } from "../../registry/components/switch/switch";
import type { SaveBarStatus } from "../../registry/components/save-bar/save-bar";
import { SettingsGroup, SettingsPage, SettingsRow } from "../../registry/components/settings-page/settings-page";

const Col = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="col"><span className="etiket">{title}</span>{children}</div>
);

/* ---------- settings-page ---------- */

const savedSettings = { name: "Elif Aksoy", email: "elif@ornek-firma.test", zone: "istanbul", photo: true, mailNews: true, mailInvoice: true, devicePush: false };
type SettingsValues = typeof savedSettings;
const zones = [{ value: "istanbul", label: "İstanbul (UTC+3)" }, { value: "londra", label: "Londra (UTC+0)" }, { value: "berlin", label: "Berlin (UTC+1)" }];

function SettingsPageDemo() {
  const [saved, setSaved] = useState<SettingsValues>(savedSettings);
  const [draft, setDraft] = useState<SettingsValues>(savedSettings);
  const [status, setStatus] = useState<SaveBarStatus>("idle");
  const [fail, setFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) => { setDraft(current => ({ ...current, [key]: value })); setStatus("idle"); };
  const changed = (keys: (keyof SettingsValues)[]) => keys.filter(key => draft[key] !== saved[key]).length;
  const emailCheck = text.email(draft.email);
  const emailError = draft.email && !emailCheck.valid ? "Geçerli bir e-posta adresi yazın." : undefined;

  const save = () => {
    if (emailError) { setStatus("error"); return; }
    setStatus("saving");
    setTimeout(() => {
      if (fail) { setStatus("error"); return; }
      setSaved(draft); setStatus("saved");
    }, 900);
  };

  const profile = (
    <>
      <div className="row">
        <Avatar name={draft.name} size="xl" />
        <Button variant="secondary" onClick={() => set("photo", true)}>Fotoğrafı değiştir</Button>
        <Button variant="ghost" onClick={() => set("photo", false)}>Kaldır</Button>
      </div>
      <Input label="Ad soyad" value={draft.name} onChange={event => set("name", event.target.value)} />
      <Input label="E-posta" description="Giriş ve bildirimler için kullanılır." value={draft.email} error={emailError} onChange={event => set("email", event.target.value)} />
      <Select label="Saat dilimi" value={draft.zone} options={zones} onValueChange={value => set("zone", value)} />
    </>
  );
  const notifications = (
    <>
      <SettingsGroup title="E-posta">
        <SettingsRow title="Ürün haberleri" description="Yeni özellikler ve duyurular."><Switch aria-label="Ürün haberleri" checked={draft.mailNews} onCheckedChange={value => set("mailNews", value)} /></SettingsRow>
        <SettingsRow title="Fatura bildirimleri" description="Her fatura kesildiğinde bir ileti."><Switch aria-label="Fatura bildirimleri" checked={draft.mailInvoice} onCheckedChange={value => set("mailInvoice", value)} /></SettingsRow>
      </SettingsGroup>
      <SettingsGroup title="Cihazlarda">
        <SettingsRow title="Anlık bildirim" description="Tarayıcı ve telefon bildirimleri."><Switch aria-label="Anlık bildirim" checked={draft.devicePush} onCheckedChange={value => set("devicePush", value)} /></SettingsRow>
      </SettingsGroup>
    </>
  );

  return <>
    <Col title="Alanları değiştirin; çubuk çıkar. Ctrl/Cmd+S kaydeder. Sağ listede Güvenlik bölümü boş durumdur.">
      <div className="row">
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Kaydetme başarısız olsun</label>
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
      </div>
      <div style={{ height: 520 }}>
        <SettingsPage
          loading={loading} status={status} onSave={save} onDiscard={() => { setDraft(saved); setStatus("idle"); }}
          user={{ name: "Elif Aksoy", subtitle: "Yönetici" }}
          sections={[
            { id: "profil", label: "Profil", icon: <User size={16} />, description: "Ekip arkadaşlarınız sizi böyle görür.", changeCount: changed(["name", "email", "zone", "photo"]), content: profile },
            { id: "bildirimler", label: "Bildirimler", icon: <Bell size={16} />, description: "Hangi iletileri nerede alacağınızı seçin.", changeCount: changed(["mailNews", "mailInvoice", "devicePush"]), content: notifications },
            { id: "guvenlik", label: "Güvenlik", icon: <Shield size={16} /> },
            { id: "faturalama", label: "Faturalama", icon: <CreditCard size={16} />, description: "Plan ve fatura bilgileri.", content: <p>Faturalama alanlarını proje verir.</p> },
          ]}
        />
      </div>
    </Col>
  </>;
}

export const blockDemos: Record<string, () => ReactNode> = {
  "settings-page": () => <SettingsPageDemo />,
};
