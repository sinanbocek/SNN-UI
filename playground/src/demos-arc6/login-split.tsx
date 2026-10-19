// login-split örneği: gerçek kimlik doğrulama yok. İçinde "hata" geçen parola reddedilir; böylece hata durumu denenebilir.
import { useState } from "react";
import { LoginSplit } from "../../../registry/components/login-split/login-split";

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function LoginSplitDemo() {
  const [error, setError] = useState<string>();
  return <div className="col">
    <span className="etiket">E-posta dolu gelir (defaultValues). Parolaya "hata" yazarsanız giriş reddedilir; "kilit" yazarsanız projenin kendi hata metni çıkar (error). Başka her parola kabul edilir.</span>
    <div style={{ height: 640, overflow: "hidden", borderRadius: "var(--radius-panel)", border: "1px solid var(--border)" }}>
      <LoginSplit
        minHeight="640px"
        brand={{ name: "SNN Panel" }}
        badge="SNN ailesi"
        media={{ src: "/ornek-foto/sahne-ic-mekan.jpg" }}
        quote={{ text: "Ekibimiz her sabah aynı ekrandan başlıyor; bir şeyi ararken zaman kaybetmiyoruz.", name: "Elif Yıldız", role: "Operasyon Müdürü" }}
        defaultValues={{ email: "elif.yildiz@ornek.com.tr" }}
        error={error}
        data-testid="giris-formu"
        onSubmit={async ({ password }) => {
          setError(undefined);
          await wait(1000);
          if (password.includes("kilit")) { setError("Çok fazla deneme yapıldı. 15 dakika sonra yeniden deneyin."); throw new Error("kilitli"); }
          if (password.includes("hata")) throw new Error("reddedildi");
        }}
        onForgot={() => undefined}
        onProvider={() => undefined}
        onSignUp={() => undefined}
      />
    </div>
  </div>;
}
