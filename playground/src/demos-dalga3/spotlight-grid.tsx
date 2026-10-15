// spotlight-grid örneği. Özellik metinleri, adlar ve sayılar uydurmadır; dağıtım, anahtar ve onay benzetimdir.
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { money } from "@snn/abacus-core";
import { AnimatedCounter } from "../../../registry/components/animated-counter/animated-counter";
import { Avatar } from "../../../registry/components/avatar/avatar";
import { Button } from "../../../registry/components/button/button";
import SegmentedControl from "../../../registry/components/segmented-control/segmented-control";
import { Switch } from "../../../registry/components/switch/switch";
import { SpotlightGrid } from "../../../registry/components/spotlight-grid/spotlight-grid";
import type { PreviewContext, SpotlightFeature } from "../../../registry/components/spotlight-grid/spotlight-grid";
import { miniLinePath } from "../../../registry/components/lib/chart-format";

const RANGES: Record<string, number[]> = {
  "1s": [48, 52, 44, 60, 41, 39, 47, 43, 38, 42],
  "1g": [61, 55, 72, 58, 49, 66, 52, 47, 51, 44, 49, 40],
  "7g": [80, 74, 69, 77, 63, 58, 61, 55, 52, 57, 49, 46],
};
const RANGE_OPTIONS = [{ value: "1s", label: "Son saat" }, { value: "1g", label: "Son gün" }, { value: "7g", label: "Son 7 gün" }];

function Curve({ values, height = 80 }: { values: number[]; height?: number }) {
  return (
    <svg viewBox="0 0 200 80" style={{ width: "100%", height }} role="img" aria-label={`Gecikme eğrisi, son değer ${values[values.length - 1]} ms`}>
      <motion.path d={miniLinePath(values, 200, 80, 6)} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" initial={false} animate={{ d: miniLinePath(values, 200, 80, 6) }} transition={{ duration: .4 }} />
    </svg>
  );
}

function LatencyPreview({ active, reduced }: PreviewContext) {
  const [tick, setTick] = useState(0);
  useEffect(() => { if (!active || reduced) return; const timer = window.setInterval(() => setTick(value => value + 1), 900); return () => window.clearInterval(timer); }, [active, reduced]);
  const base = RANGES["1s"]!;
  return <Curve values={base.map((value, at) => value + ((tick + at) % 3) * 3)} height={64} />;
}
function LatencyDetail() {
  const [range, setRange] = useState("1s");
  const values = RANGES[range]!;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <SegmentedControl label="Zaman aralığı" options={RANGE_OPTIONS} value={range} onValueChange={setRange} />
      <Curve values={values} height={140} />
      <p style={{ margin: 0 }}>Son değer: <b><AnimatedCounter value={values[values.length - 1]!} suffix=" ms" /></b></p>
    </div>
  );
}

function CounterPreview({ active, reduced }: PreviewContext) {
  const [count, setCount] = useState(1284);
  useEffect(() => { if (!active || reduced) return; const timer = window.setInterval(() => setCount(value => value + 1), 700); return () => window.clearInterval(timer); }, [active, reduced]);
  return <b style={{ fontSize: "1.6rem" }}><AnimatedCounter value={count} /></b>;
}
function DeployDetail({ announce }: { announce: (message: string) => void }) {
  const [approved, setApproved] = useState(false);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ margin: 0 }}>Bu hafta <b>{money.fmtDecimalGrouped(1284, 0)}</b> dağıtım; başarı oranı <b>{money.percent(99.4, 1)}</b>.</p>
      <ul style={{ margin: 0, paddingLeft: 18 }}><li>ödeme-servisi · 14:02 · bekliyor</li><li>web-arayuz · 13:40 · tamam</li></ul>
      <Button variant={approved ? "secondary" : "primary"} aria-pressed={approved} onClick={() => { setApproved(true); announce("Dağıtım onaylandı (benzetim)."); }}>{approved ? "Onaylandı" : "Onayla"}</Button>
    </div>
  );
}

function FlagPreview({ active }: PreviewContext) {
  return <Switch checked={active} onCheckedChange={() => {}} label="Yeni ödeme akışı" tabIndex={-1} />;
}
function FlagDetail({ announce }: { announce: (message: string) => void }) {
  const [on, setOn] = useState(true);
  const [rollout, setRollout] = useState("25");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Switch checked={on} onCheckedChange={value => { setOn(value); announce(value ? "Özellik açıldı." : "Özellik kapandı."); }} label="Yeni ödeme akışı" />
      <div role="radiogroup" aria-label="Yayılma" style={{ display: "flex", gap: 8 }}>
        {["5", "25", "100"].map(value => <Button key={value} size="sm" variant={rollout === value ? "primary" : "secondary"} role="radio" aria-checked={rollout === value} onClick={() => setRollout(value)}>{money.percent(Number(value), 0)}</Button>)}
      </div>
      <p style={{ margin: 0 }}>Yayılma {money.percent(Number(rollout), 0)}; özellik {on ? "açık" : "kapalı"}.</p>
    </div>
  );
}

function NotePreview({ active }: PreviewContext) {
  return <motion.div initial={false} animate={{ opacity: active ? 1 : .6, y: active ? 0 : 4 }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--surface)", borderRadius: 8, fontSize: ".8rem" }}><Avatar name="Elif Aksoy" size="sm" /> Kur farkını kontrol et</motion.div>;
}
function NoteDetail() {
  return (
    <ul style={{ display: "grid", gap: 10, margin: 0, padding: 0, listStyle: "none" }}>
      {[["Elif Aksoy", "Kur farkını kontrol et."], ["Barış Yıldız", "Kontrol ettim, tutarlı."]].map(([who, line]) => <li key={who} style={{ display: "flex", gap: 8, alignItems: "center" }}><Avatar name={who!} size="sm" /><span><b>{who}</b> {line}</span></li>)}
    </ul>
  );
}

const FEATURES: SpotlightFeature[] = [
  { id: "gecikme", title: "Gecikmeyi canlı izle", description: "Eğri her an güncellenir; aralığı seçip ayrıntıya inin.", wide: true, preview: context => <LatencyPreview {...context} />, detail: () => <LatencyDetail /> },
  { id: "dagitim", title: "Dağıtımları say ve onayla", description: "Kaç dağıtımın geçtiğini görün, bekleyeni onaylayın.", preview: context => <CounterPreview {...context} />, detail: ({ announce }) => <DeployDetail announce={announce} /> },
  { id: "bayrak", title: "Özelliği anahtarla aç", description: "Yeni bir özelliği önce yüzde 5, sonra herkese açın.", preview: context => <FlagPreview {...context} />, detail: ({ announce }) => <FlagDetail announce={announce} /> },
  { id: "not", title: "Yoruma not iğnele", description: "Ekibin notu yorumun üstünde sabit kalsın.", preview: context => <NotePreview {...context} />, detail: () => <NoteDetail /> },
];

export function SpotlightGridDemo() {
  return (
    <div className="col">
      <span className="etiket">Fareyi kartlar üstünde gezdirin: kenar ışığı imleci izler, önizleme oynar. Karta basın (ya da Tab ile gelip Enter): kart yerinde büyüyerek çalışan ayrıntıya döner; zaman aralığını, anahtarı, yayılma yüzdesini deneyin. Esc kapatır ve odağı karta geri verir. Dağıtım, anahtar ve onay benzetimdir.</span>
      <SpotlightGrid title="Neler yapabilirsiniz" subtitle="Anlatmakla kalmaz, denetirsiniz." features={FEATURES} />
    </div>
  );
}
