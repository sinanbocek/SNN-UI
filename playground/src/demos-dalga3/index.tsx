// Dalga 3: vitrin ve satış blokları galeri örnekleri. Veriler uydurmadır; görseller kendi yer tutucularımızdır.
import type { ReactNode } from "react";
import { ProductListingDemo } from "./product-listing";
import { ProductDetailDemo } from "./product-detail";

export const dalga3Demos: Record<string, () => ReactNode> = {
  "product-listing": () => <ProductListingDemo />,
  "product-detail": () => <ProductDetailDemo />,
};
