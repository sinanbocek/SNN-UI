// password-strength örneği. Örnek parola yazılmaz; alan boş başlar.
import { useState } from "react";
import { PasswordStrength } from "../../../registry/components/password-strength/password-strength";

export function PasswordStrengthDemo() {
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const error = value && value.length < 8 ? "Parola en az 8 karakter olmalı." : undefined;
  return <div className="col" style={{ maxWidth: 360 }}>
    <span className="etiket">Yazdıkça ölçer dolar, koşullar işaretlenir. Puanlama cihazda yapılır, hiçbir yere gönderilmez.</span>
    <PasswordStrength label="Yeni parola" placeholder="Yeni parolanızı yazın" value={value} onValueChange={next => setValue(next)} revealed={revealed} onRevealedChange={setRevealed} error={error} />
  </div>;
}
