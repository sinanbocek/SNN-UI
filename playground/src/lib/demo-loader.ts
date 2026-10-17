// Bileşen örnekleri ayrı bir parçada durur: ana sayfa, renk ve tipografi sayfası onları indirmeden açılır.
import { useEffect, useState, type ReactNode } from "react";

export type Demos = Record<string, () => ReactNode>;
let loaded: Demos | null = null;
let pending: Promise<Demos> | null = null;

/** Örnek parçasını bir kez indirir; sonraki çağrılar aynı sözü döndürür. */
export const loadDemos = () => (pending ??= import("../demos").then(module => (loaded = module.demos)));

/** Örnekler hazırsa döndürür; değilse indirmeyi başlatır ve null döndürür. */
export function useDemos(): Demos | null {
  const [demos, setDemos] = useState(loaded);
  useEffect(() => {
    if (demos) return;
    let active = true;
    loadDemos().then(result => { if (active) setDemos(result); }, () => { pending = null; });
    return () => { active = false; };
  }, [demos]);
  return demos;
}
