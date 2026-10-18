// color-picker örneği: kayıtlı renkler ve karşıtlık göstergesiyle renk alanı.
import { useState } from "react";
import { ColorPicker } from "../../../registry/components/color-picker/color-picker";

export function ColorPickerDemo() {
  const [color, setColor] = useState("#2F6BFF");
  return <div className="col">
    <span className="etiket">Hex, RGB, HSL ya da OKLCH yazın; "238, 238, 238" gibi çıplak üçlü de okunur. Karşıtlık oranı Türkçe yazılır.</span>
    <ColorPicker label="Vurgu rengi" value={color} onValueChange={setColor}
      defaultSwatches={[{ id: "a", color: "#2F6BFF" }, { id: "b", color: "#6D4AFF" }, { id: "c", color: "#0E9F6E" }]} />
    <span className="etiket">Seçilen: {color}</span>
  </div>;
}
