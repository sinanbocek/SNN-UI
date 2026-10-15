// Gösterge bloklarının ortak yazımı: adet, TRY tutar ve yüzde türleri için değer, eksen etiketi ve değişim metni. Hepsi ABACUS'tandır.
import { math } from "@snn/abacus-core";
import { formatChange, formatCompact, formatMoney, formatMoneyCompact, formatNumber, formatPercent } from "./chart-format";

/** "count": adet ("1.234"); "money": TRY tutar ("₺1.250.000"); "percent": zaten yüzde olan sayı (12,3 → "%12,3"). */
export type MetricKind = "count" | "money" | "percent";

/** Tam yazım: ipucu, tablo, ekran okuyucu. */
export function metricValueText(kind: MetricKind, value: number): string {
  if (kind === "money") return formatMoney(value, 0);
  if (kind === "percent") return formatPercent(value, 1, true);
  return formatNumber(value, 0);
}

/** Kısa yazım: kutu ve eksen. Tutar "₺1,25Mn", adet "12,5B", yüzde "%12". */
export function metricShortText(kind: MetricKind, value: number): string {
  if (kind === "money") return formatMoneyCompact(value);
  if (kind === "percent") return formatPercent(value, 0);
  return formatCompact(value);
}

export interface MetricChange {
  /** İşaretli metin: "+%11,7" ya da (yüzde türünde) "+0,1 puan". Önceki yoksa "—". */
  text: string;
  /** Yönü yalnız renge bırakmamak için ok: "▲", "▼", "▬". */
  arrow: string;
  direction: 1 | -1 | 0;
  /** Ekran okuyucu: "yüzde 11,7 arttı". */
  spoken: string;
}

/** Değişim: adet ve tutarda yüzde değişim (`math.percentChange`), yüzde türünde puan farkı. */
export function metricChange(kind: MetricKind, current: number, previous: number | undefined): MetricChange {
  if (previous === undefined) return { text: "—", arrow: "▬", direction: 0, spoken: "karşılaştırma yok" };
  if (kind === "percent") {
    const diff = math.round(current - previous, 1);
    const direction = diff > 0 ? 1 : diff < 0 ? -1 : 0;
    const text = `${direction > 0 ? "+" : ""}${formatNumber(diff, 1)} puan`;
    return { text, arrow: direction > 0 ? "▲" : direction < 0 ? "▼" : "▬", direction, spoken: direction === 0 ? "değişmedi" : `${formatNumber(Math.abs(diff), 1)} puan ${direction > 0 ? "arttı" : "azaldı"}` };
  }
  const change = math.percentChange(current, previous);
  if (change === null) return { text: "—", arrow: "▬", direction: 0, spoken: "karşılaştırma yok" };
  const direction = change > 0 ? 1 : change < 0 ? -1 : 0;
  return { text: formatChange(current, previous, 1), arrow: direction > 0 ? "▲" : direction < 0 ? "▼" : "▬", direction, spoken: direction === 0 ? "değişmedi" : `yüzde ${formatNumber(Math.abs(change), 1)} ${direction > 0 ? "arttı" : "azaldı"}` };
}

/** Sayaç için önek, sayı, ek, ondalık: tutar kısa yazılır ("₺", 1,25, "Mn"), yüzde "%" önekiyle. */
export function metricCounter(kind: MetricKind, value: number): { prefix: string; value: number; decimals: number; suffix: string } {
  if (kind === "percent") return { prefix: "%", value, decimals: 1, suffix: "" };
  if (kind === "money") {
    const text = formatMoneyCompact(value);
    const match = text.match(/^(-?[^\d]*)(\d[\d.,]*)(.*)$/);
    const number = match ? Number((match[2] ?? "").replace(/\./g, "").replace(",", ".")) : Number.NaN;
    if (match && Number.isFinite(number)) return { prefix: match[1] ?? "", value: number, decimals: (match[2] ?? "").split(",")[1]?.length ?? 0, suffix: match[3] ?? "" };
  }
  return { prefix: "", value, decimals: 0, suffix: "" };
}
