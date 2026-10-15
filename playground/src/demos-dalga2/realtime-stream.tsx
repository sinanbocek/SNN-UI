// realtime-stream örneği. Okumalar tarayıcıda üretilen örnek veridir (sunucu yok): yarım saniyede bir yeni okuma gelir.
import { useEffect, useRef, useState } from "react";
import { RealtimeStream } from "../../../registry/components/realtime-stream/realtime-stream";
import type { StreamReading } from "../../../registry/components/realtime-stream/realtime-stream";

type Metric = "latency" | "price";
const KEEP = 240;

/** Rastgele yürüyüşle bir sonraki okuma; `spike` verilirse belirgin bir sıçrama ve not ekler. */
function nextReading(metric: Metric, previous: StreamReading | undefined, spike: boolean): StreamReading {
  const t = Date.now();
  if (metric === "latency") {
    const base = previous?.value ?? 120;
    const value = Math.max(40, Math.round(base + (120 - base) * .08 + (Math.random() - .5) * 26 + (spike ? 180 : 0)));
    return { t, value, note: spike ? "Sıçrama" : undefined };
  }
  const base = previous?.value ?? 41.25;
  const value = Math.round((base + (41.25 - base) * .03 + (Math.random() - .5) * .18 + (spike ? 1.4 : 0)) * 100) / 100;
  return { t, value, note: spike ? "Ani yükseliş" : undefined };
}

export function RealtimeStreamDemo() {
  const [metric, setMetric] = useState<Metric>("latency");
  const [readings, setReadings] = useState<StreamReading[]>([]);
  const [online, setOnline] = useState(true);
  const spikeNext = useRef(false);

  useEffect(() => { setReadings([]); }, [metric]);
  useEffect(() => {
    if (!online) return;
    const timer = window.setInterval(() => {
      setReadings(current => {
        const spike = spikeNext.current;
        spikeNext.current = false;
        return [...current, nextReading(metric, current[current.length - 1], spike)].slice(-KEEP);
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [metric, online]);

  return (
    <div className="col">
      <span className="etiket">Her yarım saniyede bir okuma gelir. Grafiğin üstüne gelince görüntü durur, okumalar arka planda birikir; fare çekilince canlıya döner. Odaklanıp ok tuşlarıyla okumalar gezilir, boşluk duraklatır. "Hareketi azalt" açıkken çizim yalnız yeni okuma gelince yenilenir.</span>
      <div className="row">
        <label><input type="radio" name="akis-olcum" checked={metric === "latency"} onChange={() => setMetric("latency")} /> Yanıt süresi</label>
        <label><input type="radio" name="akis-olcum" checked={metric === "price"} onChange={() => setMetric("price")} /> Anlık fiyat</label>
        <button type="button" onClick={() => { spikeNext.current = true; }}>Sıçrama ekle</button>
        <button type="button" onClick={() => setOnline(value => !value)}>{online ? "Bağlantıyı kes" : "Bağlantıyı aç"}</button>
        <button type="button" onClick={() => setReadings([])}>Sıfırla</button>
      </div>
      {metric === "latency"
        ? <RealtimeStream label="Yanıt süresi" description="Sipariş servisi, son 30 saniye" unit="ms" readings={readings} status={online ? "live" : "disconnected"} onRetry={() => setOnline(true)} />
        : <RealtimeStream label="Anlık fiyat" description="Örnek hisse, son 30 saniye" kind="money" readings={readings} status={online ? "live" : "disconnected"} onRetry={() => setOnline(true)} />}
    </div>
  );
}
