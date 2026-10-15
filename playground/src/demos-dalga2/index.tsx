// Dalga 2: grafik ve finans blokları galeri örnekleri. Veriler uydurmadır.
import type { ReactNode } from "react";
import { SplitBarDemo } from "./split-bar";
import { SankeyFlowDemo } from "./sankey-flow";
import { FunnelChartDemo } from "./funnel-chart";
import { RaceBarChartDemo } from "./race-bar-chart";
import { RealtimeStreamDemo } from "./realtime-stream";
import { MetricsDashboardDemo } from "./metrics-dashboard";
import { KpiDrilldownDemo } from "./kpi-drilldown";
import { MetricExplorerDemo } from "./metric-explorer";
import { RevenueExplorerDemo } from "./revenue-explorer";
import { MrrWaterfallDemo } from "./mrr-waterfall";
import { CohortRetentionDemo } from "./cohort-retention";
import { UsageForecastDemo } from "./usage-forecast";
import { BudgetVarianceDemo } from "./budget-variance";
import { SmallMultiplesDemo } from "./small-multiples";
import { LineReplayDemo } from "./line-replay";
import { MarketTerminalDemo } from "./market-terminal";
import { JourneyFlowDemo } from "./journey-flow";
import { InvoiceStudioDemo } from "./invoice-studio";
import { PricingCalculatorDemo } from "./pricing-calculator";
import { UsagePricingDemo } from "./usage-pricing";

export const dalga2Demos: Record<string, () => ReactNode> = {
  "split-bar": () => <SplitBarDemo />,
  "sankey-flow": () => <SankeyFlowDemo />,
  "funnel-chart": () => <FunnelChartDemo />,
  "race-bar-chart": () => <RaceBarChartDemo />,
  "realtime-stream": () => <RealtimeStreamDemo />,
  "metrics-dashboard": () => <MetricsDashboardDemo />,
  "kpi-drilldown": () => <KpiDrilldownDemo />,
  "metric-explorer": () => <MetricExplorerDemo />,
  "revenue-explorer": () => <RevenueExplorerDemo />,
  "mrr-waterfall": () => <MrrWaterfallDemo />,
  "cohort-retention": () => <CohortRetentionDemo />,
  "usage-forecast": () => <UsageForecastDemo />,
  "budget-variance": () => <BudgetVarianceDemo />,
  "small-multiples": () => <SmallMultiplesDemo />,
  "line-replay": () => <LineReplayDemo />,
  "market-terminal": () => <MarketTerminalDemo />,
  "journey-flow": () => <JourneyFlowDemo />,
  "invoice-studio": () => <InvoiceStudioDemo />,
  "pricing-calculator": () => <PricingCalculatorDemo />,
  "usage-pricing": () => <UsagePricingDemo />,
};
