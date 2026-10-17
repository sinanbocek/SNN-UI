// theme-switch örneği: dört geçiş çeşidi, küçük bir önizleme sayfasında oynatılır.
// Düğme yalnız yeni temayı ve çeşidi bildirir; geçişi çizmek uygulamanın işidir. Burada önizleme kutusu o işi yapar.
import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ThemeSwitch, type Theme, type ThemeSwitchVariant } from "../../../registry/components/theme-switch/theme-switch";

const VARIANTS: { key: ThemeSwitchVariant; title: string; hint: string }[] = [
  { key: "reveal", title: "Daire açılımı", hint: "Yeni tema düğmeden daire olarak yayılır." },
  { key: "eclipse", title: "Daireye çekilme", hint: "Eski tema düğmeye doğru daralarak çekilir." },
  { key: "split", title: "Ortadan açılma", hint: "Yeni tema ortadan iki yana açılır." },
  { key: "rise", title: "Alttan yükselme", hint: "Yeni tema alttan yukarı yükselir." },
];
/** Önizleme sayfasının renkleri: galerinin temasından bağımsız, iki sabit gri ton takımı (ton açısı yok). */
const PALETTE: Record<Theme, { bg: string; card: string; line: string; fg: string }> = {
  light: { bg: "oklch(97% 0 0)", card: "oklch(100% 0 0)", line: "oklch(88% 0 0)", fg: "oklch(22% 0 0)" },
  dark: { bg: "oklch(18% 0 0)", card: "oklch(24% 0 0)", line: "oklch(34% 0 0)", fg: "oklch(94% 0 0)" },
};

function MiniPage({ theme }: { theme: Theme }) {
  const c = PALETTE[theme];
  return <div style={{ position: "absolute", inset: 0, background: c.bg, color: c.fg, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
    <strong style={{ fontSize: 14 }}>{theme === "light" ? "Açık tema" : "Koyu tema"}</strong>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
      {[0, 1, 2].map(index => <div key={index} style={{ height: 54, borderRadius: 10, background: c.card, border: `1px solid ${c.line}` }} />)}
    </div>
    <div style={{ height: 8, width: "70%", borderRadius: 4, background: c.line }} />
    <div style={{ height: 8, width: "45%", borderRadius: 4, background: c.line }} />
  </div>;
}

export function ThemeSwitchDemo() {
  const reduce = !!useReducedMotion();
  const [theme, setTheme] = useState<Theme>("light");
  const [overlay, setOverlay] = useState<{ theme: Theme; variant: ThemeSwitchVariant; x: number; y: number } | null>(null);
  const [last, setLast] = useState<string>("Bir düğmeye basın.");
  const box = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const clipPath = useTransform(progress, p => {
    if (!overlay) return "none";
    const { variant, x, y } = overlay;
    if (variant === "reveal") return `circle(${p * 150}% at ${x}% ${y}%)`;
    if (variant === "eclipse") return `circle(${(1 - p) * 150}% at ${x}% ${y}%)`;
    if (variant === "split") return `inset(0 ${(1 - p) * 50}% 0 ${(1 - p) * 50}%)`;
    return `inset(${(1 - p) * 100}% 0 0 0)`;
  });

  const change = (next: Theme, variant: ThemeSwitchVariant, trigger: HTMLElement) => {
    const title = VARIANTS.find(item => item.key === variant)?.title ?? "Yalnız simge";
    setLast(`${title}: ${next === "dark" ? "koyu" : "açık"} temaya geçildi.`);
    const frame = box.current?.getBoundingClientRect(), button = trigger.getBoundingClientRect();
    if (reduce || !frame) { setTheme(next); return; }
    // Düğmenin önizlemeye göre konumu, daire geçişlerinin merkezi olur (önizleme dışındaysa en yakın kenara sıkışır).
    const x = Math.min(100, Math.max(0, ((button.left + button.width / 2 - frame.left) / frame.width) * 100));
    const y = Math.min(100, Math.max(0, ((button.top + button.height / 2 - frame.top) / frame.height) * 100));
    // Daireye çekilmede üstteki katman eski temadır ve küçülür; ötekilerde üstteki yeni temadır ve büyür.
    if (variant === "eclipse") { setOverlay({ theme, variant, x, y }); setTheme(next); }
    else setOverlay({ theme: next, variant, x, y });
    progress.jump(0);
    animate(progress, 1, { duration: 0.6, ease: [0.4, 0, 0.2, 1], onComplete: () => { if (variant !== "eclipse") setTheme(next); setOverlay(null); } });
  };

  return <div className="col">
    <span className="etiket">Dört düğme aynı işi yapar: temayı değiştirir. Fark, sayfanın yeni temaya hangi efektle boyandığıdır. Düğme bunu yalnız bildirir; geçişi uygulama çizer. Aşağıdaki önizleme o geçişi gösterir.</span>
    <div ref={box} style={{ position: "relative", height: 170, borderRadius: 16, overflow: "hidden", border: "1px solid var(--border-subtle)" }} aria-hidden="true">
      <MiniPage theme={theme} />
      {overlay && <motion.div style={{ position: "absolute", inset: 0, clipPath }}><MiniPage theme={overlay.theme} /></motion.div>}
    </div>
    <div className="row" style={{ alignItems: "flex-start" }}>
      {VARIANTS.map(variant => <div key={variant.key} style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 190 }}>
        <ThemeSwitch theme={theme} variant={variant.key} onThemeChange={change} />
        <span className="etiket"><strong>{variant.title}</strong>{` · ${variant.hint}`}</span>
      </div>)}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 120 }}>
        <ThemeSwitch theme={theme} iconOnly onThemeChange={change} />
        <span className="etiket">Yalnız simge</span>
      </div>
    </div>
    <span className="durum" role="status">{last}</span>
  </div>;
}
