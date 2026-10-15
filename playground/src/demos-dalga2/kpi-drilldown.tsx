// kpi-drilldown örneği. Rakamlar uydurmadır (SaaS tarzı bir yönetim özeti); her dönem aynı sayıda noktaya örneklenir.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { KpiDrilldown } from "../../../registry/components/kpi-drilldown/kpi-drilldown";
import type { DrillMetric, DrillPoint, DrillRow } from "../../../registry/components/kpi-drilldown/kpi-drilldown";

const PERIODS = [{ value: "7", label: "7 gün" }, { value: "30", label: "30 gün" }, { value: "90", label: "90 gün" }];
const LAST = Date.UTC(2026, 9, 18);
const DAY = 86400000;
const POINTS = 14;

function makeSeries(days: number, base: number, wave: number, trend: number, decimals: number): DrillPoint[] {
  const step = days / POINTS;
  return Array.from({ length: POINTS }, (_, at) => {
    const iso = new Date(LAST - Math.round((POINTS - 1 - at) * step) * DAY).toISOString().slice(0, 10);
    const make = (shift: number) => base * (1 + trend * (at - shift) / POINTS) * (1 + wave * Math.sin((at - shift) * 1.1));
    const round = (value: number) => Math.round(value * 10 ** decimals) / 10 ** decimals;
    return { key: iso, label: date.format(iso, "long"), axisLabel: at % 3 === 0 ? date.format(iso, "dayMonth") : undefined, value: round(make(0)), previous: round(make(POINTS * .6) * .94) };
  });
}

function rows(total: number, parts: [string, number][], decimals = 0): DrillRow[] {
  const sum = parts.reduce((acc, [, weight]) => acc + weight, 0);
  return parts.map(([label, weight], at) => ({ key: String(at), label, value: Math.round(total * weight / sum * 10 ** decimals) / 10 ** decimals, previous: Math.round(total * weight / sum * (0.88 + at * .05) * 10 ** decimals) / 10 ** decimals }));
}

function build(days: number): DrillMetric[] {
  const last = (points: DrillPoint[]) => points[points.length - 1]!;
  const make = (key: string, label: string, kind: DrillMetric["kind"], base: number, wave: number, trend: number, decimals: number, description: string, extra: Partial<DrillMetric> = {}): DrillMetric => {
    const series = makeSeries(days, base, wave, trend, decimals);
    const value = last(series).value, previous = last(series).previous;
    const plan = kind === "percent" ? rows(value, [["Başlangıç", 3], ["Pro", 4], ["Kurumsal", 5]], 1) : rows(value, [["Başlangıç", 5], ["Pro", 3], ["Kurumsal", 2]]);
    const region = kind === "percent" ? rows(value, [["Marmara", 5], ["Ege", 4], ["İç Anadolu", 4], ["Diğer", 3]], 1) : rows(value, [["Marmara", 4], ["Ege", 2.5], ["İç Anadolu", 2], ["Diğer", 1.5]]);
    return { key, label, kind, value, previous, description, series, breakdowns: [{ key: "plan", label: "Plana göre", rows: plan }, { key: "bolge", label: "Bölgeye göre", rows: region }], ...extra };
  };
  return [
    make("gelir", "Aylık gelir", "money", 842000, .05, .12, 0, "Aktif abonelerden o ay tahsil edilen toplam tutar."),
    make("hesap", "Hesap sayısı", "count", 3180, .02, .08, 0, "Dönem sonunda aktif olan hesapların sayısı."),
    make("tutma", "Elde tutma", "percent", 91.4, .01, .01, 1, "Dönem başındaki hesapların sonunda hâlâ aktif olanları."),
    make("donusum", "Dönüşüm", "percent", 3.8, .06, .05, 1, "Deneme kullanıcılarının ücretli plana geçme oranı."),
    make("hesapbasi", "Hesap başına gelir", "money", 265, .03, .04, 0, "Aylık gelirin hesap sayısına bölümü."),
    make("kayip", "Kayıp oranı", "percent", 2.1, .08, -.06, 1, "Dönem içinde iptal eden hesapların payı. Düşmesi iyidir.", { lowerIsBetter: true }),
  ];
}

export function KpiDrilldownDemo() {
  const [period, setPeriod] = useState("30");
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  const metrics = useMemo(() => build(Number(period)), [period]);
  return (
    <div className="col">
      <span className="etiket">Karta basın (ya da Enter): kart aynı yüzeyin büyümesiyle ayrıntıya açılır; Esc ya da "Kapat" aynı karta geri katlar. "Karşılaştır" önceki dönem çizgisini ekler; ayrıntıda kırılım boyutu değişir. Kapta daralınca sütun sayısı azalır.</span>
      <div className="row">
        <label><input type="radio" name="kpi-durum" checked={status === "ready"} onChange={() => setStatus("ready")} /> Veri</label>
        <label><input type="radio" name="kpi-durum" checked={status === "loading"} onChange={() => setStatus("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="kpi-durum" checked={status === "error"} onChange={() => setStatus("error")} /> Hata</label>
      </div>
      <KpiDrilldown metrics={metrics} periods={PERIODS} period={period} onPeriodChange={setPeriod} status={status} onRetry={() => setStatus("ready")} />
    </div>
  );
}
