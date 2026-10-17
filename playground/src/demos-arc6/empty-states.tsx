// empty-states örneği: dört boş durum tek çizimde. Tekil `empty-state` bileşeninden ayrıdır.
import { EmptyStates } from "../../../registry/components/empty-states/empty-states";

export function EmptyStatesDemo() {
  return <div className="col">
    <span className="etiket">Sekmeler durumu seçer; ana düğme yerel bir şey yapar (süzgeç temizler, yeniden bağlanır, postayı denetler, sayfayı bulur).</span>
    <div style={{ width: "min(100%, 640px)" }}>
      <EmptyStates />
    </div>
  </div>;
}
