// Dalga 4: dönüşen bileşenler galeri örnekleri. Veriler uydurmadır; simgeler kendi yer tutucularımızdır.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActionMorph } from "../../../registry/components/action-morph/action-morph";
import type { ActionMorphAction } from "../../../registry/components/action-morph/action-morph";
import { Avatar } from "../../../registry/components/avatar/avatar";
import { Button } from "../../../registry/components/button/button";
import { DataFlow } from "../../../registry/components/data-flow/data-flow";
import { LiquidTabBar, liquidPanelId, liquidTabId } from "../../../registry/components/liquid-tab-bar/liquid-tab-bar";
import type { LiquidLabelMode } from "../../../registry/components/liquid-tab-bar/liquid-tab-bar";
import { MorphLoader } from "../../../registry/components/morph-loader/morph-loader";
import type { MorphLoaderState, MorphLoaderVariant } from "../../../registry/components/morph-loader/morph-loader";
import { MorphNav } from "../../../registry/components/morph-nav/morph-nav";
import { OrbitMenu } from "../../../registry/components/orbit-menu/orbit-menu";
import { MorphBlock, SkeletonMorph } from "../../../registry/components/skeleton-morph/skeleton-morph";
import { BellIcon, BoltIcon, BookmarkIcon, BoxIcon, ChartIcon, DatabaseIcon, HomeIcon, InboxIcon, LayersIcon, NoteIcon, PinIcon, ShareIcon, TaskIcon, TrashIcon, UserIcon } from "./icons";

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function MorphLoaderDemo() {
  const [variant, setVariant] = useState<MorphLoaderVariant>("ring");
  const [state, setState] = useState<MorphLoaderState>("loading");
  const [busy, setBusy] = useState(false);
  const publish = async (fail: boolean) => {
    setBusy(true);
    setState("loading");
    await wait(1400);
    setState(fail ? "error" : "success");
    setBusy(false);
  };
  return (
    <div className="col">
      <span className="etiket">Dört yükleniyor biçimi; durumu uygulama verir. Başarıda onay, hatada çarpı çizilir. Aşağıdaki düğme işaretin satır içi kullanımıdır (düğme durumu zaten söylediği için işaret ekran okuyucudan gizlidir).</span>
      <div className="row">
        {(["dots", "bars", "ring", "square"] as MorphLoaderVariant[]).map(item => (
          <button key={item} type="button" onClick={() => setVariant(item)} aria-pressed={variant === item}>{{ dots: "Noktalar", bars: "Çubuklar", ring: "Halka", square: "Kare" }[item]}</button>
        ))}
      </div>
      <div className="row">
        {(["loading", "success", "error"] as MorphLoaderState[]).map(item => (
          <button key={item} type="button" onClick={() => setState(item)} aria-pressed={state === item}>{{ loading: "Yükleniyor", success: "Başarılı", error: "Hatalı" }[item]}</button>
        ))}
      </div>
      <div className="row" style={{ gap: 24 }}>
        <MorphLoader variant={variant} state={state} size={16} />
        <MorphLoader variant={variant} state={state} size={32} />
        <MorphLoader variant={variant} state={state} size={64} />
      </div>
      <div className="row">
        <Button disabled={busy} onClick={() => void publish(false)}><MorphLoader variant={variant} state={busy ? "loading" : state} size={14} decorative />{busy ? "Yayımlanıyor" : state === "success" ? "Yayımlandı" : state === "error" ? "Yayımlanamadı" : "Yayımla"}</Button>
        <Button variant="secondary" disabled={busy} onClick={() => void publish(true)}>Hata ile dene</Button>
      </div>
    </div>
  );
}

