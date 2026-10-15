// Dalga 1 (kalan 10 blok) galeri örnekleri.
import type { ReactNode } from "react";
import { SettingsCommandDemo } from "./settings-command";
import { TeamDirectoryDemo } from "./team-directory";

import { RolesPermissionsDemo } from "./roles-permissions";

import { InboxTriageDemo } from "./inbox-triage";

import { ReleaseReadinessDemo } from "./release-readiness";

import { MultiStepFormDemo } from "./multi-step-form";

import { WeekCalendarDemo } from "./week-calendar";

import { AvailabilityPickerDemo } from "./availability-picker";

import { ProjectBoardDemo } from "./project-board";

import { KanbanBoardDemo } from "./kanban-board";

export const dalga1Demos: Record<string, () => ReactNode> = {
  "settings-command": () => <SettingsCommandDemo />,
  "team-directory": () => <TeamDirectoryDemo />,
  "roles-permissions": () => <RolesPermissionsDemo />,
  "inbox-triage": () => <InboxTriageDemo />,
  "release-readiness": () => <ReleaseReadinessDemo />,
  "multi-step-form": () => <MultiStepFormDemo />,
  "week-calendar": () => <WeekCalendarDemo />,
  "availability-picker": () => <AvailabilityPickerDemo />,
  "project-board": () => <ProjectBoardDemo />,
  "kanban-board": () => <KanbanBoardDemo />,
};
