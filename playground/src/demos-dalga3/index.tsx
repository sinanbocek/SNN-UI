// Dalga 3: vitrin ve satış blokları galeri örnekleri. Veriler uydurmadır; görseller kendi yer tutucularımızdır.
import type { ReactNode } from "react";
import { ProductListingDemo } from "./product-listing";
import { ProductDetailDemo } from "./product-detail";
import { CartDrawerDemo } from "./cart-drawer";
import { CheckoutSummaryDemo } from "./checkout-summary";
import { WalletCardDemo } from "./wallet-card";
import { PaymentFlowDemo } from "./payment-flow";
import { HeroSignupDemo } from "./hero-signup";
import { ScrollStoryDemo } from "./scroll-story";
import { SpotlightGridDemo } from "./spotlight-grid";
import { ProductGalleryDemo } from "./product-gallery";
import { LightboxGalleryDemo } from "./lightbox-gallery";
import { PhotoGridDemo } from "./photo-grid";
import { TestimonialStageDemo } from "./testimonial-stage";
import { TeamShowcaseDemo } from "./team-showcase";
import { MediaPlayerDemo } from "./media-player";
import { WalletStackDemo } from "./wallet-stack";
import { CoverFlowDemo } from "./cover-flow";

export const dalga3Demos: Record<string, () => ReactNode> = {
  "product-listing": () => <ProductListingDemo />,
  "product-detail": () => <ProductDetailDemo />,
  "cart-drawer": () => <CartDrawerDemo />,
  "checkout-summary": () => <CheckoutSummaryDemo />,
  "wallet-card": () => <WalletCardDemo />,
  "payment-flow": () => <PaymentFlowDemo />,
  "hero-signup": () => <HeroSignupDemo />,
  "scroll-story": () => <ScrollStoryDemo />,
  "spotlight-grid": () => <SpotlightGridDemo />,
  "product-gallery": () => <ProductGalleryDemo />,
  "lightbox-gallery": () => <LightboxGalleryDemo />,
  "photo-grid": () => <PhotoGridDemo />,
  "testimonial-stage": () => <TestimonialStageDemo />,
  "team-showcase": () => <TeamShowcaseDemo />,
  "media-player": () => <MediaPlayerDemo />,
  "wallet-stack": () => <WalletStackDemo />,
  "cover-flow": () => <CoverFlowDemo />,
};
