// Blok örnekleri: Arc Pro'dan esinlenen iş ekranları. Örnek veri uydurmadır; gerçek kişi ya da firma değildir.
import { useState } from "react";
import type { ReactNode } from "react";
import { Bell, CreditCard, FileText, HelpCircle, KeyRound, ReceiptText, Home, Inbox, Settings, Shield, User, Users } from "lucide-react";
import { text } from "@snn/abacus-core";
import { Avatar } from "../../registry/components/avatar/avatar";
import { Button } from "../../registry/components/button/button";
import { Input } from "../../registry/components/input/input";
import { Select } from "../../registry/components/select/select";
import { Switch } from "../../registry/components/switch/switch";
import type { SaveBarStatus } from "../../registry/components/save-bar/save-bar";
import { SettingsGroup, SettingsPage, SettingsRow } from "../../registry/components/settings-page/settings-page";
import { HelpCenter } from "../../registry/components/help-center/help-center";
import type { HelpArticle, HelpTopic } from "../../registry/components/help-center/help-center";
import { SearchResults } from "../../registry/components/search-results/search-results";
import type { SearchResult } from "../../registry/components/search-results/search-results";
import { Sidebar } from "../../registry/components/sidebar/sidebar";
import type { SidebarSection } from "../../registry/components/sidebar/sidebar";
import { TeamMembers } from "../../registry/components/team-members/team-members";
import type { TeamInvite, TeamMember } from "../../registry/components/team-members/team-members";

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

/* ---------- team-members ---------- */

const teamRoles = [{ value: "sahip", label: "Sahip", owner: true }, { value: "yonetici", label: "Yönetici" }, { value: "uye", label: "Üye" }, { value: "goruntuleyici", label: "Görüntüleyici" }];
const firstMembers: TeamMember[] = [
  { id: "m1", name: "Elif Aksoy", email: "elif@ornek-firma.test", role: "sahip", self: true, online: true },
  { id: "m2", name: "İsmail Çelik", email: "ismail.celik@ornek-firma.test", role: "yonetici", online: true },
  { id: "m3", name: "Şule Yıldırım", email: "sule.yildirim@ornek-firma.test", role: "uye", lastSeen: "2 saat önce" },
  { id: "m4", name: "Ömer Faruk Kaçmaz Uzunsoyadlı Danışman Ortağımız", email: "omer.faruk.kacmaz.uzun.adres.ornegi@ornek-firma-uzun-alan-adi.test", role: "goruntuleyici", lastSeen: "3 gün önce" },
];
const waitFake = (ms: number, fail: boolean) => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("fail")) : resolve()), ms));

