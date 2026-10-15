import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { components } from "../../scripts/catalog.mjs";
import { demos } from "./demos";

type Entry = { name: string; title: string; description: string; use: string; note?: string };
const entries = components as Entry[];
const accents = [["blue", "Mavi"], ["violet", "Menekşe"], ["green", "Yeşil"], ["coral", "Mercan"], ["rose", "Gül"], ["neutral", "Nötr"]];

export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [accent, setAccent] = useState("blue");
  const [reduce, setReduce] = useState(false);
  const [current, setCurrent] = useState(entries[0]?.name ?? "");

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => { document.documentElement.dataset.accent = accent; }, [accent]);

  // Kaydırdıkça soldaki listede görünen bileşeni işaretle.
  useEffect(() => {
    const observer = new IntersectionObserver(records => {
      const visible = records.find(r => r.isIntersecting);
      if (visible) setCurrent(visible.target.id);
    }, { rootMargin: "-10% 0px -80% 0px" });
    document.querySelectorAll("section.demo").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion={reduce ? "always" : "user"}>
      <div className="shell">
        <nav className="nav" aria-label="Bileşenler">
          <h1>SNN-UI Galeri</h1>
          {entries.map(b => <a key={b.name} href={`#${b.name}`} aria-current={current === b.name}>{b.title}</a>)}
        </nav>
        <main className="main">
          <div className="bar" role="group" aria-label="Görünüm ayarları">
            <label>Tema
              <select value={theme} onChange={e => setTheme(e.target.value as "light" | "dark")}>
                <option value="light">Açık</option><option value="dark">Koyu</option>
              </select>
            </label>
            <label>Vurgu
              <select value={accent} onChange={e => setAccent(e.target.value)}>
                {accents.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label><input type="checkbox" checked={reduce} onChange={e => setReduce(e.target.checked)} /> Hareketi azalt</label>
            <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: ".85rem" }}>{entries.length} bileşen</span>
          </div>
          {entries.map(b => (
            <section key={b.name} id={b.name} className="demo">
              <h2>{b.title}</h2>
              <p className="tr">{b.description}</p>
              <code className="adi">@snn-ui/{b.name}</code>
              <div className="stage">{demos[b.name] ? demos[b.name]() : <span className="eksik">Bu bileşen için örnek henüz yazılmadı.</span>}</div>
              <pre className="kod">{b.use}</pre>
              {b.note && <p className="durum">{b.note}</p>}
            </section>
          ))}
        </main>
      </div>
    </MotionConfig>
  );
}
