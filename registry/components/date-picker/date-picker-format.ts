// Tarih kutusunun yazımı ABACUS `date.format` ile (giris-alanlari-standardi.md). Arc tarayıcının yerel biçimleyicisini
// ve onun parçalara ayırma işlevini kullanıyordu; burada ABACUS çıktısı harf-rakam öbekleri ve ayraçlar olarak bölünür.
// Saf dosya: React yok, test edilir.
import { date as abacusDate } from "@snn/abacus-core";
import { isoKey } from "../calendar/calendar-format";

/** Kutuda gösterilebilen ABACUS biçimleri: "16 Ekim 2026", "16.10.2026", "16 Eki. Cum.". Hepsi günü ve ayı içerir. */
export type DatePickerStyle = "long" | "short" | "dayMonthWeekday";

/** Bir tarih parçası: gün, ay ya da yıl öbeği ("part") ya da aradaki ayraç ("literal"). */
export type DatePart = { type: "part" | "literal"; value: string };

/** Tarihi ABACUS ile yazar: 16 Ekim 2026 → "16 Ekim 2026". */
export const formatPickerDate = (value: Date, style: DatePickerStyle = "long") => abacusDate.format(isoKey(value), style);

/** Yazılı tarihi parçalara böler; her öbek kendi yerinde döner, ayraçlar yerinde kalır. "16.10.2026" → 16 . 10 . 2026 */
export function dateParts(value: Date, style: DatePickerStyle = "long"): DatePart[] {
  return (formatPickerDate(value, style).match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu) ?? []).map(chunk => ({ type: /[\p{L}\p{N}]/u.test(chunk) ? "part" : "literal", value: chunk }));
}
