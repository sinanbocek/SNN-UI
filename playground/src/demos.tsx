import { useState } from "react";
import type { ReactNode } from "react";
import { Download, Plus, Settings } from "lucide-react";
import { Button } from "../../registry/components/button/button";
import { ButtonGroup } from "../../registry/components/button-group/button-group";
import { Input } from "../../registry/components/input/input";
import { Textarea } from "../../registry/components/textarea/textarea";
import { Select } from "../../registry/components/select/select";
import { Checkbox } from "../../registry/components/checkbox/checkbox";
import { Switch } from "../../registry/components/switch/switch";
import { RadioGroup } from "../../registry/components/radio-group/radio-group";
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "../../registry/components/dialog/dialog";
import { DropdownMenu } from "../../registry/components/dropdown-menu/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "../../registry/components/popover/popover";
import { Tooltip } from "../../registry/components/tooltip/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../registry/components/tabs/tabs";
import { Card } from "../../registry/components/card/card";
import Toast from "../../registry/components/toast/toast";
import { EmptyState } from "../../registry/components/empty-state/empty-state";
import { Skeleton } from "../../registry/components/skeleton/skeleton";
import { Pagination } from "../../registry/components/pagination/pagination";
import { SearchField } from "../../registry/components/search-field/search-field";
import { SaveBar } from "../../registry/components/save-bar/save-bar";
import type { SaveBarStatus } from "../../registry/components/save-bar/save-bar";
import { Badge } from "../../registry/components/badge/badge";
import { Breadcrumb } from "../../registry/components/breadcrumb/breadcrumb";
import { Progress } from "../../registry/components/progress/progress";
import SegmentedControl from "../../registry/components/segmented-control/segmented-control";
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose } from "../../registry/components/drawer/drawer";
import { Combobox } from "../../registry/components/combobox/combobox";
import { Avatar } from "../../registry/components/avatar/avatar";
import { blockDemos } from "./demos-bloklar";
import { dalga1Demos } from "./demos-dalga1";
import { grafikDemos } from "./demos-grafik";

const Col = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="col"><span className="etiket">{title}</span>{children}</div>
);

function ButtonDemo() {
  const [busy, setBusy] = useState(false);
  const start = () => { setBusy(true); setTimeout(() => setBusy(false), 1800); };
  return <>
    <Col title="Türler">
      <div className="row">
        <Button>Kaydet</Button>
        <Button variant="secondary">İkincil</Button>
        <Button variant="ghost">Sade</Button>
        <Button variant="danger">Sil</Button>
      </div>
    </Col>
    <Col title="Boyutlar ve durum">
      <div className="row">
        <Button size="sm">Küçük</Button>
        <Button size="md">Orta</Button>
        <Button size="lg">Büyük</Button>
        <Button disabled>Pasif</Button>
      </div>
      <div className="row"><Button loading={busy} onClick={start}>{busy ? "Kaydediliyor" : "Yüklemeyi dene"}</Button></div>
    </Col>
  </>;
}

function ButtonGroupDemo() {
  const [last, setLast] = useState("");
  const pick = (name: string) => () => setLast(name);
  return <>
    <Col title="Yatay, açılır menülü">
      <ButtonGroup label="Belge işlemleri"
        items={[{ id: "kopyala", label: "Kopyala", onSelect: pick("Kopyala") }, { id: "indir", label: "İndir", icon: <Download size={14} />, onSelect: pick("İndir") }]}
        menu={{ label: "Diğer", items: [{ id: "tasi", label: "Taşı", onSelect: pick("Taşı") }, { id: "sil", label: "Sil", destructive: true, onSelect: pick("Sil") }] }} />
      <span className="durum">Son eylem: {last || "yok"}</span>
    </Col>
    <Col title="Dolu görünüm, küçük">
      <ButtonGroup label="Görünüm" variant="solid" size="sm" items={[{ id: "a", label: "Liste" }, { id: "b", label: "Izgara" }, { id: "c", label: "Pano" }]} />
    </Col>
  </>;
}

