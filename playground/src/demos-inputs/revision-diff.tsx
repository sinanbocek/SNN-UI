// revision-diff örneği. Keşif kalemleri ve tutarlar uydurmadır; tutar kuruş tam sayısıdır. Eşleştirme burada elle yazıldı (projede proje yapar).
import { RevisionDiff } from "../../../registry/components/revision-diff/revision-diff";
import type { RevisionField, RevisionRow } from "../../../registry/components/revision-diff/revision-diff";

const FIELDS: RevisionField[] = [
  { key: "name", label: "Kalem" },
  { key: "qty", label: "Miktar", digits: 2 },
  { key: "unit", label: "Birim" },
  { key: "amount", label: "Tutar", format: "money" },
  { key: "due", label: "Termin", format: "date" },
];

const ROWS: RevisionRow[] = [
  { key: "15.150.1003", status: "changed", before: { name: "C30/37 hazır beton", qty: 412.5, unit: "m³", amount: 1_031_250_00, due: "2026-11-02" }, after: { name: "C30/37 hazır beton", qty: 438, unit: "m³", amount: 1_095_000_00, due: "2026-11-16" } },
  { key: "15.160.1003", status: "changed", before: { name: "Nervürlü demir Ø12", qty: 38.2, unit: "ton", amount: 916_800_00, due: "2026-10-28" }, after: { name: "Nervürlü demir Ø12", qty: 38.2, unit: "ton", amount: 955_000_00, due: "2026-10-28" } },
  { key: "15.250.1011", status: "added", after: { name: "Su yalıtımı (bitümlü örtü)", qty: 640, unit: "m²", amount: 268_800_00 } },
  { key: "15.275.1101", status: "removed", before: { name: "Ahşap kalıp", qty: 1200, unit: "m²", amount: 456_000_00 } },
  { key: "Ö-07", status: "unmatched", after: { name: "Şantiye aydınlatması", qty: 1, unit: "götürü", amount: 85_000_00 }, note: "Poz numarası yok; elle eşleyin" },
  { key: "15.140.1201", status: "same", before: { name: "Kazı (makine ile)", qty: 2150, unit: "m³", amount: 193_500_00 }, after: { name: "Kazı (makine ile)", qty: 2150, unit: "m³", amount: 193_500_00 } },
];

export function RevisionDiffDemo() {
  return (
    <div className="col">
      <span className="etiket">Süzgeç düğmeleri satırları süzer; "Aynı" seçilince değişmeyen satırlar da görünür. Değişen satırda yalnız değişen alanlar "eski → yeni" yazılır.</span>
      <RevisionDiff title="Keşif revizyonu: Rev. 2 → Rev. 3" rows={ROWS} fields={FIELDS} />
    </div>
  );
}
