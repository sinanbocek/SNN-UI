// Giriş alanları ve tablo (issue #23, ilk dalga): Arc'tan uyarlanıp ABACUS'a bağlanan parçaların galeri örnekleri.
import type { ReactNode } from "react";
import { SortableDataTableDemo } from "./sortable-data-table";
import { MoneyInputDemo } from "./money-input";
import { NumberFieldDemo } from "./number-field";
import { CalendarDemo, DatePickerDemo } from "./calendar";

export const inputDemos: Record<string, () => ReactNode> = {
  "sortable-data-table": () => <SortableDataTableDemo />,
  "money-input": () => <MoneyInputDemo />,
  "number-field": () => <NumberFieldDemo />,
  "calendar": () => <CalendarDemo />,
  "date-picker": () => <DatePickerDemo />,
};
