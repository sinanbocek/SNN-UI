"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

/** Değeri aralığa sıkıştırır. */
export const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Seri rengi: ilk dört seri paletten (--series-1…4), sonrası nötr basamaklardan. Palet dosyası `snn-chart-palette`. */
export function seriesColor(index: number): string {
  const neutral = ["var(--neutral-8)", "var(--neutral-7)", "var(--neutral-6)", "var(--neutral-5)"];
  return index < 4 ? `var(--series-${index + 1})` : neutral[(index - 4) % neutral.length]!;
}

/** Karakter sayısından yaklaşık yazı genişliği (piksel). Yerleşim kararları içindir; ölçülü genişlik değildir. */
export const textWidth = (text: string, perChar = 7) => text.length * perChar;

/**
 * Etiketleri birbirinden uzaklaştırır: merkezler soldan sağa itilir, sonra kenarlara sığdırılır.
 * Girdi merkezlere göre sıralı olmalıdır; sonuç aynı sıradadır.
 */
export function spreadLabels(centers: number[], widths: number[], total: number, gap = 8): number[] {
  const out = centers.map((center, at) => clamp(center, widths[at]! / 2, Math.max(widths[at]! / 2, total - widths[at]! / 2)));
  for (let at = 1; at < out.length; at++) {
    const need = (widths[at]! + widths[at - 1]!) / 2 + gap;
    if (out[at]! - out[at - 1]! < need) out[at] = out[at - 1]! + need;
  }
  for (let at = out.length - 1; at >= 0; at--) {
    const edge = at === out.length - 1 ? total - widths[at]! / 2 : out[at + 1]! - (widths[at]! + widths[at + 1]!) / 2 - gap;
    if (out[at]! > edge) out[at] = edge;
  }
  return out;
}

const subscribeNothing = () => () => {};
/** "Hareketi azalt" tercihi yalnız tarayıcıda bilinir; sunucu çıktısıyla eşleşmek için ilk çizimde false döner. */
export function useReducedMotionSafe(): boolean {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** Bir öğenin genişliğini (piksel) izler. Öğe sonradan çizilirse (boş durumdan veriye geçişte) de yakalanır. */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const observed = useRef<T | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const [width, setWidth] = useState(0);
  // Her çizimde öğenin değişip değişmediğine bakılır; değiştiyse izleme yeni öğeye taşınır.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- bağımlılık listesi bilerek yok: öğe değişimi her çizimde denetlenir
  useEffect(() => {
    const node = ref.current;
    if (node === observed.current) return;
    observer.current?.disconnect();
    observed.current = node;
    if (!node) return;
    setWidth(node.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    observer.current = new ResizeObserver(() => setWidth(node.clientWidth));
    observer.current.observe(node);
  });
  useEffect(() => () => observer.current?.disconnect(), []);
  return [ref, width] as const;
}

/** Öğe görünüm alanında mı? Görünmeyen ya da gizli sekmedeki canlı çizimleri durdurmak için. */
export function useOnScreen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(records => setVisible(records.some(record => record.isIntersecting)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const change = () => setTabVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  return [ref, visible && tabVisible] as const;
}
