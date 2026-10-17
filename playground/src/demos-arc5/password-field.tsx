// password-field örneği. Alana yazılan değerler yalnızca denemedir; örnekte gerçek parola yoktur.
import { useState } from "react";
import { countCodePoints } from "../../../registry/components/password-strength/password-strength-format";
import { PasswordField } from "../../../registry/components/password-field/password-field";

export function PasswordFieldDemo() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // Hata yazarken değil, alandan çıkınca gösterilir; düzeltilince hemen kalkar.
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const shortError = touched.password && password && countCodePoints(password) < 12 ? "Parola en az 12 karakter olmalı." : undefined;
  const mismatchError = touched.confirm && confirm && confirm !== password ? "Parolalar eşleşmiyor." : undefined;
  return <div className="col">
    <span className="etiket">Göz simgesi parolayı gösterir ya da gizler. Yıldız simgesi seçeneklerle parola üretir. Alandan çıkınca kısa parola ve eşleşmeyen doğrulama uyarılır.</span>
    <PasswordField label="Parola" placeholder="Bir deneme metni yazın" description="En az 12 karakter olmalı." autoComplete="off" generator value={password} onChange={event => setPassword(event.target.value)} onBlur={() => setTouched(current => ({ ...current, password: true }))} error={shortError} />
    <PasswordField label="Parolayı doğrula" placeholder="Aynı metni yeniden yazın" autoComplete="off" value={confirm} onChange={event => setConfirm(event.target.value)} onBlur={() => setTouched(current => ({ ...current, confirm: true }))} error={mismatchError} />
    <span className="durum">{confirm && !mismatchError && confirm === password ? "Parolalar eşleşiyor." : "\u00a0"}</span>
  </div>;
}
