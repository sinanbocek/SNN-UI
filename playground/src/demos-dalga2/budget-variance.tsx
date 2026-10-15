// budget-variance örneği. Bölüm adları, kişiler ve tutarlar uydurmadır; dönem açıklamaları ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { BudgetVariance } from "../../../registry/components/budget-variance/budget-variance";
import type { VarianceDepartment } from "../../../registry/components/budget-variance/budget-variance";

const PERIODS = [{ value: "month", label: "Ay" }, { value: "quarter", label: "Çeyrek" }, { value: "ytd", label: "Yıl başından beri" }];
const SCALE: Record<string, number> = { month: 1, quarter: 3, ytd: 9 };
const SUBTITLE: Record<string, string> = { month: `${date.monthName(9)} 2026`, quarter: "3. çeyrek 2026", ytd: `${date.format("2026-01-01", "long")} – ${date.format("2026-09-30", "long")}` };

/** [ad, sorumlu, kalemler: [ad, bütçe, gerçekleşen oranı]] — oranlar bütçeye göre sapmayı belirler. */
const DEPARTMENTS: [string, string, [string, number, number][]][] = [
  ["Satış ve pazarlama", "Elif Aksoy", [["Reklam", 220000, 1.14], ["Etkinlik", 90000, .93], ["Komisyon", 310000, 1.06]]],
  ["Üretim", "Barış Yıldız", [["Hammadde", 640000, 1.02], ["İşçilik", 520000, 1.0], ["Bakım", 140000, 1.31]]],
  ["Bilgi işlem", "Deniz Korkmaz", [["Bulut hizmetleri", 160000, .91], ["Lisanslar", 85000, .98], ["Donanım", 120000, .72]]],
  ["İnsan kaynakları", "Cem Arslan", [["Eğitim", 70000, .81], ["Yan haklar", 180000, 1.01]]],
  ["Genel yönetim", "Seda Polat", [["Kira", 260000, 1.0], ["Hukuk ve danışmanlık", 110000, 1.22]]],
];

function build(period: string): VarianceDepartment[] {
  const factor = SCALE[period]!;
  return DEPARTMENTS.map(([name, owner, items], at) => ({
    key: String(at), name, owner,
    items: items.map(([itemName, budget, ratio], index) => ({ key: `${at}-${index}`, name: itemName, budget: budget * factor, actual: Math.round(budget * factor * (ratio + (period === "quarter" ? .015 * index : period === "ytd" ? -.01 * index : 0))) })),
  }));
}

export function BudgetVarianceDemo() {
  const [period, setPeriod] = useState("month");
  const [status, setStatus] = useState<"ready" | "loading" | "error" | "empty">("ready");
  const departments = useMemo(() => status === "empty" ? [] : build(period), [period, status]);
  return (
    <div className="col">
      <span className="etiket">Bir bölüme basın (ya da odaklanıp Enter / Boşluk, yukarı-aşağı ok, Home / End): kalemleri açılır, aynı anda tek bölüm açık kalır. Çubuk bütçe işaretini aşarsa aşan kısım kırmızıdır; işaret her satırda aynı hizadadır. Dönemi değiştirince tutarlar sayarak yeni değere gider.</span>
      <div className="row">
        <label><input type="radio" name="butce-durum" checked={status === "ready"} onChange={() => setStatus("ready")} /> Veri</label>
        <label><input type="radio" name="butce-durum" checked={status === "loading"} onChange={() => setStatus("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="butce-durum" checked={status === "error"} onChange={() => setStatus("error")} /> Hata</label>
        <label><input type="radio" name="butce-durum" checked={status === "empty"} onChange={() => setStatus("empty")} /> Boş</label>
      </div>
      <BudgetVariance title="Bütçe sapması" subtitle={SUBTITLE[period]} departments={departments} periods={PERIODS} period={period} onPeriodChange={setPeriod} scale={1.5}
        status={status === "empty" ? "ready" : status} onRetry={() => setStatus("ready")} />
    </div>
  );
}
