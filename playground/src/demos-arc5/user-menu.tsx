// user-menu örneği: hesap menüsü. Veriler uydurmadır.
import { useState } from "react";
import { Settings, ShieldCheck, CreditCard } from "lucide-react";
import { UserMenu, type ThemePreference, type UserStatus } from "../../../registry/components/user-menu/user-menu";

const user = { name: "ismail yılmaz", email: "ismail.yilmaz@ornek.com.tr", plan: "Pro" };

export function UserMenuDemo() {
  const [status, setStatus] = useState<UserStatus>("available");
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [message, setMessage] = useState("Henüz bir şey seçilmedi");
  const pick = (text: string) => () => setMessage(`Seçilen: ${text}`);
  return <div className="col">
    <span className="etiket">Menü açıkken "i" tuşuna basınca "İzinler" satırına atlar; "c" Çıkış'a, "f" Faturalama'ya gider.</span>
    <div className="row" style={{ justifyContent: "flex-end", minHeight: 40 }}>
      <UserMenu user={user} showName status={status} onStatusChange={setStatus} theme={theme} onThemeChange={setTheme}
        items={[
          { label: "Hesap ayarları", icon: <Settings size={16} strokeWidth={1.75} />, keys: ["⌘", ","], onSelect: pick("Hesap ayarları") },
          { label: "İzinler", icon: <ShieldCheck size={16} strokeWidth={1.75} />, onSelect: pick("İzinler") },
          { label: "Faturalama", icon: <CreditCard size={16} strokeWidth={1.75} />, onSelect: pick("Faturalama") },
        ]}
        onSignOut={() => new Promise(resolve => setTimeout(resolve, 900))} />
    </div>
    <span className="etiket">Yalnız açık ve koyu tema (themeOptions: light, dark)</span>
    <div className="row" style={{ justifyContent: "flex-end", minHeight: 40 }}>
      <UserMenu user={{ name: "elif yıldız", email: "elif.yildiz@ornek.com.tr" }} themeOptions={["light", "dark"]} items={[{ label: "Hesap ayarları", icon: <Settings size={16} strokeWidth={1.75} /> }]} onSignOut={() => undefined} />
    </div>
    <span className="etiket">Kenar menüsünün sol alt köşesi: side right, align end (panel sağa açılır, alt kenarlar hizalı)</span>
    <div className="row" style={{ justifyContent: "flex-start", minHeight: 40 }}>
      <UserMenu user={{ name: "mert şahin", email: "mert.sahin@ornek.com.tr" }} showName side="right" align="end" items={[{ label: "Hesap ayarları", icon: <Settings size={16} strokeWidth={1.75} /> }]} onSignOut={() => undefined} />
    </div>
    <span className="etiket">{message} · durum: {({ available: "Müsait", busy: "Meşgul", away: "Uzakta" } as Record<string, string>)[status] ?? status} · tema: {({ light: "Açık", dark: "Koyu", system: "Sistem" } as Record<string, string>)[theme] ?? theme}</span>
  </div>;
}
