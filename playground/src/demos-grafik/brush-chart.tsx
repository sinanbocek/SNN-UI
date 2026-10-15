// brush-chart örneği. Rakamlar uydurmadır; tarihler ABACUS ile yazılır.
import { useMemo } from "react";
import { BrushChart } from "../../../registry/components/brush-chart/brush-chart";
import type { BrushChartDatum } from "../../../registry/components/brush-chart/brush-chart";

const DAY = 86_400_000;

/** 2025-10-18'den başlayan 365 günlük uydurma günlük etkin kullanıcı verisi. */
function makeData(): BrushChartDatum[] {
  const start = Date.UTC(2025, 9, 18);
  return Array.from({ length: 365 }, (_, at) => {
    const week = new Date(start + at * DAY).getUTCDay();
    const weekend = week === 0 || week === 6 ? -180 : 0;
    const trend = 1400 + at * 4.2;
    const wave = Math.sin(at / 9) * 140 + Math.sin(at * 2.3) * 55;
    return { date: start + at * DAY, value: Math.round(Math.max(200, trend + weekend + wave)) };
  });
}

export function BrushChartDemo() {
  const data = useMemo(makeData, []);
  return (
    <div className="col">
      <span className="etiket">Alttaki şeritte pencereyi kenarlarından boyutlandırın, tutup kaydırın ya da boş yere tıklayıp yeni pencere çizin. Büyük grafikte gezin; çift tıklayınca tüm geçmişe döner.</span>
      <BrushChart
        label="Günlük etkin kullanıcı"
        unit="kullanıcı"
        data={data}
        defaultRange={[Date.UTC(2026, 6, 1), Date.UTC(2026, 9, 18)]}
        annotations={[
          { date: Date.UTC(2026, 0, 15), label: "v2 yayını", description: "Yeni arayüz tüm kullanıcılara açıldı." },
          { date: Date.UTC(2026, 5, 3), label: "Kampanya", description: "Bahar kampanyası başladı." },
          { date: Date.UTC(2026, 8, 9), label: "Fiyat", description: "Yeni fiyat listesi." },
        ]}
      />
    </div>
  );
}
