// Kataloğun tek kaynağı: her parçanın adı, Türkçe açıklaması ve kullanım örneği.
// scripts/make-registry.mjs bu listeden registry.json ve AI/katalog.md üretir; ikisi elle düzenlenmez.

/** Arc kaynağı: kuratlielia/arc-library. Her parça bu commit'ten alındı (KAYNAK.md). */
export const ARC_COMMIT = "bfdf7e8";

/** Kurulum adresi. components.json içindeki "@snn-ui" kaydı bu adresi gösterir. */
export const REGISTRY_URL = "https://raw.githubusercontent.com/sinanbocek/SNN-UI/main/public/r/{name}.json";

/** Her bileşenin kurulduğu klasör: projenin components takma adı altında snn/. */
export const INSTALL_ROOT = "@components/snn";

export const foundation = [
  {
    name: "snn-foundation",
    title: "SNN temel değişkenleri",
    description: "Renk, yüzey, boşluk, köşe, gölge, hareket ve odak değişkenleri; açık ve koyu tema. Projede bir kez kurulur ve bir kez içe aktarılır. Uyarı rengi amber değil, mavi-gridir.",
    files: [{ path: "registry/foundation/snn-foundation.css", target: "snn-foundation.css" }],
    arcSource: "registry/foundation.css",
  },
  {
    name: "snn-motion-tokens",
    title: "SNN hareket değerleri",
    description: "Bileşenlerin ortak hareket süreleri, eğrileri ve yayları. Bileşen kurulurken kendiliğinden gelir.",
    files: [{ path: "registry/components/lib/motion-tokens.ts", target: "lib/motion-tokens.ts", type: "registry:lib" }],
    arcSource: "registry/motion-tokens.ts",
  },
];

/**
 * İlk raf (plan §6.4). metric-card bilerek yok: Arc'ta animated-counter'ı getirir, o da Intl.NumberFormat ile
 * varsayılan "en-US" biçimi kullanır (B sınıfı). 2. rafta ABACUS ile gelir.
 */
