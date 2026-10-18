// Huni grafiğinin saf mantığı: görünüme göre bant dizilimi, oranlar ve yazımlar. Sayılar ABACUS'tandır (chart-format).
import { formatChange, formatCompact, formatMoney, formatMoneyCompact, formatNumber, formatRatio } from "../lib/chart-format";

export interface FunnelPart { key: string; label: string; value: number }
export interface FunnelStep { key: string; label: string; value: number; /** Adımın parça kırılımı (isteğe bağlı). Toplamı `value` olmalıdır. */ parts?: FunnelPart[] | undefined }
export type FunnelKind = "count" | "money";
/** "total": tek bant, "split": parçalar üst üste, başka bir değer: yalnız o parça (parça anahtarı). */
export type FunnelView = "total" | "split" | string;

export interface FunnelBand { key: string; label: string; /** Her adımda bandın üst ve alt kenarı, 0–1 arası (genişlik ekseni oranı). */ top: number[]; bottom: number[] }

/** Adımlardaki parça anahtarları, ilk görülme sırasıyla. */
export function partKeys(steps: FunnelStep[]): FunnelPart[] {
  const seen = new Map<string, FunnelPart>();
  for (const step of steps) for (const part of step.parts ?? []) if (!seen.has(part.key)) seen.set(part.key, part);
  return [...seen.values()];
}

/**
 * Görünüme göre bantları dizer. Toplam: tek bant, yüksekliği adım değeri / en büyük değer.
 * Bölünmüş: parçalar aralarında `gap` boşlukla üst üste. Tek parça: bant en büyük değerine göre ölçeklenir ve yüksekliği doldurur.
 */
export function funnelBands(steps: FunnelStep[], view: FunnelView, gap = .015): FunnelBand[] {
  if (!steps.length) return [];
  const parts = partKeys(steps);
  const valueOf = (step: FunnelStep, key: string) => step.parts?.find(part => part.key === key)?.value ?? 0;
  if (view === "total" || (view !== "split" && !parts.some(part => part.key === view))) {
    const max = Math.max(...steps.map(step => step.value), 0) || 1;
    const half = steps.map(step => step.value / max / 2);
    return [{ key: "total", label: "Toplam", top: half.map(h => .5 - h), bottom: half.map(h => .5 + h) }];
  }
  if (view === "split") {
    const max = Math.max(...steps.map(step => step.value), 0) || 1;
    return parts.map((part, at) => {
      const top: number[] = [], bottom: number[] = [];
      for (const step of steps) {
        const height = step.value / max, room = Math.max(0, height - gap * (parts.length - 1));
        const share = step.value > 0 ? valueOf(step, part.key) / step.value : 0;
        const before = parts.slice(0, at).reduce((sum, other) => sum + (step.value > 0 ? valueOf(step, other.key) / step.value : 0), 0);
        const start = (1 - height) / 2 + before * room + gap * at;
        top.push(start); bottom.push(start + share * room);
      }
      return { key: part.key, label: part.label, top, bottom };
    });
  }
  const own = steps.map(step => valueOf(step, view));
  const max = Math.max(...own, 0) || 1;
  const part = parts.find(item => item.key === view)!;
  return [{ key: part.key, label: part.label, top: own.map(v => .5 - v / max / 2), bottom: own.map(v => .5 + v / max / 2) }];
}

/** Bir adımın bir önceki adımdan ve ilk adımdan oranları (0–1); ilk adımın önceki oranı yoktur. */
export function stepRatios(steps: FunnelStep[], at: number): { previous: number | null; first: number } {
  const step = steps[at], first = steps[0];
  if (!step || !first) return { previous: null, first: 0 };
  const before = steps[at - 1];
  return { previous: before && before.value > 0 ? step.value / before.value : null, first: first.value > 0 ? step.value / first.value : 0 };
}

export const countText = (kind: FunnelKind, value: number) => kind === "money" ? formatMoney(value, 0) : formatNumber(value, 0);
export const shortText = (kind: FunnelKind, value: number) => kind === "money" ? formatMoneyCompact(value) : formatCompact(value);
export const ratioText = (ratio: number) => formatRatio(ratio, 1);
/** Düşüş yazımı: "↓ 340 (-%12,3)". */
export function dropText(kind: FunnelKind, from: number, to: number): string {
  return `↓ ${countText(kind, Math.max(0, from - to))} (${formatChange(to, from, 1)})`;
}

/** Ekran okuyucu: "Ödeme: 540, önceki adımdan %45 kaldı, ilk adıma göre %12". */
export function stepAnnouncement(kind: FunnelKind, steps: FunnelStep[], at: number): string {
  const step = steps[at];
  if (!step) return "";
  const { previous, first } = stepRatios(steps, at);
  return `${step.label}: ${countText(kind, step.value)}${previous === null ? "" : `, önceki adımdan ${ratioText(previous)} kaldı`}, ilk adıma göre ${ratioText(first)}`;
}
