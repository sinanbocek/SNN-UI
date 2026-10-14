# SNN-UI kataloğu (AI için)

> Bu dosya `scripts/make-registry.mjs` ile üretilir; elle düzenlenmez. Kaynak: `scripts/catalog.mjs`.

Yeni bir arayüz parçası yazmadan önce bu listeye bak. Burada varsa kur, kopyasını yazma.
Yoksa Arc'a (uiarc.dev) bak; ikisinde de yoksa yaz ve kataloğa aday olarak bildir.

**Kurallar (kısa):**

- Renk, boşluk, köşe, gölge ve hareket süresi elle yazılmaz; `snn-foundation.css` değişkenlerinden alınır.
- Uyarı rengi amber/turuncu olmaz (`--warning` mavi-gridir). Kırmızı (`--danger`) yalnız gerçek hata içindir.
- Sayı, para, tarih kutusu bu rafta yok: ABACUS ile 2. rafta gelir. `Intl`, `toLocaleString`, `toFixed` kullanılmaz (`giris-alanlari-standardi.md`).
- Ekran metni Türkçe; tanımlayıcılar İngilizce.
- Arc'ın MCP sunucusu kullanılmaz: oradan uyarlanmamış bileşen gelebilir.

## Projeye bir kez kurulum

1. `components.json` dosyasına kayıt ekle:

```json
{ "registries": { "@snn-ui": "https://raw.githubusercontent.com/sinanbocek/SNN-UI/main/public/r/{name}.json" } }
```

2. Bileşeni kur (temel değişkenler ve hareket değerleri kendiliğinden gelir):

```bash
npx shadcn@latest add @snn-ui/button
```

3. Temel değişkenleri uygulamanın girişinde **bir kez** içe aktar (`src/main.tsx`):

```ts
import "@/components/snn/snn-foundation.css";
```

4. Vurgu rengini proje seçer: `<html data-accent="blue">` (`neutral`, `violet`, `blue`, `green`, `coral`, `rose`). Koyu tema: `data-theme="dark"`.

Gereken paketler: React 19, `motion`; bazı bileşenlerde Radix ve `lucide-react` (kurulum kendisi ekler).

## Bileşenler (ilk raf)

| Ad | Türkçe adı | Ne işe yarar | Kurulum |
|---|---|---|---|
| `button` | Düğme | Açık, tepki veren eylem düğmesi; ikincil durumları sakin. | `npx shadcn@latest add @snn-ui/button` |
| `button-group` | Düğme grubu | İlgili eylemler ince ayraçlı tek yüzeyde; isteğe bağlı açılır menüyle biter. | `npx shadcn@latest add @snn-ui/button-group` |
| `input` | Metin kutusu | Tek satırlı alan; açık etiket ve anlamlı durumlar (hata, açıklama). Sayı, para, tarih için kullanılmaz: o alanlar ABACUS ile 2. rafta (giris-alanlari-standardi.md). | `npx shadcn@latest add @snn-ui/input` |
| `textarea` | Çok satırlı metin | Not, açıklama ve uzun metin alanı. | `npx shadcn@latest add @snn-ui/textarea` |
| `select` | Seçim kutusu | Klavyeyle rahat kullanılan açılır listeden tek seçim. | `npx shadcn@latest add @snn-ui/select` |
| `checkbox` | Onay kutusu | İki durumlu seçim; durumu net okunur. | `npx shadcn@latest add @snn-ui/checkbox` |
| `switch` | Anahtar | Hemen etkili olan ayarlar için aç/kapa. | `npx shadcn@latest add @snn-ui/switch` |
| `radio-group` | Radyo grubu | Görünür seçeneklerden birini seçtirir. | `npx shadcn@latest add @snn-ui/radio-group` |
| `dialog` | Pencere | Dikkat isteyen karar için odaklı pencere. | `npx shadcn@latest add @snn-ui/dialog` |
| `dropdown-menu` | Açılır menü | Bir düğmeye bağlı kısa eylem listesi. | `npx shadcn@latest add @snn-ui/dropdown-menu` |
| `popover` | Açılır kutu | Bir öğeye bağlı küçük bağlamsal bilgi yüzeyi. | `npx shadcn@latest add @snn-ui/popover` |
| `tooltip` | İpucu | Tanıdık olmayan denetim için kısa yardımcı metin. | `npx shadcn@latest add @snn-ui/tooltip` |
| `tabs` | Sekmeler | Aynı bağlamdaki ilgili içerikler arasında geçiş. | `npx shadcn@latest add @snn-ui/tabs` |
| `card` | Kart | İlgili içerik ve eylemleri bir arada tutan kutu; isteğe bağlı hızlı bakış. | `npx shadcn@latest add @snn-ui/card` |
| `toast` | Bildirim balonu | Arka planda biten işin kısa onayı. | `npx shadcn@latest add @snn-ui/toast` |
| `empty-state` | Boş durum | Gösterilecek bir şey yokken bir sonraki adımı söyler. | `npx shadcn@latest add @snn-ui/empty-state` |
| `skeleton` | Yükleniyor iskeleti | İçerik yüklenirken yer ayırır. | `npx shadcn@latest add @snn-ui/skeleton` |
| `pagination` | Sayfalama | Uzun listede sınırları belli sayfa geçişi. | `npx shadcn@latest add @snn-ui/pagination` |
| `search-field` | Arama kutusu | Tanınır arama girişi; temizleme düğmesiyle. | `npx shadcn@latest add @snn-ui/search-field` |

