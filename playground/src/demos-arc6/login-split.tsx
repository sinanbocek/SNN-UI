// login-split örneği: gerçek kimlik doğrulama yok. İçinde "hata" geçen parola reddedilir; böylece hata durumu denenebilir.
import { LoginSplit } from "../../../registry/components/login-split/login-split";

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function LoginSplitDemo() {
  return <div className="col">
    <span className="etiket">Parolaya "hata" yazarsanız giriş reddedilir; başka her parola kabul edilir</span>
    <div style={{ height: 640, overflow: "hidden", borderRadius: "var(--radius-panel)", border: "1px solid var(--border)" }}>
      <LoginSplit
        minHeight="640px"
        brand={{ name: "SNN Panel" }}
        badge="SNN ailesi"
        media={{ src: "/ornek-foto/sahne-ic-mekan.jpg" }}
        quote={{ text: "Ekibimiz her sabah aynı ekrandan başlıyor; bir şeyi ararken zaman kaybetmiyoruz.", name: "Elif Yıldız", role: "Operasyon Müdürü" }}
        onSubmit={async ({ password }) => { await wait(1000); if (password.includes("hata")) throw new Error("reddedildi"); }}
        onForgot={() => undefined}
        onProvider={() => undefined}
        onSignUp={() => undefined}
      />
    </div>
  </div>;
}
