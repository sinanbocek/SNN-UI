// Giriş alanları ve tablo (issue #23, ilk dalga): Arc'tan uyarlanıp ABACUS'a bağlanan parçaların galeri örnekleri.
import type { ReactNode } from "react";
import { SortableDataTableDemo } from "./sortable-data-table";
import { MoneyInputDemo } from "./money-input";
import { NumberFieldDemo } from "./number-field";
import { CalendarDemo, DatePickerDemo } from "./calendar";
import { FileDropzoneDemo } from "./file-dropzone";
import { StepperDemo } from "./stepper";
import { RevisionDiffDemo } from "./revision-diff";

export const inputDemos: Record<string, () => ReactNode> = {
  "sortable-data-table": () => <SortableDataTableDemo />,
  "money-input": () => <MoneyInputDemo />,
  "number-field": () => <NumberFieldDemo />,
  "calendar": () => <CalendarDemo />,
  "date-picker": () => <DatePickerDemo />,
  "file-dropzone": () => <FileDropzoneDemo />,
  "stepper": () => <StepperDemo />,
  "revision-diff": () => <RevisionDiffDemo />,
};