function SkeletonMorphDemo() {
  const [loading, setLoading] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const load = () => { clearTimeout(timer.current); setLoading(true); timer.current = setTimeout(() => setLoading(false), 1800); };
  useEffect(() => { load(); return () => clearTimeout(timer.current); }, []);
  return (
    <div className="col">
      <span className="etiket">Yükleme bitince bloklar okuma sırasıyla çözülür: iskelet kutusu içeriğin ölçüsüne uzanıp solar, içerik bulanıklıktan netleşir, kart yüksekliği yumuşakça değişir. Yeniden yüklemeye dönüş anında olur; hızlı yenilemede blok yarıda takılmaz.</span>
      <div className="row">
        <button type="button" onClick={load}>Yeniden yükle</button>
        <button type="button" onClick={() => { clearTimeout(timer.current); setLoading(l => !l); }}>Durumu çevir</button>
      </div>
      <div style={{ maxWidth: 420 }}>
        <SkeletonMorph loading={loading}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <MorphBlock shape="circle" width={44} height={44}><Avatar name="Elif Aksoy" /></MorphBlock>
            <div style={{ display: "grid", gap: 12, flex: 1, minWidth: 0 }}>
              <MorphBlock shape="rect" width="55%" height={20}><strong style={{ display: "block", lineHeight: "20px" }}>Elif Aksoy</strong></MorphBlock>
              <MorphBlock shape="text" lines={3} width="100%"><p style={{ margin: 0, lineHeight: 1.5 }}>Ödemeler ekibinin yöneticisi. Aylık kapanış sürecini yürütür, bütçe sapmalarını haftalık gözden geçirir ve yeni ekip üyelerinin ilk haftasında eşlik eder.</p></MorphBlock>
              <MorphBlock shape="rect" width={112} height={36} radius={999}><Button size="sm">Mesaj gönder</Button></MorphBlock>
            </div>
          </div>
        </SkeletonMorph>
      </div>
    </div>
  );
}

const ACTIONS: ActionMorphAction[] = [
  { id: "task", label: "Yeni görev", description: "Yapılacaklar listesine ekle", icon: <TaskIcon />, shortcut: "G", title: "Ne yapılacak?", placeholder: "Örn. Mart faturalarını kontrol et", submitLabel: "Ekle", successMessage: "Görev eklendi", optionsLabel: "Ne zaman", options: [{ id: "today", label: "Bugün" }, { id: "tomorrow", label: "Yarın" }, { id: "week", label: "Bu hafta" }] },
  { id: "note", label: "Yeni not", description: "Kısa bir not bırak", icon: <NoteIcon />, shortcut: "N", multiline: true, title: "Notunuzu yazın", placeholder: "Notunuz burada durur…", submitLabel: "Kaydet", successMessage: "Not kaydedildi" },
];

