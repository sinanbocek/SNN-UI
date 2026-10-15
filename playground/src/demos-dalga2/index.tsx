// Dalga 2: grafik ve finans blokları galeri örnekleri. Veriler uydurmadır.
import type { ReactNode } from "react";
import { SplitBarDemo } from "./split-bar";
import { SankeyFlowDemo } from "./sankey-flow";
import { FunnelChartDemo } from "./funnel-chart";
import { RaceBarChartDemo } from "./race-bar-chart";
import { RealtimeStreamDemo } from "./realtime-stream";

export const dalga2Demos: Record<string, () => ReactNode> = {
  "split-bar": () => <SplitBarDemo />,
  "sankey-flow": () => <SankeyFlowDemo />,
  "funnel-chart": () => <FunnelChartDemo />,
  "race-bar-chart": () => <RaceBarChartDemo />,
  "realtime-stream": () => <RealtimeStreamDemo />,
};
