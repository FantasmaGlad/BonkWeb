import { useState } from "react";
import { PACKAGE_MANAGERS } from "../../../data/packageManagers";
import { suggestManager } from "../../../shared/lib/machine";
import type { Machine } from "../../../types/machine";

/** Opens on the package manager of this computer, the first one when none is known. */
export function useInstallMethod(machine: Machine) {
  const [chosen, setChosen] = useState<string | null>(null);
  const suggested = suggestManager(PACKAGE_MANAGERS, machine) ?? PACKAGE_MANAGERS[0];
  const manager = PACKAGE_MANAGERS.find((candidate) => candidate.id === chosen) ?? suggested;
  return { manager, select: setChosen };
}
