// metric-explorer örneği. Rakamlar uydurmadır: nakit yönetimi göstergeleri; tarihler ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { MetricExplorer } from "../../../registry/components/metric-explorer/metric-explorer";
import type { ExplorerMetric, ExplorerPoint } from "../../../registry/components/metric-explorer/metric-explorer";

const PERIODS = [{ value: "7", label: "7 gün" }, { value: "30", label: "30 gün" }, { value: "90", label: "90 gün" }];
const LAST = Date.UTC(2026, 9, 18);
const DAY = 86400000;

function makeSeries(days: number, base: number, wave: number, trend: number): ExplorerPoint[] {
  return Array.from({ length: days }, (_, at) => {
    const iso = new Date(LAST - (days - 1 - at) * DAY).toISOString().slice(0, 10);
    return { key: iso, label: date.format(iso, "dayMonthWeekday"), axisLabel: days <= 10 ? date.dayName(iso) : at % Math.ceil(days / 6) === 0 ? date.format(iso, "dayMonth") : undefined, value: Math.round(base * (1 + trend * at / days) * (1 + wave * Math.sin(at * .7))) };
  });
}

function build(days: number): ExplorerMetric[] {
  const make = (key: string, label: string, kind: ExplorerMetric["kind"], base: number, wave: number, trend: number, extra: Partial<ExplorerMetric> = {}): ExplorerMetric => {
    const series = makeSeries(days, base, wave, trend);
    const previousBase = makeSeries(days, base * .93, wave, trend * .5);
    const value = series.reduce((sum, point) => sum + point.value, 0) / (kind === "count" ? series.length : 1);
    const previous = previousBase.reduce((sum, point) => sum + point.value, 0) / (kind === "count" ? series.length : 1);
    return { key, label, kind, value: Math.round(value), previous: Math.round(previous), series, ...extra };
  };
  return [
    make("gelir", "Gelir", "money", 41000, .08, .15),
    make("tahsilat", "Tahsilat", "money", 36500, .1, .1),
    make("hesap", "Aktif hesap", "count", 2410, .01, .04),
    make("maliyet", "Maliyet", "money", 18800, .06, -.05, { lowerIsBetter: true }),
  ];
}

export function MetricExplorerDemo() {
  const [period, setPeriod] = useState("30");
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  const metrics = useMemo(() => build(Number(period)), [period]);
  return (
    <div className="col">
      <span className="etiket">Karta basın: kart aynı yüzeyin büyümesiyle sekmeli grafik paneline dönüşür. Sekmeler ok tuşlarıyla gezilir; grafikte fareyle, dokunmayla ya da ok tuşlarıyla gezin, okuma satırı güncellenir. İlk Esc okunan noktayı bırakır, ikincisi paneli kapatır. Maliyette düşüş olumlu sayılır.</span>
      <div className="row">
        <label><input type="radio" name="expl-durum" checked={status === "ready"} onChange={() => setStatus("ready")} /> Veri</label>
        <label><input type="radio" name="expl-durum" checked={status === "loading"} onChange={() => setStatus("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="expl-durum" checked={status === "error"} onChange={() => setStatus("error")} /> Hata</label>
      </div>
      <MetricExplorer metrics={metrics} periods={PERIODS} period={period} onPeriodChange={setPeriod} status={status} onRetry={() => setStatus("ready")}
        updatedText={`Güncelleme: ${date.format("2026-10-18T09:40", "dateTime")}`} sourceText="Nakit yönetimi" />
    </div>
  );
}
