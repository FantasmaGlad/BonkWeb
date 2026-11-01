import { type Download, FAMILIES, type Family } from "./downloads";
import { type Catalog, type CatalogImage, imagesOf } from "./images";

export type Os = "linux" | "windows" | "macos" | "other";
export type Arch = "x86_64" | "aarch64" | "i686";
export type Distro = "debian" | "fedora" | "suse" | "arch" | "manjaro" | "other";

export type Machine = {
  os: Os;
  /** Absent when the browser does not say; never guessed. */
  arch?: Arch | undefined;
  /** A browser rarely names the distribution: only some Linux builds of Firefox do. */
  distro?: Distro | undefined;
};

type Hints = { architecture?: string; bitness?: string };

const archOf = (agent: string, platform: string, hints: Hints): Arch | undefined => {
  if (hints.architecture === "arm") {
    return hints.bitness === "32" ? undefined : "aarch64";
  }
  if (hints.architecture === "x86") {
    return hints.bitness === "32" ? "i686" : "x86_64";
  }
  const text = `${agent} ${platform}`;
  if (/aarch64|arm64/i.test(text)) {
    return "aarch64";
  }
  if (/x86_64|x86-64|x64|amd64|wow64/i.test(text)) {
    return "x86_64";
  }
  return /i[3-6]86/i.test(text) ? "i686" : undefined;
};

const distroOf = (agent: string): Distro | undefined => {
  const names: [RegExp, Distro][] = [
    [/manjaro/i, "manjaro"],
    [/\barch\b/i, "arch"],
    [/ubuntu|debian|mint/i, "debian"],
    [/fedora|red hat|rocky|alma/i, "fedora"],
    [/suse/i, "suse"],
  ];
  return names.find(([name]) => name.test(agent))?.[1];
};

export const detect = (agent: string, platform: string, hints: Hints = {}): Machine => {
  const os: Os = /android|iphone|ipad|cros/i.test(agent)
    ? "other"
    : /windows/i.test(agent)
      ? "windows"
      : /mac os x|macintosh/i.test(agent)
        ? "macos"
        : /linux|x11/i.test(agent)
          ? "linux"
          : "other";
  return {
    os,
    arch: os === "macos" ? undefined : archOf(agent, platform, hints),
    distro: os === "linux" ? distroOf(agent) : undefined,
  };
};

type AgentData = { getHighEntropyValues?: (keys: string[]) => Promise<Hints> };

/** Chromium alone answers this; the other browsers keep what the user agent string says. */
export const readHints = async (): Promise<Hints> => {
  const data = (navigator as Navigator & { userAgentData?: AgentData }).userAgentData;
  try {
    return (await data?.getHighEntropyValues?.(["architecture", "bitness"])) ?? {};
  } catch {
    return {};
  }
};

const LINUX_FAMILY: Record<Distro, string> = {
  debian: "debian",
  fedora: "redhat",
  suse: "redhat",
  arch: "arch",
  manjaro: "arch",
  other: "linux",
};

export const MANAGER_OF: Record<Distro, string> = {
  debian: "apt",
  fedora: "dnf",
  suse: "zypper",
  arch: "pacman",
  manjaro: "pacman",
  other: "",
};

const LABEL: Record<Arch, string> = { x86_64: "x86_64", aarch64: "ARM64", i686: "x86" };

export type Suggestion = { family: Family; file: Download };

/** The Bonk package for this machine, once its system and architecture are known. */
export const suggestBonk = (
  os: Os,
  arch: Arch | undefined,
  distro: Distro,
): Suggestion | undefined => {
  const id = os === "linux" ? LINUX_FAMILY[distro] : os;
  const family = FAMILIES.find((candidate) => candidate.id === id);
  const file =
    os === "macos"
      ? family?.files[0]
      : family?.files.find((candidate) => arch && candidate.arch === LABEL[arch]);
  return family && file ? { family, file } : undefined;
};

const SYSTEMS_FOR: Record<Distro, string[]> = {
  debian: ["ubuntu", "debian", "linuxmint"],
  fedora: ["fedora", "almalinux", "rockylinux"],
  suse: ["opensuse"],
  arch: ["arch", "manjaro", "endeavouros"],
  manjaro: ["manjaro", "arch", "endeavouros"],
  other: ["ubuntu", "fedora", "debian"],
};

/** Images a machine like this one would start from: the newest of each close system, writable to a drive. */
export const suggestImages = (
  catalog: Catalog,
  os: Os,
  arch: Arch | undefined,
  distro: Distro,
): CatalogImage[] => {
  const systems = os === "windows" ? ["windows", "ubuntu"] : SYSTEMS_FOR[distro];
  return systems.flatMap((system) => {
    const usable = imagesOf(catalog, system).filter(
      (image) => image.url && image.usb_boot !== false && (!arch || image.arch === arch),
    );
    return usable.slice(0, 1);
  });
};
