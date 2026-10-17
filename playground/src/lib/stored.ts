import { useEffect, useState } from "react";

/** Tarayıcıda saklanan durum. Gizli pencerede ya da depolama kapalıyken sessizce bellekte kalır; okunan değer `accept` ile denetlenir. */
export function useStored<T>(key: string, initial: T, accept: (value: unknown) => value is T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed: unknown = JSON.parse(raw);
      return accept(parsed) ? parsed : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* depolama kapalı: bellekte kalır */ }
  }, [key, value]);
  return [value, setValue];
}
