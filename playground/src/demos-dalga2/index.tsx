// Dalga 2: grafik ve finans blokları galeri örnekleri. Veriler uydurmadır.
import type { ReactNode } from "react";
import { SplitBarDemo } from "./split-bar";

export const dalga2Demos: Record<string, () => ReactNode> = {
  "split-bar": () => <SplitBarDemo />,
};
