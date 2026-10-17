// signature-pad örneği: imza alanı; geri al, yinele, yeniden oynat ve PNG/SVG dışa aktarma.
import { useState } from "react";
import { SignaturePad, type InkStroke } from "../../../registry/components/signature-pad/signature-pad";

export function SignaturePadDemo() {
  const [strokes, setStrokes] = useState<InkStroke[]>([]);
  return <div className="col">
    <span className="etiket">Fare, kalem ya da parmakla imzalayın. Ctrl+Z geri alır, Delete temizler.</span>
    <SignaturePad signer="Ayşe Yılmaz" onChange={setStrokes} fileName="ayse-yilmaz-imza" />
    <span className="etiket">Vuruş sayısı: {strokes.length}</span>
  </div>;
}