## Kullanım örnekleri

### Düğme (`button`)

```tsx
import { Button } from "@/components/snn/button/button";

<Button onClick={save}>Kaydet</Button>
```

### Düğme grubu (`button-group`)

```tsx
import { ButtonGroup } from "@/components/snn/button-group/button-group";

<ButtonGroup label="Belge işlemleri" items={[{ id: "kopyala", label: "Kopyala", onSelect: copy }]} />
```

### Metin kutusu (`input`)

```tsx
import { Input } from "@/components/snn/input/input";

<Input label="Ad" placeholder="Adınızı yazın" />
```

### Çok satırlı metin (`textarea`)

```tsx
import { Textarea } from "@/components/snn/textarea/textarea";

<Textarea label="Not" />
```

### Seçim kutusu (`select`)

```tsx
import { Select } from "@/components/snn/select/select";

<Select label="Şehir" options={[{ value: "ist", label: "İstanbul" }]} />
```

### Onay kutusu (`checkbox`)

```tsx
import { Checkbox } from "@/components/snn/checkbox/checkbox";

<Checkbox label="Koşulları okudum" />
```

### Anahtar (`switch`)

```tsx
import { Switch } from "@/components/snn/switch/switch";

<Switch label="Bildirimler" />
```

### Radyo grubu (`radio-group`)

```tsx
import { RadioGroup } from "@/components/snn/radio-group/radio-group";

<RadioGroup label="Teslimat" value={delivery} onValueChange={setDelivery} options={[{ value: "kargo", label: "Kargo" }]} />
```

### Pencere (`dialog`)

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogClose } from "@/components/snn/dialog/dialog";

<Dialog><DialogTrigger asChild><Button>Aç</Button></DialogTrigger><DialogContent title="Silinsin mi?">…</DialogContent></Dialog>
```

### Açılır menü (`dropdown-menu`)

```tsx
import { DropdownMenu } from "@/components/snn/dropdown-menu/dropdown-menu";

<DropdownMenu label="İşlemler" items={[{ label: "Düzenle", onSelect: edit }, { label: "Sil", destructive: true, separatorBefore: true }]} />
```

### Açılır kutu (`popover`)

```tsx
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "@/components/snn/popover/popover";

<Popover><PopoverTrigger asChild><Button>Bilgi</Button></PopoverTrigger><PopoverContent>…</PopoverContent></Popover>
```

### İpucu (`tooltip`)

```tsx
import { Tooltip } from "@/components/snn/tooltip/tooltip";

<Tooltip content="Dışa aktar"><Button>⇩</Button></Tooltip>
```

### Sekmeler (`tabs`)

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/snn/tabs/tabs";

<Tabs defaultValue="ozet"><TabsList><TabsTrigger value="ozet">Özet</TabsTrigger></TabsList><TabsContent value="ozet">…</TabsContent></Tabs>
```

### Kart (`card`)

```tsx
import { Card } from "@/components/snn/card/card";

<Card title="Teklif 12" description="Taslak" />
```

### Bildirim balonu (`toast`)

```tsx
import { default as Toast } from "@/components/snn/toast/toast";

<Toast title="Kaydedildi" />
```

### Boş durum (`empty-state`)

```tsx
import { EmptyState } from "@/components/snn/empty-state/empty-state";

<EmptyState title="Henüz teklif yok" description="İlk teklifi oluşturun." />
```

### Yükleniyor iskeleti (`skeleton`)

```tsx
import { Skeleton } from "@/components/snn/skeleton/skeleton";

<Skeleton lines={3} />
```

### Sayfalama (`pagination`)

```tsx
import { Pagination } from "@/components/snn/pagination/pagination";

<Pagination page={page} pageCount={12} onPageChange={setPage} />
```

### Arama kutusu (`search-field`)

```tsx
import { SearchField } from "@/components/snn/search-field/search-field";

<SearchField label="Ara" value={query} onValueChange={setQuery} />
```

## Bu rafta olmayanlar

| Ad | Neden | Ne zaman |
|---|---|---|
| `metric-card` | Arc'ta `animated-counter` ile gelir; o da `Intl.NumberFormat` ve varsayılan `en-US` biçimi kullanır (`1,234`). | 2. raf, ABACUS ile |
| `money-input`, `number-field`, `phone-input`, `date-picker`, `sortable-data-table`, grafikler | B sınıfı: yasak biçim çağrısı içerir. | 2. raf, ABACUS ile |
