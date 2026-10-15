// Dalga 2 ön şartı: Arc'ın ücretsiz grafik ve sayı bileşenleri (ABACUS'a bağlı) galeri örnekleri.
import type { ReactNode } from "react";
import { AnimatedCounterDemo } from "./animated-counter";
import { MetricCardDemo } from "./metric-card";
import { SparklineDemo } from "./sparkline";
import { LineChartDemo } from "./line-chart";
import { BarChartDemo } from "./bar-chart";
import { DonutChartDemo } from "./donut-chart";
import { GaugeDemo } from "./gauge";
import { UsageMeterDemo } from "./usage-meter";
import { SlopeChartDemo } from "./slope-chart";
import { TreemapDemo } from "./treemap";
import { WaffleChartDemo } from "./waffle-chart";

export const grafikDemos: Record<string, () => ReactNode> = {
  "animated-counter": () => <AnimatedCounterDemo />,
  "metric-card": () => <MetricCardDemo />,
  "sparkline": () => <SparklineDemo />,
  "line-chart": () => <LineChartDemo />,
  "bar-chart": () => <BarChartDemo />,
  "donut-chart": () => <DonutChartDemo />,
  "gauge": () => <GaugeDemo />,
  "usage-meter": () => <UsageMeterDemo />,
  "slope-chart": () => <SlopeChartDemo />,
  "treemap": () => <TreemapDemo />,
  "waffle-chart": () => <WaffleChartDemo />,
};
