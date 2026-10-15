// Dalga 3: vitrin ve satış blokları galeri örnekleri. Veriler uydurmadır; görseller kendi yer tutucularımızdır.
import type { ReactNode } from "react";
import { ProductListingDemo } from "./product-listing";

export const dalga3Demos: Record<string, () => ReactNode> = {
  "product-listing": () => <ProductListingDemo />,
};
