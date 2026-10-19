// Kullanıcı menüsünün yazarak atlama (typeahead) eşleştirmesi. Saf mantık: React ve CSS içermez; test doğrudan bunu okur.
import { text } from "@snn/abacus-core";

/**
 * Menü öğesinin etiketi yazılan harflerle başlıyor mu? Türkçe harfe duyarsızdır:
 * "i" yazınca "İzinler", "c" yazınca "Çıkış" eşleşir. Boş yazı hiçbir şeyle eşleşmez.
 */
export function matchesTypeahead(label: string | undefined, typed: string): boolean {
  const key = text.searchKey(typed);
  return key !== "" && text.searchKey(label).startsWith(key);
}

/**
 * Tema anahtarında gösterilecek seçenekler. `wanted` sırası korunur; tekrar eden ve bilinmeyen değer atılır.
 * `wanted` verilmezse ya da elde hiç geçerli değer kalmazsa bütün seçenekler döner: anahtar hiç boş çizilmez.
 */
export function pickThemeOptions<T extends { value: string }>(all: readonly T[], wanted?: readonly string[]): T[] {
  const picked = [...new Set(wanted ?? [])].map(value => all.find(option => option.value === value)).filter((option): option is T => option !== undefined);
  return picked.length ? picked : [...all];
}

export type PanelSide = "bottom" | "top" | "right";
export type PanelAlign = "start" | "center" | "end";
type Box = { left: number; top: number; right: number; bottom: number; width: number; height: number };

/**
 * Açılır panelin ekran konumu. `side` panelin açma düğmesine göre yanıdır; sığmazsa karşı yana döner. `align` yan boyunca hizadır:
 * alt/üstte yatay (start = sol kenar), sağda dikey (start = üst kenar; sol alt köşedeki düğme için "end"). Panel kenarlardan `margin` içeride kalır.
 * `origin` ölçeklenme noktasıdır (panelin kendi koordinatında).
 */
export function placePanel(trigger: Box, panel: { width: number; height: number }, viewport: { width: number; height: number }, side: PanelSide = "bottom", align: PanelAlign = "end", gap = 8, margin = 12) {
  const clampX = (x: number) => Math.min(Math.max(margin, x), viewport.width - panel.width - margin);
  const clampY = (y: number) => Math.min(Math.max(margin, y), viewport.height - panel.height - margin);
  if (side === "right") {
    const right = trigger.right + gap;
    const fits = right + panel.width <= viewport.width - margin;
    const leftSide = trigger.left - gap - panel.width;
    const left = fits || leftSide < margin ? clampX(right) : leftSide;
    const wanted = align === "start" ? trigger.top : align === "center" ? trigger.top + trigger.height / 2 - panel.height / 2 : trigger.bottom - panel.height;
    const top = clampY(wanted);
    const originY = Math.min(Math.max(0, trigger.top + trigger.height / 2 - top), panel.height);
    return { left, top, side: (left >= trigger.right ? "right" : "left") as "right" | "left", origin: { x: left >= trigger.right ? 0 : panel.width, y: originY } };
  }
  const wanted = align === "start" ? trigger.left : align === "center" ? trigger.left + trigger.width / 2 - panel.width / 2 : trigger.right - panel.width;
  const left = clampX(wanted);
  const below = trigger.bottom + gap, above = trigger.top - gap - panel.height;
  const belowFits = below + panel.height <= viewport.height - margin, aboveFits = above >= margin;
  const up = side === "top" ? aboveFits || !belowFits : !belowFits && aboveFits;
  const top = up ? above : below;
  return { left, top, side: (up ? "top" : "bottom") as "top" | "bottom", origin: { x: 0, y: up ? panel.height : 0 } };
}