export const components = [
  { name: "button", title: "Düğme", description: "Açık, tepki veren eylem düğmesi; ikincil durumları sakin.", deps: ["motion"], use: '<Button onClick={save}>Kaydet</Button>', exportName: "Button" },
  { name: "button-group", title: "Düğme grubu", description: "İlgili eylemler ince ayraçlı tek yüzeyde; isteğe bağlı açılır menüyle biter.", deps: ["@radix-ui/react-dropdown-menu", "lucide-react", "motion"], use: '<ButtonGroup label="Belge işlemleri" items={[{ id: "kopyala", label: "Kopyala", onSelect: copy }]} />', exportName: "ButtonGroup" },
  { name: "input", title: "Metin kutusu", description: "Tek satırlı alan; açık etiket ve anlamlı durumlar (hata, açıklama).", deps: ["motion"], use: '<Input label="Ad" placeholder="Adınızı yazın" />', exportName: "Input", note: "Sayı, para, tarih için kullanılmaz: o alanlar ABACUS ile 2. rafta (giris-alanlari-standardi.md)." },
  { name: "textarea", title: "Çok satırlı metin", description: "Not, açıklama ve uzun metin alanı.", deps: ["motion"], use: '<Textarea label="Not" />', exportName: "Textarea" },
  { name: "select", title: "Seçim kutusu", description: "Klavyeyle rahat kullanılan açılır listeden tek seçim.", deps: ["@radix-ui/react-select", "lucide-react", "motion"], use: '<Select label="Şehir" options={[{ value: "ist", label: "İstanbul" }]} />', exportName: "Select" },
  { name: "checkbox", title: "Onay kutusu", description: "İki durumlu seçim; durumu net okunur.", deps: ["@radix-ui/react-checkbox", "motion"], use: '<Checkbox label="Koşulları okudum" />', exportName: "Checkbox" },
  { name: "switch", title: "Anahtar", description: "Hemen etkili olan ayarlar için aç/kapa.", deps: ["@radix-ui/react-switch", "motion"], use: '<Switch label="Bildirimler" />', exportName: "Switch" },
  { name: "radio-group", title: "Radyo grubu", description: "Görünür seçeneklerden birini seçtirir.", deps: ["motion"], use: '<RadioGroup label="Teslimat" value={delivery} onValueChange={setDelivery} options={[{ value: "kargo", label: "Kargo" }]} />', exportName: "RadioGroup" },
  { name: "dialog", title: "Pencere", description: "Dikkat isteyen karar için odaklı pencere.", deps: ["@radix-ui/react-dialog", "lucide-react", "motion"], use: '<Dialog><DialogTrigger asChild><Button>Aç</Button></DialogTrigger><DialogContent title="Silinsin mi?">…</DialogContent></Dialog>', exportName: "Dialog, DialogTrigger, DialogContent, DialogClose" },
  { name: "dropdown-menu", title: "Açılır menü", description: "Bir düğmeye bağlı kısa eylem listesi.", deps: ["@radix-ui/react-dropdown-menu", "lucide-react", "motion"], use: '<DropdownMenu label="İşlemler" items={[{ label: "Düzenle", onSelect: edit }, { label: "Sil", destructive: true, separatorBefore: true }]} />', exportName: "DropdownMenu" },
  { name: "popover", title: "Açılır kutu", description: "Bir öğeye bağlı küçük bağlamsal bilgi yüzeyi.", deps: ["@radix-ui/react-popover"], use: '<Popover><PopoverTrigger asChild><Button>Bilgi</Button></PopoverTrigger><PopoverContent>…</PopoverContent></Popover>', exportName: "Popover, PopoverTrigger, PopoverContent, PopoverClose" },
  { name: "tooltip", title: "İpucu", description: "Tanıdık olmayan denetim için kısa yardımcı metin.", deps: ["@radix-ui/react-tooltip", "motion"], use: '<Tooltip content="Dışa aktar"><Button>⇩</Button></Tooltip>', exportName: "Tooltip" },
  { name: "tabs", title: "Sekmeler", description: "Aynı bağlamdaki ilgili içerikler arasında geçiş.", deps: ["@radix-ui/react-tabs", "lucide-react", "motion"], use: '<Tabs defaultValue="ozet"><TabsList><TabsTrigger value="ozet">Özet</TabsTrigger></TabsList><TabsContent value="ozet">…</TabsContent></Tabs>', exportName: "Tabs, TabsList, TabsTrigger, TabsContent" },
  { name: "card", title: "Kart", description: "İlgili içerik ve eylemleri bir arada tutan kutu; isteğe bağlı hızlı bakış.", deps: ["@radix-ui/react-dialog", "lucide-react", "motion"], use: '<Card title="Teklif 12" description="Taslak" />', exportName: "Card" },
  { name: "toast", title: "Bildirim balonu", description: "Arka planda biten işin kısa onayı.", deps: ["lucide-react", "motion"], use: '<Toast title="Kaydedildi" />', exportName: "Toast (varsayılan dışa aktarım)" },
  { name: "empty-state", title: "Boş durum", description: "Gösterilecek bir şey yokken bir sonraki adımı söyler.", deps: ["lucide-react", "motion"], use: '<EmptyState title="Henüz teklif yok" description="İlk teklifi oluşturun." />', exportName: "EmptyState" },
  { name: "skeleton", title: "Yükleniyor iskeleti", description: "İçerik yüklenirken yer ayırır.", deps: ["motion"], use: '<Skeleton lines={3} />', exportName: "Skeleton" },
  { name: "pagination", title: "Sayfalama", description: "Uzun listede sınırları belli sayfa geçişi.", deps: ["lucide-react", "motion"], use: '<Pagination page={page} pageCount={12} onPageChange={setPage} />', exportName: "Pagination" },
  { name: "search-field", title: "Arama kutusu", description: "Tanınır arama girişi; temizleme düğmesiyle.", deps: ["lucide-react", "motion"], use: '<SearchField label="Ara" value={query} onValueChange={setQuery} />', exportName: "SearchField" },
  { name: "save-bar", title: "Kaydetme çubuğu", description: "Formun altında yüzer; \"{n} kaydedilmemiş değişiklik\", Vazgeç ve Kaydet. Kaydediliyor, kaydedildi, hata durumları ve Ctrl/Cmd+S vardır.", deps: ["motion"], use: '<SaveBar changeCount={3} status={status} onSave={save} onDiscard={reset} />', exportName: "SaveBar", note: "Gerçek kaydetmeyi proje yapar; çubuk yalnız durumu gösterir. Arc Pro settings-page'den esinlenildi (tarif: docs/tarifler/settings-page.md)." },
  { name: "badge", title: "Rozet", description: "Durumu kısa bir etiketle gösterir; metin ve simge değişince hap yumuşakça yeni genişliğe yaylanır.", deps: ["motion"], use: '<Badge tone="success">Onaylandı</Badge>', exportName: "Badge", note: "Tonlar: neutral, success, info, warning (mavi-gri), danger." },
  { name: "breadcrumb", title: "Yol izi", description: "Bulunulan yeri üst sayfalarıyla gösterir; son parça geçerli sayfadır. Bağlantı yoksa düğme olarak çizilir.", deps: ["lucide-react", "motion"], use: '<Breadcrumb items={[{ label: "Projeler", href: "/projeler" }, { label: "Teklif 12" }]} />', exportName: "Breadcrumb", note: "Bağlantı düz `<a>` ile çizilir; yönlendirici (router) bağlantısı gerekiyorsa proje `onClick` ile kendi yönlendirmesini çağırır." },
  { name: "progress", title: "İlerleme çubuğu", description: "Bilinen bir işin ne kadar bittiğini gösterir; yüzde etiketi çubukla birlikte sayılır, bitince onay işareti çıkar.", deps: ["lucide-react", "motion"], use: '<Progress label="Yükleniyor" value={64} showValue />', exportName: "Progress" },
  { name: "segmented-control", title: "Bölmeli seçici", description: "Birkaç kardeş görünüm arasında tek seçim; seçili vurgu kayarak geçer, ok tuşlarıyla gezilir.", deps: ["motion"], use: '<SegmentedControl label="Görünüm" value={view} onValueChange={setView} options={[{ value: "liste", label: "Liste" }, { value: "pano", label: "Pano" }]} />', exportName: "SegmentedControl (varsayılan dışa aktarım)", defaultExport: true },
  { name: "drawer", title: "Çekmece", description: "Kenardan kayarak gelen yan panel; başlık çubuğundan sürüklenip kapatılır, Escape ve dışarı tıklama da kapatır.", deps: ["@radix-ui/react-dialog", "lucide-react", "motion"], use: '<Drawer><DrawerTrigger asChild><Button>Aç</Button></DrawerTrigger><DrawerContent title="Ayrıntılar">…</DrawerContent></Drawer>', exportName: "Drawer, DrawerTrigger, DrawerClose, DrawerContent, useDrawerItem" },
  { name: "combobox", title: "Aramalı seçim", description: "Yazarak süzülen açılır liste; ok tuşları, Enter ve Escape ile kullanılır. Türkçe aramada \"İstanbul\", \"Istanbul\" ve \"istanbul\" aynı sonucu bulur.", deps: ["@snn/abacus-core@github:sinanbocek/SNN-Abacus-Core#semver:^4.3.0", "lucide-react", "motion"], use: '<Combobox label="Şehir" options={[{ value: "ist", label: "İstanbul" }]} onValueChange={setCity} />', exportName: "Combobox", note: "Arama anahtarı ABACUS `text.searchKey` ile üretilir; proje `@snn/abacus-core` paketini kendiliğinden alır." },
  { name: "avatar", title: "Kişi simgesi", description: "Fotoğraf ya da ad baş harfleri; isteğe bağlı çevrimiçi/çevrimdışı noktası. Fotoğraf yüklenemezse baş harflere döner.", deps: ["@snn/abacus-core@github:sinanbocek/SNN-Abacus-Core#semver:^4.3.0", "motion"], use: '<Avatar name="İsmail Yılmaz" status="online" />', exportName: "Avatar", note: "Baş harf ABACUS `text.upper` ile büyütülür (\"ismail\" → \"İ\"). Fotoğraf düz `<img>` ile çizilir." },
  { name: "settings-page", title: "Ayarlar sayfası", description: "Blok: solda bölüm listesi, sağda seçili bölümün formu, altta yüzen kaydetme çubuğu. Bölümler arasında yarım kalan değişiklik korunur; kaydedilmemiş bölümde nokta çıkar. Yükleniyor, boş ve dar ekran durumları vardır.", deps: ["motion"], uses: ["avatar", "empty-state", "save-bar", "skeleton"], use: '<SettingsPage sections={sections} status={status} onSave={save} onDiscard={reset} user={{ name: "Elif Aksoy", subtitle: "Yönetici" }} />', exportName: "SettingsPage, SettingsGroup, SettingsRow", note: "Alanları ve değişiklik sayısını proje verir (`changeCount`); gerçek kaydetmeyi de proje yapar. Arc Pro settings-page'den esinlenildi (tarif: docs/tarifler/settings-page.md)." },
  { name: "team-members", title: "Ekip üyeleri", description: "Blok: koltuk sayacı, e-posta etiketli davet kutusu, üye listesi (rol değiştirme, satır içi çıkarma sorusu, arama, sayfalama) ve bekleyen davetler. Boş, yükleniyor, hata, koltuk dolu ve dar ekran durumları vardır.", deps: ["@snn/abacus-core@github:sinanbocek/SNN-Abacus-Core#semver:^4.3.0", "motion"], uses: ["avatar", "badge", "button", "empty-state", "pagination", "search-field", "select", "skeleton", "tooltip"], use: '<TeamMembers members={members} invites={invites} roles={roles} seatLimit={10} onInvite={invite} onRoleChange={changeRole} onRemove={remove} onResend={resend} onCancelInvite={cancel} />', exportName: "TeamMembers", note: "E-posta denetimi ABACUS `text.email`, arama süzmesi `text.searchKey` ile yapılır. Gerçek davet, rol kaydı ve çıkarmayı proje bağlar; işlemler reddedilirse (Promise) satırda hata yazılır ve eski hâle dönülür. Tarihler ve \"son görülme\" hazır metin olarak gelir (ABACUS `date`). Arc Pro team-members'dan esinlenildi (tarif: docs/tarifler/team-members.md)." },
  { name: "sidebar", title: "Kenar menüsü", description: "Blok: solda gruplu, katlanır gezinme menüsü; şeride daralır (Ctrl+B), dar kolonda çekmeceye dönüşür. Üstte yol izi, ortada kayan içerik, altta Ayarlar ve kullanıcı kartı. Yükleniyor ve hata durumları vardır.", deps: ["@snn/abacus-core@github:sinanbocek/SNN-Abacus-Core#semver:^4.3.0", "lucide-react", "motion"], uses: ["avatar", "badge", "breadcrumb", "button", "drawer", "popover", "skeleton", "tooltip"], use: '<Sidebar header={{ name: "Acme Ofis" }} sections={sections} activeId={page} onNavigate={setPage}>{content}</Sidebar>', exportName: "Sidebar", note: "Menü verisini, etkin sayfayı ve katlama tercihinin saklanmasını proje yapar (`onCollapsedChange`). Çekmece kararı pencereye değil bloğun kendi genişliğine bakar. Kullanıcı kartı menüsü ve şerit grup menüsü `popover` ile açılır (`dropdown-menu` özel tetikleyici kabul etmediği için). Arc Pro sidebar'dan esinlenildi (tarif: docs/tarifler/sidebar.md)." },
];
