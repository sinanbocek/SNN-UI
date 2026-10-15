// Dalga 1 (kalan 10 blok) galeri örnekleri.
import type { ReactNode } from "react";
import { SettingsCommandDemo } from "./settings-command";
import { TeamDirectoryDemo } from "./team-directory";

export const dalga1Demos: Record<string, () => ReactNode> = {
  "settings-command": () => <SettingsCommandDemo />,
  "team-directory": () => <TeamDirectoryDemo />,
};
