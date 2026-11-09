import { useState } from "react";
import { APPS } from "../../../data/releases";
import { useOsDetection } from "../../../shared/hooks/useOsDetection";
import { type Suggestion, suggestBuild } from "../../../shared/lib/machine";

export type DownloadChoice = Suggestion & { id: string };

const SAVED = "bonk-download";

const CHOICES: readonly DownloadChoice[] = APPS.flatMap((platform) =>
  platform.builds.map((build) => ({ id: `${platform.id}/${build.arch}`, platform, build })),
);

const saved = (): string | null => {
  try {
    return localStorage.getItem(SAVED);
  } catch {
    return null;
  }
};

const save = (id: string) => {
  try {
    localStorage.setItem(SAVED, id);
  } catch {
    // Without storage the choice lasts for this visit.
  }
};

/** The installer for this computer; a choice made by hand wins and is kept on the device. */
export function useSmartDownload() {
  const machine = useOsDetection();
  const [chosen, setChosen] = useState(saved);
  const byHand = CHOICES.find((choice) => choice.id === chosen);
  const detected = suggestBuild(APPS, machine);
  const suggestion: DownloadChoice | undefined =
    byHand ??
    (detected &&
      CHOICES.find((c) => c.build === detected.build && c.platform === detected.platform));
  return {
    machine,
    suggestion,
    choices: CHOICES,
    choose: (id: string) => {
      save(id);
      setChosen(id);
    },
  };
}