function ActionMorphDemo() {
  const [fail, setFail] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  return (
    <div className="col">
      <span className="etiket">Köşedeki düğmeye basın: yüzey menüye, eylem seçince forma dönüşür. G ve N harfleri eylemi açar; Esc geri çıkar. Taslak eylem başına saklanır. "Gönderim başarısız olsun" açıkken form açık kalır ve yazılan silinmez.</span>
      <label className="row"><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Gönderim başarısız olsun</label>
      <div style={{ position: "relative", height: 340, border: "1px dashed var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 24, bottom: 24 }}>
          <ActionMorph actions={ACTIONS} onSubmit={async ({ actionId, text, optionId }) => {
            await wait(900);
            if (fail) throw new Error("reddedildi");
            setLog(items => [`${actionId === "task" ? "Görev" : "Not"}: ${text}${optionId ? ` (${optionId})` : ""}`, ...items].slice(0, 3));
          }} />
        </div>
        <ul style={{ margin: 16, padding: 0, listStyle: "none", fontSize: 13 }}>{log.map((line, index) => <li key={index + line}>{line}</li>)}</ul>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "product", label: "Ürün", links: [
    { id: "p1", label: "Veri alımı", href: "#veri", description: "Kaynakları tek yerde topla", icon: <DatabaseIcon /> },
    { id: "p2", label: "Dönüştürme", href: "#donustur", description: "Kayıtları temizle ve eşle", icon: <BoltIcon /> },
    { id: "p3", label: "Raporlar", href: "#rapor", description: "Haftalık özetler", icon: <ChartIcon /> },
    { id: "p4", label: "Bildirimler", href: "#bildirim", description: "Önemli olaylarda haber ver", icon: <BellIcon /> },
    { id: "p5", label: "Katmanlar", href: "#katman", description: "Ortamlara ayrı ayar", icon: <LayersIcon /> },
  ] },
  { id: "resources", label: "Kaynaklar", links: [
    { id: "r1", label: "Belgeler", href: "#belge", description: "Kurulumdan ileriye rehberler" },
    { id: "r2", label: "Sürüm notları", href: "#surum", description: "Neler değişti" },
  ], featured: <span style={{ fontSize: 13 }}>Yeni: ekip için aylık çalışma planı şablonu.</span> },
  { id: "prices", label: "Fiyatlar", href: "#fiyat", current: true },
  { id: "about", label: "Hakkımızda", href: "#hakkimizda" },
];
const NAV_SEARCH = [
  { id: "s1", label: "Veri alımı nasıl kurulur", href: "#a", group: "Belgeler" }, { id: "s2", label: "Dönüştürme kuralları", href: "#b", group: "Belgeler" },
  { id: "s3", label: "İstanbul bölgesi ayarları", href: "#c", group: "Belgeler" }, { id: "s4", label: "Fiyatlandırma sık sorulanlar", href: "#d", group: "Destek" },
  { id: "s5", label: "Ekip ve izinler", href: "#e", group: "Destek" }, { id: "s6", label: "Hesap kapatma", href: "#f", group: "Destek" },
];

function MorphNavDemo() {
  const [tight, setTight] = useState(false);
  const [width, setWidth] = useState(920);
  const [last, setLast] = useState("");
  return (
    <div className="col">
      <span className="etiket">Üzerine gelin ya da seçin: çubuk bağlantı paneline büyür, komşuya geçerken panel yan yana kayar. Arama simgesi aynı yüzeyden açılır ("istanbul" ile "Istanbul" aynı sonucu bulur). Sol/Sağ ok, Aşağı, Esc deneyin. Genişliği daraltınca bölümler tek menüye katlanır. Son bağlantı: <b>{last || "—"}</b></span>
      <div className="row">
        <label className="row"><input type="checkbox" checked={tight} onChange={event => setTight(event.target.checked)} /> Sıkı çubuk</label>
        <label className="row">Genişlik <input type="range" min={360} max={1000} value={width} onChange={event => setWidth(Number(event.target.value))} /></label>
      </div>
      <div style={{ width, maxWidth: "100%", minHeight: 360 }}>
        <MorphNav brand={{ label: "Naturapan", mark: <BoxIcon /> }} items={NAV_ITEMS} tight={tight} searchEntries={NAV_SEARCH} onNavigate={href => setLast(href)} action={<Button size="sm">Ücretsiz başla</Button>} />
      </div>
    </div>
  );
}

function LiquidTabBarDemo() {
  const [tab, setTab] = useState("home");
  const [mode, setMode] = useState<LiquidLabelMode>("active");
  const [unread, setUnread] = useState(2);
  const tabs = [
    { id: "home", label: "Ana sayfa", icon: <HomeIcon /> },
    { id: "saved", label: "Kayıtlılar", icon: <BookmarkIcon /> },
    { id: "inbox", label: "Gelen kutusu", icon: <InboxIcon />, badge: unread },
    { id: "profile", label: "Profil", icon: <UserIcon /> },
  ];
  const names: Record<string, string> = { home: "Ana sayfa içeriği", saved: "Kaydettiğiniz öğeler", inbox: "Gelen kutunuz", profile: "Profil ayarlarınız" };
  return (
    <div className="col">
      <span className="etiket">Seçim yüzeyini sürükleyip bırakın ya da hızlıca fırlatın; sol/sağ ok ve Home/End çalışır. Fareyle başka sekmeye gelince yüzey o yöne meyleder. Etiket modunu ve rozet sayısını deneyin.</span>
      <div className="row">
        {(["active", "all", "none"] as LiquidLabelMode[]).map(item => <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)}>{{ active: "Yalnız seçili", all: "Hepsi", none: "Yalnız simge" }[item]}</button>)}
        <button type="button" onClick={() => setUnread(n => n + 1)}>Yeni ileti</button>
        <button type="button" onClick={() => setUnread(0)}>Okundu</button>
      </div>
      <LiquidTabBar tabs={tabs} value={tab} onValueChange={setTab} labelMode={mode} idBase="demo" formatBadge={n => `${n} yeni`} />
      {tabs.map(item => <div key={item.id} role="tabpanel" id={liquidPanelId("demo", item.id)} aria-labelledby={liquidTabId("demo", item.id)} hidden={tab !== item.id} style={{ fontSize: 14 }}>{names[item.id]}</div>)}
    </div>
  );
}

