// status-card, grouped-table ve tree-view örnekleri (Piyasa-Core geri bildirimi, issue #26). Veriler uydurmadır.
import { useState, type ReactNode } from "react";
import { money } from "@snn/abacus-core";
import { StatusCard, type StatusTone } from "../../../registry/components/status-card/status-card";
import { GroupedTable, type GroupedTableGroup } from "../../../registry/components/grouped-table/grouped-table";
import { TreeView, type TreeNode } from "../../../registry/components/tree-view/tree-view";
import { SearchField } from "../../../registry/components/search-field/search-field";
import { Button } from "../../../registry/components/button/button";
import { Badge } from "../../../registry/components/badge/badge";

const STATES: { tone: StatusTone; value: string; context: string }[] = [
  { tone: "success", value: "Sorun yok", context: "29 seriden 29'u güncel" },
  { tone: "warning", value: "Kontrol gerekli", context: "3 seri 2 gündür güncellenmedi" },
  { tone: "danger", value: "Bağlantı kurulamadı", context: "Kaynak 09:42'den beri yanıt vermiyor" },
];

function StatusCardDemo() {
  const [index, setIndex] = useState(0);
  const state = STATES[index]!;
  return <div className="col">
    <span className="etiket">Değer metindir; ton renk, simge ve etiketle birlikte söylenir. Uyarı tonu mavi-gridir.</span>
    <div className="row" style={{ alignItems: "stretch" }}>
      <StatusCard label="Veri akışı" value={state.value} tone={state.tone} context={state.context} live />
      <StatusCard label="Son yedek" value="Bugün 03:00" tone="neutral" context="Bir sonraki: yarın 03:00" />
    </div>
    <div className="row"><Button size="sm" onClick={() => setIndex((index + 1) % STATES.length)}>Durumu değiştir</Button></div>
  </div>;
}

type Series = { code: string; name: string; source: string; last: string; value: number; state: "ok" | "late" | "error" };
const SERIES: GroupedTableGroup<Series>[] = [
  { key: "fx", title: "Döviz", status: { tone: "success", label: "Güncel" }, rows: [
    { code: "USDTRY", name: "ABD doları", source: "TCMB", last: "17 Ekim", value: 49.47, state: "ok" },
    { code: "EURTRY", name: "Avro", source: "TCMB", last: "17 Ekim", value: 57.62, state: "ok" },
    { code: "GBPTRY", name: "İngiliz sterlini", source: "TCMB", last: "17 Ekim", value: 66.05, state: "ok" },
  ] },
  { key: "metal", title: "Değerli maden", status: { tone: "warning", label: "1 gecikme" }, rows: [
    { code: "XAUTRY", name: "Altın (gram)", source: "Kapalıçarşı", last: "17 Ekim", value: 5412.3, state: "ok" },
    { code: "XAGTRY", name: "Gümüş (gram)", source: "Kapalıçarşı", last: "15 Ekim", value: 64.18, state: "late" },
  ] },
  { key: "index", title: "Endeks", status: { tone: "danger", label: "1 hata" }, rows: [
    { code: "XU100", name: "BIST 100", source: "Borsa İstanbul", last: "17 Ekim", value: 10284.5, state: "ok" },
    { code: "TUFE", name: "Tüketici fiyat endeksi", source: "TÜİK", last: "3 Ekim", value: 3412.07, state: "error" },
  ] },
];
const stateBadge: Record<Series["state"], ReactNode> = { ok: <Badge tone="success" size="sm">Güncel</Badge>, late: <Badge tone="warning" size="sm">Gecikti</Badge>, error: <Badge tone="danger" size="sm">Hata</Badge> };

function GroupedTableDemo() {
  const [query, setQuery] = useState("");
  return <div className="col" style={{ minWidth: 0 }}>
    <span className="etiket">Grup başlığına basın. Arama yazınca gruplar açılır; "istanbul" "İstanbul"u bulur. Dar ekranda kaynak ve tarih sütunları gizlenir.</span>
    <div style={{ maxWidth: 320 }}><SearchField label="Seri ara" placeholder="Kod, ad ya da kaynak" value={query} onValueChange={setQuery} /></div>
    <GroupedTable caption="Piyasa serileri" groups={SERIES} rowKey={row => row.code} query={query} defaultExpanded={["fx"]}
      searchText={row => `${row.code} ${row.name} ${row.source}`}
      columns={[
        { key: "code", header: "Kod", width: "18%", render: row => <code>{row.code}</code> },
        { key: "name", header: "Ad" },
        { key: "source", header: "Kaynak", optional: true },
        { key: "last", header: "Son veri", optional: true, width: "16%" },
        { key: "value", header: "Değer", numeric: true, width: "18%", render: row => money.fmtDecimalGrouped(row.value, 2) },
        { key: "state", header: "Durum", width: "14%", render: row => stateBadge[row.state] },
      ]} />
  </div>;
}

