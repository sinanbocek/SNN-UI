// race-bar-chart örneği. Müşteri cirosu uydurmadır (belirli bir tohumla üretilir); dönem adları ABACUS ile yazılır.
import { useMemo } from "react";
import { date } from "@snn/abacus-core";
import { RaceBarChart } from "../../../registry/components/race-bar-chart/race-bar-chart";

const CUSTOMERS: [string, string, number, number][] = [
  ["Aksoy İnşaat", "İnşaat", 420, 1.09], ["Boran Lojistik", "Lojistik", 380, 1.12], ["Çelik Yapı", "İnşaat", 350, 1.05], ["Demir Gıda", "Gıda", 330, 1.1],
  ["Ege Tekstil", "Tekstil", 310, 1.07], ["Fidan Market", "Gıda", 290, 1.14], ["Güneş Enerji", "Enerji", 250, 1.18], ["Hamle Turizm", "Turizm", 230, 1.11],
  ["Işık Mobilya", "Tekstil", 210, 1.06], ["Kaya Madencilik", "Enerji", 190, 1.2], ["Lale Otelcilik", "Turizm", 170, 1.15], ["Mavi Nakliyat", "Lojistik", 150, 1.13],
];

/** Aylık ciro (bin TRY); her ay başlangıç değerinin yıllık büyüme çarpanına göre artar, küçük bir dalgayla. */
function build() {
  const periods = Array.from({ length: 12 }, (_, month) => ({ key: String(month + 1), label: `${date.monthName(month + 1)} 2026` }));
  const items = CUSTOMERS.map(([label, group, base, growth], index) => ({
    key: label, label, group,
    values: periods.map((_, month) => Math.round(base * 1000 * growth ** (month / 3) * (1 + Math.sin(month * 1.3 + index) * .06))),
  }));
  return { periods, items };
}

export function RaceBarChartDemo() {
  const { periods, items } = useMemo(build, []);
  return (
    <div className="col">
      <span className="etiket">Görünüme girince kendiliğinden oynar. Boşluk oynatır ya da duraklatır, sol ve sağ ok dönemi değiştirir, yukarı ve aşağı ok sırada gezinir; kaydırıcı istenen aya götürür. "Hareketi azalt" açıkken oynamaz, aylar ara değersiz atlar.</span>
      <RaceBarChart label="Müşteriye göre aylık ciro" description="2026, ilk sekiz müşteri" periods={periods} items={items} topN={8} kind="money" />
    </div>
  );
}
