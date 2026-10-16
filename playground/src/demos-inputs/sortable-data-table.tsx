// sortable-data-table örneği. Projeler ve tutarlar uydurmadır; tutarlar kuruş tam sayısıdır.
import { useState } from "react";
import { SortableDataTable } from "../../../registry/components/sortable-data-table/sortable-data-table";
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

export function SortableDataTableDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="col">
      <span className="etiket">Başlığa basınca sıralanır (İl sütununda Türkçe sıra: Çorum, Iğdır, İzmir, Şanlıurfa). Satıra basınca seçilir; Shift ile aralık, Escape temizler. 390 px'te her kayıt bir kart olur.</span>
      <SortableDataTable caption="Projeler" rows={ROWS} columns={COLUMNS} rowKey="id" pageSize={8} selectable selectedKeys={selected} onSelectionChange={setSelected} itemName={{ one: "proje", other: "proje" }} defaultSort={{ key: "amount", direction: "desc" }} />
      <span className="etiket">Boş tablo</span>
      <SortableDataTable caption="Boş liste" rows={[] as Row[]} columns={COLUMNS} rowKey="id" emptyMessage="Bu süzgeçle eşleşen proje yok" />
    </div>
  );
}
