import { useEffect, useState } from "react";
import { type Arch, type Distro, detect, type Os, readHints } from "./machine";

export const DISTROS = [
  ["debian", "distroDebian"],
  ["fedora", "distroFedora"],
  ["suse", "distroSuse"],
  ["arch", "distroArch"],
  ["manjaro", "distroManjaro"],
  ["other", "distroOther"],
] as const;

const SAVED_DISTRO = "bonk-distro";

const savedDistro = (): Distro | undefined => {
  try {
    const value = localStorage.getItem(SAVED_DISTRO);
    return DISTROS.some(([id]) => id === value) ? (value as Distro) : undefined;
  } catch {
    return undefined;
  }
};

const saveDistro = (distro: Distro) => {
  try {
    localStorage.setItem(SAVED_DISTRO, distro);
  } catch {
    // Sans stockage, le choix vaut pour cette visite.
  }
};

export const OS_NAMES: Record<Os, string> = {
  linux: "Linux",
  windows: "Windows",
  macos: "macOS",
  android: "Android",
  other: "",
};

export function useMachine() {
  const [detected, setDetected] = useState(() => detect(navigator.userAgent, navigator.platform));
  const [os, setOs] = useState<Os | null>(null);
  const [arch, setArch] = useState<Arch | "" | null>(null);
  const [distro, setDistro] = useState<Distro | null>(savedDistro() ?? null);

  useEffect(() => {
    let current = true;
    readHints().then((hints) => {
      if (current) {
        setDetected(detect(navigator.userAgent, navigator.platform, hints));
      }
    });
    return () => {
      current = false;
    };
  }, []);

  return {
    detected,
    os: os ?? detected.os,
    arch: (arch ?? detected.arch ?? "") as Arch | "",
    distro: distro ?? detected.distro ?? ("debian" as Distro),
    setOs,
    setArch,
    setDistro: (value: Distro) => {
      saveDistro(value);
      setDistro(value);
    },
  };
}

export type MachineState = ReturnType<typeof useMachine>;
