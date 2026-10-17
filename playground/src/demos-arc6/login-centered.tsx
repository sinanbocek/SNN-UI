// login-centered örneği: ortalanmış giriş ve kayıt ekranı. Gerçek kimlik doğrulama yok; yalnız görünümdür.
import { LoginCentered } from "../../../registry/components/login-centered/login-centered";

export function LoginCenteredDemo() {
  return <div className="col">
    <span className="etiket">Geçiş anahtarı, e-posta kodu (482913) ve kayıt akışı</span>
    <LoginCentered />
  </div>;
}