function TeamMembersDemo() {
  const [members, setMembers] = useState<TeamMember[]>(firstMembers);
  const [invites, setInvites] = useState<TeamInvite[]>([{ id: "i1", email: "gizem@ornek-firma.test", role: "uye", sentAt: "12.10.2026" }]);
  const [fail, setFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [seats, setSeats] = useState(8);
  return <>
    <Col title="E-posta yazıp Enter'a basın; birden çok adresi yapıştırın. Satırda Çıkar'a basın.">
      <div className="row">
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> İşlemler başarısız olsun</label>
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={error} onChange={event => setError(event.target.checked)} /> Liste hatası</label>
        <label className="row"><input type="checkbox" checked={seats === 6} onChange={event => setSeats(event.target.checked ? 6 : 8)} /> Koltuk dolsun (6)</label>
      </div>
      <TeamMembers
        members={members} invites={invites} roles={teamRoles} seatLimit={seats} loading={loading} error={error} onRetry={() => setError(false)} pageSize={3}
        onInvite={async (emails, role) => { await waitFake(500, fail); setInvites(current => [...current, ...emails.map((email, index) => ({ id: `n${Date.now()}${index}`, email, role, sentAt: "15.10.2026" }))]); }}
        onRoleChange={async (id, role) => { await waitFake(400, fail); setMembers(current => current.map(member => member.id === id ? { ...member, role } : member)); }}
        onRemove={async id => { await waitFake(400, fail); setMembers(current => current.filter(member => member.id !== id)); }}
        onResend={async id => { await waitFake(300, fail); setInvites(current => current.map(invite => invite.id === id ? { ...invite, sentAt: "15.10.2026" } : invite)); }}
        onCancelInvite={async id => { await waitFake(300, fail); setInvites(current => current.filter(invite => invite.id !== id)); }}
      />
    </Col>
  </>;
}

/* ---------- sidebar ---------- */

const sidebarSections: SidebarSection[] = [
  { id: "ws", title: "Çalışma alanı", items: [
    { id: "pano", label: "Pano", icon: <Home size={18} /> },
    { id: "gelen", label: "Gelen kutusu", icon: <Inbox size={18} />, badge: 4 },
    { id: "belgeler", label: "Belgeler", icon: <FileText size={18} />, children: [
      { id: "teklifler", label: "Teklifler" },
      { id: "sartnameler", label: "Şartnameler" },
      { id: "cok-uzun", label: "Çok uzun bir belge grubunun adı kesilerek gösterilir" },
    ] },
    { id: "ekip", label: "Ekip", icon: <Users size={18} /> },
  ] },
  { id: "pinned", title: "Sabitlenenler", items: [{ id: "haftalik", label: "Haftalık rapor", icon: <FileText size={18} /> }] },
];

function SidebarDemo() {
  const [page, setPage] = useState("teklifler");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [width, setWidth] = useState(900);
  const [saved, setSaved] = useState<string | null>(null);
  return <>
    <Col title="Ctrl/Cmd+B menüyü daraltır. Genişliği küçültünce menü çekmeceye döner.">
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={error} onChange={event => setError(event.target.checked)} /> Menü hatası</label>
        <label className="row">Genişlik <input type="range" min={360} max={900} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
        <span className="etiket">Katlama tercihi uygulamaya bildirildi: {saved ?? "henüz değişmedi"}</span>
      </div>
      <div style={{ height: 460, width, maxWidth: "100%" }}>
        <Sidebar
          header={{ name: "Acme Ofis", subtitle: "Örnek çalışma alanı" }} sections={sidebarSections} activeId={page} onNavigate={setPage}
          settingsItem={{ id: "ayarlar", label: "Ayarlar", icon: <Settings size={18} /> }}
          user={{ name: "Elif Aksoy", subtitle: "Yönetici", menu: [{ id: "profil", label: "Profil", onSelect: () => setPage("ayarlar") }, { id: "cikis", label: "Çıkış yap", onSelect: () => undefined }] }}
          loading={loading} error={error} onRetry={() => setError(false)} onCollapsedChange={value => setSaved(value ? "daraltıldı" : "genişletildi")}
        >
          <h3 style={{ margin: 0 }}>{page}</h3>
          <p>Sayfa içeriği burada kayar; çerçeve sabit kalır.</p>
          {Array.from({ length: 30 }, (_, index) => <p key={index}>Örnek satır {index + 1}</p>)}
        </Sidebar>
      </div>
    </Col>
    <Col title="Sık kabuk: 36 px satır, hap biçimli seçili satır, pasif satır (Yakında). Şeritteyken üzerine gelince açılır; raptiye açık tutar.">
      <div style={{ height: 420, width: 900, maxWidth: "100%", ["--sidebar-row-height" as string]: "36px", ["--sidebar-row-radius" as string]: "999px" }}>
        <Sidebar
          header={{ name: "Nakit", subtitle: "Karar masası" }} activeId={page} onNavigate={setPage} defaultCollapsed hoverExpand breakpoint={420}
          sections={[
            { id: "is", title: "İş", items: [
              { id: "pano", label: "Pano", icon: <Home size={18} /> },
              { id: "gelen", label: "Gelen kutusu", icon: <Inbox size={18} />, badge: 2 },
              { id: "belgeler", label: "Belgeler", icon: <FileText size={18} />, children: [{ id: "teklifler", label: "Teklifler" }, { id: "sartnameler", label: "Şartnameler" }] },
            ] },
            { id: "yonetim", title: "Yönetim", items: [
              { id: "ekip", label: "Ekip", icon: <Users size={18} /> },
              { id: "rapor", label: "Raporlar", icon: <FileText size={18} />, disabled: true, note: "Yakında" },
            ] },
          ]}
          settingsItem={{ id: "ayarlar", label: "Ayarlar", icon: <Settings size={18} /> }}
        >
          <h3 style={{ margin: 0 }}>{page}</h3>
          <p>Geçici açılan menü içeriği itmez, üstüne çizilir.</p>
        </Sidebar>
      </div>
    </Col>
  </>;
}

/* ---------- search-results ---------- */

const searchData: SearchResult[] = [
  { id: "d1", kind: "document", title: "İstanbul Şehir Hastanesi teklif dosyası", subtitle: "Teklifler › 2026", summary: "İstanbul'daki iki blok için birim fiyat tablosu ve iş programı eklenmiştir.", team: "Teklif ekibi", editedBy: "Şule Yıldırım", editedAt: "2026-10-13" },
  { id: "d2", kind: "document", title: "Idari şartname özeti", subtitle: "Şartnameler › Kamu", summary: "Isı yalıtımı işleri için teknik şartname maddeleri ve istenen belgeler.", team: "Şartname ekibi", editedBy: "İsmail Çelik", editedAt: "2026-09-30" },
  { id: "d3", kind: "document", title: "Maliyet karşılaştırma tablosu", subtitle: "Maliyet › Taslaklar", summary: "Üç tedarikçinin birim fiyatları yan yana; en düşük teklif işaretlendi.", team: "Maliyet ekibi", editedBy: "Elif Aksoy", editedAt: "2026-08-21" },
  { id: "d4", kind: "document", title: "Çok uzun bir başlığa sahip belge: yıllık bakım ve onarım hizmetleri için sözleşme taslağı ve ekleri", subtitle: "Sözleşmeler › Taslak", summary: "Bu özet iki satırdan uzundur ve sonunda kesilir; aranan kelime olan teklif burada da geçiyor ama satır sınırı yüzünden son kısım görünmez. Daha fazla metin, daha fazla metin.", team: "Teklif ekibi", editedBy: "Şule Yıldırım", editedAt: "2026-07-02" },
  { id: "p1", kind: "person", title: "İsmail Çelik", subtitle: "Şartname uzmanı", summary: "ismail.celik@ornek-firma.test · Şartname ekibi", team: "Şartname ekibi" },
  { id: "p2", kind: "person", title: "Şule Yıldırım", subtitle: "Teklif sorumlusu", summary: "sule.yildirim@ornek-firma.test · Teklif ekibi", team: "Teklif ekibi" },
  { id: "f1", kind: "file", title: "birim-fiyat-listesi-2026.xlsx", subtitle: "Teklifler › Ekler", summary: "Sayfa 1: yapı işleri, sayfa 2: mekanik işler.", team: "Teklif ekibi", editedBy: "Elif Aksoy", editedAt: "2026-10-01", sizeLabel: "2,4 MB" },
  { id: "f2", kind: "file", title: "teknik-sartname.pdf", subtitle: "Şartnameler › Kamu", summary: "Isıtma ve soğutma sistemleri için teknik şartname.", team: "Şartname ekibi", editedBy: "İsmail Çelik", editedAt: "2026-06-18", sizeLabel: "860 KB" },
];

function SearchResultsDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [width, setWidth] = useState(1100);
  const [opened, setOpened] = useState("");
  return <>
    <Col title="Kutuya tıklayın ya da / tuşuna basın; «istanbul» ya da «ISTANBUL» yazıp Enter'a basın. Genişliği küçültünce önizleme ve süzgeçler alttan açılan sayfaya taşınır.">
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={error} onChange={event => setError(event.target.checked)} /> Arama hatası</label>
        <label className="row">Genişlik <input type="range" min={360} max={1100} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
        <span className="etiket">{opened ? `Açılan: ${opened}` : ""}</span>
      </div>
      <div style={{ height: 620, width, maxWidth: "100%" }}>
        <SearchResults
          results={searchData} today="2026-10-15" workspaceName="Acme Ofis" suggestions={["teklif", "şartname", "birim fiyat"]} defaultQuery="istanbul"
          loading={loading} error={error} onRetry={() => setError(false)} pageSize={4} onOpen={result => setOpened(result.title)}
        />
      </div>
    </Col>
  </>;
}

