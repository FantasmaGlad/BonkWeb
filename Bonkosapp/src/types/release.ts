import type { Arch, Distro, Os } from "./machine";

export type ReleaseAsset = { name: string; size: number; sha256: string };

export type Release = {
  version: string;
  tag: string;
  published: string;
  base: string;
  assets: ReleaseAsset[];
};

export type BuildArch = Arch | "universal";

/** real: tried on a physical drive; ci: proven on virtual disks only; untested: never run on that device. */
export type Status = "real" | "ci" | "beta" | "untested";

export type BuildTemplate = { arch: BuildArch; format: string; file: string };

export type PlatformDefinition = {
  id: string;
  os: Os;
  name?: string;
  logos: readonly string[];
  /** Linux package families the platform serves. */
  distros?: readonly Distro[];
  /** First release that carries it: absent from older ones without being an error. */
  from?: string;
  builds: readonly BuildTemplate[];
};

export type Build = {
  arch: BuildArch;
  format: string;
  name: string;
  url: string;
  size: number;
  sha256: string;
};

export type Platform = Omit<PlatformDefinition, "builds"> & { builds: Build[] };

export type OsGroup = { os: Os; name: string; logo: string; status: Status };

export type PackageManager = {
  id: string;
  name: string;
  scope: string;
  os: Os;
  distros?: readonly Distro[];
  status: Status;
  install: string;
  cli: string;
  update: string;
  remove: string;
};