function InputDemo() {
  const [name, setAd] = useState("");
  return <>
    <Col title="Normal"><Input label="Ad" placeholder="Adınızı yazın" /></Col>
    <Col title="Açıklamalı"><Input label="E-posta" description="Giriş için kullanılır." placeholder="name@firma.com" /></Col>
    <Col title="Hata durumu (boş bırakınca)">
      <Input label="Firma nameı" value={name} onChange={e => setAd(e.target.value)} error={name ? undefined : "Firma nameı gerekli."} />
    </Col>
    <Col title="Pasif"><Input label="Kullanıcı kodu" value="K-1042" disabled readOnly /></Col>
  </>;
}

function TextareaDemo() {
  return <>
    <Col title="Normal"><Textarea label="Not" rows={4} placeholder="Notunuzu yazın" /></Col>
    <Col title="Açıklama ve hata"><Textarea label="Gerekçe" description="En az bir cümle yazın." error="Gerekçe boş olamaz." rows={3} /></Col>
  </>;
}

function SelectDemo() {
  const [v, setV] = useState("ist");
  return <>
    <Col title="Seçim">
      <Select label="Şehir" value={v} onValueChange={setV}
        options={[{ value: "ist", label: "İstanbul" }, { value: "ank", label: "Ankara" }, { value: "izm", label: "İzmir" }, { value: "bur", label: "Bursa", disabled: true }]} />
      <span className="durum">Seçili: {v}</span>
    </Col>
    <Col title="Yer tutuculu"><Select label="Para birimi" placeholder="Seçin" description="Teklif para birimi." options={[{ value: "try", label: "Türk lirası" }, { value: "usd", label: "ABD doları" }]} /></Col>
  </>;
}

function CheckboxDemo() {
  const [a, setA] = useState<boolean | "indeterminate">(false);
  return <>
    <Col title="Durumlar">
      <Checkbox label="Koşulları okudum" checked={a} onCheckedChange={setA} />
      <Checkbox label="Bülten gönderilsin" description="Ayda en çok bir e-posta." defaultChecked />
      <Checkbox label="Kısmi seçim" checked="indeterminate" />
      <Checkbox label="Pasif" disabled />
    </Col>
  </>;
}

function SwitchDemo() {
  const [on, setOn] = useState(true);
  return <>
    <Col title="Hemen etkili ayar">
      <Switch label="Bildirimler" checked={on} onCheckedChange={setOn} />
      <span className="durum">{on ? "Açık" : "Kapalı"}</span>
      <Switch label="Pasif anahtar" disabled />
    </Col>
  </>;
}

function RadioDemo() {
  const [v, setV] = useState("kargo");
  return <>
    <Col title="Teslimat">
      <RadioGroup label="Teslimat" value={v} onValueChange={setV}
        options={[{ value: "kargo", label: "Kargo", description: "2–3 iş günü" }, { value: "elden", label: "Elden teslim" }, { value: "kurye", label: "Kurye" }]} />
    </Col>
  </>;
}

function DialogDemo() {
  return <>
    <Col title="Onay penceresi">
      <Dialog>
        <DialogTrigger asChild><Button variant="danger">Teklifi sil</Button></DialogTrigger>
        <DialogContent title="Teklif silinsin mi?" description="Bu işlem geri alınamaz.">
          <div className="row">
            <DialogClose asChild><Button variant="secondary">Vazgeç</Button></DialogClose>
            <DialogClose asChild><Button variant="danger">Sil</Button></DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </Col>
  </>;
}

function DropdownDemo() {
  const [last, setLast] = useState("");
  return <>
    <Col title="İşlem menüsü">
      <DropdownMenu label="İşlemler"
        items={[{ label: "Düzenle", onSelect: () => setLast("Düzenle") }, { label: "Kopyala", onSelect: () => setLast("Kopyala") }, { label: "Pasif seçenek", disabled: true }, { label: "Sil", destructive: true, separatorBefore: true, onSelect: () => setLast("Sil") }]} />
      <span className="durum">Son seçim: {last || "yok"}</span>
    </Col>
  </>;
}

function PopoverDemo() {
  return <>
    <Col title="Bağlamsal bilgi">
      <Popover>
        <PopoverTrigger asChild><Button variant="secondary">Bilgi</Button></PopoverTrigger>
        <PopoverContent>
          <p style={{ margin: "0 0 8px" }}>Bu teklif 3 gün içinde sona erer.</p>
          <PopoverClose asChild><Button size="sm" variant="ghost">Tamam</Button></PopoverClose>
        </PopoverContent>
      </Popover>
    </Col>
  </>;
}