/** TÜFE sınıflamasına benzeyen küçük ağaç; ağırlıklar uydurmadır. */
const CPI: TreeNode[] = [
  { id: "01", label: "Gıda ve alkolsüz içecekler", meta: "%24,25", children: [
    { id: "01.1", label: "Gıda", meta: "%21,90", children: [
      { id: "01.1.1", label: "Ekmek ve tahıllar", meta: "%5,12", children: [{ id: "01.1.1.1", label: "Pirinç", meta: "%0,61" }, { id: "01.1.1.2", label: "Un", meta: "%0,48" }, { id: "01.1.1.3", label: "Ekmek", meta: "%2,30" }, { id: "01.1.1.4", label: "Makarna", meta: "%0,55" }] },
      { id: "01.1.2", label: "Et", meta: "%4,05", children: [{ id: "01.1.2.1", label: "Dana eti", meta: "%1,92" }, { id: "01.1.2.2", label: "Tavuk eti", meta: "%1,40" }] },
      { id: "01.1.4", label: "Süt, peynir ve yumurta", meta: "%3,64", children: [{ id: "01.1.4.1", label: "Süt", meta: "%0,95" }, { id: "01.1.4.2", label: "Beyaz peynir", meta: "%1,10" }, { id: "01.1.4.3", label: "Yumurta", meta: "%0,70" }] },
      { id: "01.1.7", label: "Sebzeler", meta: "%3,20", children: [{ id: "01.1.7.1", label: "Domates", meta: "%0,88" }, { id: "01.1.7.2", label: "Patates", meta: "%0,52" }, { id: "01.1.7.3", label: "Soğan", meta: "%0,37" }] },
    ] },
    { id: "01.2", label: "Alkolsüz içecekler", meta: "%2,35", children: [{ id: "01.2.1", label: "Çay ve kahve", meta: "%1,05" }, { id: "01.2.2", label: "Maden suyu", meta: "%0,41" }] },
  ] },
  { id: "04", label: "Konut", meta: "%15,20", children: [
    { id: "04.1", label: "Gerçek kira", meta: "%6,80" },
    { id: "04.5", label: "Elektrik, gaz ve diğer yakıtlar", meta: "%5,10", children: [{ id: "04.5.1", label: "Elektrik", meta: "%2,40" }, { id: "04.5.2", label: "Doğalgaz", meta: "%2,15" }] },
  ] },
  { id: "07", label: "Ulaştırma", meta: "%17,05", children: [
    { id: "07.1", label: "Araç satın alımı", meta: "%6,30" },
    { id: "07.2", label: "Kişisel ulaştırma araçlarının kullanımı", meta: "%7,25", children: [{ id: "07.2.2", label: "Akaryakıt", meta: "%4,90" }] },
    { id: "07.3", label: "Ulaştırma hizmetleri", meta: "%3,50" },
  ] },
];

function TreeViewDemo() {
  const [chosen, setChosen] = useState<TreeNode | null>(null);
  return <div className="col" style={{ minWidth: 0 }}>
    <span className="etiket">Ok alt kalemleri açar, ad seçer. "sut" ya da "çay" arayın: eşleşmenin bütün üstleri açılır.</span>
    <div style={{ maxWidth: 520 }}><TreeView label="TÜFE sınıflaması" nodes={CPI} defaultExpanded={["01"]} onSelect={setChosen} /></div>
    <span className="durum">{chosen ? `Seçili: ${chosen.id} ${chosen.label} (${chosen.meta ?? "ağırlık yok"})` : "Henüz seçim yok."}</span>
  </div>;
}

export const dataDemos: Record<string, () => ReactNode> = {
  "status-card": () => <StatusCardDemo />,
  "grouped-table": () => <GroupedTableDemo />,
  "tree-view": () => <TreeViewDemo />,
};
