import type { Arch, Distro, Machine } from "../../types/machine";
import type { Build, PackageManager, Platform } from "../../types/release";

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

/** A phone or tablet Bonk does not run on: the visitor is choosing for another machine. */
export const isOtherDevice = (agent: string): boolean => /iphone|ipad|cros/i.test(agent);

export const detect = (agent: string, platform: string, hints: Hints = {}): Machine => {
  const os: Machine["os"] = /android/i.test(agent)
    ? "android"
    : isOtherDevice(agent)
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

/** Most browsers hide the distribution; the most common package format stands in until the visitor chooses. */
export const DEFAULT_DISTRO: Distro = "debian";

export type Suggestion = { platform: Platform; build: Build };

export const suggestBuild = (
  platforms: readonly Platform[],
  machine: Machine,
): Suggestion | undefined => {
  const { os, arch } = machine;
  const distro = machine.distro ?? DEFAULT_DISTRO;
  const platform = platforms.find(
    (candidate) => candidate.os === os && (os !== "linux" || candidate.distros?.includes(distro)),
  );
  // Most phones do not name their processor: ARM64 is what nearly all of them run.
  const wanted = arch ?? (os === "android" ? "aarch64" : undefined);
  const build = platform?.builds.find(
    (candidate) => candidate.arch === "universal" || candidate.arch === wanted,
  );
  return platform && build ? { platform, build } : undefined;
};

export const suggestManager = (
  managers: readonly PackageManager[],
  machine: Machine,
): PackageManager | undefined =>
  managers.find(
    (manager) =>
      manager.os === machine.os &&
      (machine.os !== "linux" || manager.distros?.includes(machine.distro ?? DEFAULT_DISTRO)),
  );
