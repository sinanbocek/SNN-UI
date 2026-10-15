// journey-flow örneği. Ziyaretçi sayıları ve oranlar uydurmadır; ay adı ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { JourneyFlow } from "../../../registry/components/journey-flow/journey-flow";
import type { JourneyData } from "../../../registry/components/journey-flow/journey-flow";

const CHANNELS = [{ value: "all", label: "Tüm kullanıcılar" }, { value: "search", label: "Arama" }, { value: "ads", label: "Reklam" }, { value: "referral", label: "Tavsiye" }, { value: "none", label: "Doğrudan" }];
const STAGES = ["Ziyaret", "Hesap", "Kurulum", "İlk hafta", "Plan"];
/** Kanal: [ziyaret sayısı, aşamadan aşamaya devam oranları]. */
const SETUP: Record<string, [number, number[]]> = {
  all: [16965, [.38, .61, .74, .16]], search: [7120, [.42, .66, .78, .2]], ads: [5230, [.27, .52, .66, .09]], referral: [2915, [.55, .72, .81, .28]],
};

function build(channel: string): JourneyData | null {
  const setup = SETUP[channel];
  if (!setup) return null;
  const [visits, rates] = setup;
  const stageNodes = STAGES.map((label, at) => ({ id: `s${at}`, label }));
  const dropNodes = STAGES.slice(0, -1).map((label, at) => ({ id: `d${at}`, label: "Ayrılan", muted: true }));
  const links: { source: string; target: string; value: number }[] = [];
  let current = visits;
  rates.forEach((rate, at) => {
    const next = Math.round(current * rate);
    links.push({ source: `s${at}`, target: `s${at + 1}`, value: next }, { source: `s${at}`, target: `d${at}`, value: current - next });
    current = next;
  });
  return { nodes: [...stageNodes, ...dropNodes], links, stages: STAGES };
}

export function JourneyFlowDemo() {
  const [channel, setChannel] = useState("all");
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  const data = useMemo(() => build(channel), [channel]);
  return (
    <div className="col">
      <span className="etiket">Kanalı değiştirin: şeritlerin kalınlığı yeni kanala göre değişir. Adıma ya da şeride gelince o grup baştan sona vurgulanır; adıma basın (ya da odaklanıp Enter) yan panel girenleri ve çıkanları yazsın, Esc seçimi kaldırır. "Akış tablosu" aynı sayıları tablo olarak açar. "Doğrudan" kanalının verisi yoktur.</span>
      <div className="row">
        <label><input type="radio" name="yol-durum" checked={status === "ready"} onChange={() => setStatus("ready")} /> Veri</label>
        <label><input type="radio" name="yol-durum" checked={status === "loading"} onChange={() => setStatus("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="yol-durum" checked={status === "error"} onChange={() => setStatus("error")} /> Hata</label>
      </div>
      <JourneyFlow channels={CHANNELS} channel={channel} onChannelChange={setChannel} data={data} status={status} onRetry={() => setStatus("ready")}
        title="Ziyaretçi yolculuğu" subtitle={`${date.monthName(8)} ayında ziyaret, ilk oturumdan plana kadar izlendi`} totalLabel="ziyaret" finalLabel="ücretli plan" />
    </div>
  );
}
