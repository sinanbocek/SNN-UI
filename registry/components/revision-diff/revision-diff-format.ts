// Revizyon karşılaştırmasının saf mantığı: durum sayıları, değişen alanlar ve Türkçe yazımlar. Değerler ABACUS ile yazılır
// (para kuruş tam sayısından, sayı "1.234,5", tarih "16.10.2026"). Eşleştirmeyi proje yapar; burada yalnız gösterim kararı var.
// Saf dosya: React yok, test edilir.
import { date as abacusDate, money } from "@snn/abacus-core";

export type RevisionStatus = "added" | "removed" | "changed" | "unmatched" | "same";
export type RevisionFieldFormat = "text" | "number" | "money" | "date";
/** Gösterilecek alan. `money` değeri kuruş tam sayısıdır. */
export type RevisionField = { key: string; label: string; format?: RevisionFieldFormat | undefined; currency?: "TRY" | "USD" | "EUR" | undefined; digits?: number | undefined };
/** Proje tarafından eşlenmiş satır. `before` önceki sürümdeki, `after` yeni sürümdeki değerlerdir; eklenen satırda yalnız `after`, silinende yalnız `before` olur. */
export type RevisionRow = { key: string; status: RevisionStatus; before?: Record<string, unknown> | undefined; after?: Record<string, unknown> | undefined; note?: string | undefined };
export type FieldChange = { field: RevisionField; before: string; after: string };

/** Süzgeç ve özetin sırası. */
export const STATUS_ORDER: RevisionStatus[] = ["added", "removed", "changed", "unmatched", "same"];
export const statusLabel: Record<RevisionStatus, string> = { added: "Eklendi", removed: "Silindi", changed: "Değişti", unmatched: "Eşlenmedi", same: "Aynı" };

const isEmpty = (value: unknown) => value == null || value === "";
const isoOf = (value: Date) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
const decimalsOf = (value: number) => (String(value).split(".")[1] ?? "").length;

/** Alan değerini yazar: para "₺1.234,50", sayı "1.234,5", tarih "16.10.2026", boş "–". Biçim verilmezse türe bakılır. */
export function formatValue(value: unknown, field: RevisionField): string {
  if (isEmpty(value)) return "–";
  const format = field.format ?? (typeof value === "number" ? "number" : value instanceof Date ? "date" : "text");
  // eslint-disable-next-line no-restricted-properties -- değer kuruş (alt birim); money.format bilerek kullanılır
  if (format === "money" && typeof value === "number") return money.format(value, { currency: field.currency ?? "TRY", kurus: true, zero: "symbol" });
  if (format === "number" && typeof value === "number") {
    const text = money.fmtDecimalGrouped(Math.abs(value), field.digits ?? Math.min(4, decimalsOf(value)));
    return value < 0 && text !== "—" ? `-${text}` : text;
  }
  if (format === "date") return abacusDate.format(value instanceof Date ? isoOf(value) : String(value), "short");
  return String(value);
}

/** Değişen alanlar: iki sürümde yazımı farklı olan alanlar. Yazımla karşılaştırmak 1250 ile 1250.0'ı aynı sayar. */
export function changedFields(row: RevisionRow, fields: readonly RevisionField[]): FieldChange[] {
  return fields.flatMap(field => {
    const before = formatValue(row.before?.[field.key], field), after = formatValue(row.after?.[field.key], field);
    return before === after ? [] : [{ field, before, after }];
  });
}

/** Satırın bir yanındaki dolu alanlar (eklenen, silinen ya da eşlenmeyen satır için). */
export function sideFields(values: Record<string, unknown> | undefined, fields: readonly RevisionField[]) {
  return fields.flatMap(field => (isEmpty(values?.[field.key]) ? [] : [{ field, value: formatValue(values?.[field.key], field) }]));
}

export function countByStatus(rows: readonly RevisionRow[]): Record<RevisionStatus, number> {
  const counts: Record<RevisionStatus, number> = { added: 0, removed: 0, changed: 0, unmatched: 0, same: 0 };
  for (const row of rows) counts[row.status] += 1;
  return counts;
}

/** Özet: "3 eklendi, 1 silindi, 4 değişti". Aynı kalanlar sayılmaz; fark yoksa "Fark yok". */
export function summaryText(counts: Record<RevisionStatus, number>) {
  const parts = STATUS_ORDER.filter(status => status !== "same" && counts[status] > 0).map(status => `${money.fmtDecimalGrouped(counts[status])} ${statusVerb[status]}`);
  return parts.length ? parts.join(", ") : "Fark yok";
}
const statusVerb: Record<RevisionStatus, string> = { added: "eklendi", removed: "silindi", changed: "değişti", unmatched: "eşlenmedi", same: "aynı" };

/** Satırın başlığı: birincil alanın yeni, yoksa önceki değeri; ikisi de yoksa anahtar. */
export function rowTitle(row: RevisionRow, primary: RevisionField) {
  const value = isEmpty(row.after?.[primary.key]) ? row.before?.[primary.key] : row.after?.[primary.key];
  return isEmpty(value) ? row.key : formatValue(value, primary);
}

/** Eşlenmeyen satırın hangi sürümde olduğu. */
export const unmatchedSide = (row: RevisionRow) => (row.after && !row.before ? "Yalnız yeni sürümde" : row.before && !row.after ? "Yalnız önceki sürümde" : "İki sürümde de eşi bulunamadı");
