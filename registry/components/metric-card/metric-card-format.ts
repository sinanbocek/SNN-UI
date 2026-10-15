// Gösterge kartının saf biçim mantığı: değeri sayaç için (önek, sayı, ek) parçalara ayırır. React içermez; test doğrudan bunu okur.
import { money } from "@snn/abacus-core";
import { formatMoney, formatMoneyCompact } from "../lib/chart-format";

/** "number": düz sayı ("1.234,5"). "money": tam tutar ("₺1.250.000"). "compact-money": kısaltılmış tutar ("₺1,25Mn"). */
export type MetricFormat = "number" | "money" | "compact-money";

export interface MetricDisplay { prefix: string; value: number; decimals: number; suffix: string }

/**
 * Değeri sayaca verilecek parçalara böler. Tutarın yazımı ABACUS'tan gelir (simge, ayraç, "Mn" gibi ek), burada yalnız ayrıştırılır;
 * sayaç böylece rakamları döndürürken simgeyi ve eki sabit tutar.
 */
export function metricDisplay(value: number, format: MetricFormat = "number", currency = "TRY", decimals = 0): MetricDisplay {
  if (format === "number") return { prefix: "", value, decimals, suffix: "" };
  const text = format === "money" ? formatMoney(value, decimals, currency) : formatMoneyCompact(value, currency);
  const match = text.match(/^(-?[^\d]*)(\d[\d.,]*)(.*)$/);
  const parsed = match ? money.parseNumber(match[2] ?? "") : null;
  if (!match || parsed === null) return { prefix: text, value: Number.NaN, decimals: 0, suffix: "" };
  const fraction = (match[2] ?? "").split(",")[1];
  return { prefix: match[1] ?? "", value: parsed, decimals: fraction ? fraction.length : 0, suffix: match[3] ?? "" };
}