/* ---------- help-center ---------- */

const helpTopics: HelpTopic[] = [
  { id: "hesap", title: "Hesap ve giriş", description: "Parola, giriş ve profil işlemleri.", icon: <KeyRound size={18} /> },
  { id: "fatura", title: "Fatura ve ödeme", description: "Plan, fatura ve ödeme yöntemleri.", icon: <ReceiptText size={18} /> },
  { id: "baslangic", title: "Başlangıç", description: "İlk adımlar ve temel kavramlar.", icon: <HelpCircle size={18} /> },
];
const helpArticles: HelpArticle[] = [
  { id: "parola", topicId: "hesap", title: "Parolamı nasıl değiştiririm?", summary: "Parolanızı ayarlar sayfasından birkaç adımda değiştirebilirsiniz.", updatedAt: "10.10.2026", readMinutes: 2, popular: true, related: ["fatura-kes"], sections: [
    { id: "once", heading: "Başlamadan önce", paragraphs: ["Parolanızı değiştirmek için oturum açmış olmanız gerekir.", "Yeni parola en az on iki karakter olmalıdır."] },
    { id: "adimlar", heading: "Adımlar", steps: ["Sol menüden Ayarlar'ı açın.", "Güvenlik bölümüne geçin.", "Parolayı değiştir düğmesine basın ve yönergeleri izleyin."] },
    { id: "sorun", heading: "Sorun yaşarsanız", paragraphs: ["Parolanızı unuttuysanız giriş ekranındaki Parolamı unuttum bağlantısını kullanın.", "Hâlâ giremiyorsanız destekle iletişime geçin."] },
  ] },
  { id: "fatura-kes", topicId: "fatura", title: "Fatura bilgilerimi nereden güncellerim?", summary: "Firma adı ve fatura e-postası Faturalama bölümünde durur.", updatedAt: "02.10.2026", readMinutes: 3, popular: true, related: ["parola"], sections: [
    { id: "ozet", heading: "Özet", paragraphs: ["Fatura bilgileri her ay kesilen faturaya yansır."] },
    { id: "adimlar", heading: "Adımlar", steps: ["Ayarlar'da Faturalama bölümünü açın.", "Firma adını ve fatura e-postasını yazın.", "Kaydet düğmesine basın."] },
  ] },
  { id: "ilk-adim", topicId: "baslangic", title: "İlk teklifimi nasıl hazırlarım?", summary: "Birkaç dakikada ilk teklif dosyanızı oluşturun.", updatedAt: "28.09.2026", readMinutes: 5, popular: true, sections: [
    { id: "yeni", heading: "Yeni teklif", paragraphs: ["Teklifler sayfasında Yeni teklif düğmesine basın."] },
  ] },
];

