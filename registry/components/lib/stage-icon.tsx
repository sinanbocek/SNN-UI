// İş panolarının aşama simgesi: sütun başlığının önünde aşamayı biçim ve renkle söyler (planlandı → bitti dolarak ilerler).
// project-board ve kanban-board kullanır (snn-stage-icon). Simgeler süstür; aşama adı başlıkta yazılıdır.

import type { StageKind } from "./stage-kind";

export { stageKind, type StageKind } from "./stage-kind";

const TONE: Record<StageKind, string> = {
  planned: "var(--text-muted)",
  progress: "var(--accent)",
  review: "var(--warning)",
  done: "var(--success)",
};

/** 16 px aşama simgesi; renk tona göre temel değişkenlerden (uyarı tonu mavi-gri). */
export function StageIcon({ kind }: { kind: StageKind }) {
  const color = TONE[kind];
  return <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flex: "none", color }}>
    {kind === "planned" && <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.4 2.2" strokeLinecap="round" />}
    {kind === "progress" && <><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" /><path d="M8 4a4 4 0 0 1 0 8z" fill="currentColor" /></>}
    {kind === "review" && <><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" /><path d="M8 4a4 4 0 1 1-4 4h4z" fill="currentColor" /></>}
    {kind === "done" && <><circle cx="8" cy="8" r="6.8" fill="currentColor" /><path d="m5.2 8.2 1.9 1.9 3.8-4" stroke="var(--surface, #fff)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>}
  </svg>;
}
