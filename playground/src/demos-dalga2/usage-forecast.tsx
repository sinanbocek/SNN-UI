// usage-forecast örneği. Kullanım değerleri uydurmadır: 1 Eylül 2026'da başlayan 30 günlük fatura dönemi, 18 gün geçmiş.
import { useMemo, useState } from "react";
import { UsageForecast } from "../../../registry/components/usage-forecast/usage-forecast";

const MEASURES = [{ value: "requests", label: "İstek" }, { value: "storage", label: "Depolama" }, { value: "seats", label: "Koltuk" }];
const SETUP: Record<string, { base: number; wave: number; budget: number; unit: string; elapsed: number; overage?: { per: number; price: number } }> = {
  requests: { base: 1_450_000, wave: .22, budget: 38_000_000, unit: "istek", elapsed: 18, overage: { per: 1000, price: 0.45 } },
  storage: { base: 5200, wave: .12, budget: 120_000, unit: "MB", elapsed: 18, overage: { per: 1000, price: 3.2 } },
  seats: { base: 0.8, wave: .6, budget: 40, unit: "koltuk", elapsed: 18 },
};

function usage(key: string): number[] {
  const { base, wave, elapsed } = SETUP[key]!;
  let total = 0;
  return Array.from({ length: elapsed }, (_, at) => { total += base * (1 + .015 * at) * (1 + wave * Math.sin(at * 1.7)); return Math.round(total * 10) / 10; });
}

export function UsageForecastDemo() {
  const [measure, setMeasure] = useState("requests");
  const [budgets, setBudgets] = useState<Record<string, number>>({ requests: 38_000_000, storage: 120_000, seats: 40 });
  const [status, setStatus] = useState<"ready" | "loading" | "error" | "short">("ready");
  const setup = SETUP[measure]!;
  const used = useMemo(() => status === "short" ? usage(measure).slice(0, 2) : usage(measure), [measure, status]);
  return (
    <div className="col">
      <span className="etiket">Bütçe etiketini yukarı aşağı sürükleyin (ya da odaklanıp ok tuşlarını, PageUp/PageDown'u kullanın): ana cümle, aşma günü, maliyet ve uyarı tarihleri hemen yeniden hesaplanır. Grafikte gezerek günleri okuyun; eşik düğmeleri uyarı kurallarını açar ve kapatır. Bütçeyi düşürürseniz "zaten aşıldı" durumunu görürsünüz.</span>
      <div className="row">
        <label><input type="radio" name="kullanim-durum" checked={status === "ready"} onChange={() => setStatus("ready")} /> Veri</label>
        <label><input type="radio" name="kullanim-durum" checked={status === "short"} onChange={() => setStatus("short")} /> Yetersiz veri (2 gün)</label>
        <label><input type="radio" name="kullanim-durum" checked={status === "loading"} onChange={() => setStatus("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="kullanim-durum" checked={status === "error"} onChange={() => setStatus("error")} /> Hata</label>
      </div>
      <UsageForecast key={measure} used={used} days={30} startDate="2026-09-01" budget={budgets[measure]!} onBudgetChange={value => setBudgets(current => ({ ...current, [measure]: value }))} unit={setup.unit} overage={setup.overage}
        subtitle="Örnek Müşteri A.Ş. · Kurumsal plan · Yenileme 1 Ekim 2026" measures={MEASURES} measure={measure} onMeasureChange={setMeasure} status={status === "short" ? "ready" : status} onRetry={() => setStatus("ready")} />
    </div>
  );
}
