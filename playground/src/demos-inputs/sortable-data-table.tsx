// sortable-data-table örneği. Projeler ve tutarlar uydurmadır; tutarlar kuruş tam sayısıdır.
import { useState } from "react";
import type { CSSProperties } from "react";
import { SortableDataTable } from "../../../registry/components/sortable-data-table/sortable-data-table";
import { Input } from "../../../registry/components/input/input";
import { Select } from "../../../registry/components/select/select";
import { NumberInput } from "../../../registry/components/number-input/number-input";
import type { DataColumn } from "../../../registry/components/sortable-data-table/sortable-data-table";

type Row = { id: string; name: string; city: string; amount: number; progress: number; startDate: string };

const NAMES = ["Çevre yolu", "İçme suyu hattı", "Okul binası", "Işıklandırma", "Atık su arıtma", "Spor salonu", "Köprü onarımı", "Doğalgaz hattı", "Ulaşım durağı", "Kütüphane", "Otopark", "Sağlık ocağı"];
const CITIES = ["İzmir", "Çorum", "Iğdır", "Ankara", "Şanlıurfa", "Bursa", "Ordu"];

/** Uydurma 24 satır; tarih ISO gün, tutar kuruş. */
const ROWS: Row[] = Array.from({ length: 24 }, (_, at) => ({
  id: `p${at + 1}`,
  name: `${NAMES[at % NAMES.length]}${at >= NAMES.length ? " (2. etap)" : ""}`,
  city: CITIES[(at * 3) % CITIES.length]!,
  amount: 1_250_000_00 + ((at * 7919) % 97) * 3_456_789 + (at % 3) * 75,
  progress: Math.round(((at * 37) % 100) * 10) / 10,
  startDate: `2026-${String(1 + (at % 9)).padStart(2, "0")}-${String(3 + ((at * 5) % 25)).padStart(2, "0")}`,
}));

const COLUMNS: DataColumn<Row>[] = [
  { key: "name", label: "Proje" },
  { key: "amount", label: "Tutar", format: "money" },
  { key: "city", label: "İl" },
  { key: "progress", label: "Gerçekleşme (%)", format: "number", digits: 1 },
  { key: "startDate", label: "Başlangıç", format: "date" },
];

type Person = { id: string; name: string; email: string; role: string; active: boolean };

/** Uydurma kişiler; pasif olan satır soluk çizilir. */
const PEOPLE: Person[] = [
  { id: "u1", name: "Elif Yıldız", email: "elif.yildiz@ornek.com.tr", role: "Yönetici", active: true },
  { id: "u2", name: "Mert Şahin", email: "mert.sahin@ornek.com.tr", role: "Muhasebe", active: false },
  { id: "u3", name: "Zeynep Çelik", email: "zeynep.celik@ornek.com.tr", role: "Saha", active: true },
  { id: "u4", name: "İsmail Yılmaz", email: "ismail.yilmaz@ornek.com.tr", role: "Saha", active: false },
];

const PEOPLE_COLUMNS: DataColumn<Person>[] = [
  { key: "name", label: "Ad" },
  { key: "email", label: "E-posta" },
  { key: "role", label: "Rol" },
  { key: "active", label: "Durum", render: value => (value ? "Aktif" : "Pasif") },
];

type Item = { id: string; name: string; unit: string; quantity: number | null; vat: string };

const UNITS = [{ value: "adet", label: "Adet" }, { value: "m2", label: "m²" }, { value: "kg", label: "kg" }];
const VATS = [{ value: "0", label: "%0" }, { value: "10", label: "%10" }, { value: "20", label: "%20" }];
/** Sık yoğunluk: satır 38 px, başlık 34 px; değişkenler tablonun bir atasına verilir. */
const DENSE = { "--table-row-height": "38px", "--table-head-height": "34px", "--table-font-size": "var(--text-xs)" } as CSSProperties;

/** Hücresinde alan olan sık tablo: etiketler görünmez (hideLabel), alanlar alçak (size="sm"). */
function EditableDenseTable() {
  const [items, setItems] = useState<Item[]>([
    { id: "k1", name: "Beton C30", unit: "m2", quantity: 1250.5, vat: "20" },
    { id: "k2", name: "İnşaat demiri", unit: "kg", quantity: 48000, vat: "20" },
    { id: "k3", name: "Kapı", unit: "adet", quantity: null, vat: "10" },
  ]);
  const patch = (id: string, change: Partial<Item>) => setItems(list => list.map(item => (item.id === id ? { ...item, ...change } : item)));
  const columns: DataColumn<Item>[] = [
    { key: "name", label: "Kalem", sortable: false, render: (_, row) => <Input size="sm" hideLabel label={`Kalem adı, satır ${row.id}`} value={row.name} onChange={event => patch(row.id, { name: event.currentTarget.value })} /> },
    { key: "unit", label: "Birim", sortable: false, render: (_, row) => <Select native size="sm" hideLabel label={`Birim: ${row.name}`} value={row.unit} options={UNITS} onValueChange={unit => patch(row.id, { unit })} /> },
    { key: "quantity", label: "Miktar", numeric: true, sortable: false, render: (_, row) => <NumberInput size="sm" hideLabel steppers={false} label={`Miktar: ${row.name}`} value={row.quantity} min={0} formatOptions={{ maximumFractionDigits: 2 }} placeholder="Boş" onValueChange={quantity => patch(row.id, { quantity })} /> },
    { key: "vat", label: "KDV", sortable: false, render: (_, row) => <Select size="sm" hideLabel label={`KDV oranı: ${row.name}`} value={row.vat} options={VATS} onValueChange={vat => patch(row.id, { vat })} /> },
  ];
  return <div style={DENSE}><SortableDataTable caption="Keşif kalemleri" rows={items} columns={columns} rowKey="id" /></div>;
}

export function SortableDataTableDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  const [opened, setOpened] = useState("Henüz bir satır açılmadı");
  return (
    <div className="col">
      <span className="etiket">Başlığa basınca sıralanır (İl sütununda Türkçe sıra: Çorum, Iğdır, İzmir, Şanlıurfa). Satıra basınca seçilir; Shift ile aralık, Escape temizler. 390 px'te her kayıt bir kart olur.</span>
      <SortableDataTable caption="Projeler" rows={ROWS} columns={COLUMNS} rowKey="id" pageSize={8} selectable selectedKeys={selected} onSelectionChange={setSelected} itemName={{ one: "proje", other: "proje" }} defaultSort={{ key: "amount", direction: "desc" }} />
      <span className="etiket">Satıra tıklayınca ya da Tab ile satıra gelip Enter'a basınca ayrıntı açılır (onRowClick). Pasif kişiler soluk (rowClassName).</span>
      <SortableDataTable caption="Kullanıcılar" rows={PEOPLE} columns={PEOPLE_COLUMNS} rowKey="id" onRowClick={person => setOpened(`Açılan: ${person.name}`)} rowClassName={person => (person.active ? undefined : "soluk-satir")} />
      <span className="etiket" role="status">{opened}</span>
      <span className="etiket">Sık yoğunluk (--table-row-height: 38px, --table-head-height: 34px, --table-font-size) ve hücrede alanlar: Input, tarayıcının kendi seçim kutusu (native), Radix seçim kutusu, boş değer taşıyabilen NumberInput.</span>
      <EditableDenseTable />
      <span className="etiket">Boş tablo</span>
      <SortableDataTable caption="Boş liste" rows={[] as Row[]} columns={COLUMNS} rowKey="id" emptyMessage="Bu süzgeçle eşleşen proje yok" />
    </div>
  );
}
