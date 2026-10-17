// Arc dalga 5 örnekleri (Arc b40c890, MIT). Her bileşenin örneği kendi dosyasındadır.
import type { ReactNode } from "react";
import { ActionButtonDemo } from "./action-button";
import { ConfirmMorphDemo } from "./confirm-morph";
import { CopyButtonDemo } from "./copy-button";
import { ExpandingButtonGroupDemo } from "./expanding-button-group";
import { ExpandingSearchDemo } from "./expanding-search";
import { FloatingButtonGroupDemo } from "./floating-button-group";
import { IconMorphDemo } from "./icon-morph";
import { InlineEditDemo } from "./inline-edit";
import { MentionInputDemo } from "./mention-input";
import { PasswordFieldDemo } from "./password-field";
import { PasswordStrengthDemo } from "./password-strength";
import { ReactionsDemo } from "./reactions";
import { ThemeSwitchDemo } from "./theme-switch";
import { UserMenuDemo } from "./user-menu";

export const arc5Demos: Record<string, () => ReactNode> = {
  "action-button": () => <ActionButtonDemo />,
  "confirm-morph": () => <ConfirmMorphDemo />,
  "copy-button": () => <CopyButtonDemo />,
  "expanding-button-group": () => <ExpandingButtonGroupDemo />,
  "expanding-search": () => <ExpandingSearchDemo />,
  "floating-button-group": () => <FloatingButtonGroupDemo />,
  "icon-morph": () => <IconMorphDemo />,
  "inline-edit": () => <InlineEditDemo />,
  "mention-input": () => <MentionInputDemo />,
  "password-field": () => <PasswordFieldDemo />,
  "password-strength": () => <PasswordStrengthDemo />,
  "reactions": () => <ReactionsDemo />,
  "theme-switch": () => <ThemeSwitchDemo />,
  "user-menu": () => <UserMenuDemo />,
};
