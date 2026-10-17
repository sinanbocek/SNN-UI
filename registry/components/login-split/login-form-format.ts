// Giriş formlarının saf mantığı: yazarken e-posta süzme ve alan doğrulama iletileri. E-posta denetimi ABACUS'tandır.
// Kural: giris-alanlari-standardi.md (yazarken boşluk kırp ve küçük harfe çevir; kaydederken doğrulama motorunu çağır).
import { text, validate } from "@snn/abacus-core";

/** Giriş formlarının Türkçe ekran metinleri; `login-split` ve `login-immersive` aynı iletileri kullanır. */
export const LOGIN_TEXT = {
  email: "E-posta",
  password: "Parola",
  remember: "Beni hatırla",
  forgot: "Parolamı unuttum",
  submit: "Giriş yap",
  submitting: "Giriş yapılıyor",
  done: "Giriş yapıldı",
  or: "ya da",
  noAccount: "Hesabın yok mu?",
  signUp: "Kayıt ol",
  emailProblem: "Geçerli bir e-posta yazın.",
  passwordProblem: "Parola boş olamaz.",
  failed: "E-posta ya da parola hatalı.",
} as const;

/** E-posta yazarken süzme: boşluklar atılır, ASCII küçük harfe çevrilir (Türkçe büyük I küçük ı olmaz). */
export function cleanLoginEmail(raw: string): string {
  return text.toAsciiLower(raw.replace(/\s+/g, ""));
}

/** Boş ya da biçimsiz e-postada ileti, geçerliyse null. Yazarken değil; alandan çıkınca ve gönderimde çağrılır. */
export function loginEmailProblem(email: string): string | null {
  return email && validate.email(email) ? null : LOGIN_TEXT.emailProblem;
}

/** Parola yalnız boş olup olmadığına bakılır; gücünü ve doğruluğunu sunucu denetler. */
export function loginPasswordProblem(password: string): string | null {
  return password ? null : LOGIN_TEXT.passwordProblem;
}

/** Gönderimde ilk hatalı alanın adı (odak oraya gider); hepsi geçerliyse null. */
export function firstInvalidField(email: string, password: string): "email" | "password" | null {
  if (loginEmailProblem(email)) return "email";
  if (loginPasswordProblem(password)) return "password";
  return null;
}
