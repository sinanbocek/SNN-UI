// sign-in örneği: e-posta kodu, geçiş anahtarı ve tek oturum açma. Gerçek kimlik doğrulama yok; yalnız görünümdür.
import { SignIn } from "../../../registry/components/sign-in/sign-in";

export function SignInDemo() {
  return <div className="col">
    <span className="etiket">Örnek: elif@ornek.com.tr yazın, kod 123456</span>
    <SignIn />
  </div>;
}
