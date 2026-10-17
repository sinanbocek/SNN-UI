// Arc dalga 6 örnekleri (Arc b40c890, MIT; login-split ve login-immersive temiz oda). Her örnek kendi dosyasındadır.
import type { ReactNode } from "react";
import { AccordionDemo } from "./accordion";
import { AvatarGroupDemo } from "./avatar-group";
import { BillingToggleDemo } from "./billing-toggle";
import { ColorPickerDemo } from "./color-picker";
import { EmptyStatesDemo } from "./empty-states";
import { FileUploadDemo } from "./file-upload";
import { HeroSectionDemo } from "./hero-section";
import { LoginCenteredDemo } from "./login-centered";
import { LoginImmersiveDemo } from "./login-immersive";
import { LoginSplitDemo } from "./login-split";
import { NotificationCenterDemo } from "./notification-center";
import { OtpInputDemo } from "./otp-input";
import { PlanComparisonDemo } from "./plan-comparison";
import { RadioCardsDemo } from "./radio-cards";
import { SignInDemo } from "./sign-in";
import { SignaturePadDemo } from "./signature-pad";
import { SignupFormDemo } from "./signup-form";
import { SiteFooterDemo } from "./site-footer";
import { TextMorphDemo } from "./text-morph";
import { ToastStackDemo } from "./toast-stack";

export const arc6Demos: Record<string, () => ReactNode> = {
  "accordion": () => <AccordionDemo />,
  "avatar-group": () => <AvatarGroupDemo />,
  "billing-toggle": () => <BillingToggleDemo />,
  "color-picker": () => <ColorPickerDemo />,
  "empty-states": () => <EmptyStatesDemo />,
  "file-upload": () => <FileUploadDemo />,
  "hero-section": () => <HeroSectionDemo />,
  "login-centered": () => <LoginCenteredDemo />,
  "login-immersive": () => <LoginImmersiveDemo />,
  "login-split": () => <LoginSplitDemo />,
  "notification-center": () => <NotificationCenterDemo />,
  "otp-input": () => <OtpInputDemo />,
  "plan-comparison": () => <PlanComparisonDemo />,
  "radio-cards": () => <RadioCardsDemo />,
  "sign-in": () => <SignInDemo />,
  "signature-pad": () => <SignaturePadDemo />,
  "signup-form": () => <SignupFormDemo />,
  "site-footer": () => <SiteFooterDemo />,
  "text-morph": () => <TextMorphDemo />,
  "toast-stack": () => <ToastStackDemo />,
};
