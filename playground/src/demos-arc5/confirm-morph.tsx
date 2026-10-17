// confirm-morph örnekleri: aynı hap, üç onay kipi. Veriler uydurmadır.
import { ConfirmMorph } from "../../../registry/components/confirm-morph/confirm-morph";
import { Trash2 } from "lucide-react";

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function ConfirmMorphDemo() {
  return <div className="col">
    <span className="etiket">Basınca: soru yerinde sorulur, onaylayınca sonuç ve Geri al çıkar</span>
    <div className="row">
      <ConfirmMorph label="Projeyi sil" icon={<Trash2 size={16} />} prompt="Proje silinsin mi?" onConfirm={() => wait(900)} onUndo={() => wait(600)} />
    </div>
    <span className="etiket">Basılı tutma: geri alınamaz işlerde düğmeyi bir saniye basılı tut</span>
    <div className="row">
      <ConfirmMorph label="Erişimi kaldır" prompt="Ayşe Yılmaz’ın erişimi kaldırılsın mı?" confirmMode="hold" confirmLabel="Kaldır" pendingLabel="Kaldırılıyor" doneLabel="Erişim kaldırıldı"
        onConfirm={() => wait(900)} />
    </div>
    <span className="etiket">Geri sayım: onaydan sonra üç saniye içinde vazgeçilebilir</span>
    <div className="row">
      <ConfirmMorph label="Taslağı at" prompt="Taslak atılsın mı?" confirmMode="countdown" confirmLabel="At" pendingLabel="Atılıyor" doneLabel="Taslak atıldı" tone="neutral"
        onConfirm={() => wait(600)} onUndo={() => wait(400)} />
    </div>
    <span className="etiket">Hata: işlem başarısız olursa Tekrar dene çıkar</span>
    <div className="row">
      <ConfirmMorph label="Raporu sil" prompt="Rapor silinsin mi?" onConfirm={async () => { await wait(700); throw new Error("sunucu yanıt vermedi"); }} />
    </div>
  </div>;
}
