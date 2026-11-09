import { useState } from "react";
import { PACKAGE_MANAGERS } from "../../../data/packageManagers";
import { suggestManager } from "../../../shared/lib/machine";
import type { Machine } from "../../../types/machine";

export const SCRIPT = "script";

/** Opens on the package manager of this computer; the script when none is known. */
export function useInstallMethod(machine: Machine) {
  const [chosen, setChosen] = useState<string | null>(null);
  const selected = chosen ?? suggestManager(PACKAGE_MANAGERS, machine)?.id ?? SCRIPT;
  return {
    selected,
    manager: PACKAGE_MANAGERS.find((manager) => manager.id === selected),
    select: setChosen,
  };
}
