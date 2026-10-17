// Aşama türünün saf seçimi (React içermez; test bunu okur). Simge: stage-icon.tsx.

export type StageKind = "planned" | "progress" | "review" | "done";

const PATTERNS: [StageKind, RegExp][] = [
  ["done", /done|complete|closed|bit|tamam/i],
  ["review", /review|check|qa|test|kontrol|onay/i],
  ["progress", /progress|doing|active|wip|s[uü]r|devam/i],
  ["planned", /todo|plan|backlog|queue|yap[iı]l|bekle|new/i],
];

/** Aşama türü: önce kimlik ve adda tanıdık sözcük aranır, yoksa sıraya bakılır (ilk planlandı, son bitti, sondan bir önceki kontrolde). */
export function stageKind(id: string, label: string, index: number, total: number): StageKind {
  for (const [kind, pattern] of PATTERNS) if (pattern.test(id) || pattern.test(label)) return kind;
  if (index === 0) return "planned";
  if (index === total - 1) return "done";
  return index === total - 2 && total > 3 ? "review" : "progress";
}
