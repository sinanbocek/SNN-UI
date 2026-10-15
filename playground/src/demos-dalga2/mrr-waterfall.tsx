// mrr-waterfall örneği. Müşteri adları ve tutarlar uydurmadır; dönem metinleri ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { MrrWaterfall } from "../../../registry/components/mrr-waterfall/mrr-waterfall";
import type { WaterfallMovement } from "../../../registry/components/mrr-waterfall/mrr-waterfall";

const NAMES = ["Aksoy İnşaat", "Boran Lojistik", "Çelik Yapı", "Demir Gıda", "Ege Tekstil", "Fidan Market", "Güneş Enerji", "Hamle Turizm", "Işık Mobilya", "Kaya Madencilik", "Lale Otelcilik", "Mavi Nakliyat"];
const PLANS = ["Başlangıç", "Pro", "Kurumsal"];

/** Bir hareketin hesap listesi: tutarlar azalan sırada, toplamı `amount`. */
function accounts(prefix: string, amount: number, count: number, month: number) {
  const weights = Array.from({ length: Math.min(count, NAMES.length) }, (_, at) => 1 / (at + 1.4));
  const sum = weights.reduce((total, weight) => total + weight, 0);
  return weights.map((weight, at) => ({ key: `${prefix}-${at}`, name: NAMES[(at + month) % NAMES.length]!, detail: `${date.monthName(month)} 2026 · ${PLANS[at % 3]}`, amount: Math.round(amount * weight / sum) }));
}

function build(period: string): { start: number; movements: WaterfallMovement[]; subtitle: string; asOf: string } {
  const quarter = period === "q3";
  const scale = quarter ? 3 : 1;
  const month = quarter ? 7 : 9;
  const make = (key: string, label: string, direction: "up" | "down", role: WaterfallMovement["role"], amount: number, count: number): WaterfallMovement => ({ key, label, direction, role, amount: amount * scale, accountCount: count * scale, accounts: accounts(key, amount * scale, count * scale, month) });
  return {
    start: quarter ? 1840000 : 2210000,
    subtitle: quarter ? "Tüm planlar · 1 Temmuz – 30 Eylül 2026" : "Tüm planlar · Eylül 2026",
    asOf: "30 Eylül itibarıyla",
    movements: [
      make("yeni", "Yeni", "up", "new", 148000, 11),
      make("genisleme", "Genişleme", "up", "expansion", 62000, 7),
      make("yeniden", "Yeniden aktif", "up", "reactivation", 14500, 3),
      make("daralma", "Daralma", "down", "contraction", 27000, 5),
      make("kayip", "Kayıp", "down", "churn", 41500, 4),
    ],
  };
}

export function MrrWaterfallDemo() {
  const [period, setPeriod] = useState("q3");
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  const data = useMemo(() => build(period), [period]);
  return (
    <div className="col">
      <span className="etiket">Çubuğa basın ya da odaklanıp ok tuşlarıyla gezin: altındaki panel o basamağın hesaplarını gösterir (fare üstü yalnız önizlemedir). Birim seçicisi tutarları başlangıca göre yüzdeye çevirir. Panel 800 px altında grafiğin altına geçer.</span>
      <div className="row">
        <label><input type="radio" name="mrr-durum" checked={status === "ready"} onChange={() => setStatus("ready")} /> Veri</label>
        <label><input type="radio" name="mrr-durum" checked={status === "loading"} onChange={() => setStatus("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="mrr-durum" checked={status === "error"} onChange={() => setStatus("error")} /> Hata</label>
      </div>
      <MrrWaterfall start={data.start} movements={data.movements} subtitle={data.subtitle} asOf={data.asOf} status={status} onRetry={() => setStatus("ready")}
        periods={[{ value: "q3", label: "3. çeyrek" }, { value: "eylul", label: "Eylül" }]} period={period} onPeriodChange={setPeriod} />
    </div>
  );
}
