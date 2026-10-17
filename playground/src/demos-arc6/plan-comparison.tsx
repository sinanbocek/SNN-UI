// plan-comparison örneği: iki planın yalnız değişen ayrıntıları, dönem anahtarı ve fiyatlar (TRY).
import { PlanComparison } from "../../../registry/components/plan-comparison/plan-comparison";

export function PlanComparisonDemo() {
  return <div className="col">
    <span className="etiket">Dönemi değiştir, yalnızca farkları göster, plan seç</span>
    <PlanComparison />
  </div>;
}
