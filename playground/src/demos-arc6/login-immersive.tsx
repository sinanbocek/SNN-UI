// login-immersive örneği: gerçek kimlik doğrulama yok. İçinde "hata" geçen parola reddedilir; böylece hata durumu denenebilir.
import { LoginImmersive } from "../../../registry/components/login-immersive/login-immersive";

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export function LoginImmersiveDemo() {
  return <div className="col">
    <span className="etiket">Parolaya "hata" yazarsanız giriş reddedilir; başka her parola kabul edilir</span>
    <div style={{ height: 640, overflow: "hidden", borderRadius: "var(--radius-panel)", border: "1px solid var(--border)" }}>
      <LoginImmersive
        minHeight="640px"
        brand={{ name: "SNN Panel" }}
        media={{ src: "/ornek-foto/sahne-dag.jpg", credit: "Unsplash" }}
        legalLinks={[{ label: "Gizlilik", href: "#gizlilik" }, { label: "Koşullar", href: "#kosullar" }]}
        onHelp={() => undefined}
        onSubmit={async ({ password }) => { await wait(1000); if (password.includes("hata")) throw new Error("reddedildi"); }}
        onForgot={() => undefined}
        onProvider={() => undefined}
        onSignUp={() => undefined}
      />
    </div>
  </div>;
}
