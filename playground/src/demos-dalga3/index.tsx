// Dalga 3: vitrin ve satış blokları galeri örnekleri. Veriler uydurmadır; görseller kendi yer tutucularımızdır.
import type { ReactNode } from "react";
import { ProductListingDemo } from "./product-listing";
import { ProductDetailDemo } from "./product-detail";
import { CartDrawerDemo } from "./cart-drawer";
import { CheckoutSummaryDemo } from "./checkout-summary";
import { WalletCardDemo } from "./wallet-card";

export const dalga3Demos: Record<string, () => ReactNode> = {
  "product-listing": () => <ProductListingDemo />,
  "product-detail": () => <ProductDetailDemo />,
  "cart-drawer": () => <CartDrawerDemo />,
  "checkout-summary": () => <CheckoutSummaryDemo />,
  "wallet-card": () => <WalletCardDemo />,
};