function TooltipDemo() {
  return <>
    <Col title="Dört yön">
      <div className="row">
        <Tooltip content="Dışa aktar" side="top"><Button variant="secondary" aria-label="Dışa aktar"><Download size={16} /></Button></Tooltip>
        <Tooltip content="Ayarlar" side="bottom"><Button variant="secondary" aria-label="Ayarlar"><Settings size={16} /></Button></Tooltip>
        <Tooltip content="Yeni ekle" side="right"><Button variant="secondary" aria-label="Yeni ekle"><Plus size={16} /></Button></Tooltip>
      </div>
      <span className="durum">Üstüne gelin ya da Tab ile odaklanın.</span>
    </Col>
  </>;
}

function TabsDemo() {
  return <>
    <Col title="Üç sekme">
      <Tabs defaultValue="ozet">
        <TabsList>
          <TabsTrigger value="ozet">Özet</TabsTrigger>
          <TabsTrigger value="kalemler">Kalemler</TabsTrigger>
          <TabsTrigger value="notlar">Notlar</TabsTrigger>
        </TabsList>
        <TabsContent value="ozet">Teklifin genel özeti burada görünür.</TabsContent>
        <TabsContent value="kalemler">Teklif kalemleri listesi.</TabsContent>
        <TabsContent value="notlar">İç notlar.</TabsContent>
      </Tabs>
    </Col>
  </>;
}

function CardDemo() {
  return <>
    <Col title="Basit"><Card title="Teklif 12" description="Taslak" /></Col>
    <Col title="Hızlı bakışlı, durumlu">
      <Card title="Teklif 18" description="Kamu ihalesi" status="Gönderildi" meta="3 gün önce"
        action={<Button size="sm" variant="secondary">Aç</Button>}
        details={<p style={{ margin: 0 }}>Toplam 14 kalem; son düzenleme dün yapıldı.</p>} />
    </Col>
  </>;
}

function ToastDemo() {
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(0);
  return <>
    <Col title="Bildirim">
      <Button onClick={() => { setN(n + 1); setOpen(false); setTimeout(() => setOpen(true), 30); }}>Bildirim göster</Button>
      <span className="durum">Birkaç saniye sonra kendiliğinden kapanır; kaydırarak da kapatılır.</span>
      <Toast key={n} title="Kaydedildi" description="Değişiklikleriniz saklandı." open={open} onOpenChange={setOpen} />
    </Col>
  </>;
}

function EmptyDemo() {
  return <>
    <Col title="Eylemli"><EmptyState title="Henüz teklif yok" description="İlk teklifi oluşturarak başlayın." action={<Button>Teklif oluştur</Button>} /></Col>
    <Col title="Eylemsiz"><EmptyState title="Sonuç bulunamadı" description="Farklı kelimelerle deneyin." /></Col>
  </>;
}

function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return <>
    <Col title="Yükleniyor">
      <Skeleton lines={3} avatar />
      <Skeleton lines={2} />
    </Col>
    <Col title="Yüklenince içerik">
      <Button size="sm" variant="secondary" onClick={() => setLoading(!loading)}>{loading ? "Yüklemeyi bitir" : "Yeniden yükle"}</Button>
      <Skeleton lines={2} loading={loading}><p style={{ margin: 0 }}>İçerik geldi: 12 teklif listelendi.</p></Skeleton>
    </Col>
  </>;
}

function PaginationDemo() {
  const [p, setP] = useState(1);
  const [q, setQ] = useState(3);
  return <>
    <Col title="12 sayfa"><Pagination page={p} pageCount={12} onPageChange={setP} /><span className="durum">Sayfa {p}</span></Col>
    <Col title="5 sayfa"><Pagination page={q} pageCount={5} onPageChange={setQ} /></Col>
  </>;
}

function SearchDemo() {
  const [q, setQ] = useState("");
  const matches = ["Teklif 12", "Teklif 18", "Şartname A", "Maliyet özeti"].filter(x => x.toLowerCase().includes(q.toLowerCase()));
  return <>
    <Col title="Süzme">
      <SearchField label="Ara" value={q} onValueChange={setQ} />
      <ul style={{ margin: 0, paddingLeft: 20 }}>{matches.length ? matches.map(x => <li key={x}>{x}</li>) : <li className="eksik">Sonuç yok</li>}</ul>
    </Col>
  </>;
}

