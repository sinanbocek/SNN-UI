// Görüş sahnesinin saf mantığı: sarmalayan gezinme, baş harfler ve yazımlar. Sayılar ABACUS'tandır.
import { text } from "@snn/abacus-core";

/** Sekmeler arasında bir adım: listenin sonunda başa, başında sona sarar. */
export function wrapIndex(index: number, step: number, count: number): number {
  if (count <= 0) return 0;
  return (((index + step) % count) + count) % count;
}

/** Portre yer tutucusu için baş harfler (en çok iki): "Elif Aksoy" → "EA"; Türkçe büyük harf kurallıdır. */
export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => text.upper(part[0] ?? "")).join("");
}

export const tabLabel = (name: string, role: string): string => `${name}, ${role}`;
export const liveText = (name: string): string => `${name} görüşü gösteriliyor.`;
export const portraitLabel = (name: string, role: string): string => `${name}, ${role} portresi`;
/** Geçiş yönü: sonraki kişi sağdan, önceki soldan gelir (sarmada da seçilen kişinin sırasına bakar). */
export const directionOf = (from: number, to: number): 1 | -1 => to >= from ? 1 : -1;