const ORBIT: { id: string; label: string; icon: ReactNode; confirmMessage?: string; tone?: "danger" }[] = [
  { id: "pin", label: "Sabitle", icon: <PinIcon />, confirmMessage: "Sabitlendi" },
  { id: "share", label: "Paylaş", icon: <ShareIcon />, confirmMessage: "Bağlantı kopyalandı" },
  { id: "delete", label: "Sil", icon: <TrashIcon />, confirmMessage: "Silindi", tone: "danger" },
];

function OrbitMenuDemo() {
  const [last, setLast] = useState("");
  const [center, setCenter] = useState(-90);
  return (
    <div className="col">
      <span className="etiket">Düğmeye basılı tutup bir eyleme doğru sürükleyin ve bırakın (hedef açıya göre belirlenir). Yay dışında bırakmak iptaldir. Tek dokunuş menüyü açık bırakır. Klavyede oklar menüyü açar; Esc kapatır. Son eylem: <b>{last || "—"}</b></span>
      <div className="row">
        {([[-90, "Yukarı aç"], [90, "Aşağı aç"], [0, "Sağa aç"], [180, "Sola aç"]] as [number, string][]).map(([value, name]) => <button key={value} type="button" aria-pressed={center === value} onClick={() => setCenter(value)}>{name}</button>)}
      </div>
      <div style={{ display: "grid", placeItems: "center", minHeight: 260, border: "1px dashed var(--border)", borderRadius: 12 }}>
        <OrbitMenu actions={ORBIT} center={center} onAction={id => setLast(ORBIT.find(item => item.id === id)?.label ?? id)} />
      </div>
    </div>
  );
}

function DataFlowDemo() {
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  return (
    <div className="col">
      <span className="etiket">Anlatım çizimidir: gerçek veri hacmi göstermez. Daire işlenmemiş, kare işlenmiş kayıttır. "Uyarılar" hedefi kayıtların yalnız bir kısmını alır (köşedeki işaret). Düğümün üstüne gelince yolu vurgulanır ve akış yavaşlar; duraklatma yavaşlayarak durdurur.</span>
      <div className="row">
        <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused}>{paused ? "Devam et" : "Duraklat"}</button>
        <label className="row">Hız <input type="range" min={0} max={3} step={0.25} value={speed} onChange={event => setSpeed(Number(event.target.value))} /></label>
      </div>
      <DataFlow
        paused={paused}
        speed={speed}
        sources={[
          { id: "app", label: "Uygulama", subtitle: "Web ve mobil", detail: "Kullanıcı olayları", icon: <BoxIcon /> },
          { id: "db", label: "Veritabanı", subtitle: "Kayıtlar", detail: "Günlük eşitleme", icon: <DatabaseIcon /> },
          { id: "events", label: "Olaylar", subtitle: "Webhook", detail: "Anlık gelen olaylar", icon: <BoltIcon /> },
        ]}
        process={{ label: "Dönüştür", detail: "Temizle, eşle, zenginleştir", icon: <LayersIcon />, counterLabel: "işlendi", initialCount: 1284 }}
        targets={[
          { id: "store", label: "Depo", subtitle: "Arşiv", detail: "Tüm kayıtlar saklanır", icon: <DatabaseIcon /> },
          { id: "dash", label: "Gösterge paneli", subtitle: "Raporlar", detail: "Özet göstergeler", icon: <ChartIcon /> },
          { id: "alerts", label: "Uyarılar", subtitle: "Bildirim", detail: "Yalnız eşiği aşanlar", icon: <BellIcon />, share: 0.34 },
        ]}
        caption="Veri kaynaktan çıkar, dönüştürülür ve hedeflere dağılır."
      />
    </div>
  );
}

export const dalga4Demos: Record<string, () => ReactNode> = {
  "morph-loader": () => <MorphLoaderDemo />,
  "skeleton-morph": () => <SkeletonMorphDemo />,
  "action-morph": () => <ActionMorphDemo />,
  "morph-nav": () => <MorphNavDemo />,
  "liquid-tab-bar": () => <LiquidTabBarDemo />,
  "orbit-menu": () => <OrbitMenuDemo />,
  "data-flow": () => <DataFlowDemo />,
};