function SaveBarDemo() {
  const [count, setCount] = useState(3);
  const [status, setStatus] = useState<SaveBarStatus>("idle");
  const [fail, setFail] = useState(false);
  const save = () => {
    setStatus("saving");
    setTimeout(() => {
      if (fail) { setStatus("error"); return; }
      setCount(0); setStatus("saved");
    }, 900);
  };
  return <>
    <Col title="Çubuk (Ctrl/Cmd+S de kaydeder)">
      <div className="row">
        <Button variant="secondary" onClick={() => { setCount(count + 1); setStatus("idle"); }}>Değişiklik ekle</Button>
        <Checkbox label="Kaydetme başarısız olsun" checked={fail} onCheckedChange={v => setFail(v === true)} />
      </div>
      <div style={{ minHeight: 72, position: "relative" }}>
        <SaveBar changeCount={count} status={status} onSave={save} onDiscard={() => { setCount(0); setStatus("idle"); }} />
      </div>
    </Col>
  </>;
}

function BadgeDemo() {
  const [state, setState] = useState(0);
  const steps = [{ tone: "neutral", text: "Taslak" }, { tone: "info", text: "İncelemede" }, { tone: "success", text: "Onaylandı" }, { tone: "danger", text: "Reddedildi" }] as const;
  const step = steps[state % steps.length]!;
  return <>
    <Col title="Tonlar ve boyutlar">
      <div className="row">
        <Badge>Nötr</Badge><Badge tone="success">Başarılı</Badge><Badge tone="info">Bilgi</Badge><Badge tone="warning">Uyarı</Badge><Badge tone="danger">Hata</Badge>
      </div>
      <div className="row"><Badge size="sm">Küçük</Badge><Badge size="md">Orta</Badge></div>
    </Col>
    <Col title="Metin değişince genişlik yaylanır">
      <div className="row"><Badge tone={step.tone}>{step.text}</Badge><Button variant="secondary" onClick={() => setState(state + 1)}>Durumu ilerlet</Button></div>
    </Col>
  </>;
}

function BreadcrumbDemo() {
  const [path, setPath] = useState(["Projeler", "Teklif 12", "Kalemler"]);
  const items = path.map((label, i) => ({ label, onClick: () => setPath(path.slice(0, i + 1)) }));
  return <>
    <Col title="Durumda yaşayan yol (düğme olarak)">
      <Breadcrumb items={items} />
      <div className="row">
        <Button variant="secondary" onClick={() => setPath([...path, `Alt ${path.length}`])}>Derine in</Button>
        <Button variant="ghost" onClick={() => setPath(["Projeler"])}>Başa dön</Button>
      </div>
    </Col>
    <Col title="Bağlantılı">
      <Breadcrumb items={[{ label: "Ana sayfa", href: "#breadcrumb" }, { label: "Ayarlar", href: "#breadcrumb" }, { label: "Profil" }]} />
    </Col>
  </>;
}

function ProgressDemo() {
  const [value, setValue] = useState(35);
  return <>
    <Col title="Yüzdeli ilerleme">
      <Progress label="Dosyalar yükleniyor" value={value} showValue />
      <div className="row">
        <Button variant="secondary" onClick={() => setValue(Math.max(0, value - 20))}>Azalt</Button>
        <Button variant="secondary" onClick={() => setValue(Math.min(100, value + 20))}>Artır</Button>
      </div>
    </Col>
    <Col title="Yalnız çubuk">
      <Progress label="Hazırlanıyor" value={60} />
    </Col>
  </>;
}

function SegmentedDemo() {
  const [view, setView] = useState("liste");
  const [range, setRange] = useState("hafta");
  return <>
    <Col title="Görünüm seçici (ok tuşlarıyla gez)">
      <SegmentedControl label="Görünüm" value={view} onValueChange={setView}
        options={[{ value: "liste", label: "Liste" }, { value: "pano", label: "Pano" }, { value: "takvim", label: "Takvim", accessory: <Badge size="sm">Yeni</Badge> }]} />
    </Col>
    <Col title="Dar alanda kayar">
      <div style={{ maxWidth: 220 }}>
        <SegmentedControl label="Aralık" value={range} onValueChange={setRange}
          options={[{ value: "gun", label: "Gün" }, { value: "hafta", label: "Hafta" }, { value: "ay", label: "Ay" }, { value: "ceyrek", label: "Çeyrek" }, { value: "yil", label: "Yıl" }]} />
      </div>
    </Col>
  </>;
}

