// password-field örneği. Alana yazılan değerler yalnızca denemedir; örnekte gerçek parola yoktur.
import { PasswordField } from "../../../registry/components/password-field/password-field";

export function PasswordFieldDemo() {
  return <div className="col">
    <span className="etiket">Göz simgesi parolayı gösterir ya da gizler.</span>
    <PasswordField label="Parola" placeholder="Bir deneme metni yazın" description="En az 12 karakter olmalı." autoComplete="off" />
    <PasswordField label="Parolayı doğrula" placeholder="Aynı metni yeniden yazın" autoComplete="off" />
  </div>;
}
