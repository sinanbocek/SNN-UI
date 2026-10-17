// theme-switch örneği: açık/koyu tema düğmesi, dört geçiş çeşidiyle.
import { useState } from "react";
import { ThemeSwitch, type Theme, type ThemeSwitchVariant } from "../../../registry/components/theme-switch/theme-switch";

const VARIANTS: ThemeSwitchVariant[] = ["reveal", "eclipse", "split", "rise"];

export function ThemeSwitchDemo() {
  const [theme, setTheme] = useState<Theme>("light");
  return <div className="col">
    <span className="etiket">Düğme yalnız temayı bildirir; sayfaya uygulamak uygulamanın işidir. Şu an: {theme === "light" ? "Açık" : "Koyu"}</span>
    <div className="row">
      {VARIANTS.map(variant => <ThemeSwitch key={variant} theme={theme} variant={variant} onThemeChange={next => setTheme(next)} />)}
      <ThemeSwitch theme={theme} iconOnly onThemeChange={next => setTheme(next)} />
    </div>
  </div>;
}