function DrawerDemo() {
  const [side, setSide] = useState<"right" | "left" | "bottom">("right");
  return <>
    <Col title="Kenardan gelen panel (başlıktan sürükleyip kapat)">
      <SegmentedControl label="Kenar" value={side} onValueChange={v => setSide(v as typeof side)}
        options={[{ value: "right", label: "Sağ" }, { value: "left", label: "Sol" }, { value: "bottom", label: "Alt" }]} />
      <div className="row">
        <Drawer>
          <DrawerTrigger asChild><Button>Çekmeceyi aç</Button></DrawerTrigger>
          <DrawerContent title="Teklif ayrıntıları" description="Seçili teklifin özeti" side={side}>
            <p>Çekmece içeriği burada durur.</p>
            <DrawerClose asChild><Button variant="secondary">Kapat</Button></DrawerClose>
          </DrawerContent>
        </Drawer>
      </div>
    </Col>
  </>;
}

function ComboboxDemo() {
  const [city, setCity] = useState("");
  const options = [{ value: "ist", label: "İstanbul" }, { value: "ank", label: "Ankara" }, { value: "izm", label: "İzmir" }, { value: "igd", label: "Iğdır" }, { value: "ada", label: "Adana", disabled: true }];
  return <>
    <Col title='Türkçe arama: "istanbul", "Istanbul", "igdir" yaz'>
      <div style={{ maxWidth: 320 }}>
        <Combobox label="Şehir" description="Adana pasif seçenek örneğidir." options={options} value={city} onValueChange={setCity} />
      </div>
      <span className="etiket">Seçilen: {city || "yok"}</span>
    </Col>
  </>;
}

function AvatarDemo() {
  return <>
    <Col title="Boyutlar (küçük harfli ad büyük baş harf alır)">
      <div className="row">
        <Avatar name="ismail yılmaz" size="sm" /><Avatar name="ismail yılmaz" size="md" /><Avatar name="ışık özdemir" size="lg" /><Avatar name="ismail yılmaz" size="xl" />
      </div>
    </Col>
    <Col title="Durum noktası">
      <div className="row"><Avatar name="Ayşe Demir" status="online" /><Avatar name="Can Öztürk" status="offline" /></div>
    </Col>
    <Col title="Fotoğraf bulunamazsa baş harflere döner">
      <div className="row"><Avatar name="Zeynep Kaya" src="bulunmayan-foto.png" size="lg" /></div>
    </Col>
  </>;
}

/** Ad → canlı örnek. Katalogda olup burada olmayan bileşen sayfada "örnek yok" uyarısı verir; yeni parça eklenince buraya da eklenir. */
export const demos: Record<string, () => ReactNode> = {
  button: () => <ButtonDemo />,
  "button-group": () => <ButtonGroupDemo />,
  input: () => <InputDemo />,
  textarea: () => <TextareaDemo />,
  select: () => <SelectDemo />,
  checkbox: () => <CheckboxDemo />,
  switch: () => <SwitchDemo />,
  "radio-group": () => <RadioDemo />,
  dialog: () => <DialogDemo />,
  "dropdown-menu": () => <DropdownDemo />,
  popover: () => <PopoverDemo />,
  tooltip: () => <TooltipDemo />,
  tabs: () => <TabsDemo />,
  card: () => <CardDemo />,
  toast: () => <ToastDemo />,
  "empty-state": () => <EmptyDemo />,
  skeleton: () => <SkeletonDemo />,
  pagination: () => <PaginationDemo />,
  "search-field": () => <SearchDemo />,
  "save-bar": () => <SaveBarDemo />,
  badge: () => <BadgeDemo />,
  breadcrumb: () => <BreadcrumbDemo />,
  progress: () => <ProgressDemo />,
  "segmented-control": () => <SegmentedDemo />,
  drawer: () => <DrawerDemo />,
  combobox: () => <ComboboxDemo />,
  avatar: () => <AvatarDemo />,
  ...blockDemos,
  ...dalga1Demos,
  ...grafikDemos,
};
