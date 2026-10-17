// signup-form örneği: kayıt formu. Gerçek kayıt yok; yalnız görünümdür.
import { SignupForm } from "../../../registry/components/signup-form/signup-form";

export function SignupFormDemo() {
  return <div className="col">
    <span className="etiket">Ad, e-posta ve en az 8 karakterli parola</span>
    <SignupForm />
  </div>;
}
