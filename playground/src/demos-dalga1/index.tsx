// Dalga 1 (kalan 10 blok) galeri örnekleri.
import type { ReactNode } from "react";
import { SettingsCommandDemo } from "./settings-command";
import { TeamDirectoryDemo } from "./team-directory";

import { RolesPermissionsDemo } from "./roles-permissions";

import { InboxTriageDemo } from "./inbox-triage";

import { ReleaseReadinessDemo } from "./release-readiness";

import { MultiStepFormDemo } from "./multi-step-form";

export const dalga1Demos: Record<string, () => ReactNode> = {
  "settings-command": () => <SettingsCommandDemo />,
  "team-directory": () => <TeamDirectoryDemo />,
  "roles-permissions": () => <RolesPermissionsDemo />,
  "inbox-triage": () => <InboxTriageDemo />,
  "release-readiness": () => <ReleaseReadinessDemo />,
  "multi-step-form": () => <MultiStepFormDemo />,
};
