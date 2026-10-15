// metrics-dashboard örneği. Satış verisi uydurmadır; tarih etiketleri ABACUS ile yazılır (son gün 2026-10-18).
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { MetricsDashboard } from "../../../registry/components/metrics-dashboard/metrics-dashboard";
import type { DashboardData, DashboardPoint } from "../../../registry/components/metrics-dashboard/metrics-dashboard";

const PERIODS = [{ value: "7", label: "7 gün" }, { value: "30", label: "30 gün" }, { value: "90", label: "90 gün" }];
const LAST = Date.UTC(2026, 9, 18);
const DAY = 86400000;

/** Gün gün seri; 90 günde haftalık toplanmış nokta. `scale` dönemin büyüklük farkını verir. */
function series(days: number, base: number, wave: number, trend: number, shift: number): DashboardPoint[] {
  const step = days > 60 ? 7 : 1;
  const count = Math.floor(days / step);
  return Array.from({ length: count }, (_, at) => {
    const dayIndex = (count - 1 - at) * step;
    const iso = new Date(LAST - dayIndex * DAY).toISOString().slice(0, 10);
    const make = (offset: number) => base * (1 + trend * (at + offset) / count) * (1 + wave * Math.sin((at + offset) * .9));
    return {
      key: iso, label: step === 1 ? date.format(iso, "dayMonthWeekday") : `${date.format(iso, "dayMonth")} haftası`,
      axisLabel: count <= 10 ? date.dayName(iso) : at % Math.ceil(count / 6) === 0 ? date.format(iso, "dayMonth") : undefined,
      value: Math.round(make(0) * 10) / 10, previous: Math.round(make(shift) * 0.93 * 10) / 10,
    };
  });
}

function build(days: number): DashboardData {
  const sum = (points: DashboardPoint[]) => points.reduce((total, point) => total + point.value, 0);
  const prevSum = (points: DashboardPoint[]) => points.reduce((total, point) => total + (point.previous ?? 0), 0);
  const avg = (points: DashboardPoint[]) => sum(points) / points.length;
  const prevAvg = (points: DashboardPoint[]) => prevSum(points) / points.length;
  const revenue = series(days, 18500, .12, .18, 2), orders = series(days, 142, .1, .15, 1), conversion = series(days, 3.1, .06, .08, 3), cancel = series(days, 2.4, .1, -.1, 2);
  return {
    metrics: [
      { key: "ciro", label: "Ciro", kind: "money", value: Math.round(sum(revenue)), previous: Math.round(prevSum(revenue)), series: revenue },
      { key: "siparis", label: "Sipariş", kind: "count", value: Math.round(sum(orders)), previous: Math.round(prevSum(orders)), series: orders },
      { key: "donusum", label: "Dönüşüm", kind: "percent", value: Math.round(avg(conversion) * 10) / 10, previous: Math.round(prevAvg(conversion) * 10) / 10, series: conversion },
      { key: "iptal", label: "İptal oranı", kind: "percent", value: Math.round(avg(cancel) * 10) / 10, previous: Math.round(prevAvg(cancel) * 10) / 10, lowerIsBetter: true, series: cancel },
    ],
    lists: [
      { key: "urun", title: "En çok bakılanlar", valueLabel: "Ziyaretçi", items: [["Mavi çanta", 5200], ["Deri cüzdan", 4310], ["Yün atkı", 3180], ["Spor ayakkabı", 2640], ["Kahve seti", 1980]].map(([label, value], at) => ({ key: String(at), label: String(label), value: Math.round(Number(value) * days / 30) })) },
      { key: "kaynak", title: "Kaynaklar", valueLabel: "Ziyaretçi", items: [["Arama motoru", 9800], ["Doğrudan", 6100], ["Sosyal medya", 3900], ["E-posta", 2200], ["Yönlendiren site", 1100]].map(([label, value], at) => ({ key: String(at), label: String(label), value: Math.round(Number(value) * days / 30) })) },
    ],
  };
}

export function MetricsDashboardDemo() {
  const [period, setPeriod] = useState("30");
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  const data = useMemo(() => build(Number(period)), [period]);
  return (
    <div className="col">
      <span className="etiket">Dönemi değiştirin: değerler, grafik ve listeler yeni döneme geçer. Göstergeye basın (ya da ok tuşlarıyla gezin), "Karşılaştır" önceki dönemi ekler. İptal oranında azalış olumlu sayılır.</span>
      <div className="row">
        <label><input type="radio" name="dash-durum" checked={status === "ready"} onChange={() => setStatus("ready")} /> Veri</label>
        <label><input type="radio" name="dash-durum" checked={status === "loading"} onChange={() => setStatus("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="dash-durum" checked={status === "error"} onChange={() => setStatus("error")} /> Hata</label>
      </div>
      <MetricsDashboard title="Satış özeti" subtitle={`Mağaza verisi · Son ${period} gün`} periods={PERIODS} period={period} onPeriodChange={setPeriod} data={data} status={status} onRetry={() => setStatus("ready")} onExport={() => undefined} />
    </div>
  );
}
