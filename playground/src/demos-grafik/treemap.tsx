// treemap örneği. Rakamlar uydurmadır; değerler ABACUS ile yazılır.
import { Treemap } from "../../../registry/components/treemap/treemap";
import type { TreemapNode } from "../../../registry/components/treemap/treemap";
import { formatMoneyCompact } from "../../../registry/components/lib/chart-format";
import { formatChange } from "../../../registry/components/lib/chart-format";

const data: TreemapNode = {
  id: "kok", label: "Toplam ciro", children: [
    { id: "marmara", label: "Marmara", children: [
      { id: "ist", label: "İstanbul", value: 5200000, color: 12 },
      { id: "koc", label: "Kocaeli", value: 1400000, color: 4 },
      { id: "bur", label: "Bursa", value: 1100000, color: -3 },
    ] },
    { id: "ic", label: "İç Anadolu", children: [
      { id: "ank", label: "Ankara", value: 2800000, color: 8 },
      { id: "kon", label: "Konya", value: 900000, color: 2 },
    ] },
    { id: "ege", label: "Ege", children: [
      { id: "izm", label: "İzmir", value: 2100000, color: 15 },
      { id: "man", label: "Manisa", value: 600000, color: -6 },
    ] },
    { id: "aky", label: "Akdeniz", children: [
      { id: "ant", label: "Antalya", value: 1500000, color: 6 },
      { id: "mer", label: "Mersin", value: 700000, color: 1 },
    ] },
  ],
};

export function TreemapDemo() {
  return (
    <div className="col">
      <span className="etiket">Bir bölgeye tıklayarak içine yakınlaşın, yol izinden geri dönün. Klavyede oklar kutular arasında gezer, Enter yakınlaştırır, Escape geri döner. Koyuluk büyümeyi gösterir.</span>
      <Treemap label="Bölgeye göre ciro" data={data} formatValue={value => formatMoneyCompact(value)} colorLabel="Büyüme" formatColor={value => formatChange(100 + value, 100, 0)} height={380} />
    </div>
  );
}
