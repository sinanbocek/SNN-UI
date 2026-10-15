// line-replay örneği. Ziyaretçi sayıları ve olaylar uydurmadır (18 Ekim 2026, Türkiye saati 09:00–13:00); saat ve gün adı ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { LineReplay } from "../../../registry/components/line-replay/line-replay";
import type { ReplayEvent, ReplayPoint } from "../../../registry/components/line-replay/line-replay";

/** Türkiye saati (UTC+3) hh:mm → epoch ms. */
const at = (hour: number, minute: number) => Date.UTC(2026, 9, 18, hour - 3, minute);

function build(): { points: ReplayPoint[]; comparison: ReplayPoint[]; events: ReplayEvent[] } {
  const events: ReplayEvent[] = [
    { t: at(9, 40), title: "Bülten gönderildi", detail: "48 bin kişiye" },
    { t: at(10, 25), kind: "issue", title: "Ödeme sayfası yavaşladı", detail: "Sağlayıcı gecikmesi" },
    { t: at(11, 30), title: "Kampanya yayına girdi", detail: "Ana sayfa afişi" },
  ];
  const points: ReplayPoint[] = [], comparison: ReplayPoint[] = [];
  for (let minute = 0; minute <= 240; minute += 10) {
    const t = at(9, 0) + minute * 60000;
    const bump = (center: number, height: number, width: number) => height * Math.exp(-(((minute - center) / width) ** 2));
    const base = 120 + minute * .25 + Math.sin(minute / 17) * 12;
    const value = base + bump(55, 1400, 22) + bump(120, 620, 60) - bump(95, 380, 12) + bump(170, 900, 35);
    points.push({ t, value: Math.round(value) });
    comparison.push({ t, value: Math.round(base * 1.05) });
  }
  return { points, comparison, events };
}

export function LineReplayDemo() {
  const { points, comparison, events } = useMemo(build, []);
  const [shown, setShown] = useState({ comparison: true, events: true });
  const [loading, setLoading] = useState(false);
  return (
    <div className="col">
      <span className="etiket">Başlangıçta çizgi tamam, tüm anlar işli ve imleç sonda durur. "Oynat" çizgiyi baştan çizer; kilit an geçilince işaret konur, açıklama çıkar, listedeki satır yanar. Kaydırıcıyı sürükleyin, listeden bir ana basın ya da hızı değiştirin. Boşluk, Enter ve K oynatır ya da duraklatır; ok tuşları bir nokta, Shift+ok ya da PageUp/PageDown bir saat atlar.</span>
      <div className="row">
        <label><input type="checkbox" checked={shown.comparison} onChange={event => setShown(current => ({ ...current, comparison: event.target.checked }))} /> Kıyas çizgisi</label>
        <label><input type="checkbox" checked={shown.events} onChange={event => setShown(current => ({ ...current, events: event.target.checked }))} /> Kilit anlar</label>
        <label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
      </div>
      <LineReplay key={`${shown.comparison}-${shown.events}`} title="Bülten günü ziyaretçi akışı" subtitle={`Anlık ziyaretçi · ${date.dayName("2026-10-18", "long")}, ${date.format("2026-10-18", "long")}`}
        points={points} comparison={shown.comparison ? comparison : undefined} events={shown.events ? events : []} seriesLabel="Bugün" comparisonLabel="Geçen hafta" unit="kişi" loading={loading} replaySeconds={14} />
    </div>
  );
}