function HelpCenterDemo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [fail, setFail] = useState(false);
  const [width, setWidth] = useState(900);
  const wait = (ms: number) => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("fail")) : resolve()), ms));
  return <>
    <Col title="«parola» ya da «ISIK» yazın (Türkçe harf farkı gözetilmez); Enter makaleyi açar. Genişliği küçültün.">
      <div className="row">
        <label className="row"><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
        <label className="row"><input type="checkbox" checked={error} onChange={event => setError(event.target.checked)} /> İçerik hatası</label>
        <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> İletişim/geri bildirim başarısız olsun</label>
        <label className="row">Genişlik <input type="range" min={360} max={900} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
      </div>
      <div style={{ height: 560, width, maxWidth: "100%" }}>
        <HelpCenter
          topics={helpTopics} articles={helpArticles} brandName="Acme Ofis" quickSearches={["fatura", "parola", "teklif"]} loading={loading} error={error} onRetry={() => setError(false)}
          onContact={() => wait(700)} onFeedback={() => wait(500)}
        />
      </div>
    </Col>
  </>;
}

export const blockDemos: Record<string, () => ReactNode> = {
  "settings-page": () => <SettingsPageDemo />,
  "team-members": () => <TeamMembersDemo />,
  sidebar: () => <SidebarDemo />,
  "search-results": () => <SearchResultsDemo />,
  "help-center": () => <HelpCenterDemo />,
};
